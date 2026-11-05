// Noticias: filter pills over a card grid, and an article page with a reading progress bar.
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { day, NEWS_TAG } from '../lib/format';
import { Arrow, Art, Chip, PromoCard } from '../ui/bits';
import { Reveal, spotlight } from '../ui/fx';
import { PageHero } from '../ui/PageHero';

export function Noticias({ id }: { id?: string }) {
  return id ? <Article id={id} /> : <List />;
}

function List() {
  const [tag, setTag] = useState<string | null>(null);
  const all = useData((n) => api.news(n));
  const promo = useData(() => api.promos('news')[0]);
  const items = tag ? all.filter((n) => n.tag === tag) : all;
  const tags = Object.keys(NEWS_TAG).filter((t) => all.some((n) => n.tag === t));
  return (
    <>
      <PageHero over="Noticias" title={<>Parches, eventos<br />y <span className="text-primary">temporadas</span></>}>
        <div className="flex flex-wrap gap-2">
          <Chip active={!tag} onClick={() => setTag(null)}>Todo · {all.length}</Chip>
          {tags.map((t) => <Chip key={t} active={tag === t} onClick={() => setTag(t)}>{NEWS_TAG[t].label} · {all.filter((n) => n.tag === t).length}</Chip>)}
        </div>
      </PageHero>
      <div className="max-w-[1440px] mx-auto px-10 pt-14 grid grid-cols-3 gap-6">
        {items.map((n, i) => (
          <Reveal key={n.id} delay={(i % 3) * 70} className={i === 0 ? 'col-span-2' : ''}>
            <a href={`#/noticias/${n.id}`} {...spotlight} className="spotlight group h-full flex flex-col border border-line hover:border-white/30 hover:-translate-y-1 transition-[transform,border-color] duration-300">
              <Art glow={NEWS_TAG[n.tag].glow} className={i === 0 ? 'h-80' : 'h-44'}>
                <span className="absolute left-5 top-5 eyebrow text-[12px] bg-black/60 px-2 py-1">{NEWS_TAG[n.tag].label}</span>
              </Art>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm text-subtle">{day(n.publishedAt)} · {n.readMinutes} min de lectura</div>
                <h2 className={`font-display font-semibold uppercase leading-tight mt-2 group-hover:text-primary transition-colors ${i === 0 ? 'text-4xl' : 'text-2xl'}`}>{n.title}</h2>
                <p className="text-muted mt-3 line-clamp-3">{n.summary}</p>
                <span className="mt-auto pt-5 eyebrow text-[13px] inline-flex items-center gap-2 text-subtle group-hover:text-ink">Leer<Arrow className="transition-transform group-hover:translate-x-1" /></span>
              </div>
            </a>
          </Reveal>
        ))}
        {promo && !tag && <Reveal className="col-span-3"><PromoCard promo={promo} wide /></Reveal>}
      </div>
    </>
  );
}

function Article({ id }: { id: string }) {
  const a = useData((n) => api.article(id, n), [id]);
  const more = useData((n) => api.news(n).filter((x) => x.id !== id).slice(0, 3), [id]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const on = () => { const max = document.documentElement.scrollHeight - innerHeight; setProgress(max > 0 ? scrollY / max : 0); };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const glow = NEWS_TAG[a.tag].glow;
  return (
    <>
      <div className="fixed top-[72px] left-0 right-0 h-[3px] z-40 origin-left bg-primary" style={{ transform: `scaleX(${progress})` }} />
      <section className="relative -mt-[72px] pt-[72px] overflow-hidden grain" style={{ background: `radial-gradient(80% 120% at 80% 0%, ${glow}66, transparent 60%), linear-gradient(180deg,#1a0505,#000)` }}>
        <div className="relative max-w-[920px] mx-auto px-10 pt-16 pb-16">
          <a href="#/noticias" className="group eyebrow text-[13px] text-muted hover:text-ink inline-flex items-center gap-2"><Arrow className="rotate-180 transition-transform group-hover:-translate-x-1" />Noticias</a>
          <div className="eyebrow text-primary mt-8">{NEWS_TAG[a.tag].label} · {day(a.publishedAt)} · {a.readMinutes} min</div>
          <h1 className="display text-6xl mt-3 animate-rise">{a.title}</h1>
          <p className="text-xl text-white/75 mt-6 leading-relaxed animate-rise [animation-delay:100ms]">{a.summary}</p>
        </div>
      </section>
      <article className="max-w-[920px] mx-auto px-10 pt-6">
        {a.sections.map((s, i) => (
          <Reveal key={i} className="py-8 border-b border-line">
            {s.heading && <h2 className="display text-3xl mb-4">{s.heading}</h2>}
            {s.paragraphs?.map((p, k) => <p key={k} className="text-lg text-muted leading-relaxed mb-4">{p}</p>)}
            {s.bullets && (
              <ul className="space-y-3">
                {s.bullets.map((b, k) => <li key={k} className="flex gap-4 text-lg text-muted leading-relaxed"><span className="mt-2.5 size-2 rotate-45 bg-primary shrink-0" />{b}</li>)}
              </ul>
            )}
          </Reveal>
        ))}
      </article>
      <section className="max-w-[1440px] mx-auto px-10 pt-20">
        <div className="eyebrow text-subtle mb-6">Sigue leyendo</div>
        <div className="grid grid-cols-3 gap-6">
          {more.map((n) => (
            <a key={n.id} href={`#/noticias/${n.id}`} {...spotlight} className="spotlight group border border-line p-6 hover:border-white/30 transition-colors">
              <div className="eyebrow text-[12px] text-primary">{NEWS_TAG[n.tag].label}</div>
              <div className="font-display font-semibold uppercase text-xl leading-tight mt-2 group-hover:text-primary transition-colors">{n.title}</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
