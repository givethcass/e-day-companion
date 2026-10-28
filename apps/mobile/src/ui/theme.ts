// Direction C (look of the official site) tokens from packages/tokens, shaped for React Native styles.
import tokens from '@eday/tokens/tokens.json';
import type { TextStyle } from 'react-native';

export const color = tokens.color;
export const space = tokens.space;
export const radius = tokens.radius;
export const size = tokens.size;

// Font files loaded in the root layout; React Native needs one family name per weight.
export const fontFamily = {
  display: 'BarlowCondensed_700Bold',
  body: 'Barlow_400Regular',
  bodyStrong: 'Barlow_600SemiBold',
  label: 'BarlowCondensed_500Medium',
  labelStrong: 'BarlowCondensed_600SemiBold',
  labelBold: 'BarlowCondensed_700Bold',
};

type Variant = keyof typeof tokens.type;
const family = (font: string, weight: number) => {
  if (font === 'display') return fontFamily.display;
  // The "mono" role is labels and numbers: Barlow Condensed with tabular figures.
  if (font === 'mono') return weight >= 700 ? fontFamily.labelBold : weight >= 600 ? fontFamily.labelStrong : fontFamily.label;
  return weight >= 600 ? fontFamily.bodyStrong : fontFamily.body;
};

export const type = Object.fromEntries(
  (Object.keys(tokens.type) as Variant[]).map((v) => {
    const t = tokens.type[v] as { font: string; weight: number; size: number; lineHeight: number; letterSpacing?: number; case?: string };
    const style: TextStyle = {
      fontFamily: family(t.font, t.weight),
      fontSize: t.size,
      lineHeight: Math.round(t.size * t.lineHeight),
      letterSpacing: t.letterSpacing ?? 0,
      textTransform: t.case === 'upper' ? 'uppercase' : 'none',
      color: color.text,
      ...(t.font === 'mono' ? { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] } : {}),
    };
    return [v, style];
  }),
) as Record<Variant, TextStyle>;
