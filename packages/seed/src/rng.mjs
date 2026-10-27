// Deterministic pseudo-random helpers (mulberry32). Same seed, same data, every run.

export function createRng(seed) {
  let a = seed >>> 0;
  const float = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min, max) => min + Math.floor(float() * (max - min + 1));
  const pick = (list) => list[Math.floor(float() * list.length)];
  const chance = (p) => float() < p;

  // pairs: [[value, weight], ...]
  const weighted = (pairs) => {
    const total = pairs.reduce((sum, [, w]) => sum + w, 0);
    let roll = float() * total;
    for (const [value, w] of pairs) {
      roll -= w;
      if (roll < 0) return value;
    }
    return pairs[pairs.length - 1][0];
  };

  // Box-Muller
  const normal = (mean = 0, sd = 1) => {
    const u = 1 - float();
    const v = float();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const shuffle = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(float() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const sample = (list, n) => shuffle(list).slice(0, n);

  return { float, int, pick, chance, weighted, normal, shuffle, sample };
}

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
