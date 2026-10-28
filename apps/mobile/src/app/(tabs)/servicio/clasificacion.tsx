// Leaderboards by mode: Horde ranks by best wave, Ranked by rank points. The game has none yet.
import type { LeaderboardScope, Mode } from '@eday/api-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Card, Chip, IconButton, Loader, Row, Screen, Section, Text } from '@/ui/kit';
import { space } from '@/ui/theme';

const MODES: [string, Mode][] = [['Horde', 'horde_siege'], ['Ranked', 'versus_ranked']];
const SCOPES: [string, LeaderboardScope][] = [['Amigos', 'friends'], ['Clan', 'clan'], ['País', 'country'], ['Global', 'global']];

export default function Clasificacion() {
  const [mode, setMode] = useState(0);
  const [scope, setScope] = useState(0);
  const { data, error, reload } = useApi(() => api.getLeaderboard(MODES[mode][1], { scope: SCOPES[scope][1], limit: 20 }), [mode, scope]);
  const unit = MODES[mode][1] === 'horde_siege' ? 'oleada' : 'pts';
  return (
    <Screen overline="Temporada 1" title="Clasificaciones"
      right={<IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/servicio'))} />}>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {MODES.map(([label], i) => <Chip key={label} label={label} selected={i === mode} onPress={() => setMode(i)} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {SCOPES.map(([label], i) => <Chip key={label} label={label} selected={i === scope} onPress={() => setScope(i)} />)}
      </View>
      {data?.me ? (
        <Card priority>
          <Text variant="overline" tone="primary">Tu posición</Text>
          <Text variant="stat">#{data.me.position} · {data.me.points} {unit}</Text>
        </Card>
      ) : data ? (
        <Card><Text tone="textMuted">Aún no apareces aquí. Juega 3 partidas de Ranked para tener rango.</Text></Card>
      ) : null}
      {!data ? <Loader error={error} onRetry={reload} /> : (
        <Section title={`${SCOPES[scope][0]} · ${MODES[mode][0]}`}>
          {data.entries.map((e) => (
            <Row key={e.gamertag} tag={`#${String(e.position).padStart(2, '0')}`} tagTone={e.gamertag === data.me?.gamertag ? 'primary' : 'textSubtle'}
              title={e.gamertag} subtitle={[e.country, e.clanTag].filter(Boolean).join(' · ')} trailing={`${e.points} ${unit}`}
              trailingTone={e.gamertag === data.me?.gamertag ? 'primary' : 'text'} />
          ))}
        </Section>
      )}
      <Text variant="caption" tone="textSubtle">
        {unit === 'oleada' ? 'Horde se ordena por la mejor oleada de la temporada.' : 'Ranked se ordena por puntos de rango.'} E-Day aún no tiene clasificaciones: la app las ofrecería primero.
      </Text>
    </Screen>
  );
}
