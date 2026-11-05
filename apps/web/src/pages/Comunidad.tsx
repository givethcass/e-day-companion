// Comunidad on desktop: open squads, the clan with its board, creators (live ones pulse), the partner slot and the ranked board.
import { useState } from 'react';
import { api } from '../lib/api';
import { useApp, useData } from '../lib/app';
import { clock, compact, countdown, day, DIFF, MODE, num, plural, ROLE } from '../lib/format';
import { PromoCard, SectionHead } from '../ui/bits';
import { Reveal, spotlight, useToast } from '../ui/fx';
import { PageHero } from '../ui/PageHero';

export function Comunidad() {
  const { now } = useApp();
  const me = useData(() => api.me());
  const sessions = useData((n) => api.sessions(n));
  const clan = useData(() => api.clan(me.clanId!));
  const board = useData(() => api.clanBoard(me.clanId!));
  const ranked = useData(() => api.leaderboard('versus_ranked', 'global'));
  const creators = useData(() => api.creators());
  const promo = useData(() => api.promos('community')[0]);
  const next = clan.upcomingSessions?.[0];
  const [mode, setMode] = useState<string | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const toast = useToast();
  const modes = [...new Set(sessions.map((s) => s.mode))];
  const list = (mode ? sessions.filter((s) => s.mode === mode) : sessions).slice(0, 9);

  return (
    <>
      <PageHero over="Comunidad" title={<>Nadie pelea<br /><span className="text-primary">solo</span></>} tint="#6E9F7A">
        <div className="flex gap-10 text-white/80">
          <span><b className="display text-3xl text-ink">{sessions.length}</b> escuadras abiertas</span>
          <span><b className="display text-3xl text-ink">{creators.filter((c) => c.live).length}</b> {creators.filter((c) => c.live).length === 1 ? 'creador en vivo' : 'creadores en vivo'}</span>
          <span><b className="display text-3xl text-ink">{clan.memberCount}</b> en {clan.name}</span>
        </div>
      </PageHero>
      <div className="max-w-[1440px] mx-auto px-10 pt-16 flex flex-col gap-24">
        <section>
          <Reveal><SectionHead over="Escuadras" title="Busca con quién jugar" action={
            <div className="flex gap-2">
              <button onClick={() => setMode(null)} className={`eyebrow text-[13px] px-3 py-1.5 border transition-colors ${!mode ? 'bg-ink text-bg border-ink' : 'border-line text-muted hover:text-ink'}`}>Todas</button>
              {modes.map((m) => <button key={m} onClick={() => setMode(m)} className={`eyebrow text-[13px] px-3 py-1.5 border transition-colors ${mode === m ? 'bg-ink text-bg border-ink' : 'border-line text-muted hover:text-ink'}`}>{MODE[m]}</button>)}
            </div>
          } /></Reveal>
          <div key={mode ?? 'all'} className="grid grid-cols-3 gap-5">
            {list.map((s, i) => {
              const isIn = joined.has(s.id);
              const taken = s.members.length + (isIn ? 1 : 0);
              return (
                <article key={s.id} {...spotlight} className="spotlight border border-line bg-surface p-6 hover:border-white/30 transition-colors animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-primary text-[12px]">{MODE[s.mode]}{s.difficulty ? ` · ${DIFF[s.difficulty]}` : ''}</span>
                    <span className="text-sm text-subtle">{countdown(s.startsAt, now)}</span>
                  </div>
                  <h3 className="display text-2xl mt-2">{s.map ?? MODE[s.mode]} · {day(s.startsAt)}, {clock(s.startsAt)}</h3>
                  <p className="text-muted text-sm mt-1">Organiza {s.hostGamertag} · {s.micRequired ? 'con micrófono' : 'sin micrófono'}{s.clanId ? ' · solo clan' : ''}</p>
                  <div className="mt-4 flex -space-x-2">
                    {s.members.slice(0, 8).map((m) => <span key={m.gamertag} title={`${m.gamertag}${m.role ? ' · ' + ROLE[m.role] : ''}`} className="size-8 grid place-items-center rounded-full bg-raised border-2 border-surface text-[11px] font-semibold hover:-translate-y-1 hover:z-10 transition-transform">{m.gamertag.slice(0, 2)}</span>)}
                    {isIn && <span className="size-8 grid place-items-center rounded-full bg-primary border-2 border-surface text-[11px] font-semibold animate-rise">DR</span>}
                  </div>
                  <div className="mt-4 flex gap-1">{Array.from({ length: s.slots }, (_, k) => <span key={k} className={`h-1.5 flex-1 transition-colors duration-500 ${k < taken ? 'bg-primary' : 'bg-white/10'}`} />)}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-subtle">{taken} de {s.slots}</span>
                    {taken >= s.slots && !isIn ? <span className="eyebrow text-[13px] text-subtle px-4 py-2 border border-line">Llena</span> : <button onClick={() => { const next = new Set(joined); if (isIn) next.delete(s.id); else next.add(s.id); setJoined(next); toast(isIn ? 'Saliste de la escuadra' : `Pediste lugar con ${s.hostGamertag}`); }}
                      className={`eyebrow text-[13px] px-4 py-2 transition-colors active:scale-95 ${isIn ? 'border border-white/40 hover:bg-white/10' : 'bg-ink text-bg hover:bg-primary hover:text-ink'}`}>{isIn ? 'Salir' : 'Unirme'}</button>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-[1.3fr_1fr] gap-8">
          <Reveal>
            <div className="relative overflow-hidden band grain p-10 h-full">
              <div className="eyebrow text-white/70">Tu clan</div>
              <h2 className="display text-6xl mt-2">{clan.name} <span className="text-white/50">[{clan.tag}]</span></h2>
              <p className="text-white/75 mt-2">{clan.memberCount} miembros · {clan.language === 'es' ? 'español' : clan.language}</p>
              {next && (
                <div className="mt-8 bg-black/50 border border-white/10 p-5">
                  <div className="eyebrow text-primary text-[12px]">Próxima sesión del clan · {countdown(next.startsAt, now)}</div>
                  <div className="display text-2xl mt-1">{MODE[next.mode]} en {next.map}, {day(next.startsAt)} {clock(next.startsAt)}</div>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="border border-line h-full">
              <div className="eyebrow text-subtle px-6 pt-5 pb-3">Tabla del clan</div>
              <ol>
                {board.entries.slice(0, 7).map((e, i) => (
                  <li key={e.gamertag} className={`flex items-center gap-4 px-6 py-3 border-t border-line animate-rise ${e.gamertag === me.gamertag ? 'bg-band/40' : 'hover:bg-surface'}`} style={{ animationDelay: `${i * 50}ms` }}>
                    <span className={`display text-2xl w-8 ${i < 3 ? 'text-primary' : 'text-subtle'}`}>{e.position}</span>
                    <span className="flex-1 font-semibold">{e.gamertag}</span>
                    <span className="tabular-nums text-muted">{num(e.points)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </section>

        <section>
          <Reveal><SectionHead over="Creadores" title="Gente que vale la pena seguir" /></Reveal>
          <div className="grid grid-cols-5 gap-5">
            {creators.map((c, i) => (
              <Reveal key={c.id} delay={i * 60}>
                <article {...spotlight} className="spotlight group border border-line p-6 h-full flex flex-col hover:border-white/30 transition-colors">
                  <div className="relative size-16 grid place-items-center bg-raised display text-2xl transition-transform group-hover:scale-105">
                    {c.name.slice(0, 2)}
                    {c.live && <span className="absolute -right-1.5 -top-1.5 size-3.5 rounded-full bg-primary animate-pulse-dot" />}
                  </div>
                  <div className="font-display font-semibold uppercase text-xl mt-4">{c.name}</div>
                  <div className="text-sm text-subtle">{c.focus}</div>
                  <div className="text-sm text-muted mt-3 line-clamp-2">{c.live ? <span className="text-primary font-semibold">En vivo: </span> : null}{c.latest?.title}</div>
                  <div className="mt-auto pt-4 flex justify-between text-sm text-subtle"><span>{compact(c.followers)} seguidores</span><span>{plural(c.guides ?? 0, 'guía', 'guías')}</span></div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {promo && <Reveal><PromoCard promo={promo} wide /></Reveal>}

        <section>
          <Reveal><SectionHead over="Ranked · global" title="Los mejores de la temporada" /></Reveal>
          <div className="grid grid-cols-2 gap-x-10">
            {ranked.entries.map((e, i) => (
              <Reveal key={e.gamertag} delay={(i % 5) * 50}>
                <div className={`flex items-center gap-5 py-4 border-b border-line ${e.gamertag === me.gamertag ? 'text-primary' : ''}`}>
                  <span className="display text-3xl w-10">{e.position}</span>
                  <span className="flex-1 font-semibold">{e.gamertag} {e.clanTag && <span className="text-subtle font-normal">[{e.clanTag}]</span>}</span>
                  <span className="text-subtle">{e.country}</span>
                  <span className="tabular-nums w-20 text-right">{num(e.points)}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
