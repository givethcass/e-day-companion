// How a match reads in the history list, the report and Tu semana.
import type { MatchSummary } from '@eday/api-types';
import { modeLabel } from './demo';

const RESULT: Record<MatchSummary['result'], string> = { win: 'Victoria', loss: 'Derrota', draw: 'Empate', completed: 'Completada', failed: 'Fallida' };

/** "Conquista · Refinería"; campaign maps already say "Campaña · Capítulo 3". */
export const matchTitle = (m: MatchSummary) => (m.mode === 'campaign' ? m.map : `${modeLabel(m.mode)} · ${m.map}`);

/** "Victoria", or "Oleada 17/30" for Horde, where the wave reached is the result that matters. */
export const outcome = (m: MatchSummary) =>
  m.mode === 'horde_siege' && m.wavesCleared != null ? `Oleada ${m.wavesCleared}/${m.waveGoal}` : RESULT[m.result];

export const isWin = (m: MatchSummary) => m.result === 'win' || m.result === 'completed';

/** "35:44" */
export const duration = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
