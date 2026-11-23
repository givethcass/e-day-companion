// Cara a cara: pick a friend to compare with. Each friend shows how the comparison would end.
import { router } from 'expo-router';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { rankLabel } from '@/lib/service';
import { IconButton, Loader, Row, Screen, Section, Text } from '@/ui/kit';

export default function Rivales() {
  const now = useNow();
  const { data, error, reload } = useApi(() => api.listFriends(now), [now]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/comunidad'))} />;
  if (!data) return <Screen overline="Comunidad" title="Cara a cara" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  return (
    <Screen overline="Comunidad" title="Cara a cara" meta={`${data.length} amigos`} right={back}>
      <Text tone="textMuted">Elige a un amigo y compara Versus, Horde y campaña fila por fila. También puedes tocar a cualquier jugador en las clasificaciones.</Text>
      <Section title="Tus amigos">
        {data.map((f) => (
          <Row key={f.gamertag} tag={`Nv ${f.level}`} title={f.gamertag} subtitle={[f.title, rankLabel(f.rank), f.clanTag && `[${f.clanTag}]`].filter(Boolean).join(' · ')}
            trailing={`${f.score.me}–${f.score.them}`} trailingTone={f.score.them >= f.score.me ? 'primary' : 'text'}
            onPress={() => router.push(`/comunidad/cara-a-cara/${encodeURIComponent(f.gamertag)}`)} />
        ))}
      </Section>
    </Screen>
  );
}
