// One Versus map: the plan with its callouts, then where you get kills and where you fall, callout by callout,
// with the lesson for your next match there. Tapping a callout on the plan or in the list shows its tip.
import type { MapZone } from '@eday/api-types';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { number } from '@/lib/demo';
import { MAP_SIZE as SIZE } from '@/lib/maps';
import { Button, Card, IconButton, Loader, Readouts, Screen, Tabs, Text } from '@/ui/kit';
import { useLayout } from '@/ui/layout';
import { HEAT, MapPlan, type PlanView } from '@/ui/MapPlan';
import { color, space } from '@/ui/theme';

const VIEWS: [PlanView, string][] = [['plan', 'Plano'], ['kills', 'Tus bajas'], ['deaths', 'Tus caídas']];
const KIND: Record<MapZone['kind'], string> = {
  spawn: 'Reaparición', lane: 'Ruta', open: 'Zona abierta', close: 'Corta distancia', high: 'Zona alta', power: 'Arma de poder',
};

export default function Mapa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const now = useNow();
  const { wide } = useLayout();
  const { data: m, error, reload } = useApi(() => api.getMap(id, now), [id, now]);
  const [view, setView] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/guias/mapas'))} />;
  if (!m) return <Screen title="Mapa" right={back}><Loader error={error} onRetry={reload} /></Screen>;

  const stat = new Map(m.stats.zones.map((z) => [z.zoneId, z]));
  // Opens on where you do best; the lesson below already names where you fall most.
  const zoneId = picked ?? m.stats.strongest ?? m.zones[0].id;
  const zone = m.zones.find((z) => z.id === zoneId)!;
  const here = stat.get(zone.id)!;
  const pickups = m.pickups.filter((k) => k.zoneId === zone.id);
  const v = VIEWS[view][0];
  const total = v === 'deaths' ? m.stats.deaths : m.stats.kills;
  const rows = [...m.zones].sort((a, b) => (v === 'deaths' ? stat.get(b.id)!.deaths - stat.get(a.id)!.deaths : stat.get(b.id)!.kills - stat.get(a.id)!.kills));

  const plan = (
    <View style={{ gap: 10 }}>
      <Tabs items={VIEWS.map(([, l]) => l)} selected={view} onSelect={setView} />
      <MapPlan map={m} view={v} selected={zone.id} onSelect={setPicked} />
      <View style={styles.legend}>
        {v !== 'plan' && <View style={styles.key}><View style={[styles.swatch, { backgroundColor: HEAT[v] }]} /><Text variant="caption" tone="textSubtle">{v === 'kills' ? 'Más bajas, más intenso' : 'Más caídas, más intenso'}</Text></View>}
        <View style={styles.key}><View style={[styles.swatch, styles.diamond]} /><Text variant="caption" tone="textSubtle">Arma de poder</Text></View>
        <View style={styles.key}><View style={[styles.swatch, styles.spawn]} /><Text variant="caption" tone="textSubtle">Reaparición</Text></View>
      </View>
    </View>
  );
  const detail = (
    <Card priority>
      <Text variant="overline" tone="primary">{`${KIND[zone.kind]}${zone.team ? ` · ${zone.team}` : ''}`}</Text>
      <Text variant="headline" style={{ fontSize: 24 }}>{zone.name}</Text>
      <Text tone="textMuted">{zone.tip}</Text>
      <View style={{ flexDirection: 'row', gap: space.lg }}>
        <Text variant="data" tone="primary">{`${number(here.kills)} bajas`}</Text>
        <Text variant="data" tone="textSubtle">{`${number(here.deaths)} caídas`}</Text>
        <Text variant="data" tone="textSubtle">{`K/D ${(here.kills / Math.max(1, here.deaths)).toFixed(2)}`}</Text>
      </View>
      {pickups.map((k) => <Text key={k.weaponId} variant="caption" tone="textMuted">{`${k.weapon} · reaparece cada ${k.respawnSeconds} s`}</Text>)}
    </Card>
  );

  return (
    <Screen overline={`${SIZE[m.size]} · ${m.bestFor}`} title={m.name} right={back}>
      <Text tone="textMuted">{`${m.setting}. ${m.summary}`}</Text>
      <Readouts items={[
        { label: 'Partidas', value: String(m.me.matches) },
        { label: 'Victorias', value: m.me.matches ? `${Math.round((m.me.wins / m.me.matches) * 100)}%` : '–' },
        { label: 'K/D', value: m.me.kd.toFixed(2), tone: 'primary' },
      ]} />
      {wide ? <View style={{ flexDirection: 'row', gap: 28, alignItems: 'flex-start' }}><View style={{ flex: 3 }}>{plan}</View><View style={{ flex: 2 }}>{detail}</View></View> : <>{plan}{detail}</>}
      {m.stats.takeaway && (
        <Card>
          <Text variant="overline" tone="textSubtle">Para tu próxima partida aquí</Text>
          <Text>{m.stats.takeaway}</Text>
        </Card>
      )}
      <View>
        <Text variant="section" style={{ paddingBottom: 6 }}>{v === 'deaths' ? 'Dónde caes' : 'Dónde haces bajas'}</Text>
        {rows.map((z) => {
          const s = stat.get(z.id)!;
          const value = v === 'deaths' ? s.deaths : s.kills;
          return (
            <Pressable key={z.id} accessibilityRole="button" accessibilityState={{ selected: z.id === zone.id }} onPress={() => setPicked(z.id)}
              style={({ pressed }) => [styles.row, (pressed || z.id === zone.id) && { backgroundColor: color.surface }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="bodyStrong">{z.name}</Text>
                  <Text variant="data">{number(value)}<Text variant="data" tone="textSubtle">{`  ${Math.round((value / Math.max(1, total)) * 100)}%`}</Text></Text>
                </View>
                <View style={{ height: 6, backgroundColor: color.disabled }}>
                  <View style={{ height: 6, width: `${(value / Math.max(1, total)) * 100}%`, backgroundColor: HEAT[v === 'deaths' ? 'deaths' : 'kills'] }} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
      {m.pickups.length > 0 && (
        <View>
          <Text variant="section" style={{ paddingBottom: 6 }}>Armas de poder</Text>
          {m.pickups.map((k) => (
            <View key={k.weaponId} style={styles.row}>
              <View style={[styles.swatch, styles.diamond]} />
              <Text variant="bodyStrong" style={{ flex: 1 }}>{k.weapon}</Text>
              <Text variant="data" tone="textSubtle">{`${m.zones.find((z) => z.id === k.zoneId)!.name} · ${k.respawnSeconds} s`}</Text>
            </View>
          ))}
        </View>
      )}
      {m.guideId && <Button kind="secondary" label="Leer la guía del mapa" onPress={() => router.push(`/guias/${m.guideId}`)} />}
      <Text variant="caption" tone="textSubtle">Dónde ocurre cada baja es una estimación de la demo a partir de tus partidas; el juego lo registraría exacto.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12 },
  diamond: { backgroundColor: '#C98500', transform: [{ rotate: '45deg' }], width: 9, height: 9 },
  spawn: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#8A8A8A' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: color.border },
});
