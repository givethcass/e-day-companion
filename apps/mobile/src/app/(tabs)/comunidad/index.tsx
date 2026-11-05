// Comunidad: the next session, squads with the filters players asked for (Spanish, no mic, today), the clan,
// creators and one collaboration slot.
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
import { CreatorRow } from '@/ui/Creator';
import { PromoCard } from '@/ui/Promo';
import { color, space } from '@/ui/theme';
import { Columns } from '@/ui/layout';

const FILTERS = ['Todas', 'Español', 'Sin micro', 'Hoy'] as const;
const endOfDay = (now: string, tz: string) => {
  // Midnight tonight in the player's zone, as an instant: good enough for the demo's "Hoy" filter.
  const offset = new Date(now).toLocaleString('en-US', { timeZone: tz, hour12: false, hour: '2-digit' });
  return new Date(Date.parse(now) + (24 - Number(offset)) * 3600e3).toISOString();
};

export default function Comunidad() {
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
  const { data: extra } = useApi(async () => {
    const [clan, creators, promos] = await Promise.all([player!.clanId ? api.getClan(player!.clanId) : null, api.listCreators(), api.listPromos('community')]);
    return { clan, creators, promo: promos[0] };
  }, []);
  const mine = data?.find((s) => s.members.some((m) => m.gamertag === player!.gamertag));
  const open = data?.filter((s) => s !== mine && s.status === 'open').slice(0, 6) ?? [];

  return (
    <Screen overline={`Horas en tu zona: ${zoneLabel(tz)}`} title="Comunidad">
      {mine && (
        <Card priority>
          <Text variant="overline" tone="primary">Próxima sesión · {countdown(mine.startsAt, now)}</Text>
          <Text variant="headline">{modeLabel(mine.mode)}{mine.map ? ` · ${mine.map}` : ''}</Text>
          <View style={{ gap: 5 }}>
            <DataLine label="Hora" value={`${dayTime(mine.startsAt, tz)} tu hora`} />
            <DataLine label="Dificultad" value={difficultyLabel(mine.difficulty)} />
            <DataLine label="Lugares" value={`${mine.members.length}/${mine.slots}`} tone="primary" />
          </View>
          <Button label="Abrir planificador" onPress={() => router.push(`/comunidad/escuadra/${mine.id}`)} />
        </Card>
      )}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />)}
      </View>
      <Section title="Escuadras abiertas">
        {!data ? <Loader error={error} onRetry={reload} /> : <Columns>{open.map((s) => (
          <Row key={s.id} tag={dayTime(s.startsAt, tz).split(' ').slice(0, 2).join(' ').toUpperCase()} tagTone={s.mode === 'horde_siege' ? 'primary' : 'text'}
            title={`${modeLabel(s.mode)}${s.map ? ` · ${s.map}` : ''}`}
            subtitle={`${clock(s.startsAt, tz)} · ${s.language === 'es' ? 'Español' : 'Inglés'}${s.micRequired ? ' · micrófono' : ' · sin micro'}${s.difficulty ? ` · ${difficultyLabel(s.difficulty)}` : ''}`}
            trailing={`${s.members.length}/${s.slots}`} onPress={() => router.push(`/comunidad/escuadra/${s.id}`)} />
        ))}</Columns>}
        {data && open.length === 0 && <Text tone="textMuted">No hay sesiones con ese filtro.</Text>}
      </Section>
      {extra?.clan && (
        <Section title="Tu clan">
          <Row tag={`[${extra.clan.tag}]`} tagTone="primary" title={extra.clan.name}
            subtitle={`${extra.clan.memberCount} miembros · ${(n => `${n} ${n === 1 ? 'sesión próxima' : 'sesiones próximas'}`)(extra.clan.upcomingSessions?.length ?? 0)} · clasificación de Horde`}
            onPress={() => router.push('/comunidad/clan')} />
        </Section>
      )}
      {extra?.promo && <PromoCard p={extra.promo} />}
      {extra && (
        <View>
          <Text variant="section" style={{ paddingBottom: 6 }}>Creadores</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
            <Columns>{extra.creators.slice(0, 3).map((c) => <CreatorRow key={c.id} c={c} />)}</Columns>
          </View>
          <View style={{ marginTop: 12 }}><Button kind="secondary" label="Ver todos los creadores" onPress={() => router.push('/comunidad/creadores')} /></View>
        </View>
      )}
    </Screen>
  );
}
