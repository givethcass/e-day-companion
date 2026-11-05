// Medallas: every series with its five tiers, as in the game's profile customisation. The three on the
// profile card sit on top; one row of chips picks a group, another splits what is earned from what is missing.
// Each group shows the series closest to their next tier first.
import type { MedalCategory } from '@eday/api-types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { CATEGORY, earned, nextTier, TIER, topTier } from '@/lib/service';
import { Chip, IconButton, Loader, Readouts, Screen, Text } from '@/ui/kit';
import { MedalBadge, MedalRow } from '@/ui/Medal';
import { color, space } from '@/ui/theme';

const FILTERS = ['Todas', 'Obtenidas', 'Por obtener'] as const;

export default function Medallas() {
  const { player } = useSession();
  const tz = player!.timezone;
  const now = useNow();
  const { data, error, reload } = useApi(() => api.listMyMedals(now), [now]);
  const focused = useRef(false);
  useFocusEffect(useCallback(() => { if (focused.current) reload(); focused.current = true; }, [reload]));
  const [filter, setFilter] = useState(0);
  const [group, setGroup] = useState<MedalCategory | null>(null);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/servicio'))} />;
  if (!data) return <Screen title="Medallas" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const tiers = data.reduce((s, m) => s + earned(m), 0);
  const total = data.length * 5;
  const complete = data.filter((m) => earned(m) === 5).length;
  const equipped = data.filter((m) => m.equipped);
  const groups = (Object.keys(CATEGORY) as MedalCategory[]).filter((c) => data.some((m) => m.category === c));
  const shown = data.filter((m) => (!group || m.category === group) && (filter === 0 || (filter === 1 ? earned(m) > 0 : earned(m) < 5)));
  const categories = groups.filter((c) => shown.some((m) => m.category === c));
  // Closest to the next tier first; finished series last.
  const left = (m: (typeof data)[number]) => { const n = nextTier(m); return n ? 1 - m.progress / n.goal : 2; };
  const tally = (c: MedalCategory) => { const ms = data.filter((m) => m.category === c); return `${ms.reduce((s, m) => s + earned(m), 0)}/${ms.length * 5}`; };
  return (
    <Screen overline={`${tiers} de ${total} niveles`} title="Medallas" right={back}>
      <Readouts items={[
        { label: 'Niveles', value: `${tiers}/${total}`, tone: 'primary' },
        { label: 'Completas', value: `${complete}/${data.length}` },
        { label: 'Por obtener', value: String(total - tiers) },
      ]} />
      <View style={{ gap: 8 }}>
        <Text variant="overline" tone="textSubtle">En tu tarjeta · hasta 3</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[0, 1, 2].map((i) => {
            const m = equipped[i];
            const top = m ? topTier(m) : null;
            return (
              <Pressable key={m?.id ?? `empty${i}`} accessibilityRole="button" disabled={!m} onPress={() => m && router.push(`/servicio/medallas/${m.id}`)} style={styles.slot}>
                <MedalBadge tier={top?.tier ?? null} size={30} />
                <Text variant="caption" numberOfLines={2} tone={m ? 'text' : 'textSubtle'} style={{ fontSize: 12, lineHeight: 14, textAlign: 'center' }}>{m ? m.name : 'Libre'}</Text>
                {top && <Text variant="overline" tone="textSubtle" style={{ fontSize: 10 }}>{TIER[top.tier].label}</Text>}
              </Pressable>
            );
          })}
        </View>
        <Text variant="caption" tone="textSubtle">Toca una medalla para ponerla o quitarla de tu tarjeta.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.xl }}
        contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.xl }}>
        <Chip label={`Todas · ${data.length}`} selected={!group} onPress={() => setGroup(null)} />
        {groups.map((c) => <Chip key={c} label={`${CATEGORY[c]} · ${data.filter((m) => m.category === c).length}`} selected={group === c} onPress={() => setGroup(c)} />)}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {FILTERS.map((label, i) => <View key={label} style={{ flex: 1 }}><Chip label={label} selected={i === filter} onPress={() => setFilter(i)} /></View>)}
      </View>
      {categories.map((cat) => (
        <View key={cat}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text variant="section" style={{ paddingBottom: 6 }}>{CATEGORY[cat]}</Text>
            <Text variant="data" tone="textSubtle" style={{ fontSize: 13 }}>{tally(cat)}</Text>
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
            {shown.filter((m) => m.category === cat).sort((a, b) => left(a) - left(b)).map((m) => <MedalRow key={m.id} m={m} tz={tz} />)}
          </View>
        </View>
      ))}
      {shown.length === 0 && <Text tone="textMuted">{filter === 1 ? 'Aún no tienes medallas. Juega una partida para la primera.' : 'Tienes todas. No queda nada por obtener.'}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 6, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
});
