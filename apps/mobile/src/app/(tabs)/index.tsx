// Tu semana: the weekly report. The suggested mission follows how the player plays; the chips switch to the alternatives.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { DEMO_NOW, number } from '@/lib/demo';
import { openLaunchUrl } from '@/lib/launch';
import { day, dayTime } from '@/lib/time';
import { Icon } from '@/ui/Icon';
import { Badge, Button, Card, Chip, Loader, Row, Screen, Section, Text } from '@/ui/kit';
import { color, space } from '@/ui/theme';

const CHIP: Record<string, string> = { versus_ranked: 'Ranked', horde_siege: 'Horde', campaign: 'Campaña', versus_tdm: 'Versus', versus_conquest: 'Versus' };

export default function TuSemana() {
  const { player } = useSession();
  const tz = player!.timezone;
  const { data, error, reload } = useApi(async () => {
    const [week, wallet, season, sessions, rotation, events, notifications, clan] = await Promise.all([
      api.getMyWeek(DEMO_NOW), api.getMyWallet(), api.getCurrentSeason(), api.listSessions({ startsAfter: DEMO_NOW }),
      api.getStoreRotation(DEMO_NOW), api.listEvents(DEMO_NOW), api.listMyNotifications(DEMO_NOW),
      player!.clanId ? api.getClan(player!.clanId) : null,
    ]);
    return { week, wallet, season, sessions, rotation, events, clan, unread: notifications.filter((n) => !n.read).length };
  });
  const [pick, setPick] = useState(0);

  if (!data) return <Screen title="Tu semana"><Loader error={error} onRetry={reload} /></Screen>;
  const { week, wallet, season, sessions, rotation, events, clan, unread } = data;
  const weekNo = Math.floor((Date.parse(DEMO_NOW) - Date.parse(season.startsAt)) / (7 * 864e5)) + 1;
  const weeks = Math.round((Date.parse(season.endsAt) - Date.parse(season.startsAt)) / (7 * 864e5));
  const missions = [week.nextMission, ...(week.nextMission.alternatives ?? [])];
  const m = missions[pick];
  const isMain = pick === 0;
  const mine = sessions.filter((s) => s.members.some((x) => x.gamertag === player!.gamertag));
  const wished = rotation.items.filter((i) => i.wishlisted);
  const ending = events.filter((e) => e.startsAt <= DEMO_NOW);

  return (
    <Screen
      overline={`Temporada ${season.number} · semana ${weekNo} de ${weeks}`}
      title="Tu semana"
      right={
        <Pressable accessibilityLabel={`Avisos, ${unread} sin leer`} onPress={() => router.push('/avisos')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color.surfaceRaised, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bell" size={20} />
          {unread > 0 && <View style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: color.accent }} />}
        </Pressable>
      }
    >
      <Card hud>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {missions.map((x, i) => <Chip key={x.mode} label={CHIP[x.mode] ?? x.mode} selected={i === pick} onPress={() => setPick(i)} />)}
        </View>
        <Text variant="overline" tone="accent">
          {isMain ? `Misión sugerida${week.daysSinceLastMatch ? ` · ${week.daysSinceLastMatch} días sin jugar` : ''}` : 'Otra opción'}
        </Text>
        <Text variant="headline">{m.title}</Text>
        {isMain && week.nextMission.reason ? (
          <Text tone="textMuted">{week.nextMission.reason}. Unos {week.nextMission.estimatedMinutes} minutos.</Text>
        ) : null}
        {isMain && week.nextMission.reward ? <Badge label={week.nextMission.reward} /> : null}
        <Button label="Desplegar" onPress={() => m.launchUrl && openLaunchUrl(m.launchUrl)} />
      </Card>

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Card style={{ flex: 1 }}>
          <Text variant="overline" tone="textMuted">Monedas</Text>
          <Text variant="stat">{number(wallet.coins)}</Text>
          <Text variant="caption" tone="textSubtle">Esta semana {number(wallet.coinsThisWeek)} de {number(wallet.coinsWeeklyCap)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text variant="overline" tone="textMuted">Retos semanales</Text>
          <Text variant="stat">{week.challengesDone} / {week.challengesTotal}</Text>
          <Text variant="caption" tone="textSubtle">Se reinician el {day(rotation.endsAt, tz)}</Text>
        </Card>
      </View>

      <Section title="Esta semana">
        {mine.map((s) => {
          const me = s.members.find((x) => x.gamertag === player!.gamertag)!;
          return (
            <Row key={s.id} icon="squad" iconColor={color.highlight} title={`Horde Siege · ${s.clanId === clan?.id ? clan?.name : s.hostGamertag}`}
              subtitle={`${dayTime(s.startsAt, tz)} tu hora · escuadra ${me.squad}${me.confirmed ? ', confirmado' : ''}`}
              trailing={`${s.members.length}/${s.slots}`} onPress={() => router.push(`/escuadra/${s.id}`)} />
          );
        })}
        {wished.map((i) => (
          <Row key={i.id} icon="heart" iconColor={color.accent} title={`${i.name} volvió a la tienda`}
            subtitle={`De tu lista de deseos · se va el ${day(rotation.endsAt, tz)}`} onPress={() => router.push(`/tienda/${i.id}`)} />
        ))}
        {ending.map((e) => <Row key={e.id} icon="clock" title={`Evento ${e.name}`} subtitle={`Termina el ${dayTime(e.endsAt, tz)} tu hora`} />)}
      </Section>
    </Screen>
  );
}
