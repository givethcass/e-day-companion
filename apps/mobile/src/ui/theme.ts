// Direction B ("Tactical HUD") tokens from packages/tokens, shaped for React Native styles.
import tokens from '@eday/tokens/tokens.json';
import type { TextStyle } from 'react-native';

export const color = tokens.color;
export const space = tokens.space;
export const radius = tokens.radius;
export const size = tokens.size;

// Font files loaded in the root layout; React Native needs one family name per weight.
export const fontFamily = {
  display: 'IBMPlexSansCondensed_700Bold',
  body: 'IBMPlexSans_400Regular',
  bodyStrong: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoStrong: 'IBMPlexMono_600SemiBold',
};

type Variant = keyof typeof tokens.type;
const family = (font: string, weight: number) => {
  if (font === 'display') return fontFamily.display;
  if (font === 'mono') return weight >= 600 ? fontFamily.monoStrong : fontFamily.mono;
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
    };
    return [v, style];
  }),
) as Record<Variant, TextStyle>;
