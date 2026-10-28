// Every contract operation is served, and every response matches the schema the contract declares for it.
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import Ajv from 'ajv/dist/2020.js';
import formats from 'ajv-formats';
import { parse } from 'yaml';
import { createApi } from '../src/index.ts';

const contract = parse(readFileSync(new URL('../../../contract/openapi.yaml', import.meta.url), 'utf8'));
// CommonJS packages: under Node ESM the default import is module.exports, which also carries .default.
const ajv = new Ajv.default({ strict: false, allErrors: true });
formats.default(ajv);
ajv.addSchema({ $id: 'https://eday.local/openapi', components: contract.components });

// One sample call per operation, in an order where writes come after the reads they would change.
const calls: [string, string, { query?: Record<string, string>; body?: unknown }?][] = [
  ['GET', '/me'],
  ['GET', '/me/week'],
  ['GET', '/me/notifications'],
  ['GET', '/me/wallet'],
  ['GET', '/me/notification-prefs'],
  ['PUT', '/me/notification-prefs', { body: { events: true } }],
  ['GET', '/me/matches', { query: { limit: '5' } }],
  ['GET', '/matches/m_000001'],
  ['GET', '/leaderboards/horde_siege', { query: { scope: 'friends' } }],
  ['GET', '/season/current'],
  ['GET', '/me/challenges'],
  ['GET', '/store/rotation'],
  ['GET', '/me/wishlist'],
  ['POST', '/me/wishlist', { body: { itemId: 'item_000' } }],
  ['DELETE', '/me/wishlist/item_000'],
  ['GET', '/events'],
  ['GET', '/sessions', { query: { mode: 'horde_siege' } }],
  ['POST', '/sessions', { body: { mode: 'horde_siege', startsAt: '2026-10-29T02:00:00.000Z', slots: 12, language: 'es', difficulty: 'normal', map: 'Bastión' } }],
  ['GET', '/sessions/sess_friday'],
  ['POST', '/sessions/sess_tonight/join', { body: { squad: 2, role: 'support' } }],
  ['POST', '/sessions/sess_friday/deploy'],
  ['GET', '/clans/c_00'],
  ['GET', '/clans/c_00/leaderboard'],
];

const api = createApi();
const template = (path: string) => api.routes.find((r) => new RegExp(`^${r.template.replace(/\{\w+\}/g, '[^/]+')}$`).test(path))!.template;

test('the mock serves exactly the operations in the contract', () => {
  const inContract = Object.entries(contract.paths).flatMap(([p, ops]) => Object.keys(ops as object).map((m) => `${m.toUpperCase()} ${p}`)).sort();
  assert.deepEqual(api.routes.map((r) => `${r.method} ${r.template}`).sort(), inContract);
  assert.deepEqual(calls.map(([m, p]) => `${m} ${template(p)}`).sort(), inContract);
});

for (const [method, path, opts] of calls) {
  test(`${method} ${path} matches the contract`, () => {
    const res = api.handle({ method, path, playerId: 'p_demo', ...opts });
    const declared = contract.paths[template(path)][method.toLowerCase()].responses;
    assert.ok(declared[String(res.status)], `status ${res.status} is not declared: ${JSON.stringify(res.body)}`);
    const schema = declared[String(res.status)].content?.['application/json']?.schema;
    if (!schema) return assert.equal(res.body, undefined);
    const resolved = JSON.parse(JSON.stringify(schema).replaceAll('"#/components', '"https://eday.local/openapi#/components'));
    const validate = ajv.compile(resolved);
    assert.ok(validate(res.body), ajv.errorsText(validate.errors));
  });
}

test('unknown paths and missing records are 404 with an Error body', () => {
  for (const path of ['/nope', '/matches/m_x', '/sessions/sess_x', '/clans/c_x']) {
    const res = api.handle({ method: 'GET', path, playerId: 'p_demo' });
    assert.equal(res.status, 404);
    assert.ok(ajv.getSchema('https://eday.local/openapi#/components/schemas/Error')!(res.body));
  }
});
