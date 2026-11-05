// Labels for guide sections, shared by the Guías list and a guide.
import type { GuideSection } from '@eday/api-types';

export const GUIDE_SECTION: Record<GuideSection, { label: string; short: string; glow: string }> = {
  classes: { label: 'Clases de Horde Siege', short: 'Clases', glow: '#E50F11' },
  weapons: { label: 'Armas', short: 'Armas', glow: '#D9A93B' },
  maps: { label: 'Mapas', short: 'Mapas', glow: '#3FA7A0' },
  collectibles: { label: 'Coleccionables', short: 'Colecc.', glow: '#7AA0BE' },
  builds: { label: 'Builds de la comunidad', short: 'Builds', glow: '#E5730F' },
};
export const GUIDE_SECTIONS = Object.keys(GUIDE_SECTION) as GuideSection[];
