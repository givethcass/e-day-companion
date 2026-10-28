// Match history. The per-match report comes in week 3.
import type { Mode } from '@eday/api-types';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { DEMO_NOW, modeLabel } from '@/lib/demo';
import { day } from '@/lib/time';
import { Card, Chip, Loader, Row, Screen, Text } from '@/ui/kit';
import { space } from '@/ui/theme';

const FILTERS: [string, Mode[] | null][] = [['Todo', null], ['Versus', ['versus_tdm', 'versus_conquest', 'versus_ranked']], ['Horde', ['horde_siege']], ['Campaña', ['campaign']]];
const RESULT: Record<string, string> = { win: 'Victoria', loss: 'Derrota', draw: 'Empate', completed: 'Completada', failed: 'Fallida' };

export default function Partidas() {
  const { player } = useSession();
  const { data, error, reload } = useApi(() => api.listMyMatches({ limit: 100 }));
  const [filter, setFilter] = useState(0);
  if (!data) return <Screen title="Partidas"><Loader error={error} onRetry={reload} /></Screen>;
  const modes = FILTERS[filter][1];
  const items = data.items.filter((m) => !modes || modes.includes(m.mode));
  const wins = data.items.filter((m) => m.result === 'win').length;
  return (
    <Screen overline={`Hasta el ${day(DEMO_NOW, player!.timezone)}`} title="Partidas">
      <Card>
        <Text variant="stat">{data.items.length}</Text>
        <Text variant="caption" tone="textMuted">partidas esta temporada · {wins} victorias en Versus</Text>
      </Card>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {FILTERS.map(([label], i) => <Chip key={label} label={label} selected={i === filter} onPress={() => setFilter(i)} />)}
      </View>
      {items.map((m) => (
        <Row key={m.id} title={`${modeLabel(m.mode)} · ${m.map}`} subtitle={`${day(m.endedAt, player!.timezone)} · ${RESULT[m.result]}`}
          trailing={m.kills !== undefined ? `${m.kills}/${m.deaths}` : undefined} />
      ))}
    </Screen>
  );
}
