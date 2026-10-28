import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { IBMPlexSans_400Regular } from '@expo-google-fonts/ibm-plex-sans/400Regular';
import { IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans/600SemiBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SessionProvider } from '@/api/session';
import { color } from '@/ui/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ BarlowCondensed_700Bold, IBMPlexSans_400Regular, IBMPlexSans_600SemiBold });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: color.bg }} />;
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="avisos" />
        <Stack.Screen name="launch" options={{ presentation: 'modal' }} />
      </Stack>
    </SessionProvider>
  );
}
