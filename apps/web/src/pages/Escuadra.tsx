// Squad planner on desktop: Horde Siege runs three squads of four. Pick a role, see your place confirmed, deploy.
// Joining goes through the simulated API, so the app's notifications and lessons see the same squad.
import type { HordeRole, SquadSession } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { useApp, useData } from '../lib/app';
import { clock, countdown, day, DIFF, MODE, ROLE } from '../lib/format';
import { Arrow } from '../ui/bits';
import { Magnetic, Reveal, spotlight, useToast } from '../ui/fx';
import { PageHero } from '../ui/PageHero';
import { ROLE_COLOR } from '../ui/charts';

const ROLES: HordeRole[] = ['assault', 'breacher', 'marksman', 'medic'];
const ROLE_NOTE: Record<HordeRole, string> = {
  assault: 'Primera línea, abre el paso.', breacher: 'Escudo y escopeta, sella brechas.', marksman: 'Larga distancia, baja jefes.', medic: 'Levanta a la escuadra.',
};

export function Escuadra({ id }: { id: string }) {
  const { now } = useApp();
  const me = useData(() => api.me());
  const toast = useToast();
  const [s, setS] = useState<SquadSession | null>(() => { try { return api.session(id); } catch { return null; } });
  if (!s) return <div className="max-w-[1440px] mx-auto px-10 py-24 text-muted">Esta escuadra ya no existe. <a href="#/comunidad" className="text-primary hover:underline">Ver escuadras abiertas</a></div>;

  const mine = s.members.find((m) => m.gamertag === me.gamertag);
  const horde = s.mode === 'horde_siege';
  const full = s.members.length >= s.slots && !mine;
  const join = (role?: HordeRole, squad?: number) => {
    try {
      const sq = squad ?? mine?.squad;
      const next = api.join(s.id, { ...(sq ? { squad: sq } : {}), ...(role ? { role } : {}) });
      setS(next);
      const you = next.members.find((m) => m.gamertag === me.gamertag);
      toast(you?.role ? `Confirmado: escuadra ${you.squad}, ${ROLE[you.role]}` : `Pediste lugar con ${s.hostGamertag}`);
    } catch (e) { toast((e as Error).message); }
  };

  return (
    <>
      <PageHero over={`Organiza ${s.hostGamertag} · ${countdown(s.startsAt, now)}`} title={<>{MODE[s.mode]}{s.map ? <><br /><span className="text-primary">{s.map}</span></> : null}</>} tint="#6E9F7A">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-white/80">
          <span><b className="display text-3xl text-ink">{day(s.startsAt)}, {clock(s.startsAt)}</b> tu hora</span>
          {s.difficulty && <span>Dificultad <b className="text-ink">{DIFF[s.difficulty]}</b></span>}
          <span>{s.micRequired ? 'Con micrófono' : 'Sin micrófono'} · {s.language === 'es' ? 'español' : 'inglés'}</span>
          <span><b className="display text-3xl text-ink">{s.members.length}</b> de {s.slots} lugares</span>
        </div>
      </PageHero>
      <div className="max-w-[1440px] mx-auto px-10 pt-6 flex flex-col gap-12">
        <a href="#/comunidad" className="group eyebrow text-[13px] text-muted hover:text-ink inline-flex items-center gap-2 self-start"><Arrow className="rotate-180 transition-transform group-hover:-translate-x-1" />Comunidad</a>
        {horde && (
          <section>
            <div className="eyebrow text-primary mb-2">Tu rol</div>
            <h2 className="display text-4xl mb-6">{mine?.role ? `Vas de ${ROLE[mine.role]} en la escuadra ${mine.squad}` : 'Elige con qué entras'}</h2>
            <div className="grid grid-cols-4 gap-4">
              {ROLES.map((r) => {
                const on = mine?.role === r;
                return (
                  <button key={r} onClick={() => join(r)} disabled={full} aria-pressed={on} {...spotlight}
                    className={`spotlight group flex flex-col items-start text-left border p-6 transition-colors disabled:opacity-40 ${on ? 'border-primary bg-band/40' : 'border-line hover:border-white/40'}`}>
                    <span className="block h-1 w-10 mb-5 transition-[width] duration-300 group-hover:w-20" style={{ background: ROLE_COLOR[r] }} />
                    <span className="display text-3xl block">{ROLE[r]}</span>
                    <span className="text-sm text-muted block mt-1">{ROLE_NOTE[r]}</span>
                    {on && <span className="eyebrow text-[12px] text-primary block mt-4 animate-rise">Confirmado · {s.hostGamertag} ya ve tu lugar</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {horde ? (
          <section className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((n, k) => {
              const squad = s.members.filter((m) => m.squad === n);
              const missing = ROLES.filter((r) => !squad.some((m) => m.role === r));
              const yours = n === mine?.squad;
              return (
                <Reveal key={n} delay={k * 80}>
                  <div className={`border h-full ${yours ? 'border-primary' : 'border-line'} bg-surface`}>
                    <div className="flex items-center justify-between px-6 pt-5 pb-3">
                      <span className={`eyebrow ${yours ? 'text-primary' : 'text-subtle'}`}>Escuadra {n}{yours ? ' · la tuya' : ''}</span>
                      <span className="text-sm text-subtle tabular-nums">{squad.length}/4</span>
                    </div>
                    {squad.map((m) => (
                      <div key={m.gamertag} className={`flex items-center gap-4 px-6 py-3.5 border-t border-line ${m.gamertag === me.gamertag ? 'bg-band/40' : ''}`}>
                        <span className="size-9 grid place-items-center rounded-full bg-raised text-[12px] font-semibold">{m.gamertag.slice(0, 2)}</span>
                        <span className={`flex-1 font-semibold ${m.gamertag === me.gamertag ? 'text-primary' : ''}`}>{m.gamertag}</span>
                        {m.role && <span className="text-sm text-muted flex items-center gap-2"><span className="size-2" style={{ background: ROLE_COLOR[m.role] }} />{ROLE[m.role]}</span>}
                      </div>
                    ))}
                    {Array.from({ length: 4 - squad.length }, (_, i) => (
                      <button key={i} onClick={() => join(missing[i] ?? 'assault', n)} disabled={!!mine && yours}
                        className="w-full flex items-center gap-4 px-6 py-3.5 border-t border-line text-left text-subtle hover:bg-raised hover:text-ink transition-colors disabled:hover:bg-transparent disabled:hover:text-subtle disabled:cursor-default">
                        <span className="size-9 grid place-items-center rounded-full border border-dashed border-white/25">+</span>
                        <span className="flex-1">Libre · se busca {ROLE[missing[i] ?? 'assault']}</span>
                      </button>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </section>
        ) : (
          <section className="border border-line bg-surface max-w-[720px]">
            <div className="eyebrow text-subtle px-6 pt-5 pb-3">Jugadores</div>
            {s.members.map((m) => (
              <div key={m.gamertag} className="flex items-center gap-4 px-6 py-3.5 border-t border-line">
                <span className="size-9 grid place-items-center rounded-full bg-raised text-[12px] font-semibold">{m.gamertag.slice(0, 2)}</span>
                <span className={`font-semibold ${m.gamertag === me.gamertag ? 'text-primary' : ''}`}>{m.gamertag}</span>
              </div>
            ))}
          </section>
        )}
        <div className="flex items-center gap-5">
          {mine ? (
            <Magnetic>
              <button onClick={() => { api.deploy(s.id); toast('Demo: abriría E-Day con tu escuadra lista'); }}
                className="group relative overflow-hidden bg-action hover:bg-ember px-8 py-4 eyebrow text-[15px] inline-flex items-center gap-3 transition-colors">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                Desplegar<Arrow />
              </button>
            </Magnetic>
          ) : full ? <span className="eyebrow border border-line text-subtle px-6 py-3">La escuadra está llena</span> : (
            <Magnetic>
              <button onClick={() => join()} className="bg-ink text-bg hover:bg-action hover:text-ink px-8 py-4 eyebrow text-[15px] inline-flex items-center gap-3 transition-colors active:scale-95">Unirme<Arrow /></button>
            </Magnetic>
          )}
          <span className="text-sm text-subtle">{mine ? 'Desplegar abre el juego con la escuadra ya formada.' : horde ? 'Al unirte entras como Asalto; puedes cambiar de rol arriba.' : `${s.slots - s.members.length} lugares libres.`}</span>
        </div>
      </div>
    </>
  );
}
