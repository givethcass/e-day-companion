// Official-style news for the demo. Written for this concept: dates follow the public Season 1 schedule
// (launch Oct 6, Ranked Oct 13, patches Oct 5, 14 and 22, events every two weeks), the wording and the
// details are illustrative. Map names are the demo's own placeholders.
export const GIFT_AT = '2026-11-07T15:00:00.000Z';

export const NEWS = [
  {
    id: 'n_patch_1005', tag: 'patch', publishedAt: '2026-10-05T20:00:00.000Z', readMinutes: 2,
    title: 'Parche del 5 de octubre: listos para el lanzamiento',
    summary: 'Arreglos de inicio de sesión y estabilidad antes de que abran los servidores para todos.',
    sections: [
      { paragraphs: ['Antes del lanzamiento del 6 de octubre publicamos un parche pequeño para quienes ya juegan en acceso anticipado.'] },
      { heading: 'Qué cambia', bullets: [
        'Menos cierres inesperados al cargar Horde Siege.',
        'Arreglo para el error que impedía entrar a los servicios en línea después de vincular la cuenta.',
        'Mejoras de memoria en sesiones largas en PC y consolas portátiles.',
      ] },
    ],
    knownIssues: ['Algunos jugadores ven ping alto al buscar partida fuera de horario pico.'],
  },
  {
    id: 'n_launch', tag: 'season', featured: true, publishedAt: '2026-10-06T15:00:00.000Z', readMinutes: 3,
    title: 'Ya está aquí: lo que trae la Temporada 1, Emergence',
    summary: 'Campaña, Versus y Horde Siege para 12 jugadores. La temporada corre hasta el 1 de diciembre con tres eventos.',
    sections: [
      { paragraphs: [
        'La Temporada 1 empieza hoy y termina el 1 de diciembre. Trae todos los mapas y modos del lanzamiento.',
        'No hay pase de batalla. Casi todo se gana jugando: retos semanales, logros y Monedas que compras en la tienda.',
      ] },
      { heading: 'Fechas de la temporada', bullets: [
        '13 de octubre: abre Versus Ranked.',
        '20 de octubre: empieza Halloween.',
        '3 de noviembre: empieza 20 Years of Gears.',
        '7 de noviembre: regalo de aniversario.',
        '17 de noviembre: empieza Thanksgibbing.',
      ] },
      { heading: 'Cada martes', paragraphs: ['La tienda rota y los retos semanales se renuevan. El tope de Monedas también se reinicia.'] },
    ],
    cta: { label: 'Ver tu semana', link: '/' },
  },
  {
    id: 'n_ranked', tag: 'season', featured: true, publishedAt: '2026-10-13T15:00:00.000Z', readMinutes: 2,
    title: 'Ranked abre hoy: tus 3 primeras partidas definen tu rango',
    summary: 'Versus Ranked ya está disponible. Juega tres partidas de clasificación y recibe tu rango inicial.',
    sections: [
      { paragraphs: ['Versus Ranked abre hoy para todos los jugadores. Es 4 contra 4, con armas iniciales iguales para todos.'] },
      { heading: 'Cómo funciona', bullets: [
        'Tus 3 primeras partidas son de clasificación y definen tu rango inicial.',
        'Los rangos van de Bronce a Ónix, cada uno con divisiones.',
        'Si alguien se desconecta, tiene dos minutos para volver antes de que la partida se cancele.',
      ] },
    ],
    cta: { label: 'Ver clasificaciones', link: '/servicio/clasificacion' },
  },
  {
    id: 'n_patch_1014', tag: 'patch', publishedAt: '2026-10-14T17:00:00.000Z', readMinutes: 4,
    title: 'Actualización 1: más de 60 arreglos',
    summary: 'Corrige rangos mal asignados tras las partidas de clasificación, cierres en sesiones largas y errores de Horde Siege.',
    sections: [
      { paragraphs: ['Es la primera actualización grande desde el lanzamiento y toca todos los modos.'] },
      { heading: 'Ranked', bullets: ['Arreglamos las partidas de clasificación que asignaban una división equivocada.'] },
      { heading: 'Horde Siege', bullets: [
        'El dispensador del Médico vuelve a levantar aliados con fuego amigo activo.',
        'Los jefes de invasión ya no se vuelven invencibles.',
        'Los Boomers ya no se quedan atorados en la fábrica de Presa Sur.',
      ] },
      { heading: 'Versus', bullets: [
        'El golpe cuerpo a cuerpo del Lancer vuelve a derribar.',
        'Ya no se pueden capturar zonas de Conquista desde fuera en Distrito Norte.',
      ] },
      { heading: 'Estabilidad', bullets: ['Mejoras de memoria para sesiones largas en todas las plataformas.'] },
    ],
    knownIssues: [
      'Los coleccionables perdidos no se devuelven solos: hay que recogerlos de nuevo.',
      'Algunos logros de campaña no se otorgan al terminar.',
    ],
  },
  {
    id: 'n_coins', tag: 'store', publishedAt: '2026-10-16T15:00:00.000Z', readMinutes: 2,
    title: 'Cómo funciona el tope semanal de Monedas',
    summary: 'Puedes ganar hasta 50,000 Monedas por semana jugando partidas. Los retos no cuentan para el tope.',
    sections: [
      { paragraphs: [
        'Las Monedas se ganan jugando y se usan en la tienda. Las partidas dan hasta 50,000 por semana.',
        'Lo que ganas con retos y logros no cuenta para ese tope. El contador vuelve a cero cada martes, cuando rota la tienda.',
      ] },
      { heading: 'Para que no te tome por sorpresa', bullets: [
        'En Tienda ves cuánto llevas de tu tope y cuándo se reinicia.',
        'Cada objeto te dice si te alcanza o cuántas partidas te faltan.',
      ] },
    ],
    cta: { label: 'Abrir la tienda', link: '/tienda' },
  },
  {
    id: 'n_halloween', tag: 'event', featured: true, publishedAt: '2026-10-20T15:00:00.000Z', readMinutes: 2,
    title: 'Halloween llega a Versus y Horde Siege',
    summary: 'Dos semanas con un modo de evento en Versus, una misión especial de Horde y recompensas por tiempo limitado.',
    sections: [
      { paragraphs: ['Del 20 de octubre al 3 de noviembre. Juega el modo de evento en Versus o la misión de Horde Siege para ganar sus recompensas.'] },
      { heading: 'Recompensas', bullets: ['Emblema Halloween.', 'Estandarte Halloween.'] },
    ],
    cta: { label: 'Buscar escuadra', link: '/comunidad' },
  },
  {
    id: 'n_patch_1022', tag: 'patch', publishedAt: '2026-10-22T17:00:00.000Z', readMinutes: 3,
    title: 'Actualización 2: las partidas de Ranked ya no se cancelan al minuto',
    summary: 'Ranked respeta los dos minutos para reconectar. También arreglos de objetivos en Horde Siege.',
    sections: [
      { heading: 'Ranked', bullets: [
        'Las partidas ya no se cancelan al minuto si alguien se desconecta: ahora esperan los dos minutos previstos.',
        'La bomba de Demolición ya no queda fuera de alcance en más puntos del mapa.',
      ] },
      { heading: 'Horde Siege', bullets: [
        'Una escuadra que cierra agujeros de emergencia ya no bloquea ese objetivo secundario para las demás.',
        'Arreglamos una desconexión de todo el grupo cuando un jugador no terminaba de cargar.',
      ] },
      { heading: 'General', bullets: ['Arreglo para el error de inicio de sesión con la fecha del sistema mal configurada.'] },
    ],
    knownIssues: ['Seguimos investigando el ping alto en algunas regiones.'],
  },
  {
    id: 'n_community_1024', tag: 'community', publishedAt: '2026-10-24T15:00:00.000Z', readMinutes: 2,
    title: 'Escuadras de la semana: 30 oleadas en locura',
    summary: 'Tres escuadras de Latinoamérica completaron Bastión en locura. Así se repartieron las clases.',
    sections: [
      { paragraphs: ['Cada semana destacamos a escuadras de la comunidad. Esta vez, tres grupos que completaron las 30 oleadas en la dificultad más alta.'] },
      { heading: 'Lo que tenían en común', bullets: [
        'Las cuatro clases en cada escuadra: Asalto, Irruptor, Tirador y Médico.',
        'Un Médico pendiente de levantar a quien cayera lejos de la munición.',
        'Se coordinaron antes de entrar, porque la clase se fija al buscar partida.',
      ] },
    ],
    cta: { label: 'Arma tu escuadra', link: '/comunidad' },
  },
  {
    id: 'n_patch_1029', tag: 'patch', publishedAt: '2026-10-29T17:00:00.000Z', readMinutes: 2,
    title: 'Actualización 3: cambia de clase antes de que empiece la partida',
    summary: 'Ahora puedes cambiar de clase en la sala de espera de Horde Siege, ya que ves a tu equipo.',
    sections: [
      { paragraphs: ['Fue lo que más nos pidieron: elegir clase sin saber qué llevaba el resto del equipo.'] },
      { heading: 'Qué cambia', bullets: [
        'En la sala de espera de Horde Siege puedes cambiar de clase hasta que empiece la partida.',
        'Reabastecer munición cuesta menos energía.',
      ] },
    ],
    knownIssues: ['Algunos jugadores no ven su nivel de clase actualizado hasta reiniciar.'],
  },
  {
    id: 'n_20years', tag: 'event', featured: true, publishedAt: '2026-11-03T15:00:00.000Z', readMinutes: 2,
    title: '20 Years of Gears: dos semanas de recompensas',
    summary: 'Celebramos dos décadas de la saga con un evento en Versus y Horde Siege. Termina el 17 de noviembre.',
    sections: [
      { paragraphs: ['Del 3 al 17 de noviembre. El evento trae un modo de Versus, una misión de Horde Siege y recompensas de aniversario.'] },
      { heading: 'No te lo pierdas', bullets: ['El 7 de noviembre hay un regalo de aniversario para todos los jugadores.'] },
    ],
    cta: { label: 'Ver tu semana', link: '/' },
  },
  {
    id: 'n_gift', tag: 'season', publishedAt: GIFT_AT, readMinutes: 1,
    title: 'Tu regalo de aniversario ya está disponible',
    summary: 'Entra al juego para recibirlo. Es nuestra forma de celebrar 20 años contigo.',
    sections: [{ paragraphs: ['Desde hoy, todos los jugadores reciben un regalo de aniversario al entrar al juego.'] }],
  },
];
