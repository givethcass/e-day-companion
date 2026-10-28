import { Stack } from 'expo-router';
import { color } from '@/ui/theme';

// The store opens over the tabs (from Inicio or a news story). Deep links land on a detail with the list underneath, so Volver goes to the list.
export const unstable_settings = { initialRouteName: 'index' };

export default function TiendaLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }} />;
}
