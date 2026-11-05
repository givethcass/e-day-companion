// Inicio on desktop: a full-bleed hero with the 3D medal, the player's numbers by mode, and the week around them.
import type { ServiceRecord } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { PRESETS, useApp, useData } from '../lib/app';
import { CAL_KIND, clock, countdown, day, DIFF, MODE, NEWS_TAG, num, pct, rankLabel, ROLE, STORE_TYPE } from '../lib/format';
import { Arrow, Art, MoreLink, PromoCard, SectionHead } from '../ui/bits';
import { Bar, CountUp, Magnetic, Reveal, spotlight, useTilt, useToast } from '../ui/fx';
import { HeroScene } from '../ui/HeroScene';

type Family = 'versus' | 'horde' | 'campaign';
const FAMILIES: [Family, string][] = [['versus', 'Versus'], ['horde', 'Horde'], ['campaign', 'Campaña']];

export function Inicio() {
  const { now } = useApp();
  const me = useData(() => api.me());
  const week = useData((n) => api.week(n));
  const record = useData((n) => api.record(n));
  const wallet = useData((n) => api.wallet(n));
  const news = useData((n) => api.news(n).slice(0, 7));
  const promo = useData(() => api.promos('home')[0]);
  const note = PRESETS.find((p) => p.at === now)?.note;
  const toast = useToast();
  const mission = week.nextMission;

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-[72px] pt-[72px] min-h-[min(92vh,900px)] overflow-hidden band grain flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_75%_40%,rgb(229_15_17/0.35),transparent_70%)]" />
        <HeroScene />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
        <div className="relative max-w-[1440px] w-full mx-auto px-10 pt-14 flex-1 flex flex-col">
          <div className="max-w-[640px]">
            <div className="eyebrow text-white/70 mb-5 flex items-center gap-3 animate-rise"><span className="h-px w-10 bg-primary" />Bienvenido de vuelta, {me.gamertag}</div>
            <h1 className="display text-[clamp(48px,5.4vw,88px)] animate-rise [animation-delay:80ms]">
              {mission.title}.<br /><span className="text-primary">{mission.reason}.</span>
            </h1>
            {note && <p className="mt-6 text-lg text-white/75 max-w-[520px] animate-rise [animation-delay:160ms]">{note}</p>}
            <div className="mt-10 flex items-center gap-4 animate-rise [animation-delay:240ms]">
              <Magnetic>
                <button onClick={() => toast(`Demo: abriría E-Day en ${MODE[mission.mode] ?? mission.title}`)}
                  className="group relative overflow-hidden bg-action hover:bg-ember px-8 py-4 eyebrow text-[15px] inline-flex items-center gap-3 transition-colors">
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  Jugar ahora<span className="text-white/70 normal-case tracking-normal font-sans font-normal">{mission.estimatedMinutes} min · {mission.reward}</span><Arrow />
                </button>
              </Magnetic>
              <Magnetic>
                <a href="#/servicio" className="px-8 py-4 eyebrow text-[15px] border border-white/40 hover:bg-white hover:text-black transition-colors inline-flex items-center gap-3">Mi servicio</a>
              </Magnetic>
            </div>
          </div>
          <div className="mt-auto pb-8 pt-10">
            <PlayerStats record={record} level={me.level} rank={rankLabel(me.rank)} />
          </div>
        </div>
      </section>

      {/* Headlines ticker */}
      <div className="bg-action overflow-hidden border-y border-black/40" aria-label="Últimas noticias">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...news, ...news].map((n, i) => (
            <a key={i} href={`#/noticias/${n.id}`} className="flex items-center gap-4 px-8 py-3 whitespace-nowrap hover:bg-black/20 transition-colors">
              <span className="eyebrow text-[12px] text-white/70">{NEWS_TAG[n.tag].label}</span>
              <span className="font-semibold">{n.title}</span>
              <span className="size-1.5 rotate-45 bg-white/60" />
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10">
        {/* Week */}
        <section className="pt-24 grid grid-cols-[1.25fr_1fr] gap-8">
          <Reveal>
            <SectionHead over={`Semana del ${day(week.weekStart + 'T18:00:00Z')}`} title="Esta semana" />
            <div className="grid grid-cols-4 border border-line">
              {[
                ['Horas', <CountUp value={week.hoursPlayed} decimals={1} />],
                ['Partidas', <CountUp value={week.matchesPlayed} />],
                ['Retos', <><CountUp value={week.challengesDone} /> / {week.challengesTotal}</>],
                ['Monedas', <CountUp value={wallet.coins} />],
              ].map(([label, value], i) => (
                <div key={i} className="p-6 border-r border-line last:border-r-0 hover:bg-surface transition-colors">
                  <div className="eyebrow text-subtle">{label}</div>
                  <div className="display text-5xl mt-2">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex justify-between eyebrow text-subtle mb-2"><span>Pase de temporada</span><span className="text-ink">{pct(week.seasonProgress ?? 0)}</span></div>
              <Bar value={week.seasonProgress ?? 0} className="h-2" />
              <div className="flex justify-between text-sm text-subtle mt-3">
                <span>Tope semanal de Monedas: {num(wallet.coinsThisWeek)} / {num(wallet.coinsWeeklyCap)}</span>
                <span>Se reinicia {day(wallet.capResetsAt)}</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div {...spotlight} className="spotlight relative h-full bg-surface border border-line p-8 flex flex-col">
              <div className="eyebrow text-primary">Tu siguiente misión</div>
              <h3 className="display text-4xl mt-3">{mission.title}</h3>
              <p className="text-muted mt-2">{mission.reason} · {mission.estimatedMinutes} min · <span className="text-ink">{mission.reward}</span></p>
              <div className="mt-6 eyebrow text-subtle">O también</div>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {(mission.alternatives ?? []).map((a) => (
                  <li key={a.title}>
                    <button onClick={() => toast(`Demo: abriría ${a.title}`)} className="group w-full flex items-center justify-between py-3 text-left hover:text-primary transition-colors">
                      <span>{a.title}</span><Arrow className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* News */}
        <section className="pt-24">
          <Reveal><SectionHead over="Noticias" title="Lo último de E-Day" action={<MoreLink href="#/noticias">Todas las noticias</MoreLink>} /></Reveal>
          <div className="grid grid-cols-4 grid-rows-2 gap-5 h-[560px]">
            {news.slice(0, 5).map((n, i) => (
              <Reveal key={n.id} delay={i * 70} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
                <a href={`#/noticias/${n.id}`} {...spotlight} className="spotlight group h-full flex flex-col border border-line hover:border-white/30 transition-colors overflow-hidden">
                  <Art glow={NEWS_TAG[n.tag].glow} className={`${i === 0 ? 'flex-1' : 'h-28'} transition-[filter] group-hover:brightness-125`}>
                    <span className="absolute left-5 top-5 eyebrow text-[12px] bg-black/60 px-2 py-1">{NEWS_TAG[n.tag].label}</span>
                  </Art>
                  <div className="p-5">
                    <div className="text-sm text-subtle">{day(n.publishedAt)} · {n.readMinutes} min</div>
                    <h3 className={`font-display font-semibold uppercase leading-tight mt-1 group-hover:text-primary transition-colors ${i === 0 ? 'text-3xl' : 'text-lg line-clamp-2'}`}>{n.title}</h3>
                    {i === 0 && <p className="text-muted mt-2">{n.summary}</p>}
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {promo && <section className="pt-24"><Reveal><PromoCard promo={promo} wide /></Reveal></section>}

        <Store />
        <Calendar />
        <Squads />
      </div>
    </>
  );
}

/** The mode tabs from the mobile Inicio, as a glass panel along the bottom of the hero. */
function PlayerStats({ record, level, rank }: { record: ServiceRecord; level: number; rank: string }) {
  const [tab, setTab] = useState<Family>(() => (Object.keys(record.career.share) as Family[]).sort((a, b) => record.career.share[b] - record.career.share[a])[0]);
  const v = record.versus, h = record.horde, c = record.campaign;
  const rows: Record<Family, [string, number, number?, string?][]> = {
    versus: [['K/D', v.kd, 2], ['Victorias', v.winRate * 100, 0, '%'], ['Bajas', v.kills], ['Partidas', v.matches], ['Mejor racha', v.bestWinStreak], ['Horas', v.hoursPlayed, 1]],
    horde: [['Mejor oleada', h.bestWave], ['Oleadas', h.wavesCleared], ['Completadas', h.completed], ['Bajas', h.kills], ['Partidas', h.matches], ['Horas', h.hoursPlayed, 1]],
    campaign: [['Capítulos', c.chaptersCompleted], ['Intentos', c.attempts], ['Bajas', c.kills], ['Horas', c.hoursPlayed, 1]],
  };
  const side: Record<Family, string> = {
    versus: `Ranked ${rank} · Mejor mapa: ${v.bestMap?.map ?? '—'}`,
    horde: `Clase principal: ${ROLE[h.mainRole ?? 'assault']} · Meta ${h.waveGoal} oleadas`,
    campaign: `${c.chaptersCompleted} de ${c.chaptersTotal} capítulos`,
  };
  return (
    <div className="bg-black/55 backdrop-blur-md border border-white/10 animate-rise [animation-delay:320ms]">
      <div className="flex items-center border-b border-white/10">
        <div className="px-6 py-4 border-r border-white/10 flex items-center gap-3">
          <span className="display text-3xl text-primary">{level}</span>
          <span className="eyebrow text-subtle leading-tight">Nivel<br />{record.title}</span>
        </div>
        <div role="tablist" className="flex">
          {FAMILIES.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`relative eyebrow text-[14px] px-6 py-5 transition-colors ${tab === k ? 'text-ink' : 'text-subtle hover:text-ink'}`}>
              {label} <span className="text-subtle font-sans normal-case tracking-normal">{pct(record.career.share[k])}</span>
              <span className={`absolute left-6 right-6 bottom-0 h-[3px] bg-primary transition-transform duration-300 origin-left ${tab === k ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </div>
        <div className="ml-auto px-6 text-sm text-muted">{side[tab]}</div>
        <a href="#/servicio" className="group self-stretch px-6 flex items-center gap-2 eyebrow border-l border-white/10 hover:bg-white/5">Todo mi servicio<Arrow className="transition-transform group-hover:translate-x-1" /></a>
      </div>
      <div key={tab} className="grid grid-cols-6">
        {rows[tab].map(([label, value, decimals, suffix], i) => (
          <div key={label} className="px-6 py-5 border-r border-white/10 last:border-r-0 animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="eyebrow text-subtle">{label}</div>
            <div className={`display text-5xl mt-1 ${i === 0 ? 'text-primary' : ''}`}><CountUp value={value} decimals={decimals} suffix={suffix} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreCard({ item, i }: { item: ReturnType<typeof api.store>['items'][number]; i: number }) {
  const tilt = useTilt(10);
  const toast = useToast();
  const [wish, setWish] = useState(!!item.wishlisted);
  const glows = ['#D9A93B', '#7AA0BE', '#E50F11', '#3FA7A0', '#E5730F', '#8E8E8E'];
  return (
    <Reveal delay={i * 60}>
      <article ref={tilt.ref as never} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={tilt.style} className="spotlight group border border-line bg-surface hover:border-white/30">
        <Art glow={glows[i % glows.length]} className="h-48">
          <button onClick={() => { setWish(!wish); toast(wish ? 'Quitado de tu lista de deseos' : 'Agregado a tu lista de deseos'); }} aria-pressed={wish} aria-label="Lista de deseos"
            className="absolute right-3 top-3 size-9 grid place-items-center bg-black/60 hover:bg-black transition-colors active:scale-90">
            <svg viewBox="0 0 24 24" className={`size-5 transition-transform ${wish ? 'scale-110 text-primary' : ''}`} fill={wish ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
          </button>
        </Art>
        <div className="p-4">
          <div className="text-xs text-subtle">{STORE_TYPE[item.type]}</div>
          <div className="font-display font-semibold uppercase text-lg leading-tight mt-0.5">{item.name}</div>
          <div className="mt-3 flex items-center gap-2 font-semibold">
            <span className={`size-2.5 rotate-45 ${item.price.currency === 'iron' ? 'bg-silver' : 'bg-gold'}`} />
            {num(item.price.amount)} {item.price.currency === 'iron' ? 'Hierro' : 'Monedas'}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function Store() {
  const { now } = useApp();
  const store = useData((n) => api.store(n));
  return (
    <section className="pt-24">
      <Reveal><SectionHead over={`Rotación · cambia ${countdown(store.endsAt, now)}`} title="Tienda de la semana" /></Reveal>
      <div className="grid grid-cols-6 gap-5">{store.items.map((it, i) => <StoreCard key={it.id} item={it} i={i} />)}</div>
    </section>
  );
}

function Calendar() {
  const { now } = useApp();
  const cal = useData((n) => api.calendar(n));
  return (
    <section className="pt-24">
      <Reveal><SectionHead over="Calendario" title="Lo que viene" /></Reveal>
      <div className="relative">
        <div className="absolute left-0 right-0 top-[22px] h-px bg-line" />
        <ol className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cal.length}, minmax(0,1fr))` }}>
          {cal.map((e, i) => (
            <Reveal as="li" key={e.id} delay={i * 80}>
              <a href={e.link ? `#${e.link}` : undefined} className="group block">
                <span className="relative z-10 block size-11 rotate-45 border border-line bg-bg group-hover:border-primary group-hover:bg-band transition-colors">
                  <span className="absolute inset-0 -rotate-45 grid place-items-center eyebrow text-[10px]">{day(e.at).split(' ')[1]}</span>
                </span>
                <div className="mt-6 eyebrow text-primary text-[12px]">{CAL_KIND[e.kind]} · {countdown(e.at, now)}</div>
                <div className="font-display font-semibold uppercase text-xl leading-tight mt-1 group-hover:text-primary transition-colors">{e.title}</div>
                <div className="text-sm text-subtle mt-1">{day(e.at)}, {clock(e.at)}</div>
              </a>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Squads() {
  const { now } = useApp();
  const sessions = useData((n) => api.sessions(n).slice(0, 3));
  const toast = useToast();
  return (
    <section className="pt-24">
      <Reveal><SectionHead over="Escuadras" title="Juega con alguien hoy" action={<MoreLink href="#/comunidad">Ver Comunidad</MoreLink>} /></Reveal>
      <div className="grid grid-cols-3 gap-5">
        {sessions.map((s, i) => {
          const taken = s.members.length;
          return (
            <Reveal key={s.id} delay={i * 80}>
              <article {...spotlight} className="spotlight border border-line bg-surface p-6 hover:border-white/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-primary text-[12px]">{MODE[s.mode]}{s.difficulty ? ` · ${DIFF[s.difficulty]}` : ''}</span>
                  <span className="text-sm text-subtle">{countdown(s.startsAt, now)}</span>
                </div>
                <h3 className="display text-2xl mt-2">{s.map ?? MODE[s.mode]}, {clock(s.startsAt)}</h3>
                <p className="text-muted text-sm mt-1">Organiza {s.hostGamertag} · {s.micRequired ? 'con micrófono' : 'sin micrófono'} · {s.language === 'es' ? 'español' : 'inglés'}</p>
                <div className="mt-5 flex gap-1">
                  {Array.from({ length: s.slots }, (_, k) => <span key={k} className={`h-2 flex-1 transition-colors ${k < taken ? 'bg-primary' : 'bg-white/10'}`} style={{ transitionDelay: `${k * 30}ms` }} />)}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-subtle">{taken} de {s.slots} lugares</span>
                  <button onClick={() => toast(`Demo: pedirías lugar con ${s.hostGamertag}`)} className="eyebrow text-[13px] px-4 py-2 bg-ink text-bg hover:bg-primary hover:text-ink transition-colors active:scale-95">Unirme</button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
