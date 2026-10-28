// Noticias: official posts up to the demo clock. The newest featured story leads, then everything else by date.
import type { NewsTag } from '@eday/api-types';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { Chip, Loader, Screen, Text } from '@/ui/kit';
import { Featured, NewsRow } from '@/ui/News';
import { color, space } from '@/ui/theme';

const FILTERS: [string, NewsTag | undefined][] = [['Todo', undefined], ['Parches', 'patch'], ['Eventos', 'event'], ['Comunidad', 'community']];

export default function Noticias() {
  const { player } = useSession();
  const tz = player!.timezone;
  const now = useNow();
  const [filter, setFilter] = useState(0);
  const tag = FILTERS[filter][1];
  const { data, error, reload } = useApi(() => api.listNews({ tag, asOf: now, limit: 50 }), [tag, now]);
  const lead = !tag ? data?.find((n) => n.featured) : undefined;
  const rest = data?.filter((n) => n !== lead) ?? [];
  return (
    <Screen overline="Oficial · Temporada 1" title="Noticias">
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {FILTERS.map(([label], i) => <Chip key={label} label={label} selected={i === filter} onPress={() => setFilter(i)} />)}
      </View>
      {!data ? <Loader error={error} onRetry={reload} /> : (
        <>
          {lead && <Featured n={lead} tz={tz} />}
          <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>
            {rest.map((n) => <NewsRow key={n.id} n={n} tz={tz} />)}
            {rest.length === 0 && <Text tone="textMuted" style={{ paddingVertical: space.md }}>Nada publicado de este tipo todavía.</Text>}
          </View>
        </>
      )}
    </Screen>
  );
}
