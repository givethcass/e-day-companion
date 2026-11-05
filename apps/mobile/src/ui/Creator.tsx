// A content creator: live badge or platform, name, what they cover and their latest video or stream.
import type { Creator } from '@eday/api-types';
import { StyleSheet, View } from 'react-native';
import { number } from '@/lib/demo';
import { Text } from './kit';
import { color } from './theme';

const compact = (n: number) => (n >= 1000 ? `${number(Math.round(n / 1000))} mil` : String(n));

export function CreatorRow({ c }: { c: Creator }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, c.live && styles.live]}>
        <Text variant="headline" style={{ fontSize: 20 }}>{c.name.slice(0, 1)}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="overline" tone={c.live ? 'primary' : 'textSubtle'} style={{ fontSize: 11 }}>
          {[c.live ? 'En vivo ahora' : c.platform === 'twitch' ? 'Twitch' : 'YouTube', `${compact(c.followers)} seguidores`, c.language === 'es' ? 'Español' : 'Inglés'].join(' · ')}
        </Text>
        <Text variant="bodyStrong">{c.name}</Text>
        <Text variant="caption" tone="textSubtle">{c.focus}{c.guides ? ` · ${c.guides} ${c.guides === 1 ? 'guía' : 'guías'} en la app` : ''}</Text>
        <Text variant="caption" tone="textMuted" numberOfLines={2}>{c.live ? `Transmitiendo: ${c.latest.title}` : `Último video: ${c.latest.title}${c.latest.minutes ? ` (${c.latest.minutes} min)` : ''}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.border },
  avatar: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface, borderWidth: 1, borderColor: color.border },
  live: { borderColor: color.primary, borderWidth: 2 },
});
