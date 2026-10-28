// Horde Siege planner: three squads of four, pick a role, get confirmed, deploy.
import type { HordeRole } from '@eday/api-types';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useSession } from '@/api/session';
import { useApi } from '@/api/useApi';
import { difficultyLabel, modeLabel, roleLabel } from '@/lib/demo';
import { openLaunchUrl } from '@/lib/launch';
import { countdown, dayTime } from '@/lib/time';
import { Button, Card, Chip, IconButton, Loader, Screen, Section, Text } from '@/ui/kit';
import { space } from '@/ui/theme';

const ROLES: HordeRole[] = ['assault', 'support', 'engineer', 'marksman'];

export default function Planner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { player } = useSession();
  const tz = player!.timezone;
  const { data: s, error, reload, setData } = useApi(() => api.getSession(id), [id]);
  const [busy, setBusy] = useState(false);
  const back = <IconButton icon="back" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/escuadra'))} />;
  if (!s) return <Screen title="Planificador" right={back}><Loader error={error} onRetry={reload} /></Screen>;

  const me = s.members.find((m) => m.gamertag === player!.gamertag);
  const horde = s.mode === 'horde_siege';
  const join = async (role?: HordeRole) => {
    setBusy(true);
    try { setData(await api.joinSession(s.id, { ...(me?.squad ? { squad: me.squad } : {}), ...(role ? { role } : {}) })); } finally { setBusy(false); }
  };
  const deploy = async () => openLaunchUrl((await api.deploySession(s.id)).launchUrl);

  return (
    <Screen overline={`Organiza ${s.hostGamertag} · ${countdown(s.startsAt)}`} title={modeLabel(s.mode)} right={back}>
      <Text variant="data" tone="textMuted">{dayTime(s.startsAt, tz)} tu hora{s.map ? ` · ${s.map}` : ''}{s.difficulty ? ` · ${difficultyLabel(s.difficulty)}` : ''} · {s.members.length} de {s.slots}</Text>
      {horde && (
        <Section title="Tu rol">
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            {ROLES.map((r) => <Chip key={r} label={roleLabel(r)} selected={me?.role === r} onPress={() => !busy && join(r)} />)}
          </View>
          {me?.confirmed && <Text variant="data" tone="primary">&gt; Confirmado: escuadra {me.squad}, {roleLabel(me.role)}. {s.hostGamertag} ya ve tu lugar.</Text>}
        </Section>
      )}
      {horde ? [1, 2, 3].map((n) => {
        const squad = s.members.filter((m) => m.squad === n);
        const missing = ROLES.filter((r) => !squad.some((m) => m.role === r));
        return (
          <Card key={n} priority={n === me?.squad}>
            <Text variant="overline" tone={n === me?.squad ? 'primary' : 'textSubtle'}>Escuadra {n}{n === me?.squad ? ' · la tuya' : ''}</Text>
            {squad.map((m) => (
              <View key={m.gamertag} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyStrong" tone={m.gamertag === player!.gamertag ? 'primary' : 'text'}>{m.gamertag}</Text>
                <Text variant="data" tone="textMuted">{roleLabel(m.role).toUpperCase()}</Text>
              </View>
            ))}
            {Array.from({ length: 4 - squad.length }, (_, i) => (
              <Text key={i} variant="data" tone="textSubtle">[ libre ] se busca {roleLabel(missing[i] ?? 'assault')}</Text>
            ))}
          </Card>
        );
      }) : (
        <Card>{s.members.map((m) => <Text key={m.gamertag} variant="bodyStrong">{m.gamertag}</Text>)}</Card>
      )}
      {!me && <Button label={busy ? 'Uniendo…' : 'Unirme ▸'} onPress={() => join()} disabled={busy} />}
      {me && <Button label="Desplegar ▸" onPress={deploy} />}
    </Screen>
  );
}
