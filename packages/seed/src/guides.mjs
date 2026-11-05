// Guides and creators for the demo, written for this concept. The four Horde Siege classes are the game's;
// abilities, loadouts, map details and collectible counts are illustrative, and creators are invented people.
// Map names are the demo's own placeholders.

export const CREATORS = [
  { id: 'cr_cobertura', name: 'LaCobertura', platform: 'youtube', language: 'es', followers: 182000, focus: 'Horde Siege y builds de escuadra',
    live: false, latest: { title: 'Oleada 30 en Locura con 4 clases: la ruta completa', minutes: 38, publishedAt: '2026-10-25T18:00:00.000Z' } },
  { id: 'cr_tiognasher', name: 'TioGnasher', platform: 'twitch', language: 'es', followers: 96000, focus: 'Versus y Ranked',
    live: true, latest: { title: 'Ranked hasta Ónix 1, sin parar', minutes: 0, publishedAt: '2026-10-27T17:30:00.000Z' } },
  { id: 'cr_medica', name: 'MedicaDeGuardia', platform: 'youtube', language: 'es', followers: 54000, focus: 'Médico y apoyo en Horde',
    live: false, latest: { title: 'Cuándo usar la granada estimulante (y cuándo no)', minutes: 14, publishedAt: '2026-10-23T22:00:00.000Z' } },
  { id: 'cr_kalona', name: 'Kalona100', platform: 'youtube', language: 'es', followers: 41000, focus: 'Campaña al 100% y coleccionables',
    live: false, latest: { title: 'Los 36 coleccionables en una sola partida', minutes: 52, publishedAt: '2026-10-19T16:00:00.000Z' } },
  { id: 'cr_ironsight', name: 'Ironsight', platform: 'twitch', language: 'en', followers: 230000, focus: 'Versus competitivo',
    live: false, latest: { title: 'Gnasher timings after the Nov 2 update', minutes: 21, publishedAt: '2026-11-03T20:00:00.000Z' } },
];

const official = { name: 'Guía oficial', kind: 'official' };
const by = (creatorId) => ({ name: CREATORS.find((c) => c.id === creatorId).name, kind: 'creator', creatorId });

export const GUIDES = [
  // ---------- Clases de Horde Siege ----------
  {
    id: 'g_assault', section: 'classes', role: 'assault', author: official, readMinutes: 4, updatedAt: '2026-10-14T18:00:00.000Z',
    title: 'Asalto: la punta de lanza', summary: 'Abre el paso, aturde y aguanta la primera línea mientras la escuadra se acomoda.',
    facts: [['Papel', 'Primera línea'], ['Habilidad', 'Carga de choque'], ['Granada', 'Fragmentación'], ['Arma sugerida', 'Lancer MK1']],
    sections: [
      { paragraphs: ['El Asalto es quien entra primero. Su trabajo no es tener más bajas, sino ganar los segundos que necesita la escuadra para colocar defensas.'] },
      { heading: 'Qué hace bien', bullets: ['Aturde grupos con la carga y deja a los enemigos listos para el Irruptor.', 'Aguanta más daño que cualquier otra clase.', 'Recupera la habilidad más rápido si remata enemigos aturdidos.'] },
      { heading: 'Errores comunes', bullets: ['Avanzar solo: sin un Médico cerca, una carga mal medida es una baja segura.', 'Gastar la carga en enemigos sueltos. Guárdala para los grupos que entran por la brecha.'] },
      { heading: 'Con quién combina', paragraphs: ['Con el Irruptor detrás para limpiar lo que aturdes, y con el Tirador cubriendo a los jefes que tú no puedes tumbar.'] },
    ],
  },
  {
    id: 'g_breacher', section: 'classes', role: 'breacher', author: official, readMinutes: 4, updatedAt: '2026-10-14T18:00:00.000Z',
    title: 'Irruptor: limpieza de cerca', summary: 'Escopeta, escudo y daño a quemarropa para sellar brechas antes de que se llenen.',
    facts: [['Papel', 'Corto alcance'], ['Habilidad', 'Escudo de brecha'], ['Granada', 'Incendiaria'], ['Arma sugerida', 'Gnasher']],
    sections: [
      { paragraphs: ['El Irruptor gana las peleas a menos de cinco metros. Es la clase que más se nota cuando falta: sin él, los enemigos llegan a la base.'] },
      { heading: 'Qué hace bien', bullets: ['Cierra brechas con el escudo mientras la escuadra recarga.', 'Remata con la Gnasher lo que el Asalto aturde.', 'Su granada incendiaria bloquea un pasillo durante varios segundos.'] },
      { heading: 'Errores comunes', bullets: ['Pelear a media distancia: ahí cualquier Lancer le gana.', 'Usar el escudo para avanzar. Úsalo para retener una puerta.'] },
    ],
  },
  {
    id: 'g_marksman', section: 'classes', role: 'marksman', author: official, readMinutes: 4, updatedAt: '2026-10-22T18:00:00.000Z',
    title: 'Tirador: los jefes son tuyos', summary: 'Longshot, marcas y paciencia. Quien tumba a los Boomers y Reavers antes de que lleguen.',
    facts: [['Papel', 'Larga distancia'], ['Habilidad', 'Marca de punto débil'], ['Granada', 'Humo'], ['Arma sugerida', 'Longshot']],
    sections: [
      { paragraphs: ['El Tirador decide cuánto daño llega a la base. Si los jefes caen antes de la mitad del mapa, la oleada es fácil.'] },
      { heading: 'Qué hace bien', bullets: ['Marca puntos débiles: todo el equipo hace más daño a ese enemigo.', 'Derriba Reavers y Boomers a distancia.', 'Ve primero por dónde viene la invasión y avisa a la escuadra.'] },
      { heading: 'Desde el parche del 22 de octubre', paragraphs: ['La marca dura un poco menos, pero se recarga antes. Márcalos en cuanto aparezcan, no esperes al mejor momento.'] },
    ],
  },
  {
    id: 'g_medic', section: 'classes', role: 'medic', author: official, readMinutes: 4, updatedAt: '2026-10-14T18:00:00.000Z',
    title: 'Médico: nadie se queda en el suelo', summary: 'Reanimaciones a distancia, granada estimulante y saber cuándo no arriesgarse.',
    facts: [['Papel', 'Apoyo'], ['Habilidad', 'Granada estimulante'], ['Granada', 'Estimulante'], ['Arma sugerida', 'Lancer prototipo']],
    sections: [
      { paragraphs: ['El Médico es la clase que más alarga una partida. Una escuadra sin Médico pierde, en promedio, varias oleadas antes.'] },
      { heading: 'Qué hace bien', bullets: ['Reanima desde lejos con la granada estimulante.', 'Cura a toda la escuadra si están juntos en la base.', 'Recupera placas COG sin exponerse.'] },
      { heading: 'Errores comunes', bullets: ['Correr a reanimar en medio del fuego: dos caídos son peor que uno.', 'Guardar la granada para "una emergencia". Úsala cada vez que esté lista.'] },
    ],
  },
  {
    id: 'g_squad', section: 'classes', author: official, readMinutes: 5, updatedAt: '2026-10-28T18:00:00.000Z',
    title: 'Cómo armar una escuadra de cuatro', summary: 'Una de cada clase gana casi siempre. Qué cambiar cuando no se puede.',
    facts: [['Ideal', '1 de cada clase'], ['Si faltan', 'Médico antes que Tirador'], ['Escuadras por partida', '3 de 4 jugadores']],
    sections: [
      { paragraphs: ['Horde Siege junta 12 jugadores en tres escuadras de cuatro. Cada escuadra defiende su propio frente, así que el balance importa dentro de cada una.'] },
      { heading: 'Orden de prioridad', bullets: ['Médico: sin él, cada caída cuesta un jugador hasta la siguiente oleada.', 'Irruptor: sin él, las brechas se llenan.', 'Tirador: sin él, los jefes llegan a la base.', 'Asalto: el más fácil de cubrir con otra clase.'] },
      { heading: 'En la app', paragraphs: ['El planificador de escuadras te dice qué clase falta en tu escuadra antes de desplegar.'] },
    ],
    cta: { label: 'Ver escuadras abiertas', link: '/comunidad' },
  },
  // ---------- Armas ----------
  {
    id: 'g_lancers', section: 'weapons', author: official, readMinutes: 3, updatedAt: '2026-11-02T20:00:00.000Z', patch: '2 nov',
    title: 'Lancer MK1 o Lancer prototipo', summary: 'Las dos versiones del rifle clásico y en qué situación gana cada una.',
    facts: [['Lancer MK1', 'Sierra, cadencia media'], ['Lancer prototipo', 'Bayoneta, más daño'], ['Mejor en', 'Media distancia']],
    sections: [
      { paragraphs: ['Las dos son armas de media distancia. La diferencia está en lo que pasa cuando el enemigo se acerca.'] },
      { heading: 'Lancer MK1', bullets: ['La sierra ejecuta de un golpe a casi cualquier enemigo de Horde.', 'Retroceso fácil de controlar.', 'Mejor para Asalto y Médico.'] },
      { heading: 'Lancer prototipo', bullets: ['Más daño por bala, menos balas por cargador.', 'La carga de bayoneta derriba en Versus.', 'Mejor para quien juega Versus y no se queda quieto.'] },
      { heading: 'Lo que cambió el 2 de noviembre', paragraphs: ['El parche anunció un ajuste de armas para las próximas semanas. Esta guía se actualizará cuando salga.'] },
    ],
  },
  {
    id: 'g_gnasher', section: 'weapons', author: by('cr_tiognasher'), readMinutes: 6, updatedAt: '2026-10-24T03:00:00.000Z',
    title: 'Gnasher sin miedo: distancia y tiempos', summary: 'A qué distancia mata de un tiro, cómo moverse entre coberturas y por qué no debes saltar a ciegas.',
    facts: [['Mata de un tiro', 'Menos de 3 m'], ['Mejor mapa', 'Mercado Viejo'], ['Clase', 'Irruptor']],
    sections: [
      { paragraphs: ['La Gnasher es el arma que define Versus. Ganar con ella es sobre todo una cuestión de distancia.'] },
      { heading: 'Las tres reglas', bullets: ['Dispara solo cuando veas al rival llenar la mira.', 'Deslízate a cobertura antes de disparar, nunca después.', 'Si fallas, sal: la segunda bala casi nunca gana.'] },
      { heading: 'Para practicar', paragraphs: ['Juega Duelo por equipos en Mercado Viejo. Los pasillos cortos te obligan a pelear de cerca.'] },
    ],
  },
  {
    id: 'g_weapons_class', section: 'weapons', author: by('cr_cobertura'), readMinutes: 7, updatedAt: '2026-10-26T20:00:00.000Z',
    title: 'Qué arma lleva cada clase en Horde', summary: 'La lista que usamos para llegar a la oleada 30, clase por clase.',
    facts: [['Asalto', 'Lancer MK1 + Snub'], ['Irruptor', 'Gnasher + Gut-Puncher'], ['Tirador', 'Longshot + Hammerburst'], ['Médico', 'Lancer prototipo + Snub']],
    sections: [
      { paragraphs: ['No hay un arma mejor para todos. Hay una mejor para lo que hace tu clase.'] },
      { heading: 'Imprescindibles', bullets: ['Longshot para el Tirador, sin discusión.', 'Gnasher para el Irruptor.', 'Una pistola de reserva para todos: cuando se acaba la munición, la Snub te salva.'] },
      { heading: 'Para jefes', bullets: ['Boomshot pesado si aparece en el mapa: guárdalo para Boomers y Reavers.', 'Arco Torque si tu Tirador cae y nadie más puede tumbar jefes.'] },
    ],
  },
  // ---------- Mapas ----------
  {
    id: 'g_map_bastion', section: 'maps', map: 'Bastión', author: official, readMinutes: 4, updatedAt: '2026-10-14T18:00:00.000Z',
    title: 'Bastión: defender la puerta norte', summary: 'Tres frentes, una base en alto y la brecha que decide la oleada 20.',
    facts: [['Modo', 'Horde Siege'], ['Frentes', '3'], ['Oleada difícil', '20'], ['Clave', 'Puerta norte']],
    sections: [
      { paragraphs: ['Bastión tiene la base más alta de Horde Siege. Desde ahí se ve casi todo el mapa, lo que lo hace bueno para el Tirador.'] },
      { heading: 'Por frente', bullets: ['Norte: la puerta es la entrada principal. Escudo del Irruptor ahí desde la oleada 10.', 'Este: pasillo largo, ideal para torretas.', 'Oeste: entra poco, pero por ahí llegan los Tickers.'] },
      { heading: 'Oleada 20', paragraphs: ['Llega el primer Reaver. Si el Tirador lo marca antes de que cruce el puente, la oleada se gana sin perder la base.'] },
    ],
  },
  {
    id: 'g_map_presa', section: 'maps', map: 'Presa Sur', author: official, readMinutes: 4, updatedAt: '2026-10-14T18:00:00.000Z',
    title: 'Presa Sur: el agua como trampa', summary: 'Compuertas que abren y cierran caminos. Úsalas antes de que lo haga el enemigo.',
    facts: [['Modo', 'Horde Siege'], ['Frentes', '3'], ['Oleada difícil', '25'], ['Clave', 'Las compuertas']],
    sections: [
      { paragraphs: ['En Presa Sur las compuertas cambian el mapa cada cinco oleadas. Quien las controla decide por dónde entra la invasión.'] },
      { heading: 'Consejos', bullets: ['Cierra la compuerta del lado del Irruptor antes de la oleada 15.', 'Los Bilefrogs saltan el agua: el Tirador debe cubrir la orilla.', 'Coloca el señuelo en el dique para dividir a los Wretches.'] },
    ],
  },
  {
    id: 'g_map_hangar', section: 'maps', map: 'Hangar 7', author: official, readMinutes: 3, updatedAt: '2026-10-14T18:00:00.000Z',
    title: 'Hangar 7: pelear en espacios cerrados', summary: 'Mapa corto y sin línea de vista. Gana quien tiene más Irruptores.',
    facts: [['Modo', 'Horde Siege'], ['Frentes', '2'], ['Oleada difícil', '28'], ['Clave', 'Pasarelas']],
    sections: [
      { paragraphs: ['Hangar 7 casi no tiene distancia larga. El Tirador sufre y el Irruptor brilla.'] },
      { heading: 'Consejos', bullets: ['Lleva dos Irruptores si puedes.', 'Las pasarelas son la única vista larga: el Tirador vive ahí.', 'El helicóptero entra por el techo abierto. Pídelo en la oleada 25.'] },
    ],
  },
  {
    id: 'g_map_mercado', section: 'maps', map: 'Mercado Viejo', author: by('cr_tiognasher'), readMinutes: 5, updatedAt: '2026-10-20T03:00:00.000Z',
    title: 'Mercado Viejo: nombres para cada esquina', summary: 'Las llamadas que usamos en Versus para que todo el equipo sepa dónde está el rival.',
    facts: [['Modo', 'Versus'], ['Mejor arma', 'Gnasher'], ['Llamadas', '8']],
    sections: [
      { paragraphs: ['Si tu equipo usa los mismos nombres, la información llega a tiempo. Estos son los que usamos en Ranked.'] },
      { heading: 'Llamadas', bullets: ['Fuente: el centro del mapa.', 'Carnicería: la tienda con dos puertas al este.', 'Puente rojo: la pasarela alta del norte.', 'Callejón: el paso estrecho del sur.', 'Arcos: las columnas frente a la salida azul.'] },
    ],
  },
  // ---------- Coleccionables ----------
  {
    id: 'g_collect_1', section: 'collectibles', author: by('cr_kalona'), readMinutes: 8, updatedAt: '2026-10-12T16:00:00.000Z',
    title: 'Coleccionables, capítulos 1 a 6', summary: 'Los 18 coleccionables de la primera mitad de la campaña, en orden.',
    facts: [['Capítulos', '1 a 6'], ['Coleccionables', '18'], ['Se pueden perder', 'No, hay selección de capítulo']],
    sections: [
      { paragraphs: ['Cada capítulo tiene tres coleccionables. Si se te pasa uno, puedes repetir el capítulo desde el menú.'] },
      { heading: 'Capítulo 1', bullets: ['Placa COG detrás del camión volcado, al salir del refugio.', 'Diario en la mesa del puesto de control.', 'Cartel de reclutamiento en el muro del patio.'] },
      { heading: 'Capítulo 2', bullets: ['Placa COG bajo la escalera del metro.', 'Radio en la taquilla cerrada (dispara el candado).', 'Diario junto al cuerpo en la vía.'] },
      { heading: 'Capítulos 3 a 6', paragraphs: ['El video completo marca el minuto de cada uno.'] },
    ],
  },
  {
    id: 'g_collect_2', section: 'collectibles', author: by('cr_kalona'), readMinutes: 8, updatedAt: '2026-10-15T16:00:00.000Z',
    title: 'Coleccionables, capítulos 7 a 12', summary: 'Los 18 restantes, incluido el que todos se pierden en el capítulo 11.',
    facts: [['Capítulos', '7 a 12'], ['Coleccionables', '18'], ['El difícil', 'Capítulo 11']],
    sections: [
      { paragraphs: ['La segunda mitad tiene coleccionables más escondidos. El del capítulo 11 solo aparece si vuelves por el ascensor.'] },
      { heading: 'Capítulo 11', bullets: ['Antes de subir al ascensor final, regresa al cuarto de máquinas.', 'El diario está en la repisa alta: necesitas trepar por las cajas.'] },
    ],
  },
  // ---------- Builds de la comunidad ----------
  {
    id: 'g_build_wave30', section: 'builds', author: by('cr_cobertura'), readMinutes: 9, updatedAt: '2026-10-25T18:00:00.000Z',
    title: 'La escuadra de la oleada 30', summary: 'Cuatro clases, una ruta de defensas y quién gasta energía en qué. Probada en Locura.',
    facts: [['Dificultad', 'Locura'], ['Mapa', 'Bastión'], ['Clases', 'Asalto, Irruptor, Tirador, Médico'], ['Energía', 'Torretas primero']],
    sections: [
      { paragraphs: ['Esta es la combinación con la que llegamos a la oleada 30 en Locura. Funciona en los tres mapas, pero está pensada para Bastión.'] },
      { heading: 'Quién gasta qué', bullets: ['Oleadas 1 a 10: todos a torretas en la puerta norte.', 'Oleadas 11 a 20: el Médico compra la estación de curación; el resto, barreras.', 'Oleadas 21 a 30: guarden energía para el helicóptero en la 25.'] },
      { heading: 'Roles', bullets: ['Asalto aturde en la puerta y retrocede.', 'Irruptor sostiene el escudo en la brecha.', 'Tirador marca jefes desde la torre.', 'Médico se queda en la base y reanima con estimulante.'] },
    ],
  },
  {
    id: 'g_build_medic', section: 'builds', role: 'medic', author: by('cr_medica'), readMinutes: 6, updatedAt: '2026-10-23T22:00:00.000Z',
    title: 'Médico que no muere', summary: 'Ventajas, posición y la regla de los dos segundos antes de reanimar.',
    facts: [['Clase', 'Médico'], ['Ventaja clave', 'Recarga de estimulante'], ['Posición', 'Detrás del Irruptor']],
    sections: [
      { paragraphs: ['El mejor Médico es el que sigue vivo al final de la oleada. Estas son mis reglas.'] },
      { heading: 'La regla de los dos segundos', paragraphs: ['Antes de reanimar, cuenta dos segundos mirando alrededor. Si nadie te apunta, ve. Si no, usa la granada.'] },
      { heading: 'Ventajas', bullets: ['Recarga de estimulante al máximo.', 'Reanimación rápida en segundo lugar.', 'Nada de daño: no es tu trabajo.'] },
    ],
  },
  {
    id: 'g_build_breacher', section: 'builds', role: 'breacher', author: by('cr_cobertura'), readMinutes: 5, updatedAt: '2026-10-29T18:00:00.000Z',
    title: 'Irruptor de puerta', summary: 'Escudo, incendiaria y Gnasher para que nada cruce tu brecha.',
    facts: [['Clase', 'Irruptor'], ['Ventaja clave', 'Escudo más largo'], ['Mapa ideal', 'Hangar 7']],
    sections: [
      { paragraphs: ['Si tu escuadra tiene un hueco, este build lo tapa. Literalmente.'] },
      { heading: 'Cómo se juega', bullets: ['Escudo arriba en cuanto se abre la brecha.', 'Incendiaria al fondo del pasillo, no en la puerta.', 'Gnasher solo cuando el enemigo toca el escudo.'] },
    ],
  },
];
