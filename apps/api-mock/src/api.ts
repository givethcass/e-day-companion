// The simulated backend. Every route in contract/openapi.yaml is answered here from the seed,
// with the demo clock as "now" unless the request passes asOf.
import type {
  Achievement, AchievementList, CalendarEntry, Challenge, Clan, ClassLevel, Creator, Guide, GuideSection, GuideSummary, Medal, Promo, PromoPlacement, MedalTier, MedalUnlock, ServiceRecord, HordeRole, JoinRequest, Leaderboard, LeaderboardEntry, MatchReport, MatchSummary, Mission, Mode,
  NewsSummary, NewsTag, NewSquadSession, Notification, NotificationPrefs, Player, SquadSession, StoreItem, WeeklyReport,
} from '@eday/api-types';
import { CAMPAIGN_CHAPTERS, GIFT_AT, HORDE_WAVE_GOAL, MEDAL_REWARDS, generate, type SeedData, type SeedMatch, type SeedAchievement, type SeedMedalSeries, type SeedPlayer, type SeedSession } from '@eday/seed';
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
const MEDAL_TIERS: MedalTier[] = ['bronze', 'silver', 'gold', 'onyx', 'diamond'];
// Part of a player's Horde matches played with each class: most with the main one, the rest spread unevenly.
const roleShare = (role: HordeRole, main: HordeRole) => (role === main ? 0.7 : [0.13, 0.1, 0.07][ROLES.filter((r) => r !== main).indexOf(role)]);
// What one match adds to a medal series.
const medalStep = (s: SeedMedalSeries, m: SeedMatch, role: HordeRole) => {
  const versus = m.mode.startsWith('versus');
  const horde = m.mode === 'horde_siege';
  const k = s.share ?? 1;
  switch (s.metric) {
    case 'kills': return versus || horde ? m.kills * k : 0;
    case 'versusKills': return versus ? m.kills * k : 0;
    case 'hordeKills': return horde ? m.kills * k : 0;
    case 'campaignKills': return m.mode === 'campaign' ? m.kills * k : 0;
    case 'matches': return k;
    case 'versusMatches': return versus ? k : 0;
    case 'hordeMatches': return horde ? k : 0;
    // Most Horde matches go to the player's main class, the rest spread over the other three.
    case 'role': return horde ? roleShare(s.role!, role) : 0;
    case 'waves': return (m.wavesCleared ?? 0) * k;
    case 'hordeCompleted': return Number(horde && m.result === 'completed') * k;
    case 'versusWins': return Number(versus && m.result === 'win') * k;
    case 'ranked': return Number(m.mode === 'versus_ranked');
    case 'chapters': return Number(m.mode === 'campaign' && m.result === 'completed') * k;
    case 'during': return Number(m.endedAt >= s.from! && m.endedAt < s.to!);
  }
};
// As in the game: Oro and Ónix add a cosmetic, Diamante a player title.
const unlockOfTier = (s: SeedMedalSeries, i: number) =>
  i === 4 ? `Título «${s.title}»` : i === 3 ? (s.item === 'weapon' ? 'Aspecto de arma Ónix' : 'Estandarte de la medalla')
    : i === 2 ? (s.item === 'weapon' ? 'Aspecto de arma Oro' : 'Emblema de la medalla') : null;
const round = (x: number, digits = 1) => Number(x.toFixed(digits));
const modeOf = <T,>(xs: T[]) => {
  const counts = new Map<T, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
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
  const equippedBy = new Map<string, string[]>();
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

  // The class the player signed up with most recently.
  const roleOf = (p: SeedPlayer): HordeRole => [...sessions.values()].sort((a, b) => b.startsAt.localeCompare(a.startsAt)).flatMap((s) => s.members)
    .find((x) => x.gamertag === p.gamertag && x.role)?.role
    ?? ROLES[Math.floor(hashRng(p.id)() * ROLES.length)];

  // Medal progress is counted from the player's matches up to `now`; each tier carries the date of the match that earned it.
  const medalsOf = (p: SeedPlayer, now: string): Medal[] & { chosen: string[] } => {
    const played = playedBy(p.id, now);
    const role = roleOf(p);
    const list = data.medalSeries.map((s): Medal => {
      const { id, name, category, unit, goals } = s;
      let raw = 0;
      const unlockedAt: (string | null)[] = goals.map(() => null);
      for (const m of played) {
        raw += medalStep(s, m, role);
        goals.forEach((g, i) => { if (!unlockedAt[i] && Math.floor(raw) >= g) unlockedAt[i] = m.endedAt; });
      }
      return {
        id, name, category, unit, progress: Math.floor(raw), equipped: false,
        tiers: goals.map((goal, i) => ({ tier: MEDAL_TIERS[i], goal, unlockedAt: unlockedAt[i],
          reward: { amount: MEDAL_REWARDS[i], currency: 'coins' as const, ...(unlockOfTier(s, i) ? { unlock: unlockOfTier(s, i)! } : {}) } })),
      };
    });
    const earned = (m: Medal) => m.tiers.filter((t) => t.unlockedAt).length;
    const lastAt = (m: Medal) => m.tiers.reduce((a, t) => (t.unlockedAt && t.unlockedAt > a ? t.unlockedAt : a), '');
    // Until the player picks, the card shows their three best series.
    const chosen = (equippedBy.get(p.id) ?? [...list].filter((m) => earned(m) > 0)
      .sort((a, b) => earned(b) - earned(a) || lastAt(b).localeCompare(lastAt(a))).slice(0, 3).map((m) => m.id))
      .filter((id) => { const m = list.find((x) => x.id === id); return m && earned(m) > 0; });
    for (const m of list) m.equipped = chosen.includes(m.id);
    return Object.assign(list, { chosen });
  };
  const unlockOf = (m: Medal): MedalUnlock | null => {
    const top = [...m.tiers].reverse().find((t) => t.unlockedAt);
    return top ? { medalId: m.id, name: m.name, tier: top.tier, unlockedAt: top.unlockedAt! } : null;
  };

  // GTA-style curiosities. The game would count these; the demo estimates them from each match's kills, deaths,
  // accuracy and time, with fixed ratios, so they stay stable for the same matches.
  const trivia = (p: SeedPlayer, played: SeedMatch[]): ServiceRecord['trivia'] => {
    if (!played.length) return [];
    const tz = p.timezone;
    const n = (x: number) => Math.round(x).toLocaleString('en-US');
    const kills = played.reduce((s, m) => s + m.kills, 0);
    const shots = played.reduce((s, m) => s + (m.kills * 7) / Math.max(0.1, m.accuracy), 0);
    const hordeDeaths = played.filter((m) => m.mode === 'horde_siege').reduce((s, m) => s + m.deaths, 0);
    const deaths = played.reduce((s, m) => s + m.deaths, 0);
    const hours = played.reduce((s, m) => s + m.durationSeconds, 0) / 3600;
    const km = hours * 4.2;
    // Late night counts until 5 a.m.: 01:30 is later than 23:50.
    const late = played.map((m) => m.endedAt).sort((a, b) => {
      const v = (x: string) => { const [h, mi] = clock(x, tz).split(':').map(Number); return (h < 5 ? h + 24 : h) * 60 + mi; };
      return v(b) - v(a);
    })[0];
    const weeks = new Map<string, SeedMatch[]>();
    for (const m of played) {
      // Weeks run Monday to Sunday on the player's own calendar; noon keeps the label on the right day.
      const d = new Date(`${localDate(m.endedAt, tz)}T12:00:00.000Z`);
      const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7), 12)).toISOString();
      (weeks.get(monday) ?? weeks.set(monday, []).get(monday)!).push(m);
    }
    const [weekStart, weekMatches] = [...weeks].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))[0];
    const weekDays = new Set(weekMatches.map((m) => localDate(m.endedAt, tz))).size;
    const blood = kills * 4.7;
    return [
      { id: 'blood', label: 'Sangre derramada', value: `${n(blood)} litros`, detail: blood >= 25000 ? `Llenarías ${n(blood / 25000)} albercas de casa` : blood > 2500 ? 'Alcanza para una piscina chica' : `Unas ${n(blood / 150)} tinas llenas` },
      { id: 'shots', label: 'Balas disparadas', value: n(shots), detail: `Unas ${n(shots / 300)} cajas de munición` },
      { id: 'distance', label: 'Kilómetros corriendo agachado', value: `${round(km)} km`, detail: `Como ir del Zócalo a Chapultepec ${Math.max(1, Math.round(km / 5))} veces` },
      { id: 'stomps', label: 'Locust pisoteados', value: n(kills * 0.03), detail: 'Cráneos bajo tu bota' },
      { id: 'chainsaw', label: 'Sierra del Lancer encendida', value: `${round(kills * 0.006)} min`, detail: 'Sin contar las veces que te interrumpieron' },
      { id: 'boomer', label: 'Veces que te aplastó un Boomer', value: n(hordeDeaths * 0.12), detail: hordeDeaths ? 'Todas en Horde Siege' : 'Todavía ninguna' },
      { id: 'grenade', label: 'Veces que te mató tu propia granada', value: n(Math.ceil(deaths * 0.008)), detail: 'Pasa en las mejores familias' },
      { id: 'late', label: 'Hora más tardía en que jugaste', value: clock(late, tz), detail: `El ${day(late, tz)}` },
      { id: 'week', label: 'Tu semana Gears', value: `${weekMatches.length} partidas en ${weekDays} días`, detail: `La semana del ${dayMonth(weekStart, tz)}` },
    ];
  };

  // Class XP comes from Horde matches: waves cleared plus a bonus for finishing, most of it to the main class.
  const CLASS_MAX = 20;
  const levelStart = (level: number) => 125 * level * (level - 1);
  const classesOf = (p: SeedPlayer, played: SeedMatch[]): ClassLevel[] => {
    const main = roleOf(p);
    const horde = played.filter((m) => m.mode === 'horde_siege');
    return ROLES.map((role): ClassLevel => {
      const k = roleShare(role, main);
      const xp = Math.round(horde.reduce((s, m) => s + ((m.wavesCleared ?? 0) * 10 + (m.result === 'completed' ? 200 : 0)) * k, 0));
      let level = 1;
      while (level < CLASS_MAX && xp >= levelStart(level + 1)) level++;
      return { role, level, maxLevel: CLASS_MAX, xp, levelXp: levelStart(level), nextLevelXp: level < CLASS_MAX ? levelStart(level + 1) : null,
        matches: Math.round(horde.length * k) };
    }).sort((a, b) => b.xp - a.xp);
  };

  // Achievements count progress match by match, so each one has the date of the match that unlocked it.
  const achievementsOf = (p: SeedPlayer, now: string): AchievementList => {
    const played = playedBy(p.id, now);
    const role = roleOf(p);
    const tz = p.timezone;
    const items = data.achievements.map((a: SeedAchievement): Achievement => {
      let raw = 0, unlockedAt: string | null = null, streak = 0, prevDay = '';
      for (const m of played) {
        if (a.metric === 'bestWave') raw = Math.max(raw, m.wavesCleared ?? 0);
        else if (a.metric === 'hours') raw += m.durationSeconds / 3600;
        else if (a.metric === 'streak') {
          const d = localDate(m.endedAt, tz);
          if (d !== prevDay) { streak = prevDay && Date.parse(d) - Date.parse(prevDay) === DAY ? streak + 1 : 1; prevDay = d; }
          raw = Math.max(raw, streak);
        } else raw += medalStep(a as unknown as SeedMedalSeries, m, role);
        if (!unlockedAt && Math.floor(raw) >= a.goal) unlockedAt = m.endedAt;
      }
      return { id: a.id, name: a.name, description: a.description, gamerscore: a.gamerscore, goal: a.goal,
        progress: Math.min(a.goal, Math.floor(raw)), rarity: a.rarity, unlockedAt };
    });
    const got = items.filter((x) => x.unlockedAt).sort((a, b) => b.unlockedAt!.localeCompare(a.unlockedAt!));
    const left = items.filter((x) => !x.unlockedAt).sort((a, b) => b.progress / b.goal - a.progress / a.goal);
    return { gamerscore: got.reduce((s, x) => s + x.gamerscore, 0), gamerscoreTotal: items.reduce((s, x) => s + x.gamerscore, 0),
      unlocked: got.length, items: [...got, ...left] };
  };

  const serviceRecord = (p: SeedPlayer, now: string): ServiceRecord => {
    const tz = p.timezone;
    const played = playedBy(p.id, now);
    const hours = (ms: SeedMatch[]) => round(ms.reduce((s, m) => s + m.durationSeconds, 0) / 3600);
    const kd = (k: number, d: number) => round(k / Math.max(1, d), 2);
    const sum = (ms: SeedMatch[], f: (m: SeedMatch) => number) => ms.reduce((s, m) => s + f(m), 0);
    const avg = (ms: SeedMatch[], f: (m: SeedMatch) => number) => (ms.length ? round(sum(ms, f) / ms.length, 3) : 0);
    const versus = played.filter((m) => family(m.mode) === 'versus');
    const horde = played.filter((m) => m.mode === 'horde_siege');
    const campaign = played.filter((m) => m.mode === 'campaign');
    const total = Math.max(1, sum(played, (m) => m.durationSeconds));

    const days = [...new Set(played.map((m) => localDate(m.endedAt, tz)))].sort();
    let streak = 0, best = 0, prev = '';
    for (const d of days) {
      streak = prev && Date.parse(d) - Date.parse(prev) === DAY ? streak + 1 : 1;
      best = Math.max(best, streak);
      prev = d;
    }
    let winStreak = 0, bestWinStreak = 0;
    for (const m of versus) { winStreak = m.result === 'win' ? winStreak + 1 : 0; bestWinStreak = Math.max(bestWinStreak, winStreak); }
    const maps = [...new Set(versus.map((m) => m.map))].map((map) => {
      const ms = versus.filter((m) => m.map === map);
      return { map, matches: ms.length, wins: ms.filter((m) => m.result === 'win').length };
    }).filter((x) => x.wins > 0).sort((a, b) => b.wins - a.wins || b.wins / b.matches - a.wins / a.matches || a.map.localeCompare(b.map));
    const hordeMaps = [...new Set(horde.map((m) => m.map))].map((map) => {
      const ms = horde.filter((m) => m.map === map);
      return { map, matches: ms.length, bestWave: Math.max(0, ...ms.map((m) => m.wavesCleared ?? 0)) };
    }).sort((a, b) => b.bestWave - a.bestWave);
    const share = { versus: round(sum(versus, (m) => m.durationSeconds) / total, 3), horde: round(sum(horde, (m) => m.durationSeconds) / total, 3),
      campaign: round(sum(campaign, (m) => m.durationSeconds) / total, 3) };
    const main = played.length ? (Object.keys(share) as (keyof typeof share)[]).sort((a, b) => share[b] - share[a])[0] : null;

    const medals = medalsOf(p, now);
    const unlocks = medals.flatMap((m) => m.tiers.filter((t) => t.unlockedAt).map((t) => ({ medalId: m.id, name: m.name, tier: t.tier, unlockedAt: t.unlockedAt! })))
      .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt) || MEDAL_TIERS.indexOf(b.tier) - MEDAL_TIERS.indexOf(a.tier));
    const last = played.at(-1);
    return {
      gamertag: p.gamertag, level: p.level, trivia: trivia(p, played),
      title: main === 'horde' ? 'Defensor de Horde' : main === 'versus' ? 'Veterano de Versus' : main === 'campaign' ? 'Soldado de la COG' : 'Recluta',
      career: {
        matches: played.length, hoursPlayed: hours(played), daysPlayed: days.length, bestDayStreak: best,
        daysSinceLastMatch: last ? Math.floor((Date.parse(now) - Date.parse(last.endedAt)) / DAY) : null,
        firstMatchAt: played[0]?.endedAt ?? null,
        favoriteHour: played.length ? `${clock(modeOf(played.map((m) => m.endedAt.slice(0, 13)))! + ':00:00.000Z', tz).slice(0, 2)}:00` : null,
        favoriteWeekday: modeOf(played.map((m) => weekday(m.endedAt, tz))),
        kills: sum(played, (m) => m.kills), deaths: sum(played, (m) => m.deaths), kd: kd(sum(played, (m) => m.kills), sum(played, (m) => m.deaths)),
        accuracy: avg(played, (m) => m.accuracy), share,
      },
      versus: {
        matches: versus.length, wins: versus.filter((m) => m.result === 'win').length, losses: versus.filter((m) => m.result === 'loss').length,
        draws: versus.filter((m) => m.result === 'draw').length, winRate: versus.length ? round(versus.filter((m) => m.result === 'win').length / versus.length, 3) : 0,
        bestWinStreak, kills: sum(versus, (m) => m.kills), deaths: sum(versus, (m) => m.deaths), kd: kd(sum(versus, (m) => m.kills), sum(versus, (m) => m.deaths)),
        accuracy: avg(versus, (m) => m.accuracy), hoursPlayed: hours(versus), bestKills: versus.length ? Math.max(...versus.map((m) => m.kills)) : null,
        rank: p.rank,
        byMode: (['versus_tdm', 'versus_conquest', 'versus_ranked'] as Mode[]).map((mode) => {
          const ms = versus.filter((m) => m.mode === mode);
          return { mode, matches: ms.length, wins: ms.filter((m) => m.result === 'win').length };
        }),
        bestMap: maps[0] ?? null,
      },
      horde: {
        matches: horde.length, completed: horde.filter((m) => m.result === 'completed').length, bestWave: Math.max(0, ...horde.map((m) => m.wavesCleared ?? 0)),
        waveGoal: HORDE_WAVE_GOAL, wavesCleared: sum(horde, (m) => m.wavesCleared ?? 0), kills: sum(horde, (m) => m.kills), hoursPlayed: hours(horde),
        mainRole: horde.length ? roleOf(p) : null, byMap: hordeMaps,
      },
      campaign: {
        chaptersCompleted: new Set(campaign.filter((m) => m.result === 'completed').map((m) => m.map)).size, chaptersTotal: CAMPAIGN_CHAPTERS,
        attempts: campaign.length, hoursPlayed: hours(campaign), kills: sum(campaign, (m) => m.kills),
      },
      classes: classesOf(p, played),
      medals: {
        earned: unlocks.length, total: medals.length * MEDAL_TIERS.length,
        seriesCompleted: medals.filter((m) => m.tiers.every((t) => t.unlockedAt)).length, seriesTotal: medals.length, latest: unlocks.slice(0, 6),
      },
      equipped: medals.chosen.map((id) => unlockOf(medals.find((m) => m.id === id)!)!),
    };
  };

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
    const finished = new Set(played.filter((m) => m.mode === 'campaign' && m.result === 'completed').map((m) => m.map)).size >= CAMPAIGN_CHAPTERS;
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
      campaign: finished
        ? { title: 'Rejuega la campaña en Locura', mode: 'campaign', estimatedMinutes: 50, reward: '+1500 XP',
            reason: `Ya terminaste los ${CAMPAIGN_CHAPTERS} capítulos`, launchUrl: launch({ mode: 'campaign' }) }
        : { title: `Sigue en el capítulo ${chapter}`, mode: 'campaign', estimatedMinutes: 50, reward: '+1500 XP',
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

  r.add('GET', '/me/service-record', ({ playerId, query }) => ok(serviceRecord(me(playerId), nowOf(query))));
  r.add('GET', '/me/achievements', ({ playerId, query }) => ok(achievementsOf(me(playerId), nowOf(query))));

  const guideSummary = ({ facts: _f, sections: _s, cta: _c, ...g }: SeedData['guides'][number]): GuideSummary => g;
  r.add('GET', '/guides', ({ query }) => ok(data.guides
    .filter((g) => (!query.section || g.section === (query.section as GuideSection)) && (!query.role || g.role === (query.role as HordeRole)))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(guideSummary)));
  r.add('GET', '/guides/{guideId}', ({ params }) => {
    const g = data.guides.find((x) => x.id === params.guideId);
    if (!g) return error(404, 'not_found', `No existe la guía ${params.guideId}`);
    return ok({ ...structuredClone(g), facts: g.facts.map(([label, value]) => ({ label, value })) } satisfies Guide);
  });
  r.add('GET', '/creators', ({ query }) => ok(data.creators
    .filter((c) => !query.language || c.language === query.language)
    .map((c): Creator => ({ ...structuredClone(c), guides: data.guides.filter((g) => g.author.creatorId === c.id).length }))
    .sort((a, b) => Number(b.live) - Number(a.live) || b.followers - a.followers)));
  r.add('GET', '/promos', ({ query }) => {
    if (!query.placement) return error(400, 'bad_request', 'Falta placement');
    return ok(data.promos.filter((x) => x.placement === (query.placement as PromoPlacement)).map((x): Promo => structuredClone(x)));
  });
  r.add('GET', '/me/medals', ({ playerId, query }) => ok([...medalsOf(me(playerId), nowOf(query))]));
  r.add('GET', '/me/medals/{medalId}', ({ playerId, params, query }) => {
    const m = medalsOf(me(playerId), nowOf(query)).find((x) => x.id === params.medalId);
    return m ? ok(m) : error(404, 'not_found', `No existe la medalla ${params.medalId}`);
  });
  r.add('PUT', '/me/medals/equipped', ({ playerId, query, body }) => {
    const ids = (body as { medalIds?: unknown } | undefined)?.medalIds;
    if (!Array.isArray(ids) || ids.length > 3 || new Set(ids).size !== ids.length) return error(400, 'bad_request', 'Elige hasta 3 medallas distintas');
    const medals = medalsOf(me(playerId), nowOf(query));
    const picked = ids.map((id) => medals.find((m) => m.id === id));
    if (picked.some((m) => !m || !unlockOf(m))) return error(400, 'bad_request', 'Solo puedes equipar medallas que ya obtuviste');
    equippedBy.set(playerId, ids as string[]);
    return ok(picked.map((m) => unlockOf(m!)!));
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
    const myRole = roleOf(p);
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
