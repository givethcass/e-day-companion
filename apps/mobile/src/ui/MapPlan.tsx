// Top-down plan of a Versus map: walls in dark grey, every callout as a labelled block, power weapons as gold
// diamonds. In the heat views each callout fills by how many of your kills (red) or deaths (blue) happened there,
// with the number under its name, so colour is never the only cue. Tapping a callout selects it.
import type { VersusMap } from '@eday/api-types';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { number } from '@/lib/demo';
import { SERIES } from './Charts';
import { color, fontFamily } from './theme';

export type PlanView = 'plan' | 'kills' | 'deaths';
export const HEAT = { kills: SERIES[0], deaths: SERIES[1] };
const GOLD = SERIES[2];

/** Splits a callout name into lines that fit its block. */
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

export function MapPlan({ map, view = 'plan', selected, onSelect, labels = true, width }: {
  map: VersusMap; view?: PlanView; selected?: string | null; onSelect?: (zoneId: string) => void; labels?: boolean; width?: number;
}) {
  const { width: W, height: H } = map.plan;
  const values = new Map(map.stats.zones.map((z) => [z.zoneId, view === 'deaths' ? z.deaths : z.kills]));
  const max = Math.max(1, ...values.values());
  const fs = 2.7;
  const grid = Array.from({ length: Math.floor(W / 10) - 1 }, (_, i) => (i + 1) * 10);
  return (
    <View style={{ width: width ?? '100%', aspectRatio: W / H, backgroundColor: '#070707', borderWidth: 1, borderColor: color.border }}
      accessibilityRole="image" accessibilityLabel={`Plano de ${map.name} con ${map.zones.length} callouts`}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {grid.map((x) => <Line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#151515" strokeWidth={0.2} />)}
        {grid.filter((y) => y < H).map((y) => <Line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#151515" strokeWidth={0.2} />)}
        {map.blocks.map((b, i) => <Rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#1E1E1E" />)}
        {map.zones.map((z) => {
          const v = values.get(z.id) ?? 0;
          const heat = view !== 'plan';
          const fill = heat ? HEAT[view as 'kills' | 'deaths'] : z.kind === 'spawn' ? (z.team === 'COG' ? SERIES[1] : SERIES[0]) : '#FFFFFF';
          const opacity = heat ? 0.1 + 0.7 * (v / max) : z.kind === 'spawn' ? 0.18 : z.kind === 'power' || z.kind === 'high' ? 0.08 : 0.04;
          const on = selected === z.id;
          const lines = labels ? wrap(z.name, z.w, fs) : [];
          const block = lines.length * fs * 1.05 + (heat ? fs * 1.3 : 0);
          const top = z.y + z.h / 2 - block / 2 + fs * 0.85;
          return (
            <G key={z.id}>
              <Rect x={z.x} y={z.y} width={z.w} height={z.h} fill={fill} fillOpacity={opacity}
                stroke={on ? '#FFFFFF' : '#3A3A3A'} strokeWidth={on ? 0.6 : 0.3} strokeDasharray={z.kind === 'spawn' ? '1.2 0.8' : undefined} />
              {lines.map((t, i) => (
                <SvgText key={t} x={z.x + z.w / 2} y={top + i * fs * 1.05} fontSize={fs} fontFamily={fontFamily.labelStrong} fill="#FFFFFF"
                  fillOpacity={on || !selected ? 1 : 0.7} textAnchor="middle">{t.toUpperCase()}</SvgText>
              ))}
              {labels && heat && (
                <SvgText x={z.x + z.w / 2} y={top + lines.length * fs * 1.05 + 0.4} fontSize={fs * 1.15} fontFamily={fontFamily.labelBold} fill="#FFFFFF" textAnchor="middle">{number(v)}</SvgText>
              )}
            </G>
          );
        })}
        {map.pickups.map((k) => {
          const z = map.zones.find((x) => x.id === k.zoneId)!;
          const cx = z.x + z.w - 2.4, cy = z.y + 2.4;
          return <Path key={k.weaponId} d={`M${cx} ${cy - 1.6}L${cx + 1.6} ${cy}L${cx} ${cy + 1.6}L${cx - 1.6} ${cy}Z`} fill={GOLD} />;
        })}
      </Svg>
      {onSelect && (
        <View style={StyleSheet.absoluteFill}>
          {map.zones.map((z) => (
            <Pressable key={z.id} accessibilityRole="button" accessibilityLabel={z.name} accessibilityState={{ selected: selected === z.id }}
              onPress={() => onSelect(z.id)}
              style={{ position: 'absolute', left: `${(z.x / W) * 100}%`, top: `${(z.y / H) * 100}%`, width: `${(z.w / W) * 100}%`, height: `${(z.h / H) * 100}%` }} />
          ))}
        </View>
      )}
    </View>
  );
}
