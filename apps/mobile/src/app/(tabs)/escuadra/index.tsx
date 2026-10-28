// Squad sessions with the filters players asked for: Spanish, no mic, today.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { difficultyLabel, modeLabel } from '@/lib/demo';
import { clock, countdown, dayTime, zoneLabel } from '@/lib/time';
import { Button, Card, Chip, DataLine, Loader, Row, Screen, Section, Text } from '@/ui/kit';
import { space } from '@/ui/theme';

const FILTERS = ['Todas', 'Español', 'Sin micro', 'Hoy'] as const;
const endOfDay = (now: string, tz: string) => {
  // Midnight tonight in the player's zone, as an instant: good enough for the demo's "Hoy" filter.
  const offset = new Date(now).toLocaleString('en-US', { timeZone: tz, hour12: false, hour: '2-digit' });
  return new Date(Date.parse(now) + (24 - Number(offset)) * 3600e3).toISOString();
};

export default function Escuadra() {
  const { player } = useSession();
  const tz = player!.timezone;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todas');
  const now = useNow();
  const { data, error, reload } = useApi(() => api.listSessions({
    startsAfter: now,
    ...(filter === 'Español' ? { language: 'es' } : {}),
    ...(filter === 'Sin micro' ? { micRequired: false } : {}),
    ...(filter === 'Hoy' ? { startsBefore: endOfDay(now, tz) } : {}),
  }), [filter, now]);
  const mine = data?.find((s) => s.members.some((m) => m.gamertag === player!.gamertag));
  const open = data?.filter((s) => s !== mine && s.status === 'open').slice(0, 12) ?? [];

  return (
    <Screen overline={`Horas en tu zona: ${zoneLabel(tz)}`} title="Escuadra">
      {mine && (
        <Card priority>
          <Text variant="overline" tone="primary">Próxima sesión · {countdown(mine.startsAt, now)}</Text>
          <Text variant="headline">{modeLabel(mine.mode)}{mine.map ? ` · ${mine.map}` : ''}</Text>
          <View style={{ gap: 5 }}>
            <DataLine label="Hora" value={`${dayTime(mine.startsAt, tz)} tu hora`} />
            <DataLine label="Dificultad" value={difficultyLabel(mine.difficulty)} />
            <DataLine label="Lugares" value={`${mine.members.length}/${mine.slots}`} tone="primary" />
          </View>
          <Button label="Abrir planificador" onPress={() => router.push(`/escuadra/${mine.id}`)} />
        </Card>
      )}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />)}
      </View>
      <Section title="Sesiones abiertas">
        {!data ? <Loader error={error} onRetry={reload} /> : open.map((s) => (
          <Row key={s.id} tag={dayTime(s.startsAt, tz).split(' ').slice(0, 2).join(' ').toUpperCase()} tagTone={s.mode === 'horde_siege' ? 'primary' : 'text'}
            title={`${modeLabel(s.mode)}${s.map ? ` · ${s.map}` : ''}`}
            subtitle={`${clock(s.startsAt, tz)} · ${s.language === 'es' ? 'Español' : 'Inglés'}${s.micRequired ? ' · micrófono' : ' · sin micro'}${s.difficulty ? ` · ${difficultyLabel(s.difficulty)}` : ''}`}
            trailing={`${s.members.length}/${s.slots}`} onPress={() => router.push(`/escuadra/${s.id}`)} />
        ))}
        {data && open.length === 0 && <Text tone="textMuted">No hay sesiones con ese filtro.</Text>}
      </Section>
    </Screen>
  );
}
