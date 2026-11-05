// Charts for Mi servicio, drawn with react-native-svg so they look the same on phone, tablet and web.
// Colours: a categorical set checked for colour-blind separation on the dark surface (validate_palette, all
// adjacent pairs pass), red first to match the brand. Every chart also names its parts in text, so colour never
// carries meaning alone. Tapping a slice, block or column shows its value.
import type { Slice } from '@eday/api-types';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { number } from '@/lib/demo';
import { Text } from './kit';
import { color } from './theme';

export const SERIES = ['#E03A2F', '#3987E5', '#C98500', '#199E70', '#9085E9', '#D55181'];
/** The folded «Otras» part: de-emphasis grey, always last. */
export const OTHER = '#4A4848';
export const MODE_COLOR = { versus: SERIES[0], horde: SERIES[2], campaign: SERIES[1] };

const isOther = (label: string) => /^Otr[ao]s/.test(label);
/** Colours follow the part, not its rank: «Otras» is always grey. */
export const colorsFor = (slices: Slice[]) => {
  let i = 0;
  return slices.map((s) => (isOther(s.label) ? OTHER : SERIES[i++ % SERIES.length]));
};
const share = (v: number, total: number) => `${Math.round((v / Math.max(1, total)) * 100)}%`;

const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
/** One ring segment from angle a0 to a1 (radians, clockwise from 12 o'clock). */
const arc = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) => {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0), [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1), [x3, y3] = polar(cx, cy, r0, a0);
  return `M${x0} ${y0}A${r1} ${r1} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${large} 0 ${x3} ${y3}Z`;
};

/**
 * A ring split into parts, with the total (or the tapped part) in the middle and a legend beside it that lists
 * every part with its value and share. Up to six parts; the API already folds the rest into «Otras».
 */
export function Donut({ slices, colors = colorsFor(slices), size = 132, unit, center }: {
  slices: Slice[]; colors?: string[]; size?: number; unit: string; center?: string;
}) {
  const [hot, setHot] = useState<number | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r1 = size / 2, r0 = r1 - 18, gap = 2 / r1;
  let a = 0;
  const arcs = slices.map((s, i) => {
    const sweep = (s.value / Math.max(1, total)) * Math.PI * 2;
    const from = a + (sweep > gap * 2 ? gap / 2 : 0), to = a + sweep - (sweep > gap * 2 ? gap / 2 : 0);
    a += sweep;
    return { i, d: sweep >= Math.PI * 2 - 1e-6 ? null : arc(r1, r1, hot === i ? r0 - 2 : r0, hot === i ? r1 : r1 - 2, from, to) };
  });
  const focus = hot === null ? null : slices[hot];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ width: size, height: size }} accessibilityLabel={slices.map((s) => `${s.label} ${number(s.value)}`).join(', ')}>
        <Svg width={size} height={size}>
          {arcs.map(({ i, d }) => (d
            ? <Path key={i} d={d} fill={colors[i]} opacity={hot === null || hot === i ? 1 : 0.35} onPress={() => setHot(hot === i ? null : i)} />
            : <Circle key={i} cx={r1} cy={r1} r={r0 + 8} stroke={colors[i]} strokeWidth={16} fill="none" />))}
        </Svg>
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 }}>
          <Text variant="stat" style={{ fontSize: 22, lineHeight: 24 }} numberOfLines={1} adjustsFontSizeToFit>{focus ? share(focus.value, total) : center ?? number(total)}</Text>
          <Text variant="caption" tone="textSubtle" style={{ fontSize: 11, textAlign: 'center' }} numberOfLines={2}>{focus ? focus.label : unit}</Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        {slices.map((s, i) => (
          <Pressable key={s.label} onPress={() => setHot(hot === i ? null : i)} accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: hot === null || hot === i ? 1 : 0.5 }}>
            <View style={{ width: 10, height: 10, backgroundColor: colors[i] }} />
            <Text variant="caption" style={{ flex: 1 }} numberOfLines={1}>{s.label}</Text>
            <Text variant="data" style={{ fontSize: 13 }}>{number(s.value)}</Text>
            <Text variant="data" tone="textSubtle" style={{ fontSize: 13, width: 36, textAlign: 'right' }}>{share(s.value, total)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** One whole split into a few parts, as a tall bar with each share printed on its block, and a legend of names. */
export function SplitBar({ parts, colors = colorsFor(parts) }: { parts: Slice[]; colors?: string[] }) {
  const [w, setW] = useState(0);
  const total = parts.reduce((s, x) => s + x.value, 0);
  const shown = parts.map((p, i) => ({ ...p, i })).filter((p) => p.value > 0);
  return (
    <View style={{ gap: 8 }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', height: 28, gap: 2 }}
        accessibilityLabel={parts.map((p) => `${p.label} ${share(p.value, total)}`).join(', ')}>
        {shown.map((p) => {
          const width = (p.value / Math.max(1, total)) * (w - 2 * (shown.length - 1));
          // Near-black text clears 4.5:1 on every series colour; only the grey «Otras» takes white.
          const dark = colors[p.i] !== OTHER;
          return (
            <View key={p.label} style={{ width, backgroundColor: colors[p.i], borderRadius: 4, justifyContent: 'center', paddingHorizontal: 6 }}>
              {width > 40 && <Text variant="data" style={{ fontSize: 13, color: dark ? '#0B0B0B' : '#FFFFFF' }} numberOfLines={1}>{share(p.value, total)}</Text>}
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4 }}>
        {parts.map((p, i) => (
          <View key={p.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, backgroundColor: colors[i] }} />
            <Text variant="caption" tone="textMuted">{`${p.label} · ${number(p.value)}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Ranked horizontal bars on one baseline, value at the tip; one colour, since the parts are compared, not identified. */
export function RankBars({ items, fill = color.primary, format = (x) => number(x), max }: {
  items: { label: string; value: number; note?: string }[]; fill?: string; format?: (x: number) => string; max?: number;
}) {
  const top = max ?? Math.max(1, ...items.map((x) => x.value));
  return (
    <View style={{ gap: 10 }}>
      {items.map((x) => (
        <View key={x.label} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text variant="caption" numberOfLines={1} style={{ flex: 1 }}>{x.label}</Text>
            <Text variant="data" style={{ fontSize: 13 }}>{format(x.value)}{x.note ? <Text variant="data" tone="textSubtle" style={{ fontSize: 13 }}>{`  ${x.note}`}</Text> : null}</Text>
          </View>
          <View style={{ height: 10, backgroundColor: color.disabled, borderRadius: 2 }}>
            <View style={{ height: 10, width: `${Math.min(100, (x.value / top) * 100)}%`, backgroundColor: fill, borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Columns along a short axis (hours of the day, days of the week); the busiest one is labelled and tapping shows any. */
export function ColumnStrip({ values, labels, ticks, height = 84, name }: {
  values: number[]; labels: string[]; ticks: number[]; height?: number; name: (i: number) => string;
}) {
  const [w, setW] = useState(0);
  const top = Math.max(1, ...values);
  const peak = values.indexOf(top);
  const [hot, setHot] = useState<number>(peak);
  const step = w / values.length;
  const bar = Math.min(24, Math.max(4, step - 3));
  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption" tone="textMuted">{`${name(hot)}: `}<Text variant="data" style={{ fontSize: 14 }}>{`${values[hot]} ${values[hot] === 1 ? 'partida' : 'partidas'}`}</Text></Text>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }}>
        {w > 0 && (
          <Svg width={w} height={height}>
            <Rect x={0} y={height - 1} width={w} height={1} fill={color.border} />
            {values.map((v, i) => {
              const h = v ? Math.max(3, (v / top) * (height - 6)) : 0;
              return (
                <Rect key={i} x={i * step + (step - bar) / 2} y={height - 1 - h} width={bar} height={h} rx={2}
                  fill={i === hot ? color.primary : '#7A2A24'} onPress={() => setHot(i)} />
              );
            })}
            {values.map((_, i) => <Rect key={`hit${i}`} x={i * step} y={0} width={step} height={height} fill="transparent" onPress={() => setHot(i)} />)}
          </Svg>
        )}
      </View>
      <View style={{ height: 14 }}>
        {w > 0 && ticks.map((i) => (
          <Text key={i} variant="caption" tone="textSubtle" style={{ position: 'absolute', left: i * step + step / 2 - 14, width: 28, textAlign: 'center', fontSize: 11 }}>{labels[i]}</Text>
        ))}
      </View>
    </View>
  );
}

/** A single ratio against its limit, as a ring: chapters finished, waves reached. */
export function Meter({ value, goal, size = 88, label }: { value: number; goal: number; size?: number; label: string }) {
  const r = size / 2 - 6, c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${label}: ${value} de ${goal}`}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color.disabled} strokeWidth={8} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color.primary} strokeWidth={8} fill="none" strokeDasharray={`${c}`} strokeDashoffset={c * (1 - Math.min(1, value / goal))} strokeLinecap="round" />
      </Svg>
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="stat" style={{ fontSize: 20, lineHeight: 22 }}>{`${value}/${goal}`}</Text>
        <Text variant="caption" tone="textSubtle" style={{ fontSize: 10 }}>{label}</Text>
      </View>
    </View>
  );
}
