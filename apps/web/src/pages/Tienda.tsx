// Tienda on desktop: the balance and weekly cap first, then the rotation, and one item at a time when picked.
// The site never sells anything; every button that would buy opens the store inside the game.
import { useState } from 'react';
import { api } from '../lib/api';
import { useApp, useData } from '../lib/app';
import { affordability, countdown, day, dayTime, num, STORE_TYPE } from '../lib/format';
import { Arrow, Art } from '../ui/bits';
import { Bar, CountUp, Magnetic, Reveal, useToast } from '../ui/fx';
import { PageHero } from '../ui/PageHero';
import { Price, STORE_GLOWS, StoreCard, WishButton } from '../ui/StoreCard';

export function Tienda({ id }: { id?: string }) {
  const { now } = useApp();
  const [version, setVersion] = useState(0);
  const store = useData((n) => api.store(n), [version]);
  const wallet = useData((n) => api.wallet(n));
  const wishlist = useData(() => api.wishlist(), [version]);
  const index = store.items.findIndex((x) => x.id === id);
  const item = index >= 0 ? store.items[index] : wishlist.find((x) => x.id === id);
  const capShare = wallet.coinsThisWeek / Math.max(1, wallet.coinsWeeklyCap);

  return (
    <>
      <PageHero over={`Tienda · rota ${countdown(store.endsAt, now)}`} title={<>Lo que hay<br /><span className="text-primary">esta semana</span></>} tint="#D9A93B">
        <div className="flex items-end gap-12 text-white/80">
          <span><b className="display text-4xl text-ink"><CountUp value={wallet.coins} /></b> Monedas</span>
          <span><b className="display text-4xl text-ink"><CountUp value={wallet.iron} /></b> Hierro</span>
          <span className="w-72">
            <span className="flex justify-between text-sm mb-2"><span>Tope semanal</span><span className="tabular-nums">{num(wallet.coinsThisWeek)} / {num(wallet.coinsWeeklyCap)}</span></span>
            <Bar value={capShare} color="var(--color-gold)" className="h-1.5" />
            <span className="block text-xs text-white/60 mt-2">Se reinicia el {day(wallet.capResetsAt)}</span>
          </span>
        </div>
      </PageHero>
      <div className="max-w-[1440px] mx-auto px-10 pt-14 flex flex-col gap-16">
        {id && (item ? <Detail key={item.id} item={item} glow={STORE_GLOWS[Math.max(0, index) % STORE_GLOWS.length]} onSale={index >= 0}
          note={affordability(item, wallet)} leaves={dayTime(store.endsAt)} onChange={() => setVersion((v) => v + 1)} />
          : <p className="text-muted border border-line p-8">Este objeto no está en la tienda esta semana. <a href="#/tienda" className="text-primary hover:underline">Ver la rotación</a></p>)}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow text-primary mb-2">Rotación actual · {store.items.length} objetos</div>
              <h2 className="display text-4xl xl:text-5xl">{id ? 'Más de esta semana' : 'Toda la rotación'}</h2>
            </div>
            <span className="text-sm text-subtle">Hasta el {dayTime(store.endsAt)}</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {store.items.filter((x) => x.id !== id).map((it, i) => (
              <Reveal key={`${it.id}-${version}`} delay={i * 60}>
                <StoreCard item={it} i={store.items.indexOf(it)} tall note={affordability(it, wallet)} />
              </Reveal>
            ))}
          </div>
        </section>
        <p className="text-sm text-subtle">La app no vende nada: cada objeto se compra dentro del juego. Las Monedas se ganan jugando, unas {num(1100)} por partida.</p>
      </div>
    </>
  );
}

function Detail({ item, glow, onSale, note, leaves, onChange }: {
  item: ReturnType<typeof api.store>['items'][number]; glow: string; onSale: boolean; note: string; leaves: string; onChange: () => void;
}) {
  const toast = useToast();
  const short = note.startsWith('Te faltan') || note === 'Solo con Hierro';
  return (
    <section className="grid grid-cols-[1.2fr_1fr] border border-line bg-surface animate-rise">
      <Art glow={glow} className="min-h-[420px]">
        <WishButton item={item} onChange={onChange} className="absolute right-5 top-5 size-11" />
        <div className="absolute left-8 bottom-7 eyebrow text-white/70">{STORE_TYPE[item.type]}</div>
      </Art>
      <div className="p-10 flex flex-col gap-6">
        <a href="#/tienda" className="group eyebrow text-[13px] text-muted hover:text-ink inline-flex items-center gap-2 self-start"><Arrow className="rotate-180 transition-transform group-hover:-translate-x-1" />Tienda</a>
        <div>
          <div className="eyebrow text-primary">{onSale ? `Se va el ${leaves}` : 'No está en la tienda esta semana'}</div>
          <h1 className="display text-6xl mt-2">{item.name}</h1>
        </div>
        <div className="border-y border-line py-6 flex items-center justify-between gap-6">
          <Price item={item} className="display text-4xl" />
          <span className={`eyebrow text-[13px] px-3 py-1.5 border ${short ? 'border-line text-muted' : 'border-primary text-primary'}`}>{note}</span>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <Magnetic className="self-start">
            <button onClick={() => toast('Demo: abriría la tienda dentro de E-Day')}
              className="group relative overflow-hidden bg-action hover:bg-ember px-8 py-4 eyebrow text-[15px] inline-flex items-center gap-3 transition-colors">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              Ver en la tienda del juego<Arrow />
            </button>
          </Magnetic>
          <p className="text-sm text-subtle">La app no vende nada: el botón abre la tienda dentro del juego.</p>
        </div>
      </div>
    </section>
  );
}
