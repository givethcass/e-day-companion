import { Barlow_400Regular } from '@expo-google-fonts/barlow/400Regular';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow/600SemiBold';
import { BarlowCondensed_500Medium } from '@expo-google-fonts/barlow-condensed/500Medium';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SessionProvider } from '@/api/session';
import { ClockProvider } from '@/lib/clock';
import { color } from '@/ui/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Barlow_400Regular, Barlow_600SemiBold, BarlowCondensed_500Medium, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: color.bg }} />;
  return (
    <SessionProvider>
      <ClockProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="avisos" />
        <Stack.Screen name="tienda" />
        <Stack.Screen name="launch" options={{ presentation: 'modal' }} />
        <Stack.Screen name="reloj" options={{ presentation: 'modal' }} />
      </Stack>
      </ClockProvider>
    </SessionProvider>
  );
}
