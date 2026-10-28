import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSession } from '@/api/session';
import { Icon, type IconName } from '@/ui/Icon';
import { color, fontFamily } from '@/ui/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Semana', icon: 'home' },
  { name: 'partidas', title: 'Partidas', icon: 'list' },
  { name: 'clasificacion', title: 'Ranking', icon: 'bars' },
  { name: 'escuadra', title: 'Escuadra', icon: 'squad' },
  { name: 'tienda', title: 'Tienda', icon: 'bag' },
];

export default function TabsLayout() {
  const { ready, player } = useSession();
  if (!ready) return null;
  if (!player) return <Redirect href="/login" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.textSubtle,
        tabBarStyle: { backgroundColor: color.bg, borderTopColor: color.border, height: 76, paddingTop: 8, paddingBottom: 18 },
        tabBarLabelStyle: { fontFamily: fontFamily.mono, fontSize: 9.5, letterSpacing: 0.5, textTransform: 'uppercase' },
        sceneStyle: { backgroundColor: color.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color: c, focused }) => (
          <View>
            {focused && <View style={{ position: 'absolute', top: -8, left: -14, right: -14, height: 2, backgroundColor: color.primary }} />}
            <Icon name={t.icon} color={String(c)} />
          </View>
        ) }} />
      ))}
    </Tabs>
  );
}
