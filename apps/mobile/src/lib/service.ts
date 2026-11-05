// Labels for the service record and medals, shared by Inicio, Mi servicio and Medallas.
import type { Medal, MedalCategory, MedalTier, Rank, ServiceRecord } from '@eday/api-types';

export const TIER: Record<MedalTier, { label: string; color: string }> = {
  bronze: { label: 'Bronce', color: '#B0703F' },
  silver: { label: 'Plata', color: '#C3CAD2' },
  gold: { label: 'Oro', color: '#D9A93B' },
  onyx: { label: 'Ónix', color: '#1C1C1C' },
  diamond: { label: 'Diamante', color: '#8FD3F2' },
};

// In the order the Medallas screen lists them.
export const CATEGORY: Record<MedalCategory, string> = {
  weapon: 'Armas', grenade: 'Granadas y minas', kill_type: 'Tipo de baja', support: 'Apoyo', horde: 'Horde Siege',
  enemy: 'Enemigos', versus: 'Versus', campaign: 'Campaña', progression: 'Progresión', event: 'Eventos',
};

const RANK: Record<string, string> = { bronze: 'Bronce', silver: 'Plata', gold: 'Oro', onyx: 'Ónix' };
export const rankLabel = (r?: Rank | null) => (r ? `${RANK[r.tier] ?? r.tier} ${r.division}` : 'Sin rango');

export const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Tiers earned, the highest one, and the next goal. */
export const earned = (m: Medal) => m.tiers.filter((t) => t.unlockedAt).length;
export const topTier = (m: Medal) => [...m.tiers].reverse().find((t) => t.unlockedAt) ?? null;
export const nextTier = (m: Medal) => m.tiers.find((t) => !t.unlockedAt) ?? null;

export type Family = 'versus' | 'horde' | 'campaign';
export const FAMILIES: [Family, string][] = [['versus', 'Versus'], ['horde', 'Horde'], ['campaign', 'Campaña']];
/** The mode the player spends the most time in opens first. */
export const mainFamily = (r: ServiceRecord): Family =>
  (Object.keys(r.career.share) as Family[]).sort((a, b) => r.career.share[b] - r.career.share[a])[0];
