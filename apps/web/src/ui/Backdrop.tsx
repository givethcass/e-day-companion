// Painted backdrops built from the original SVG art in src/art: a fallen city in three depths that drift with the cursor,
// haze between them, light rising from a fissure and a crack texture over everything.
import { useEffect, useRef } from 'react';
import cracks from '../art/tex-cracks.svg';
import dust from '../art/tex-dust.svg';
import far from '../art/ruins-far.svg';
import mid from '../art/ruins-mid.svg';
import near from '../art/ruins-near.svg';
import { reducedMotion } from './fx';

/** Writes --px / --py (-1..1, eased) on the element so CSS layers can shift by depth. */
function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      m.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      m.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      m.x += (m.tx - m.x) * 0.06;
      m.y += (m.ty - m.y) * 0.06;
      el.style.setProperty('--px', m.x.toFixed(4));
      el.style.setProperty('--py', m.y.toFixed(4));
    };
    window.addEventListener('pointermove', onMove);
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); };
  }, []);
  return ref;
}

const layer = (depth: number) => ({ transform: `translate3d(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth * 0.4}px), 0)` });

/** Full hero: sky, three ruin layers, fissure light. `fissureAt` is the light's left position in %. */
export function HeroBackdrop({ fissureAt = 72 }: { fissureAt?: number }) {
  const ref = useParallax<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky: crimson overcast, brighter low on the horizon where the city burns. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a0000_0%,#5c0303_38%,#9a0c08_62%,#3a0202_80%,#000_100%)]" />
      <div className="absolute inset-0 opacity-50 mix-blend-screen animate-drift" style={{ backgroundImage: `url(${dust})`, backgroundSize: '900px' }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(42% 40% at ${fissureAt}% 72%, rgb(255 110 40 / 0.5), transparent 70%)` }} />
      {/* Light shafts out of the fissure. */}
      <div className="absolute bottom-[27%] h-[80%] w-[46%] -translate-x-1/2 animate-flicker origin-bottom" style={{ left: `${fissureAt}%`, background: 'conic-gradient(from 180deg at 50% 100%, transparent 0 158deg, rgb(255 120 50 / 0.4) 166deg, transparent 172deg, rgb(255 150 80 / 0.3) 178deg, transparent 184deg, rgb(255 100 40 / 0.36) 192deg, transparent 200deg 360deg)', filter: 'blur(5px)', mixBlendMode: 'screen' }} />
      <img src={far} alt="" className="absolute -inset-x-10 bottom-[30%] w-[calc(100%+80px)] h-[58%] object-cover object-bottom opacity-90" style={{ ...layer(10), filter: 'blur(1.2px)' }} />
      <div className="absolute inset-x-0 bottom-[26%] h-[40%] bg-gradient-to-t from-[#3a0303]/90 via-[#6a0606]/30 to-transparent" />
      <img src={mid} alt="" className="absolute -inset-x-16 bottom-[26%] w-[calc(100%+128px)] h-[42%] object-cover object-bottom" style={layer(22)} />
      {/* The fissure itself, glowing on the ground. */}
      <div className="absolute bottom-[24.5%] h-12 w-[34%] -translate-x-1/2 rounded-[50%] animate-flicker" style={{ left: `${fissureAt}%`, background: 'radial-gradient(50% 50% at 50% 50%, #ffd8b0 0%, #ff7a32 25%, rgb(229 15 17 / 0.6) 55%, transparent 75%)', filter: 'blur(4px)' }} />
      <img src={near} alt="" className="absolute -inset-x-24 bottom-[18%] w-[calc(100%+192px)] h-[22%] object-cover object-bottom" style={layer(40)} />
      <div className="absolute inset-x-0 bottom-0 h-[19%] bg-[#050101]" />
      <div className="absolute inset-0 opacity-[0.18] mix-blend-multiply" style={{ backgroundImage: `url(${cracks})`, backgroundSize: '520px' }} />
    </div>
  );
}

/** Lighter version for section headers: distant skyline, haze and cracks only. */
export function BandBackdrop() {
  const ref = useParallax<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <img src={far} alt="" className="absolute -inset-x-10 bottom-0 w-[calc(100%+80px)] h-[85%] object-cover object-bottom opacity-60" style={{ ...layer(12), filter: 'blur(1px)' }} />
      <div className="absolute inset-0 opacity-40 mix-blend-screen animate-drift" style={{ backgroundImage: `url(${dust})`, backgroundSize: '900px' }} />
      <div className="absolute inset-0 opacity-[0.16] mix-blend-multiply" style={{ backgroundImage: `url(${cracks})`, backgroundSize: '520px' }} />
    </div>
  );
}
