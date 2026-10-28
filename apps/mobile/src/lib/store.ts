// Can the player buy it with what they have? Coins come from playing, about 1,100 per match.
import type { StoreItem, Wallet } from '@eday/api-types';
import { number } from './demo';

export const COINS_PER_MATCH = 1100;

export function affordability(item: StoreItem, wallet: Wallet) {
  if (item.price.currency === 'iron') return wallet.iron >= item.price.amount ? 'Te alcanza con Hierro' : 'Solo con Hierro';
  const short = item.price.amount - wallet.coins;
  return short <= 0 ? 'Te alcanza' : `Te faltan ${number(short)} · unas ${Math.ceil(short / COINS_PER_MATCH)} partidas`;
}
