// One weapon: what it is good for, its numbers, where it appears on the Versus maps and how you do with it.
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { STATS, TIER_COLOR, WEAPON_CATEGORY, WEAPON_SOURCE } from '@/lib/arsenal';
import { useNow } from '@/lib/clock';
import { number } from '@/lib/demo';
import { TIER, pct } from '@/lib/service';
import { Bullets, Button, Card, IconButton, Loader, Readouts, Row, Screen, Section, Text } from '@/ui/kit';
import { useLayout } from '@/ui/layout';
import { color, space } from '@/ui/theme';

export default function Arma() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const now = useNow();
  const { wide } = useLayout();
  const { data: w, error, reload } = useApi(() => api.getWeapon(id, now), [id, now]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/guias/arsenal'))} />;
  if (!w) return <Screen title="Arma" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const d = w.detail;

  const tiers = (
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: space.md }}>
      {(['versus', 'horde'] as const).map((m) => (
        <View key={m} style={[styles.tierCard, { borderLeftColor: TIER_COLOR[w.tiers[m].tier] }]}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text variant="headline" style={{ fontSize: 30, color: TIER_COLOR[w.tiers[m].tier] }}>{w.tiers[m].tier}</Text>
            <Text variant="overline" tone="textSubtle">{m === 'versus' ? 'En Versus' : 'En Horde'}</Text>
          </View>
          <Text tone="textMuted">{w.tiers[m].note}</Text>
        </View>
      ))}
    </View>
  );
  const stats = (
    <Card>
      {STATS.map(([k, label]) => (
        <View key={k} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" tone="textMuted">{label}</Text><Text variant="data">{w.stats[k]}</Text>
          </View>
          <View style={{ height: 6, backgroundColor: color.disabled }}><View style={{ height: 6, width: `${w.stats[k]}%`, backgroundColor: color.text }} /></View>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: space.lg, paddingTop: 4 }}>
        <Text variant="data" tone="textSubtle">{`Cargador ${w.magazine}`}</Text>
        <Text variant="data" tone="textSubtle">{`Recarga ${w.reload.toFixed(1)} s`}</Text>
      </View>
    </Card>
  );

  return (
    <Screen overline={`${WEAPON_CATEGORY[w.category]} · ${WEAPON_SOURCE[w.source]}`} title={w.name} right={back}>
      <Text tone="textMuted">{w.summary}</Text>
      <Readouts items={[
        { label: 'Tus bajas', value: number(w.me.kills), tone: 'primary' },
        { label: 'Entre tus armas', value: d.rank ? `#${d.rank}` : '–' },
        { label: 'Precisión', value: d.accuracy !== null ? pct(d.accuracy) : '–' },
      ]} />
      {tiers}
      {wide ? <View style={{ flexDirection: 'row', gap: 28, alignItems: 'flex-start' }}><View style={{ flex: 1 }}>{stats}</View><View style={{ flex: 1 }}><Section title="Consejos"><Bullets items={w.tips} /></Section></View></View>
        : <>{stats}<Section title="Consejos"><Bullets items={w.tips} /></Section></>}
      {w.me.kills > 0 && (
        <Section title="Cómo te va">
          <Row title="Versus" trailing={number(d.versusKills)} trailingTone="text" />
          <Row title="Horde" trailing={number(d.hordeKills)} trailingTone="text" />
          {d.headshots !== null && <Row title="A la cabeza" subtitle="Estimación de la demo" trailing={pct(d.headshots)} trailingTone="text" />}
          <Row tag={d.medal.tier ? TIER[d.medal.tier].label : 'Medalla'} title={`Medalla de ${w.name}`}
            subtitle={d.medal.nextGoal ? `${number(d.medal.progress)} de ${number(d.medal.nextGoal)} para el siguiente nivel` : 'Completa'}
            onPress={() => router.push(`/servicio/medallas/${d.medal.id}`)} />
        </Section>
      )}
      {w.pickups.length > 0 && (
        <Section title="Dónde aparece">
          {w.pickups.map((k) => <Row key={k.mapId} icon="map" title={k.map} subtitle={`${k.zone} · reaparece cada ${k.respawnSeconds} s`} onPress={() => router.push(`/guias/mapas/${k.mapId}`)} />)}
        </Section>
      )}
      {w.guideId && <Button kind="secondary" label="Leer la guía" onPress={() => router.push(`/guias/${w.guideId}`)} />}
      <Text variant="caption" tone="textSubtle">Estadísticas y niveles ilustrativos. La precisión es una estimación de la demo; el juego la registraría disparo a disparo.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tierCard: { flex: 1, gap: 4, padding: 14, backgroundColor: color.surface, borderLeftWidth: 4 },
});
