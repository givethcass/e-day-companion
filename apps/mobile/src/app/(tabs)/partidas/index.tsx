// Match history: the season in three figures, Ranked if it is still pending, then every match with its result.
import type { Mode, MatchSummary } from '@eday/api-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { openLaunchUrl } from '@/lib/launch';
import { isWin, matchTitle, outcome } from '@/lib/match';
import { dayTime } from '@/lib/time';
import { Icon } from '@/ui/Icon';
import { Chip, Loader, Readouts, Screen, Text } from '@/ui/kit';
import { color, size, space } from '@/ui/theme';

const FILTERS: [string, Mode[] | null][] = [['Todo', null], ['Versus', ['versus_tdm', 'versus_conquest', 'versus_ranked']], ['Horde', ['horde_siege']], ['Campaña', ['campaign']]];

function MatchRow({ m, tz }: { m: MatchSummary; tz: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/partidas/${m.id}`)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>{matchTitle(m)}</Text>
        <Text variant="caption" tone="textSubtle">{dayTime(m.endedAt, tz)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text variant="overline" tone={isWin(m) && m.mode !== 'horde_siege' ? 'primary' : 'text'} style={{ fontSize: 12 }}>{outcome(m)}</Text>
        {m.kills !== undefined && <Text variant="data" tone="textMuted" style={{ fontSize: 13 }}>{m.kills} / {m.deaths} B/C</Text>}
      </View>
    </Pressable>
  );
}

export default function Partidas() {
  const { player } = useSession();
  const now = useNow();
  const { data, error, reload } = useApi(async () => {
    const [page, season] = await Promise.all([api.listMyMatches({ limit: 100, asOf: now }), api.getCurrentSeason()]);
    return { matches: page.items, season };
  }, [now]);
  const [filter, setFilter] = useState(0);
  if (!data) return <Screen title="Partidas"><Loader error={error} onRetry={reload} /></Screen>;
  const { matches, season } = data;
  const modes = FILTERS[filter][1];
  const items = matches.filter((m) => !modes || modes.includes(m.mode));
  const hours = matches.reduce((s, m) => s + (m.durationSeconds ?? 0), 0) / 3600;
  const bestWave = Math.max(0, ...matches.map((m) => m.wavesCleared ?? 0));
  return (
    <Screen overline={`Temporada ${season.number}`} title="Partidas" meta={`T${season.number} · ${matches.length} partidas`}>
      <Readouts items={[
        { label: 'Partidas', value: String(matches.length) },
        { label: 'Horas', value: hours.toFixed(1) },
        { label: 'Mejor oleada', value: bestWave ? String(bestWave) : '–', tone: 'primary' },
      ]} />
      {!player!.rank && (
        <Pressable accessibilityRole="button" onPress={() => openLaunchUrl('edaycompanion://launch?mode=versus_ranked')} style={styles.callout}>
          <Text style={{ flex: 1 }}>Ranked abrió el 13 oct. Tus 3 primeras partidas definen tu rango.</Text>
          <Icon name="chev" size={16} color={color.textSubtle} />
        </Pressable>
      )}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {FILTERS.map(([label], i) => <View key={label} style={{ flex: 1 }}><Chip label={label} selected={i === filter} onPress={() => setFilter(i)} /></View>)}
      </View>
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
        {items.map((m) => <MatchRow key={m.id} m={m} tz={player!.timezone} />)}
        {items.length === 0 && <Text tone="textMuted" style={{ paddingVertical: space.md }}>Sin partidas de este modo todavía.</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: size.touchTarget + 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.border },
  callout: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderLeftWidth: size.heroRule, borderLeftColor: color.primary },
});
