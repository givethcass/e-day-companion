// Xbox-style achievements for the demo: 1,000 Gamerscore in 30 entries. Progress is counted from the player's
// matches with the same metrics as medals; rarity is the share of players who have it, illustrative.
const a = (id, name, description, gamerscore, metric, goal, rarity, extra = {}) =>
  ({ id: `ach_${id}`, name, description, gamerscore, metric, goal, rarity, ...extra });

export const ACHIEVEMENTS = [
  a('first', 'Bienvenido al E-Day', 'Juega tu primera partida.', 10, 'matches', 1, 0.97),
  a('ch1', 'Emergencia', 'Completa el capítulo 1 de la campaña.', 15, 'chapters', 1, 0.81),
  a('ch6', 'A mitad del camino', 'Completa 6 capítulos de la campaña.', 30, 'chapters', 6, 0.38),
  a('ch12', 'Kalona sigue en pie', 'Termina la campaña.', 75, 'chapters', 12, 0.19),
  a('collect', 'Archivista de la COG', 'Encuentra los 36 coleccionables.', 50, 'chapters', 12, 0.06, { share: 3, goal: 36 }),
  a('v1', 'Primera victoria', 'Gana una partida de Versus.', 10, 'versusWins', 1, 0.62),
  a('v50', 'Veterano de la arena', 'Gana 50 partidas de Versus.', 40, 'versusWins', 50, 0.11),
  a('v150', 'Leyenda de la arena', 'Gana 150 partidas de Versus.', 60, 'versusWins', 150, 0.02),
  a('ranked', 'Placement', 'Juega tus 3 partidas de clasificación de Ranked.', 20, 'ranked', 3, 0.24),
  a('ranked100', 'Competidor incansable', 'Juega 100 partidas de Ranked.', 50, 'ranked', 100, 0.03),
  a('exec', 'Verdugo', 'Consigue 100 ejecuciones en Versus.', 30, 'versusKills', 100, 0.07, { share: 0.08 }),
  a('stomp', 'Bota de la COG', 'Pisotea 50 cráneos en Versus.', 20, 'versusKills', 50, 0.09, { share: 0.04 }),
  a('chainsaw', 'Encendido', 'Ejecuta a 25 enemigos con la sierra del Lancer.', 20, 'kills', 25, 0.31, { share: 0.01 }),
  a('lancer', 'Maestro del Lancer', 'Consigue 1,500 bajas con el Lancer MK1.', 40, 'kills', 1500, 0.08, { share: 0.22 }),
  a('gnasher', 'A quemarropa', 'Consigue 1,000 bajas con la Gnasher.', 30, 'kills', 1000, 0.09, { share: 0.15 }),
  a('headshot', 'Cabeza fría', 'Consigue 500 disparos a la cabeza.', 30, 'kills', 500, 0.12, { share: 0.18 }),
  a('h1', 'Primera línea', 'Juega una partida de Horde Siege.', 10, 'hordeMatches', 1, 0.71),
  a('h10', 'Oleada diez', 'Supera 10 oleadas en una partida de Horde Siege.', 15, 'bestWave', 10, 0.52),
  a('h20', 'Oleada veinte', 'Supera 20 oleadas en una partida de Horde Siege.', 25, 'bestWave', 20, 0.21),
  a('h30', 'Inquebrantable', 'Completa las 30 oleadas de Horde Siege.', 50, 'hordeCompleted', 1, 0.07),
  a('h30x10', 'Muro de la COG', 'Completa Horde Siege 10 veces.', 60, 'hordeCompleted', 10, 0.01),
  a('waves', 'Rompeolas', 'Supera 1,000 oleadas en total.', 40, 'waves', 1000, 0.03),
  a('revive', 'Ángel de la guarda', 'Reanima a 100 compañeros.', 25, 'matches', 100, 0.14, { share: 2.2 }),
  a('allclasses', 'Todas las clases', 'Juega una partida de Horde Siege con cada clase.', 20, 'hordeMatches', 10, 0.18),
  a('squad', 'Escuadra completa', 'Despliega con una escuadra de cuatro desde la app.', 15, 'hordeMatches', 1, 0.09),
  a('week', 'Semana de servicio', 'Juega 7 días seguidos.', 30, 'streak', 7, 0.13),
  a('hundred', 'Cien horas', 'Juega 100 horas.', 50, 'hours', 100, 0.02),
  a('halloween', 'Noche de brujas', 'Juega 10 partidas durante Halloween.', 30, 'during', 10, 0.17,
    { from: '2026-10-20T15:00:00.000Z', to: '2026-11-03T15:00:00.000Z' }),
  a('queen', 'Por la Reina', 'Completa la misión Por la Reina en Comandante o más.', 50, 'during', 5, 0.04,
    { from: '2026-11-03T15:00:00.000Z', to: '2026-11-17T15:00:00.000Z' }),
  a('reup', 'Re-up', 'Llega a nivel 100 y reinicia tu nivel.', 50, 'matches', 297, 0.01),
];
