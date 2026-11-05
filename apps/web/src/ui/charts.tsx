// Charts for Mi servicio on desktop: SVG, drawn in when they scroll into view, with hover and keyboard focus on
// every part. Same validated categorical set as the app (apps/mobile/src/ui/Charts.tsx); every chart names its
// parts in text, so colour never carries meaning alone.
import type { Slice } from '@eday/api-types';
import { useState, type ReactNode } from 'react';
import { num } from '../lib/format';
import { useSeen } from './fx';

export const SERIES = ['#E03A2F', '#3987E5', '#C98500', '#199E70', '#9085E9', '#D55181'];
export const OTHER = '#4A4848';
export const MODE_COLOR = { versus: SERIES[0], horde: SERIES[2], campaign: SERIES[1] };
export const ROLE_COLOR: Record<string, string> = { assault: SERIES[0], breacher: SERIES[1], marksman: SERIES[2], medic: SERIES[3] };

const isOther = (label: string) => /^Otr[ao]s/.test(label);
export const colorsFor = (slices: Slice[]) => {
  let i = 0;
  return slices.map((s) => (isOther(s.label) ? OTHER : SERIES[i++ % SERIES.length]));
};
const pctOf = (v: number, total: number) => Math.round((v / Math.max(1, total)) * 100);
// Yellow is the one fill that needs dark text on it.
const inkOn = (fill: string) => (fill === SERIES[2] ? '#0B0B0B' : '#FFFFFF');

export function ChartCard({ title, note, children, className = '' }: { title: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border border-line bg-surface p-7 flex flex-col gap-5 ${className}`}>
      <div>
        <div className="eyebrow text-muted">{title}</div>
        {note && <div className="text-sm text-subtle mt-1">{note}</div>}
      </div>
      {children}
    </div>
  );
}

/** A ring split into parts. Hovering a part or its legend row lifts it and puts its share in the middle. */
export function Donut({ slices, colors = colorsFor(slices), unit, center, size = 196, format = num, stack = false }: {
  slices: Slice[]; colors?: string[]; unit: string; center?: string; size?: number; format?: (n: number) => string; stack?: boolean;
}) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [hot, setHot] = useState<number | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - 14, c = 2 * Math.PI * r, gap = 2;
  let at = 0;
  const parts = slices.map((s, i) => {
    const len = (s.value / Math.max(1, total)) * c;
    const part = { i, start: at, len: Math.max(0, len - (slices.length > 1 ? gap : 0)) };
    at += len;
    return part;
  });
  const focus = hot === null ? null : slices[hot];
  return (
    <div ref={ref} className={stack ? 'flex flex-col items-center gap-6' : 'flex items-center gap-7'}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={slices.map((s) => `${s.label} ${num(s.value)}`).join(', ')}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth={20} />
          {parts.map(({ i, start, len }) => (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors[i]}
              strokeWidth={hot === i ? 28 : 20} strokeDasharray={`${seen ? len : 0} ${c}`} strokeDashoffset={-start}
              opacity={hot === null || hot === i ? 1 : 0.35} tabIndex={0} aria-label={`${slices[i].label}: ${format(slices[i].value)}`}
              onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(i)} onBlur={() => setHot(null)}
              className="cursor-pointer outline-none"
              style={{ transition: `stroke-dasharray 1.1s cubic-bezier(.2,.7,.2,1) ${i * 90}ms, stroke-width .2s, opacity .2s` }} />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center px-8">
          <div>
            <div className="display text-4xl normal-case">{focus ? `${pctOf(focus.value, total)}%` : center ?? num(total)}</div>
            <div className="text-xs text-subtle mt-1 leading-tight">{focus ? focus.label : unit}</div>
          </div>
        </div>
      </div>
      <ul className={`min-w-0 flex flex-col gap-1.5 ${stack ? 'self-stretch' : 'flex-1'}`}>
        {slices.map((s, i) => (
          <li key={s.label} onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}
            className={`flex items-center gap-3 px-2 py-1.5 -mx-2 transition-[opacity,background] ${hot === i ? 'bg-white/5' : ''} ${hot === null || hot === i ? '' : 'opacity-50'}`}>
            <span className="size-2.5 shrink-0" style={{ background: colors[i] }} />
            <span className="flex-1 min-w-0 truncate text-sm">{s.label}</span>
            <span className="text-sm tabular-nums">{format(s.value)}</span>
            <span className="text-sm tabular-nums text-subtle w-10 text-right">{pctOf(s.value, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One whole in a few parts: a tall bar with the share on each block, grown in from the left, names in the legend. */
export function SplitBar({ parts, colors = colorsFor(parts) }: { parts: Slice[]; colors?: string[] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [hot, setHot] = useState<number | null>(null);
  const total = parts.reduce((s, x) => s + x.value, 0);
  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className="flex gap-[2px] h-7" role="img" aria-label={parts.map((p) => `${p.label} ${pctOf(p.value, total)}%`).join(', ')}>
        {parts.map((p, i) => p.value > 0 && (
          <div key={p.label} tabIndex={0} onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(i)} onBlur={() => setHot(null)}
            className="relative rounded-[4px] flex items-center px-2 text-[13px] font-semibold overflow-visible outline-none transition-[flex-grow,filter] duration-[1100ms] ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{ flexGrow: seen ? p.value : 0, flexBasis: 0, minWidth: seen ? 4 : 0, background: colors[i], color: inkOn(colors[i]), filter: hot === i ? 'brightness(1.2)' : undefined, transitionDelay: `${i * 80}ms` }}>
            {p.value / Math.max(1, total) > 0.07 && <span className="whitespace-nowrap">{pctOf(p.value, total)}%</span>}
            {hot === i && (
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 whitespace-nowrap bg-raised border border-line px-3 py-2 text-ink font-normal shadow-[0_10px_30px_rgb(0_0_0/0.6)]">
                <b className="font-semibold">{num(p.value)}</b> <span className="text-subtle">{p.label} · {pctOf(p.value, total)}%</span>
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        {parts.map((p, i) => <span key={p.label} className="flex items-center gap-2"><span className="size-2.5" style={{ background: colors[i] }} />{p.label} · {num(p.value)}</span>)}
      </div>
    </div>
  );
}

/** Ranked bars on one baseline, value at the tip, one colour. */
export function RankBars({ items, max, format = num, fill = 'var(--color-primary)' }: {
  items: { label: string; value: number; note?: string }[]; max?: number; format?: (n: number) => string; fill?: string;
}) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const top = max ?? Math.max(1, ...items.map((x) => x.value));
  return (
    <div ref={ref} className="flex flex-col gap-3.5">
      {items.map((x, i) => (
        <div key={x.label} className="group">
          <div className="flex justify-between gap-4 text-sm mb-1.5">
            <span className="truncate group-hover:text-primary transition-colors">{x.label}</span>
            <span className="tabular-nums shrink-0">{format(x.value)}{x.note && <span className="text-subtle"> · {x.note}</span>}</span>
          </div>
          <div className="h-2.5 bg-white/8 rounded-[2px]">
            <div className="h-full rounded-r-[4px] origin-left transition-transform duration-[1100ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:brightness-125"
              style={{ background: fill, width: `${Math.min(100, (x.value / top) * 100)}%`, transform: `scaleX(${seen ? 1 : 0})`, transitionDelay: `${i * 70}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Columns along a short axis; the busiest is in the accent, the rest a darker red, and hovering any shows its value. */
export function Columns({ values, labels, ticks, name, height = 160 }: {
  values: number[]; labels: string[]; ticks: number[]; name: (i: number) => string; height?: number;
}) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const top = Math.max(1, ...values);
  const peak = values.indexOf(top);
  const [hot, setHot] = useState<number | null>(null);
  const shown = hot ?? peak;
  return (
    <div ref={ref}>
      <div className="text-sm text-muted mb-3 h-5">{name(shown)}: <b className="text-ink font-semibold">{values[shown]} {values[shown] === 1 ? 'partida' : 'partidas'}</b></div>
      <div className="flex items-end gap-[3px] border-b border-line" style={{ height }} onMouseLeave={() => setHot(null)}>
        {values.map((v, i) => (
          <button key={i} onMouseEnter={() => setHot(i)} onFocus={() => setHot(i)} aria-label={`${name(i)}: ${v}`}
            className="flex-1 h-full flex items-end justify-center outline-none group">
            <span className="w-full max-w-6 rounded-t-[4px] origin-bottom transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
              style={{ height: `${v ? Math.max(2, (v / top) * 100) : 0}%`, transform: `scaleY(${seen ? 1 : 0})`, transitionDelay: `${i * 25}ms`,
                background: i === shown ? 'var(--color-primary)' : '#7A2A24' }} />
          </button>
        ))}
      </div>
      <div className="relative h-5 mt-1.5 text-xs text-subtle">
        {ticks.map((i) => <span key={i} className="absolute -translate-x-1/2" style={{ left: `${((i + 0.5) / values.length) * 100}%` }}>{labels[i]}</span>)}
      </div>
    </div>
  );
}
