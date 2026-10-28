// The demo runs on a fixed clock so the story (15 days away, Horde tonight, Friday session) always holds.
export const DEMO_NOW = '2026-10-27T18:00:00.000Z';

const MODES: Record<string, string> = {
  versus_tdm: 'Duelo por equipos', versus_conquest: 'Conquista', versus_ranked: 'Ranked', horde_siege: 'Horde Siege', campaign: 'Campaña', store: 'la tienda',
};
export const modeLabel = (m: string) => MODES[m] ?? m;

const ROLES: Record<string, string> = { assault: 'Asalto', breacher: 'Irruptor', marksman: 'Tirador', medic: 'Médico' };
export const roleLabel = (r?: string) => (r ? ROLES[r] ?? r : '');

const DIFFICULTY: Record<string, string> = { casual: 'casual', normal: 'normal', hard: 'alta', insane: 'locura' };
export const difficultyLabel = (d?: string) => (d ? DIFFICULTY[d] ?? d : '');

export const number = (n: number) => n.toLocaleString('en-US');
