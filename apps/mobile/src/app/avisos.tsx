// Notifications from the bell on Tu semana. Only squad and wishlist alerts are on unless the player opts in.
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { DEMO_NOW } from '@/lib/demo';
import { IconButton, Loader, Row, Screen, Section, Text } from '@/ui/kit';

const TAG: Record<string, string> = { session: 'ESCUADRA', wishlist: 'TIENDA', event: 'EVENTO', mission: 'RANKED', rival: 'RIVAL' };

export default function Avisos() {
  const { data, error, reload } = useApi(() => api.listMyNotifications(DEMO_NOW));
  return (
    <Screen
      overline="Escuadra y lista de deseos"
      title="Avisos"
      right={<IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}
    >
      {!data ? <Loader error={error} onRetry={reload} /> : (
        <Section title={`${data.filter((n) => !n.read).length} sin leer`}>
          {data.map((n) => (
            <Row key={n.id} tag={TAG[n.kind]} tagTone={n.read ? 'textSubtle' : 'primary'} title={n.title} subtitle={n.body}
              trailing={n.read ? undefined : '●'} onPress={n.link ? () => router.push(n.link as Href) : undefined} />
          ))}
          {data.length === 0 && <Text tone="textMuted">Nada por ahora.</Text>}
        </Section>
      )}
    </Screen>
  );
}
