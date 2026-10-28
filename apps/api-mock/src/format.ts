// Spanish copy helpers shared by mission and notification text. Every time is shown in the player's zone.

export const DAY = 864e5;

const TIERS: Record<string, string> = { bronze: 'Bronce', silver: 'Plata', gold: 'Oro', onyx: 'Ónix' };
export const rankLabel = (rank: { tier: string; division: number } | null | undefined) =>
  rank ? `${TIERS[rank.tier] ?? rank.tier} ${rank.division}` : null;

const DIFFICULTY: Record<string, string> = { casual: 'casual', normal: 'normal', hard: 'alta', insane: 'locura' };
export const difficultyLabel = (d?: string) => (d ? DIFFICULTY[d] ?? d : '');

const ROLES: Record<string, string> = { assault: 'Asalto', support: 'Soporte', engineer: 'Ingeniero', marksman: 'Tirador' };
export const roleLabel = (r: string) => ROLES[r] ?? r;

const parts = (iso: string, timeZone: string, options: Intl.DateTimeFormatOptions) =>
  Object.fromEntries(new Intl.DateTimeFormat('es-MX', { timeZone, ...options }).formatToParts(new Date(iso)).map((p) => [p.type, p.value]));

/** "22:30" */
export const clock = (iso: string, timeZone: string) => {
  const p = parts(iso, timeZone, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return `${p.hour}:${p.minute}`;
};

/** "vie 30 oct" */
export const day = (iso: string, timeZone: string) => {
  const p = parts(iso, timeZone, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${p.weekday.replace('.', '')} ${p.day} ${p.month.replace('.', '')}`;
};

/** "viernes" */
export const weekday = (iso: string, timeZone: string) => parts(iso, timeZone, { weekday: 'long' }).weekday;

/** "13 oct" */
export const dayMonth = (iso: string, timeZone: string) => {
  const p = parts(iso, timeZone, { day: 'numeric', month: 'short' });
  return `${p.day} ${p.month.replace('.', '')}`;
};

/** Calendar date in the player's zone, used to tell "today" apart. */
export const localDate = (iso: string, timeZone: string) => {
  const p = parts(iso, timeZone, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${p.year}-${p.month}-${p.day}`;
};
