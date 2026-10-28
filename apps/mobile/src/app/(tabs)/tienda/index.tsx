// Weekly store: balance first, then what you can afford. The app never sells; the game does.
import { router } from 'expo-router';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { DEMO_NOW, number } from '@/lib/demo';
import { affordability } from '@/lib/store';
import { day } from '@/lib/time';
import { Card, Loader, Row, Screen, Text } from '@/ui/kit';
import { color, space } from '@/ui/theme';

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
      <Card>
        <View style={{ flexDirection: 'row', gap: space.xl }}>
          <View><Text variant="stat">{number(wallet.coins)}</Text><Text variant="caption" tone="textMuted">Monedas</Text></View>
          <View><Text variant="stat">{number(wallet.iron)}</Text><Text variant="caption" tone="textMuted">Hierro</Text></View>
        </View>
        <Text variant="caption" tone="textSubtle">Monedas esta semana: {number(wallet.coinsThisWeek)} de {number(wallet.coinsWeeklyCap)}. El tope se reinicia el {day(wallet.capResetsAt, tz)}.</Text>
      </Card>
      {rotation.items.map((i) => (
        <Row key={i.id} icon="heart" iconColor={i.wishlisted ? color.accent : color.textSubtle} title={i.name}
          subtitle={`${number(i.price.amount)} ${i.price.currency === 'iron' ? 'Hierro' : 'Monedas'} · ${affordability(i, wallet)}`}
          onPress={() => router.push(`/tienda/${i.id}`)} />
      ))}
      <Text variant="caption" tone="textSubtle">La app no vende nada: cada objeto se compra dentro del juego.</Text>
    </Screen>
  );
}
