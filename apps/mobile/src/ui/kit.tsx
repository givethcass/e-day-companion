// Building blocks from the week 1 component sheet: text styles, HUD card, buttons, badges, rows, screen frame.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text as RNText, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { color, radius, size, space, type } from './theme';

export function Text({ variant = 'body', tone, style, ...rest }: TextProps & { variant?: keyof typeof type; tone?: keyof typeof color }) {
  return <RNText {...rest} style={[type[variant], tone && { color: color[tone] }, style]} />;
}

/** Surface card. `hud` adds the corner marks used on hero cards. */
export function Card({ children, hud, style }: { children: ReactNode; hud?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, hud && styles.hero, style]}>
      {hud && <View style={[styles.corner, styles.cornerTL]} />}
      {hud && <View style={[styles.corner, styles.cornerBR]} />}
      {children}
    </View>
  );
}

export function Button({ label, onPress, kind = 'primary', disabled }: { label: string; onPress?: () => void; kind?: 'primary' | 'secondary'; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, kind === 'secondary' && styles.buttonSecondary, disabled && styles.buttonDisabled, pressed && { opacity: 0.85 }]}
    >
      <Text variant="bodyStrong" style={{ fontSize: 15, color: kind === 'primary' ? color.onPrimary : color.text }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'highlight' }: { label: string; tone?: 'highlight' | 'text' }) {
  return (
    <View style={[styles.badge, tone === 'text' && { backgroundColor: color.surfaceRaised }]}>
      <Text variant="caption" style={{ fontFamily: type.bodyStrong.fontFamily, color: tone === 'highlight' ? color.onHighlight : color.text }}>{label}</Text>
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipOn]}>
      <Text variant="caption" style={{ fontFamily: type.bodyStrong.fontFamily, color: selected ? color.onPrimary : color.text }}>{label}</Text>
    </Pressable>
  );
}

export function Row({ icon, iconColor = color.text, title, subtitle, trailing, onPress }: {
  icon?: IconName; iconColor?: string; title: string; subtitle?: string; trailing?: string; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surfaceRaised }]}>
      {icon && <View style={styles.rowIcon}><Icon name={icon} size={20} color={iconColor} /></View>}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>{title}</Text>
        {subtitle ? <Text variant="caption" tone="textMuted" numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text variant="bodyStrong" tone="textMuted">{trailing}</Text> : null}
      {onPress && <Icon name="chev" size={18} color={color.textSubtle} />}
    </Pressable>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <Text variant="section">{title}</Text>
      {children}
    </View>
  );
}

export function Disclaimer() {
  return <Text variant="legal" tone="textSubtle" style={{ textAlign: 'center', marginTop: space.md }}>Concepto no oficial con datos simulados. No afiliado a Microsoft, Xbox ni The Coalition.</Text>;
}

/** Screen frame: safe area, scroll, optional header, the unofficial-concept notice at the bottom. */
export function Screen({ title, overline, right, children, edges = ['top'] }: {
  title?: string; overline?: string; right?: ReactNode; children: ReactNode; edges?: ('top' | 'bottom')[];
}) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        {title && (
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 2 }}>
              {overline && <Text variant="overline" tone="textMuted">{overline}</Text>}
              <Text variant="display">{title}</Text>
            </View>
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
  if (!error) return <ActivityIndicator color={color.accent} style={{ marginVertical: space.xxl }} />;
  return (
    <Card>
      <Text variant="bodyStrong">No se pudo cargar</Text>
      <Text tone="textMuted">{error.message}</Text>
      {onRetry && <Button kind="secondary" label="Reintentar" onPress={onRetry} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xs },
  card: { backgroundColor: color.surface, borderColor: color.border, borderWidth: 1, borderRadius: radius.card, padding: space.md, gap: space.sm },
  hero: { borderRadius: radius.hero, padding: space.lg, gap: space.md },
  corner: { position: 'absolute', width: 12, height: 12, borderColor: color.accent },
  cornerTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
  button: { height: size.button, borderRadius: radius.button, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  buttonSecondary: { backgroundColor: color.surfaceRaised, borderWidth: 1, borderColor: color.border },
  buttonDisabled: { backgroundColor: color.disabled },
  badge: { alignSelf: 'flex-start', backgroundColor: color.highlight, borderRadius: radius.chip, paddingHorizontal: space.sm, paddingVertical: 3 },
  chip: { height: 32, paddingHorizontal: space.md, borderRadius: 999, borderWidth: 1, borderColor: color.border, backgroundColor: color.surfaceRaised, justifyContent: 'center' },
  chipOn: { backgroundColor: color.primary, borderColor: color.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: size.touchTarget + 12, paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: color.surface, borderRadius: radius.card, borderWidth: 1, borderColor: color.border },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
});
