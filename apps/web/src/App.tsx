// Desktop shell: sticky nav with a sliding underline, the demo clock, notifications, and the five sections.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { api } from './lib/api';
import { AppProvider, PRESETS, useApp, useData } from './lib/app';
import { dayTime, rankLabel } from './lib/format';
import { ToastProvider } from './ui/fx';
import { Comunidad } from './pages/Comunidad';
import { Guias } from './pages/Guias';
import { Inicio } from './pages/Inicio';
import { Noticias } from './pages/Noticias';
import { Servicio } from './pages/Servicio';

const TABS = [['inicio', 'Inicio'], ['noticias', 'Noticias'], ['guias', 'Guías'], ['servicio', 'Mi servicio'], ['comunidad', 'Comunidad']] as const;

export function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AppProvider>
  );
}

function Shell() {
  const { route } = useApp();
  const page = route[0];
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] bg-ink text-bg px-3 py-2">Saltar al contenido</a>
      <Nav />
      <main id="main" key={route.join('/')} className="flex-1 animate-rise">
        {page === 'noticias' ? <Noticias id={route[1]} />
          : page === 'guias' ? <Guias id={route[1]} />
          : page === 'servicio' ? <Servicio sub={route[1]} />
          : page === 'comunidad' ? <Comunidad />
          : <Inicio />}
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  const { route, now, setNow } = useApp();
  const me = useData(() => api.me());
  const notes = useData((n) => api.notifications(n));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [bar, setBar] = useState({ left: 0, width: 0 });
  const active = TABS.some(([k]) => k === route[0]) ? route[0] : 'inicio';

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useLayoutEffect(() => {
    const place = () => { const a = links.current[active]; if (a) setBar({ left: a.offsetLeft, width: a.offsetWidth }); };
    place();
    document.fonts?.ready.then(place);
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);
  useEffect(() => { setOpen(false); }, [route, now]);

  const unread = notes.filter((n) => !n.read).length;
  return (
    <header className={`sticky top-0 z-50 transition-[background,backdrop-filter,border-color] duration-300 border-b ${scrolled ? 'bg-black/85 backdrop-blur-md border-line' : 'bg-gradient-to-b from-black/80 to-transparent border-transparent'}`}>
      <div className="max-w-[1440px] mx-auto px-10 h-[72px] flex items-center gap-8">
        <a href="#/inicio" className="group flex items-center gap-3 shrink-0" aria-label="E-Day Companion, inicio">
          <span className="relative size-8 rotate-45 border-2 border-primary transition-transform duration-500 group-hover:rotate-[225deg]"><span className="absolute inset-[5px] bg-primary" /></span>
          <span className="display text-xl tracking-[0.08em]">E-Day <span className="text-primary">Companion</span></span>
        </a>
        <nav className="relative flex items-center gap-1 h-full" aria-label="Secciones">
          {TABS.map(([k, label]) => (
            <a key={k} ref={(el) => { links.current[k] = el; }} href={`#/${k}`} aria-current={k === active ? 'page' : undefined}
              className={`eyebrow text-[14px] px-3.5 h-full flex items-center whitespace-nowrap transition-colors ${k === active ? 'text-ink' : 'text-muted hover:text-ink'}`}>{label}</a>
          ))}
          <span className="absolute bottom-0 h-[3px] bg-primary transition-all duration-500 ease-[cubic-bezier(.2,.7,.2,1)]" style={{ left: bar.left, width: bar.width }} />
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <label className="flex items-center gap-2 text-subtle">
            <span className="eyebrow text-[11px] whitespace-nowrap max-[1400px]:hidden">Momento de la demo</span>
            <select value={now} onChange={(e) => setNow(e.target.value)} className="bg-surface border border-line text-ink text-sm px-3 py-2 hover:border-white/40 focus:border-primary outline-none cursor-pointer">
              {PRESETS.map((p) => <option key={p.at} value={p.at}>{p.label}</option>)}
            </select>
          </label>
          <div className="relative">
            <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Notificaciones, ${unread} sin leer`}
              className="relative size-10 grid place-items-center border border-line hover:border-white/40 transition-colors active:scale-95">
              <svg viewBox="0 0 24 24" className={`size-5 ${unread ? 'origin-top animate-[wiggle_2.4s_ease-in-out_infinite]' : ''}`} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 20a2 2 0 0 0 4 0" /></svg>
              {unread > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 grid place-items-center bg-action text-[11px] font-semibold animate-pulse-dot rounded-full">{unread}</span>}
            </button>
            {open && (
              <div className="absolute right-0 top-12 w-96 bg-surface border border-line shadow-[0_20px_60px_rgb(0_0_0/0.7)] animate-rise">
                <div className="eyebrow text-subtle px-5 pt-4 pb-2">Notificaciones · {dayTime(now)}</div>
                {notes.length === 0 && <p className="px-5 pb-5 text-muted">Nada nuevo por ahora.</p>}
                {notes.map((n) => (
                  <a key={n.id} href={`#${n.link ?? '/inicio'}`} className="block px-5 py-3 border-t border-line hover:bg-raised transition-colors">
                    <div className="flex items-center gap-2 font-semibold">{!n.read && <span className="size-1.5 bg-primary rounded-full" />}{n.title}</div>
                    <div className="text-sm text-muted mt-0.5">{n.body}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="#/servicio" className="group flex items-center gap-3 pl-4 border-l border-line">
            <span className="size-10 grid place-items-center bg-band display text-lg transition-transform group-hover:scale-105">DR</span>
            <span className="leading-tight">
              <span className="block font-semibold whitespace-nowrap">{me.gamertag}</span>
              <span className="block text-xs text-subtle whitespace-nowrap">Nivel {me.level} · {rankLabel(me.rank)}</span>
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-[1440px] mx-auto px-10 py-10 flex items-center justify-between gap-8 text-sm text-subtle">
        <span className="display text-lg text-muted">E-Day <span className="text-primary">Companion</span></span>
        <span>Concepto no oficial con datos simulados. No afiliado a Microsoft ni a The Coalition.</span>
        <span>Proyecto de portafolio · 2026</span>
      </div>
    </footer>
  );
}
