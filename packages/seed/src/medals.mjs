// Medal series for the demo, shaped like E-Day's profile customisation: more than 70 series in ten groups,
// five tiers each (Bronce to Diamante). Every tier pays Coins; Oro and Ónix also unlock a cosmetic and Diamante
// a player title, as in the game. Weapon thresholds follow the game (100 / 500 / 1,500 / 3,000 / 5,000 kills);
// the rest are illustrative. Progress is not stored: the simulated backend counts it from the player's matches,
// so every tier has the date of the match that earned it.
export const MEDAL_REWARDS = [1000, 1500, 2000, 3000, 5000];
export const CAMPAIGN_CHAPTERS = 12;

// `metric` says what each match adds and `share` scales it: the part of a match's kills made with that weapon,
// or how many of something a typical match brings (revives, tags...). The game would count these exactly.
const WEAPON = [100, 500, 1500, 3000, 5000];
const SMALL = [25, 100, 250, 500, 1000];
const BOSS = [10, 50, 150, 300, 500];
const RUNS = [5, 25, 75, 150, 300];
const MANY = [10, 50, 150, 300, 600];
const EVENT = [1, 5, 15, 40, 100];

const weapon = (id, name, the, share, title) =>
  ({ id: `md_${id}`, name: `Bajas con ${name}`, category: 'weapon', unit: `bajas con ${the} ${name}`, metric: 'kills', share, goals: WEAPON, title, item: 'weapon' });
const series = (id, name, category, unit, metric, share, goals, title, extra = {}) =>
  ({ id: `md_${id}`, name, category, unit, metric, share, goals, title, ...extra });

export const MEDAL_SERIES = [
  // Armas
  weapon('lancer', 'Lancer MK1', 'el', 0.22, 'Sierra en mano'),
  weapon('gnasher', 'Gnasher', 'la', 0.15, 'Rey del cuerpo a cuerpo'),
  weapon('proto', 'Lancer prototipo', 'el', 0.08, 'Pionero'),
  weapon('hammerburst', 'Hammerburst', 'el', 0.07, 'Ráfaga exacta'),
  weapon('breechshot', 'Breechshot', 'el', 0.05, 'Golpe seco'),
  weapon('longshot', 'Longshot', 'el', 0.05, 'Ojo de halcón'),
  weapon('ripper', 'Ripper', 'el', 0.03, 'Desgarrador'),
  weapon('snub', 'Snub', 'la', 0.03, 'Última bala'),
  weapon('incinerator', 'Incinerador', 'el', 0.02, 'Pirómano'),
  weapon('gutpuncher', 'Gut-Puncher', 'el', 0.02, 'Puño de hierro'),
  weapon('torque', 'Arco Torque', 'el', 0.02, 'Flecha certera'),
  weapon('boomshot', 'Boomshot pesado', 'el', 0.02, 'Demoledor'),
  weapon('striga', 'Striga', 'la', 0.015, 'Cazador nocturno'),
  weapon('troika', 'Troika', 'la', 0.015, 'Muro de plomo'),
  weapon('vulcan', 'Vulcan', 'la', 0.01, 'Tormenta de acero'),
  weapon('gorehook', 'Gorehook', 'el', 0.01, 'Anzuelo'),
  // Granadas y minas
  series('frag', 'Granadas de fragmentación', 'grenade', 'bajas con granada de fragmentación', 'kills', 0.03, SMALL, 'Lanzador'),
  series('incendiary', 'Granadas incendiarias', 'grenade', 'bajas con granada incendiaria', 'kills', 0.015, SMALL, 'Tierra quemada'),
  series('razor', 'Minas cuchilla', 'grenade', 'bajas con mina cuchilla', 'kills', 0.01, SMALL, 'Trampero'),
  series('smoke', 'Granadas de humo', 'grenade', 'bajas con granada de humo', 'kills', 0.004, BOSS, 'Cortina'),
  series('concussion', 'Aturdimientos', 'grenade', 'enemigos aturdidos con granada', 'matches', 0.8, SMALL, 'Conmoción'),
  // Tipo de baja
  series('headshot', 'Disparos a la cabeza', 'kill_type', 'bajas con disparo a la cabeza', 'kills', 0.18, WEAPON, 'Cabeza fría'),
  series('explosive', 'Bajas explosivas', 'kill_type', 'bajas con explosivos', 'kills', 0.05, WEAPON, 'Dinamita'),
  series('bladed', 'Bajas con filo', 'kill_type', 'bajas con arma de filo', 'kills', 0.03, SMALL, 'Filo'),
  series('slider', 'Bajas al deslizarte', 'kill_type', 'bajas al deslizarte a cobertura', 'kills', 0.02, SMALL, 'Resbaladizo'),
  series('executions', 'Ejecuciones', 'kill_type', 'ejecuciones en Versus', 'versusKills', 0.08, [10, 50, 150, 300, 800], 'Verdugo'),
  series('stomps', 'Pisotones', 'kill_type', 'pisotones de cráneo', 'versusKills', 0.04, SMALL, 'Bota de la COG'),
  series('chainsaw', 'Ejecuciones con sierra', 'kill_type', 'ejecuciones con la sierra del Lancer', 'kills', 0.01, SMALL, 'Motosierra'),
  series('charger', 'Cargas', 'kill_type', 'bajas con carga de bayoneta', 'kills', 0.008, BOSS, 'Embestida'),
  // Apoyo
  series('revives', 'Reanimaciones', 'support', 'compañeros reanimados', 'matches', 2.2, [25, 100, 300, 750, 1500], 'Ángel de la guarda'),
  series('stim', 'Reanimaciones con estimulante', 'support', 'reanimaciones con granada estimulante', 'hordeMatches', 1.5, MANY, 'Adrenalina'),
  series('marker', 'Marcas', 'support', 'enemigos marcados para tu equipo', 'matches', 3, [50, 250, 750, 1500, 3000], 'Vigía'),
  series('reload', 'Recargas perfectas', 'support', 'recargas activas perfectas', 'matches', 6, [100, 500, 1500, 3000, 6000], 'Manos rápidas'),
  series('mvp', 'Jugador más valioso', 'support', 'partidas como MVP', 'versusWins', 0.3, RUNS, 'Imprescindible'),
  // Horde Siege
  series('missions', 'Misiones de Horde', 'horde', 'misiones de Horde Siege jugadas', 'hordeMatches', 1, RUNS, 'Sitiado'),
  series('survivor', 'Superviviente de Horde', 'horde', 'partidas de Horde Siege completas (30 oleadas)', 'hordeCompleted', 1, EVENT, 'Inquebrantable'),
  series('waves', 'Oleadas superadas', 'horde', 'oleadas superadas en Horde Siege', 'waves', 1, [50, 250, 1000, 2500, 6000], 'Rompeolas'),
  series('invasion', 'Invasiones', 'horde', 'eventos de invasión superados', 'hordeMatches', 0.6, RUNS, 'Contención'),
  series('secondary', 'Objetivos secundarios', 'horde', 'objetivos secundarios completados', 'hordeMatches', 1.4, MANY, 'Extra milla'),
  series('perfect', 'Defensa perfecta', 'horde', 'oleadas jefe sin perder la base', 'hordeCompleted', 0.5, EVENT, 'Fortaleza'),
  series('spender', 'Gran inversor', 'horde', 'de energía gastada en la base', 'waves', 120, [10000, 50000, 150000, 300000, 600000], 'Magnate'),
  series('gear', 'Equipo táctico', 'horde', 'piezas de equipo desplegadas', 'hordeMatches', 6, [25, 100, 300, 750, 1500], 'Ingeniero'),
  series('assault', 'Especialista: Asalto', 'horde', 'partidas como Asalto', 'role', 1, RUNS, 'Punta de lanza', { role: 'assault' }),
  series('breacher', 'Especialista: Irruptor', 'horde', 'partidas como Irruptor', 'role', 1, RUNS, 'Abrebrechas', { role: 'breacher' }),
  series('marksman', 'Especialista: Tirador', 'horde', 'partidas como Tirador', 'role', 1, RUNS, 'Francotirador', { role: 'marksman' }),
  series('medic', 'Especialista: Médico', 'horde', 'partidas como Médico', 'role', 1, RUNS, 'Sanador', { role: 'medic' }),
  series('nomanleft', 'Nadie se queda atrás', 'horde', 'compañeros rescatados antes de morir', 'hordeMatches', 0.8, MANY, 'Hermano de armas'),
  series('cogtags', 'Placas COG', 'horde', 'placas COG recuperadas', 'hordeMatches', 2, MANY, 'Memoria'),
  series('struggle', 'Rescates', 'horde', 'compañeros liberados de un agarre', 'hordeMatches', 1.2, MANY, 'Libertador'),
  series('chopper', 'Artillero del helicóptero', 'horde', 'apoyos de helicóptero usados', 'hordeMatches', 0.3, RUNS, 'Desde el aire'),
  series('eholes', 'Agujeros de emergencia', 'horde', 'agujeros de emergencia sellados', 'waves', 0.25, MANY, 'Tapón'),
  series('decoy', 'Señuelos', 'horde', 'enemigos atraídos con señuelo', 'hordeMatches', 0.9, MANY, 'Carnada'),
  series('siege', 'Equipo de asedio', 'horde', 'bajas con torretas y defensas', 'hordeKills', 0.05, [25, 100, 300, 750, 1500], 'Artillero'),
  // Enemigos (Horde Siege)
  series('drone', 'Drones', 'enemy', 'Drones abatidos', 'hordeKills', 0.3, WEAPON, 'Exterminador'),
  series('wretch', 'Wretches', 'enemy', 'Wretches abatidos', 'hordeKills', 0.25, WEAPON, 'Antiplaga'),
  series('scorched', 'Legión Calcinada', 'enemy', 'soldados de la Legión Calcinada abatidos', 'hordeKills', 0.1, WEAPON, 'Cortafuegos'),
  series('ticker', 'Tickers', 'enemy', 'Tickers abatidos', 'hordeKills', 0.08, SMALL, 'Desactivador'),
  series('bilefrog', 'Bilefrogs', 'enemy', 'Bilefrogs abatidos', 'hordeKills', 0.03, SMALL, 'Saltarín'),
  series('boomer', 'Boomers', 'enemy', 'Boomers abatidos', 'hordeKills', 0.03, SMALL, 'Antiboom'),
  series('scoria', 'Scorias', 'enemy', 'Scorias abatidos', 'hordeKills', 0.02, SMALL, 'Ceniza'),
  series('reaver', 'Reavers', 'enemy', 'Reavers derribados', 'hordeKills', 0.01, BOSS, 'Antiaéreo'),
  series('seeder', 'Seeders', 'enemy', 'Seeders destruidos', 'hordeKills', 0.005, BOSS, 'Arrancaraíces'),
  // Versus
  series('wins', 'Victorias en Versus', 'versus', 'victorias en Versus', 'versusWins', 1, [10, 50, 150, 300, 500], 'Invicto'),
  series('vmatches', 'Partidas de Versus', 'versus', 'partidas de Versus', 'versusMatches', 1, [25, 100, 300, 600, 1000], 'Veterano'),
  series('ranked', 'Partidas de Ranked', 'versus', 'partidas de Ranked', 'ranked', 1, [5, 25, 100, 250, 500], 'Competidor'),
  series('firstblood', 'Primera sangre', 'versus', 'primeras bajas de la partida', 'versusMatches', 0.15, RUNS, 'Primero en llegar'),
  series('streaks', 'Rachas', 'versus', 'rachas de 5 bajas sin caer', 'versusMatches', 0.1, RUNS, 'Imparable'),
  series('rings', 'Anillos capturados', 'versus', 'anillos capturados en Conquista', 'versusMatches', 1.2, [25, 100, 300, 750, 1500], 'Conquistador'),
  // Campaña
  series('chapters', 'Superviviente de Kalona', 'campaign', 'capítulos de campaña completados', 'chapters', 1, [1, 3, 6, 9, 12], 'Forjado en el fuego'),
  series('ckills', 'Bajas en campaña', 'campaign', 'bajas en campaña', 'campaignKills', 1, [50, 150, 300, 600, 1000], 'Sobreviviente del E-Day'),
  series('collect', 'Coleccionables', 'campaign', 'coleccionables encontrados', 'chapters', 3, [3, 9, 18, 27, 36], 'Archivista'),
  // Progresión
  series('reup', 'Re-up', 'progression', 're-ups (llegar a nivel 100 y reiniciar)', 'matches', 1 / 297, [1, 2, 3, 4, 5], 'Leyenda de la COG'),
  // Eventos
  series('halloween', 'Halloween 2026', 'event', 'partidas durante Halloween', 'during', 1, EVENT, 'Noche de brujas',
    { from: '2026-10-20T15:00:00.000Z', to: '2026-11-03T15:00:00.000Z' }),
  series('anniversary', '20 aniversario', 'event', 'partidas durante el 20 aniversario', 'during', 1, EVENT, 'Hermanos hasta el final',
    { from: '2026-11-03T15:00:00.000Z', to: '2026-11-17T15:00:00.000Z' }),
];
