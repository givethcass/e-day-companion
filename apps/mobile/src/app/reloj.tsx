// Demo clock: jump to the moments the story needs. Every screen reloads with the new "now".
import { router } from 'expo-router';
import { useSession } from '@/api/session';
import { CLOCK_PRESETS, useClock } from '@/lib/clock';
import { day, clock } from '@/lib/time';
import { IconButton, Row, Screen, Section, Text } from '@/ui/kit';

export default function Reloj() {
  const { now, setNow } = useClock();
  const { player } = useSession();
  const tz = player?.timezone ?? 'America/Mexico_City';
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Screen overline="Solo para la demo" title="Reloj de demo" right={<IconButton icon="back" label="Volver" onPress={close} />}>
      <Text tone="textMuted">La app usa esta fecha como hoy. Cambia el momento y todo se recalcula: misión, avisos, escuadras y tienda.</Text>
      <Section title="Momentos">
        {CLOCK_PRESETS.map((p) => (
          <Row key={p.at} tag={day(p.at, tz).split(' ').slice(0, 2).join(' ')} tagTone={p.at === now ? 'primary' : 'textSubtle'}
            title={`${day(p.at, tz)}, ${clock(p.at, tz)}`} subtitle={p.note} trailing={p.at === now ? 'Ahora' : undefined}
            onPress={() => { setNow(p.at); close(); }} />
        ))}
      </Section>
    </Screen>
  );
}
