// Tablet support: one breakpoint. From 700 points wide the app gets wider margins, labels beside the tab icons,
// and its lists of rows flow into two columns (three from 1100), the way iPad apps lay out long lists.
import { Children, type ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

export const TABLET = 700;

export function useLayout() {
  const { width } = useWindowDimensions();
  const wide = width >= TABLET;
  return { wide, columns: width >= 1100 ? 3 : wide ? 2 : 1, gutter: wide ? 40 : 20 };
}

/** Lays rows out in columns on a tablet and leaves them stacked on a phone. */
export function Columns({ children, gap = 28 }: { children: ReactNode; gap?: number }) {
  const { columns } = useLayout();
  const items = Children.toArray(children).filter(Boolean);
  if (columns === 1) return <>{items}</>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -gap / 2 }}>
      {items.map((child, i) => <View key={i} style={{ width: `${100 / columns}%`, paddingHorizontal: gap / 2 }}>{child}</View>)}
    </View>
  );
}
