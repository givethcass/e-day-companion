// Mi servicio: the full service record. The player's card with the medals they show in game, the career and kills
// as charts, every mode in charts, when they play, classes, medals, GTA-style curiosities, leaderboards, every match.
import type { MatchSummary, Mode, ServiceRecord } from '@eday/api-types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState, type ReactNode } from 'react';
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
import { Columns } from '@/ui/layout';
import { ColumnStrip, Donut, Meter, MODE_COLOR, OTHER, RankBars, SERIES, SplitBar } from '@/ui/Charts';

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

/** A titled chart block. */
function Chart({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={styles.chart}>
      <View style={{ gap: 2 }}>
        <Text variant="overline" tone="textMuted">{title}</Text>
        {note ? <Text variant="caption" tone="textSubtle">{note}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const ROLE_COLOR: Record<string, string> = { assault: SERIES[0], breacher: SERIES[1], marksman: SERIES[2], medic: SERIES[3] };
const winPct = (wins: number, matches: number) => Math.round((wins / Math.max(1, matches)) * 100);

/** One mode in charts, with the few figures that are single numbers kept as lines. */
function ModeDetail({ r, f }: { r: ServiceRecord; f: Family }) {
  if (f === 'versus') {
    const v = r.versus;
    return (
      <Columns>
        <Chart title="Resultados" note={`${v.matches} partidas · ${v.hoursPlayed} h`}>
          <SplitBar parts={[{ label: 'Victorias', value: v.wins }, { label: 'Derrotas', value: v.losses }, { label: 'Empates', value: v.draws }]}
            colors={[SERIES[0], OTHER, SERIES[1]]} />
          <View style={{ gap: 8 }}>
            <DataLine label="K/D" value={v.kd.toFixed(2)} tone="primary" />
            <DataLine label="Precisión media" value={pct(v.accuracy)} />
            <DataLine label="Mejor racha de victorias" value={String(v.bestWinStreak)} />
            <DataLine label="Más bajas en una partida" value={v.bestKills == null ? '–' : String(v.bestKills)} />
            <DataLine label="Rango" value={v.rank ? `${rankLabel(v.rank)} · ${v.rank.points} pts` : 'Sin rango'} />
          </View>
        </Chart>
        <Chart title="Victorias por modo" note="Porcentaje de partidas ganadas">
          <RankBars max={100} format={(x) => `${x}%`} items={v.byMode.map((x) => ({ label: modeLabel(x.mode), value: winPct(x.wins, x.matches), note: `${x.wins} de ${x.matches}` }))} />
        </Chart>
        <Chart title="Victorias por mapa" note="Ordenados por partidas jugadas">
          <RankBars max={100} format={(x) => `${x}%`} items={r.breakdown.versusByMap.map((x) => ({ label: x.map, value: winPct(x.wins, x.matches), note: `${x.wins} de ${x.matches}` }))} />
        </Chart>
      </Columns>
    );
  }
  if (f === 'horde') {
    const h = r.horde;
    return (
      <Columns>
        <Chart title="Tu mejor partida" note={`${h.matches} partidas · ${h.hoursPlayed} h`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Meter value={h.bestWave} goal={h.waveGoal} label="oleadas" />
            <View style={{ flex: 1, gap: 8 }}>
              <DataLine label="Completas" value={`${h.completed} de ${h.matches}`} tone="primary" />
              <DataLine label="Oleadas superadas" value={number(h.wavesCleared)} />
              <DataLine label="Bajas" value={number(h.kills)} />
            </View>
          </View>
        </Chart>
        <Chart title="Partidas por clase" note={h.mainRole ? `Tu clase principal es ${roleLabel(h.mainRole)}` : undefined}>
          <Donut unit="partidas" slices={r.classes.map((k) => ({ label: roleLabel(k.role), value: k.matches }))} colors={r.classes.map((k) => ROLE_COLOR[k.role])} />
        </Chart>
        <Chart title="Enemigos abatidos" note="Bajas en Horde por tipo de enemigo">
          <Donut unit="bajas" slices={r.breakdown.killsByEnemy} />
        </Chart>
        <Chart title="Mejor oleada por mapa" note={`Meta: ${h.waveGoal} oleadas`}>
          <RankBars max={h.waveGoal} items={h.byMap.map((x) => ({ label: x.map, value: x.bestWave, note: `${x.matches} ${x.matches === 1 ? 'partida' : 'partidas'}` }))} />
        </Chart>
      </Columns>
    );
  }
  const c = r.campaign;
  return (
    <Chart title="Historia" note={`${c.attempts} capítulos jugados · ${c.hoursPlayed} h`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Meter value={c.chaptersCompleted} goal={c.chaptersTotal} label="capítulos" />
        <View style={{ flex: 1, gap: 8 }}>
          <DataLine label="Avance" value={pct(c.chaptersCompleted / c.chaptersTotal)} tone="primary" />
          <DataLine label="Bajas" value={number(c.kills)} />
        </View>
      </View>
    </Chart>
  );
}

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const WEEK_NAME = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
/** Matches shown at first in Historial; the button adds this many more. */
const PAGE = 15;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

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
  const [shown, setShown] = useState(PAGE);
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
        <Columns>
          <Chart title="Tu tiempo por modo" note={c.firstMatchAt ? `Desde el ${day(c.firstMatchAt, tz)}` : undefined}>
            <Donut unit="horas" center={`${c.hoursPlayed} h`}
              slices={[{ label: 'Versus', value: r.versus.hoursPlayed }, { label: 'Horde', value: r.horde.hoursPlayed }, { label: 'Campaña', value: r.campaign.hoursPlayed }]}
              colors={[MODE_COLOR.versus, MODE_COLOR.horde, MODE_COLOR.campaign]} />
          </Chart>
          <View style={[styles.lines, { gap: 10 }]}>
            <DataLine label="Última partida" value={last} tone={c.daysSinceLastMatch ? 'primary' : 'text'} />
            <DataLine label="Días jugados" value={`${c.daysPlayed} · mejor racha ${c.bestDayStreak}`} />
            <DataLine label="Bajas / caídas" value={`${number(c.kills)} / ${number(c.deaths)}`} />
            <DataLine label="Precisión media" value={pct(c.accuracy)} />
          </View>
        </Columns>
      </Section>

      <View style={{ gap: 12 }}>
        <Text variant="section">Bajas</Text>
        <Chart title="Por modo" note={`${number(c.kills)} bajas en total`}>
          <SplitBar parts={r.breakdown.killsByMode} colors={[MODE_COLOR.versus, MODE_COLOR.horde, MODE_COLOR.campaign]} />
        </Chart>
        <Columns>
          <Chart title="Por arma" note="Versus y Horde, con armas y granadas">
            <Donut unit="bajas" slices={r.breakdown.killsByWeapon} />
          </Chart>
          <Chart title="Bajas especiales" note="Se traslapan: un disparo a la cabeza puede ser con Longshot">
            <RankBars items={r.breakdown.killsByType.map((x) => ({ ...x, note: pct(x.value / Math.max(1, c.kills)) }))} />
          </Chart>
        </Columns>
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="section">Por modo</Text>
        <Tabs items={FAMILIES.map(([, label]) => label)} selected={tab} onSelect={setPick} />
        <ModeDetail r={r} f={FAMILIES[tab][0]} />
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="section">Cuándo juegas</Text>
        <Columns>
          <Chart title="Por hora del día" note="Según la hora en que terminó cada partida">
            <ColumnStrip values={r.breakdown.activityByHour} labels={HOURS} ticks={[0, 6, 12, 18, 23]} name={(i) => `De ${HOURS[i]}:00 a ${HOURS[(i + 1) % 24]}:00`} />
          </Chart>
          <Chart title="Por día de la semana" note={c.favoriteWeekday ? `Juegas más los ${c.favoriteWeekday}` : undefined}>
            <ColumnStrip values={r.breakdown.activityByWeekday} labels={WEEK} ticks={[0, 1, 2, 3, 4, 5, 6]} name={(i) => WEEK_NAME[i]} />
          </Chart>
        </Columns>
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
              {`${k.nextLevelXp === null ? 'Nivel máximo' : `${number(k.nextLevelXp - k.xp)} XP para el nivel ${k.level + 1}`} · ${k.matches} ${k.matches === 1 ? 'partida' : 'partidas'}`}
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
        {FILTERS.map(([label], i) => <View key={label} style={{ flex: 1 }}><Chip label={label} selected={i === filter} onPress={() => { setFilter(i); setShown(PAGE); }} /></View>)}
      </View>
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Columns>{items.slice(0, shown).map((m) => <MatchRow key={m.id} m={m} tz={tz} />)}</Columns>
        {items.length === 0 && <Text tone="textMuted" style={{ paddingVertical: space.md }}>Sin partidas de este modo todavía.</Text>}
      </View>
      {items.length > shown && (
        <Button kind="secondary" label={`Ver ${Math.min(PAGE, items.length - shown)} más · ${items.length - shown} sin mostrar`} onPress={() => setShown(shown + PAGE)} />
      )}
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
  chart: { gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: color.border },
  trivia: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: color.border },
  fact: { width: '50%', paddingVertical: 12, paddingRight: 10, gap: 3 },
  factRight: { borderLeftWidth: 1, borderLeftColor: color.border, paddingLeft: 12 },
  factLow: { borderTopWidth: 1, borderTopColor: color.border },
});
