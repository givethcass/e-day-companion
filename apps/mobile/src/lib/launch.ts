// "Desplegar" opens the game. In the demo the edaycompanion://launch link lands on our own "Abriendo E-Day…" screen.
import { router } from 'expo-router';

export function openLaunchUrl(launchUrl: string) {
  const params = Object.fromEntries(new URLSearchParams(launchUrl.split('?')[1] ?? ''));
  router.push({ pathname: '/launch', params });
}
