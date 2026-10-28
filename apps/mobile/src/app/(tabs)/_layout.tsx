import { Redirect, Tabs } from 'expo-router';
import { useSession } from '@/api/session';
import { Icon, type IconName } from '@/ui/Icon';
import { color, fontFamily } from '@/ui/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Tu semana', icon: 'home' },
  { name: 'partidas', title: 'Partidas', icon: 'list' },
  { name: 'clasificacion', title: 'Clasificación', icon: 'bars' },
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
        tabBarActiveTintColor: color.accent,
        tabBarInactiveTintColor: color.textMuted,
        tabBarStyle: { backgroundColor: color.surface, borderTopColor: color.border, height: 76, paddingTop: 8, paddingBottom: 18 },
        tabBarLabelStyle: { fontFamily: fontFamily.body, fontSize: 10.5 },
        sceneStyle: { backgroundColor: color.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color: c }) => <Icon name={t.icon} color={String(c)} /> }} />
      ))}
    </Tabs>
  );
}
