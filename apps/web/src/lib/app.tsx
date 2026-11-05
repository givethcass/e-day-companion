// Hash routing and the demo clock. Every page reads `now` and passes it as asOf, like the mobile app.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const PRESETS = [
  { at: '2026-10-27T18:00:00.000Z', label: 'mar 27 oct, 12:00', note: 'Saliste de una noche de seis horas. Ranked te espera.' },
  { at: '2026-10-28T03:30:00.000Z', label: 'mar 27 oct, 21:30', note: 'Una hora antes de Horde en español, sin micrófono.' },
  { at: '2026-10-31T02:00:00.000Z', label: 'vie 30 oct, 20:00', note: 'Una hora antes de tu sesión de Horde con el clan.' },
  { at: '2026-11-03T16:00:00.000Z', label: 'mar 3 nov, 10:00', note: 'Tienda nueva y empieza 20 Years of Gears.' },
];

interface AppState { route: string[]; go: (path: string) => void; now: string; setNow: (iso: string) => void }
const Ctx = createContext<AppState>(null!);
const read = () => (location.hash.replace(/^#\/?/, '') || 'inicio').split('/');

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(read);
  const [now, setNow] = useState(PRESETS[0].at);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const value = useMemo(() => ({ route, now, setNow, go: (p: string) => { location.hash = `/${p}`; } }), [route, now]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useApp = () => useContext(Ctx);
/** Computes data for the current clock; the simulated API is synchronous, so this is a memo. */
export function useData<T>(load: (now: string) => T, deps: unknown[] = []): T {
  const { now } = useApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => load(now), [now, ...deps]);
}
