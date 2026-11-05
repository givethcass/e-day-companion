// A sponsored or collaboration slot. Always labelled, set apart from official content, and in the demo the
// partners are invented brands: the card only shows where an official app could place partner content.
import type { Promo } from '@eday/api-types';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Art, Text } from './kit';
import { color } from './theme';

export function PromoCard({ p }: { p: Promo }) {
  const label = p.kind === 'sponsored' ? 'Patrocinado' : 'Colaboración';
  const go = () => (p.cta.link ? router.push(p.cta.link as Href) : undefined);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${p.partner}. ${p.title}`} onPress={go} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={{ width: 92 }}><Art glow={p.glow ?? '#7AA0BE'} height={92} /></View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="overline" tone="textSubtle" style={{ fontSize: 10 }}>{`${label} · ${p.partner}`}</Text>
        <Text variant="bodyStrong" numberOfLines={2}>{p.title}</Text>
        <Text variant="caption" tone="textMuted" numberOfLines={3}>{p.body}</Text>
        <Text variant="overline" tone="primary" style={{ fontSize: 11, marginTop: 2 }}>{p.cta.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 10, borderWidth: 1, borderColor: color.border, borderStyle: 'dashed', backgroundColor: color.surface },
});
