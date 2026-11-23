// The campaign for the demo: twelve chapters in three acts, three collectibles in each. Chapter names, places and
// collectibles are invented for the portfolio and match the collectible guides (g_collect_1, g_collect_2). `hard`
// marks the collectible most players miss, which the backend finds less often.
const c = (kind, name, where, hard = false) => ({ kind, name, where, ...(hard ? { hard } : {}) });

export const CAMPAIGN_ACTS = ['Acto I · Emergencia', 'Acto II · La ciudad cae', 'Acto III · Kalona resiste'];

export const CAMPAIGN = [
  { n: 1, act: 0, name: 'El primer temblor', setting: 'Refugio del distrito norte', minutes: 34,
    summary: 'La tierra se abre bajo Kalona. Sacas a los civiles del refugio antes de que la calle se hunda.',
    collectibles: [c('tag', 'Placa COG', 'Detrás del camión volcado, al salir del refugio.'), c('diary', 'Diario del cabo Ruiz', 'En la mesa del puesto de control.'), c('poster', 'Cartel de reclutamiento', 'En el muro del patio.')] },
  { n: 2, act: 0, name: 'Bajo la ciudad', setting: 'Metro de la línea 3', minutes: 41,
    summary: 'El metro es la única salida. Algo sube por los túneles al mismo tiempo que tú bajas.',
    collectibles: [c('tag', 'Placa COG', 'Bajo la escalera del metro.'), c('radio', 'Radio de la estación', 'En la taquilla cerrada: dispara el candado.'), c('diary', 'Diario del maquinista', 'Junto al cuerpo en la vía.')] },
  { n: 3, act: 0, name: 'Puesto de mando', setting: 'Cuartel de la plaza mayor', minutes: 38,
    summary: 'El mando de la COG ha perdido contacto. Recuperas el cuartel planta por planta.',
    collectibles: [c('poster', 'Mapa de evacuación', 'En la sala de reuniones, detrás de la pizarra.'), c('tag', 'Placa COG', 'En la azotea, junto a la antena.'), c('diary', 'Órdenes del capitán', 'En el escritorio del despacho cerrado.', true)] },
  { n: 4, act: 0, name: 'Última línea', setting: 'Avenida del puerto', minutes: 45,
    summary: 'Primera defensa de verdad: aguantas la avenida mientras sale el último convoy.',
    collectibles: [c('radio', 'Radio del convoy', 'En la cabina del segundo camión.'), c('tag', 'Placa COG', 'Bajo los sacos terreros de la segunda barricada.'), c('poster', 'Cartel de la feria', 'En la fachada del cine.')] },
  { n: 5, act: 1, name: 'Ceniza', setting: 'Barrio industrial', minutes: 39,
    summary: 'Las fábricas arden. Buscas a la escuadra que dejó de responder en la refinería.',
    collectibles: [c('diary', 'Diario de la soldado Vega', 'En la oficina del capataz.'), c('tag', 'Placa COG', 'Junto a la grúa caída.'), c('radio', 'Grabación de la refinería', 'Sobre la tubería, sube por la escalera rota.', true)] },
  { n: 6, act: 1, name: 'El puente', setting: 'Puente del río Seco', minutes: 47,
    summary: 'Cruzar el puente o volarlo. La mitad de la ciudad depende de lo que decidas en el centro.',
    collectibles: [c('tag', 'Placa COG', 'En la caseta del peaje.'), c('poster', 'Señal del puente', 'Colgando del lado norte, solo se ve al asomarte.'), c('diary', 'Diario del ingeniero', 'Bajo el puente, junto a las cargas.')] },
  { n: 7, act: 1, name: 'Silencio en la radio', setting: 'Torre de comunicaciones', minutes: 36,
    summary: 'Subes a la torre para pedir ayuda. Nadie contesta, y empiezas a entender por qué.',
    collectibles: [c('radio', 'Mensaje sin enviar', 'En la consola del piso 3.'), c('tag', 'Placa COG', 'En el ascensor de servicio.'), c('diary', 'Diario de la operadora', 'En la taquilla del vestuario.')] },
  { n: 8, act: 1, name: 'Mercado negro', setting: 'Mercado de la Fuente', minutes: 42,
    summary: 'Los civiles que se quedaron han montado su propio orden. Necesitas su ayuda y no te la van a regalar.',
    collectibles: [c('poster', 'Lista de precios', 'En la carnicería, detrás del mostrador.'), c('diary', 'Libro de cuentas', 'En el sótano de la fuente.', true), c('tag', 'Placa COG', 'En el callejón del sur.')] },
  { n: 9, act: 2, name: 'Contraataque', setting: 'Distrito sur', minutes: 44,
    summary: 'Por primera vez la COG avanza. Recuperas las calles del sur con todo lo que queda.',
    collectibles: [c('tag', 'Placa COG', 'Dentro del tanque abandonado.'), c('radio', 'Parte de guerra', 'En el puesto médico.'), c('poster', 'Cartel de «Kalona resiste»', 'En la esquina de la panadería.')] },
  { n: 10, act: 2, name: 'Estación Central', setting: 'Estación Central', minutes: 40,
    summary: 'El último tren sale con los heridos. Defiendes el vestíbulo hasta que cierre las puertas.',
    collectibles: [c('diary', 'Diario del jefe de estación', 'En la oficina de horarios.'), c('tag', 'Placa COG', 'En el andén 4.'), c('radio', 'Aviso por megafonía', 'En la cabina del vestíbulo.')] },
  { n: 11, act: 2, name: 'Cuarto de máquinas', setting: 'Presa de Kalona', minutes: 52,
    summary: 'Si la presa cae, cae la ciudad. Bajas hasta las turbinas mientras arriba se pelea por cada metro.',
    collectibles: [c('tag', 'Placa COG', 'En la pasarela de las turbinas.'), c('radio', 'Grabación de seguridad', 'En la sala de control.'), c('diary', 'Diario del técnico', 'En la repisa alta del cuarto de máquinas: vuelve antes de subir al ascensor final y trepa por las cajas.', true)] },
  { n: 12, act: 2, name: 'Kalona sigue en pie', setting: 'Plaza mayor', minutes: 58,
    summary: 'La última batalla vuelve donde empezó todo. Al amanecer, sigue habiendo una ciudad que defender.',
    collectibles: [c('poster', 'Bandera de la plaza', 'En el mástil, tras la batalla.'), c('tag', 'Placa COG del sargento', 'Junto a la fuente rota.'), c('diary', 'Última entrada', 'En el refugio del primer capítulo, ahora abierto.')] },
];
