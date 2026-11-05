// Medal series for the demo, shaped like E-Day's profile customization: five tiers per series (bronze to
// diamond), each with a goal and a Coin reward. Progress is not stored: the simulated backend counts it from the
// player's matches, so every tier has the date of the match that earned it. Names and goals are illustrative,
// sized so a player with 100 hours still has tiers to chase.
export const MEDAL_REWARDS = [1000, 1500, 2000, 3000, 5000];
export const CAMPAIGN_CHAPTERS = 12;

// `metric` says what each match adds; `share` is the part of a match's kills that goes to that weapon.
export const MEDAL_SERIES = [
  { id: 'md_lancer', name: 'Bajas con Lancer MK1', category: 'weapon', unit: 'bajas con el Lancer MK1', metric: 'kills', share: 0.3, goals: [100, 500, 1500, 3500, 8000] },
  { id: 'md_gnasher', name: 'Bajas con Gnasher', category: 'weapon', unit: 'bajas con la Gnasher', metric: 'kills', share: 0.2, goals: [100, 400, 1200, 3500, 8000] },
  { id: 'md_proto', name: 'Bajas con Lancer prototipo', category: 'weapon', unit: 'bajas con el Lancer prototipo', metric: 'kills', share: 0.12, goals: [50, 250, 800, 2000, 5000] },
  { id: 'md_hammerburst', name: 'Bajas con Hammerburst', category: 'weapon', unit: 'bajas con el Hammerburst', metric: 'kills', share: 0.1, goals: [50, 250, 800, 2000, 5000] },
  { id: 'md_longshot', name: 'Bajas con Longshot', category: 'weapon', unit: 'bajas con el Longshot', metric: 'kills', share: 0.07, goals: [50, 300, 1000, 2500, 5000] },
  { id: 'md_waves', name: 'Oleadas superadas', category: 'horde', unit: 'oleadas superadas en Horde Siege', metric: 'waves', goals: [50, 250, 1000, 2500, 6000] },
  { id: 'md_survivor', name: 'Superviviente de Horde', category: 'horde', unit: 'partidas de Horde Siege completas (30 oleadas)', metric: 'hordeCompleted', goals: [1, 5, 15, 40, 100] },
  { id: 'md_executions', name: 'Ejecuciones', category: 'versus', unit: 'ejecuciones en Versus', metric: 'versusKills', share: 0.08, goals: [10, 50, 150, 300, 800] },
  { id: 'md_wins', name: 'Victorias en Versus', category: 'versus', unit: 'victorias en Versus', metric: 'versusWins', goals: [5, 25, 75, 200, 500] },
  { id: 'md_ranked', name: 'Partidas de Ranked', category: 'versus', unit: 'partidas de Ranked', metric: 'ranked', goals: [5, 25, 100, 250, 500] },
  { id: 'md_chapters', name: 'Capítulos de campaña', category: 'campaign', unit: 'capítulos de campaña completados', metric: 'chapters', goals: [1, 3, 6, 9, 12] },
  { id: 'md_halloween', name: 'Halloween 2026', category: 'event', unit: 'partidas durante Halloween', metric: 'during', from: '2026-10-20T15:00:00.000Z', to: '2026-11-03T15:00:00.000Z', goals: [1, 5, 15, 40, 100] },
  { id: 'md_anniversary', name: '20 aniversario', category: 'event', unit: 'partidas durante el 20 aniversario', metric: 'during', from: '2026-11-03T15:00:00.000Z', to: '2026-11-17T15:00:00.000Z', goals: [1, 5, 15, 40, 100] },
];
