// Inicio in the official site's look: an ember hero with the week's objective (tabs switch to the
// alternatives), the week's figures, the latest official news, what is yours this week (squad and store),
// the season calendar, then a recap: the last match's lesson, the rival and the season.
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { number } from '@/lib/demo';
import { matchTitle, outcome } from '@/lib/match';
import { openLaunchUrl } from '@/lib/launch';
import { clock, day, dayTime } from '@/lib/time';
import { Art, Band, Button, Glow, IconButton, Loader, Readouts, Row, Screen, Section, Tabs, Text } from '@/ui/kit';
import { Featured, NewsRow } from '@/ui/News';
import { color, space } from '@/ui/theme';

const TAB: Record<string, string> = { versus_ranked: 'Ranked', horde_siege: 'Horde', campaign: 'Campaña', versus_tdm: 'Versus', versus_conquest: 'Versus' };

function Tile({ label, glow, title, body, cta, onPress }: { label: string; glow: string; title: string; body: string; cta: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flex: 1, gap: 6 }}>
      <Art label={label} glow={glow} />
      <Text variant="headline" tone="textSubtle" style={{ fontSize: 20, lineHeight: 21, textTransform: 'none' }}>{title}</Text>
      <Text variant="caption" tone="textMuted" style={{ flexGrow: 1 }}>{body}</Text>
      <Button compact label={cta} onPress={onPress} />
    </Pressable>
  );
}

export default function Inicio() {
  const { player } = useSession();
  const tz = player!.timezone;
  const now = useNow();
  const { data, error, reload } = useApi(async () => {
    const [week, wallet, season, sessions, rotation, news, calendar, notifications, clan, history] = await Promise.all([
      api.getMyWeek(now), api.getMyWallet(now), api.getCurrentSeason(), api.listSessions({ startsAfter: now }),
      api.getStoreRotation(now), api.listNews({ limit: 8, asOf: now }), api.listCalendar(now), api.listMyNotifications(now),
      player!.clanId ? api.getClan(player!.clanId) : null, api.listMyMatches({ limit: 1, asOf: now }),
    ]);
    const last = history.items[0] ? await api.getMatch(history.items[0].id, now) : null;
    return { week, wallet, season, sessions, rotation, news, calendar, clan, last, unread: notifications.filter((n) => !n.read).length };
  }, [now]);
  const [pick, setPick] = useState(0);
  const [sent, setSent] = useState<number | null>(null);
  // A new demo moment can bring different missions.
  useEffect(() => { setPick(0); setSent(null); }, [now]);

  if (!data) return <Screen title="Inicio"><Loader error={error} onRetry={reload} /></Screen>;
  const { week, wallet, season, sessions, rotation, news, calendar, clan, last, unread } = data;
  const weekNo = Math.floor((Date.parse(now) - Date.parse(season.startsAt)) / (7 * 864e5)) + 1;
  const weeks = Math.round((Date.parse(season.endsAt) - Date.parse(season.startsAt)) / (7 * 864e5));
  const missions = [week.nextMission, ...(week.nextMission.alternatives ?? [])];
  const m = missions[pick];
  const isMain = pick === 0;
  const main = week.nextMission;
  const body = isMain
    ? [main.reason, `Unos ${main.estimatedMinutes} minutos`, main.reward].filter(Boolean).join(' · ')
    : 'Otra opción según cómo juegas esta temporada.';
  const mine = sessions.filter((s) => s.members.some((x) => x.gamertag === player!.gamertag));
  const wished = rotation.items.filter((i) => i.wishlisted);
  const lead = news.find((n) => n.featured) ?? news[0];
  const latest = news.filter((n) => n !== lead).slice(0, 2);
  const shortDay = (iso: string) => day(iso, tz).split(' ').slice(1).join(' ');
  const localDate = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: tz });
  const inDays = (iso: string) => {
    const d = Math.round((Date.parse(localDate(iso)) - Date.parse(localDate(now))) / 864e5);
    return d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`;
  };
  const s0 = mine[0];
  const me = s0?.members.find((x) => x.gamertag === player!.gamertag);
  const w0 = wished[0];

  const hero = (
    <SafeAreaView edges={['top']}>
      <View style={styles.topBar}>
        <Text variant="headline" style={{ fontSize: 19, letterSpacing: 1 }}>E-Day <Text variant="headline" tone="primary" style={{ fontSize: 19, letterSpacing: 1 }}>Companion</Text></Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="overline" tone="textSubtle" style={{ fontSize: 13, letterSpacing: 0.8 }}>{`T${season.number} · Semana ${weekNo} de ${weeks}`}</Text>
          <IconButton icon="bell" label={`Avisos, ${unread} sin leer`} dot={unread > 0} onPress={() => router.push('/avisos')} />
        </View>
      </View>
      <View style={styles.hero}>
        <Glow />
        <Tabs items={missions.map((x) => TAB[x.mode] ?? x.mode)} selected={pick} onSelect={(i) => { setPick(i); setSent(null); }} />
        <Text variant="overline" tone="textMuted" style={{ marginTop: 18 }}>{isMain ? `Objetivo de la semana · ${player!.gamertag}` : 'Otra opción'}</Text>
        <Text variant="display" style={{ fontSize: 34, lineHeight: 34 }}>{m.title}</Text>
        <Text tone="textMuted" style={{ color: '#E2E0E0' }}>{body}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <Button compact label={sent === pick ? 'Enviado' : 'Desplegar'} kind={sent === pick ? 'secondary' : 'primary'}
            onPress={() => { setSent(pick); if (m.launchUrl) openLaunchUrl(m.launchUrl); }} />
          {sent === pick && <Text variant="caption" tone="textMuted" style={{ flex: 1 }}>Enviado a tu Xbox o PC.</Text>}
        </View>
      </View>
    </SafeAreaView>
  );

  return (
    <Screen edges={[]} bleed={hero}>
      <Readouts items={[
        { label: 'Inactivo', value: week.daysSinceLastMatch ? `${week.daysSinceLastMatch} días` : 'Hoy', tone: week.daysSinceLastMatch ? 'primary' : 'text' },
        { label: 'Retos', value: `${week.challengesDone} / ${week.challengesTotal}` },
        { label: 'Monedas', value: number(wallet.coins) },
      ]} />

      <Band title="Lo último" subtitle="Noticias oficiales de la temporada" />
      {lead && <Featured n={lead} tz={tz} />}
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
        {latest.map((n) => <NewsRow key={n.id} n={n} tz={tz} />)}
      </View>
      <Button kind="secondary" label="Todas las noticias" onPress={() => router.push('/noticias')} />

      <Band title="Esta semana" subtitle="Tu escuadra y tu tienda" />
      <View style={{ flexDirection: 'row', gap: 14 }}>
        {s0 && me && (
          <Tile label={`${day(s0.startsAt, tz) === day(now, tz) ? 'Hoy' : day(s0.startsAt, tz).split(' ').slice(0, 2).join(' ')} · ${clock(s0.startsAt, tz)}`} glow="#E50F11"
            title={`Horde Siege · ${s0.clanId === clan?.id ? clan?.name : s0.hostGamertag}`}
            body={`Escuadra ${me.squad}${me.confirmed ? ', confirmado' : ''} · ${s0.members.length} de ${s0.slots}`}
            cta="Ver escuadra" onPress={() => router.push(`/comunidad/escuadra/${s0.id}`)} />
        )}
        {w0 ? (
          <Tile label="En tu lista" glow="#7AA0BE" title={w0.name} body={`Volvió a la tienda · se va el ${day(rotation.endsAt, tz)}`}
            cta="Ver objeto" onPress={() => router.push(`/tienda/${w0.id}`)} />
        ) : (
          <Tile label="Tienda" glow="#7AA0BE" title={`${rotation.items.length} objetos esta semana`} body={`Rota el ${day(rotation.endsAt, tz)}`}
            cta="Ver tienda" onPress={() => router.push('/tienda')} />
        )}
      </View>
      <View>
        {mine.slice(1).map((s) => (
          <Row key={s.id} tag={day(s.startsAt, tz).split(' ').slice(0, 2).join(' ')} tagTone="primary" title={`Horde Siege · ${s.hostGamertag}`}
            subtitle={`${clock(s.startsAt, tz)} tu hora`} trailing={`${s.members.length}/${s.slots}`} onPress={() => router.push(`/comunidad/escuadra/${s.id}`)} />
        ))}
        {wished.slice(1).map((i) => (
          <Row key={i.id} tag="Tienda" title={`${i.name} disponible`} subtitle="Lista de deseos" trailing={number(i.price.amount)} trailingTone="text" onPress={() => router.push(`/tienda/${i.id}`)} />
        ))}
        <Row tag="Tienda" title={`${rotation.items.length} objetos · rota el ${day(rotation.endsAt, tz)}`}
          subtitle={`Tope de Monedas: ${number(wallet.coinsThisWeek)} de ${number(wallet.coinsWeeklyCap)}`} trailing={number(wallet.coins)} trailingTone="text"
          onPress={() => router.push('/tienda')} />
      </View>

      <Section title="Calendario">
        {calendar.slice(0, 5).map((e) => (
          <Row key={e.id} tag={shortDay(e.at)} tagTone={e.kind === 'event' ? 'primary' : 'textSubtle'} title={e.title}
            subtitle={`${dayTime(e.at, tz)} tu hora`} trailing={inDays(e.at)} trailingTone="text"
            onPress={e.link ? () => router.push(e.link as Href) : undefined} />
        ))}
      </Section>

      <Section title="Tu resumen">
        {last && (
          <Row tag="Última" tagTone="primary" title={`${matchTitle(last)} · ${outcome(last)}`}
            subtitle={last.takeaway?.text ?? day(last.endedAt, tz)} onPress={() => router.push(`/servicio/partidas/${last.id}`)} />
        )}
        {week.rival && (
          <Row tag="Rival" title={`${week.rival.gamertag}${week.rival.rank ? `, ${week.rival.rank}` : ''}`}
            subtitle={`Te lleva ${number(week.rival.pointsAhead ?? 0)} puntos`} onPress={() => router.push('/servicio/clasificacion')} />
        )}
        <Row tag="Semana" title={`${week.matchesPlayed} partidas · ${week.hoursPlayed} h`}
          subtitle={`Llevas el ${Math.round((week.seasonProgress ?? 0) * 100)}% de la temporada. Termina el ${day(season.endsAt, tz)}.`}
          onPress={() => router.push('/servicio')} />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: space.xl, paddingRight: space.sm, paddingTop: space.sm },
  hero: { paddingHorizontal: space.xl, paddingTop: 18, paddingBottom: 20, gap: 10, overflow: 'hidden' },
});
