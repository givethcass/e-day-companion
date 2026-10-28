// Weekly store: balance first, then what you can afford. The app never sells; the game does.
import { router } from 'expo-router';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { DEMO_NOW, number } from '@/lib/demo';
import { affordability } from '@/lib/store';
import { day } from '@/lib/time';
import { Loader, Readouts, Row, Screen, Section, Text } from '@/ui/kit';

export default function Tienda() {
  const { player } = useSession();
  const tz = player!.timezone;
  const { data, error, reload } = useApi(async () => {
    const [rotation, wallet] = await Promise.all([api.getStoreRotation(DEMO_NOW), api.getMyWallet()]);
    return { rotation, wallet };
  });
  if (!data) return <Screen title="Tienda"><Loader error={error} onRetry={reload} /></Screen>;
  const { rotation, wallet } = data;
  return (
    <Screen overline={`Rota el ${day(rotation.endsAt, tz)} · ${rotation.items.length} objetos`} title="Tienda">
      <Readouts items={[
        { label: 'Monedas', value: number(wallet.coins) },
        { label: 'Hierro', value: number(wallet.iron) },
        { label: 'Tope sem.', value: `${number(wallet.coinsThisWeek)}/${wallet.coinsWeeklyCap / 1000}k` },
      ]} />
      <Text variant="data" tone="textSubtle">El tope de Monedas se reinicia el {day(wallet.capResetsAt, tz)}.</Text>
      <Section title="Rotación actual">
        {rotation.items.map((i) => (
          <Row key={i.id} tag={i.wishlisted ? '♥ DESEO' : i.price.currency === 'iron' ? 'HIERRO' : 'MONEDAS'} tagTone={i.wishlisted ? 'primary' : 'textSubtle'}
            title={i.name} subtitle={affordability(i, wallet)} trailing={number(i.price.amount)} trailingTone="text"
            onPress={() => router.push(`/tienda/${i.id}`)} />
        ))}
      </Section>
      <Text variant="caption" tone="textSubtle">La app no vende nada: cada objeto se compra dentro del juego.</Text>
    </Screen>
  );
}
