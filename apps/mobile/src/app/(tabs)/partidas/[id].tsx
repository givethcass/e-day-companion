// Per-match report: what happened, the figures, who played, and one lesson that links to what helps next time.
import type { MatchReport } from '@eday/api-types';
import type { Href } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useSession } from '@/api/session';
import { useNow } from '@/lib/clock';
import { modeLabel, roleLabel } from '@/lib/demo';
import { duration, isWin, outcome } from '@/lib/match';
import { clock, day } from '@/lib/time';
import { Icon } from '@/ui/Icon';
import { IconButton, Loader, Readouts, Screen, Text } from '@/ui/kit';
import { color, fontFamily, size, space } from '@/ui/theme';

type Line = NonNullable<MatchReport['scoreboard']>[number];

function headline(m: MatchReport) {
  if (m.mode === 'horde_siege') return m.result === 'completed' ? `Sobreviviste las ${m.waveGoal} oleadas` : `Llegaste a la oleada ${m.wavesCleared} de ${m.waveGoal}`;
  if (m.mode === 'campaign') return m.result === 'completed' ? 'Capítulo completado' : 'Misión fallida';
  return outcome(m) + (m.rankDelta ? ` · ${m.rankDelta > 0 ? '+' : ''}${m.rankDelta} pts` : '');
}

/** One block per wave: filled up to the wave reached. */
function Waves({ cleared, goal }: { cleared: number; goal: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${cleared} de ${goal} oleadas`}>
      {Array.from({ length: goal }, (_, i) => <View key={i} style={{ flex: 1, height: 8, backgroundColor: i < cleared ? color.primary : color.disabled }} />)}
    </View>
  );
}

function Board({ title, lines, horde }: { title: string; lines: Line[]; horde: boolean }) {
  return (
    <View>
      <Text variant="section" style={{ paddingBottom: 6 }}>{title}</Text>
      <View style={[styles.line, { minHeight: 0, paddingVertical: 6 }]}>
        <Text variant="overline" tone="textSubtle" style={styles.pos}>#</Text>
        <Text variant="overline" tone="textSubtle" style={{ flex: 1 }}>Jugador</Text>
        <Text variant="overline" tone="textSubtle" style={styles.num}>Puntos</Text>
        <Text variant="overline" tone="textSubtle" style={styles.num}>Bajas</Text>
      </View>
      {lines.map((l, i) => (
        <View key={l.gamertag} style={styles.line}>
          <Text variant="data" tone={l.isMe ? 'primary' : 'textSubtle'} style={styles.pos}>{String(i + 1).padStart(2, '0')}</Text>
          <View style={{ flex: 1, gap: 1 }}>
            <Text variant="bodyStrong" tone={l.isMe ? 'primary' : 'text'} numberOfLines={1}>{l.gamertag}{l.isMe ? ' (tú)' : ''}</Text>
            {horde && l.role ? <Text variant="caption" tone="textSubtle">{roleLabel(l.role)}</Text> : null}
          </View>
          <Text variant="data" style={[styles.num, { fontFamily: fontFamily.labelBold }]}>{l.score.toLocaleString('en-US')}</Text>
          <Text variant="data" tone="textMuted" style={styles.num}>{l.kills ?? '–'}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Reporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = useSession();
  const now = useNow();
  const tz = player!.timezone;
  const { data: m, error, reload } = useApi(() => api.getMatch(id, now), [id, now]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/partidas'))} />;
  if (!m) return <Screen title="Reporte" right={back}><Loader error={error} onRetry={reload} /></Screen>;

  const horde = m.mode === 'horde_siege';
  const board = m.scoreboard ?? [];
  const lesson = m.takeaway;
  return (
    <Screen title="Reporte" right={back}>
      <View style={styles.hero}>
        <Text variant="overline" tone="primary">{m.mode === 'campaign' ? m.map : `${modeLabel(m.mode)} · ${m.map}`}</Text>
        <Text variant="display" style={{ fontSize: 28, lineHeight: 30 }} tone={!horde && isWin(m) ? 'primary' : 'text'}>{headline(m)}</Text>
        <Text variant="data" tone="textSubtle">{day(m.endedAt, tz)} · {clock(m.endedAt, tz)} · {duration(m.durationSeconds)}</Text>
        {horde && m.wavesCleared != null && m.waveGoal ? <Waves cleared={m.wavesCleared} goal={m.waveGoal} /> : null}
      </View>
      <Readouts items={[
        { label: 'Bajas', value: String(m.kills ?? '–') },
        { label: 'Caídas', value: String(m.deaths ?? '–') },
        { label: 'Precisión', value: m.accuracy != null ? `${Math.round(m.accuracy * 100)}%` : '–' },
      ]} />
      {m.medals && m.medals.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {m.medals.map((x) => <Text key={x} variant="overline" tone="primary" style={styles.medal}>{x}</Text>)}
        </View>
      )}
      {horde && <Board title="Tu escuadra" lines={board} horde />}
      {m.mode.startsWith('versus') && (
        <>
          <Board title="Tu equipo" lines={board.filter((l) => l.team === 'COG')} horde={false} />
          <Board title="Rivales" lines={board.filter((l) => l.team !== 'COG')} horde={false} />
        </>
      )}
      {lesson && (
        <Pressable accessibilityRole={lesson.link ? 'button' : undefined} disabled={!lesson.link}
          onPress={() => lesson.link && router.push(lesson.link as Href)} style={styles.lesson}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="overline" tone="primary">Lección</Text>
            <Text>{lesson.text}</Text>
          </View>
          {lesson.link && <Icon name="chev" size={16} color={color.textSubtle} />}
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 8, padding: 14, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderLeftWidth: size.heroRule, borderLeftColor: color.primary },
  medal: { borderWidth: 1, borderColor: color.primary, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: size.touchTarget + 4, paddingVertical: 6, borderTopWidth: 1, borderTopColor: color.border },
  pos: { width: 24 },
  num: { width: 56, textAlign: 'right' },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderWidth: 1, borderColor: color.border, borderLeftWidth: size.heroRule, borderLeftColor: color.primary },
});
