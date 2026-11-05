// Mi servicio: the full service record. The player's card with the medals they show in game, the career,
// every mode in detail, medals (latest and what is missing), GTA-style curiosities, leaderboards, then every match.
import type { MatchSummary, Mode, ServiceRecord } from '@eday/api-types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { modeLabel, number, roleLabel } from '@/lib/demo';
import { openLaunchUrl } from '@/lib/launch';
import { isWin, matchTitle, outcome } from '@/lib/match';
import { FAMILIES, type Family, mainFamily, pct, rankLabel, TIER } from '@/lib/service';
import { day, dayTime } from '@/lib/time';
import { Icon } from '@/ui/Icon';
import { Button, Chip, DataLine, Loader, Readouts, Row, Screen, Section, Tabs, Text } from '@/ui/kit';
import { MedalBadge, Progress, UnlockRow } from '@/ui/Medal';
import { Emblem } from '@/ui/Service';
import { color, size, space } from '@/ui/theme';

const FILTERS: [string, Mode[] | null][] = [['Todo', null], ['Versus', ['versus_tdm', 'versus_conquest', 'versus_ranked']], ['Horde', ['horde_siege']], ['Campaña', ['campaign']]];

function MatchRow({ m, tz }: { m: MatchSummary; tz: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/servicio/partidas/${m.id}`)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>{matchTitle(m)}</Text>
        <Text variant="caption" tone="textSubtle">{dayTime(m.endedAt, tz)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text variant="overline" tone={isWin(m) && m.mode !== 'horde_siege' ? 'primary' : 'text'} style={{ fontSize: 12 }}>{outcome(m)}</Text>
        {m.kills !== undefined && <Text variant="data" tone="textMuted" style={{ fontSize: 13 }}>{m.kills} / {m.deaths} B/C</Text>}
      </View>
    </Pressable>
  );
}

/** Every figure for one mode, as label / value lines. */
function ModeDetail({ r, f }: { r: ServiceRecord; f: Family }) {
  let lines: [string, string, ('primary' | 'text')?][];
  if (f === 'versus') {
    const v = r.versus;
    lines = [
      ['Partidas', `${v.matches} · ${v.hoursPlayed} h`],
      ['Ganadas / perdidas / empates', `${v.wins} / ${v.losses} / ${v.draws}`],
      ['Porcentaje de victorias', pct(v.winRate), 'primary'],
      ['Mejor racha de victorias', String(v.bestWinStreak)],
      ['Bajas / caídas', `${number(v.kills)} / ${number(v.deaths)}`],
      ['K/D', v.kd.toFixed(2)],
      ['Precisión media', pct(v.accuracy)],
      ['Más bajas en una partida', v.bestKills == null ? '–' : String(v.bestKills)],
      ['Rango', v.rank ? `${rankLabel(v.rank)} · ${v.rank.points} pts` : 'Sin rango'],
      ['Mejor mapa', v.bestMap ? `${v.bestMap.map} · ${v.bestMap.wins} de ${v.bestMap.matches}` : '–'],
      ...v.byMode.map((x): [string, string] => [modeLabel(x.mode), `${x.wins} de ${x.matches} ganadas`]),
    ];
  } else if (f === 'horde') {
    const h = r.horde;
    lines = [
      ['Partidas', `${h.matches} · ${h.hoursPlayed} h`],
      ['Mejor oleada', `${h.bestWave} de ${h.waveGoal}`, 'primary'],
      ['Partidas completas', `${h.completed} de ${h.matches}`],
      ['Oleadas superadas', number(h.wavesCleared)],
      ['Bajas', number(h.kills)],
      ['Clase principal', h.mainRole ? roleLabel(h.mainRole) : '–'],
      ...h.byMap.map((x): [string, string] => [x.map, `oleada ${x.bestWave} · ${x.matches} partidas`]),
    ];
  } else {
    const c = r.campaign;
    lines = [
      ['Capítulos', `${c.chaptersCompleted} de ${c.chaptersTotal}`, 'primary'],
      ['Avance de la historia', pct(c.chaptersCompleted / c.chaptersTotal)],
      ['Capítulos jugados', String(c.attempts)],
      ['Bajas', number(c.kills)],
      ['Horas', String(c.hoursPlayed)],
    ];
  }
  return <View style={styles.lines}>{lines.map(([label, value, tone]) => <DataLine key={label} label={label} value={value} tone={tone} />)}</View>;
}

export default function Servicio() {
  const { player } = useSession();
  const tz = player!.timezone;
  const now = useNow();
  const { data, error, reload } = useApi(async () => {
    const [page, season, record, achievements] = await Promise.all([api.listMyMatches({ limit: 100, asOf: now }), api.getCurrentSeason(),
      api.getServiceRecord(now), api.listMyAchievements(now)]);
    return { matches: page.items, season, record, achievements };
  }, [now]);
  // Medals equipped on the Medallas screens show here on the way back (the first focus is the initial load).
  const focused = useRef(false);
  useFocusEffect(useCallback(() => { if (focused.current) reload(); focused.current = true; }, [reload]));
  const [filter, setFilter] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  if (!data) return <Screen title="Mi servicio"><Loader error={error} onRetry={reload} /></Screen>;
  const { matches, season, record: r, achievements } = data;
  const c = r.career;
  const tab = pick ?? FAMILIES.findIndex(([f]) => f === mainFamily(r));
  const modes = FILTERS[filter][1];
  const items = matches.filter((m) => !modes || modes.includes(m.mode));
  const slots = [0, 1, 2].map((i) => r.equipped[i] ?? null);
  const last = c.daysSinceLastMatch == null ? '–' : c.daysSinceLastMatch === 0 ? 'En las últimas 24 h' : `Hace ${c.daysSinceLastMatch} días`;
  return (
    <Screen overline={`Temporada ${season.number}`} title="Mi servicio" meta={`Nivel ${r.level}`}>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Emblem level={r.level} size={64} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="overline" tone="primary">{r.title}</Text>
            <Text variant="headline" style={{ fontSize: 26, lineHeight: 27 }} numberOfLines={1}>{r.gamertag}</Text>
            <Text variant="caption" tone="textSubtle">Así te ven en tu tarjeta del juego</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {slots.map((u, i) => (
            <Pressable key={u?.medalId ?? `empty${i}`} accessibilityRole="button" style={styles.slot}
              onPress={() => router.push(u ? `/servicio/medallas/${u.medalId}` : '/servicio/medallas')}>
              <MedalBadge tier={u?.tier ?? null} size={34} />
              <Text variant="caption" numberOfLines={2} style={{ textAlign: 'center', fontSize: 12, lineHeight: 15 }} tone={u ? 'text' : 'textSubtle'}>
                {u ? u.name : 'Espacio libre'}
              </Text>
              {u && <Text variant="overline" tone="textSubtle" style={{ fontSize: 10 }}>{TIER[u.tier].label}</Text>}
            </Pressable>
          ))}
        </View>
        <Button kind="secondary" label="Personalizar medallas" onPress={() => router.push('/servicio/medallas')} />
      </View>

      <Readouts items={[
        { label: 'Partidas', value: String(c.matches) },
        { label: 'Horas', value: String(c.hoursPlayed) },
        { label: 'K/D Versus', value: r.versus.kd.toFixed(2), tone: 'primary' },
      ]} />
      {!player!.rank && (
        <Pressable accessibilityRole="button" onPress={() => openLaunchUrl('edaycompanion://launch?mode=versus_ranked')} style={styles.callout}>
          <Text style={{ flex: 1 }}>Ranked abrió el 13 oct. Tus 3 primeras partidas definen tu rango.</Text>
          <Icon name="chev" size={16} color={color.textSubtle} />
        </Pressable>
      )}

      <Section title="Carrera">
        <View style={styles.lines}>
          <DataLine label="Primera partida" value={c.firstMatchAt ? day(c.firstMatchAt, tz) : '–'} />
          <DataLine label="Última partida" value={last} tone={c.daysSinceLastMatch ? 'primary' : 'text'} />
          <DataLine label="Días jugados" value={`${c.daysPlayed} · mejor racha ${c.bestDayStreak}`} />
          <DataLine label="Cuándo juegas más" value={[c.favoriteWeekday, c.favoriteHour].filter(Boolean).join(' · ') || '–'} />
          <DataLine label="Bajas / caídas" value={`${number(c.kills)} / ${number(c.deaths)}`} />
          <DataLine label="Precisión media" value={pct(c.accuracy)} />
          <DataLine label="Tu tiempo" value={`Versus ${pct(c.share.versus)} · Horde ${pct(c.share.horde)} · Campaña ${pct(c.share.campaign)}`} />
        </View>
      </Section>

      <View style={{ gap: 12 }}>
        <Text variant="section">Por modo</Text>
        <Tabs items={FAMILIES.map(([, label]) => label)} selected={tab} onSelect={setPick} />
        <ModeDetail r={r} f={FAMILIES[tab][0]} />
      </View>

      <Section title="Clases de Horde">
        {r.classes.map((k) => (
          <View key={k.role} style={styles.klass}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text variant="bodyStrong">{roleLabel(k.role)}</Text>
              <Text variant="data" tone={k.level === k.maxLevel ? 'primary' : 'text'}>{`Nivel ${k.level} de ${k.maxLevel}`}</Text>
            </View>
            <Progress value={k.nextLevelXp === null ? 1 : k.xp - k.levelXp} goal={k.nextLevelXp === null ? 1 : k.nextLevelXp - k.levelXp} />
            <Text variant="caption" tone="textSubtle">
              {k.nextLevelXp === null ? `Nivel máximo · ${k.matches} partidas` : `${number(k.nextLevelXp - k.xp)} XP para el nivel ${k.level + 1} · ${k.matches} partidas`}
            </Text>
          </View>
        ))}
      </Section>

      <Section title="Logros">
        <Row icon="trophy" tagTone="primary" title={`${number(achievements.gamerscore)} de ${number(achievements.gamerscoreTotal)} Gamerscore`}
          subtitle={`${achievements.unlocked} de ${achievements.items.length} logros · el último: ${achievements.items[0]?.unlockedAt ? achievements.items[0].name : 'ninguno'}`}
          onPress={() => router.push('/servicio/logros')} />
      </Section>

      <Section title="Medallas">
        <Row icon="trophy" tagTone="primary" title={`${r.medals.earned} de ${r.medals.total} niveles`}
          subtitle={`${r.medals.seriesCompleted} de ${r.medals.seriesTotal} series completas · ve las que te faltan`}
          onPress={() => router.push('/servicio/medallas')} />
        {r.medals.latest.filter((u, i, all) => all.findIndex((x) => x.medalId === u.medalId) === i).slice(0, 3).map((u) => <UnlockRow key={`${u.medalId}-${u.tier}`} u={u} tz={tz} />)}
      </Section>

      {r.trivia.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text variant="section">Curiosidades</Text>
          <Text variant="caption" tone="textSubtle">Lo que el juego cuenta y nadie te dice.</Text>
          <View style={styles.trivia}>
            {r.trivia.map((t, i) => (
              <View key={t.id} style={[styles.fact, i % 2 === 1 && styles.factRight, i >= 2 && styles.factLow]}>
                <Text variant="overline" tone="textSubtle" style={{ fontSize: 11 }}>{t.label}</Text>
                <Text variant="headline" style={{ fontSize: 22, lineHeight: 24, textTransform: 'none' }}>{t.value}</Text>
                {t.detail ? <Text variant="caption" tone="textMuted">{t.detail}</Text> : null}
              </View>
            ))}
          </View>
        </View>
      )}

      <Row icon="bars" title="Clasificaciones" subtitle="Horde por mejor oleada y Ranked por puntos" onPress={() => router.push('/servicio/clasificacion')} />
      <Text variant="section">Historial</Text>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {FILTERS.map(([label], i) => <View key={label} style={{ flex: 1 }}><Chip label={label} selected={i === filter} onPress={() => setFilter(i)} /></View>)}
      </View>
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
        {items.map((m) => <MatchRow key={m.id} m={m} tz={tz} />)}
        {items.length === 0 && <Text tone="textMuted" style={{ paddingVertical: space.md }}>Sin partidas de este modo todavía.</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: size.touchTarget + 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.border },
  callout: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderLeftWidth: size.heroRule, borderLeftColor: color.primary },
  card: { gap: 14, padding: 14, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderLeftWidth: size.heroRule, borderLeftColor: color.primary },
  slot: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 4, borderWidth: 1, borderColor: color.border, backgroundColor: color.bg },
  klass: { gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.border },
  lines: { gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.border },
  trivia: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: color.border },
  fact: { width: '50%', paddingVertical: 12, paddingRight: 10, gap: 3 },
  factRight: { borderLeftWidth: 1, borderLeftColor: color.border, paddingLeft: 12 },
  factLow: { borderTopWidth: 1, borderTopColor: color.border },
});
