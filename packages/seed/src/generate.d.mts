// Types for the seed output. Records mirror the contract schemas plus a few internal fields.
type Mode = 'versus_tdm' | 'versus_conquest' | 'versus_ranked' | 'horde_siege' | 'campaign';
type Role = 'assault' | 'breacher' | 'marksman' | 'medic';
type Iso = string;

export interface SeedRank { tier: string; division: number; points: number }
export interface SeedPlayer {
  id: string; gamertag: string; platform: 'xbox' | 'pc'; country: string; timezone: string;
  accessType: 'purchase' | 'game_pass' | 'game_pass_premium_upgrade'; level: number;
  rankStartPoints?: number; rank: SeedRank | null; clanId: string | null;
}
export interface SeedMatch {
  id: string; playerId: string; mode: Mode; map: string; endedAt: Iso; durationSeconds: number; accuracy: number;
  medals: string[]; rankDelta: number | null; wavesCleared: number | null;
  result: 'win' | 'loss' | 'draw' | 'completed' | 'failed'; kills: number; deaths: number;
}
export interface SeedClan { id: string; name: string; tag: string; language: string; memberCount: number; leaderId: string | null }
export interface SeedChallenge { id: string; key: string; weekStart: Iso; title: string; mode: Mode | null; goal: number; reward: string; expiresAt: Iso }
export interface SeedStoreItem { id: string; name: string; type: 'character_skin' | 'weapon_skin' | 'banner' | 'emblem' | 'bundle'; price: { amount: number; currency: 'iron' | 'coins' }; imageUrl: string }
export interface SeedRotation { id: string; startsAt: Iso; endsAt: Iso; itemIds: string[] }
export interface SeedMember { gamertag: string; squad?: number; role?: Role; confirmed?: boolean }
export interface SeedSession {
  id: string; hostGamertag: string; mode: Mode; startsAt: Iso; slots: number; language?: string; micRequired: boolean;
  difficulty?: 'casual' | 'normal' | 'hard' | 'insane'; map?: string; clanId?: string | null;
  status: 'open' | 'full' | 'in_progress' | 'finished'; shareUrl?: string; members: SeedMember[];
}
export interface SeedWallet { playerId: string; coins: number; iron: number; coinsThisWeek: number; coinsWeeklyCap: number; capResetsAt: Iso }
export interface SeedEvent { id: string; name: string; startsAt: Iso; endsAt: Iso; modes: Mode[]; rewards: string[] }

export interface SeedData {
  meta: { seed: number; demoNow: Iso; disclaimer: string };
  season: { id: string; number: number; name: string; startsAt: Iso; endsAt: Iso };
  events: SeedEvent[];
  players: SeedPlayer[];
  friendships: { playerId: string; friendId: string }[];
  clans: SeedClan[];
  clanMembers: { clanId: string; playerId: string; role: string }[];
  matches: SeedMatch[];
  challenges: SeedChallenge[];
  challengeProgress: { playerId: string; challengeId: string; progress: number }[];
  storeItems: SeedStoreItem[];
  storeRotations: SeedRotation[];
  wishlists: { playerId: string; itemId: string; addedAt: Iso }[];
  sessions: SeedSession[];
  wallets: SeedWallet[];
}

/** Waves that complete a Horde Siege map. */
export const HORDE_WAVE_GOAL: number;
export function generate(options?: { seed?: number }): SeedData;
export function rankFromPoints(points: number): SeedRank;
