// Cara a cara with one player: both cards on top, the score, the verdict, and every row as a bar that leans
// toward whoever leads it.
import type { CompareRow, CompareSide } from '@eday/api-types';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { fmtRow, GROUP, GROUPS, MAIN_MODE, THEM } from '@/lib/compare';
import { roleLabel } from '@/lib/demo';
import { rankLabel } from '@/lib/service';
import { Button, Card, IconButton, Loader, Screen, Text } from '@/ui/kit';
import { Columns } from '@/ui/layout';
import { color } from '@/ui/theme';

function Side({ s, tint, align }: { s: CompareSide; tint: string; align: 'left' | 'right' }) {
  const a = align === 'right' ? 'right' : 'left';
  return (
    <View style={{ flex: 1, gap: 2, alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <View style={{ height: 3, width: 28, backgroundColor: tint, marginBottom: 6 }} />
      <Text variant="headline" style={{ fontSize: 22, textAlign: a }} numberOfLines={1}>{s.gamertag}</Text>
      <Text variant="caption" tone="textMuted" style={{ textAlign: a }}>{`Nv ${s.level} · ${rankLabel(s.rank)}`}</Text>
      <Text variant="caption" tone="textSubtle" style={{ textAlign: a }} numberOfLines={2}>
        {[s.mainMode && MAIN_MODE[s.mainMode], s.mainRole && roleLabel(s.mainRole), s.favoriteWeapon?.name].filter(Boolean).join(' · ')}
      </Text>
    </View>
  );
}

function Line({ r }: { r: CompareRow }) {
  const total = r.me + r.them || 1;
  return (
    <View style={styles.line} accessible accessibilityLabel={`${r.label}: tú ${fmtRow(r, r.me)}, rival ${fmtRow(r, r.them)}`}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text variant="data" tone={r.winner === 'me' ? 'primary' : 'textMuted'} style={[styles.value, r.winner === 'me' && styles.win]}>{fmtRow(r, r.me)}</Text>
        <Text variant="caption" tone="textSubtle" style={{ flex: 1, textAlign: 'center' }}>{r.label}</Text>
        <Text variant="data" tone={r.winner === 'them' ? 'text' : 'textMuted'} style={[styles.value, { textAlign: 'right' }, r.winner === 'them' && [styles.win, { color: THEM }]]}>{fmtRow(r, r.them)}</Text>
      </View>
      <View style={styles.bar}>
        <View style={{ flex: r.me / total, backgroundColor: r.winner === 'me' ? color.primary : '#5a1a16' }} />
        <View style={{ width: 2 }} />
        <View style={{ flex: r.them / total, backgroundColor: r.winner === 'them' ? THEM : '#16403d' }} />
      </View>
    </View>
  );
}

export default function CaraACara() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const now = useNow();
  const { data: c, error, reload } = useApi(() => api.compareWith(tag, now), [tag, now]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/comunidad/cara-a-cara'))} />;
  if (!c) return <Screen overline="Cara a cara" title={tag} right={back}><Loader error={error} onRetry={reload} /></Screen>;
  return (
    <Screen overline="Cara a cara" title={`Tú contra ${c.them.gamertag}`} right={back}>
      <View style={styles.sides}>
        <Side s={c.me} tint={color.primary} align="left" />
        <View style={styles.score}>
          <Text variant="headline" style={{ fontSize: 40, lineHeight: 44 }}>
            <Text variant="headline" tone="primary" style={{ fontSize: 40 }}>{c.score.me}</Text>
            <Text variant="headline" tone="textSubtle" style={{ fontSize: 28 }}>{' – '}</Text>
            <Text variant="headline" style={{ fontSize: 40, color: THEM }}>{c.score.them}</Text>
          </Text>
          {c.score.ties > 0 && <Text variant="caption" tone="textSubtle">{`${c.score.ties} ${c.score.ties === 1 ? 'empate' : 'empates'}`}</Text>}
        </View>
        <Side s={c.them} tint={THEM} align="right" />
      </View>
      <Card priority><Text>{c.verdict}</Text></Card>
      <Columns>
        {GROUPS.map((g) => (
          <View key={g}>
            <Text variant="section" style={{ paddingBottom: 6 }}>{GROUP[g]}</Text>
            {c.rows.filter((r) => r.group === g).map((r) => <Line key={r.id} r={r} />)}
          </View>
        ))}
      </Columns>
      <Button kind="secondary" label="Comparar con otro amigo" onPress={() => router.push('/comunidad/cara-a-cara')} />
      {!c.friends && <Text variant="caption" tone="textSubtle">{`${c.them.gamertag} no está en tu lista de amigos; su perfil es público en la clasificación.`}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sides: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  score: { alignItems: 'center', paddingHorizontal: 4 },
  line: { gap: 6, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.border },
  value: { width: 72, fontSize: 16 },
  win: { fontSize: 18 },
  bar: { flexDirection: 'row', height: 6 },
});
