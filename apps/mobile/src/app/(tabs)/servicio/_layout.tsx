import { Stack } from 'expo-router';
import { color } from '@/ui/theme';

// Links from Inicio land on a report with the list underneath, so Volver goes to the list.
export const unstable_settings = { initialRouteName: 'index' };

export default function ServicioLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }} />;
}
