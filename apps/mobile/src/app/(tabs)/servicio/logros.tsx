// Logros: Xbox-style achievements with their Gamerscore. Earned ones first, newest on top, then what is
// missing, closest first. Rarity says how many players have each one.
import type { Achievement } from '@eday/api-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { number } from '@/lib/demo';
import { day } from '@/lib/time';
import { Chip, IconButton, Loader, Readouts, Screen, Text } from '@/ui/kit';
import { Progress } from '@/ui/Medal';
import { color, space } from '@/ui/theme';
import { Columns } from '@/ui/layout';

const FILTERS = ['Todos', 'Obtenidos', 'Por obtener'] as const;
const rarity = (r: number) => (r < 0.05 ? `Ultra raro · ${(r * 100).toFixed(0)}%` : r < 0.15 ? `Raro · ${Math.round(r * 100)}%` : `${Math.round(r * 100)}% de los jugadores`);

function AchievementRow({ a, tz }: { a: Achievement; tz: string }) {
  const got = Boolean(a.unlockedAt);
  return (
    <View style={styles.row}>
      <View style={[styles.score, got && styles.scoreOn]}>
        <Text variant="data" tone={got ? 'onAction' : 'textSubtle'} style={{ fontSize: 14 }}>{a.gamerscore}</Text>
        <Text variant="overline" tone={got ? 'onAction' : 'textSubtle'} style={{ fontSize: 9 }}>G</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="bodyStrong" tone={got ? 'text' : 'textMuted'}>{a.name}</Text>
        <Text variant="caption" tone="textSubtle">{a.description}</Text>
        {!got && a.goal > 1 && <Progress value={a.progress} goal={a.goal} />}
        <Text variant="caption" tone={a.rarity < 0.05 ? 'primary' : 'textSubtle'} style={{ fontSize: 12 }}>
          {[got ? `Obtenido el ${day(a.unlockedAt!, tz)}` : a.goal > 1 ? `${number(a.progress)} de ${number(a.goal)}` : null, rarity(a.rarity)].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );
}

export default function Logros() {
  const { player } = useSession();
  const now = useNow();
  const { data, error, reload } = useApi(() => api.listMyAchievements(now), [now]);
  const [filter, setFilter] = useState(0);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/servicio'))} />;
  if (!data) return <Screen title="Logros" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const items = data.items.filter((a) => filter === 0 || (filter === 1 ? a.unlockedAt : !a.unlockedAt));
  const rare = data.items.filter((a) => a.unlockedAt && a.rarity < 0.05).length;
  return (
    <Screen overline="Gamerscore" title="Logros" right={back}>
      <Readouts items={[
        { label: 'Gamerscore', value: `${number(data.gamerscore)}`, tone: 'primary' },
        { label: 'Logros', value: `${data.unlocked}/${data.items.length}` },
        { label: 'Ultra raros', value: String(rare) },
      ]} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {FILTERS.map((label, i) => <View key={label} style={{ flex: 1 }}><Chip label={label} selected={i === filter} onPress={() => setFilter(i)} /></View>)}
      </View>
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Columns>{items.map((a) => <AchievementRow key={a.id} a={a} tz={player!.timezone} />)}</Columns>
      </View>
      <Text variant="caption" tone="textSubtle">{`De ${number(data.gamerscoreTotal)} Gamerscore posibles. Los porcentajes de rareza son ilustrativos.`}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.border },
  score: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.border },
  scoreOn: { backgroundColor: color.action, borderColor: color.action },
});
