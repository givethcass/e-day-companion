// The demo clock. Every screen reads "now" from here and passes it to the API as asOf, so the demo can jump
// from Tuesday to Friday on stage and the whole app follows (ADR 0003).
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEMO_NOW } from './demo';

/** Moments that tell the story, in order. */
export const CLOCK_PRESETS = [
  { at: DEMO_NOW, note: '15 días sin jugar. Ranked ya abrió y no tienes rango.' },
  { at: '2026-10-28T03:30:00.000Z', note: 'Una hora antes de Horde en español, sin micrófono.' },
  { at: '2026-10-31T02:00:00.000Z', note: 'Una hora antes de tu sesión de Horde con el clan.' },
  { at: '2026-11-03T16:00:00.000Z', note: 'Tienda nueva y empieza el evento 20 Years of Gears.' },
];

interface Clock { now: string; setNow: (iso: string) => void }

const ClockContext = createContext<Clock>({ now: DEMO_NOW, setNow: () => {} });

export function ClockProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(DEMO_NOW);
  const value = useMemo(() => ({ now, setNow }), [now]);
  return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>;
}

export const useClock = () => useContext(ClockContext);
export const useNow = () => useContext(ClockContext).now;
