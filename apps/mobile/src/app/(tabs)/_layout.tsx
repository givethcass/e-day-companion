import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSession } from '@/api/session';
import { Icon, type IconName } from '@/ui/Icon';
import { color, fontFamily } from '@/ui/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Inicio', icon: 'home' },
  { name: 'noticias', title: 'Noticias', icon: 'news' },
  { name: 'guias', title: 'Guías', icon: 'book' },
  { name: 'servicio', title: 'Servicio', icon: 'tag' },
  { name: 'comunidad', title: 'Comunidad', icon: 'squad' },
];

export default function TabsLayout() {
  const { ready, player } = useSession();
  if (!ready) return null;
  if (!player) return <Redirect href="/login" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.text,
        tabBarInactiveTintColor: color.textSubtle,
        tabBarStyle: { backgroundColor: color.bg, borderTopColor: color.border, height: 76, paddingTop: 6, paddingBottom: 18 },
        tabBarLabelStyle: { fontFamily: fontFamily.labelStrong, fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase' },
        sceneStyle: { backgroundColor: color.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color: c, focused }) => (
          <View>
            {focused && <View style={{ position: 'absolute', top: -6, left: -18, right: -18, height: 3, backgroundColor: color.primary }} />}
            <Icon name={t.icon} color={String(c)} />
          </View>
        ) }} />
      ))}
    </Tabs>
  );
}
