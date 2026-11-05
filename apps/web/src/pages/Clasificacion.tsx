// Leaderboards on desktop: Horde by best wave, Ranked by rank points, among friends, the clan, the country or everyone.
// The bars share one baseline so the gap to the player above reads at a glance.
import type { LeaderboardScope } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { num } from '../lib/format';
import { Chip } from '../ui/bits';
import { useSeen } from '../ui/fx';

const MODES = [['Horde Siege', 'horde_siege'], ['Ranked', 'versus_ranked']] as const;
const SCOPES: [string, LeaderboardScope][] = [['Amigos', 'friends'], ['Clan', 'clan'], ['País', 'country'], ['Global', 'global']];

export function Clasificacion() {
  const [mode, setMode] = useState(0);
  const [scope, setScope] = useState(0);
  const me = useData(() => api.me());
  const board = useData(() => api.leaderboard(MODES[mode][1], SCOPES[scope][1], 20), [mode, scope]);
  const horde = MODES[mode][1] === 'horde_siege';
  const unit = (n: number) => (horde ? `Oleada ${n}` : `${num(n)} pts`);
  const top = Math.max(1, ...board.entries.map((e) => e.points));
  const mine = board.me;
  const above = mine ? board.entries.find((e) => e.position === mine.position - 1) : undefined;
  const [ref, seen] = useSeen<HTMLOListElement>();

  return (
    <div className="grid grid-cols-[380px_1fr] gap-10 items-start">
      <aside className="sticky top-24 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="eyebrow text-subtle">Modo</div>
          <div className="flex gap-2">{MODES.map(([label], i) => <Chip key={label} active={i === mode} onClick={() => setMode(i)}>{label}</Chip>)}</div>
          <div className="eyebrow text-subtle mt-3">Entre</div>
          <div className="flex flex-wrap gap-2">{SCOPES.map(([label], i) => <Chip key={label} active={i === scope} onClick={() => setScope(i)}>{label}</Chip>)}</div>
        </div>
        <div key={`${mode}-${scope}`} className="band grain relative overflow-hidden p-8 animate-rise">
          <div className="eyebrow text-white/70">Tu posición · {SCOPES[scope][0]}</div>
          {mine ? (
            <>
              <div className="display text-8xl mt-2">#{mine.position}</div>
              <div className="display text-2xl text-white/80">{unit(mine.points)}</div>
              <p className="text-white/75 mt-4 text-sm">
                {mine.position === 1 ? 'Vas primero. Nadie te lleva ventaja aquí.'
                  : !above ? ''
                  : above.points === mine.points ? `Empatas con ${above.gamertag} en ${unit(mine.points).toLowerCase()}; el empate se ordena por nombre.`
                  : `${above.gamertag} te lleva ${horde ? `${above.points - mine.points} ${above.points - mine.points === 1 ? 'oleada' : 'oleadas'}` : `${num(above.points - mine.points)} puntos`}.`}
              </p>
            </>
          ) : <p className="text-white/80 mt-3">Aún no apareces aquí. Juega 3 partidas de Ranked para tener rango.</p>}
        </div>
        <p className="text-sm text-subtle">{horde ? 'Horde se ordena por la mejor oleada de la temporada.' : 'Ranked se ordena por puntos de rango.'} E-Day aún no tiene clasificaciones: la app las ofrecería primero.</p>
      </aside>
      <ol ref={ref} key={`${mode}-${scope}`} className="border-t border-line">
        {board.entries.map((e, i) => {
          const isMe = e.gamertag === me.gamertag;
          return (
            <li key={e.gamertag} className={`group grid grid-cols-[56px_1fr_120px] items-center gap-5 px-5 py-3.5 border-b border-line animate-rise ${isMe ? 'bg-band/40' : 'hover:bg-surface'}`} style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
              <span className={`display text-3xl ${isMe || e.position <= 3 ? 'text-primary' : 'text-subtle'}`}>{e.position}</span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`font-semibold truncate ${isMe ? 'text-primary' : ''}`}>{e.gamertag}{isMe ? ' (tú)' : ''}</span>
                  <span className="text-sm text-subtle">{[e.country, e.clanTag && `[${e.clanTag}]`].filter(Boolean).join(' · ')}</span>
                </div>
                <div className="h-1.5 bg-white/8 mt-2">
                  <div className="h-full origin-left transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:brightness-125"
                    style={{ width: `${(e.points / top) * 100}%`, transform: `scaleX(${seen ? 1 : 0})`, transitionDelay: `${Math.min(i, 12) * 40}ms`, background: isMe ? 'var(--color-primary)' : '#7A2A24' }} />
                </div>
              </div>
              <span className="tabular-nums text-right font-semibold">{unit(e.points)}</span>
            </li>
          );
        })}
        {board.entries.length === 0 && <li className="py-10 text-muted">Nadie tiene marca aquí todavía.</li>}
      </ol>
    </div>
  );
}
