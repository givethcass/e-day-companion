import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/api/session';
import { Button, Disclaimer, Text } from '@/ui/kit';
import { color, space } from '@/ui/theme';

export default function Login() {
  const { player, signIn } = useSession();
  const [busy, setBusy] = useState(false);
  if (player) return <Redirect href="/" />;

  const enter = async () => {
    setBusy(true);
    // Simulated Xbox sign-in: a short pause stands in for the Microsoft account screen.
    await new Promise((r) => setTimeout(r, 700));
    await signIn();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.bg, padding: space.xl, justifyContent: 'space-between' }}>
      <View style={{ flex: 1, justifyContent: 'center', gap: space.md }}>
        <Text variant="overline" tone="primary">Enlace con el campo de batalla</Text>
        <Text variant="display" style={{ fontSize: 46, lineHeight: 46 }}>E-DAY{'\n'}COMPANION</Text>
        <Text tone="textMuted" style={{ fontSize: 15, lineHeight: 22 }}>
          Tu informe semanal, tu escuadra y la tienda en el bolsillo. Cuando sea hora de jugar, un toque y estás dentro.
        </Text>
      </View>
      <View style={{ gap: space.md }}>
        {busy ? (
          <View style={{ height: 46, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.sm }}>
            <ActivityIndicator color={color.primary} />
            <Text variant="data" tone="textMuted">Conectando con Xbox…</Text>
          </View>
        ) : (
          <>
            <Button label="Entrar con tu cuenta Xbox" onPress={enter} />
            <Button kind="secondary" label="Explorar sin cuenta" onPress={enter} />
          </>
        )}
        <Text variant="caption" tone="textMuted" style={{ textAlign: 'center' }}>
          Solo pide tu gamertag, tus partidas y tus amigos. No publica nada por ti. ¿Juegas en Steam? Entra con la cuenta Xbox que vinculaste.
        </Text>
        <Text variant="data" tone="primary" style={{ textAlign: 'center' }}>Demo: entras como Delta_Rojo, con datos simulados.</Text>
        <Disclaimer />
      </View>
    </SafeAreaView>
  );
}
