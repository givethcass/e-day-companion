// Checks that the contract is valid OpenAPI, the seed is deterministic, every generated
// record matches its contract schema, and the demo story holds.
import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import { generate } from '../src/generate.mjs';
import { DAY, RANKED_START, DEMO_NOW, PLAYTIME_BUCKETS } from '../src/constants.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const contractPath = join(root, 'contract', 'openapi.yaml');
let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    failures++;
    console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`);
  }
};

// 1. Contract
await SwaggerParser.validate(contractPath);
console.log('ok   contract is valid OpenAPI');

// 2. Determinism
const sha = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const data = generate();
check('same seed gives the same data', () => assert.equal(sha(data), sha(generate())));
check('a different seed gives different data', () => assert.notEqual(sha(data), sha(generate({ seed: 7 }))));

// 3. Records match the contract schemas
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
const contract = parse(readFileSync(contractPath, 'utf8'));
ajv.addSchema({ $id: 'https://eday.local/openapi', components: contract.components });
const schema = (name) => ajv.getSchema(`https://eday.local/openapi#/components/schemas/${name}`);

const validateAll = (name, schemaName, records) => check(`${records.length} ${name} match ${schemaName}`, () => {
  const validate = schema(schemaName);
  for (const r of records) {
    if (!validate(r)) throw new Error(`${r.id ?? JSON.stringify(r).slice(0, 60)}: ${ajv.errorsText(validate.errors)}`);
  }
});

const itemsById = new Map(data.storeItems.map((i) => [i.id, i]));
const challengeById = new Map(data.challenges.map((c) => [c.id, c]));
validateAll('players', 'Player', data.players);
validateAll('matches', 'MatchReport', data.matches);
validateAll('seasons', 'Season', [data.season]);
validateAll('events', 'Event', data.events);
validateAll('store items', 'StoreItem', data.storeItems.map((i) => ({ ...i, wishlisted: false })));
validateAll('store rotations', 'StoreRotation', data.storeRotations.map((r) => ({ ...r, items: r.itemIds.map((id) => itemsById.get(id)) })));
validateAll('squad sessions', 'SquadSession', data.sessions);
validateAll('clans', 'Clan', data.clans);
validateAll('wallets', 'Wallet', data.wallets);
validateAll('news articles', 'NewsArticle', data.news);
validateAll('challenge progress rows', 'Challenge', data.challengeProgress.map((p) => ({ ...challengeById.get(p.challengeId), progress: p.progress })));

// 4. The demo story
const demoMatches = data.matches.filter((m) => m.playerId === 'p_demo');
check('Delta_Rojo is a veteran: 90+ hours by the demo date and played last night', () => {
  const before = demoMatches.filter((m) => m.endedAt <= DEMO_NOW);
  const hours = before.reduce((s, m) => s + m.durationSeconds, 0) / 3600;
  assert.ok(hours >= 90, `only ${hours.toFixed(1)} hours`);
  assert.ok(Date.parse(DEMO_NOW) - Date.parse(before.at(-1).endedAt) < DAY, 'did not play in the last day');
});
check('Delta_Rojo has a Versus K/D around 3 and is ranked Onyx', () => {
  const versus = demoMatches.filter((m) => m.mode.startsWith('versus') && m.endedAt <= DEMO_NOW);
  const kd = versus.reduce((s, m) => s + m.kills, 0) / versus.reduce((s, m) => s + m.deaths, 0);
  assert.ok(kd > 2.8 && kd < 3.6, `K/D ${kd.toFixed(2)}`);
  assert.equal(data.players.find((p) => p.id === 'p_demo').rank?.tier, 'onyx');
});
check('Friday Horde Siege has 9 of 12, Delta_Rojo in squad 2', () => {
  const friday = data.sessions.find((s) => s.id === 'sess_friday');
  assert.equal(friday.members.length, 9);
  assert.ok(friday.members.some((m) => m.gamertag === 'Delta_Rojo' && m.squad === 2));
});
check('a Spanish, no-mic Horde Siege with open slots starts tonight', () => {
  const tonight = data.sessions.find((s) => s.id === 'sess_tonight');
  assert.equal(tonight.language, 'es');
  assert.equal(tonight.micRequired, false);
  assert.ok(tonight.members.length < tonight.slots);
  assert.ok(Date.parse(tonight.startsAt) - Date.parse(DEMO_NOW) < 12 * 3600e3);
});
check("Delta_Rojo's coins buy some coin items but not all", () => {
  const wallet = data.wallets.find((w) => w.playerId === 'p_demo');
  const current = data.storeRotations.find((r) => r.startsAt <= DEMO_NOW && DEMO_NOW < r.endsAt);
  const coinPrices = current.itemIds.map((id) => itemsById.get(id).price).filter((p) => p.currency === 'coins').map((p) => p.amount);
  assert.ok(coinPrices.some((a) => a <= wallet.coins), 'nothing affordable');
  assert.ok(coinPrices.some((a) => a > wallet.coins), 'everything affordable');
});
check('one wishlist item is on sale now and the other arrives next rotation', () => {
  const current = data.storeRotations.find((r) => r.startsAt <= DEMO_NOW && DEMO_NOW < r.endsAt);
  const [onSale, upcoming] = data.wishlists.map((w) => w.itemId);
  assert.ok(current.itemIds.includes(onSale));
  assert.ok(!current.itemIds.includes(upcoming));
});

// 5. Playtime mix follows the Alinea buckets (within 6 points)
const hours = new Map();
for (const m of data.matches) hours.set(m.playerId, (hours.get(m.playerId) ?? 0) + m.durationSeconds / 3600);
for (const platform of ['xbox', 'pc']) {
  const ps = data.players.filter((p) => p.platform === platform && !['p_demo', 'p_capi', 'p_marla'].includes(p.id));
  const share = (lo, hi) => ps.filter((p) => { const h = hours.get(p.id) ?? 0; return h >= lo && h < hi; }).length / ps.length;
  check(`${platform}: share with 5 hours or less is close to the estimate`, () => {
    const expected = PLAYTIME_BUCKETS[platform].filter(([, hi]) => hi <= 5).reduce((s, b) => s + b[2], 0);
    const actual = share(0, 5);
    assert.ok(Math.abs(actual - expected) < 0.06, `expected ~${expected.toFixed(2)}, got ${actual.toFixed(2)}`);
  });
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
