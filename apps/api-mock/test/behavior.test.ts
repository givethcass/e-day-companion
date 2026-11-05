// The demo story and the six fixes from the synthetic test hold in the simulated backend.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { CalendarEntry, Leaderboard, Medal, MedalUnlock, ServiceRecord, MatchPage, MatchReport, NewsSummary, Notification, SquadSession, StoreRotation, WeeklyReport } from '@eday/api-types';
import { generate } from '@eday/seed';
import { createApi } from '../src/index.ts';

const fresh = () => {
  const api = createApi();
  const call = <T>(method: string, path: string, opts: { query?: Record<string, string>; body?: unknown } = {}) =>
    api.handle({ method, path, playerId: 'p_demo', ...opts }).body as T;
  return { api, call };
};
const { call } = fresh();

test("Delta_Rojo's mission follows how they play and offers the other two", () => {
  const week = call<WeeklyReport>('GET', '/me/week');
  assert.equal(week.daysSinceLastMatch, 0);
  assert.equal(week.nextMission.mode, 'versus_ranked');
  assert.equal(week.nextMission.reason, 'Defiende tu rango esta semana');
  assert.deepEqual(week.nextMission.alternatives!.map((a) => a.mode), ['horde_siege', 'campaign']);
  assert.equal(week.nextMission.alternatives![0].title, 'Horde en español hoy, 22:30');
  assert.equal(week.nextMission.alternatives![1].title, 'Rejuega la campaña en Locura', 'the campaign is finished');
});

test('a Horde-first player gets a Horde mission', () => {
  const { api } = fresh();
  const id = generate().players.map((p) => p.id).find((pid) => {
    const res = api.handle({ method: 'GET', path: '/me/week', playerId: pid });
    return res.status === 200 && (res.body as WeeklyReport).nextMission.mode === 'horde_siege';
  });
  assert.ok(id, 'no player in the seed gets a Horde mission');
});

test('notifications are opt-in beyond squad and wishlist', () => {
  const { call: c } = fresh();
  const kinds = (ns: Notification[]) => [...new Set(ns.map((n) => n.kind))].sort();
  assert.deepEqual(kinds(c<Notification[]>('GET', '/me/notifications')), ['session', 'wishlist']);
  c('PUT', '/me/notification-prefs', { body: { rival: true, events: true, ranked: true } });
  // Delta_Rojo is ranked and leads their friends, so there is no Ranked nudge and no rival.
  assert.deepEqual(kinds(c<Notification[]>('GET', '/me/notifications')), ['event', 'session', 'wishlist']);
});

test('times in copy are local to the player (Mexico City)', () => {
  const ns = call<Notification[]>('GET', '/me/notifications');
  assert.ok(ns.some((n) => n.body?.startsWith('vie 30 oct, 21:00')));
});

test('session filters narrow to tonight, Spanish, no mic', () => {
  const list = call<SquadSession[]>('GET', '/sessions', {
    query: { language: 'es', micRequired: 'false', startsAfter: '2026-10-27T18:00:00.000Z', startsBefore: '2026-10-28T06:00:00.000Z' },
  });
  assert.deepEqual(list.map((s) => s.id), ['sess_tonight']);
});

test('joining with a role confirms the spot', () => {
  const { call: c } = fresh();
  const s = c<SquadSession>('POST', '/sessions/sess_tonight/join', { body: { squad: 2, role: 'medic' } });
  assert.deepEqual(s.members.find((m) => m.gamertag === 'Delta_Rojo'), { gamertag: 'Delta_Rojo', squad: 2, role: 'medic', confirmed: true });
});

test('Horde leaderboard ranks by best wave and includes the player', () => {
  const lb = call<Leaderboard>('GET', '/leaderboards/horde_siege', { query: { scope: 'friends' } });
  assert.equal(lb.metric, 'best_wave');
  assert.equal(lb.me?.points, 30);
  const ranked = call<Leaderboard>('GET', '/leaderboards/versus_ranked', { query: { scope: 'friends' } });
  assert.equal(ranked.metric, 'rank_points');
  assert.equal(ranked.me?.position, 1, 'Delta_Rojo leads their friends in Ranked');
});

test('wishlist flags follow adds and removes', () => {
  const { call: c } = fresh();
  const flagged = () => c<StoreRotation>('GET', '/store/rotation').items.filter((i) => i.wishlisted).map((i) => i.id);
  assert.deepEqual(flagged(), ['item_005'], 'Armadura Ámbar is wishlisted and on sale');
  const second = c<StoreRotation>('GET', '/store/rotation').items.find((i) => !i.wishlisted)!;
  c('POST', '/me/wishlist', { body: { itemId: second.id } });
  assert.ok(flagged().includes(second.id));
  c('DELETE', `/me/wishlist/${second.id}`);
  assert.ok(!flagged().includes(second.id));
});

test('sign-in tokens map to players', () => {
  const { api } = fresh();
  const session = api.signIn()!;
  assert.equal(session.player.gamertag, 'Delta_Rojo');
  assert.equal(api.playerIdFromToken(session.token), 'p_demo');
  assert.equal(api.playerIdFromToken('demo:nobody'), null);
});

test('a Horde report names the missing role and points at the next session', () => {
  const horde = call<MatchPage>('GET', '/me/matches', { query: { mode: 'horde_siege', limit: '100' } }).items;
  const reports = horde.map((m) => call<MatchReport>('GET', `/matches/${m.id}`));
  const lesson = reports.find((r) => r.takeaway?.text.startsWith('Sin Irruptor'));
  assert.ok(lesson, 'no Horde match without a Breacher');
  assert.equal(lesson.takeaway!.link, '/comunidad/escuadra/sess_friday');
  assert.match(lesson.takeaway!.text, /El viernes tu escuadra ya tiene uno/);
  for (const r of reports) {
    assert.equal(r.waveGoal, 30);
    assert.equal(new Set(r.scoreboard!.map((l) => l.gamertag)).size, r.scoreboard!.length, 'a player appears twice');
    assert.equal(r.scoreboard!.find((l) => l.isMe)?.role, 'assault');
  }
  // On Friday evening the same lesson says "today".
  const friday = call<MatchReport>('GET', `/matches/${lesson.id}`, { query: { asOf: '2026-10-31T02:00:00.000Z' } });
  assert.match(friday.takeaway!.text, /Hoy tu escuadra ya tiene uno/);
});

test('on Friday evening the booked Horde session becomes the mission', () => {
  const week = call<WeeklyReport>('GET', '/me/week', { query: { asOf: '2026-10-31T02:00:00.000Z' } });
  assert.equal(week.nextMission.title, 'Tu Horde de hoy, 21:00');
  assert.equal(week.nextMission.launchUrl, 'edaycompanion://launch?session=sess_friday');
  assert.deepEqual(week.nextMission.alternatives!.map((a) => a.mode), ['versus_ranked', 'campaign']);
});

test('news follow the demo clock: the Nov 2 patch only exists from Nov 2', () => {
  const tuesday = call<NewsSummary[]>('GET', '/news');
  assert.equal(tuesday[0].id, 'n_patch_1026');
  assert.ok(!tuesday.some((n) => n.id === 'n_patch_1102' || n.id === 'n_20years'));
  assert.equal(fresh().api.handle({ method: 'GET', path: '/news/n_patch_1102', playerId: 'p_demo' }).status, 404);
  const anniversary = call<NewsSummary[]>('GET', '/news', { query: { asOf: '2026-11-03T16:00:00.000Z' } });
  assert.equal(anniversary[0].id, 'n_20years');
  const patches = call<NewsSummary[]>('GET', '/news', { query: { asOf: '2026-11-03T16:00:00.000Z', tag: 'patch' } });
  assert.equal(patches[0].id, 'n_patch_1102');
  assert.ok(patches.every((n) => n.tag === 'patch'));
  assert.equal((patches[0] as { sections?: unknown }).sections, undefined, 'the list carries summaries only');
});

test('the calendar lists what comes next, in order', () => {
  const entries = call<CalendarEntry[]>('GET', '/calendar');
  assert.deepEqual(entries.slice(0, 3).map((e) => e.title), ['Termina Halloween', 'Empieza 20 Years of Gears', 'Rota la tienda y los retos']);
  assert.equal(entries[0].link, '/noticias/n_halloween');
  assert.ok(entries.some((e) => e.kind === 'gift'));
  assert.equal(entries.at(-1)!.title, 'Termina la Temporada 1');
  const after = call<CalendarEntry[]>('GET', '/calendar', { query: { asOf: '2026-11-08T12:00:00.000Z' } });
  assert.ok(!after.some((e) => e.kind === 'gift' || e.title.includes('Halloween')));
});

test("the service record is counted from Delta_Rojo's matches", () => {
  const r = call<ServiceRecord>('GET', '/me/service-record');
  assert.ok(r.career.matches > 250);
  assert.ok(r.career.hoursPlayed >= 90);
  assert.equal(r.career.daysSinceLastMatch, 0);
  assert.equal(r.versus.matches + r.horde.matches + r.campaign.attempts, r.career.matches);
  assert.equal(r.versus.wins + r.versus.losses + r.versus.draws, r.versus.matches);
  assert.ok(r.versus.kd > 3 && r.versus.kd < 3.5, `K/D ${r.versus.kd}`);
  assert.equal(r.versus.rank?.tier, 'onyx');
  assert.equal(r.title, 'Veterano de Versus');
  assert.equal(r.horde.bestWave, 30);
  assert.equal(r.horde.mainRole, 'assault');
  assert.equal(r.campaign.chaptersCompleted, 12);
  assert.ok(r.trivia.length >= 8);
});

test('each medal tier carries the date of the match that earned it', () => {
  const medals = call<Medal[]>('GET', '/me/medals');
  const matches: string[] = [];
  for (let cursor: string | null = '0'; cursor !== null;) {
    const page: MatchPage = call<MatchPage>('GET', '/me/matches', { query: { limit: '100', cursor } });
    matches.push(...page.items.map((m) => m.endedAt));
    cursor = page.nextCursor ?? null;
  }
  for (const m of medals) {
    for (const [i, t] of m.tiers.entries()) {
      assert.equal(Boolean(t.unlockedAt), m.progress >= t.goal, `${m.id} ${t.tier}`);
      if (t.unlockedAt) assert.ok(matches.includes(t.unlockedAt));
      if (i > 0 && t.unlockedAt) assert.ok(t.unlockedAt >= m.tiers[i - 1].unlockedAt!);
    }
  }
  // The anniversary event starts on Nov 3, so on Oct 27 that series is still locked; a veteran still has tiers to chase.
  assert.equal(medals.find((m) => m.id === 'md_anniversary')!.progress, 0);
  assert.ok(medals.some((m) => m.tiers.some((t) => !t.unlockedAt) && m.progress > 0));
  assert.equal(medals.filter((m) => m.equipped).length, 3);
});

test('only earned medals can be equipped, three at most', () => {
  const { api } = fresh();
  const put = (medalIds: string[]) => api.handle({ method: 'PUT', path: '/me/medals/equipped', playerId: 'p_demo', body: { medalIds } });
  assert.equal(put(['md_anniversary']).status, 400);
  assert.equal(put(['md_lancer', 'md_waves', 'md_wins', 'md_chapters']).status, 400);
  const ok = put(['md_chapters', 'md_lancer']);
  assert.equal(ok.status, 200);
  assert.deepEqual((ok.body as MedalUnlock[]).map((m) => m.medalId), ['md_chapters', 'md_lancer']);
  const record = api.handle({ method: 'GET', path: '/me/service-record', playerId: 'p_demo' }).body as ServiceRecord;
  assert.deepEqual(record.equipped.map((m) => m.medalId), ['md_chapters', 'md_lancer']);
});
