// Sponsored and collaboration slots for the demo. Partners are invented brands, nothing is sold and no ad
// network is involved: these cards only show where an official app could place partner content.
export const PROMOS = [
  { id: 'pr_ferro', placement: 'home', kind: 'sponsored', partner: 'Ferro Audio',
    title: 'Escucha a los Tickers antes de verlos', body: 'Audífonos con sonido espacial afinado para Horde Siege. 15% para miembros del clan.',
    cta: { label: 'Ver oferta' }, glow: '#7AA0BE' },
  { id: 'pr_nodo', placement: 'news', kind: 'sponsored', partner: 'Nodo Fibra',
    title: 'Menos ping en Ranked', body: 'Internet de fibra con ruta directa a los servidores de Norteamérica.',
    cta: { label: 'Conocer planes' }, glow: '#3FA7A0' },
  { id: 'pr_brasa', placement: 'guides', kind: 'collab', partner: 'Brasa Energy',
    title: 'Guías de Horde presentadas por Brasa Energy', body: 'Cada semana, una ruta nueva de LaCobertura para llegar a la oleada 30.',
    cta: { label: 'Ver la ruta', link: '/guias/g_build_wave30' }, glow: '#E5730F' },
  { id: 'pr_kalibre', placement: 'community', kind: 'collab', partner: 'Kalibre Controllers',
    title: 'Torneo de escuadras de noviembre', body: 'Tres escuadras de cuatro, Horde en Locura. La mejor oleada gana controles edición COG.',
    cta: { label: 'Inscribir a mi escuadra' }, glow: '#E50F11' },
];
