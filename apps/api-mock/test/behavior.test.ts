// The demo story and the six fixes from the synthetic test hold in the simulated backend.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { Leaderboard, MatchPage, MatchReport, Notification, SquadSession, StoreRotation, WeeklyReport } from '@eday/api-types';
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
  assert.equal(week.daysSinceLastMatch, 15);
  assert.equal(week.nextMission.mode, 'versus_ranked');
  assert.match(week.nextMission.reason!, /13 oct/);
  assert.deepEqual(week.nextMission.alternatives!.map((a) => a.mode), ['horde_siege', 'campaign']);
  assert.equal(week.nextMission.alternatives![0].title, 'Horde en español hoy, 22:30');
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
  assert.deepEqual(kinds(c<Notification[]>('GET', '/me/notifications')), ['event', 'mission', 'rival', 'session', 'wishlist']);
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
  assert.equal(lb.me?.points, 27);
  const ranked = call<Leaderboard>('GET', '/leaderboards/versus_ranked', { query: { scope: 'friends' } });
  assert.equal(ranked.metric, 'rank_points');
  assert.equal(ranked.me, undefined, 'unranked players have no ranked row');
});

test('wishlist flags follow adds and removes', () => {
  const { call: c } = fresh();
  const flagged = () => c<StoreRotation>('GET', '/store/rotation').items.filter((i) => i.wishlisted).map((i) => i.id);
  assert.deepEqual(flagged(), ['item_010'], 'Paquete Tundra is wishlisted and on sale');
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
  assert.equal(lesson.takeaway!.link, '/escuadra/sess_friday');
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
