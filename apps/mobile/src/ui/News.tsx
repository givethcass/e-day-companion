// News pieces shared by Noticias and Inicio: the lead story and a dated row.
import type { NewsSummary } from '@eday/api-types';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { NEWS_TAG } from '@/lib/news';
import { day } from '@/lib/time';
import { Art, Text } from './kit';
import { color, size } from './theme';

const open = (n: NewsSummary) => router.push(`/noticias/${n.id}`);
const meta = (n: NewsSummary, tz: string) => `${NEWS_TAG[n.tag].label} · ${day(n.publishedAt, tz)} · ${n.readMinutes} min`;

/** The lead story: wide art, headline and summary. */
export function Featured({ n, tz }: { n: NewsSummary; tz: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => open(n)} style={{ gap: 8 }}>
      <Art glow={NEWS_TAG[n.tag].glow} height={132} label={NEWS_TAG[n.tag].label} />
      <Text variant="headline" style={{ fontSize: 24, lineHeight: 25 }}>{n.title}</Text>
      <Text tone="textMuted">{n.summary}</Text>
      <Text variant="data" tone="textSubtle">{day(n.publishedAt, tz)} · {n.readMinutes} min de lectura</Text>
    </Pressable>
  );
}

export function NewsRow({ n, tz }: { n: NewsSummary; tz: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => open(n)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      <Text variant="overline" tone={n.tag === 'patch' ? 'primary' : 'textSubtle'} style={{ fontSize: 12 }}>{meta(n, tz)}</Text>
      <Text variant="bodyStrong">{n.title}</Text>
      <Text variant="caption" tone="textSubtle" numberOfLines={2}>{n.summary}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4, minHeight: size.touchTarget + 8, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.border },
});
