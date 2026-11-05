// Service record pieces: the level emblem, a 2x2 grid of figures and the per-mode summary used on Inicio.
import type { ServiceRecord } from '@eday/api-types';
import { StyleSheet, View } from 'react-native';
import { number, roleLabel } from '@/lib/demo';
import { type Family, pct, rankLabel } from '@/lib/service';
import { Text } from './kit';
import { color } from './theme';

/** Level emblem: original art standing in for the player's in-game emblem. */
export function Emblem({ level, size = 60 }: { level: number; size?: number }) {
  return (
    <View style={[styles.emblem, { width: size, height: size }]}>
      <Text variant="overline" tone="textSubtle" style={{ fontSize: 10 }}>Nivel</Text>
      <Text variant="display" style={{ fontSize: size * 0.45, lineHeight: size * 0.48 }}>{level}</Text>
    </View>
  );
}

type Cell = { label: string; value: string; note?: string; tone?: 'primary' | 'text' };

export function StatGrid({ cells }: { cells: Cell[] }) {
  return (
    <View style={styles.grid}>
      {cells.map((c, i) => (
        <View key={c.label} style={[styles.cell, i % 2 === 1 && styles.cellRight, i >= 2 && styles.cellLow]}>
          <Text variant="overline" tone="textSubtle" style={{ fontSize: 11 }}>{c.label}</Text>
          <Text variant="stat" tone={c.tone} numberOfLines={1} adjustsFontSizeToFit>{c.value}</Text>
          {c.note ? <Text variant="caption" tone="textSubtle" numberOfLines={1}>{c.note}</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** The four figures that say the most about each mode. */
export function modeCells(r: ServiceRecord, f: Family): Cell[] {
  if (f === 'versus') {
    const v = r.versus;
    return [
      { label: 'Victorias', value: pct(v.winRate), note: `${v.wins} de ${v.matches} partidas`, tone: 'primary' },
      { label: 'K/D', value: v.kd.toFixed(2), note: `${number(v.kills)} bajas · ${number(v.deaths)} caídas` },
      { label: 'Rango', value: rankLabel(v.rank), note: v.rank ? `${v.rank.points} puntos` : 'Juega 3 partidas de Ranked' },
      { label: 'Mejor racha', value: String(v.bestWinStreak), note: 'victorias seguidas' },
    ];
  }
  if (f === 'horde') {
    const h = r.horde;
    return [
      { label: 'Mejor oleada', value: `${h.bestWave}/${h.waveGoal}`, note: h.byMap[0]?.map ?? 'Sin partidas', tone: 'primary' },
      { label: 'Oleadas', value: number(h.wavesCleared), note: 'superadas en total' },
      { label: 'Completas', value: `${h.completed} de ${h.matches}`, note: `las ${h.waveGoal} oleadas` },
      { label: 'Clase', value: h.mainRole ? roleLabel(h.mainRole) : '–', note: `${h.hoursPlayed} h jugadas` },
    ];
  }
  const c = r.campaign;
  return [
    { label: 'Capítulos', value: `${c.chaptersCompleted}/${c.chaptersTotal}`, note: `${pct(c.chaptersCompleted / c.chaptersTotal)} de la historia`, tone: 'primary' },
    { label: 'Bajas', value: number(c.kills), note: 'en campaña' },
    { label: 'Horas', value: String(c.hoursPlayed), note: 'jugadas' },
    { label: 'Intentos', value: String(c.attempts), note: 'capítulos jugados' },
  ];
}

const styles = StyleSheet.create({
  emblem: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E0E0E', borderWidth: 1, borderColor: color.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: color.border },
  cell: { width: '50%', paddingVertical: 10, paddingRight: 10, gap: 2 },
  cellRight: { borderLeftWidth: 1, borderLeftColor: color.border, paddingLeft: 14 },
  cellLow: { borderTopWidth: 1, borderTopColor: color.border },
});
