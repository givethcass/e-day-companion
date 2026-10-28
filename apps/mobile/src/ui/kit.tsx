// Building blocks for direction B: monospaced labels and numbers, square corners, an amber rule on the
// priority card, and log-style rows divided by hairlines instead of boxed cards.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text as RNText, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { color, radius, size, space, type } from './theme';

export function Text({ variant = 'body', tone, style, ...rest }: TextProps & { variant?: keyof typeof type; tone?: keyof typeof color }) {
  return <RNText {...rest} style={[type[variant], tone && { color: color[tone] }, style]} />;
}

/** Surface panel. `priority` adds the amber rule used on the one card that asks for action. */
export function Card({ children, priority, style }: { children: ReactNode; priority?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, priority && styles.priority, style]}>{children}</View>;
}

export function Button({ label, onPress, kind = 'primary', disabled }: { label: string; onPress?: () => void; kind?: 'primary' | 'secondary'; disabled?: boolean }) {
  const primary = kind === 'primary' && !disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label.replace(/[▸\[\]]/g, '').trim()}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, !primary && styles.buttonSecondary, pressed && { opacity: 0.85 }]}
    >
      <Text variant="button" style={{ color: primary ? color.onPrimary : color.text }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label }: { label: string }) {
  return <Text variant="data" tone="primary" style={styles.badge}>{label}</Text>;
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipOn]}>
      <Text variant="overline" style={{ color: selected ? color.onPrimary : color.textMuted }}>{label}</Text>
    </Pressable>
  );
}

/** A row of three readouts: "INACTIVO 15d · RETOS 0/6 · MONEDAS 1,850". */
export function Readouts({ items }: { items: { label: string; value: string; tone?: keyof typeof color }[] }) {
  return (
    <View style={styles.readouts}>
      {items.map((it, i) => (
        <View key={it.label} style={[styles.readout, i > 0 && { borderLeftWidth: 1, borderLeftColor: color.border }]}>
          <Text variant="legal" tone="textSubtle">{it.label}</Text>
          <Text variant="stat" tone={it.tone} numberOfLines={1} adjustsFontSizeToFit>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Label / value line in mono, as in "Tiempo estimado ~45 min". */
export function DataLine({ label, value, tone = 'text' }: { label: string; value: string; tone?: keyof typeof color }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
      <Text variant="data" tone="textMuted">{label}</Text>
      <Text variant="data" tone={tone} style={{ flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

/** Log row: a short mono tag (VIE 30, TIENDA), the entry, and a mono readout on the right. */
export function Row({ tag, tagTone = 'text', icon, title, subtitle, trailing, trailingTone = 'primary', onPress }: {
  tag?: string; tagTone?: keyof typeof color; icon?: IconName; title: string; subtitle?: string; trailing?: string; trailingTone?: keyof typeof color; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface }]}>
      {tag !== undefined ? <Text variant="data" tone={tagTone} style={styles.tag} numberOfLines={1}>{tag}</Text> : null}
      {icon && <Icon name={icon} size={18} color={color[tagTone]} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="caption" tone="textSubtle" numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text variant="data" tone={trailingTone} style={{ fontSize: 13 }}>{trailing}</Text> : null}
      {onPress && <Icon name="chev" size={16} color={color.textSubtle} />}
    </Pressable>
  );
}

/** A titled log: rows divided by hairlines, closed by one at the bottom. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text variant="section" tone="textSubtle" style={{ paddingBottom: 6 }}>{title}</Text>
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>{children}</View>
    </View>
  );
}

export function Disclaimer() {
  return <Text variant="legal" tone="textFaint" style={{ marginTop: space.md }}>Concepto no oficial · datos simulados · sin afiliación con Microsoft ni The Coalition</Text>;
}

/** Screen frame: safe area, scroll, header over a hairline, the unofficial-concept notice at the bottom. */
export function Screen({ title, overline, meta, right, children, edges = ['top'] }: {
  title?: string; overline?: string; meta?: string; right?: ReactNode; children: ReactNode; edges?: ('top' | 'bottom')[];
}) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        {title && (
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 4 }}>
              {overline && <Text variant="overline" tone="primary">// {overline}</Text>}
              <Text variant="display" numberOfLines={2}>{title}</Text>
            </View>
            {meta ? <Text variant="data" tone="textSubtle" style={{ textAlign: 'right', fontSize: 11 }}>{meta}</Text> : null}
            {right}
          </View>
        )}
        {children}
        <Disclaimer />
      </ScrollView>
    </SafeAreaView>
  );
}

/** Loading and error states for a screen's data. */
export function Loader({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  if (!error) return <ActivityIndicator color={color.primary} style={{ marginVertical: space.xxl }} />;
  return (
    <Card>
      <Text variant="overline" tone="danger">Error de enlace</Text>
      <Text tone="textMuted">{error.message}</Text>
      {onRetry && <Button kind="secondary" label="Reintentar" onPress={onRetry} />}
    </Card>
  );
}

export function IconButton({ icon, label, onPress, dot }: { icon: IconName; label: string; onPress: () => void; dot?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
      <Icon name={icon} size={20} />
      {dot && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: color.border },
  card: { backgroundColor: color.surface, borderColor: color.border, borderWidth: 1, borderRadius: radius.card, padding: 14, gap: 10 },
  priority: { borderLeftWidth: size.heroRule, borderLeftColor: color.primary },
  button: { height: size.button, borderRadius: radius.button, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  buttonSecondary: { backgroundColor: color.disabled },
  badge: { alignSelf: 'flex-start' },
  chip: { height: 30, paddingHorizontal: 10, borderRadius: radius.chip, borderWidth: 1, borderColor: color.border, justifyContent: 'center' },
  chipOn: { backgroundColor: color.primary, borderColor: color.primary },
  readouts: { flexDirection: 'row', borderWidth: 1, borderColor: color.border, borderRadius: radius.card },
  readout: { flex: 1, paddingVertical: 10, paddingHorizontal: space.md, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: size.touchTarget + 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.border },
  tag: { width: 56, fontSize: 11 },
  iconButton: { width: 44, height: 44, borderRadius: radius.button, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 9, width: 7, height: 7, backgroundColor: color.primary },
});
