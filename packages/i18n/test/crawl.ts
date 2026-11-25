// Walks every GET route of the simulated API at each demo-clock moment and returns every string it answered.
import { createApi } from '@eday/api-mock';
import type { Lang } from '../src/index.ts';

export const MOMENTS = ['2026-10-27T18:00:00.000Z', '2026-10-28T03:30:00.000Z', '2026-10-31T02:00:00.000Z', '2026-11-03T16:00:00.000Z'];
const NAMES = new Set(['id', 'gamertag', 'hostGamertag', 'clanTag', 'timezone', 'country', 'language', 'url', 'link', 'launchUrl']);

export function crawl(lang: Lang) {
  const api = createApi();
  const playerId = api.playerIdFromToken(api.signIn()!.token)!;
  const seen = new Map<string, string>();
  const walk = (v: unknown, key: string, path: string) => {
    if (typeof v === 'string') { if (!NAMES.has(key) && !seen.has(v)) seen.set(v, `${path} ${key}`); return; }
    if (Array.isArray(v)) return v.forEach((x) => walk(x, key, path));
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k, path);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const get = (path: string, query: Record<string, string> = {}): any => {
    const r = api.handle({ method: 'GET', path, query, playerId, lang });
    walk(r.body, '', path);
    return r.body;
  };
  for (const asOf of MOMENTS) {
    const q = { asOf };
    for (const p of ['/me', '/me/week', '/me/notifications', '/me/wallet', '/me/achievements', '/me/service-record', '/season/current', '/me/challenges',
      '/store/rotation', '/me/wishlist', '/events', '/calendar', '/me/season-recap', '/me/campaign']) get(p, q);
    for (const placement of ['home', 'news', 'guides', 'community']) get('/promos', { placement });
    for (const m of get('/me/medals', q)) get(`/me/medals/${m.id}`, q);
    for (const m of get('/me/matches', { ...q, limit: '400' }).items) get(`/matches/${m.id}`, q);
    for (const a of get('/news', { ...q, limit: '100' })) get(`/news/${a.id}`, q);
    for (const s of get('/sessions', q)) get(`/sessions/${s.id}`);
    for (const m of get('/maps', q)) get(`/maps/${m.id}`, q);
    for (const w of get('/weapons', q)) get(`/weapons/${w.id}`, q);
    for (const f of get('/me/friends', q)) get(`/me/compare/${f.gamertag}`, q);
  }
  for (const g of get('/guides')) get(`/guides/${g.id}`);
  get('/creators');
  const me = get('/me');
  if (me.clanId) { get(`/clans/${me.clanId}`); get(`/clans/${me.clanId}/leaderboard`); }
  for (const mode of ['versus_ranked', 'versus_tdm', 'horde_siege', 'versus_conquest']) for (const scope of ['global', 'friends', 'clan', 'country']) get(`/leaderboards/${mode}`, { scope });
  return seen;
}
