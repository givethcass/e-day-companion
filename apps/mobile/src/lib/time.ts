// Dates in the player's own time zone, in Spanish ("vie 30 oct, 21:00").
const fmt = (iso: string, timeZone: string, options: Intl.DateTimeFormatOptions) =>
  Object.fromEntries(new Intl.DateTimeFormat('es-MX', { timeZone, ...options }).formatToParts(new Date(iso)).map((p) => [p.type, p.value]));

export const clock = (iso: string, tz: string) => {
  const p = fmt(iso, tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return `${p.hour}:${p.minute}`;
};

export const day = (iso: string, tz: string) => {
  const p = fmt(iso, tz, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${p.weekday.replace('.', '')} ${p.day} ${p.month.replace('.', '')}`;
};

export const dayTime = (iso: string, tz: string) => `${day(iso, tz)}, ${clock(iso, tz)}`;

/** "en 3 d 9 h" until a moment, measured from the demo clock. */
export const countdown = (iso: string, from: string) => {
  const ms = Date.parse(iso) - Date.parse(from);
  if (ms <= 0) return 'ya empezó';
  const h = Math.floor(ms / 3600e3);
  return h >= 24 ? `en ${Math.floor(h / 24)} d ${h % 24} h` : `en ${h} h ${Math.floor((ms % 3600e3) / 60e3)} min`;
};

/** Short city label for a zone, for "Horas en tu zona: CDMX". */
export const zoneLabel = (tz: string) => ({ 'America/Mexico_City': 'CDMX' } as Record<string, string>)[tz] ?? tz.split('/').pop()!.replace(/_/g, ' ');
