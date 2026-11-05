// Medal art drawn for the demo (no game assets): a faceted diamond in the tier's colour, outlined when locked.
import type { Medal, MedalTier, MedalUnlock } from '@eday/api-types';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { number } from '@/lib/demo';
import { earned, nextTier, TIER, topTier } from '@/lib/service';
import { day } from '@/lib/time';
import { Icon } from './Icon';
import { Text } from './kit';
import { color, size } from './theme';

export function MedalBadge({ tier, size = 40 }: { tier: MedalTier | null; size?: number }) {
  const fill = tier ? TIER[tier].color : '#0E0E0E';
  const edge = !tier ? '#3A3A3A' : tier === 'onyx' ? color.primary : 'rgba(0,0,0,0.35)';
  const mark = !tier ? '#3A3A3A' : tier === 'onyx' ? color.primary : 'rgba(0,0,0,0.55)';
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityLabel={tier ? `Medalla ${TIER[tier].label}` : 'Medalla bloqueada'}>
      <Polygon points="20,2 38,20 20,38 2,20" fill={fill} stroke={edge} strokeWidth={1.5} />
      <Polygon points="20,9 31,20 20,31 9,20" fill="none" stroke={mark} strokeWidth={1.5} />
      <Path d="M14.5 22.5L20 17l5.5 5.5" fill="none" stroke={mark} strokeWidth={2} strokeLinecap="square" />
    </Svg>
  );
}

/** Five squares, one per tier, filled up to the tiers earned. */
export function TierPips({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`${count} de 5 niveles`}>
      {Array.from({ length: 5 }, (_, i) => <View key={i} style={{ width: 8, height: 8, backgroundColor: i < count ? color.primary : color.disabled }} />)}
    </View>
  );
}

export function Progress({ value, goal }: { value: number; goal: number }) {
  return (
    <View style={{ height: 4, backgroundColor: color.disabled }}>
      <View style={{ height: 4, width: `${Math.min(100, (value / goal) * 100)}%`, backgroundColor: color.primary }} />
    </View>
  );
}

/** One medal series: its highest tier, the five pips, and either the last unlock or what is left for the next. */
export function MedalRow({ m, tz }: { m: Medal; tz: string }) {
  const top = topTier(m);
  const next = nextTier(m);
  const goal = next?.goal ?? m.tiers[4].goal;
  const subtitle = next
    ? `Te faltan ${number(next.goal - m.progress)} ${m.unit} para ${TIER[next.tier].label}`
    : `Serie completa · ${day(top!.unlockedAt!, tz)}`;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/servicio/medallas/${m.id}`)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      <MedalBadge tier={top?.tier ?? null} size={40} />
      <View style={{ flex: 1, gap: 4 }}>
        {m.equipped && <Text variant="overline" tone="primary" style={{ fontSize: 10, marginBottom: -2 }}>En tu tarjeta</Text>}
        <Text variant="bodyStrong" numberOfLines={1}>{m.name}</Text>
        <Text variant="caption" tone="textSubtle" numberOfLines={2}>{subtitle}</Text>
        <Progress value={m.progress} goal={goal} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text variant="data" tone={top ? 'text' : 'textSubtle'} style={{ fontSize: 13 }}>{earned(m)}/5</Text>
        <TierPips count={earned(m)} />
      </View>
      <Icon name="chev" size={16} color={color.textSubtle} />
    </Pressable>
  );
}

/** A tier the player unlocked, with the day. */
export function UnlockRow({ u, tz }: { u: MedalUnlock; tz: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/servicio/medallas/${u.medalId}`)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      <MedalBadge tier={u.tier} size={32} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>{u.name}</Text>
        <Text variant="caption" tone="textSubtle">{`${TIER[u.tier].label} · ${day(u.unlockedAt, tz)}`}</Text>
      </View>
      <Icon name="chev" size={16} color={color.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: size.touchTarget + 8, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.border },
});
