// Store item: when it leaves (in your time), whether you can afford it, wishlist toggle.
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { number } from '@/lib/demo';
import { affordability } from '@/lib/store';
import { dayTime } from '@/lib/time';
import { Button, Card, IconButton, Loader, Screen, Text } from '@/ui/kit';

export default function Item() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = useSession();
  const now = useNow();
  const { data, error, reload, setData } = useApi(async () => {
    const [rotation, wallet, wishlist] = await Promise.all([api.getStoreRotation(now), api.getMyWallet(now), api.getWishlist()]);
    const item = rotation.items.find((i) => i.id === id) ?? wishlist.find((i) => i.id === id);
    return { rotation, wallet, item, onSale: rotation.items.some((i) => i.id === id) };
  }, [id, now]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/tienda'))} />;
  if (!data) return <Screen title="Objeto" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const { item, wallet, rotation, onSale } = data;
  if (!item) return <Screen title="Objeto" right={back}><Text tone="textMuted">Este objeto no está en la tienda esta semana.</Text></Screen>;

  const toggle = async () => {
    await (item.wishlisted ? api.removeFromWishlist(item.id) : api.addToWishlist(item.id));
    setData({ ...data, item: { ...item, wishlisted: !item.wishlisted } });
  };

  return (
    <Screen overline={onSale ? `Se va de la tienda el ${dayTime(rotation.endsAt, player!.timezone)} tu hora` : 'No está en la tienda esta semana'} title={item.name} right={back}>
      <Card priority>
        <Text variant="stat">{number(item.price.amount)} {item.price.currency === 'iron' ? 'Hierro' : 'Monedas'}</Text>
        <Text variant="data" tone="textMuted">{affordability(item, wallet)}</Text>
      </Card>
      <Button kind="secondary" label={item.wishlisted ? 'Quitar de la lista de deseos' : 'Agregar a la lista de deseos'} onPress={toggle} />
      <Button label="Ver en la tienda del juego" onPress={() => router.push({ pathname: '/launch', params: { mode: 'store' } })} />
      <Text variant="caption" tone="textSubtle">La app no vende nada: el botón abre la tienda dentro del juego.</Text>
    </Screen>
  );
}
