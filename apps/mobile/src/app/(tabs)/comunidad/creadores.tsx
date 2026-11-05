// Creadores: the people who make guides and streams, live first. Their guides are in Guías.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Button, Chip, IconButton, Loader, Screen, Text } from '@/ui/kit';
import { CreatorRow } from '@/ui/Creator';
import { color, space } from '@/ui/theme';

const FILTERS: [string, string | undefined][] = [['Todos', undefined], ['Español', 'es'], ['Inglés', 'en']];

export default function Creadores() {
  const [filter, setFilter] = useState(0);
  const { data, error, reload } = useApi(() => api.listCreators({ language: FILTERS[filter][1] }), [filter]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/comunidad'))} />;
  return (
    <Screen overline="Comunidad" title="Creadores" right={back}>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {FILTERS.map(([label], i) => <Chip key={label} label={label} selected={i === filter} onPress={() => setFilter(i)} />)}
      </View>
      {!data ? <Loader error={error} onRetry={reload} /> : (
        <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
          {data.map((c) => <CreatorRow key={c.id} c={c} />)}
        </View>
      )}
      <Button kind="secondary" label="Ver sus guías" onPress={() => router.push('/guias')} />
      <Text variant="caption" tone="textSubtle">Creadores inventados para la demo. Una app oficial los elegiría con su programa de creadores.</Text>
    </Screen>
  );
}
