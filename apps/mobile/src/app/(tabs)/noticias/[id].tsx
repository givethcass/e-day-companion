// One news story: art, headline, sections, known issues for patches, and a link to where it matters in the app.
import type { Href } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useSession } from '@/api/session';
import { useNow } from '@/lib/clock';
import { NEWS_TAG } from '@/lib/news';
import { day } from '@/lib/time';
import { Art, Button, Card, IconButton, Loader, Screen, Text } from '@/ui/kit';
import { color } from '@/ui/theme';

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      {items.map((b) => (
        <View key={b} style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.bullet} />
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Noticia() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = useSession();
  const now = useNow();
  const { data: n, error, reload } = useApi(() => api.getNews(id, now), [id, now]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/noticias'))} />;
  if (!n) return <Screen title="Noticia" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const tag = NEWS_TAG[n.tag];
  return (
    <Screen overline={day(n.publishedAt, player!.timezone)} title={tag.label} right={back}>
      <Art glow={tag.glow} height={150} />
      <Text variant="display" style={{ fontSize: 30, lineHeight: 31 }}>{n.title}</Text>
      <Text tone="textMuted">{n.summary}</Text>
      <Text variant="data" tone="textSubtle">{n.readMinutes} min de lectura</Text>
      {n.sections.map((s, i) => (
        <View key={i} style={{ gap: 8 }}>
          {s.heading && <Text variant="section">{s.heading}</Text>}
          {s.paragraphs?.map((p) => <Text key={p}>{p}</Text>)}
          {s.bullets && <Bullets items={s.bullets} />}
        </View>
      ))}
      {n.knownIssues && n.knownIssues.length > 0 && (
        <Card priority>
          <Text variant="overline" tone="primary">Problemas conocidos</Text>
          <Bullets items={n.knownIssues} />
        </Card>
      )}
      {n.cta && <Button label={n.cta.label} onPress={() => router.push(n.cta!.link as Href)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bullet: { width: 6, height: 6, marginTop: 8, backgroundColor: color.primary },
});
