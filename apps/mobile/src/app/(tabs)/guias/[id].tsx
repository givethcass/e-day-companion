// One guide: who wrote it and when it was last checked, the key facts at a glance, the body, and more
// guides for the same class or section. Creator guides link to the creator in Comunidad.
import type { Href } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { number } from '@/lib/demo';
import { GUIDE_SECTION } from '@/lib/guides';
import { day } from '@/lib/time';
import { Art, Bullets, Button, IconButton, Loader, Row, Screen, Section, Text } from '@/ui/kit';
import { color } from '@/ui/theme';
import { GuideRow } from '@/ui/Guide';

export default function Guia() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = useSession();
  const { data, error, reload } = useApi(async () => {
    const [g, all, creators] = await Promise.all([api.getGuide(id!), api.listGuides(), api.listCreators()]);
    return { g, all, creator: creators.find((c) => c.id === g.author.creatorId) ?? null };
  }, [id]);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/guias'))} />;
  if (!data) return <Screen title="Guía" right={back}><Loader error={error} onRetry={reload} /></Screen>;
  const { g, all, creator } = data;
  const sec = GUIDE_SECTION[g.section];
  const more = all.filter((x) => x.id !== g.id && (g.role ? x.role === g.role : x.section === g.section)).slice(0, 3);
  return (
    <Screen overline={sec.label} title={g.title} right={back}>
      <Art glow={sec.glow} height={130} />
      <Text tone="textMuted">{g.summary}</Text>
      <Text variant="data" tone="textSubtle">
        {[g.author.kind === 'official' ? 'Guía oficial' : `Por ${g.author.name}`, `Revisada el ${day(g.updatedAt, player!.timezone)}`, `${g.readMinutes} min`].join(' · ')}
      </Text>
      <View style={styles.facts}>
        {g.facts.map((f, i) => (
          <View key={f.label} style={[styles.fact, i % 2 === 1 && styles.factRight, i >= 2 && styles.factLow]}>
            <Text variant="overline" tone="textSubtle" style={{ fontSize: 11 }}>{f.label}</Text>
            <Text variant="bodyStrong">{f.value}</Text>
          </View>
        ))}
      </View>
      {g.sections.map((s, i) => (
        <View key={i} style={{ gap: 8 }}>
          {s.heading && <Text variant="section">{s.heading}</Text>}
          {s.paragraphs?.map((p) => <Text key={p}>{p}</Text>)}
          {s.bullets && <Bullets items={s.bullets} />}
        </View>
      ))}
      {g.cta && <Button label={g.cta.label} onPress={() => router.push(g.cta!.link as Href)} />}
      {creator && (
        <Section title="Del creador">
          <Row tag={creator.live ? 'En vivo' : creator.platform === 'twitch' ? 'Twitch' : 'YouTube'} tagTone={creator.live ? 'primary' : 'textSubtle'}
            title={creator.name} subtitle={`${creator.focus} · ${number(creator.followers)} seguidores`} onPress={() => router.push('/comunidad/creadores')} />
        </Section>
      )}
      {more.length > 0 && (
        <View>
          <Text variant="section" style={{ paddingBottom: 6 }}>Sigue leyendo</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: color.border }}>{more.map((x) => <GuideRow key={x.id} g={x} />)}</View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: color.border, marginTop: 4 },
  fact: { width: '50%', paddingVertical: 10, paddingRight: 10, gap: 2 },
  factRight: { borderLeftWidth: 1, borderLeftColor: color.border, paddingLeft: 12 },
  factLow: { borderTopWidth: 1, borderTopColor: color.border },
});
