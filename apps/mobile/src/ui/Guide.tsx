// A guide in a list: section art, who wrote it, title and reading time.
import type { GuideSummary } from '@eday/api-types';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { GUIDE_SECTION } from '@/lib/guides';
import { Icon } from './Icon';
import { Art, Text } from './kit';
import { color, size } from './theme';

export function GuideRow({ g }: { g: GuideSummary }) {
  const official = g.author.kind === 'official';
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/guias/${g.id}`)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      <View style={{ width: 64 }}><Art glow={GUIDE_SECTION[g.section].glow} height={64} /></View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="overline" tone={official ? 'primary' : 'textSubtle'} style={{ fontSize: 11 }}>
          {official ? 'Oficial' : `Creador · ${g.author.name}`}{g.patch ? ` · al día con el ${g.patch}` : ''}
        </Text>
        <Text variant="bodyStrong" numberOfLines={2}>{g.title}</Text>
        <Text variant="caption" tone="textSubtle" numberOfLines={1}>{`${GUIDE_SECTION[g.section].short} · ${g.readMinutes} min`}</Text>
      </View>
      <Icon name="chev" size={16} color={color.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: size.touchTarget + 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.border },
});
