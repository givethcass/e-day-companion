// Mapas de Versus: a grid of plans, and a map page with the plan large, three views (plan, your kills, your
// deaths) and the callout you pick explained beside it, with the lesson for your next match there.
import type { MapZone, VersusMap } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { num, pct } from '../lib/format';
import { Arrow, Chip, MoreLink } from '../ui/bits';
import { Bar, Reveal, spotlight } from '../ui/fx';
import { HEAT, MapPlan, type PlanView } from '../ui/MapPlan';
import { PageHero } from '../ui/PageHero';

export const MAP_SIZE: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };
const KIND: Record<MapZone['kind'], string> = {
  spawn: 'Reaparición', lane: 'Ruta', open: 'Zona abierta', close: 'Corta distancia', high: 'Zona alta', power: 'Arma de poder',
};
const VIEWS: [PlanView, string][] = [['plan', 'Plano'], ['kills', 'Tus bajas'], ['deaths', 'Tus caídas']];
const winRate = (m: VersusMap) => (m.me.matches ? m.me.wins / m.me.matches : 0);

export function Mapas({ id }: { id?: string }) {
  return id ? <MapPage id={id} /> : <List />;
}

function List() {
  const maps = useData((n) => api.maps(n).map((m) => api.map(m.id, n))).slice().sort((a, b) => b.me.wins - a.me.wins || a.name.localeCompare(b.name));
  return (
    <>
      <PageHero over="Guías · Mapas de Versus" title={<>Conoce el terreno<br />antes de <span className="text-primary">pisarlo</span></>} tint="#3FA7A0">
        <p className="text-white/80 max-w-[640px]">Los callouts que usa la comunidad, dónde aparece cada arma de poder y en qué zonas ganas o caes, sacado de tus partidas.</p>
      </PageHero>
      <div className="max-w-[1440px] mx-auto px-10 pt-14 grid grid-cols-3 gap-6">
        {maps.map((m, i) => (
          <Reveal key={m.id} delay={(i % 3) * 70}>
            <a href={`#/guias/mapas/${m.id}`} {...spotlight} className="spotlight group h-full flex flex-col border border-line bg-surface hover:border-white/30 transition-colors">
              <div className="p-4 pb-0"><MapPlan map={m} view="kills" className="transition-transform duration-500 group-hover:scale-[1.02]" /></div>
              <div className="p-6 flex-1 flex flex-col gap-2">
                <div className="eyebrow text-subtle text-[12px]">{MAP_SIZE[m.size]} · {m.bestFor}</div>
                <h2 className="display text-3xl group-hover:text-primary transition-colors">{m.name}</h2>
                <p className="text-muted text-sm line-clamp-2">{m.summary}</p>
                <div className="mt-auto pt-4 grid grid-cols-3 border-t border-line text-sm">
                  <span className="pt-3"><b className="display text-2xl block">{m.me.matches}</b><span className="text-subtle">partidas</span></span>
                  <span className="pt-3"><b className="display text-2xl block">{pct(winRate(m))}</b><span className="text-subtle">victorias</span></span>
                  <span className="pt-3"><b className="display text-2xl block text-primary">{m.me.kd.toFixed(2)}</b><span className="text-subtle">K/D</span></span>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
        <Reveal delay={140}>
          <div className="h-full border border-dashed border-line p-8 flex flex-col justify-center gap-3 text-muted">
            <div className="eyebrow text-subtle">Cómo leer los planos</div>
            <p>Cada bloque es un callout. Rojo intenso: donde más bajas haces. Las líneas punteadas marcan dónde reaparece cada equipo y los rombos dorados, las armas de poder.</p>
            <p className="text-sm text-subtle">Dónde ocurre cada baja es una estimación de la demo a partir de tus partidas; el juego lo registraría exacto.</p>
          </div>
        </Reveal>
      </div>
    </>
  );
}

function MapPage({ id }: { id: string }) {
  const m = useData((n) => api.map(id, n), [id]);
  const [view, setView] = useState<PlanView>('kills');
  const [picked, setPicked] = useState<string | null>(null);
  const stat = new Map(m.stats.zones.map((z) => [z.zoneId, z]));
  // Opens on where you do best; the lesson under the plan already names where you fall most.
  const zone = m.zones.find((z) => z.id === (picked ?? m.stats.strongest ?? m.zones[0].id))!;
  const here = stat.get(zone.id)!;
  const field = view === 'deaths' ? 'deaths' : 'kills';
  const total = field === 'deaths' ? m.stats.deaths : m.stats.kills;
  const rows = [...m.zones].sort((a, b) => stat.get(b.id)![field] - stat.get(a.id)![field]);
  return (
    <>
      <section className="relative -mt-[72px] pt-[72px] band grain overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        <div className="relative max-w-[1440px] mx-auto px-10 pt-12 pb-12">
          <a href="#/guias/mapas" className="group eyebrow text-[13px] text-white/70 hover:text-ink inline-flex items-center gap-2"><Arrow className="rotate-180 transition-transform group-hover:-translate-x-1" />Mapas de Versus</a>
          <div className="mt-8 flex items-end gap-12">
            <div className="flex-1">
              <div className="eyebrow text-white/70 flex items-center gap-3 animate-rise"><span className="h-px w-10 bg-primary" />{MAP_SIZE[m.size]} · {m.bestFor}</div>
              <h1 className="display text-[clamp(56px,6.5vw,104px)] mt-3 animate-rise [animation-delay:80ms]">{m.name}</h1>
              <p className="mt-3 text-white/80 max-w-[720px] animate-rise [animation-delay:160ms]">{m.setting}. {m.summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-8 pb-2 animate-rise [animation-delay:200ms]">
              {[['Partidas', String(m.me.matches)], ['Victorias', pct(winRate(m))], ['K/D', m.me.kd.toFixed(2)]].map(([label, value], i) => (
                <div key={label}><div className="eyebrow text-white/60 text-[12px]">{label}</div><div className={`display text-5xl ${i === 2 ? 'text-primary' : ''}`}>{value}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-[1440px] mx-auto px-10 pt-10 grid grid-cols-[1fr_400px] gap-10 items-start">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2" role="group" aria-label="Vista del plano">
            {VIEWS.map(([k, label]) => <Chip key={k} active={view === k} onClick={() => setView(k)}>{label}</Chip>)}
            <div className="ml-auto flex items-center gap-5 text-sm text-subtle">
              {view !== 'plan' && <span className="flex items-center gap-2"><span className="size-3" style={{ background: HEAT[view] }} />{view === 'kills' ? 'Más bajas, más intenso' : 'Más caídas, más intenso'}</span>}
              <span className="flex items-center gap-2"><span className="size-2.5 rotate-45 bg-[#C98500]" />Arma de poder</span>
              <span className="flex items-center gap-2"><span className="size-3 border border-dashed border-white/50" />Reaparición</span>
            </div>
          </div>
          <MapPlan map={m} view={view} selected={zone.id} onSelect={setPicked} />
          {m.stats.takeaway && (
            <div className="border border-line border-l-4 border-l-primary bg-surface p-7">
              <div className="eyebrow text-primary">Para tu próxima partida aquí</div>
              <p className="mt-2 text-lg">{m.stats.takeaway}</p>
            </div>
          )}
          {m.pickups.length > 0 && (
            <div className="border border-line">
              <div className="eyebrow text-subtle px-6 pt-5 pb-3">Armas de poder</div>
              {m.pickups.map((k) => (
                <button key={k.weaponId} onClick={() => setPicked(k.zoneId)} className="w-full flex items-center gap-4 px-6 py-4 border-t border-line text-left hover:bg-surface transition-colors">
                  <span className="size-3 rotate-45 bg-[#C98500]" />
                  <span className="font-semibold flex-1">{k.weapon}</span>
                  <span className="text-subtle">{m.zones.find((z) => z.id === k.zoneId)!.name} · reaparece cada {k.respawnSeconds} s</span>
                </button>
              ))}
            </div>
          )}
          {m.guideId && <MoreLink href={`#/guias/${m.guideId}`}>Leer la guía del mapa</MoreLink>}
        </div>
        <aside className="sticky top-24 flex flex-col gap-5">
          <div key={zone.id} className="border border-line bg-surface p-7 animate-rise">
            <div className="eyebrow text-primary">{KIND[zone.kind]}{zone.team ? ` · ${zone.team}` : ''}</div>
            <h2 className="display text-4xl mt-1">{zone.name}</h2>
            <p className="text-muted mt-3">{zone.tip}</p>
            <div className="grid grid-cols-3 mt-6 border-t border-line pt-4">
              <div><div className="eyebrow text-subtle text-[11px]">Bajas</div><div className="display text-3xl text-primary">{num(here.kills)}</div></div>
              <div><div className="eyebrow text-subtle text-[11px]">Caídas</div><div className="display text-3xl">{num(here.deaths)}</div></div>
              <div><div className="eyebrow text-subtle text-[11px]">K/D</div><div className="display text-3xl">{(here.kills / Math.max(1, here.deaths)).toFixed(2)}</div></div>
            </div>
            {m.pickups.filter((k) => k.zoneId === zone.id).map((k) => <p key={k.weaponId} className="mt-4 text-sm text-muted flex items-center gap-2"><span className="size-2.5 rotate-45 bg-[#C98500]" />{k.weapon} reaparece aquí cada {k.respawnSeconds} s</p>)}
          </div>
          <div className="border border-line">
            <div className="eyebrow text-subtle px-6 pt-5 pb-3">{field === 'deaths' ? 'Dónde caes' : 'Dónde haces bajas'}</div>
            {rows.map((z) => {
              const value = stat.get(z.id)![field];
              return (
                <button key={z.id} onClick={() => setPicked(z.id)} aria-pressed={z.id === zone.id}
                  className={`w-full text-left px-6 py-3 border-t border-line transition-colors ${z.id === zone.id ? 'bg-raised' : 'hover:bg-surface'}`}>
                  <span className="flex justify-between text-sm"><span className="font-semibold">{z.name}</span><span className="tabular-nums">{num(value)} <span className="text-subtle">{pct(value / Math.max(1, total))}</span></span></span>
                  <Bar value={value / Math.max(1, total)} color={HEAT[field]} className="h-1 mt-2" />
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
