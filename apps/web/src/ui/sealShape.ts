// The E-Day seal's outline in 2D, shared by the 3D hero: a 12-tooth cog ring split top to bottom by a jagged fissure.
// Same construction as scripts/art.mjs (seal.svg), so the flat mark and the 3D one match.
const TEETH = 12;

export function cogRadius(a: number, Ro: number, Rt: number) {
  const per = (Math.PI * 2) / TEETH;
  const p = ((((a - Math.PI / 2 + per / 2) % per) + per) % per) / per;
  const d = Math.abs(p - 0.5);
  if (d < 0.17) return Rt;
  if (d < 0.27) return Rt - ((d - 0.17) / 0.1) * (Rt - Ro);
  return Ro;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The fissure: top runs outer→inner, bottom runs inner→outer. */
export function crack(Ri: number, Ro: number, seed = 5, amp = 0.09) {
  const r = rng(seed);
  const n = 7;
  const top: [number, number][] = [];
  const bot: [number, number][] = [];
  for (let i = 0; i <= n; i++) top.push([i === 0 ? 0 : (r() - 0.5) * amp * 2 * Ro, Ro + (Ri - Ro) * (i / n)]);
  for (let i = 0; i <= n; i++) bot.push([i === n ? 0 : (r() - 0.5) * amp * 2 * Ro, -Ri + (Ri - Ro) * (i / n)]);
  return { top, bot };
}

/** One half of the ring as a closed polygon. side = 1 is the right half, -1 the left. */
export function sealHalf(side: 1 | -1, Ri = 1.2, Ro = 2, Rt = 2.36): [number, number][] {
  const { top, bot } = crack(Ri, Rt);
  const s = -side;
  const P: [number, number][] = [];
  for (let i = 0; i <= 180; i++) {
    const a = Math.PI / 2 + (s * Math.PI * i) / 180;
    const R = cogRadius(a, Ro, Rt);
    P.push([Math.cos(a) * R, Math.sin(a) * R]);
  }
  [...bot].reverse().forEach((q) => P.push(q));
  for (let i = 180; i >= 0; i--) {
    const a = Math.PI / 2 + (s * Math.PI * i) / 180;
    P.push([Math.cos(a) * Ri, Math.sin(a) * Ri]);
  }
  [...top].reverse().forEach((q) => P.push(q));
  return P;
}
