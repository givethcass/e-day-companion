// Checks that every color is a 6-digit hex and every text pair reaches WCAG AA.
import { tokens, contrast } from '../src/index.mjs';

let failures = 0;
const { color } = tokens;

for (const [name, value] of Object.entries(color)) {
  if (!/^#[0-9A-F]{6}$/i.test(value)) { failures++; console.log(`FAIL color.${name} is not #RRGGBB: ${value}`); }
}

for (const [fg, bg] of tokens.contrast.text) {
  const ratio = contrast(color[fg], color[bg]);
  const ok = ratio >= 4.5;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${fg} on ${bg}: ${ratio.toFixed(2)}:1`);
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
