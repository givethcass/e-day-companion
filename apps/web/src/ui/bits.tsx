// Shared pieces of the desktop site: medal art, headings, chips, cards and the partner slot.
import type { Medal, MedalTier, Promo } from '@eday/api-types';
import type { ReactNode } from 'react';
import { TIER } from '../lib/format';
import { spotlight, useToast } from './fx';

/** Same drawing as the mobile badge: a faceted diamond in the tier colour, outlined when locked. */
export function MedalBadge({ tier, size = 40, className = '' }: { tier: MedalTier | null; size?: number; className?: string }) {
  const fill = tier ? TIER[tier].color : '#0E0E0E';
  const edge = !tier ? '#3A3A3A' : tier === 'onyx' ? '#F0473A' : 'rgba(0,0,0,0.35)';
  const mark = !tier ? '#3A3A3A' : tier === 'onyx' ? '#F0473A' : 'rgba(0,0,0,0.55)';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} role="img" aria-label={tier ? `Medalla ${TIER[tier].label}` : 'Medalla bloqueada'}>
      <polygon points="20,2 38,20 20,38 2,20" fill={fill} stroke={edge} strokeWidth={1.5} />
      <polygon points="20,9 31,20 20,31 9,20" fill="none" stroke={mark} strokeWidth={1.5} />
      <path d="M14.5 22.5L20 17l5.5 5.5" fill="none" stroke={mark} strokeWidth={2} strokeLinecap="square" />
    </svg>
  );
}
export const earned = (m: Medal) => m.tiers.filter((t) => t.unlockedAt).length;
export const topTier = (m: Medal) => [...m.tiers].reverse().find((t) => t.unlockedAt) ?? null;
export const nextTier = (m: Medal) => m.tiers.find((t) => !t.unlockedAt) ?? null;

export function TierPips({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-[3px]" aria-label={`${count} de 5 niveles`}>
      {Array.from({ length: 5 }, (_, i) => <span key={i} className={`size-2 ${i < count ? 'bg-primary' : 'bg-white/15'}`} />)}
    </span>
  );
}

export function SectionHead({ over, title, action }: { over?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8">
      <div>
        {over && <div className="eyebrow text-primary mb-2">{over}</div>}
        <h2 className="display text-4xl xl:text-5xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Arrow({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={`size-4 ${className}`} fill="none" stroke="currentColor" strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

/** Link that slides its arrow on hover. */
export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group eyebrow text-muted hover:text-ink inline-flex items-center gap-2 transition-colors">
      {children}<Arrow className="transition-transform group-hover:translate-x-1" />
    </a>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`eyebrow px-4 py-2 border transition-all duration-200 active:scale-95 ${active ? 'bg-ink text-bg border-ink' : 'border-line text-muted hover:border-white/50 hover:text-ink'}`}>
      {children}
    </button>
  );
}

/** A solid block of colour with a diagonal stripe and a glow, standing in for key art. */
export function Art({ glow, className = '', children }: { glow: string; className?: string; children?: ReactNode }) {
  return (
    <div className={`relative overflow-hidden grain ${className}`} style={{ background: `radial-gradient(120% 90% at 85% 10%, ${glow}55, transparent 60%), linear-gradient(135deg, #141414, #050505)` }}>
      <div className="absolute inset-0 opacity-30" style={{ background: `repeating-linear-gradient(115deg, transparent 0 22px, ${glow}22 22px 24px)` }} />
      <div className="absolute -right-10 -bottom-16 size-56 rotate-45 border-[10px] opacity-40 transition-transform duration-700 group-hover:rotate-[60deg] group-hover:scale-110" style={{ borderColor: glow }} />
      {children}
    </div>
  );
}

/** The partner slot, marked as such: dashed edge, "Patrocinado" or "Colaboración", invented brand. */
export function PromoCard({ promo, wide = false }: { promo: Promo; wide?: boolean }) {
  const toast = useToast();
  const label = promo.kind === 'sponsored' ? 'Patrocinado' : 'Colaboración';
  return (
    <article {...spotlight} aria-label={`${label}: ${promo.partner}`}
      className={`spotlight group relative border border-dashed border-white/25 hover:border-white/50 transition-colors overflow-hidden ${wide ? 'grid grid-cols-[1.1fr_1fr]' : ''}`}>
      <Art glow={promo.glow ?? '#E50F11'} className={wide ? 'min-h-56' : 'h-40'}>
        <div className="absolute left-6 bottom-5 display text-3xl text-white/90">{promo.partner}</div>
      </Art>
      <div className="p-6 flex flex-col gap-3">
        <div className="eyebrow text-subtle flex items-center gap-2"><span className="px-1.5 py-0.5 border border-white/25 text-[11px]">{label}</span>{promo.partner}</div>
        <h3 className="display text-2xl">{promo.title}</h3>
        <p className="text-muted leading-relaxed">{promo.body}</p>
        <button onClick={() => toast(`Demo: aquí se abriría ${promo.partner}`)} className="mt-auto self-start eyebrow border border-white/40 px-4 py-2 hover:bg-ink hover:text-bg transition-colors inline-flex items-center gap-2">
          {promo.cta.label}<Arrow />
        </button>
      </div>
    </article>
  );
}

export function Stat({ label, children, tone }: { label: string; children: ReactNode; tone?: 'primary' }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="eyebrow text-subtle">{label}</div>
      <div className={`display text-4xl ${tone === 'primary' ? 'text-primary' : ''}`}>{children}</div>
    </div>
  );
}
