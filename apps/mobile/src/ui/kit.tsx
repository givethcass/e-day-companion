// Building blocks for direction C, the look of the official site: black pages, solid red buttons, condensed
// uppercase titles, a red band that fades to black, square corners and hairlines between rows.
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text as RNText, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSession } from '@/api/session';
import { useClock } from '@/lib/clock';
import { dayTime } from '@/lib/time';
import { Icon, type IconName } from './Icon';
import { color, radius, size, space, type } from './theme';

export function Text({ variant = 'body', tone, style, ...rest }: TextProps & { variant?: keyof typeof type; tone?: keyof typeof color }) {
  return <RNText {...rest} style={[type[variant], tone && { color: color[tone] }, style]} />;
}

/** Surface panel. `priority` adds the red rule used on the one card that asks for action. */
export function Card({ children, priority, style }: { children: ReactNode; priority?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, priority && styles.priority, style]}>{children}</View>;
}

/** Solid red button with white label; `secondary` is the outlined black one. */
export function Button({ label, onPress, kind = 'primary', disabled, compact }: {
  label: string; onPress?: () => void; kind?: 'primary' | 'secondary'; disabled?: boolean; compact?: boolean;
}) {
  const primary = kind === 'primary' && !disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, compact && styles.buttonCompact, !primary && styles.buttonSecondary, pressed && { opacity: 0.85 }]}
    >
      <Text variant="button" style={{ color: primary ? color.onAction : color.text }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label }: { label: string }) {
  return <Text variant="overline" style={styles.badge}>{label}</Text>;
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipOn]}>
      <Text variant="overline" style={{ color: selected ? color.onAction : color.textMuted, letterSpacing: 0.8 }}>{label}</Text>
    </Pressable>
  );
}

/** Text tabs with a red underline on the selected one, as in the site's media section. */
export function Tabs({ items, selected, onSelect }: { items: string[]; selected: number; onSelect: (i: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 18 }}>
      {items.map((label, i) => (
        <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: i === selected }} onPress={() => onSelect(i)}
          style={{ paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: i === selected ? color.primary : 'transparent' }}>
          <Text variant="overline" tone={i === selected ? 'text' : 'textSubtle'} style={{ fontSize: 13 }}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** A row of figures divided by hairlines: "INACTIVO 15 DÍAS · RETOS 0 / 6 · MONEDAS 16,000". */
export function Readouts({ items }: { items: { label: string; value: string; tone?: keyof typeof color }[] }) {
  return (
    <View style={styles.readouts}>
      {items.map((it, i) => (
        <View key={it.label} style={[styles.readout, i > 0 && { borderLeftWidth: 1, borderLeftColor: color.border, paddingLeft: 14 }]}>
          <Text variant="overline" tone="textSubtle" style={{ fontSize: 11 }}>{it.label}</Text>
          <Text variant="stat" tone={it.tone} numberOfLines={1} adjustsFontSizeToFit>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Label / value line, as in "Tiempo estimado ~45 min". */
export function DataLine({ label, value, tone = 'text' }: { label: string; value: string; tone?: keyof typeof color }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
      <Text variant="data" tone="textSubtle">{label}</Text>
      <Text variant="data" tone={tone} style={{ flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

/** List row: a short tag (VIE 30, TIENDA), the entry, and a figure on the right. */
export function Row({ tag, tagTone = 'textSubtle', icon, title, subtitle, trailing, trailingTone = 'primary', onPress }: {
  tag?: string; tagTone?: keyof typeof color; icon?: IconName; title: string; subtitle?: string; trailing?: string; trailingTone?: keyof typeof color; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      {tag !== undefined ? <Text variant="overline" tone={tagTone} style={styles.tag} numberOfLines={1}>{tag}</Text> : null}
      {icon && <Icon name={icon} size={18} color={color[tagTone]} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="caption" tone="textSubtle" numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text variant="data" tone={trailingTone} style={{ fontSize: 15 }}>{trailing}</Text> : null}
      {onPress && <Icon name="chev" size={16} color={color.textSubtle} />}
    </Pressable>
  );
}

/** A titled list: condensed uppercase title, rows divided by hairlines, closed by one at the bottom. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text variant="section" style={{ paddingBottom: 6 }}>{title}</Text>
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>{children}</View>
    </View>
  );
}

/** The site's section header: deep red fading to black, centred title, a white rule underneath. Bleeds to the screen edges. */
export function Band({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.band}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="band" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color.band} />
              <Stop offset="1" stopColor={color.bg} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#band)" />
        </Svg>
      </View>
      <Text variant="headline" style={{ fontSize: 24, textAlign: 'center' }}>{title}</Text>
      {subtitle ? <Text variant="caption" tone="textMuted" style={{ textAlign: 'center' }}>{subtitle}</Text> : null}
      <View style={styles.bandRule} />
    </View>
  );
}

/** Ember glow behind a hero: original art standing in for the site's key-art blades. */
export function Glow() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#120404" />
            <Stop offset="1" stopColor={color.bg} />
          </LinearGradient>
          <RadialGradient id="ember" cx="70%" cy="100%" rx="80%" ry="75%">
            <Stop offset="0" stopColor="#E50F11" stopOpacity={0.55} />
            <Stop offset="0.45" stopColor={color.band} stopOpacity={0.35} />
            <Stop offset="1" stopColor={color.bg} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#shade)" />
        <Rect width="100%" height="100%" fill="url(#ember)" />
      </Svg>
    </View>
  );
}

export function Disclaimer() {
  return <Text variant="legal" tone="textFaint" style={{ marginTop: space.md }}>Concepto no oficial con datos simulados. No afiliado a Microsoft ni a The Coalition.</Text>;
}

/** Footer link to the demo clock, so whoever watches the demo can move time forward. */
export function DemoClock() {
  const { now } = useClock();
  const { player } = useSession();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Cambiar el reloj de demo" onPress={() => router.push('/reloj')} style={styles.clock}>
      <Icon name="clock" size={16} color={color.textSubtle} />
      <Text variant="data" tone="textSubtle" style={{ flex: 1 }}>Reloj de demo: {dayTime(now, player?.timezone ?? 'America/Mexico_City')}</Text>
      <Text variant="overline" tone="primary">Cambiar</Text>
    </Pressable>
  );
}

/** Screen frame: safe area, scroll, header over a hairline, the unofficial-concept notice at the bottom. */
export function Screen({ title, overline, meta, right, children, edges = ['top'], bleed }: {
  title?: string; overline?: string; meta?: string; right?: ReactNode; children: ReactNode; edges?: ('top' | 'bottom')[]; bleed?: ReactNode;
}) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        {bleed}
        <View style={styles.content}>
          {title && (
            <View style={styles.header}>
              <View style={{ flex: 1, gap: 4 }}>
                {overline && <Text variant="overline" tone="textSubtle">{overline}</Text>}
                <Text variant="display" numberOfLines={2}>{title}</Text>
              </View>
              {meta ? <Text variant="overline" tone="textSubtle" style={{ textAlign: 'right', fontSize: 13, letterSpacing: 0.6 }}>{meta}</Text> : null}
              {right}
            </View>
          )}
          {children}
          <Disclaimer />
          <DemoClock />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Loading and error states for a screen's data. */
export function Loader({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  if (!error) return <ActivityIndicator color={color.primary} style={{ marginVertical: space.xxl }} />;
  return (
    <Card>
      <Text variant="overline" tone="danger">Sin conexión</Text>
      <Text tone="textMuted">{error.message}</Text>
      {onRetry && <Button kind="secondary" label="Reintentar" onPress={onRetry} />}
    </Card>
  );
}

export function IconButton({ icon, label, onPress, dot }: { icon: IconName; label: string; onPress: () => void; dot?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
      <Icon name={icon} size={22} />
      {dot && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: color.border },
  card: { backgroundColor: color.surface, borderColor: color.border, borderWidth: 1, borderRadius: radius.card, padding: 14, gap: 10 },
  priority: { borderLeftWidth: size.heroRule, borderLeftColor: color.primary },
  button: { height: size.button, borderRadius: radius.button, backgroundColor: color.action, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  buttonCompact: { height: 36, paddingHorizontal: 14, alignSelf: 'flex-start' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#757575' },
  badge: { alignSelf: 'flex-start', color: color.onAction, backgroundColor: color.action, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11 },
  chip: { height: 34, paddingHorizontal: 12, borderRadius: radius.chip, borderWidth: 1, borderColor: color.border, justifyContent: 'center', alignItems: 'center' },
  chipOn: { backgroundColor: color.action, borderColor: color.action },
  readouts: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: color.border },
  readout: { flex: 1, paddingVertical: 10, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: size.touchTarget + 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.border },
  tag: { width: 58, fontSize: 12 },
  band: { marginHorizontal: -space.xl, paddingHorizontal: space.xl, paddingTop: 16, gap: 2, overflow: 'hidden' },
  bandRule: { height: 1, backgroundColor: color.text, opacity: 0.85, marginTop: 10 },
  clock: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: size.touchTarget, borderTopWidth: 1, borderTopColor: color.border },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, backgroundColor: color.primary },
});
