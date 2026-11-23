// El arsenal: the community tier list for Versus or Horde, each weapon with how much you use it.
import type { WeaponSummary } from '@eday/api-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { TIER_COLOR, TIERS, WEAPON_CATEGORY } from '@/lib/arsenal';
import { useNow } from '@/lib/clock';
import { number } from '@/lib/demo';
import { IconButton, Loader, Screen, Tabs, Text } from '@/ui/kit';
import { Columns } from '@/ui/layout';
import { color } from '@/ui/theme';

const MODES = [['versus', 'Versus'], ['horde', 'Horde']] as const;

function WeaponRow({ w, mode, max }: { w: WeaponSummary; mode: 'versus' | 'horde'; max: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${w.name}, nivel ${w.tiers[mode].tier}, ${w.me.kills} bajas`} onPress={() => router.push(`/guias/arsenal/${w.id}`)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text variant="bodyStrong">{w.name}</Text>
          <Text variant="data" tone={w.me.kills ? 'text' : 'textSubtle'}>{w.me.kills ? `${number(w.me.kills)} bajas` : 'Sin usar'}</Text>
        </View>
        <Text variant="caption" tone="textSubtle" numberOfLines={1}>{`${WEAPON_CATEGORY[w.category]} · ${w.tiers[mode].note}`}</Text>
        <View style={{ height: 4, backgroundColor: color.disabled }}>
          <View style={{ height: 4, width: `${(w.me.kills / max) * 100}%`, backgroundColor: color.primary }} />
        </View>
      </View>
    </Pressable>
  );
}

export default function Arsenal() {
  const now = useNow();
  const { data, error, reload } = useApi(() => api.listWeapons(now), [now]);
  const [mode, setMode] = useState(0);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/guias'))} />;
  if (!data) return <Screen overline="Guías" title="Arsenal" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const m = MODES[mode][0];
  const max = Math.max(1, ...data.map((w) => w.me.kills));
  const fav = [...data].sort((a, b) => b.me.kills - a.me.kills)[0];
  return (
    <Screen overline="Guías" title="Arsenal" meta={`${data.length} armas`} right={back}>
      <Text tone="textMuted">{`La tier list de la comunidad para cada modo, con tus bajas al lado. Las armas del fabricador solo están en Horde. Tu arma: ${fav.name}, ${Math.round(fav.me.share * 100)}% de tus bajas con armas.`}</Text>
      <Tabs items={MODES.map(([, l]) => l)} selected={mode} onSelect={setMode} />
      {TIERS.map((t) => {
        const ws = data.filter((w) => w.tiers[m].tier === t && (m === 'horde' || w.source !== 'horde')).sort((a, b) => b.me.kills - a.me.kills);
        if (!ws.length) return null;
        return (
          <View key={t} style={{ gap: 4 }}>
            <View style={styles.tierHead}>
              <View style={[styles.tier, { backgroundColor: TIER_COLOR[t] }]}><Text variant="headline" style={{ fontSize: 22, lineHeight: 26 }}>{t}</Text></View>
              <Text variant="overline" tone="textSubtle">{`${ws.length} ${ws.length === 1 ? 'arma' : 'armas'}`}</Text>
            </View>
            <Columns gap={20}>{ws.map((w) => <WeaponRow key={w.id} w={w} mode={m} max={max} />)}</Columns>
          </View>
        );
      })}
      <Text variant="caption" tone="textSubtle">Las estadísticas y los niveles son ilustrativos para la demo. Tus bajas con cada arma salen de la misma estimación que las medallas.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: color.border },
  tierHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  tier: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
