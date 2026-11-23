// Tu campaña: the twelve chapters by act, which you finished and when, and the collectibles you found. Tapping a
// chapter opens its three collectibles with where each one is, so the missing ones read as a to-do list.
import type { Chapter } from '@eday/api-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { day } from '@/lib/time';
import { Button, Card, IconButton, Loader, Readouts, Screen, Text } from '@/ui/kit';
import { Columns } from '@/ui/layout';
import { color } from '@/ui/theme';

const TZ = 'America/Mexico_City';
const STATUS: Record<Chapter['status'], string> = { completed: 'Completado', available: 'Disponible', locked: 'Bloqueado' };

function ChapterRow({ c, open, onToggle }: { c: Chapter; open: boolean; onToggle: () => void }) {
  const found = c.collectibles.filter((x) => x.found).length;
  const locked = c.status === 'locked';
  return (
    <View style={styles.chapter}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onToggle} disabled={locked}
        style={({ pressed }) => [styles.head, pressed && { backgroundColor: color.surface }]}>
        <Text variant="headline" tone={locked ? 'textFaint' : c.status === 'available' ? 'primary' : 'text'} style={styles.n}>{String(c.n).padStart(2, '0')}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" tone={locked ? 'textSubtle' : 'text'}>{c.name}</Text>
          <Text variant="caption" tone="textSubtle">{c.completedAt ? `${c.setting} · ${day(c.completedAt, TZ)}` : `${c.setting} · ${STATUS[c.status]}`}</Text>
        </View>
        <View style={styles.pips} accessibilityLabel={`${found} de ${c.collectibles.length} coleccionables`}>
          {c.collectibles.map((x) => <View key={x.id} style={[styles.pip, x.found && { backgroundColor: '#C98500', borderColor: '#C98500' }]} />)}
        </View>
      </Pressable>
      {open && (
        <View style={styles.body}>
          <Text variant="caption" tone="textMuted">{c.summary}</Text>
          {c.collectibles.map((x) => (
            <View key={x.id} style={styles.item}>
              <View style={[styles.pip, { marginTop: 4 }, x.found && { backgroundColor: '#C98500', borderColor: '#C98500' }]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong" tone={x.found ? 'textMuted' : 'text'}>{x.name}</Text>
                <Text variant="caption" tone="textSubtle">{x.found && x.foundAt ? `Encontrado el ${day(x.foundAt, TZ)}` : x.where}</Text>
              </View>
            </View>
          ))}
          <Text variant="data" tone="textSubtle">{`${c.attempts} ${c.attempts === 1 ? 'intento' : 'intentos'}${c.bestKills !== null ? ` · mejor partida ${c.bestKills} bajas` : ''} · unos ${c.minutes} min`}</Text>
        </View>
      )}
    </View>
  );
}

export default function Campana() {
  const now = useNow();
  const { data: c, error, reload } = useApi(() => api.getCampaign(now), [now]);
  const [open, setOpen] = useState<number | null>(null);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/servicio'))} />;
  if (!c) return <Screen overline="Mi servicio" title="Tu campaña" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const shown = open ?? c.next?.chapter ?? null;
  return (
    <Screen overline="Mi servicio" title="Tu campaña" right={back}>
      <Readouts items={[
        { label: 'Capítulos', value: `${c.chaptersCompleted}/${c.chaptersTotal}` },
        { label: 'Coleccionables', value: `${c.collectiblesFound}/${c.collectiblesTotal}`, tone: 'primary' },
        { label: 'Horas', value: String(c.hoursPlayed) },
      ]} />
      {c.next && (
        <Card priority>
          <Text variant="overline" tone="primary">Lo siguiente</Text>
          <Text>{c.next.text}</Text>
        </Card>
      )}
      <Columns>
        {c.acts.map((a) => (
          <View key={a.name}>
            <Text variant="section" style={{ paddingBottom: 6 }}>{a.name}</Text>
            {a.chapters.map((ch) => <ChapterRow key={ch.n} c={ch} open={shown === ch.n} onToggle={() => setOpen(shown === ch.n ? 0 : ch.n)} />)}
          </View>
        ))}
      </Columns>
      <Button kind="secondary" label="Guías de coleccionables" onPress={() => router.push(c.next && c.next.chapter > 6 ? '/guias/g_collect_2' : '/guias/g_collect_1')} />
      <Text variant="caption" tone="textSubtle">Capítulos y coleccionables inventados para la demo. Qué coleccionable encuentras en cada partida es una estimación; el juego lo registraría exacto.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chapter: { borderTopWidth: 1, borderTopColor: color.border },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4 },
  n: { fontSize: 22, width: 32 },
  pips: { flexDirection: 'row', gap: 5 },
  pip: { width: 9, height: 9, borderWidth: 1, borderColor: color.textSubtle, transform: [{ rotate: '45deg' }] },
  body: { gap: 10, paddingLeft: 48, paddingRight: 4, paddingBottom: 14 },
  item: { flexDirection: 'row', gap: 10 },
});
