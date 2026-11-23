// El arsenal on desktop: the community tier list as rows S to C for Versus or Horde, each weapon with your kills,
// and a weapon page with its numbers, the plans of the maps where it appears and how you do with it.
import type { WeaponSummary } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { num, pct, TIER } from '../lib/format';
import { Arrow, Chip, MedalBadge, MoreLink } from '../ui/bits';
import { Bar, Reveal, spotlight } from '../ui/fx';
import { MapPlan } from '../ui/MapPlan';
import { PageHero } from '../ui/PageHero';

export const CATEGORY: Record<WeaponSummary['category'], string> = {
  rifle: 'Rifle', shotgun: 'Escopeta', precision: 'Precisión', smg: 'Subfusil', pistol: 'Pistola', heavy: 'Pesada', explosive: 'Explosiva',
};
const SOURCE: Record<WeaponSummary['source'], string> = { loadout: 'Equipo inicial', map: 'Se recoge en el mapa', power: 'Arma de poder', horde: 'Fabricador de Horde' };
const TIERS = ['S', 'A', 'B', 'C'] as const;
const TIER_COLOR: Record<(typeof TIERS)[number], string> = { S: '#F0473A', A: '#C98500', B: '#3FA7A0', C: '#6E6C6C' };
const STATS: [keyof WeaponSummary['stats'], string][] = [['damage', 'Daño'], ['rate', 'Cadencia'], ['range', 'Alcance'], ['handling', 'Manejo']];
type ModeKey = 'versus' | 'horde';

export function Arsenal({ id }: { id?: string }) {
  return id ? <WeaponPage id={id} /> : <List />;
}

function List() {
  const list = useData((n) => api.weapons(n));
  const [mode, setMode] = useState<ModeKey>('versus');
  const max = Math.max(1, ...list.map((w) => w.me.kills));
  const fav = [...list].sort((a, b) => b.me.kills - a.me.kills)[0];
  return (
    <>
      <PageHero over="Guías · Arsenal" title={<>Cada arma,<br />en su <span className="text-primary">lugar</span></>}>
        <p className="text-white/80 max-w-[640px]">La tier list de la comunidad para cada modo y tus bajas al lado. Tu arma es {fav.name}: {pct(fav.me.share)} de tus bajas con armas.</p>
        <div className="mt-6 flex gap-2" role="group" aria-label="Modo">
          <Chip active={mode === 'versus'} onClick={() => setMode('versus')}>Versus</Chip>
          <Chip active={mode === 'horde'} onClick={() => setMode('horde')}>Horde</Chip>
        </div>
      </PageHero>
      <div className="max-w-[1440px] mx-auto px-10 pt-14 flex flex-col gap-4">
        {TIERS.map((t, ti) => {
          const ws = list.filter((w) => w.tiers[mode].tier === t && (mode === 'horde' || w.source !== 'horde')).sort((a, b) => b.me.kills - a.me.kills);
          if (!ws.length) return null;
          return (
            <Reveal key={`${mode}-${t}`} delay={ti * 60}>
              <div className="grid grid-cols-[112px_1fr] border border-line">
                <div className="flex items-center justify-center display text-7xl" style={{ background: `${TIER_COLOR[t]}26`, color: TIER_COLOR[t], borderRight: `4px solid ${TIER_COLOR[t]}` }}>{t}</div>
                <div className="grid grid-cols-4">
                  {ws.map((w) => (
                    <a key={w.id} href={`#/guias/arsenal/${w.id}`} {...spotlight} className="spotlight group p-5 flex flex-col gap-2 border-r border-b border-line -mb-px hover:bg-surface transition-colors">
                      <span className="eyebrow text-subtle text-[12px]">{CATEGORY[w.category]}</span>
                      <span className="display text-2xl group-hover:text-primary transition-colors">{w.name}</span>
                      <span className="text-sm text-muted line-clamp-2 flex-1">{w.tiers[mode].note}</span>
                      <span className="flex justify-between text-sm"><span className={w.me.kills ? '' : 'text-subtle'}>{w.me.kills ? `${num(w.me.kills)} bajas` : 'Sin usar'}</span><span className="text-subtle">{w.me.kills ? pct(w.me.share) : ''}</span></span>
                      <Bar value={w.me.kills / max} className="h-1" />
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
        <p className="text-sm text-subtle mt-2">Las estadísticas y los niveles son ilustrativos para la demo. Tus bajas con cada arma salen de la misma estimación que las medallas.</p>
      </div>
    </>
  );
}

function WeaponPage({ id }: { id: string }) {
  const w = useData((n) => api.weapon(id, n), [id]);
  const maps = useData((n) => w.pickups.map((k) => ({ k, map: api.map(k.mapId, n) })), [id]);
  const d = w.detail;
  return (
    <>
      <section className="relative -mt-[72px] pt-[72px] band grain overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        <div className="relative max-w-[1440px] mx-auto px-10 pt-12 pb-12">
          <a href="#/guias/arsenal" className="group eyebrow text-[13px] text-white/70 hover:text-ink inline-flex items-center gap-2"><Arrow className="rotate-180 transition-transform group-hover:-translate-x-1" />Arsenal</a>
          <div className="mt-8 flex items-end gap-12">
            <div className="flex-1">
              <div className="eyebrow text-white/70 flex items-center gap-3 animate-rise"><span className="h-px w-10 bg-primary" />{CATEGORY[w.category]} · {SOURCE[w.source]}</div>
              <h1 className="display text-[clamp(56px,6.5vw,104px)] mt-3 animate-rise [animation-delay:80ms]">{w.name}</h1>
              <p className="mt-3 text-white/80 max-w-[720px] animate-rise [animation-delay:160ms]">{w.summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-8 pb-2 animate-rise [animation-delay:200ms]">
              {[['Tus bajas', num(w.me.kills)], ['Entre tus armas', d.rank ? `#${d.rank}` : '–'], ['Precisión', d.accuracy !== null ? pct(d.accuracy) : '–']].map(([label, value], i) => (
                <div key={label}><div className="eyebrow text-white/60 text-[12px]">{label}</div><div className={`display text-5xl ${i === 0 ? 'text-primary' : ''}`}>{value}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-[1440px] mx-auto px-10 pt-10 grid grid-cols-[1fr_400px] gap-10 items-start">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-5">
            {(['versus', 'horde'] as const).map((m) => (
              <div key={m} className="border border-line bg-surface p-7 flex gap-6 items-start" style={{ borderLeft: `4px solid ${TIER_COLOR[w.tiers[m].tier]}` }}>
                <span className="display text-7xl leading-none" style={{ color: TIER_COLOR[w.tiers[m].tier] }}>{w.tiers[m].tier}</span>
                <span><span className="eyebrow text-subtle block">{m === 'versus' ? 'En Versus' : 'En Horde'}</span><span className="text-lg block mt-1">{w.tiers[m].note}</span></span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="border border-line p-7 flex flex-col gap-4">
              <div className="eyebrow text-subtle">Estadísticas</div>
              {STATS.map(([k, label], i) => (
                <div key={k}>
                  <div className="flex justify-between text-sm"><span className="text-muted">{label}</span><span className="tabular-nums">{w.stats[k]}</span></div>
                  <Bar value={w.stats[k] / 100} color="var(--color-ink)" className="h-1.5 mt-1.5" delay={i * 80} />
                </div>
              ))}
              <div className="flex gap-8 pt-2 text-sm text-subtle"><span>Cargador <b className="text-ink">{w.magazine}</b></span><span>Recarga <b className="text-ink">{w.reload.toFixed(1)} s</b></span></div>
            </div>
            <div className="border border-line p-7 flex flex-col gap-4">
              <div className="eyebrow text-subtle">Consejos</div>
              {w.tips.map((t) => <p key={t} className="flex gap-3"><span className="mt-2 size-1.5 rotate-45 bg-primary shrink-0" />{t}</p>)}
              {w.guideId && <div className="mt-auto pt-2"><MoreLink href={`#/guias/${w.guideId}`}>Leer la guía</MoreLink></div>}
            </div>
          </div>
          {maps.length > 0 && (
            <div>
              <div className="eyebrow text-muted mb-4">Dónde aparece</div>
              <div className="grid grid-cols-3 gap-5">
                {maps.map(({ k, map }) => (
                  <a key={k.mapId} href={`#/guias/mapas/${k.mapId}`} className="group border border-line hover:border-white/30 transition-colors">
                    <div className="p-3 pb-0"><MapPlan map={map} selected={map.pickups.find((x) => x.weaponId === w.id)?.zoneId} labels={false} /></div>
                    <div className="p-4"><div className="display text-xl group-hover:text-primary transition-colors">{k.map}</div><div className="text-sm text-subtle">{k.zone} · cada {k.respawnSeconds} s</div></div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <aside className="sticky top-24 flex flex-col gap-5">
          <div className="border border-line bg-surface p-7 flex flex-col gap-5">
            <div className="eyebrow text-primary">Cómo te va</div>
            {w.me.kills ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="eyebrow text-subtle text-[11px]">Versus</div><div className="display text-3xl">{num(d.versusKills)}</div></div>
                  <div><div className="eyebrow text-subtle text-[11px]">Horde</div><div className="display text-3xl">{num(d.hordeKills)}</div></div>
                </div>
                <div className="flex h-2 overflow-hidden"><span style={{ flex: d.versusKills, background: 'var(--color-primary)' }} /><span style={{ flex: d.hordeKills, background: '#3FA7A0' }} /></div>
                {d.headshots !== null && <div className="flex justify-between text-sm border-t border-line pt-4"><span className="text-muted">A la cabeza</span><span>{pct(d.headshots)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted">De tus bajas con armas</span><span>{pct(w.me.share)}</span></div>
              </>
            ) : <p className="text-muted">Todavía no tienes bajas con esta arma.</p>}
          </div>
          <a href="#/servicio/medallas" className="group border border-line p-6 flex items-center gap-5 hover:bg-surface transition-colors">
            <MedalBadge tier={d.medal.tier} size={52} />
            <span className="flex-1">
              <span className="eyebrow text-subtle text-[11px] block">{d.medal.tier ? TIER[d.medal.tier].label : 'Sin nivel'} · Medalla</span>
              <span className="display text-xl block group-hover:text-primary transition-colors">Bajas con {w.name}</span>
              <span className="text-sm text-subtle">{d.medal.nextGoal ? `${num(d.medal.progress)} de ${num(d.medal.nextGoal)}` : 'Completa'}</span>
              {d.medal.nextGoal && <Bar value={d.medal.progress / d.medal.nextGoal} className="h-1 mt-2" />}
            </span>
          </a>
          <p className="text-sm text-subtle">Estadísticas y niveles ilustrativos. La precisión es una estimación de la demo; el juego la registraría disparo a disparo.</p>
        </aside>
      </div>
    </>
  );
}
