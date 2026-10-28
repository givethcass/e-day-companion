import { Stack } from 'expo-router';
import { color } from '@/ui/theme';

// Deep links (from Inicio or the calendar) land on a detail with the list underneath, so Volver goes to the list.
export const unstable_settings = { initialRouteName: 'index' };

export default function NoticiasLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }} />;
}
