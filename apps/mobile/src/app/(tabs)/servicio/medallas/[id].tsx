// One medal series: the next challenge with its reward, the five tiers with dates or what is left,
// and the switch that puts it on the in-game profile card (at most three).
import type { Medal } from '@eday/api-types';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { number } from '@/lib/demo';
import { CATEGORY, earned, nextTier, TIER, topTier } from '@/lib/service';
import { day } from '@/lib/time';
import { Button, Card, IconButton, Loader, Screen, Section, Text } from '@/ui/kit';
import { MedalBadge, Progress, TierPips } from '@/ui/Medal';
import { color, space } from '@/ui/theme';

export default function MedalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = useSession();
  const tz = player!.timezone;
  const now = useNow();
  const { data, error, reload, setData } = useApi(async () => {
    const all = await api.listMyMedals(now);
    return { all, medal: all.find((m) => m.id === id) ?? (await api.getMyMedal(id!, now)) };
  }, [id, now]);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/servicio/medallas'))} />;
  if (!data) return <Screen title="Medalla" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const { all, medal: m } = data;
  const top = topTier(m);
  const next = nextTier(m);
  const count = earned(m);
  const on = all.filter((x) => x.equipped).map((x) => x.id);

  const toggle = async () => {
    setBusy(true);
    try {
      let ids: string[];
      let msg: string;
      if (m.equipped) { ids = on.filter((x) => x !== m.id); msg = 'Quitada de tu tarjeta.'; }
      else if (on.length >= 3) {
        const out = all.find((x) => x.id === on[0])!;
        ids = [...on.slice(1), m.id];
        msg = `Tu tarjeta tiene 3 espacios: reemplazó a ${out.name}.`;
      } else { ids = [...on, m.id]; msg = 'Ya está en tu tarjeta.'; }
      await api.setEquippedMedals(ids, now);
      const fresh = await api.listMyMedals(now);
      setData({ all: fresh, medal: fresh.find((x) => x.id === m.id) as Medal });
      setNote(msg);
    } catch (e) { setNote((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Screen overline={CATEGORY[m.category]} title={m.name} right={back}>
      <View style={styles.hero}>
        <MedalBadge tier={top?.tier ?? null} size={88} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="overline" tone={top ? 'primary' : 'textSubtle'}>{top ? TIER[top.tier].label : 'Bloqueada'}</Text>
          <Text variant="stat">Nivel {count} de 5</Text>
          <TierPips count={count} />
          <Text variant="caption" tone="textSubtle">{`${number(m.progress)} ${m.unit}`}</Text>
        </View>
      </View>

      {next ? (
        <Card priority>
          <Text variant="overline" tone="primary">{`Reto para ${TIER[next.tier].label}`}</Text>
          <Text variant="bodyStrong">{`Consigue ${number(next.goal)} ${m.unit}`}</Text>
          <Progress value={m.progress} goal={next.goal} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="data" tone="textSubtle">{`Te faltan ${number(next.goal - m.progress)}`}</Text>
            <Text variant="data">{`+${number(next.reward.amount)} Monedas`}</Text>
          </View>
          {next.reward.unlock && <Text variant="caption" tone="textMuted">{`También desbloquea: ${next.reward.unlock}`}</Text>}
        </Card>
      ) : (
        <Card priority>
          <Text variant="overline" tone="primary">Serie completa</Text>
          <Text>{`Llegaste a Diamante el ${day(top!.unlockedAt!, tz)}.`}</Text>
        </Card>
      )}

      <Section title="Niveles">
        {m.tiers.map((t) => (
          <View key={t.tier} style={styles.tier}>
            <MedalBadge tier={t.unlockedAt ? t.tier : null} size={30} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong" tone={t.unlockedAt ? 'text' : 'textMuted'}>{TIER[t.tier].label}</Text>
              <Text variant="caption" tone="textSubtle">{`${number(t.goal)} ${m.unit}`}</Text>
              <Text variant="caption" tone={t.reward.unlock ? 'textMuted' : 'textSubtle'}>
                {[`+${number(t.reward.amount)} Monedas`, t.reward.unlock].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Text variant="data" tone={t.unlockedAt ? 'primary' : 'textSubtle'} style={{ fontSize: 13 }}>
              {t.unlockedAt ? day(t.unlockedAt, tz) : `Faltan ${number(Math.max(0, t.goal - m.progress))}`}
            </Text>
          </View>
        ))}
      </Section>

      <View style={{ gap: 8 }}>
        <Button label={m.equipped ? 'Quitar de mi tarjeta' : 'Poner en mi tarjeta'} kind={m.equipped ? 'secondary' : 'primary'}
          disabled={busy || count === 0} onPress={toggle} />
        <Text variant="caption" tone="textSubtle">
          {note ?? (count === 0 ? 'Gana el primer nivel para poder mostrarla.' : 'Se ve en tu tarjeta de perfil del juego y en tu servicio. Caben 3.')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: space.sm },
  tier: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.border },
});
