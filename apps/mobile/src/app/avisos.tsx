// Notifications from the bell on Tu semana. Only squad and wishlist alerts are on unless the player opts in.
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { DEMO_NOW } from '@/lib/demo';
import { Icon, type IconName } from '@/ui/Icon';
import { Loader, Row, Screen, Section, Text } from '@/ui/kit';
import { color } from '@/ui/theme';

const ICON: Record<string, IconName> = { session: 'squad', wishlist: 'heart', event: 'clock', mission: 'target', rival: 'trophy' };

export default function Avisos() {
  const { data, error, reload } = useApi(() => api.listMyNotifications(DEMO_NOW));
  return (
    <Screen
      overline="Solo tu escuadra y tu lista, salvo que actives más"
      title="Avisos"
      right={<Pressable accessibilityLabel="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}><Icon name="back" /></Pressable>}
    >
      {!data ? <Loader error={error} onRetry={reload} /> : (
        <Section title={`${data.filter((n) => !n.read).length} sin leer`}>
          {data.map((n) => (
            <View key={n.id} style={{ opacity: n.read ? 0.7 : 1 }}>
              <Row icon={ICON[n.kind]} iconColor={n.read ? color.textMuted : color.accent} title={n.title} subtitle={n.body}
                onPress={n.link ? () => router.push(n.link as Href) : undefined} />
            </View>
          ))}
          {data.length === 0 && <Text tone="textMuted">Nada por ahora.</Text>}
        </Section>
      )}
    </Screen>
  );
}
