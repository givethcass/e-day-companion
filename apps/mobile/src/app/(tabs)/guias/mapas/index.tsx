// Mapas de Versus: every map as a small plan with how it suits you, the one you win most on first.
import type { VersusMap } from '@eday/api-types';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { MAP_SIZE as SIZE } from '@/lib/maps';
import { IconButton, Loader, Screen, Text } from '@/ui/kit';
import { Columns } from '@/ui/layout';
import { MapPlan } from '@/ui/MapPlan';
import { color } from '@/ui/theme';

const pctOf = (w: number, n: number) => (n ? `${Math.round((w / n) * 100)}%` : '–');

function MapCard({ m }: { m: VersusMap }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${m.name}, ${m.me.matches} partidas`} onPress={() => router.push(`/guias/mapas/${m.id}`)}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: color.surface }]}>
      <MapPlan map={m} view="kills" labels={false} />
      <View style={{ gap: 4 }}>
        <Text variant="overline" tone="textSubtle">{`${SIZE[m.size]} · ${m.bestFor}`}</Text>
        <Text variant="headline" style={{ fontSize: 22 }}>{m.name}</Text>
        <Text variant="caption" tone="textMuted" numberOfLines={2}>{m.summary}</Text>
      </View>
      <View style={styles.figures}>
        <Text variant="data" tone="textSubtle">{`${m.me.matches} partidas`}</Text>
        <Text variant="data" tone="textSubtle">{`Ganas ${pctOf(m.me.wins, m.me.matches)}`}</Text>
        <Text variant="data" tone="primary">{`K/D ${m.me.kd.toFixed(2)}`}</Text>
      </View>
    </Pressable>
  );
}

export default function Mapas() {
  const now = useNow();
  // The list only needs summaries, but the thumbnails draw the plan, which comes with the detail.
  const { data, error, reload } = useApi(async () => {
    const list = await api.listMaps(now);
    return Promise.all(list.map((m) => api.getMap(m.id, now)));
  }, [now]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/guias'))} />;
  if (!data) return <Screen overline="Guías" title="Mapas de Versus" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const maps = [...data].sort((a, b) => b.me.wins - a.me.wins || a.name.localeCompare(b.name));
  return (
    <Screen overline="Guías" title="Mapas de Versus" meta={`${maps.length} mapas`} right={back}>
      <Text tone="textMuted">Los callouts que usa la comunidad, dónde aparece cada arma de poder y en qué zonas ganas o caes.</Text>
      <Columns>{maps.map((m) => <MapCard key={m.id} m={m} />)}</Columns>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, paddingVertical: 14, borderTopWidth: 1, borderTopColor: color.border },
  figures: { flexDirection: 'row', justifyContent: 'space-between' },
});
