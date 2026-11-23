// Tu campaña on desktop: the three acts side by side, every chapter with its three collectibles, the missing ones
// with where to find them, so the page reads as what is left to do.
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { day, num } from '../lib/format';
import { MoreLink, Stat } from '../ui/bits';
import { Reveal } from '../ui/fx';

const GOLD = '#C98500';

export function Campana() {
  const c = useData((n) => api.campaign(n));
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-[1fr_auto] gap-10 items-end">
        <div className="grid grid-cols-4 gap-8">
          <Stat label="Capítulos">{c.chaptersCompleted}/{c.chaptersTotal}</Stat>
          <Stat label="Coleccionables" tone="primary">{c.collectiblesFound}/{c.collectiblesTotal}</Stat>
          <Stat label="Horas">{c.hoursPlayed}</Stat>
          <Stat label="Bajas">{num(c.kills)}</Stat>
        </div>
        <div className="flex gap-6"><MoreLink href="#/guias/g_collect_1">Coleccionables 1 a 6</MoreLink><MoreLink href="#/guias/g_collect_2">7 a 12</MoreLink></div>
      </div>
      {c.next && (
        <div className="border border-line border-l-4 border-l-primary bg-surface p-7">
          <div className="eyebrow text-primary">Lo siguiente</div>
          <p className="mt-2 text-lg">{c.next.text}</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6 items-start">
        {c.acts.map((a, ai) => (
          <Reveal key={a.name} delay={ai * 80}>
            <div className="eyebrow text-muted mb-4">{a.name}</div>
            <div className="flex flex-col gap-4">
              {a.chapters.map((ch) => {
                const locked = ch.status === 'locked';
                const next = c.next?.chapter === ch.n;
                return (
                  <div key={ch.n} className={`border p-6 flex flex-col gap-3 ${next ? 'border-primary bg-surface' : 'border-line'} ${locked ? 'opacity-50' : ''}`}>
                    <div className="flex items-baseline gap-4">
                      <span className={`display text-4xl ${ch.status === 'available' ? 'text-primary' : locked ? 'text-subtle' : ''}`}>{String(ch.n).padStart(2, '0')}</span>
                      <span className="flex-1">
                        <span className="display text-2xl block">{ch.name}</span>
                        <span className="text-sm text-subtle">{ch.setting} · {ch.completedAt ? day(ch.completedAt) : ch.status === 'available' ? 'Disponible' : 'Bloqueado'}</span>
                      </span>
                    </div>
                    {!locked && (
                      <ul className="flex flex-col gap-2 border-t border-line pt-3">
                        {ch.collectibles.map((x) => (
                          <li key={x.id} className="flex gap-3 text-sm">
                            <span className="mt-1.5 size-2.5 rotate-45 shrink-0 border" style={{ borderColor: x.found ? GOLD : 'var(--color-subtle)', background: x.found ? GOLD : 'transparent' }} />
                            <span>
                              <span className={x.found ? 'text-muted' : 'font-semibold'}>{x.name}</span>
                              {!x.found && <span className="block text-subtle">{x.where}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!locked && <div className="text-xs text-subtle">{ch.attempts} {ch.attempts === 1 ? 'intento' : 'intentos'}{ch.bestKills !== null ? ` · mejor partida ${ch.bestKills} bajas` : ''} · unos {ch.minutes} min</div>}
                  </div>
                );
              })}
            </div>
          </Reveal>
        ))}
      </div>
      <p className="text-sm text-subtle">Capítulos y coleccionables inventados para la demo. Qué coleccionable encuentras en cada partida es una estimación; el juego lo registraría exacto.</p>
    </div>
  );
}
