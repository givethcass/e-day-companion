// Tu semana as a deployment report: readouts, the priority objective (switchable to the alternatives), the week's log.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { DEMO_NOW, number } from '@/lib/demo';
import { openLaunchUrl } from '@/lib/launch';
import { clock, day, dayTime } from '@/lib/time';
import { Button, Card, Chip, DataLine, IconButton, Loader, Readouts, Row, Screen, Section, Text } from '@/ui/kit';
import { space } from '@/ui/theme';

const CHIP: Record<string, string> = { versus_ranked: 'Ranked', horde_siege: 'Horde', campaign: 'Campaña', versus_tdm: 'Versus', versus_conquest: 'Versus' };
const ddmm = (iso: string, tz: string) => new Intl.DateTimeFormat('es-MX', { timeZone: tz, day: '2-digit', month: '2-digit' }).format(new Date(iso)).replace('/', '.');

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
  const [sent, setSent] = useState<number | null>(null);

  if (!data) return <Screen overline="Informe de despliegue" title={player!.gamertag}><Loader error={error} onRetry={reload} /></Screen>;
  const { week, wallet, season, sessions, rotation, events, clan, unread } = data;
  const weekNo = Math.floor((Date.parse(DEMO_NOW) - Date.parse(season.startsAt)) / (7 * 864e5)) + 1;
  const weeks = Math.round((Date.parse(season.endsAt) - Date.parse(season.startsAt)) / (7 * 864e5));
  const missions = [week.nextMission, ...(week.nextMission.alternatives ?? [])];
  const m = missions[pick];
  const isMain = pick === 0;
  const mine = sessions.filter((s) => s.members.some((x) => x.gamertag === player!.gamertag));
  const wished = rotation.items.filter((i) => i.wishlisted);
  const ending = events.filter((e) => e.startsAt <= DEMO_NOW);
  const daysLeft = (iso: string) => `${Math.ceil((Date.parse(iso) - Date.parse(DEMO_NOW)) / 864e5)}d`;

  return (
    <Screen
      overline="Informe de despliegue"
      title={player!.gamertag}
      meta={`T${season.number} · SEM ${String(weekNo).padStart(2, '0')}/${String(weeks).padStart(2, '0')}\n${ddmm(rotation.startsAt, tz)} → ${ddmm(new Date(Date.parse(rotation.endsAt) - 864e5).toISOString(), tz)}`}
      right={<IconButton icon="bell" label={`Avisos, ${unread} sin leer`} dot={unread > 0} onPress={() => router.push('/avisos')} />}
    >
      <Readouts items={[
        { label: 'Inactivo', value: week.daysSinceLastMatch ? `${week.daysSinceLastMatch}d` : 'hoy', tone: week.daysSinceLastMatch ? 'primary' : 'text' },
        { label: 'Retos', value: `${week.challengesDone}/${week.challengesTotal}` },
        { label: 'Monedas', value: number(wallet.coins) },
      ]} />

      <Card priority>
        <Text variant="overline" tone="primary">{isMain ? 'Objetivo prioritario' : 'Objetivo alterno'}</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {missions.map((x, i) => <Chip key={x.mode} label={CHIP[x.mode] ?? x.mode} selected={i === pick} onPress={() => { setPick(i); setSent(null); }} />)}
        </View>
        <Text variant="headline">{m.title}</Text>
        {isMain ? (
          <View style={{ gap: 5 }}>
            {week.nextMission.reason ? <DataLine label="Motivo" value={week.nextMission.reason} /> : null}
            <DataLine label="Tiempo estimado" value={`~${week.nextMission.estimatedMinutes} min`} />
            {week.nextMission.reward ? <DataLine label="Recompensa" value={week.nextMission.reward} tone="primary" /> : null}
          </View>
        ) : null}
        <Button label={sent === pick ? '[ Enviado ]' : 'Desplegar ▸'} kind={sent === pick ? 'secondary' : 'primary'}
          onPress={() => { setSent(pick); if (m.launchUrl) openLaunchUrl(m.launchUrl); }} />
      </Card>

      <Section title="Registro de la semana">
        {mine.map((s) => {
          const me = s.members.find((x) => x.gamertag === player!.gamertag)!;
          return (
            <Row key={s.id} tag={day(s.startsAt, tz).split(' ').slice(0, 2).join(' ').toUpperCase()} tagTone="primary"
              title={`Horde Siege · ${s.clanId === clan?.id ? clan?.name : s.hostGamertag}`}
              subtitle={`${clock(s.startsAt, tz)} tu hora · escuadra ${me.squad}${me.confirmed ? ' · confirmado' : ''}`}
              trailing={`${s.members.length}/${s.slots}`} onPress={() => router.push(`/escuadra/${s.id}`)} />
          );
        })}
        {wished.map((i) => (
          <Row key={i.id} tag="TIENDA" title={`${i.name} disponible`} subtitle={`Lista de deseos · sale el ${day(rotation.endsAt, tz)}`}
            trailing={number(i.price.amount)} trailingTone="text" onPress={() => router.push(`/tienda/${i.id}`)} />
        ))}
        {ending.map((e) => (
          <Row key={e.id} tag="EVENTO" title={`${e.name} termina pronto`} subtitle={`${dayTime(e.endsAt, tz)} tu hora`} trailing={daysLeft(e.endsAt)} trailingTone="text" />
        ))}
      </Section>
    </Screen>
  );
}
