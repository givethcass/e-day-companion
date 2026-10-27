// Fixed facts and simulation knobs. Sources for the real-world numbers are in
// docs/case-study.md; everything else here is invented for the demo.

const DAY = 864e5;
export { DAY };

export const SEED = 2026;
export const PLAYER_COUNT = 500;
export const CLAN_COUNT = 25;

// Season 1 runs from the global launch (Oct 6, 3 PM UTC) to Dec 1, 2026 (Windows Central).
export const SEASON = {
  id: 's1',
  number: 1,
  name: 'Emergence',
  startsAt: '2026-10-06T15:00:00.000Z',
  endsAt: '2026-12-01T15:00:00.000Z',
};
export const SEASON_START = Date.parse(SEASON.startsAt);
export const SEASON_END = Date.parse(SEASON.endsAt);

// Versus Ranked opened on Oct 13 (Windows Central).
export const RANKED_START = Date.parse('2026-10-13T15:00:00.000Z');

// The "now" the demo opens on. The API accepts ?asOf= to move it (demo clock).
export const DEMO_NOW = '2026-10-27T18:00:00.000Z';

// Event names are official; their exact dates are simulated as back-to-back two-week blocks.
export const EVENTS = [
  { id: 'ev_halloween', name: 'Halloween', startsAt: '2026-10-20T15:00:00.000Z', endsAt: '2026-11-03T15:00:00.000Z' },
  { id: 'ev_20years', name: '20 Years of Gears', startsAt: '2026-11-03T15:00:00.000Z', endsAt: '2026-11-17T15:00:00.000Z' },
  { id: 'ev_thanksgibbing', name: 'Thanksgibbing', startsAt: '2026-11-17T15:00:00.000Z', endsAt: '2026-12-01T15:00:00.000Z' },
];

// Share of players by hours played, from Alinea Analytics' Oct 1-6 estimates.
// Buckets are [minHours, maxHours, share]. Derived: "<=5h" minus "<1h" gives 1-5h, and so on.
export const PLAYTIME_BUCKETS = {
  xbox: [[0.2, 1, 0.17], [1, 5, 0.37], [5, 15, 0.27], [15, 20, 0.05], [20, 70, 0.14]],
  pc: [[0.2, 1, 0.06], [1, 5, 0.26], [5, 15, 0.35], [15, 20, 0.11], [20, 70, 0.22]],
};

export const COUNTRIES = [
  ['US', 30], ['MX', 14], ['BR', 10], ['GB', 8], ['DE', 6], ['ES', 6],
  ['CA', 6], ['AR', 5], ['CO', 5], ['FR', 5], ['CL', 3], ['PE', 2],
];
export const SPANISH_COUNTRIES = new Set(['MX', 'ES', 'AR', 'CO', 'CL', 'PE']);

// Real map and weapon names are not confirmed yet, so the demo uses placeholders.
export const VERSUS_MAPS = ['[Mapa 1]', '[Mapa 2]', '[Mapa 3]', '[Mapa 4]', '[Mapa 5]'];
export const HORDE_MAPS = ['[Horde 1]', '[Horde 2]', '[Horde 3]'];
export const HORDE_WAVE_GOAL = 30;

// Minutes per match, [min, max].
export const MATCH_MINUTES = {
  versus_tdm: [9, 14],
  versus_conquest: [11, 17],
  versus_ranked: [11, 17],
  horde_siege: [25, 45],
  campaign: [30, 55],
};

export const MEDALS = ['Racha x3', 'MVP', 'Reanimador', 'Defensor', 'Primer derribo', 'Ejecución', 'Último en pie'];
export const HORDE_ROLES = ['assault', 'support', 'engineer', 'marksman'];

export const GAMERTAG_PARTS = {
  head: ['Delta', 'Kilo', 'Torre', 'Pino', 'Roca', 'Viento', 'Nube', 'Brasa', 'Acero', 'Ceniza', 'Sombra', 'Lobo',
    'Halcon', 'Cobalto', 'Trueno', 'Grito', 'Niebla', 'Hierro', 'Oxido', 'Tundra', 'Raven', 'Ghost', 'Rook', 'Vandal',
    'Ember', 'Static', 'Havoc', 'Onyx', 'Drift', 'Mako'],
  tail: ['Rojo', 'Gris', 'Azul', 'Negro', 'Seis', 'Norte', 'Sur', 'Prime', 'Zero', 'Wolf', 'Fox', 'Line', 'Byte', 'Core'],
};

export const CLAN_WORDS = ['Norte', 'Acero', 'Ceniza', 'Tormenta', 'Bastion', 'Vanguard', 'Ironside', 'Fenrir', 'Cobalto',
  'Atlas', 'Granito', 'Halo Rojo', 'Bruma', 'Sable', 'Centinela', 'Ancla', 'Volcan', 'Rescate', 'Ember', 'Tundra',
  'Ronin', 'Paladin', 'Escudo', 'Relampago', 'Ocaso'];

export const STORE = {
  adjectives: ['Ceniza', 'Acero', 'Brasa', 'Sombra', 'Tundra', 'Óxido', 'Cobalto', 'Escarlata', 'Granito', 'Ámbar'],
  types: [
    ['character_skin', 'Armadura', 'iron', [1200, 2000]],
    ['weapon_skin', 'Acabado', 'iron', [500, 1000]],
    ['banner', 'Estandarte', 'coins', [1000, 3000]],
    ['emblem', 'Emblema', 'coins', [500, 2000]],
    ['bundle', 'Paquete', 'iron', [1800, 2800]],
  ],
  itemCount: 40,
  itemsPerRotation: 6,
};

export const CHALLENGE_TEMPLATES = [
  { key: 'versus_wins', title: 'Gana {n} partidas de Versus', goal: [3, 5], mode: 'versus_tdm', reward: '+2000 XP' },
  { key: 'horde_waves', title: 'Supera {n} oleadas en Horde Siege', goal: [20, 40], mode: 'horde_siege', reward: 'Estandarte semanal' },
  { key: 'matches', title: 'Juega {n} partidas en cualquier modo', goal: [5, 10], mode: null, reward: '+1500 XP' },
  { key: 'campaign', title: 'Completa {n} capítulos de campaña', goal: [1, 3], mode: 'campaign', reward: '+1500 XP' },
  { key: 'kills', title: 'Consigue {n} bajas', goal: [50, 150], mode: null, reward: 'Emblema semanal' },
  { key: 'ranked', title: 'Juega {n} partidas de Ranked', goal: [3, 5], mode: 'versus_ranked', reward: '+2500 XP', fromRanked: true },
];
