// Tu temporada: the season so far as a run of cards, one at a time like stories. Tap the right half for the next
// card and the left half to go back; every card can open what it talks about. Share sends a short text.
import type { RecapCard } from '@eday/api-types';
import { router } from 'expo-router';
import { useId, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { SERIES } from '@/ui/Charts';
import { Button, IconButton, Loader, Screen, Text } from '@/ui/kit';
import { Columns, useLayout } from '@/ui/layout';
import { color, space } from '@/ui/theme';

const ACCENT: Record<RecapCard['kind'], string> = {
  intro: '#E50F11', time: SERIES[1], mode: SERIES[2], weapon: SERIES[0], map: SERIES[3], match: SERIES[4], rank: '#9AA3AD', medals: SERIES[2], outro: '#E50F11',
};

function Story({ c, tall }: { c: RecapCard; tall?: boolean }) {
  const id = `recap${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const big = c.kind === 'intro' || c.value.length <= 7;
  return (
    <View style={[styles.story, tall && { minHeight: 380 }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0" stopColor={ACCENT[c.kind]} stopOpacity={0.55} />
              <Stop offset="0.7" stopColor="#0B0B0B" stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </View>
      <Text variant="overline" style={{ color: 'rgba(255,255,255,0.8)' }}>{c.overline}</Text>
      <View style={{ flex: 1, justifyContent: 'flex-end', gap: 8 }}>
        <Text variant="display" style={{ fontSize: big ? 64 : 40, lineHeight: big ? 64 : 42 }} numberOfLines={2} adjustsFontSizeToFit>{c.value}</Text>
        <Text variant="headline" style={{ fontSize: 24, lineHeight: 26 }}>{c.title}</Text>
        {c.detail ? <Text tone="textMuted">{c.detail}</Text> : null}
      </View>
    </View>
  );
}

export default function Temporada() {
  const now = useNow();
  const { wide } = useLayout();
  const { data, error, reload } = useApi(() => api.getSeasonRecap(now), [now]);
  const [i, setI] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/servicio'))} />;
  if (!data) return <Screen title="Tu temporada" right={back}><Loader error={error} onRetry={reload} /></Screen>;

  const cards = data.cards;
  const at = Math.min(i, cards.length - 1);
  const c = cards[at];
  const share = async () => {
    try {
      // Desktop browsers have no share sheet: copy the text instead.
      const nav = typeof navigator === 'undefined' ? null : (navigator as Navigator & { share?: unknown });
      if (Platform.OS === 'web' && nav && !nav.share) {
        await nav.clipboard.writeText(data.shareText);
        setNote('Texto copiado. Pégalo donde quieras compartirlo.');
      } else {
        await Share.share({ message: data.shareText });
      }
    } catch {
      setNote(data.shareText);
    }
  };

  return (
    <Screen overline={`Temporada ${data.season.number} · ${data.season.name}`} title="Tu temporada" right={back}>
      <View style={[{ gap: 10 }, wide && { width: '100%', maxWidth: 560, alignSelf: 'center' }]}>
        <View style={styles.segments} accessibilityLabel={`Tarjeta ${at + 1} de ${cards.length}`}>
          {cards.map((x, k) => <View key={x.id} style={[styles.segment, k <= at && { backgroundColor: color.text }]} />)}
        </View>
        <View>
          <Story c={c} tall />
          <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Tarjeta anterior" disabled={at === 0} onPress={() => setI(at - 1)} style={{ flex: 1 }} />
            <Pressable accessibilityRole="button" accessibilityLabel="Tarjeta siguiente" disabled={at === cards.length - 1} onPress={() => setI(at + 1)} style={{ flex: 2 }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <View style={{ flex: 1 }}><Button kind="secondary" label="Anterior" disabled={at === 0} onPress={() => setI(at - 1)} /></View>
          <View style={{ flex: 1 }}>{at < cards.length - 1
            ? <Button label="Siguiente" onPress={() => setI(at + 1)} />
            : <Button label="Ver de nuevo" onPress={() => setI(0)} />}</View>
        </View>
        {c.link ? <Button kind="secondary" label="Ver detalle" onPress={() => router.push(c.link as never)} /> : null}
        {note ? <Text variant="caption" tone="textMuted">{note}</Text> : null}
      </View>
      {wide && (
        <View style={{ gap: 10 }}>
          <Text variant="section">Todo tu resumen</Text>
          <Columns gap={14}>{cards.map((x) => <View key={x.id} style={{ paddingBottom: 14 }}><Story c={x} /></View>)}</Columns>
        </View>
      )}
      <Button kind="secondary" label="Compartir mi temporada" onPress={share} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  story: { minHeight: 240, padding: 20, gap: 12, overflow: 'hidden', borderWidth: 1, borderColor: color.border, backgroundColor: '#0B0B0B' },
  segments: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 3, backgroundColor: color.border },
});
