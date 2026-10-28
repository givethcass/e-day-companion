// Line icons from the week 1 prototype (24px grid), drawn with square ends.
import Svg, { Circle, Path } from 'react-native-svg';
import { color as palette } from './theme';

const shapes = {
  home: ['M3 11l9-7 9 7', 'M5 10v10h14V10'],
  list: ['M4 6h16M4 12h16M4 18h10'],
  bars: ['M5 20V12M12 20V5M19 20v-5'],
  squad: ['M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5', 'M17 14.5c2.3 0 4 1.5 4.5 4', { cx: 9, cy: 8, r: 3.5 }, { cx: 17, cy: 9, r: 2.5 }],
  bag: ['M4 8h16l-1.5 12h-13z', 'M9 8a3 3 0 016 0'],
  back: ['M15 5l-7 7 7 7'],
  bell: ['M6 9a6 6 0 0112 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9', 'M10 20a2 2 0 004 0'],
  heart: ['M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z'],
  clock: ['M12 7.5V12l3 2', { cx: 12, cy: 12, r: 8.5 }],
  trophy: ['M8 4h8v5a4 4 0 01-8 0z', 'M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4', 'M12 13v4M8 20h8'],
  target: [{ cx: 12, cy: 12, r: 8 }, { cx: 12, cy: 12, r: 3.5 }],
  chev: ['M9 5l7 7-7 7'],
} satisfies Record<string, (string | { cx: number; cy: number; r: number })[]>;

export type IconName = keyof typeof shapes;

export function Icon({ name, size = 22, color = palette.text }: { name: IconName; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="square" strokeLinejoin="miter">
      {shapes[name].map((s, i) => (typeof s === 'string' ? <Path key={i} d={s} /> : <Circle key={i} {...s} />))}
    </Svg>
  );
}
