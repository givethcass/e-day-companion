// The simulated backend. Every route in contract/openapi.yaml is answered here from the seed,
// with the demo clock as "now" unless the request passes asOf.
import type {
  CalendarEntry, Challenge, Clan, HordeRole, JoinRequest, Leaderboard, LeaderboardEntry, MatchReport, MatchSummary, Mission, Mode,
  NewsSummary, NewsTag, NewSquadSession, Notification, NotificationPrefs, Player, SquadSession, StoreItem, WeeklyReport,
} from '@eday/api-types';
import { GIFT_AT, HORDE_WAVE_GOAL, generate, type SeedData, type SeedMatch, type SeedPlayer, type SeedSession } from '@eday/seed';
import { DAY, clock, day, dayMonth, difficultyLabel, localDate, rankLabel, roleLabel, weekday } from './format.ts';
import { createRouter, error, noContent, ok, type Query } from './router.ts';

export const DEFAULT_PREFS: Required<NotificationPrefs> = {
  squad: true, wishlist: true, events: false, rival: false, ranked: false, quietHours: { from: '23:00', to: '08:00' },
};

const SPANISH = new Set(['MX', 'ES', 'AR', 'CO', 'CL', 'PE']);
const RANKED_OPENED = '2026-10-13T15:00:00.000Z';
const ROLES: HordeRole[] = ['assault', 'medic', 'breacher', 'marksman'];
const launch = (params: Record<string, string>) => `edaycompanion://launch?${new URLSearchParams(params)}`;
// What a Horde squad loses without each role, for the match report's lesson.
const ROLE_GAP: Record<HordeRole, string> = {
  medic: 'Sin Médico nadie te levantó.',
  breacher: 'Sin Irruptor nadie limpió de cerca.',
  marksman: 'Sin Tirador nadie tumbó a los jefes.',
  assault: 'Sin Asalto nadie aturdió al enemigo.',
};
const modeLabelEs = (mode: Mode) => (mode === 'horde_siege' ? 'Horde' : mode === 'campaign' ? 'campaña' : 'Versus');
const family = (mode: Mode) => (mode.startsWith('versus') ? 'versus' : mode === 'horde_siege' ? 'horde' : 'campaign');

// Small deterministic generator for derived detail (match scoreboards).
const hashRng = (key: string) => {
  let h = 2166136261;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export interface ApiOptions {
  /** Use an existing seed (tests share one); otherwise one is generated. */
  data?: SeedData;
}

export function createApi({ data = generate() }: ApiOptions = {}) {
  const demoNow = data.meta.demoNow;
  const players = new Map(data.players.map((p) => [p.id, p]));
  const byTag = new Map(data.players.map((p) => [p.gamertag, p]));
  const clans = new Map(data.clans.map((c) => [c.id, c]));
  const items = new Map(data.storeItems.map((i) => [i.id, i]));
  const sessions = new Map(data.sessions.map((s) => [s.id, structuredClone(s)]));
  const matchesOf = new Map<string, SeedMatch[]>();
  for (const m of data.matches) (matchesOf.get(m.playerId) ?? matchesOf.set(m.playerId, []).get(m.playerId)!).push(m);
  const matchById = new Map(data.matches.map((m) => [m.id, m]));
  const friendsOf = new Map<string, string[]>();
  for (const f of data.friendships) (friendsOf.get(f.playerId) ?? friendsOf.set(f.playerId, []).get(f.playerId)!).push(f.friendId);
  const progress = new Map(data.challengeProgress.map((c) => [`${c.playerId}:${c.challengeId}`, c.progress]));
  const wishlists = new Map<string, Set<string>>();
  for (const w of data.wishlists) (wishlists.get(w.playerId) ?? wishlists.set(w.playerId, new Set()).get(w.playerId)!).add(w.itemId);
  const prefs = new Map<string, Required<NotificationPrefs>>();
  let created = 0;

  const nowOf = (q: Query) => q.asOf ?? demoNow;
  const me = (id: string) => players.get(id)!;
  const playedBy = (id: string, now: string) => (matchesOf.get(id) ?? []).filter((m) => m.endedAt <= now);
  const rotationAt = (now: string) =>
    data.storeRotations.find((r) => r.startsAt <= now && now < r.endsAt) ?? data.storeRotations.at(-1)!;
  const prefsOf = (id: string) => prefs.get(id) ?? DEFAULT_PREFS;
  const isSpanish = (p: SeedPlayer) => SPANISH.has(p.country);

  const toPlayer = ({ rankStartPoints: _, ...p }: SeedPlayer): Player => p;
  const toSession = (s: SeedSession): SquadSession => structuredClone(s);
  const toItem = (playerId: string, id: string): StoreItem => ({ ...items.get(id)!, wishlisted: wishlists.get(playerId)?.has(id) ?? false });
  const summary = ({ id, mode, map, endedAt, result, kills, deaths, rankDelta, durationSeconds, wavesCleared }: SeedMatch): MatchSummary =>
    ({ id, mode, map, endedAt, result, kills, deaths, rankDelta, durationSeconds, wavesCleared, waveGoal: mode === 'horde_siege' ? HORDE_WAVE_GOAL : null });

  const bestWave = (id: string, now: string) =>
    playedBy(id, now).reduce((best, m) => Math.max(best, m.wavesCleared ?? 0), 0);

  const weekChallenges = (playerId: string, now: string): Challenge[] => {
    const week = rotationAt(now).startsAt;
    return data.challenges.filter((c) => c.weekStart === week).map(({ id, title, mode, goal, reward, expiresAt }) => ({
      id, title, mode, goal, reward, expiresAt, progress: Math.min(goal, progress.get(`${playerId}:${id}`) ?? 0),
    }));
  };

  // A Horde Siege tonight, in the player's language, with room and no mic needed.
  const hordeTonight = (p: SeedPlayer, now: string) => [...sessions.values()].find((s) =>
    s.mode === 'horde_siege' && s.status === 'open' && s.startsAt > now && localDate(s.startsAt, p.timezone) === localDate(now, p.timezone)
    && s.language === (isSpanish(p) ? 'es' : 'en') && !s.micRequired && !s.members.some((m) => m.gamertag === p.gamertag));

  const rivalOf = (p: SeedPlayer) => {
    const mine = p.rank?.points ?? p.rankStartPoints ?? 0;
    const ahead = (friendsOf.get(p.id) ?? []).map((id) => players.get(id)!).filter((f) => f.rank && f.rank.points > mine)
      .sort((a, b) => a.rank!.points - b.rank!.points)[0];
    return ahead ? { gamertag: ahead.gamertag, pointsAhead: ahead.rank!.points - mine, rank: rankLabel(ahead.rank) } : undefined;
  };

  // The suggested mission follows how the player actually plays; the other two kinds of play are alternatives.
  const missions = (p: SeedPlayer, now: string): Mission => {
    const played = playedBy(p.id, now);
    const counts = { versus: 0, horde: 0, campaign: 0 };
    for (const m of played) counts[family(m.mode)]++;
    const tz = p.timezone;
    const tonight = hordeTonight(p, now);
    // A session the player already joined for today beats any suggestion.
    const booked = [...sessions.values()].filter((s) => s.startsAt > now && localDate(s.startsAt, tz) === localDate(now, tz)
      && s.members.some((m) => m.gamertag === p.gamertag)).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
    const best = bestWave(p.id, now);
    const chapter = Math.max(1, ...played.filter((m) => m.mode === 'campaign').map((m) => Number(/(\d+)$/.exec(m.map)?.[1] ?? 1)));
    const rival = rivalOf(p);
    const options: Record<keyof typeof counts, Mission> = {
      versus: !p.rank && now >= RANKED_OPENED
        ? { title: 'Juega 3 partidas de Ranked', mode: 'versus_ranked', estimatedMinutes: 45, reward: '+2500 XP',
            reason: `Ranked abrió el ${dayMonth(RANKED_OPENED, tz)} y aún no tienes rango`, launchUrl: launch({ mode: 'versus_ranked' }) }
        : { title: 'Juega Ranked', mode: 'versus_ranked', estimatedMinutes: 30, reward: '+1500 XP',
            reason: rival ? `${rival.gamertag} te lleva ${rival.pointsAhead} puntos` : 'Defiende tu rango esta semana', launchUrl: launch({ mode: 'versus_ranked' }) },
      horde: booked
        ? { title: `Tu ${modeLabelEs(booked.mode)} de hoy, ${clock(booked.startsAt, tz)}`, mode: booked.mode, estimatedMinutes: 40, reward: '+Monedas',
            reason: `${booked.map ? `${booked.map} · ` : ''}escuadra ${booked.members.find((m) => m.gamertag === p.gamertag)!.squad} · ${booked.members.length} de ${booked.slots}`,
            launchUrl: launch({ session: booked.id }) }
        : tonight
        ? { title: `Horde ${tonight.language === 'es' ? 'en español' : 'in English'} hoy, ${clock(tonight.startsAt, tz)}`, mode: 'horde_siege', estimatedMinutes: 40,
            reward: '+Monedas', reason: `${tonight.map} · ${difficultyLabel(tonight.difficulty)} · sin micrófono · ${tonight.members.length} de ${tonight.slots}`,
            launchUrl: launch({ session: tonight.id }) }
        : { title: 'Juega una partida de Horde Siege', mode: 'horde_siege', estimatedMinutes: 40, reward: '+Monedas',
            reason: best ? `Tu mejor oleada es la ${best}. Ve por la ${best + 1}.` : 'Sobrevive tus primeras oleadas', launchUrl: launch({ mode: 'horde_siege' }) },
      campaign: { title: `Sigue en el capítulo ${chapter}`, mode: 'campaign', estimatedMinutes: 50, reward: '+1500 XP',
        reason: 'Retoma desde tu último punto de control', launchUrl: launch({ mode: 'campaign' }) },
    };
    const order = (Object.keys(counts) as (keyof typeof counts)[]).sort((a, b) => Number(b === 'horde' && !!booked) - Number(a === 'horde' && !!booked) || counts[b] - counts[a]);
    return {
      ...options[order[0]],
      alternatives: order.slice(1).map((k) => ({ title: options[k].title, mode: options[k].mode, launchUrl: options[k].launchUrl })),
    };
  };

  const notifications = (p: SeedPlayer, now: string): Notification[] => {
    const tz = p.timezone;
    const pr = prefsOf(p.id);
    const out: (Notification & { pref: keyof NotificationPrefs })[] = [];
    const hoursAgo = (h: number) => new Date(Date.parse(now) - h * 3600e3).toISOString();
    const tonight = hordeTonight(p, now);
    if (tonight) out.push({ id: `n_tonight_${tonight.id}`, pref: 'squad', kind: 'session', createdAt: hoursAgo(1), read: false,
      title: `Horde ${tonight.language === 'es' ? 'en español' : 'in English'} hoy, ${clock(tonight.startsAt, tz)}`,
      body: `${tonight.map} · ${difficultyLabel(tonight.difficulty)} · sin micrófono · quedan ${tonight.slots - tonight.members.length} lugares`,
      link: `/comunidad/escuadra/${tonight.id}` });
    for (const s of sessions.values()) {
      const mine = s.members.find((m) => m.gamertag === p.gamertag);
      if (!mine || s.startsAt <= now || Date.parse(s.startsAt) - Date.parse(now) > 7 * DAY) continue;
      const squad = s.members.filter((m) => m.squad === mine.squad);
      const missing = ROLES.filter((r) => !squad.some((m) => m.role === r));
      out.push({ id: `n_squad_${s.id}`, pref: 'squad', kind: 'session', createdAt: hoursAgo(3), read: false,
        title: missing.length ? `Falta un ${roleLabel(missing[0])} en tu escuadra` : 'Tu escuadra está completa',
        body: `${day(s.startsAt, tz)}, ${clock(s.startsAt, tz)} · escuadra ${mine.squad} · ${s.members.length} de ${s.slots}`,
        link: `/comunidad/escuadra/${s.id}` });
    }
    const rotation = rotationAt(now);
    for (const id of wishlists.get(p.id) ?? []) {
      if (!rotation.itemIds.includes(id)) continue;
      out.push({ id: `n_wish_${rotation.id}_${id}`, pref: 'wishlist', kind: 'wishlist', createdAt: rotation.startsAt,
        read: Date.parse(now) - Date.parse(rotation.startsAt) > 2 * DAY,
        title: `${items.get(id)!.name} está en la tienda`, body: `De tu lista de deseos · se va el ${day(rotation.endsAt, tz)}`, link: `/tienda/${id}` });
    }
    for (const e of data.events) {
      const left = Date.parse(e.endsAt) - Date.parse(now);
      if (e.startsAt > now || left <= 0 || left > 7 * DAY) continue;
      out.push({ id: `n_event_${e.id}`, pref: 'events', kind: 'event', createdAt: new Date(Date.parse(e.endsAt) - 7 * DAY).toISOString(), read: true,
        title: `${e.name} termina el ${day(e.endsAt, tz)}`, body: `Recompensas: ${e.rewards.join(', ')}` });
    }
    if (!p.rank && now >= RANKED_OPENED) out.push({ id: 'n_ranked_open', pref: 'ranked', kind: 'mission', createdAt: RANKED_OPENED, read: true,
      title: 'Ranked ya abrió', body: 'Tus 3 primeras partidas definen tu rango', link: '/' });
    const rival = rivalOf(p);
    if (rival) out.push({ id: `n_rival_${rival.gamertag}`, pref: 'rival', kind: 'rival', createdAt: hoursAgo(20), read: true,
      title: `${rival.gamertag} ya es ${rival.rank}`, body: `Te lleva ${rival.pointsAhead} puntos`, link: '/servicio/clasificacion' });
    return out.filter((n) => pr[n.pref]).map(({ pref: _, ...n }) => n).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  };

  // One concrete lesson per match, pointing at what helps next time as seen from `now`.
  const takeaway = (m: SeedMatch, p: SeedPlayer, board: NonNullable<MatchReport['scoreboard']>, now: string): NonNullable<MatchReport['takeaway']> => {
    if (m.mode === 'horde_siege') {
      const missing = ROLES.find((r) => !board.some((l) => l.role === r));
      const next = [...sessions.values()].filter((s) => s.mode === 'horde_siege' && s.startsAt > now && s.members.some((x) => x.gamertag === p.gamertag))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
      if (missing && next) {
        const squad = next.members.find((x) => x.gamertag === p.gamertag)!.squad;
        const covered = next.members.some((x) => x.squad === squad && x.role === missing);
        const when = localDate(next.startsAt, p.timezone) === localDate(now, p.timezone) ? 'Hoy' : `El ${weekday(next.startsAt, p.timezone)}`;
        return { text: `${ROLE_GAP[missing]} ${when} ${covered ? 'tu escuadra ya tiene uno' : 'aún te falta uno'}.`, link: `/comunidad/escuadra/${next.id}` };
      }
      if (missing) return { text: `${ROLE_GAP[missing]} Busca una escuadra que ya tenga uno.`, link: '/comunidad' };
      if (m.result === 'completed') return { text: `Completaste las ${HORDE_WAVE_GOAL} oleadas. Ya puedes subir la dificultad.`, link: '/comunidad' };
      const best = bestWave(p.id, now);
      return { text: m.wavesCleared === best ? 'Es tu mejor oleada hasta ahora. Repite con la misma escuadra.' : `Tu mejor oleada es la ${best}. Aquí tenías los cuatro roles: repite con esta escuadra.`, link: '/comunidad' };
    }
    if (m.mode === 'campaign') {
      return { text: m.result === 'completed' ? 'Capítulo terminado. El siguiente empieza donde lo dejaste.' : 'Retoma desde tu último punto de control.' };
    }
    const team = board.filter((l) => l.team === 'COG');
    const pos = team.findIndex((l) => l.gamertag === p.gamertag) + 1;
    const lesson = m.result === 'win' ? `Fuiste ${pos}º de ${team.length} en tu equipo con ${m.kills} bajas.`
      : m.result === 'draw' ? 'Partida pareja. Una baja más en el cierre la definía.'
        : m.kills < m.deaths ? `Caíste ${m.deaths} veces. Moverte con tu equipo te deja menos expuesto.`
          : m.mode === 'versus_conquest' ? 'Ganaste tus duelos, pero Conquista se gana con puntos. Quédate cerca de los objetivos.'
            : 'Ganaste tus duelos, pero tu equipo cayó. Juega cerca de ellos para cubrirlos.';
    if (m.result === 'win' && !p.rank && now >= RANKED_OPENED) return { text: `${lesson} Ya puedes ir a Ranked: tus 3 primeras partidas definen tu rango.`, link: '/' };
    return { text: lesson };
  };

  const leaderboard = (playerId: string, mode: Mode, scope: string, limit: number, now: string, pool?: string[]): Leaderboard => {
    const p = me(playerId);
    const metric = mode === 'horde_siege' ? 'best_wave' : 'rank_points';
    let ids = pool ?? data.players.map((x) => x.id);
    if (!pool && scope === 'country') ids = ids.filter((id) => players.get(id)!.country === p.country);
    if (!pool && scope === 'friends') ids = [p.id, ...(friendsOf.get(p.id) ?? [])];
    if (!pool && scope === 'clan') ids = p.clanId ? data.clanMembers.filter((m) => m.clanId === p.clanId).map((m) => m.playerId) : [p.id];
    const scored = ids.map((id) => {
      const x = players.get(id)!;
      return { x, points: metric === 'best_wave' ? bestWave(id, now) : x.rank?.points ?? null };
    }).filter((r): r is { x: SeedPlayer; points: number } => r.points !== null && r.points > 0)
      .sort((a, b) => b.points - a.points || a.x.gamertag.localeCompare(b.x.gamertag));
    const all: LeaderboardEntry[] = scored.map(({ x, points }, i) => ({
      position: i + 1, gamertag: x.gamertag, points, country: x.country, clanTag: x.clanId ? clans.get(x.clanId)!.tag : null,
    }));
    const mine = all.find((e) => e.gamertag === p.gamertag);
    return { mode, scope, metric, entries: all.slice(0, limit), ...(mine ? { me: mine } : {}) };
  };

  const r = createRouter();

  r.add('GET', '/me', ({ playerId }) => ok(toPlayer(me(playerId))));

  r.add('GET', '/me/week', ({ playerId, query }) => {
    const now = nowOf(query);
    const p = me(playerId);
    const rotation = rotationAt(now);
    const played = playedBy(playerId, now);
    const thisWeek = played.filter((m) => m.endedAt >= rotation.startsAt);
    const last = played.at(-1);
    const challenges = weekChallenges(playerId, now);
    const { startsAt, endsAt } = data.season;
    const rival = rivalOf(p);
    const report: WeeklyReport = {
      weekStart: rotation.startsAt.slice(0, 10),
      hoursPlayed: Number((thisWeek.reduce((s, m) => s + m.durationSeconds, 0) / 3600).toFixed(1)),
      matchesPlayed: thisWeek.length,
      challengesDone: challenges.filter((c) => c.progress >= c.goal).length,
      challengesTotal: challenges.length,
      seasonProgress: Number(Math.min(1, Math.max(0, (Date.parse(now) - Date.parse(startsAt)) / (Date.parse(endsAt) - Date.parse(startsAt)))).toFixed(3)),
      daysSinceLastMatch: last ? Math.floor((Date.parse(now) - Date.parse(last.endedAt)) / DAY) : null,
      ...(rival ? { rival } : {}),
      nextMission: missions(p, now),
    };
    return ok(report);
  });

  r.add('GET', '/me/notifications', ({ playerId, query }) => ok(notifications(me(playerId), nowOf(query))));

  r.add('GET', '/me/wallet', ({ playerId, query }) => {
    const { playerId: _, ...wallet } = data.wallets.find((w) => w.playerId === playerId)!;
    // Past the weekly reset, the cap starts over (the demo clock never plays matches).
    const now = nowOf(query);
    let resets = wallet.capResetsAt;
    while (resets <= now) resets = new Date(Date.parse(resets) + 7 * DAY).toISOString();
    return ok(resets === wallet.capResetsAt ? wallet : { ...wallet, coinsThisWeek: 0, capResetsAt: resets });
  });

  r.add('GET', '/me/notification-prefs', ({ playerId }) => ok(prefsOf(playerId)));
  r.add('PUT', '/me/notification-prefs', ({ playerId, body }) => {
    if (!body || typeof body !== 'object') return error(400, 'bad_request', 'Faltan las preferencias');
    const next = { ...prefsOf(playerId), ...(body as NotificationPrefs) };
    prefs.set(playerId, next);
    return ok(next);
  });

  r.add('GET', '/me/matches', ({ playerId, query }) => {
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const start = Number(query.cursor ?? 0);
    const list = playedBy(playerId, nowOf(query)).filter((m) => !query.mode || m.mode === query.mode).reverse();
    const page = list.slice(start, start + limit);
    return ok({ items: page.map(summary), nextCursor: start + limit < list.length ? String(start + limit) : null });
  });

  r.add('GET', '/matches/{matchId}', ({ params, query }) => {
    const m = matchById.get(params.matchId);
    if (!m) return error(404, 'not_found', `No existe la partida ${params.matchId}`);
    const p = me(m.playerId);
    const rand = hashRng(m.id);
    const horde = m.mode === 'horde_siege';
    const others = [...(friendsOf.get(p.id) ?? []), ...data.players.map((x) => x.id)].filter((id, i, a) => id !== p.id && a.indexOf(id) === i);
    // Friends first, then a few dozen others, each player at most once.
    const pool = others.slice(0, 40);
    const pick = (n: number) => Array.from({ length: n }, () => players.get(pool.splice(Math.floor(rand() * pool.length), 1)[0])!);
    // The player keeps the role they sign up for in squads; teammates get one each.
    const myRole = [...sessions.values()].flatMap((s) => s.members).find((x) => x.gamertag === p.gamertag && x.role)?.role
      ?? ROLES[Math.floor(hashRng(p.id)() * ROLES.length)];
    const line = (x: SeedPlayer, team: string, kills: number, deaths: number) => ({
      gamertag: x.gamertag, team, kills, deaths, score: kills * (horde ? 70 : 100) + Math.floor(rand() * 400),
      ...(horde ? { role: x.id === p.id ? myRole : ROLES[Math.floor(rand() * ROLES.length)] } : {}), ...(x.id === p.id ? { isMe: true } : {}),
    });
    const scoreboard = m.mode === 'campaign'
      ? [line(p, 'COG', m.kills, m.deaths)]
      : horde
        ? [line(p, 'COG', m.kills, m.deaths), ...pick(3).map((x) => line(x, 'COG', Math.round(m.kills * (0.6 + rand() * 0.7)), Math.floor(rand() * 7)))]
        : [line(p, 'COG', m.kills, m.deaths), ...pick(7).map((x, i) => line(x, i < 3 ? 'COG' : 'Enjambre', Math.floor(rand() * 25), Math.floor(rand() * 20)))];
    scoreboard.sort((a, b) => b.score - a.score);
    const report: MatchReport = { ...summary(m), accuracy: m.accuracy, medals: m.medals, takeaway: takeaway(m, p, scoreboard, nowOf(query)), scoreboard };
    return ok(report);
  });

  r.add('GET', '/leaderboards/{mode}', ({ playerId, params, query }) => ok(
    leaderboard(playerId, params.mode as Mode, query.scope ?? 'global', Math.min(100, Number(query.limit ?? 20)), nowOf(query))));

  r.add('GET', '/season/current', () => ok(data.season));
  r.add('GET', '/me/challenges', ({ playerId, query }) => ok(weekChallenges(playerId, nowOf(query))));

  r.add('GET', '/store/rotation', ({ playerId, query }) => {
    const { startsAt, endsAt, itemIds } = rotationAt(nowOf(query));
    return ok({ startsAt, endsAt, items: itemIds.map((id) => toItem(playerId, id)) });
  });

  r.add('GET', '/me/wishlist', ({ playerId }) => ok([...(wishlists.get(playerId) ?? [])].map((id) => toItem(playerId, id))));
  r.add('POST', '/me/wishlist', ({ playerId, body }) => {
    const itemId = (body as { itemId?: string } | undefined)?.itemId;
    if (!itemId || !items.has(itemId)) return error(400, 'bad_request', 'Ese objeto no existe');
    (wishlists.get(playerId) ?? wishlists.set(playerId, new Set()).get(playerId)!).add(itemId);
    return noContent();
  });
  r.add('DELETE', '/me/wishlist/{itemId}', ({ playerId, params }) => {
    wishlists.get(playerId)?.delete(params.itemId);
    return noContent();
  });

  r.add('GET', '/events', ({ query }) => ok(data.events.filter((e) => e.endsAt > nowOf(query))));

  // News appear once published; the demo clock decides what "already out" means.
  const published = (now: string) => data.news.filter((n) => n.publishedAt <= now).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  r.add('GET', '/news', ({ query }) => {
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    const list = published(nowOf(query)).filter((n) => !query.tag || n.tag === (query.tag as NewsTag));
    return ok(list.slice(0, limit).map(({ sections: _s, knownIssues: _k, cta: _c, ...n }): NewsSummary => n));
  });
  r.add('GET', '/news/{newsId}', ({ params, query }) => {
    const n = data.news.find((x) => x.id === params.newsId && x.publishedAt <= nowOf(query));
    return n ? ok(structuredClone(n)) : error(404, 'not_found', `No existe la noticia ${params.newsId}`);
  });

  r.add('GET', '/calendar', ({ query }) => {
    const now = nowOf(query);
    const story = (eventId: string) => {
      const n = data.news.find((x) => x.tag === 'event' && x.id === `n_${eventId.slice(3)}` && x.publishedAt <= now);
      return n ? { link: `/noticias/${n.id}` } : {};
    };
    const out: CalendarEntry[] = [];
    for (const e of data.events) {
      if (e.startsAt > now) out.push({ id: `cal_${e.id}_start`, kind: 'event', title: `Empieza ${e.name}`, at: e.startsAt });
      else if (e.endsAt > now) out.push({ id: `cal_${e.id}_end`, kind: 'event', title: `Termina ${e.name}`, at: e.endsAt, ...story(e.id) });
    }
    const rotation = rotationAt(now);
    if (rotation.endsAt > now) out.push({ id: `cal_rotation_${rotation.id}`, kind: 'store', title: 'Rota la tienda y los retos', at: rotation.endsAt, link: '/tienda' });
    if (GIFT_AT > now) out.push({ id: 'cal_gift', kind: 'gift', title: 'Regalo de aniversario', at: GIFT_AT });
    if (data.season.endsAt > now) out.push({ id: `cal_${data.season.id}_end`, kind: 'season', title: `Termina la Temporada ${data.season.number}`, at: data.season.endsAt });
    return ok(out.sort((a, b) => a.at.localeCompare(b.at)));
  });

  r.add('GET', '/sessions', ({ query }) => {
    const now = nowOf(query);
    const bool = (v?: string) => (v === undefined ? undefined : v === 'true');
    const mic = bool(query.micRequired);
    return ok([...sessions.values()].filter((s) =>
      s.startsAt >= now && s.status !== 'finished'
      && (!query.mode || s.mode === query.mode)
      && (!query.language || s.language === query.language)
      && (mic === undefined || Boolean(s.micRequired) === mic)
      && (!query.difficulty || s.difficulty === query.difficulty)
      && (!query.startsAfter || s.startsAt >= query.startsAfter)
      && (!query.startsBefore || s.startsAt < query.startsBefore))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)).map(toSession));
  });

  r.add('POST', '/sessions', ({ playerId, body }) => {
    const b = body as NewSquadSession | undefined;
    if (!b?.mode || !b.startsAt || !b.slots) return error(400, 'bad_request', 'Faltan modo, hora o lugares');
    const p = me(playerId);
    const id = `sess_new_${++created}`;
    const s: SeedSession = {
      ...b, micRequired: b.micRequired ?? false, id, hostGamertag: p.gamertag, status: 'open', shareUrl: `https://example.com/s/${id}`,
      members: [b.mode === 'horde_siege' ? { gamertag: p.gamertag, squad: 1, role: 'assault', confirmed: true } : { gamertag: p.gamertag }],
    };
    sessions.set(id, s);
    return ok(toSession(s), 201);
  });

  r.add('GET', '/sessions/{sessionId}', ({ params }) => {
    const s = sessions.get(params.sessionId);
    return s ? ok(toSession(s)) : error(404, 'not_found', `No existe la sesión ${params.sessionId}`);
  });

  r.add('POST', '/sessions/{sessionId}/join', ({ playerId, params, body }) => {
    const s = sessions.get(params.sessionId);
    if (!s) return error(404, 'not_found', `No existe la sesión ${params.sessionId}`);
    const p = me(playerId);
    const { squad, role } = (body ?? {}) as JoinRequest;
    const others = s.members.filter((m) => m.gamertag !== p.gamertag);
    if (others.length >= s.slots) return error(409, 'full', 'La sesión ya está llena');
    let member: SeedSession['members'][number] = { gamertag: p.gamertag };
    if (s.mode === 'horde_siege') {
      const counts = [1, 2, 3].map((n) => others.filter((m) => m.squad === n).length);
      const target = squad ?? [1, 2, 3].find((n) => counts[n - 1] < 4)!;
      if (counts[target - 1] >= 4) return error(409, 'full', `La escuadra ${target} ya está llena`);
      member = { gamertag: p.gamertag, squad: target, role: role ?? 'assault', confirmed: true };
    }
    s.members = [...others, member];
    s.status = s.members.length >= s.slots ? 'full' : 'open';
    return ok(toSession(s));
  });

  r.add('POST', '/sessions/{sessionId}/deploy', ({ params }) =>
    sessions.has(params.sessionId) ? ok({ launchUrl: launch({ session: params.sessionId }) }) : error(404, 'not_found', `No existe la sesión ${params.sessionId}`));

  r.add('GET', '/clans/{clanId}', ({ params }) => {
    const c = clans.get(params.clanId);
    if (!c) return error(404, 'not_found', `No existe el clan ${params.clanId}`);
    const { leaderId: _, ...clan } = c;
    const upcomingSessions = [...sessions.values()].filter((s) => s.clanId === c.id && s.startsAt >= demoNow).map(toSession);
    return ok({ ...clan, upcomingSessions } satisfies Clan);
  });

  r.add('GET', '/clans/{clanId}/leaderboard', ({ playerId, params, query }) => {
    if (!clans.has(params.clanId)) return error(404, 'not_found', `No existe el clan ${params.clanId}`);
    const pool = data.clanMembers.filter((m) => m.clanId === params.clanId).map((m) => m.playerId);
    return ok(leaderboard(playerId, 'horde_siege', 'clan', 100, nowOf(query), pool));
  });

  return {
    handle: r.handle,
    routes: r.routes.map(({ method, template }) => ({ method, template })),
    demoNow,
    /** Simulated "Sign in with Xbox": the demo token names the player. */
    signIn: (gamertag = 'Delta_Rojo') => {
      const p = byTag.get(gamertag);
      return p ? { token: `demo:${p.id}`, player: toPlayer(p) } : null;
    },
    playerIdFromToken: (token?: string | null) => {
      const id = token?.startsWith('demo:') ? token.slice(5) : null;
      return id && players.has(id) ? id : null;
    },
  };
}

export type Api = ReturnType<typeof createApi>;
