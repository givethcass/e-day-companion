// One match on desktop: the result in big type, the figures, the waves for Horde, both scoreboards side by side,
// and the one lesson that links to what helps next time. Arrows step through the neighbouring matches.
import type { MatchReport } from '@eday/api-types';
import { useEffect } from 'react';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { clock, day, matchTitle, minutes, MODE, num, outcome, ROLE } from '../lib/format';
import { Arrow } from '../ui/bits';
import { CountUp, Reveal, useSeen } from '../ui/fx';
import { HeroScene } from '../ui/HeroScene';
import { ROLE_COLOR } from '../ui/charts';

type Line = NonNullable<MatchReport['scoreboard']>[number];

const isWin = (m: MatchReport) => m.result === 'win' || m.result === 'completed';
function headline(m: MatchReport) {
  if (m.mode === 'horde_siege') return m.result === 'completed' ? `Sobreviviste las ${m.waveGoal} oleadas` : `Llegaste a la oleada ${m.wavesCleared} de ${m.waveGoal}`;
  if (m.mode === 'campaign') return m.result === 'completed' ? 'Capítulo completado' : 'Misión fallida';
  return outcome(m);
}

function Waves({ cleared, goal }: { cleared: number; goal: number }) {
  const [ref, on] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="flex gap-[3px]" role="img" aria-label={`${cleared} de ${goal} oleadas`}>
      {Array.from({ length: goal }, (_, i) => (
        <span key={i} title={`Oleada ${i + 1}`} className={`h-3 flex-1 transition-[background,transform] duration-300 hover:scale-y-150 ${on && i < cleared ? 'bg-primary' : 'bg-white/12'}`}
          style={{ transitionDelay: `${i * 35}ms` }} />
      ))}
    </div>
  );
}

function Board({ title, lines, horde, top }: { title: string; lines: Line[]; horde: boolean; top: number }) {
  return (
    <div className="border border-line bg-surface">
      <div className="eyebrow text-subtle px-6 pt-5 pb-3">{title}</div>
      <table className="w-full text-left">
        <thead className="eyebrow text-subtle text-[12px]">
          <tr className="border-t border-line">
            <th className="py-2.5 pl-6 w-12 font-semibold">#</th><th className="font-semibold">Jugador</th>
            <th className="font-semibold w-[38%]">Puntos</th><th className="font-semibold text-right w-16">Bajas</th><th className="font-semibold text-right pr-6 w-20">Caídas</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={l.gamertag} className={`border-t border-line transition-colors ${l.isMe ? 'bg-band/40' : 'hover:bg-raised'}`}>
              <td className={`py-3 pl-6 display text-xl ${l.isMe ? 'text-primary' : 'text-subtle'}`}>{i + 1}</td>
              <td>
                <div className={`font-semibold ${l.isMe ? 'text-primary' : ''}`}>{l.gamertag}{l.isMe ? ' (tú)' : ''}</div>
                {horde && l.role && <div className="text-xs text-subtle flex items-center gap-1.5 mt-0.5"><span className="size-2" style={{ background: ROLE_COLOR[l.role] }} />{ROLE[l.role]}</div>}
              </td>
              <td className="pr-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/8"><div className="h-full bg-primary/80" style={{ width: `${(l.score / Math.max(1, top)) * 100}%` }} /></div>
                  <span className="tabular-nums font-semibold w-14 text-right">{num(l.score)}</span>
                </div>
              </td>
              <td className="tabular-nums text-right">{l.kills ?? '–'}</td>
              <td className="tabular-nums text-right pr-6 text-subtle">{l.deaths ?? '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Partida({ id }: { id: string }) {
  const list = useData((n) => api.matches(n, 30).items);
  const m = useData((n) => { try { return api.match(id, n); } catch { return null; } }, [id]);
  const at = list.findIndex((x) => x.id === id);
  const newer = at > 0 ? list[at - 1] : null, older = at >= 0 && at < list.length - 1 ? list[at + 1] : null;
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && older) location.hash = `/servicio/partidas/${older.id}`;
      if (e.key === 'ArrowRight' && newer) location.hash = `/servicio/partidas/${newer.id}`;
    };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  }, [older, newer]);
  if (!m) return <div className="max-w-[1440px] mx-auto px-10 py-24 text-muted">Esta partida ya no está en tu historial. <a href="#/servicio" className="text-primary hover:underline">Volver a Mi servicio</a></div>;

  const horde = m.mode === 'horde_siege';
  const board = m.scoreboard ?? [];
  const top = Math.max(1, ...board.map((l) => l.score));
  const win = isWin(m) && !horde;
  return (
    <>
      <section className="relative -mt-[72px] pt-[72px] band grain overflow-hidden">
        <HeroScene variant="embers" tint={win ? undefined : '#7AA0BE'} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        <div className="relative max-w-[1440px] mx-auto px-10 pt-12 pb-14">
          <div className="flex items-center justify-between">
            <a href="#/servicio" className="group eyebrow text-[13px] text-white/70 hover:text-ink inline-flex items-center gap-2"><Arrow className="rotate-180 transition-transform group-hover:-translate-x-1" />Mi servicio</a>
            <div className="flex gap-2">
              {[[older, 'Anterior', 'rotate-180'], [newer, 'Siguiente', '']].map(([x, label, rot]) => {
                const target = x as typeof older;
                return target
                  ? <a key={label as string} href={`#/servicio/partidas/${target.id}`} title={matchTitle(target)} className="group eyebrow text-[13px] border border-white/30 px-4 py-2 hover:bg-white hover:text-black transition-colors inline-flex items-center gap-2">{label === 'Anterior' && <Arrow className={`${rot} transition-transform group-hover:-translate-x-0.5`} />}{label as string}{label === 'Siguiente' && <Arrow className="transition-transform group-hover:translate-x-0.5" />}</a>
                  : <span key={label as string} className="eyebrow text-[13px] border border-white/10 text-white/30 px-4 py-2">{label as string}</span>;
              })}
            </div>
          </div>
          <div className="eyebrow text-white/70 mt-10 flex items-center gap-3 animate-rise"><span className="h-px w-10 bg-primary" />{m.mode === 'campaign' ? m.map : `${MODE[m.mode]} · ${m.map}`}</div>
          <h1 className={`display text-[clamp(48px,6vw,96px)] mt-3 animate-rise [animation-delay:80ms] ${win ? 'text-primary' : ''}`}>
            {headline(m)}{m.rankDelta ? <span className="text-white/60"> {m.rankDelta > 0 ? '+' : ''}{m.rankDelta} pts</span> : null}
          </h1>
          <p className="mt-4 text-white/75 animate-rise [animation-delay:160ms]">{day(m.endedAt)} · {clock(m.endedAt)} · {minutes(m.durationSeconds)}</p>
          {horde && m.wavesCleared != null && m.waveGoal ? <div className="mt-8 max-w-[760px] animate-rise [animation-delay:200ms]"><Waves cleared={m.wavesCleared} goal={m.waveGoal} /></div> : null}
        </div>
      </section>
      <div className="max-w-[1440px] mx-auto px-10 pt-12 flex flex-col gap-12">
        <Reveal>
          <div className="grid grid-cols-4 border border-line">
            {[['Bajas', m.kills ?? 0, 0, ''], ['Caídas', m.deaths ?? 0, 0, ''], ['Precisión', Math.round((m.accuracy ?? 0) * 100), 0, '%'], ['Duración', Math.round((m.durationSeconds ?? 0) / 60), 0, ' min']].map(([label, value, d, suffix], i) => (
              <div key={label as string} className="px-7 py-6 border-r border-line last:border-r-0">
                <div className="eyebrow text-subtle">{label}</div>
                <div className={`display text-5xl mt-1 ${i === 0 ? 'text-primary' : ''}`}><CountUp value={value as number} decimals={d as number} suffix={suffix as string} /></div>
              </div>
            ))}
          </div>
        </Reveal>
        {m.medals && m.medals.length > 0 && (
          <Reveal className="flex flex-wrap items-center gap-3">
            <span className="eyebrow text-subtle mr-2">Medallas de la partida</span>
            {m.medals.map((x, i) => <span key={x} className="eyebrow text-[13px] text-primary border border-primary px-3 py-1.5 animate-rise hover:bg-action hover:text-ink transition-colors" style={{ animationDelay: `${i * 60}ms` }}>{x}</span>)}
          </Reveal>
        )}
        {m.takeaway && (
          <Reveal>
            <a href={m.takeaway.link ? `#${m.takeaway.link === '/' ? '/inicio' : m.takeaway.link}` : undefined}
              className="group flex items-center gap-8 border border-line border-l-4 border-l-primary bg-surface p-8 hover:bg-raised transition-colors">
              <div className="flex-1">
                <div className="eyebrow text-primary">Lección</div>
                <p className="text-xl mt-2 leading-snug">{m.takeaway.text}</p>
              </div>
              {m.takeaway.link && <Arrow className="size-6 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-ink" />}
            </a>
          </Reveal>
        )}
        {horde && <Reveal><Board title="Tu escuadra" lines={board} horde top={top} /></Reveal>}
        {m.mode.startsWith('versus') && (
          <div className="grid grid-cols-2 gap-6">
            <Reveal><Board title="Tu equipo · COG" lines={board.filter((l) => l.team === 'COG')} horde={false} top={top} /></Reveal>
            <Reveal delay={100}><Board title="Rivales" lines={board.filter((l) => l.team !== 'COG')} horde={false} top={top} /></Reveal>
          </div>
        )}
        <p className="text-sm text-subtle">Usa ← y → para pasar entre partidas.</p>
      </div>
    </>
  );
}
