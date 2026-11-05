// Tu clan: who is in it, what it plays next and its own Horde ranking by best wave.
import { router } from 'expo-router';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { difficultyLabel, modeLabel } from '@/lib/demo';
import { day, dayTime } from '@/lib/time';
import { Card, IconButton, Loader, Readouts, Row, Screen, Section, Text } from '@/ui/kit';

export default function Clan() {
  const { player } = useSession();
  const tz = player!.timezone;
  const clanId = player!.clanId;
  const { data, error, reload } = useApi(async () => (clanId ? Promise.all([api.getClan(clanId), api.getClanLeaderboard(clanId)]) : null), [clanId]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/comunidad'))} />;
  if (!clanId) return <Screen title="Clan" right={back}><Card><Text tone="textMuted">Aún no estás en un clan.</Text></Card></Screen>;
  if (!data) return <Screen title="Clan" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const [clan, board] = data;
  const sessions = clan.upcomingSessions ?? [];
  return (
    <Screen overline={`[${clan.tag}] · ${clan.language === 'es' ? 'Español' : 'Inglés'}`} title={clan.name} right={back}>
      <Readouts items={[
        { label: 'Miembros', value: String(clan.memberCount) },
        { label: 'Sesiones', value: String(sessions.length) },
        { label: 'Tu puesto', value: board.me ? `#${board.me.position}` : '–', tone: 'primary' },
      ]} />
      <Section title="Próximas sesiones del clan">
        {sessions.length === 0 && <Text tone="textMuted" style={{ paddingVertical: 10 }}>Nadie ha programado nada todavía.</Text>}
        {sessions.slice(0, 4).map((s) => (
          <Row key={s.id} tag={day(s.startsAt, tz).split(' ').slice(0, 2).join(' ').toUpperCase()} tagTone="primary"
            title={`${modeLabel(s.mode)}${s.map ? ` · ${s.map}` : ''}`}
            subtitle={`${dayTime(s.startsAt, tz)} · ${s.hostGamertag}${s.difficulty ? ` · ${difficultyLabel(s.difficulty)}` : ''}`}
            trailing={`${s.members.length}/${s.slots}`} onPress={() => router.push(`/comunidad/escuadra/${s.id}`)} />
        ))}
      </Section>
      <Section title="Horde del clan · mejor oleada">
        {board.entries.map((e) => (
          <Row key={e.gamertag} tag={`#${String(e.position).padStart(2, '0')}`} tagTone={e.gamertag === player!.gamertag ? 'primary' : 'textSubtle'}
            title={e.gamertag} subtitle={e.country ?? undefined} trailing={`Oleada ${e.points}`} trailingTone={e.gamertag === player!.gamertag ? 'primary' : 'text'} />
        ))}
      </Section>
      <View />
    </Screen>
  );
}
