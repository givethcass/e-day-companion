// Guías: a tilting card grid filtered by section, and a guide page with the key facts pinned beside the text.
import type { GuideSummary } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { compact, day, GUIDE_SECTION, ROLE } from '../lib/format';
import { Arrow, Art, Chip, PromoCard } from '../ui/bits';
import { Reveal, spotlight, useTilt } from '../ui/fx';
import { PageHero } from '../ui/PageHero';

export function Guias({ id }: { id?: string }) {
  return id ? <GuidePage id={id} /> : <List />;
}

function GuideCard({ g, i, big }: { g: GuideSummary; i: number; big?: boolean }) {
  const tilt = useTilt(6);
  const s = GUIDE_SECTION[g.section];
  return (
    <Reveal delay={(i % 4) * 60} className={big ? 'col-span-2' : ''}>
      <a href={`#/guias/${g.id}`} ref={tilt.ref as never} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={tilt.style}
        className="spotlight group h-full flex flex-col border border-line bg-surface hover:border-white/30">
        <Art glow={s.glow} className={big ? 'h-56' : 'h-36'}>
          <span className="absolute left-5 top-5 eyebrow text-[12px] bg-black/60 px-2 py-1">{s.label}{g.role ? ` · ${ROLE[g.role]}` : ''}{g.map ? ` · ${g.map}` : ''}</span>
        </Art>
        <div className="p-5 flex-1 flex flex-col">
          <h2 className={`font-display font-semibold uppercase leading-tight group-hover:text-primary transition-colors ${big ? 'text-3xl' : 'text-xl'}`}>{g.title}</h2>
          <p className="text-muted text-sm mt-2 line-clamp-2">{g.summary}</p>
          <div className="mt-auto pt-4 flex items-center justify-between text-sm text-subtle">
            <span className="flex items-center gap-2">
              <span className={`size-2 rotate-45 ${g.author.kind === 'official' ? 'bg-primary' : 'bg-diamond'}`} />{g.author.name}
            </span>
            <span>{g.readMinutes} min{g.patch ? ` · parche ${g.patch}` : ''}</span>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

function List() {
  const [section, setSection] = useState<string | null>(null);
  const all = useData(() => api.guides());
  const creators = useData(() => api.creators());
  const promo = useData(() => api.promos('guides')[0]);
  const items = section ? all.filter((g) => g.section === section) : all;
  return (
    <>
      <PageHero over="Guías" title={<>Aprende el oficio<br />de un <span className="text-primary">Gear</span></>} tint="#D9A93B">
        <div className="flex flex-wrap gap-2">
          <Chip active={!section} onClick={() => setSection(null)}>Todas · {all.length}</Chip>
          {Object.entries(GUIDE_SECTION).map(([k, s]) => <Chip key={k} active={section === k} onClick={() => setSection(k)}>{s.label} · {all.filter((g) => g.section === k).length}</Chip>)}
        </div>
      </PageHero>
      <div className="max-w-[1440px] mx-auto px-10 pt-14 grid grid-cols-[1fr_320px] gap-10">
        <div className="grid grid-cols-3 gap-5 content-start">
          {items.map((g, i) => <GuideCard key={g.id} g={g} i={i} big={i === 0 && !section} />)}
        </div>
        <aside className="flex flex-col gap-6">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="border border-line">
              <div className="eyebrow text-subtle px-5 pt-5 pb-3">Creadores con guías</div>
              {creators.filter((c) => (c.guides ?? 0) > 0).map((c) => (
                <a key={c.id} href="#/comunidad" className="flex items-center gap-3 px-5 py-3 border-t border-line hover:bg-surface transition-colors">
                  <span className="relative size-9 grid place-items-center bg-raised display">
                    {c.name.slice(0, 2)}
                    {c.live && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-primary animate-pulse-dot" />}
                  </span>
                  <span className="flex-1 leading-tight"><span className="block font-semibold">{c.name}</span><span className="text-xs text-subtle">{c.focus} · {compact(c.followers)}</span></span>
                  <span className="text-sm text-subtle">{c.guides}</span>
                </a>
              ))}
            </div>
            {promo && <PromoCard promo={promo} />}
          </div>
        </aside>
      </div>
    </>
  );
}

function GuidePage({ id }: { id: string }) {
  const g = useData(() => api.guide(id), [id]);
  const related = useData(() => api.guides().filter((x) => x.section === g.section && x.id !== id).slice(0, 3), [id]);
  const s = GUIDE_SECTION[g.section];
  return (
    <>
      <section className="relative -mt-[72px] pt-[72px] overflow-hidden grain" style={{ background: `radial-gradient(70% 120% at 85% 0%, ${s.glow}55, transparent 60%), linear-gradient(180deg,#140808,#000)` }}>
        <div className="relative max-w-[1240px] mx-auto px-10 pt-16 pb-14">
          <a href="#/guias" className="group eyebrow text-[13px] text-muted hover:text-ink inline-flex items-center gap-2"><Arrow className="rotate-180 transition-transform group-hover:-translate-x-1" />Guías</a>
          <div className="eyebrow mt-8" style={{ color: s.glow }}>{s.label}{g.role ? ` · ${ROLE[g.role]}` : ''}{g.map ? ` · ${g.map}` : ''}</div>
          <h1 className="display text-6xl mt-3 max-w-[900px] animate-rise">{g.title}</h1>
          <p className="text-xl text-white/75 mt-5 max-w-[760px] animate-rise [animation-delay:100ms]">{g.summary}</p>
          <div className="mt-6 text-sm text-subtle">{g.author.name} · {g.readMinutes} min · actualizada {day(g.updatedAt)}{g.patch ? ` · revisada con el parche del ${g.patch}` : ''}</div>
        </div>
      </section>
      <div className="max-w-[1240px] mx-auto px-10 pt-10 grid grid-cols-[1fr_340px] gap-14">
        <article>
          {g.sections.map((sec, i) => (
            <Reveal key={i} className="py-7 border-b border-line">
              {sec.heading && <h2 className="display text-3xl mb-4">{sec.heading}</h2>}
              {sec.paragraphs?.map((p, k) => <p key={k} className="text-lg text-muted leading-relaxed mb-4">{p}</p>)}
              {sec.bullets && <ul className="space-y-3">{sec.bullets.map((b, k) => <li key={k} className="flex gap-4 text-lg text-muted"><span className="mt-2.5 size-2 rotate-45 shrink-0" style={{ background: s.glow }} />{b}</li>)}</ul>}
            </Reveal>
          ))}
        </article>
        <aside>
          <div className="sticky top-24 border border-line bg-surface">
            <div className="eyebrow text-subtle px-6 pt-5 pb-3">De un vistazo</div>
            <dl>
              {g.facts.map((f, i) => (
                <div key={f.label} {...spotlight} className="spotlight px-6 py-4 border-t border-line animate-rise" style={{ animationDelay: `${200 + i * 70}ms` }}>
                  <dt className="text-sm text-subtle">{f.label}</dt>
                  <dd className="font-display font-semibold uppercase text-xl mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-10 pt-20">
          <div className="eyebrow text-subtle mb-6">Más de {s.label}</div>
          <div className="grid grid-cols-3 gap-5">{related.map((r, i) => <GuideCard key={r.id} g={r} i={i} />)}</div>
        </section>
      )}
    </>
  );
}
