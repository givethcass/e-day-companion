// A store item card used on Inicio and in Tienda: tilts under the cursor, opens the item, and the heart saves it to
// the wishlist through the simulated API, so the app and the notifications see the same list.
import type { StoreItem } from '@eday/api-types';
import { useState } from 'react';
import { api } from '../lib/api';
import { num, STORE_TYPE } from '../lib/format';
import { Art } from './bits';
import { useTilt, useToast } from './fx';

export const STORE_GLOWS = ['#D9A93B', '#7AA0BE', '#E50F11', '#3FA7A0', '#E5730F', '#8E8E8E'];

export function Price({ item, className = '' }: { item: StoreItem; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${className}`}>
      <span className={`size-2.5 rotate-45 ${item.price.currency === 'iron' ? 'bg-silver' : 'bg-gold'}`} />
      {num(item.price.amount)} {item.price.currency === 'iron' ? 'Hierro' : 'Monedas'}
    </span>
  );
}

export function WishButton({ item, onChange, className = '' }: { item: StoreItem; onChange?: (on: boolean) => void; className?: string }) {
  const toast = useToast();
  const [wish, setWish] = useState(!!item.wishlisted);
  const flip = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    api.wish(item.id, !wish);
    setWish(!wish); onChange?.(!wish);
    toast(wish ? 'Quitado de tu lista de deseos' : 'Agregado a tu lista de deseos');
  };
  return (
    <button onClick={flip} aria-pressed={wish} aria-label={`${wish ? 'Quitar' : 'Agregar'} ${item.name} ${wish ? 'de' : 'a'} tu lista de deseos`}
      className={`size-9 grid place-items-center bg-black/60 hover:bg-black transition-colors active:scale-90 ${className}`}>
      <svg viewBox="0 0 24 24" className={`size-5 transition-transform ${wish ? 'scale-110 text-primary' : ''}`} fill={wish ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
    </button>
  );
}

export function StoreCard({ item, i, note, tall = false }: { item: StoreItem; i: number; note?: string; tall?: boolean }) {
  const tilt = useTilt(10);
  return (
    <a href={`#/tienda/${item.id}`} ref={tilt.ref as never} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={tilt.style}
      className="spotlight group block border border-line bg-surface hover:border-white/30 focus-visible:outline-2 focus-visible:outline-primary">
      <Art glow={STORE_GLOWS[i % STORE_GLOWS.length]} className={tall ? 'h-64' : 'h-48'}>
        <WishButton item={item} className="absolute right-3 top-3" />
      </Art>
      <div className="p-4">
        <div className="text-xs text-subtle">{STORE_TYPE[item.type]}</div>
        <div className="font-display font-semibold uppercase text-lg leading-tight mt-0.5 group-hover:text-primary transition-colors">{item.name}</div>
        <Price item={item} className="mt-3" />
        {note && <div className="text-sm text-subtle mt-1">{note}</div>}
      </div>
    </a>
  );
}
