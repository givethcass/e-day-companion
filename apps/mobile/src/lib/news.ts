// How each kind of news is labelled and coloured, here and on Inicio.
import type { NewsTag } from '@eday/api-types';

export const NEWS_TAG: Record<NewsTag, { label: string; glow: string }> = {
  patch: { label: 'Parche', glow: '#7AA0BE' },
  event: { label: 'Evento', glow: '#E50F11' },
  season: { label: 'Temporada', glow: '#D08A2E' },
  store: { label: 'Tienda', glow: '#8E8E8E' },
  community: { label: 'Comunidad', glow: '#6E9F7A' },
};
