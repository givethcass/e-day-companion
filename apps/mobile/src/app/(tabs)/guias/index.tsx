// Guías: official and creator guides. The class the player uses most opens the list, then chips by section,
// one collaboration slot, and every guide with who wrote it.
import type { GuideSection } from '@eday/api-types';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { useNow } from '@/lib/clock';
import { roleLabel } from '@/lib/demo';
import { GUIDE_SECTION, GUIDE_SECTIONS } from '@/lib/guides';
import { GuideRow } from '@/ui/Guide';
import { Chip, Loader, Screen, Text } from '@/ui/kit';
import { PromoCard } from '@/ui/Promo';
import { color, space } from '@/ui/theme';
import { Columns } from '@/ui/layout';

export default function Guias() {
  const now = useNow();
  const [section, setSection] = useState<GuideSection | null>(null);
  const { data, error, reload } = useApi(async () => {
    const [guides, record, promos] = await Promise.all([api.listGuides(), api.getServiceRecord(now), api.listPromos('guides')]);
    return { guides, role: record.classes[0]?.role ?? null, promos };
  }, [now]);
  if (!data) return <Screen overline="Oficiales y de la comunidad" title="Guías"><Loader error={error} onRetry={reload} /></Screen>;
  const { guides, role, promos } = data;
  const mine = role ? guides.filter((g) => g.role === role) : [];
  const shown = guides.filter((g) => !section || g.section === section);
  return (
    <Screen overline="Oficiales y de la comunidad" title="Guías" meta={`${guides.length} guías`}>
      {mine.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text variant="overline" tone="textSubtle">{`Para tu clase · ${roleLabel(role!)}`}</Text>
          <View style={styles.box}><Columns>{mine.map((g) => <GuideRow key={g.id} g={g} />)}</Columns></View>
        </View>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Chip label="Todas" selected={!section} onPress={() => setSection(null)} />
        {GUIDE_SECTIONS.map((s) => <Chip key={s} label={GUIDE_SECTION[s].short} selected={section === s} onPress={() => setSection(s)} />)}
      </View>
      {promos[0] && <PromoCard p={promos[0]} />}
      {GUIDE_SECTIONS.filter((s) => shown.some((g) => g.section === s)).map((s) => (
        <View key={s}>
          <Text variant="section" style={{ paddingBottom: 6 }}>{GUIDE_SECTION[s].label}</Text>
          <View style={styles.box}><Columns>{shown.filter((g) => g.section === s).map((g) => <GuideRow key={g.id} g={g} />)}</Columns></View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: { borderBottomWidth: 1, borderBottomColor: color.border },
});
