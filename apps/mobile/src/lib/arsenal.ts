// Labels and colours for the arsenal and the campaign, shared by their screens.
import type { WeaponSummary } from '@eday/api-types';

export const WEAPON_CATEGORY: Record<WeaponSummary['category'], string> = {
  rifle: 'Rifle', shotgun: 'Escopeta', precision: 'Precisión', smg: 'Subfusil', pistol: 'Pistola', heavy: 'Pesada', explosive: 'Explosiva',
};
export const WEAPON_SOURCE: Record<WeaponSummary['source'], string> = {
  loadout: 'Equipo inicial', map: 'Se recoge en el mapa', power: 'Arma de poder', horde: 'Fabricador de Horde',
};
export const TIERS = ['S', 'A', 'B', 'C'] as const;
export const TIER_COLOR: Record<(typeof TIERS)[number], string> = { S: '#F0473A', A: '#C98500', B: '#3FA7A0', C: '#6E6C6C' };
export const STATS: [keyof WeaponSummary['stats'], string][] = [['damage', 'Daño'], ['rate', 'Cadencia'], ['range', 'Alcance'], ['handling', 'Manejo']];
