import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from './generate.mjs';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'out');
mkdirSync(outDir, { recursive: true });

const data = generate();
const hash = createHash('sha256').update(JSON.stringify(data)).digest('hex');
const counts = {};

for (const [name, value] of Object.entries(data)) {
  if (name === 'meta') continue;
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(value, null, 2));
  counts[name] = Array.isArray(value) ? value.length : 1;
}
writeFileSync(join(outDir, 'meta.json'), JSON.stringify({ ...data.meta, sha256: hash, counts }, null, 2));

console.log(`Seed ${data.meta.seed} -> ${outDir}`);
console.table(counts);
console.log(`sha256 ${hash}`);
