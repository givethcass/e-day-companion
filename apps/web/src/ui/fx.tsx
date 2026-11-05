// Micro-interactions for the desktop site: reveal on scroll, count-up numbers, magnetic buttons,
// cursor spotlight, 3D tilt and a toast. All of them stand still when the visitor prefers reduced motion.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * True once the element has been on screen. Checks its box on scroll, resize and a slow timer instead of using
 * IntersectionObserver, which misreports inside the demo's scaled iframe.
 */
export function useSeen<T extends HTMLElement>(margin = 0) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    const check = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight - margin && (r.width > 0 || r.height > 0)) setSeen(true);
    };
    check();
    const id = setInterval(check, 300);
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    return () => { clearInterval(id); removeEventListener('scroll', check); removeEventListener('resize', check); };
  }, [seen, margin]);
  return [ref, seen] as const;
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: ElementType }) {
  const [ref, shown] = useSeen<HTMLElement>(40);
  return (
    <Tag ref={ref} className={`${className} transition-[opacity,translate] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Counts from 0 to `value` when it appears, and from the old value when it changes. */
export function CountUp({ value, decimals = 0, suffix = '', duration = 1100 }: { value: number; decimals?: number; suffix?: string; duration?: number }) {
  const [ref, visible] = useSeen<HTMLSpanElement>();
  const from = useRef(0);
  const [shown, setShown] = useState(from.current);
  useEffect(() => {
    if (!visible) return;
    const target = value;
    const a = from.current;
    const done = () => { setShown(target); from.current = target; };
    if (reducedMotion() || a === target) { done(); return; }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const k = Math.min(1, Math.max(0, (performance.now() - start) / duration));
      setShown(a + (target - a) * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    // If frames are throttled (a hidden tab or frame), land on the real number anyway.
    const safety = setTimeout(done, duration + 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); from.current = target; };
  }, [value, visible, duration]);
  const text = shown.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref} className="tabular-nums">{text}{suffix}</span>;
}

/** Leans toward the cursor a few pixels while hovered. */
export function Magnetic({ children, strength = 0.25, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };
  return <span ref={ref} onMouseMove={move} onMouseLeave={leave} className={`inline-block transition-transform duration-300 ease-out ${className}`}>{children}</span>;
}

/** Mouse handlers that feed the .spotlight gradient. */
export const spotlight = {
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
  },
};

/** Tilts a card in 3D under the cursor. */
export function useTilt(max = 8) {
  const ref = useRef<HTMLElement>(null);
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    spotlight.onMouseMove(e);
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`;
  }, [max]);
  const onMouseLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ''; }, []);
  return { ref, onMouseMove, onMouseLeave, style: { transition: 'transform .35s cubic-bezier(.2,.7,.2,1)', transformStyle: 'preserve-3d' } as CSSProperties };
}

/** A thin bar that grows to `value` (0..1) when it appears. */
export function Bar({ value, color = 'var(--color-primary)', className = 'h-1', delay = 0 }: { value: number; color?: string; className?: string; delay?: number }) {
  const [ref, on] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={`bg-white/10 overflow-hidden ${className}`}>
      <div className="h-full origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)]" style={{ background: color, transform: `scaleX(${on ? Math.min(1, value) : 0})`, transitionDelay: `${delay}ms` }} />
    </div>
  );
}

const ToastCtx = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, text }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="animate-rise bg-ink text-bg font-display font-semibold uppercase tracking-wider px-5 py-3 shadow-[0_10px_40px_rgb(0_0_0/0.6)] flex items-center gap-3">
            <span className="size-2 bg-action" />{t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
