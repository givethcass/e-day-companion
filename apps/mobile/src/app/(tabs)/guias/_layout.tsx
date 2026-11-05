import { Stack } from 'expo-router';
import { color } from '@/ui/theme';

// Links from Inicio and promos land on a guide with the list underneath, so Volver goes to the list.
export const unstable_settings = { initialRouteName: 'index' };

export default function GuiasLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }} />;
}
