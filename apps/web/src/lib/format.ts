// Spanish labels and dates in the player's zone, matching the mobile app.
const TZ = 'America/Mexico_City';
const parts = (iso: string, o: Intl.DateTimeFormatOptions) =>
  Object.fromEntries(new Intl.DateTimeFormat('es-MX', { timeZone: TZ, ...o }).formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
export const day = (iso: string) => { const p = parts(iso, { weekday: 'short', day: 'numeric', month: 'short' }); return `${p.weekday.replace('.', '')} ${p.day} ${p.month.replace('.', '')}`; };
export const clock = (iso: string) => { const p = parts(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); return `${p.hour}:${p.minute}`; };
export const dayTime = (iso: string) => `${day(iso)}, ${clock(iso)}`;
export const num = (n: number) => n.toLocaleString('en-US');
export const pct = (x: number) => `${Math.round(x * 100)}%`;
export const compact = (n: number) => (n >= 1000 ? `${num(Math.round(n / 1000))} mil` : String(n));

export const ROLE: Record<string, string> = { assault: 'Asalto', breacher: 'Irruptor', marksman: 'Tirador', medic: 'Médico' };
export const MODE: Record<string, string> = { versus_tdm: 'Duelo por equipos', versus_conquest: 'Conquista', versus_ranked: 'Ranked', horde_siege: 'Horde Siege', campaign: 'Campaña' };
export const DIFF: Record<string, string> = { casual: 'casual', normal: 'normal', hard: 'alta', insane: 'locura' };
export const TIER: Record<string, { label: string; color: string }> = {
  bronze: { label: 'Bronce', color: '#B0703F' }, silver: { label: 'Plata', color: '#C3CAD2' }, gold: { label: 'Oro', color: '#D9A93B' },
  onyx: { label: 'Ónix', color: '#1C1C1C' }, diamond: { label: 'Diamante', color: '#8FD3F2' },
};
const RANK: Record<string, string> = { bronze: 'Bronce', silver: 'Plata', gold: 'Oro', onyx: 'Ónix' };
export const rankLabel = (r?: { tier: string; division: number } | null) => (r ? `${RANK[r.tier]} ${r.division}` : 'Sin rango');
export const NEWS_TAG: Record<string, { label: string; glow: string }> = {
  patch: { label: 'Parche', glow: '#7AA0BE' }, event: { label: 'Evento', glow: '#E50F11' }, season: { label: 'Temporada', glow: '#D08A2E' },
  store: { label: 'Tienda', glow: '#8E8E8E' }, community: { label: 'Comunidad', glow: '#6E9F7A' },
};
export const MEDAL_GROUP: Record<string, string> = {
  weapon: 'Armas', grenade: 'Granadas y minas', kill_type: 'Tipo de baja', support: 'Apoyo', horde: 'Horde Siege',
  enemy: 'Enemigos', versus: 'Versus', campaign: 'Campaña', progression: 'Progresión', event: 'Eventos',
};
export const GUIDE_SECTION: Record<string, { label: string; glow: string }> = {
  classes: { label: 'Clases', glow: '#E50F11' }, weapons: { label: 'Armas', glow: '#D9A93B' }, maps: { label: 'Mapas', glow: '#3FA7A0' },
  collectibles: { label: 'Coleccionables', glow: '#7AA0BE' }, builds: { label: 'Builds', glow: '#E5730F' },
};
export const matchTitle = (m: { mode: string; map: string }) => (m.mode === 'campaign' ? m.map : `${MODE[m.mode]} · ${m.map}`);
export const outcome = (m: { mode: string; result: string; wavesCleared?: number | null }) =>
  m.mode === 'horde_siege' ? `Oleada ${m.wavesCleared}/30` : m.result === 'win' ? 'Victoria' : m.result === 'loss' ? 'Derrota' : m.result === 'draw' ? 'Empate' : m.result === 'completed' ? 'Completado' : 'Fallido';
export const countdown = (iso: string, from: string) => {
  const ms = Date.parse(iso) - Date.parse(from);
  if (ms <= 0) return 'ya empezó';
  const h = Math.floor(ms / 3600e3);
  return h >= 24 ? `en ${Math.floor(h / 24)} d ${h % 24} h` : `en ${h} h ${Math.floor((ms % 3600e3) / 60e3)} min`;
};
export const STORE_TYPE: Record<string, string> = {
  character_skin: 'Aspecto de personaje', weapon_skin: 'Aspecto de arma', banner: 'Estandarte', emblem: 'Emblema', bundle: 'Paquete',
};
export const CAL_KIND: Record<string, string> = { event: 'Evento', store: 'Tienda', gift: 'Regalo', season: 'Temporada' };
export const plural = (n: number, one: string, many: string) => `${num(n)} ${n === 1 ? one : many}`;
