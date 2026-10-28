// Squad sessions with the filters players asked for: Spanish, no mic, today.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { DEMO_NOW, difficultyLabel, modeLabel } from '@/lib/demo';
import { countdown, dayTime, zoneLabel } from '@/lib/time';
import { Card, Chip, Loader, Row, Screen, Section, Text, Button } from '@/ui/kit';
import { color, space } from '@/ui/theme';

const FILTERS = ['Todas', 'Español', 'Sin micro', 'Hoy'] as const;
const endOfDay = (tz: string) => {
  // Midnight tonight in the player's zone, as an instant: good enough for the demo's "Hoy" filter.
  const offset = new Date(DEMO_NOW).toLocaleString('en-US', { timeZone: tz, hour12: false, hour: '2-digit' });
  return new Date(Date.parse(DEMO_NOW) + (24 - Number(offset)) * 3600e3).toISOString();
};

export default function Escuadra() {
  const { player } = useSession();
  const tz = player!.timezone;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todas');
  const { data, error, reload } = useApi(() => api.listSessions({
    startsAfter: DEMO_NOW,
    ...(filter === 'Español' ? { language: 'es' } : {}),
    ...(filter === 'Sin micro' ? { micRequired: false } : {}),
    ...(filter === 'Hoy' ? { startsBefore: endOfDay(tz) } : {}),
  }), [filter]);
  const mine = data?.find((s) => s.members.some((m) => m.gamertag === player!.gamertag));
  const open = data?.filter((s) => s !== mine && s.status === 'open').slice(0, 12) ?? [];

  return (
    <Screen overline={`Horas en tu zona: ${zoneLabel(tz)}`} title="Escuadra">
      {mine && (
        <Card hud>
          <Text variant="overline" tone="accent">Tu próxima sesión · {countdown(mine.startsAt)}</Text>
          <Text variant="headline">{modeLabel(mine.mode)}</Text>
          <Text tone="textMuted">{dayTime(mine.startsAt, tz)} tu hora · {mine.map} · {difficultyLabel(mine.difficulty)} · {mine.members.length} de {mine.slots}</Text>
          <Button label="Ver planificador" onPress={() => router.push(`/escuadra/${mine.id}`)} />
        </Card>
      )}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />)}
      </View>
      <Section title="Sesiones abiertas">
        {!data ? <Loader error={error} onRetry={reload} /> : open.map((s) => (
          <Row key={s.id} icon="squad" iconColor={s.mode === 'horde_siege' ? color.highlight : color.text}
            title={`${modeLabel(s.mode)}${s.map ? ` · ${s.map}` : ''}`}
            subtitle={`${dayTime(s.startsAt, tz)} · ${s.language === 'es' ? 'Español' : 'Inglés'}${s.micRequired ? ' · micrófono' : ' · sin micro'}${s.difficulty ? ` · ${difficultyLabel(s.difficulty)}` : ''}`}
            trailing={`${s.members.length}/${s.slots}`} onPress={() => router.push(`/escuadra/${s.id}`)} />
        ))}
        {data && open.length === 0 && <Text tone="textMuted">No hay sesiones con ese filtro.</Text>}
      </Section>
    </Screen>
  );
}
