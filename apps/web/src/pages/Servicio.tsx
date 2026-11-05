// Mi servicio on desktop: a dashboard of the whole career, the 74 medal series with equip, and achievements.
import type { Medal } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { useApp, useData } from '../lib/app';
import { day, dayTime, MEDAL_GROUP, MODE, matchTitle, num, outcome, pct, plural, rankLabel, ROLE, TIER } from '../lib/format';
import { Arrow, earned, MedalBadge, nextTier, SectionHead, TierPips, topTier } from '../ui/bits';
import { Bar, CountUp, Reveal, spotlight, useSeen, useToast } from '../ui/fx';
import { HeroScene } from '../ui/HeroScene';
import { Clasificacion } from './Clasificacion';
import { ChartCard, Columns, Donut, MODE_COLOR, OTHER, RankBars, ROLE_COLOR, SERIES, SplitBar } from '../ui/charts';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const WEEK_NAME = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SUBS = [['', 'Resumen'], ['medallas', 'Medallas'], ['logros', 'Logros'], ['clasificacion', 'Clasificaciones']] as const;

export function Servicio({ sub = '' }: { sub?: string }) {
  const [version, setVersion] = useState(0);
  const record = useData((n) => api.record(n), [version]);
  const me = useData(() => api.me());
  return (
    <>
      <section className="relative -mt-[72px] pt-[72px] band grain overflow-hidden">
        <HeroScene variant="embers" />
        <div className="relative max-w-[1440px] mx-auto px-10 pt-14 pb-0 flex items-end gap-10">
          <div className="relative size-40 shrink-0 grid place-items-center animate-rise">
            <div className="absolute inset-0 rotate-45 border-2 border-primary animate-[spin_24s_linear_infinite]" />
            <div className="absolute inset-4 rotate-45 bg-black/70 border border-white/15" />
            <span className="relative display text-6xl">{record.level}</span>
          </div>
          <div className="pb-2 flex-1">
            <div className="eyebrow text-white/70 animate-rise">{record.title} · Clan NRT · {me.country}</div>
            <h1 className="display text-[clamp(56px,6.5vw,104px)] animate-rise [animation-delay:80ms]">{record.gamertag}</h1>
            <div className="mt-3 flex items-center gap-6 text-white/80 animate-rise [animation-delay:160ms]">
              <span>Ranked <b className="text-ink">{rankLabel(record.versus.rank)}</b> · {num(record.versus.rank?.points ?? 0)} pts</span>
              {record.career.firstMatchAt && <span>Desde {day(record.career.firstMatchAt)}</span>}
              <span>Hora favorita {record.career.favoriteHour}, los {record.career.favoriteWeekday}</span>
            </div>
          </div>
          <div className="pb-4 flex gap-3 animate-rise [animation-delay:240ms]" aria-label="Medallas en tu tarjeta">
            {record.equipped.map((m) => (
              <div key={m.medalId} className="group w-28 bg-black/60 border border-white/10 p-3 flex flex-col items-center text-center gap-2 hover:border-white/40 transition-colors">
                <MedalBadge tier={m.tier} size={48} className="transition-transform duration-500 group-hover:rotate-[360deg]" />
                <span className="text-xs leading-tight">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
        <nav className="relative max-w-[1440px] mx-auto px-10 mt-10 flex gap-1 border-b border-white/10" aria-label="Mi servicio">
          {SUBS.map(([k, label]) => (
            <a key={k} href={`#/servicio${k ? '/' + k : ''}`} aria-current={sub === k ? 'page' : undefined}
              className={`relative eyebrow text-[14px] px-5 py-4 transition-colors ${sub === k ? 'text-ink' : 'text-white/60 hover:text-ink'}`}>
              {label}<span className={`absolute left-0 right-0 bottom-0 h-[3px] bg-primary transition-transform origin-left duration-300 ${sub === k ? 'scale-x-100' : 'scale-x-0'}`} />
            </a>
          ))}
        </nav>
      </section>
      <div className="max-w-[1440px] mx-auto px-10 pt-14">
        {sub === 'medallas' ? <Medals onChange={() => setVersion((v) => v + 1)} version={version} />
          : sub === 'logros' ? <Achievements />
          : sub === 'clasificacion' ? <Clasificacion />
          : <Summary />}
      </div>
    </>
  );
}

function Ring({ value, size = 160, label, children }: { value: number; size?: number; label: string; children: React.ReactNode }) {
  const r = size / 2 - 8, c = 2 * Math.PI * r;
  const [ref, on] = useSeen<HTMLDivElement>();
  return (
    <div className="relative" style={{ width: size, height: size }} aria-label={label} ref={ref}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-primary)" strokeWidth={8} strokeDasharray={c}
          strokeDashoffset={on ? c * (1 - value) : c} style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

function Summary() {
  const r = useData((n) => api.record(n));
  const ach = useData((n) => api.achievements(n));
  const matches = useData((n) => api.matches(n, 12).items);
  const c = r.career, v = r.versus, h = r.horde;
  const b = r.breakdown;
  return (
    <div className="flex flex-col gap-20">
      <Reveal>
        <div className="grid grid-cols-7 border border-line">
          {[
            ['Partidas', <CountUp value={c.matches} />], ['Horas', <CountUp value={c.hoursPlayed} decimals={1} />], ['Días jugados', <CountUp value={c.daysPlayed} />],
            ['Mejor racha', <><CountUp value={c.bestDayStreak} /> días</>], ['Bajas', <CountUp value={c.kills} />], ['K/D Versus', <CountUp value={v.kd} decimals={2} />],
            ['Precisión', <CountUp value={c.accuracy * 100} suffix="%" />],
          ].map(([label, value], i) => (
            <div key={i} {...spotlight} className="spotlight p-6 border-r border-line last:border-r-0">
              <div className="eyebrow text-subtle">{label}</div>
              <div className={`display text-5xl mt-2 ${i === 5 ? 'text-primary' : ''}`}>{value}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <SectionHead over="Desglose" title="En qué se te va el tiempo" />
        <div className="grid grid-cols-3 gap-5">
          <ChartCard title="Tu tiempo por modo" note={`${c.hoursPlayed} horas en total`}>
            <Donut stack unit="horas" center={`${c.hoursPlayed} h`} format={(x) => `${x} h`}
              slices={[{ label: 'Versus', value: v.hoursPlayed }, { label: 'Horde', value: h.hoursPlayed }, { label: 'Campaña', value: r.campaign.hoursPlayed }]}
              colors={[MODE_COLOR.versus, MODE_COLOR.horde, MODE_COLOR.campaign]} />
          </ChartCard>
          <ChartCard title="Bajas por arma" note="Versus y Horde, con armas y granadas">
            <Donut stack unit="bajas" slices={b.killsByWeapon} />
          </ChartCard>
          <ChartCard title="Enemigos abatidos" note="Bajas en Horde por tipo de enemigo">
            <Donut stack unit="bajas" slices={b.killsByEnemy} />
          </ChartCard>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr] gap-5 mt-5">
          <ChartCard title="Bajas por modo" note={`${num(c.kills)} bajas y ${num(c.deaths)} caídas en total`}>
            <SplitBar parts={b.killsByMode} colors={[MODE_COLOR.versus, MODE_COLOR.horde, MODE_COLOR.campaign]} />
            <div className="mt-2 pt-5 border-t border-line">
              <div className="eyebrow text-muted mb-4">Bajas especiales</div>
              <RankBars items={b.killsByType.map((x) => ({ ...x, note: `${pct(x.value / Math.max(1, c.kills))} de tus bajas` }))} />
            </div>
          </ChartCard>
          <ChartCard title="Partidas por clase en Horde" note={`Tu clase principal es ${ROLE[h.mainRole ?? 'assault']}`}>
            <Donut unit="partidas" slices={r.classes.map((k) => ({ label: ROLE[k.role], value: k.matches }))} colors={r.classes.map((k) => ROLE_COLOR[k.role])} />
          </ChartCard>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-8">
        <Reveal>
          <div className="border border-line bg-surface p-8 h-full flex flex-col gap-8">
            <div className="flex items-baseline justify-between"><h2 className="display text-3xl">Versus</h2><span className="text-muted">{rankLabel(v.rank)} · K/D {v.kd.toFixed(2)}</span></div>
            <SplitBar parts={[{ label: 'Victorias', value: v.wins }, { label: 'Derrotas', value: v.losses }, { label: 'Empates', value: v.draws }]} colors={[SERIES[0], OTHER, SERIES[1]]} />
            <div className="grid grid-cols-3 gap-4">
              {[['Mejor racha', v.bestWinStreak], ['Más bajas', v.bestKills ?? 0], ['Precisión', Math.round(v.accuracy * 100)]].map(([l, x], i) => (
                <div key={l}><div className="text-sm text-subtle">{l}</div><div className="display text-3xl"><CountUp value={x as number} suffix={i === 2 ? '%' : ''} /></div></div>
              ))}
            </div>
            <div>
              <div className="eyebrow text-muted mb-4">Victorias por modo</div>
              <RankBars max={100} format={(x) => `${x}%`} items={v.byMode.map((m) => ({ label: MODE[m.mode], value: Math.round((m.wins / Math.max(1, m.matches)) * 100), note: `${m.wins} de ${m.matches}` }))} />
            </div>
            <div>
              <div className="eyebrow text-muted mb-4">Victorias por mapa</div>
              <RankBars max={100} format={(x) => `${x}%`} items={b.versusByMap.map((m) => ({ label: m.map, value: Math.round((m.wins / Math.max(1, m.matches)) * 100), note: `${m.wins} de ${m.matches}` }))} />
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="border border-line bg-surface p-8 h-full flex flex-col gap-8">
            <div className="flex items-baseline justify-between"><h2 className="display text-3xl">Horde Siege</h2><span className="text-muted">{h.matches} partidas · {h.hoursPlayed} h</span></div>
            <SplitBar parts={[{ label: 'Completas', value: h.completed }, { label: 'Sin terminar', value: h.matches - h.completed }]} colors={[SERIES[2], OTHER]} />
            <div className="grid grid-cols-3 gap-4">
              {[['Mejor oleada', h.bestWave], ['Oleadas', h.wavesCleared], ['Bajas', h.kills]].map(([l, x]) => (
                <div key={l}><div className="text-sm text-subtle">{l}</div><div className="display text-3xl"><CountUp value={x as number} /></div></div>
              ))}
            </div>
            <div>
              <div className="eyebrow text-muted mb-4">Mejor oleada por mapa · meta {h.waveGoal}</div>
              <RankBars max={h.waveGoal} fill={SERIES[2]} items={h.byMap.map((m) => ({ label: m.map, value: m.bestWave ?? 0, note: plural(m.matches, 'partida', 'partidas') }))} />
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <SectionHead over="Actividad" title="Cuándo juegas" />
        <div className="grid grid-cols-[1.6fr_1fr] gap-5">
          <ChartCard title="Por hora del día" note="Según la hora en que terminó cada partida">
            <Columns values={b.activityByHour} labels={HOURS} ticks={[0, 3, 6, 9, 12, 15, 18, 21]} name={(i) => `De ${HOURS[i]}:00 a ${HOURS[(i + 1) % 24]}:00`} />
          </ChartCard>
          <ChartCard title="Por día de la semana" note={c.favoriteWeekday ? `Juegas más los ${c.favoriteWeekday}` : undefined}>
            <Columns values={b.activityByWeekday} labels={WEEK} ticks={[0, 1, 2, 3, 4, 5, 6]} name={(i) => WEEK_NAME[i]} />
          </ChartCard>
        </div>
      </Reveal>

      <Reveal>
        <SectionHead over="Horde Siege" title="Niveles de clase" />
        <div className="grid grid-cols-4 gap-5">
          {r.classes.map((k, i) => {
            const nextXp = k.nextLevelXp ?? k.xp;
            const into = (k.xp - k.levelXp) / Math.max(1, nextXp - k.levelXp);
            return (
              <div key={k.role} {...spotlight} className="spotlight group border border-line p-6 hover:border-white/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="display text-2xl">{ROLE[k.role]}</span>
                  {k.role === h.mainRole && <span className="eyebrow text-[11px] text-primary">Principal</span>}
                </div>
                <div className="display text-7xl mt-4 transition-transform group-hover:scale-105 origin-left"><CountUp value={k.level} /><span className="text-2xl text-subtle"> / {k.maxLevel}</span></div>
                <Bar value={k.level >= k.maxLevel ? 1 : into} className="h-1.5 mt-4" delay={i * 120} />
                <div className="text-sm text-subtle mt-2">{k.level >= k.maxLevel ? 'Nivel máximo' : `${num(nextXp - k.xp)} XP para el ${k.level + 1}`} · {k.matches} partidas</div>
              </div>
            );
          })}
        </div>
      </Reveal>

      <div className="grid grid-cols-[1fr_1fr] gap-8">
        <Reveal>
          <a href="#/servicio/medallas" {...spotlight} className="spotlight group flex gap-8 items-center border border-line p-8 hover:border-white/30 transition-colors h-full">
            <Ring value={r.medals.earned / r.medals.total} label="Medallas">
              <div><div className="display text-4xl">{r.medals.earned}</div><div className="text-xs text-subtle">de {r.medals.total}</div></div>
            </Ring>
            <div className="flex-1">
              <div className="eyebrow text-primary">Medallas</div>
              <div className="display text-3xl mt-1">{r.medals.seriesCompleted} de {r.medals.seriesTotal} series completas</div>
              <div className="mt-4 flex gap-2">{r.medals.latest.map((m) => <span key={m.medalId + m.tier} title={`${m.name} · ${TIER[m.tier].label}`} className="transition-transform hover:-translate-y-1"><MedalBadge tier={m.tier} size={36} /></span>)}</div>
              <div className="text-sm text-subtle mt-2">Última: {r.medals.latest[0]?.name}, {r.medals.latest[0] && dayTime(r.medals.latest[0].unlockedAt)}</div>
            </div>
          </a>
        </Reveal>
        <Reveal delay={100}>
          <a href="#/servicio/logros" {...spotlight} className="spotlight group flex gap-8 items-center border border-line p-8 hover:border-white/30 transition-colors h-full">
            <Ring value={ach.gamerscore / ach.gamerscoreTotal} label="Gamerscore">
              <div><div className="display text-4xl">{num(ach.gamerscore)}</div><div className="text-xs text-subtle">de {num(ach.gamerscoreTotal)} G</div></div>
            </Ring>
            <div className="flex-1">
              <div className="eyebrow text-primary">Logros</div>
              <div className="display text-3xl mt-1">{ach.unlocked} de {ach.items.length} desbloqueados</div>
              <p className="text-muted mt-3">El más raro que tienes: <b className="text-ink">{[...ach.items].filter((a) => a.unlockedAt).sort((a, b) => a.rarity - b.rarity)[0]?.name}</b></p>
            </div>
          </a>
        </Reveal>
      </div>

      {r.trivia.length > 0 && (
        <Reveal>
          <SectionHead over="Datos curiosos" title="Curiosidades" />
          <div className="grid grid-cols-3 border-t border-l border-line">
            {r.trivia.map((t) => (
              <div key={t.id} className="group relative p-7 border-r border-b border-line overflow-hidden hover:bg-band/40 transition-colors">
                <div className="eyebrow text-subtle">{t.label}</div>
                <div className="display text-4xl mt-2 transition-transform duration-300 group-hover:-translate-y-1">{t.value}</div>
                <div className="text-muted mt-1">{t.detail}</div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal>
        <SectionHead over="Historial" title="Partidas recientes" />
        <table className="w-full text-left">
          <thead className="eyebrow text-subtle text-[12px]"><tr className="border-b border-line">{['Partida', 'Resultado', 'Bajas', 'Muertes', 'Duración', 'Cuándo'].map((h) => <th key={h} className="py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {matches.map((m) => {
              const res = outcome(m);
              return (
                <tr key={m.id} onClick={() => { location.hash = `/servicio/partidas/${m.id}`; }} className="group border-b border-line hover:bg-surface transition-colors cursor-pointer">
                  <td className="py-3.5 font-semibold"><a href={`#/servicio/partidas/${m.id}`} onClick={(e) => e.stopPropagation()} className="group-hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary">{matchTitle(m)}</a></td>
                  <td className={res === 'Victoria' ? 'text-primary' : res === 'Derrota' ? 'text-subtle' : ''}>{res}{m.rankDelta ? <span className="text-subtle text-sm"> · {m.rankDelta > 0 ? '+' : ''}{m.rankDelta}</span> : null}</td>
                  <td className="tabular-nums">{m.kills}</td>
                  <td className="tabular-nums text-subtle">{m.deaths}</td>
                  <td className="tabular-nums text-subtle">{Math.round((m.durationSeconds ?? 0) / 60)} min</td>
                  <td className="text-subtle"><span className="inline-flex items-center gap-2">{dayTime(m.endedAt)}<Arrow className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,translate]" /></span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Reveal>
    </div>
  );
}

function MedalTile({ m, onToggle }: { m: Medal; onToggle: (m: Medal) => void }) {
  const top = topTier(m);
  const next = nextTier(m);
  const goal = next?.goal ?? m.tiers[4].goal;
  return (
    <button onClick={() => onToggle(m)} {...spotlight}
      className={`spotlight group relative w-full h-full text-left border p-5 flex flex-col gap-3 transition-[border-color,transform] duration-300 hover:-translate-y-1 ${m.equipped ? 'border-primary bg-band/25' : 'border-line hover:border-white/30'}`}>
      <div className="flex items-start justify-between">
        <MedalBadge tier={top?.tier ?? null} size={52} className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
        {m.equipped ? <span className="eyebrow text-[11px] text-primary">En tu tarjeta</span> : <TierPips count={earned(m)} />}
      </div>
      <div className="font-semibold leading-tight line-clamp-2 min-h-[2.5em]">{m.name}</div>
      <Bar value={m.progress / goal} className="h-1" />
      <div className="text-xs text-subtle">{next ? `${num(m.progress)} / ${num(next.goal)} para ${TIER[next.tier].label}` : `Completa · ${day(top!.unlockedAt!)}`}</div>
      {/* Tiers on hover */}
      <div className="pointer-events-none absolute left-0 right-0 top-full z-20 mt-2 bg-raised border border-line p-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-[0_20px_50px_rgb(0_0_0/0.7)]">
        <div className="text-xs text-subtle mb-2">{m.unit}</div>
        {m.tiers.map((t) => (
          <div key={t.tier} className="flex items-center gap-2 py-1 text-sm">
            <MedalBadge tier={t.unlockedAt ? t.tier : null} size={18} />
            <span className={t.unlockedAt ? '' : 'text-subtle'}>{TIER[t.tier].label} · {num(t.goal)}</span>
            <span className="ml-auto text-xs text-subtle">{t.reward.unlock ?? `${num(t.reward.amount)} Monedas`}</span>
          </div>
        ))}
        <div className="text-xs text-primary mt-2">{top ? (m.equipped ? 'Clic para quitar de tu tarjeta' : 'Clic para ponerla en tu tarjeta') : 'Aún no la consigues'}</div>
      </div>
    </button>
  );
}

function Medals({ onChange, version }: { onChange: () => void; version: number }) {
  const { now } = useApp();
  const medals = useData((n) => api.medals(n), [version]);
  const [group, setGroup] = useState<string | null>(null);
  const [view, setView] = useState<'all' | 'earned' | 'next'>('all');
  const toast = useToast();
  const equipped = medals.filter((m) => m.equipped).map((m) => m.id);
  const toggle = (m: Medal) => {
    if (!topTier(m)) return toast('Esa medalla aún no la consigues');
    const ids = m.equipped ? equipped.filter((x) => x !== m.id) : [...equipped, m.id];
    if (ids.length > 3) return toast('Tu tarjeta lleva hasta 3 medallas. Quita una primero');
    try {
      api.equip(ids, now);
      onChange();
      toast(m.equipped ? `${m.name} salió de tu tarjeta` : `${m.name} ya está en tu tarjeta`);
    } catch (e) { toast((e as Error).message); }
  };
  const groups = Object.keys(MEDAL_GROUP).filter((g) => medals.some((m) => m.category === g));
  let list = group ? medals.filter((m) => m.category === group) : medals;
  if (view === 'earned') list = list.filter((m) => topTier(m));
  if (view === 'next') list = list.filter((m) => nextTier(m)).sort((a, b) => b.progress / nextTier(b)!.goal - a.progress / nextTier(a)!.goal);
  const tiers = medals.flatMap((m) => m.tiers.filter((t) => t.unlockedAt));
  return (
    <div>
      <div className="grid grid-cols-5 gap-4 mb-10">
        {(['bronze', 'silver', 'gold', 'onyx', 'diamond'] as const).map((t, i) => (
          <Reveal key={t} delay={i * 60}>
            <div className="border border-line p-5 flex items-center gap-4">
              <MedalBadge tier={t} size={44} />
              <div><div className="display text-4xl"><CountUp value={tiers.filter((x) => x.tier === t).length} /></div><div className="text-sm text-subtle">{TIER[t].label}</div></div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="flex items-center justify-between gap-6 mb-8 sticky top-[72px] z-30 bg-black/90 backdrop-blur py-4 -mx-2 px-2">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setGroup(null)} className={`eyebrow text-[13px] px-3 py-1.5 border transition-colors ${!group ? 'bg-ink text-bg border-ink' : 'border-line text-muted hover:text-ink'}`}>Todas · {medals.length}</button>
          {groups.map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={`eyebrow text-[13px] px-3 py-1.5 border transition-colors ${group === g ? 'bg-ink text-bg border-ink' : 'border-line text-muted hover:text-ink'}`}>{MEDAL_GROUP[g]}</button>
          ))}
        </div>
        <div className="flex border border-line shrink-0">
          {([['all', 'Todas'], ['earned', 'Obtenidas'], ['next', 'Más cerca']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} className={`px-4 py-2 text-sm transition-colors ${view === k ? 'bg-action text-ink' : 'text-muted hover:text-ink'}`}>{l}</button>
          ))}
        </div>
      </div>
      <p className="text-muted mb-6">Pasa el cursor sobre una medalla para ver sus cinco niveles y lo que desbloquea. Haz clic para ponerla en tu tarjeta (hasta 3).</p>
      <div key={`${group}-${view}`} className="grid grid-cols-6 gap-4 pb-32">
        {list.map((m, i) => <div key={m.id} className="relative hover:z-20 animate-rise" style={{ animationDelay: `${Math.min(i, 24) * 25}ms` }}><MedalTile m={m} onToggle={toggle} /></div>)}
      </div>
    </div>
  );
}

function Achievements() {
  const ach = useData((n) => api.achievements(n));
  const [filter, setFilter] = useState<'all' | 'done' | 'todo'>('all');
  const items = ach.items.filter((a) => (filter === 'done' ? a.unlockedAt : filter === 'todo' ? !a.unlockedAt : true));
  return (
    <div className="grid grid-cols-[320px_1fr] gap-12">
      <aside>
        <div className="sticky top-24 flex flex-col items-center text-center border border-line p-8">
          <Ring value={ach.gamerscore / ach.gamerscoreTotal} size={200} label="Gamerscore">
            <div><div className="display text-5xl"><CountUp value={ach.gamerscore} /></div><div className="text-sm text-subtle">de {num(ach.gamerscoreTotal)} G</div></div>
          </Ring>
          <div className="display text-2xl mt-6">{ach.unlocked} de {ach.items.length} logros</div>
          <div className="mt-6 flex border border-line w-full">
            {([['all', 'Todos'], ['done', 'Hechos'], ['todo', 'Faltan']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`flex-1 py-2 text-sm transition-colors ${filter === k ? 'bg-action' : 'text-muted hover:text-ink'}`}>{l}</button>
            ))}
          </div>
        </div>
      </aside>
      <div key={filter} className="grid grid-cols-2 gap-4 content-start">
        {items.map((a, i) => (
          <div key={a.id} {...spotlight} className={`spotlight group border p-5 flex gap-5 animate-rise ${a.unlockedAt ? 'border-line' : 'border-line/60'}`} style={{ animationDelay: `${Math.min(i, 16) * 30}ms` }}>
            <div className={`size-14 shrink-0 grid place-items-center display text-xl transition-transform group-hover:scale-105 ${a.unlockedAt ? 'bg-band text-ink' : 'bg-raised text-subtle'}`}>{a.gamerscore}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className={`font-semibold ${a.unlockedAt ? '' : 'text-muted'}`}>{a.name}</span>
                <span className="text-xs text-subtle shrink-0">{a.rarity < 0.05 ? 'Muy raro · ' : ''}{pct(a.rarity)} lo tiene</span>
              </div>
              <div className="text-sm text-subtle mt-0.5">{a.description}</div>
              {a.unlockedAt
                ? <div className="text-xs text-primary mt-2">Desbloqueado {day(a.unlockedAt)}</div>
                : <div className="mt-3"><Bar value={a.progress / a.goal} className="h-1" /><div className="text-xs text-subtle mt-1">{num(a.progress)} / {num(a.goal)}</div></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
