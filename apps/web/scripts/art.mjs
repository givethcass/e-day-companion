// Generates the site's original artwork as SVG, from code, so every piece is reproducible and ours:
//   ruins-far / ruins-mid / ruins-near  layered skyline of a fallen neoclassical city, for parallax
//   seal        the E-Day seal: a cog ring split by a glowing fissure (our own mark, not the game's logo)
//   tex-metal / tex-cracks / tex-hazard / tex-dust   tileable textures
//   scene-*     illustrated panels behind cards (skyline, fissure, colonnade, seal, cover)
// Run: node apps/web/scripts/art.mjs   (writes apps/web/src/art/*.svg)
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '../src/art');
await mkdir(out, { recursive: true });

// Seeded PRNG so a rerun gives the same city.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;
const pts = (list) => list.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const poly = (list) => `M${pts(list).replace(/ /g, 'L')}Z`;
const svg = (w, h, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice"${extra}>${body}</svg>\n`;

// A jagged broken edge from (x0,y) to (x1,y): the top of a wall that has been shelled.
function brokenEdge(r, x0, x1, y, depth) {
  const out = [];
  const steps = Math.max(2, Math.round((x1 - x0) / 9));
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    out.push([x, y + (i === 0 || i === steps ? r() * depth * 0.3 : r() * depth)]);
  }
  return out;
}

// ---------- City layers ----------
function cityLayer({ seed, W = 2400, H = 720, ground = 720, min, max, density, color, glow, windows = true, glowRate = 0.04, near = false }) {
  const r = rng(seed);
  const solid = []; // path data in the layer colour
  const lit = []; // fire-lit windows
  let x = -40;
  while (x < W + 40) {
    const kind = r();
    const h = min + r() * (max - min);
    if (kind < 0.42) {
      // Tower with a shelled crown and punched windows.
      const w = 60 + r() * 120;
      const top = ground - h;
      const crown = brokenEdge(r, x, x + w, top, 18 + r() * 50);
      // Sometimes a whole corner is gone.
      if (r() < 0.5) {
        const cut = Math.floor(crown.length * (0.2 + r() * 0.3));
        const side = r() < 0.5;
        const drop = 40 + r() * h * 0.35;
        for (let i = 0; i < cut; i++) {
          const j = side ? i : crown.length - 1 - i;
          crown[j][1] += drop * (1 - i / cut) + r() * 6;
        }
      }
      let d = poly([[x, ground], ...crown, [x + w, ground]]);
      if (windows) {
        const cols = Math.max(2, Math.floor(w / 22));
        const rows = Math.floor((h - 40) / 30);
        const cw = w / cols;
        for (let c = 0; c < cols; c++)
          for (let k = 0; k < rows; k++) {
            if (r() < 0.25) continue;
            const wx = x + c * cw + cw * 0.3;
            const wy = top + 46 + k * 30;
            if (wy > ground - 20) continue;
            const ww = cw * 0.4, wh = 14;
            const rect = `M${f(wx)},${f(wy)}h${f(ww)}v${wh}h${f(-ww)}Z`;
            if (r() < glowRate) lit.push(rect);
            else d += rect; // even-odd hole: the sky shows through
          }
      }
      solid.push(d);
      // Exposed girders.
      if (r() < 0.55) {
        const gx = x + r() * w, gy = top + 10 + r() * 30;
        const len = 30 + r() * 60, ang = -Math.PI / 2 + (r() - 0.5) * 1.6;
        solid.push(poly([[gx - 2, gy], [gx + 2, gy], [gx + 2 + Math.cos(ang) * len, gy + Math.sin(ang) * len], [gx - 2 + Math.cos(ang) * len, gy + Math.sin(ang) * len]]));
      }
      x += w + r() * 24 * (1 / density);
    } else if (kind < 0.62) {
      // Colonnade with a broken pediment.
      const n = 5 + Math.floor(r() * 7);
      const cw = 14 + r() * 6, gap = 18 + r() * 12;
      const w = n * cw + (n - 1) * gap + 20;
      const colH = h * 0.7;
      let d = `M${f(x)},${ground}h${f(w)}v-16h${f(-w)}Z`;
      const full = [];
      for (let i = 0; i < n; i++) {
        const cx = x + 10 + i * (cw + gap);
        const intact = r() > 0.4;
        full.push(intact);
        const ch = intact ? colH : colH * (0.2 + r() * 0.6);
        const tip = brokenEdge(r, cx, cx + cw, ground - 16 - ch, intact ? 0 : 12);
        d += poly([[cx, ground - 16], ...tip, [cx + cw, ground - 16]]);
        if (intact) d += `M${f(cx - 4)},${f(ground - 16 - colH)}h${f(cw + 8)}v-8h${f(-cw - 8)}Z`;
      }
      // Entablature over runs of standing columns.
      let i = 0;
      while (i < n) {
        if (!full[i]) { i++; continue; }
        let j = i;
        while (j + 1 < n && full[j + 1]) j++;
        if (j > i) {
          const ax = x + 10 + i * (cw + gap) - 6, bx = x + 10 + j * (cw + gap) + cw + 6;
          const ey = ground - 16 - colH - 8;
          const edge = brokenEdge(r, ax, bx, ey - 26, 6);
          d += poly([[ax, ey], ...edge, [bx, ey]]);
          if (j - i >= 3 && r() < 0.7) {
            const mid = (ax + bx) / 2, ph = (bx - ax) * 0.18;
            const broken = r() < 0.6;
            d += poly(broken ? [[ax, ey - 26], [mid, ey - 26 - ph], [mid + 10, ey - 26 - ph * 0.6], [mid + 18, ey - 26 - ph * 0.75], [mid + 30, ey - 26]] : [[ax, ey - 26], [mid, ey - 26 - ph], [bx, ey - 26]]);
          }
        }
        i = j + 1;
      }
      solid.push(d);
      x += w + r() * 30;
    } else if (kind < 0.74) {
      // Domed hall with a bite out of the dome.
      const w = 140 + r() * 120;
      const drum = h * 0.45;
      const cx = x + w / 2, rx = w * 0.38, ry = rx * 0.9;
      const baseY = ground - drum;
      const dome = [];
      const bite0 = 0.15 + r() * 0.5, bite1 = bite0 + 0.18 + r() * 0.15;
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const a = Math.PI * (1 - t);
        let px = cx + Math.cos(a) * rx, py = baseY - Math.sin(a) * ry;
        if (t > bite0 && t < bite1) {
          const k = Math.sin(((t - bite0) / (bite1 - bite0)) * Math.PI);
          py += k * ry * (0.4 + r() * 0.15);
        }
        dome.push([px, py]);
      }
      let d = poly([[x, ground], [x, baseY + 10], [cx - rx - 8, baseY + 10], [cx - rx - 8, baseY], ...dome, [cx + rx + 8, baseY], [cx + rx + 8, baseY + 10], [x + w, baseY + 10], [x + w, ground]]);
      // Ribs on the surviving dome (as gaps).
      for (let k = 1; k < 6; k++) {
        const a = Math.PI * (k / 6);
        const t = 1 - a / Math.PI;
        if (t > bite0 - 0.05 && t < bite1 + 0.05) continue;
        const px = cx + Math.cos(a) * rx * 0.95, py = baseY - Math.sin(a) * ry * 0.95;
        d += `M${f(px - 1.5)},${f(py)}L${f(cx + Math.cos(a) * rx * 0.2 - 1)},${f(baseY - 4)}L${f(cx + Math.cos(a) * rx * 0.2 + 1)},${f(baseY - 4)}L${f(px + 1.5)},${f(py)}Z`;
      }
      // Arched windows in the drum.
      const nw = Math.floor(w / 34);
      for (let k = 0; k < nw; k++) {
        const wx = x + 12 + k * ((w - 24) / nw), ww = 12, wy = baseY + 30;
        const arch = `M${f(wx)},${f(wy + 40)}v-30a${ww / 2},${ww / 2} 0 0 1 ${ww},0v30Z`;
        if (r() < glowRate * 2) lit.push(arch);
        else d += arch;
      }
      solid.push(d);
      x += w + r() * 20;
    } else if (kind < 0.84) {
      // Leaning spire.
      const w = 24 + r() * 26;
      const lean = (r() - 0.5) * 60;
      solid.push(poly([[x, ground], [x + 2, ground - h * 0.8], [x + w / 2 + lean, ground - h * 1.25], [x + w - 2, ground - h * 0.8], [x + w, ground]]));
      x += w + 10 + r() * 30;
    } else {
      // A gap of rubble between buildings.
      const w = 80 + r() * 140;
      solid.push(poly([[x, ground], ...brokenEdge(r, x, x + w, ground - 20 - r() * 50, 30), [x + w, ground]]));
      x += w;
    }
  }
  if (near) {
    // Foreground debris: rubble mounds, fallen drums, rebar and a sandbag cover wall.
    const rr = rng(seed + 7);
    let gx = -20;
    while (gx < W) {
      const w = 160 + rr() * 300;
      const hh = 30 + rr() * 90;
      const top = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        top.push([gx + w * t, ground - Math.sin(t * Math.PI) * hh - rr() * 18]);
      }
      solid.push(poly([[gx, ground], ...top, [gx + w, ground]]));
      for (let k = 0; k < 4; k++) {
        const bx = gx + w * (0.2 + rr() * 0.6), by = ground - hh * 0.7;
        const a = -Math.PI / 2 + (rr() - 0.5) * 1.4, l = 30 + rr() * 50;
        solid.push(`M${f(bx)},${f(by)}L${f(bx + Math.cos(a) * l)},${f(by + Math.sin(a) * l)}L${f(bx + Math.cos(a) * l + 2.5)},${f(by + Math.sin(a) * l)}L${f(bx + 2.5)},${f(by)}Z`);
      }
      gx += w * (0.7 + rr() * 0.4);
    }
    // Cover wall of sandbags, left third.
    const wx = W * 0.08, rows = 3;
    for (let row = 0; row < rows; row++) {
      for (let k = 0; k < 9 - row; k++) {
        const bx = wx + k * 46 + row * 23, by = ground - 26 - row * 22;
        solid.push(`M${f(bx + 6)},${f(by)}h34a6,6 0 0 1 6,6v12a6,6 0 0 1 -6,6h-34a6,6 0 0 1 -6,-6v-12a6,6 0 0 1 6,-6Z`);
      }
    }
    // A fallen column drum, right.
    const cx = W * 0.82;
    solid.push(`M${f(cx)},${ground - 4}l12,-46h120l12,46Z`);
    for (let k = 0; k < 5; k++) solid.push(`M${f(cx + 22 + k * 24)},${ground - 48}v-4h10v4Z`);
  }
  const body = `<path fill="${color}" fill-rule="evenodd" d="${solid.join('')}"/>` + (lit.length ? `<path fill="${glow}" d="${lit.join('')}"/>` : '');
  return svg(W, H, body);
}

// ---------- The seal: a cog ring split by a fissure ----------
const TEETH = 12;
function cogRadius(a, Ro, Rt) {
  // Trapezoid teeth, gaps centred on top and bottom so the fissure runs through a root.
  const per = (Math.PI * 2) / TEETH;
  const p = (((a - Math.PI / 2 + per / 2) % per) + per) % per / per; // 0..1 across one tooth period, 0.5 = tooth centre
  const d = Math.abs(p - 0.5);
  if (d < 0.17) return Rt;
  if (d < 0.27) return Rt - ((d - 0.17) / 0.1) * (Rt - Ro);
  return Ro;
}
export function crackLine(seed, Ri, Ro, amp = 0.09) {
  const r = rng(seed);
  const top = [], bot = [];
  const n = 7;
  for (let i = 0; i <= n; i++) top.push([(i === 0 ? 0 : (r() - 0.5) * amp * 2 * Ro), Ro + (Ri - Ro) * (i / n)]);
  for (let i = 0; i <= n; i++) bot.push([(i === n ? 0 : (r() - 0.5) * amp * 2 * Ro), -Ri + (Ri - Ro) * (i / n)]);
  return { top, bot }; // top: outer→inner (y from Ro down to Ri); bot: inner→outer
}
function sealSVG() {
  const S = 512, c = S / 2;
  const Ro = 200, Rt = 236, Ri = 120;
  const r = rng(11);
  const { top, bot } = crackLine(5, Ri, Rt);
  // One half: outer rim from top crack to bottom crack on side s (-1 left, +1 right), crack up, inner rim back, crack up.
  const half = (s, shift) => {
    const P = [];
    for (let i = 0; i <= 180; i++) {
      const a = Math.PI / 2 + s * (Math.PI * i) / 180;
      const R = cogRadius(a, Ro, Rt);
      P.push([Math.cos(a) * R, Math.sin(a) * R]);
    }
    // P ends at bottom (0,-R). Crack bottom from outer to inner, then inner arc back to top, then crack inner→outer.
    [...bot].reverse().forEach((q) => P.push(q));
    for (let i = 180; i >= 0; i--) {
      const a = Math.PI / 2 + s * (Math.PI * i) / 180;
      P.push([Math.cos(a) * Ri, Math.sin(a) * Ri]);
    }
    [...top].reverse().forEach((q) => P.push(q));
    return `<path d="${poly(P.map(([x, y]) => [c + x - s * shift, c - y]))}"/>`;
  };
  const rivets = [];
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2 + 0.13;
    if (Math.abs(Math.cos(a)) < 0.12) continue;
    const R = (Ro + Ri) / 2 + 28;
    rivets.push(`<circle cx="${f(c + Math.cos(a) * R)}" cy="${f(c - Math.sin(a) * R)}" r="5"/>`);
  }
  const ticks = [];
  for (let k = 0; k < 60; k++) {
    const a = (k / 60) * Math.PI * 2;
    if (Math.abs(Math.cos(a)) < 0.06) continue;
    const r0 = Ri + 10, r1 = Ri + (k % 5 ? 18 : 26);
    ticks.push(`M${f(c + Math.cos(a) * r0)},${f(c - Math.sin(a) * r0)}L${f(c + Math.cos(a) * r1)},${f(c - Math.sin(a) * r1)}`);
  }
  const seg = (l) => `M${pts(l.map(([x, y]) => [c + x, c - y])).replace(/ /g, 'L')}`;
  const crackD = seg(top) + seg(bot);
  // Inner glyph: a downward fissure opening in the ground, drawn as a jagged lens.
  const lens = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    lens.push([c - 70 + 140 * t, c + 20 + Math.sin(t * Math.PI) * -16 + (i % 2 ? 5 : -3) * Math.sin(t * Math.PI)]);
  }
  for (let i = 20; i >= 0; i--) {
    const t = i / 20;
    lens.push([c - 70 + 140 * t, c + 20 + Math.sin(t * Math.PI) * 30 + (i % 2 ? -4 : 4) * Math.sin(t * Math.PI)]);
  }
  void r;
  const body = `
<defs>
  <linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b5b5f"/><stop offset=".45" stop-color="#2a2a2e"/><stop offset=".55" stop-color="#3b3b40"/><stop offset="1" stop-color="#111114"/></linearGradient>
  <radialGradient id="core" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#ffd2a0"/><stop offset=".25" stop-color="#ff6a2a"/><stop offset=".6" stop-color="#c3100f"/><stop offset="1" stop-color="#2a0000" stop-opacity="0"/></radialGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
</defs>
<circle cx="${c}" cy="${c}" r="${Ri + 4}" fill="#120203"/>
<circle cx="${c}" cy="${c + 10}" r="${Ri * 0.9}" fill="url(#core)" opacity=".85"/>
<path d="${poly(lens)}" fill="#ffb27a"/>
<path d="${poly(lens)}" fill="#ff5a1f" filter="url(#glow)"/>
<path d="${crackD}" stroke="#ff4a1a" stroke-width="16" fill="none" filter="url(#glow)" opacity=".9"/>
<path d="${crackD}" stroke="#ffd0a0" stroke-width="3" fill="none"/>
<g fill="url(#m)" stroke="#000" stroke-width="2">${half(-1, 7)}${half(1, 7)}</g>
<g fill="none" stroke="#7a7a80" stroke-opacity=".5" stroke-width="2"><circle cx="${c}" cy="${c}" r="${Ro - 12}"/><circle cx="${c}" cy="${c}" r="${Ri + 6}"/></g>
<path d="${ticks.join('')}" stroke="#c8c8cc" stroke-opacity=".55" stroke-width="2"/>
<g fill="#16161a" stroke="#8a8a90" stroke-opacity=".6" stroke-width="1.5">${rivets.join('')}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">${body}</svg>\n`;
}

// ---------- Textures ----------
const texMetal = () => {
  const r = rng(21);
  const scratches = [];
  for (let i = 0; i < 40; i++) {
    const x = r() * 240, y = r() * 240, l = 10 + r() * 40, a = -0.4 + r() * 0.2;
    scratches.push(`M${f(x)},${f(y)}l${f(Math.cos(a) * l)},${f(Math.sin(a) * l)}`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
<rect width="240" height="240" fill="#1a1a1d"/>
<path d="M0 .5H240M0 120.5H240M.5 0V240M120.5 0V240" stroke="#000" stroke-width="2"/>
<path d="M0 2.5H240M0 122.5H240M2.5 0V240M122.5 0V240" stroke="#3a3a40" stroke-width="1"/>
<g fill="#0b0b0d" stroke="#4a4a52" stroke-width="1">${[[12, 12], [108, 12], [12, 108], [108, 108], [132, 12], [228, 12], [132, 108], [228, 108], [12, 132], [108, 132], [12, 228], [108, 228], [132, 132], [228, 132], [132, 228], [228, 228]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5"/>`).join('')}</g>
<path d="${scratches.join('')}" stroke="#55555c" stroke-opacity=".35" stroke-width=".8"/>
</svg>\n`;
};
const texCracks = () => {
  const r = rng(33);
  const lines = [];
  const branch = (x, y, a, len, depth) => {
    if (depth > 4 || len < 8) return;
    let px = x, py = y;
    const segs = 3 + Math.floor(r() * 4);
    let d = `M${f(px)},${f(py)}`;
    for (let i = 0; i < segs; i++) {
      a += (r() - 0.5) * 0.9;
      px += Math.cos(a) * (len / segs);
      py += Math.sin(a) * (len / segs);
      d += `L${f(px)},${f(py)}`;
      if (r() < 0.35) branch(px, py, a + (r() < 0.5 ? 1 : -1) * (0.6 + r() * 0.6), len * 0.5, depth + 1);
    }
    lines.push(`<path d="${d}" stroke-width="${f(2.4 - depth * 0.45)}"/>`);
  };
  for (let i = 0; i < 6; i++) branch(r() * 480, r() * 480, r() * Math.PI * 2, 160 + r() * 160, 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">${lines.join('')}</g></svg>\n`;
};
const texHazard = () => `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#111"/><path d="M0 20L20 0H40L0 40ZM20 40L40 20V40Z" fill="#bf0a0a"/></svg>\n`;
const texDust = () => `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><filter id="d"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .85  0 0 0 0 .7  0 0 0 1.6 -.75"/></filter><rect width="300" height="300" filter="url(#d)"/></svg>\n`;

// ---------- Card scenes (800x450, transparent, drawn as light silhouettes over the card's own tint) ----------
function scene(kind) {
  const W = 800, H = 450, ink = '#000';
  const r = rng(kind.length * 97 + 3);
  let body = '';
  if (kind === 'skyline') {
    const layer = cityLayer({ seed: 300, W, H, ground: H, min: 120, max: 300, density: 1.2, color: ink, glow: '#ff8a3c', glowRate: 0.06 });
    body = layer.replace(/^<svg[^>]*>|<\/svg>\n$/g, '');
  } else if (kind === 'fissure') {
    const edge = [];
    for (let i = 0; i <= 30; i++) edge.push([60 + i * 23, 330 + Math.sin(i * 1.3) * 8 + r() * 10]);
    const lens = [];
    for (let i = 0; i <= 24; i++) lens.push([200 + i * 18, 362 - Math.sin((i / 24) * Math.PI) * 7 + (r() - 0.5) * 6]);
    for (let i = 24; i >= 0; i--) lens.push([200 + i * 18, 362 + Math.sin((i / 24) * Math.PI) * 16 + (r() - 0.5) * 7]);
    const core = lens.slice(0, 25).map(([x, y], i) => [x, y + 3 + Math.sin((i / 24) * Math.PI) * 4]);
    body = `<defs><radialGradient id="g" cx=".52" cy=".82" r=".6"><stop offset="0" stop-color="#ffb070" stop-opacity=".85"/><stop offset=".35" stop-color="#ff3a14" stop-opacity=".4"/><stop offset="1" stop-color="#ff3a14" stop-opacity="0"/></radialGradient><linearGradient id="s" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a3c" stop-opacity=".6"/><stop offset="1" stop-color="#ff7a3c" stop-opacity="0"/></linearGradient><filter id="b" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="10"/></filter></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<path d="M330,365L270,0H340ZM410,365L425,0H500ZM500,365L600,0H660Z" fill="url(#s)" opacity=".55"/>
<path d="${poly([[0, H], [0, 340], ...edge, [W, 330], [W, H]])}" fill="${ink}"/>
<path d="${poly(lens)}" fill="#ff4a1a" filter="url(#b)"/>
<path d="${poly(lens)}" fill="#e2410f"/>
<path d="M${pts(core).replace(/ /g, 'L')}" stroke="#ffe0bc" stroke-width="2.5" fill="none" stroke-linejoin="round"/>`;
  } else if (kind === 'colonnade') {
    const layer = cityLayer({ seed: 912, W, H, ground: H, min: 220, max: 320, density: 0.6, color: ink, glow: '#ff8a3c', windows: false });
    body = layer.replace(/^<svg[^>]*>|<\/svg>\n$/g, '');
  } else if (kind === 'seal') {
    body = `<g transform="translate(470,40) scale(.9)" opacity=".9">${sealSVG().replace(/^<svg[^>]*>|<\/svg>\n$/g, '')}</g>`;
  } else if (kind === 'cover') {
    const near = cityLayer({ seed: 77, W, H, ground: H, min: 30, max: 90, density: 1, color: ink, glow: '#ff8a3c', near: true, windows: false });
    body = `<g transform="translate(0,${H}) scale(1.6) translate(0,${-H})">${near.replace(/^<svg[^>]*>|<\/svg>\n$/g, '')}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMax slice">${body}</svg>\n`;
}

const files = {
  'ruins-far.svg': cityLayer({ seed: 1, min: 260, max: 520, density: 1.2, color: '#4a0809', glow: '#ff7a3c', glowRate: 0.015 }),
  'ruins-mid.svg': cityLayer({ seed: 2, min: 160, max: 380, density: 1, color: '#1c0304', glow: '#ff8a3c', glowRate: 0.05 }),
  'ruins-near.svg': cityLayer({ seed: 3, min: 40, max: 120, density: 1, color: '#050101', glow: '#ff8a3c', near: true, windows: false }),
  'seal.svg': sealSVG(),
  'tex-metal.svg': texMetal(),
  'tex-cracks.svg': texCracks(),
  'tex-hazard.svg': texHazard(),
  'tex-dust.svg': texDust(),
  ...Object.fromEntries(['skyline', 'fissure', 'colonnade', 'seal', 'cover'].map((k) => [`scene-${k}.svg`, scene(k)])),
};
for (const [name, data] of Object.entries(files)) await writeFile(join(out, name), data);
console.log(`${Object.keys(files).length} files in ${out}`);
