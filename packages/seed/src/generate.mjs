import { createRng, clamp } from './rng.mjs';
import {
  DAY, SEED, PLAYER_COUNT, CLAN_COUNT, SEASON, SEASON_START, SEASON_END, RANKED_START, DEMO_NOW, EVENTS,
  PLAYTIME_BUCKETS, COUNTRIES, SPANISH_COUNTRIES, TIMEZONES, COINS, HORDE_DIFFICULTIES, VERSUS_MAPS, HORDE_MAPS, HORDE_WAVE_GOAL, MATCH_MINUTES,
  MEDALS, HORDE_ROLES, GAMERTAG_PARTS, CLAN_WORDS, STORE, CHALLENGE_TEMPLATES,
} from './constants.mjs';
import { NEWS, GIFT_AT } from './news.mjs';

const iso = (ms) => new Date(ms).toISOString();
const round = (x, digits = 0) => Number(x.toFixed(digits));

// Rank tiers by points; each tier has 3 divisions (1 = highest).
const TIERS = [['bronze', 0], ['silver', 1000], ['gold', 1500], ['onyx', 2000]];
export { HORDE_WAVE_GOAL, GIFT_AT };

export function rankFromPoints(points) {
  let index = 0;
  TIERS.forEach(([, min], i) => { if (points >= min) index = i; });
  const [tier, min] = TIERS[index];
  const next = TIERS[index + 1]?.[1] ?? min + 1500;
  const third = (next - min) / 3;
  const division = clamp(3 - Math.floor((points - min) / third), 1, 3);
  return { tier, division, points };
}

export function generate({ seed = SEED } = {}) {
  const rng = createRng(seed);

  // ---------- Players ----------
  const usedTags = new Set();
  const makeTag = () => {
    for (;;) {
      const tag = rng.chance(0.5)
        ? `${rng.pick(GAMERTAG_PARTS.head)}_${rng.pick(GAMERTAG_PARTS.tail)}`
        : `${rng.pick(GAMERTAG_PARTS.head)}${rng.int(1, 99)}`;
      if (!usedTags.has(tag)) { usedTags.add(tag); return tag; }
    }
  };

  // Named characters from the brief and the prototype.
  const scripted = [
    { id: 'p_demo', gamertag: 'Delta_Rojo', platform: 'xbox', country: 'MX', accessType: 'game_pass', skill: 0.3 },
    { id: 'p_capi', gamertag: 'Capi_Hierro', platform: 'xbox', country: 'MX', accessType: 'purchase', skill: 0.9 },
    { id: 'p_marla', gamertag: 'Marla_X', platform: 'pc', country: 'MX', accessType: 'purchase', skill: 0.6 },
  ];
  scripted.forEach((p) => usedTags.add(p.gamertag));

  const players = [];
  const profiles = new Map(); // simulation-only fields, not exported

  for (const s of scripted) {
    players.push({ id: s.id, gamertag: s.gamertag, platform: s.platform, country: s.country, accessType: s.accessType });
    profiles.set(s.id, { skill: s.skill, scripted: true, modePref: [['versus', 1], ['horde', 1], ['campaign', 0.3]] });
  }

  while (players.length < PLAYER_COUNT) {
    const id = `p_${String(players.length).padStart(4, '0')}`;
    const platform = rng.chance(0.65) ? 'xbox' : 'pc';
    const accessType = platform === 'xbox'
      ? rng.weighted([['game_pass', 0.78], ['game_pass_premium_upgrade', 0.14], ['purchase', 0.08]])
      : rng.weighted([['purchase', 0.6], ['game_pass', 0.32], ['game_pass_premium_upgrade', 0.08]]);
    const [minH, maxH] = rng.weighted(PLAYTIME_BUCKETS[platform].map((b) => [b, b[2]]));
    players.push({ id, gamertag: makeTag(), platform, country: rng.weighted(COUNTRIES), accessType });
    profiles.set(id, {
      skill: clamp(rng.normal(0, 1), -2.5, 2.5),
      targetHours: minH + rng.float() * (maxH - minH),
      startOffsetDays: Math.floor(Math.pow(rng.float(), 2.5) * 40),
      modePref: [
        ['versus', 0.2 + rng.float()],
        ['horde', 0.2 + rng.float()],
        ['campaign', 0.1 + rng.float() * 0.6],
      ],
    });
  }

  // ---------- Matches ----------
  const matches = [];
  const rankPoints = new Map(players.map((p) => [p.id, 1200 + Math.round(profiles.get(p.id).skill * 150)]));
  const startPoints = new Map(rankPoints);
  const chapter = new Map();
  let matchSeq = 0;

  const playMatch = (playerId, mode, endedAt, durationMin) => {
    const { skill } = profiles.get(playerId);
    const base = {
      id: `m_${String(++matchSeq).padStart(6, '0')}`,
      playerId,
      mode,
      endedAt: iso(endedAt),
      durationSeconds: Math.round(durationMin * 60),
      accuracy: round(clamp(rng.normal(0.32 + skill * 0.05, 0.06), 0.08, 0.7), 3),
      medals: rng.sample(MEDALS, rng.int(0, 3)),
      rankDelta: null,
      wavesCleared: null,
    };
    if (mode === 'horde_siege') {
      const waves = clamp(Math.round(rng.normal(16 + skill * 5, 6)), 1, HORDE_WAVE_GOAL);
      return { ...base, map: rng.pick(HORDE_MAPS), wavesCleared: waves,
        result: waves >= HORDE_WAVE_GOAL ? 'completed' : 'failed',
        kills: Math.max(0, Math.round(rng.normal(55 + skill * 15 + waves, 15))),
        deaths: Math.max(0, Math.round(rng.normal(4 - skill, 2))) };
    }
    if (mode === 'campaign') {
      const ch = (chapter.get(playerId) ?? 0) + 1;
      const done = rng.chance(0.9);
      if (done) chapter.set(playerId, ch);
      return { ...base, map: `Campaña · Capítulo ${ch}`, result: done ? 'completed' : 'failed',
        kills: Math.max(0, Math.round(rng.normal(40, 10))), deaths: Math.max(0, Math.round(rng.normal(3, 2))) };
    }
    const roll = rng.float();
    const winP = clamp(0.5 + skill * 0.08, 0.2, 0.8);
    const result = roll < 0.03 ? 'draw' : roll < 0.03 + winP * 0.97 ? 'win' : 'loss';
    const match = { ...base, map: rng.pick(VERSUS_MAPS), result,
      kills: Math.max(0, Math.round(rng.normal(12 + skill * 4, 4))),
      deaths: Math.max(1, Math.round(rng.normal(12 - skill * 3, 3))) };
    if (mode === 'versus_ranked') {
      const delta = result === 'win' ? rng.int(15, 30) : result === 'loss' ? -rng.int(10, 25) : 0;
      rankPoints.set(playerId, Math.max(0, rankPoints.get(playerId) + delta));
      match.rankDelta = delta;
    }
    return match;
  };

  const pickMode = (playerId, at) => {
    const kind = rng.weighted(profiles.get(playerId).modePref);
    if (kind === 'horde') return 'horde_siege';
    if (kind === 'campaign') return 'campaign';
    if (at >= RANKED_START && rng.chance(0.4)) return 'versus_ranked';
    return rng.chance(0.55) ? 'versus_tdm' : 'versus_conquest';
  };

  const playSession = (playerId, startMs, minutes, forcedModes) => {
    let t = startMs;
    const end = startMs + minutes * 60e3;
    let i = 0;
    while (t < end && t < SEASON_END) {
      const mode = forcedModes ? forcedModes[i % forcedModes.length] : pickMode(playerId, t);
      const [lo, hi] = MATCH_MINUTES[mode];
      const dur = lo + rng.float() * (hi - lo);
      // Don't start a match that would run well past the planned session.
      if (i > 0 && t + dur * 30e3 > end) break;
      t += dur * 60e3;
      matches.push(playMatch(playerId, mode, t, dur));
      t += rng.int(1, 4) * 60e3; // lobby time
      i++;
    }
  };

  const eveningUtc = (dayMs) => dayMs + (rng.chance(0.6) ? rng.int(0, 5) : rng.int(18, 23)) * 3600e3 + rng.int(0, 59) * 60e3;

  // Delta_Rojo: ~9 hours in the first week, then stops before Ranked opens (the churn case).
  const demoDays = [
    ['2026-10-07', 150, ['horde_siege', 'versus_tdm']],
    ['2026-10-08', 120, ['campaign']],
    ['2026-10-09', 90, ['versus_tdm', 'versus_conquest']],
    ['2026-10-11', 120, ['horde_siege']],
    ['2026-10-12', 60, ['versus_conquest']],
  ];
  for (const [day, minutes, modes] of demoDays) {
    playSession('p_demo', Date.parse(`${day}T01:30:00.000Z`), minutes, modes);
  }

  // Capi_Hierro and Marla_X are steady weekly players.
  for (const id of ['p_capi', 'p_marla']) {
    for (let d = 0; d < 56; d += rng.int(1, 3)) {
      playSession(id, eveningUtc(SEASON_START + d * DAY), rng.int(60, 150));
    }
  }

  // Everyone else: spend their target hours in sessions, starting on their start day.
  for (const p of players) {
    const prof = profiles.get(p.id);
    if (prof.scripted) continue;
    let remaining = prof.targetHours * 60;
    let day = prof.startOffsetDays;
    const maxGap = prof.targetHours < 1 ? 0 : prof.targetHours < 5 ? 3 : prof.targetHours < 15 ? 4 : 3;
    while (remaining > 5 && day < 56) {
      const minutes = Math.min(remaining, rng.int(30, 150));
      playSession(p.id, eveningUtc(SEASON_START + day * DAY), minutes);
      remaining -= minutes;
      day += rng.int(0, maxGap) + (rng.chance(0.5) ? 1 : 0);
    }
  }

  matches.sort((a, b) => a.endedAt.localeCompare(b.endedAt) || a.id.localeCompare(b.id));

  // Rank as of the demo date, replaying ranked deltas up to then.
  const demoNowMs = Date.parse(DEMO_NOW);
  // Players with no ranked match by then are unranked (rank null).
  const pointsAtDemo = new Map(startPoints);
  const rankedPlayers = new Set();
  for (const m of matches) {
    if (m.rankDelta !== null && Date.parse(m.endedAt) <= demoNowMs) {
      pointsAtDemo.set(m.playerId, Math.max(0, pointsAtDemo.get(m.playerId) + m.rankDelta));
      rankedPlayers.add(m.playerId);
    }
  }
  const matchCount = new Map();
  for (const m of matches) matchCount.set(m.playerId, (matchCount.get(m.playerId) ?? 0) + 1);
  for (const p of players) {
    p.level = clamp(1 + Math.floor((matchCount.get(p.id) ?? 0) / 3), 1, 100);
    p.timezone = TIMEZONES[p.country];
    p.rankStartPoints = startPoints.get(p.id);
    p.rank = rankedPlayers.has(p.id) ? rankFromPoints(pointsAtDemo.get(p.id)) : null;
  }

  // ---------- Friends ----------
  const active = players.filter((p) => (matchCount.get(p.id) ?? 0) > 30 && p.id !== 'p_demo');
  const demoFriends = ['p_capi', 'p_marla', ...rng.sample(active.map((p) => p.id), 10)];
  const friendships = [...new Set(demoFriends)].map((friendId) => ({ playerId: 'p_demo', friendId }));
  for (const p of rng.sample(players.filter((x) => x.id !== 'p_demo'), 200)) {
    for (const f of rng.sample(players, rng.int(1, 6))) {
      if (f.id !== p.id) friendships.push({ playerId: p.id, friendId: f.id });
    }
  }

  // ---------- Clans ----------
  const clans = CLAN_WORDS.slice(0, CLAN_COUNT).map((word, i) => ({
    id: `c_${String(i).padStart(2, '0')}`,
    name: `Clan ${word}`,
    tag: i === 0 ? 'NRT' : word.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase(),
    language: i < 12 ? 'es' : 'en',
  }));
  const clanMembers = [
    { clanId: 'c_00', playerId: 'p_capi', role: 'leader' },
    { clanId: 'c_00', playerId: 'p_demo', role: 'officer' },
    { clanId: 'c_00', playerId: 'p_marla', role: 'officer' },
  ];
  const inClan = new Set(clanMembers.map((m) => m.playerId));
  const leaders = new Set(['c_00']);
  for (const p of players) {
    if (inClan.has(p.id) || !rng.chance(0.4)) continue;
    const spanish = SPANISH_COUNTRIES.has(p.country);
    const candidates = clans.filter((c) => (c.language === 'es') === spanish);
    const clan = rng.pick(candidates.length ? candidates : clans);
    const role = leaders.has(clan.id) ? (rng.chance(0.1) ? 'officer' : 'member') : 'leader';
    leaders.add(clan.id);
    clanMembers.push({ clanId: clan.id, playerId: p.id, role });
    inClan.add(p.id);
  }
  for (const c of clans) {
    c.memberCount = clanMembers.filter((m) => m.clanId === c.id).length;
    c.leaderId = clanMembers.find((m) => m.clanId === c.id && m.role === 'leader')?.playerId ?? null;
  }
  const clanOf = new Map(clanMembers.map((m) => [m.playerId, m.clanId]));
  for (const p of players) p.clanId = clanOf.get(p.id) ?? null;

  // ---------- Weekly challenges ----------
  const challenges = [];
  const weeks = Math.ceil((SEASON_END - SEASON_START) / (7 * DAY));
  for (let w = 0; w < weeks; w++) {
    const weekStart = SEASON_START + w * 7 * DAY;
    const pool = CHALLENGE_TEMPLATES.filter((t) => !t.fromRanked || weekStart >= RANKED_START);
    for (const t of pool) {
      const goal = rng.int(t.goal[0], t.goal[1]);
      challenges.push({
        id: `ch_w${w}_${t.key}`,
        key: t.key,
        weekStart: iso(weekStart),
        title: t.title.replace('{n}', String(goal)),
        mode: t.mode,
        goal,
        reward: t.reward,
        expiresAt: iso(Math.min(weekStart + 7 * DAY, SEASON_END)),
      });
    }
  }
  const counters = {
    versus_wins: (m) => (m.mode.startsWith('versus') && m.result === 'win' ? 1 : 0),
    horde_waves: (m) => m.wavesCleared ?? 0,
    matches: () => 1,
    campaign: (m) => (m.mode === 'campaign' && m.result === 'completed' ? 1 : 0),
    kills: (m) => m.kills,
    ranked: (m) => (m.mode === 'versus_ranked' ? 1 : 0),
  };
  const progressMap = new Map();
  for (const m of matches) {
    const w = Math.floor((Date.parse(m.endedAt) - SEASON_START) / (7 * DAY));
    for (const key of Object.keys(counters)) {
      const k = `${m.playerId}|ch_w${w}_${key}`;
      progressMap.set(k, (progressMap.get(k) ?? 0) + counters[key](m));
    }
  }
  const challengeById = new Map(challenges.map((c) => [c.id, c]));
  const challengeProgress = [];
  for (const [k, value] of progressMap) {
    const [playerId, challengeId] = k.split('|');
    const ch = challengeById.get(challengeId);
    if (ch && value > 0) challengeProgress.push({ playerId, challengeId, progress: Math.min(value, ch.goal) });
  }

  // ---------- Store ----------
  const storeItems = [];
  const usedNames = new Set();
  while (storeItems.length < STORE.itemCount) {
    const [type, noun, currency, [lo, hi]] = rng.pick(STORE.types);
    const name = `${noun} ${rng.pick(STORE.adjectives)}`;
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    const id = `item_${String(storeItems.length).padStart(3, '0')}`;
    const step = currency === 'iron' ? 100 : 500;
    storeItems.push({ id, name, type, price: { amount: Math.round(rng.int(lo, hi) / step) * step, currency },
      imageUrl: `/img/store/${id}.png` });
  }
  const rotations = [];
  for (let t = SEASON_START; t < SEASON_END; t += 7 * DAY) {
    rotations.push({
      id: `rot_${iso(t).slice(0, 10)}`,
      startsAt: iso(t),
      endsAt: iso(Math.min(t + 7 * DAY, SEASON_END)),
      itemIds: rng.sample(storeItems.map((i) => i.id), STORE.itemsPerRotation),
    });
  }
  // Demo wishlist: one item on sale now, one that returns in the next rotation (triggers the alert).
  const demoIdx = rotations.findIndex((r) => r.startsAt <= DEMO_NOW && DEMO_NOW < r.endsAt);
  const nowItems = rotations[demoIdx].itemIds;
  const nextOnly = rotations[demoIdx + 1].itemIds.filter((id) => !nowItems.includes(id));
  const wishlists = [
    { playerId: 'p_demo', itemId: nowItems[0], addedAt: '2026-10-10T02:15:00.000Z' },
    { playerId: 'p_demo', itemId: nextOnly[0], addedAt: '2026-10-11T03:40:00.000Z' },
  ];

  // ---------- Squad sessions ----------
  // Attributes added after v0.1 draw from their own stream so earlier records keep their values.
  const extra = createRng(seed ^ 0x5e55);
  const shareUrl = (id) => `https://example.com/s/${id}`;
  // Friday Horde Siege from the brief: 9 of 12, clan members first, Delta_Rojo in squad Bravo (2).
  const scriptedIds = ['p_capi', 'p_marla', 'p_demo'];
  const clanmates = clanMembers.filter((m) => m.clanId === 'c_00' && !scriptedIds.includes(m.playerId)).map((m) => m.playerId);
  const outsiders = players.map((p) => p.id).filter((id) => !scriptedIds.includes(id) && !clanmates.includes(id));
  const fill = [...rng.sample(clanmates, 6), ...rng.sample(outsiders, 6)].slice(0, 6);
  const fridayMembers = [
    ['p_capi', 1, 'assault'], ['p_marla', 1, 'medic'], [fill[0], 1, 'breacher'], [fill[1], 1, 'marksman'],
    ['p_demo', 2, 'assault'], [fill[2], 2, 'breacher'], [fill[3], 2, 'marksman'],
    [fill[4], 3, 'medic'], [fill[5], 3, 'assault'],
  ];
  const tagOf = new Map(players.map((p) => [p.id, p.gamertag]));
  const sessions = [{
    id: 'sess_friday',
    hostGamertag: 'Capi_Hierro',
    mode: 'horde_siege',
    // Friday Oct 30, 9 PM in Mexico City (UTC-6).
    startsAt: '2026-10-31T03:00:00.000Z',
    slots: 12,
    language: 'es',
    micRequired: true,
    difficulty: 'hard',
    map: 'Bastión',
    clanId: 'c_00',
    status: 'open',
    shareUrl: shareUrl('sess_friday'),
    members: fridayMembers.map(([id, squad, role]) => ({ gamertag: tagOf.get(id), squad, role, confirmed: true })),
  }];
  // Tonight's open Horde Siege in Spanish with no mic required: the "play Horde now" option.
  const spanishPlayers = players.filter((p) => SPANISH_COUNTRIES.has(p.country) && !scriptedIds.includes(p.id));
  const tonight = extra.sample(spanishPlayers, 7);
  sessions.push({
    id: 'sess_tonight',
    hostGamertag: tonight[0].gamertag,
    mode: 'horde_siege',
    // Tuesday Oct 27, 10:30 PM in Mexico City.
    startsAt: '2026-10-28T04:30:00.000Z',
    slots: 12,
    language: 'es',
    micRequired: false,
    difficulty: 'normal',
    map: 'Presa Sur',
    clanId: null,
    status: 'open',
    shareUrl: shareUrl('sess_tonight'),
    members: tonight.map((p, j) => ({ gamertag: p.gamertag, squad: Math.floor(j / 4) + 1, role: HORDE_ROLES[j % 4], confirmed: true })),
  });
  for (let i = 1; i < 40; i++) {
    const mode = rng.weighted([['horde_siege', 0.5], ['versus_tdm', 0.2], ['versus_ranked', 0.15], ['campaign', 0.15]]);
    const slots = mode === 'horde_siege' ? 12 : 4;
    const host = rng.pick(players);
    const filled = rng.int(1, slots);
    const memberIds = [host.id, ...rng.sample(players.filter((p) => p.id !== host.id).map((p) => p.id), filled - 1)];
    const id = `sess_${String(i).padStart(3, '0')}`;
    sessions.push({
      id,
      hostGamertag: host.gamertag,
      mode,
      startsAt: iso(eveningUtc(SEASON_START + rng.int(0, 55) * DAY)),
      slots,
      language: SPANISH_COUNTRIES.has(host.country) ? 'es' : 'en',
      micRequired: rng.chance(0.5),
      clanId: rng.chance(0.3) ? host.clanId : null,
      status: filled >= slots ? 'full' : 'open',
      shareUrl: shareUrl(id),
      members: memberIds.map((pid, j) => (mode === 'horde_siege'
        ? { gamertag: tagOf.get(pid), squad: Math.floor(j / 4) + 1, role: HORDE_ROLES[j % 4] }
        : { gamertag: tagOf.get(pid) })),
    });
  }
  for (const s of sessions.slice(1)) {
    if (s.id === 'sess_tonight') continue;
    if (s.mode === 'horde_siege') {
      s.difficulty = extra.pick(HORDE_DIFFICULTIES);
      s.map = extra.pick(HORDE_MAPS);
    } else if (s.mode !== 'campaign') {
      s.map = extra.pick(VERSUS_MAPS);
    }
    for (const m of s.members) m.confirmed = extra.chance(0.85);
  }
  sessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  // ---------- Wallets ----------
  // Coins this week come from matches since the current rotation started, capped weekly.
  const rotationNow = rotations[demoIdx];
  const weekMatches = new Map();
  for (const m of matches) {
    if (m.endedAt >= rotationNow.startsAt && m.endedAt <= DEMO_NOW) weekMatches.set(m.playerId, (weekMatches.get(m.playerId) ?? 0) + 1);
  }
  const wallets = players.map((p) => ({
    playerId: p.id,
    coins: extra.int(2000, 60000),
    iron: extra.chance(0.3) ? extra.int(100, 3000) : 0,
    coinsThisWeek: Math.min(COINS.weeklyCap, (weekMatches.get(p.id) ?? 0) * COINS.perMatch),
    coinsWeeklyCap: COINS.weeklyCap,
    capResetsAt: rotationNow.endsAt,
  }));
  // Delta_Rojo can afford a cheap emblem but not every coin item this week.
  Object.assign(wallets.find((w) => w.playerId === 'p_demo'), { coins: 16000, iron: 400, coinsThisWeek: 0 });

  const events = EVENTS.map((e) => ({ ...e, modes: ['versus_tdm', 'horde_siege'], rewards: [`Emblema ${e.name}`, `Estandarte ${e.name}`] }));

  return {
    meta: {
      seed,
      demoNow: DEMO_NOW,
      disclaimer: 'Simulated data for a portfolio concept. Not affiliated with Microsoft, Xbox or The Coalition.',
    },
    season: SEASON,
    events,
    players,
    friendships,
    clans,
    clanMembers,
    matches,
    challenges,
    challengeProgress,
    storeItems,
    storeRotations: rotations,
    wishlists,
    sessions,
    wallets,
    news: NEWS,
  };
}
