// Can the player buy it with what they have? Coins come from playing, about 1,100 per match.
import type { StoreItem, Wallet } from '@eday/api-types';
import { number } from './demo';

export const COINS_PER_MATCH = 1100;

export function affordability(item: StoreItem, wallet: Wallet) {
  if (item.price.currency === 'iron') return wallet.iron >= item.price.amount ? 'Te alcanza con Hierro' : 'Solo con Hierro';
  const short = item.price.amount - wallet.coins;
  if (short <= 0) return 'Te alcanza';
  const n = Math.ceil(short / COINS_PER_MATCH);
  return `Te faltan ${number(short)} · ${n === 1 ? 'una partida' : `unas ${n} partidas`}`;
}
