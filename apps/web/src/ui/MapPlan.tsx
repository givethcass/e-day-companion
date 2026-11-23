// Top-down plan of a Versus map for the website. Same drawing as the app: walls in dark grey, callouts as
// labelled blocks, power weapons as gold diamonds; the heat views fill each callout by your kills (red) or
// deaths (blue) with the number under the name. Hover lifts a callout, click or Enter selects it, and the fill
// eases between views so switching reads as the same map changing.
import type { VersusMap } from '@eday/api-types';
import { useState } from 'react';
import { num } from '../lib/format';
import { SERIES } from './charts';

export type PlanView = 'plan' | 'kills' | 'deaths';
export const HEAT = { kills: SERIES[0], deaths: SERIES[1] };
const GOLD = SERIES[2];

const wrap = (name: string, width: number, fs: number) => {
  const fits = (t: string) => t.length * fs * 0.52 <= width - 2;
  if (fits(name)) return [name];
  const out: string[] = [];
  for (const word of name.split(' ')) {
    const last = out.at(-1);
    if (last && fits(`${last} ${word}`)) out[out.length - 1] = `${last} ${word}`;
    else out.push(word);
  }
  return out;
};

export function MapPlan({ map, view = 'plan', selected, onSelect, labels = true, className = '' }: {
  map: VersusMap; view?: PlanView; selected?: string | null; onSelect?: (zoneId: string) => void; labels?: boolean; className?: string;
}) {
  const [hot, setHot] = useState<string | null>(null);
  const { width: W, height: H } = map.plan;
  const values = new Map(map.stats.zones.map((z) => [z.zoneId, view === 'deaths' ? z.deaths : z.kills]));
  const max = Math.max(1, ...values.values());
  const fs = 2.5;
  const heat = view !== 'plan';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block w-full bg-[#070707] border border-line ${className}`} role="group" aria-label={`Plano de ${map.name}`}>
      <defs>
        <pattern id={`grid-${map.id}`} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="#141414" strokeWidth="0.2" /></pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#grid-${map.id})`} />
      {map.blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#1D1D1D" />)}
      {map.zones.map((z) => {
        const v = values.get(z.id) ?? 0;
        const fill = heat ? HEAT[view as 'kills' | 'deaths'] : z.kind === 'spawn' ? (z.team === 'COG' ? SERIES[1] : SERIES[0]) : '#FFFFFF';
        const opacity = heat ? 0.1 + 0.7 * (v / max) : z.kind === 'spawn' ? 0.18 : z.kind === 'power' || z.kind === 'high' ? 0.08 : 0.04;
        const on = selected === z.id, lit = hot === z.id;
        const lines = labels ? wrap(z.name, z.w, fs) : [];
        const block = lines.length * fs * 1.05 + (heat ? fs * 1.3 : 0);
        const top = z.y + z.h / 2 - block / 2 + fs * 0.85;
        return (
          <g key={z.id} className={onSelect ? 'cursor-pointer outline-none' : ''} tabIndex={onSelect ? 0 : undefined} role={onSelect ? 'button' : undefined}
            aria-pressed={onSelect ? on : undefined} aria-label={`${z.name}${heat ? `: ${num(v)} ${view === 'kills' ? 'bajas' : 'caídas'}` : ''}`}
            onClick={() => onSelect?.(z.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(z.id); } }}
            onMouseEnter={() => setHot(z.id)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(z.id)} onBlur={() => setHot(null)}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={fill} fillOpacity={lit ? Math.min(0.95, opacity + 0.15) : opacity}
              stroke={on ? '#FFFFFF' : lit ? '#8A8A8A' : '#3A3A3A'} strokeWidth={on ? 0.6 : 0.3} strokeDasharray={z.kind === 'spawn' ? '1.2 0.8' : undefined}
              style={{ transition: 'fill-opacity .5s cubic-bezier(.2,.7,.2,1), fill .5s, stroke .2s' }} />
            {lines.map((t, i) => (
              <text key={t} x={z.x + z.w / 2} y={top + i * fs * 1.05} fontSize={fs} textAnchor="middle" fill="#FFFFFF"
                className="font-display font-semibold uppercase tracking-[0.04em] pointer-events-none" fillOpacity={on || lit || !selected ? 1 : 0.7}>{t}</text>
            ))}
            {labels && heat && (
              <text x={z.x + z.w / 2} y={top + lines.length * fs * 1.05 + 0.4} fontSize={fs * 1.2} textAnchor="middle" fill="#FFFFFF"
                className="font-display font-bold pointer-events-none" style={{ fontVariantNumeric: 'tabular-nums' }}>{num(v)}</text>
            )}
          </g>
        );
      })}
      {map.pickups.map((k) => {
        const z = map.zones.find((x) => x.id === k.zoneId)!;
        const cx = z.x + z.w - 2.4, cy = z.y + 2.4;
        return (
          <path key={k.weaponId} d={`M${cx} ${cy - 1.6}L${cx + 1.6} ${cy}L${cx} ${cy + 1.6}L${cx - 1.6} ${cy}Z`} fill={GOLD} className="pointer-events-none">
            <title>{`${k.weapon} · cada ${k.respawnSeconds} s`}</title>
          </path>
        );
      })}
    </svg>
  );
}
