// Where edaycompanion://launch lands. A real official app would hand off to the game on Xbox or PC.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import { modeLabel } from '@/lib/demo';
import { Button, Card, Text } from '@/ui/kit';
import { color, space } from '@/ui/theme';

export default function Launch() {
  const { mode, session } = useLocalSearchParams<{ mode?: string; session?: string }>();
  const [target, setTarget] = useState<string | null>(mode ? modeLabel(mode) : null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session) api.getSession(session).then((s) => setTarget(`${modeLabel(s.mode)}${s.map ? ` · ${s.map}` : ''}`)).catch(() => setTarget('tu sesión'));
    const t = setTimeout(() => setSent(true), 1200);
    return () => clearTimeout(t);
  }, [session]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.bg, padding: space.xl, justifyContent: 'center', gap: space.lg }}>
      <Card priority>
        <Text variant="overline" tone="primary">{sent ? '// Enlace establecido' : '// Desplegando'}</Text>
        <Text variant="headline">{sent ? 'Enviado a tu consola' : 'Abriendo E-Day…'}</Text>
        {!sent && <ActivityIndicator color={color.accent} style={{ alignSelf: 'flex-start' }} />}
        {sent && <Text tone="textMuted">Abre E-Day en tu Xbox o PC{target ? ` con ${target} seleccionado` : ''}.</Text>}
      </Card>
      <View style={{ gap: space.sm }}>
        <Button kind="secondary" label="◂ Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Text variant="caption" tone="textSubtle" style={{ textAlign: 'center' }}>
          Demo: aquí la app oficial abriría el juego directo en la partida. Enlace: edaycompanion://launch{session ? `?session=${session}` : mode ? `?mode=${mode}` : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}
