// Labels and number formats for Cara a cara.
import type { CompareRow } from '@eday/api-types';

export const GROUP: Record<CompareRow['group'], string> = { general: 'General', versus: 'Versus', horde: 'Horde', campaign: 'Campaña' };
export const GROUPS = Object.keys(GROUP) as CompareRow['group'][];
export const MAIN_MODE: Record<string, string> = { versus: 'Versus', horde: 'Horde', campaign: 'Campaña' };
export const THEM = '#3FA7A0';
export const fmtRow = (r: CompareRow, x: number) =>
  r.unit === 'percent' ? `${Math.round(x * 100)}%` : r.unit === 'ratio' ? x.toFixed(2) : r.unit === 'hours' ? `${Math.round(x)} h` : x.toLocaleString('en-US');
