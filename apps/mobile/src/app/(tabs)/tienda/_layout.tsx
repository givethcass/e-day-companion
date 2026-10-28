import { Stack } from 'expo-router';
import { color } from '@/ui/theme';

export default function TiendaLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }} />;
}
