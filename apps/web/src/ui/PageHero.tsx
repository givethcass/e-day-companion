// The red header every section opens with: a distant ruined skyline, embers and ash behind the title.
import type { ReactNode } from 'react';
import { BandBackdrop } from './Backdrop';
import { HeroScene } from './HeroScene';

export function PageHero({ over, title, children, tint }: { over: string; title: ReactNode; children?: ReactNode; tint?: string }) {
  return (
    <section className="relative -mt-[72px] pt-[72px] band grain overflow-hidden">
      <BandBackdrop />
      <HeroScene variant="embers" tint={tint} />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
      <div className="relative max-w-[1440px] mx-auto px-10 pt-16 pb-14">
        <div className="eyebrow text-white/70 mb-4 flex items-center gap-3 animate-rise"><span className="h-px w-10 bg-primary" />{over}</div>
        <h1 className="display text-[clamp(48px,6vw,88px)] animate-rise [animation-delay:80ms]">{title}</h1>
        {children && <div className="mt-6 animate-rise [animation-delay:160ms]">{children}</div>}
      </div>
    </section>
  );
}
