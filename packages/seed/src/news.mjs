// Official-style news for the demo, written for this concept in our own words. Patch and event stories follow
// what The Coalition actually shipped up to Nov 3, 2026 (Season 1 schedule, patches of Oct 5, 14, 22 and 26 and
// Nov 2, the 20th anniversary update); the community spotlight, the coins explainer and the gift story are
// illustrative. Map names are the demo's own placeholders.
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
    title: 'Actualización del 14 de octubre: rangos, Diario de guerra y arreglos en todos los modos',
    summary: 'Corrige las divisiones mal asignadas al terminar la clasificación de Ranked y el registro de logros y coleccionables.',
    sections: [
      { paragraphs: ['Es la primera actualización grande desde el lanzamiento y toca Campaña, Horde Siege y Versus.'] },
      { heading: 'Ranked', bullets: ['Arreglamos un error que colocaba a algunos jugadores en una división equivocada al terminar sus partidas de clasificación.'] },
      { heading: 'Campaña', bullets: [
        'El Diario de guerra y los logros vuelven a registrar bien los coleccionables.',
        'Nueva opción para apagar el sonido que avisa cuando recoges un coleccionable.',
      ] },
      { heading: 'Horde Siege y Versus', bullets: [
        'Ajustes a varias armas, entre ellas Hammerburst, Snub, Gut-Puncher, Torque Bow, cuerpo a cuerpo y torretas.',
        'Cambios en las dificultades más altas de Horde Siege.',
      ] },
      { heading: 'Estabilidad', bullets: ['Mejoras de memoria y del sistema antitrampas.'] },
    ],
    knownIssues: ['Algunos logros de campaña ganados antes de esta actualización todavía no aparecen.'],
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
    title: 'Hotfix del 22 de octubre: Ranked espera dos minutos a quien se desconecta',
    summary: 'Llega junto con Halloween: menos cierres, arreglos en Campaña y Horde Siege, y Ranked da más tiempo para reconectar.',
    sections: [
      { heading: 'Ranked', bullets: ['Si alguien se desconecta, la partida ahora espera dos minutos en lugar de uno antes de cancelarse.'] },
      { heading: 'Horde Siege', bullets: [
        'Arreglos al objetivo secundario de los agujeros de emergencia.',
        'Menos desconexiones de toda la escuadra.',
      ] },
      { heading: 'General', bullets: [
        'Menos cierres inesperados.',
        'Ya no se queda el personaje en pose T al apuntar después de disparar la Gnasher a ciegas.',
        'Xbox Cloud Gaming usa por defecto el modo de gráficos Rendimiento.',
        'Arreglos en varios capítulos de la campaña.',
      ] },
      { paragraphs: ['También tomamos medidas contra quienes usan exploits y aimbots.'] },
    ],
    knownIssues: ['Algunos jugadores tienen congelamientos y cierres en sesiones largas. Seguimos trabajando en ello.'],
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
    id: 'n_patch_1026', tag: 'patch', publishedAt: '2026-10-26T17:00:00.000Z', readMinutes: 1,
    title: 'Hotfix del 26 de octubre: se acabó el exploit de las granadas de humo',
    summary: 'En Versus ya no se puede anular el efecto de las granadas de humo. También arreglamos cierres al moverse.',
    sections: [
      { heading: 'Qué cambia', bullets: [
        'Cerramos un exploit de Versus que permitía desactivar el efecto de las granadas de humo.',
        'Arreglamos varios cierres relacionados con el movimiento.',
        'Mejoras de estabilidad y rendimiento.',
      ] },
    ],
  },
  {
    id: 'n_patch_1102', tag: 'patch', publishedAt: '2026-11-02T17:00:00.000Z', readMinutes: 3,
    title: 'Actualización del 2 de noviembre: contenido de aniversario y logros recuperados',
    summary: 'Prepara el evento del 20 aniversario y devuelve las entradas del Diario de guerra y los logros que faltaban.',
    sections: [
      { paragraphs: ['Publicamos esta actualización un día antes de que empiece el evento del 20 aniversario.'] },
      { heading: 'Diario de guerra y logros', bullets: [
        'Las entradas del Diario de guerra y los logros que no se registraron, como "This is my Rifle", se otorgan solos la próxima vez que entres.',
        'Arreglamos errores de la campaña que impedían avanzar.',
      ] },
      { heading: 'General', bullets: [
        'Los personajes ya no aparecen a veces como esqueletos.',
        'Más mejoras de estabilidad en PC, Xbox y consolas portátiles.',
        'Ajustes a enemigos de Horde Siege.',
      ] },
      { heading: 'Lo que sigue', paragraphs: ['Esta semana publicaremos los cambios de ajuste de armas para multijugador.'] },
    ],
    knownIssues: ['En PC se necesita una versión más reciente del controlador de NVIDIA.'],
  },
  {
    id: 'n_20years', tag: 'event', featured: true, publishedAt: '2026-11-03T15:00:00.000Z', readMinutes: 3,
    title: '20 aniversario: vuelve Guardián y llega la misión Por la Reina',
    summary: 'Celebramos 20 años de Gears con el clásico modo Guardián en Versus, una misión de Horde Siege sin suministros y retos de aniversario.',
    sections: [
      { paragraphs: ['El evento empieza hoy y dura dos semanas. El 7 de noviembre, el día exacto del aniversario, hay un regalo para todos.'] },
      { heading: 'Guardián (Versus)', paragraphs: [
        'Cada equipo tiene un Líder. Mientras tu Líder siga vivo, tu equipo reaparece. Si cae, ya no hay reapariciones. Si se acaba el tiempo, se revela dónde están los dos Líderes.',
      ] },
      { heading: 'Por la Reina (Horde Siege)', paragraphs: [
        'Una misión por tiempo limitado sin cajas de suministros en el mapa: solo tienes tu equipo inicial y lo que recojas de los enemigos.',
      ] },
      { heading: 'Retos de aniversario', bullets: [
        'Haz 20 ejecuciones con pisotón.',
        'Gana 5 partidas de Guardián.',
        'Completa Por la Reina en dificultad Comandante o superior.',
        'Despliega 25 piezas de equipo en Horde Siege, sin contar granadas.',
        'Consigue 100 bajas con armas clásicas de Gears en Versus o Horde Siege.',
      ] },
      { heading: 'Recompensas', bullets: [
        'Aspecto de arma del 20 aniversario, poses, aspectos y más por completar retos.',
        'La pose "Brothers to the End" es gratis en la tienda.',
      ] },
    ],
    cta: { label: 'Buscar escuadra', link: '/comunidad' },
  },
  {
    id: 'n_gift', tag: 'season', publishedAt: GIFT_AT, readMinutes: 1,
    title: 'Feliz 20 aniversario: tu regalo ya está disponible',
    summary: 'Hace 20 años salió el primer Gears of War. Entra al juego para recibir tu regalo.',
    sections: [{ paragraphs: [
      'Hoy se cumplen 20 años del primer Gears of War. Todos los jugadores reciben un regalo al entrar al juego.',
      'Es también un adelanto de la Temporada 2, Legacy, que empieza después del 1 de diciembre.',
    ] }],
  },
];
