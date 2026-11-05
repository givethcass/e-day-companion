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

type NewsTag = 'patch' | 'event' | 'season' | 'store' | 'community';
export interface SeedNews {
  id: string; tag: NewsTag; title: string; summary: string; publishedAt: Iso; readMinutes: number; featured?: boolean;
  sections: { heading?: string; paragraphs?: string[]; bullets?: string[] }[]; knownIssues?: string[]; cta?: { label: string; link: string };
}

export interface SeedMedalSeries {
  id: string; name: string; unit: string; goals: number[]; title: string;
  category: 'weapon' | 'grenade' | 'kill_type' | 'support' | 'horde' | 'enemy' | 'versus' | 'campaign' | 'progression' | 'event';
  metric: 'kills' | 'versusKills' | 'hordeKills' | 'campaignKills' | 'matches' | 'versusMatches' | 'hordeMatches' | 'role'
    | 'waves' | 'hordeCompleted' | 'versusWins' | 'ranked' | 'chapters' | 'during';
  share?: number; from?: Iso; to?: Iso; role?: Role; item?: 'weapon';
}

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
  news: SeedNews[];
  medalSeries: SeedMedalSeries[];
  guides: SeedGuide[];
  creators: SeedCreator[];
  promos: SeedPromo[];
  achievements: SeedAchievement[];
}

export interface SeedGuide {
  id: string; section: 'classes' | 'weapons' | 'maps' | 'collectibles' | 'builds'; title: string; summary: string;
  author: { name: string; kind: 'official' | 'creator'; creatorId?: string }; readMinutes: number; updatedAt: Iso;
  role?: Role; map?: string; patch?: string; facts: [string, string][];
  sections: { heading?: string; paragraphs?: string[]; bullets?: string[] }[]; cta?: { label: string; link: string };
}

export interface SeedCreator {
  id: string; name: string; platform: 'youtube' | 'twitch'; language: string; followers: number; focus: string; live: boolean;
  latest: { title: string; minutes: number; publishedAt: Iso };
}

export interface SeedPromo {
  id: string; placement: 'home' | 'news' | 'guides' | 'community'; kind: 'sponsored' | 'collab'; partner: string;
  title: string; body: string; cta: { label: string; link?: string }; glow: string;
}

export interface SeedAchievement {
  id: string; name: string; description: string; gamerscore: number; goal: number; rarity: number;
  metric: SeedMedalSeries['metric'] | 'bestWave' | 'streak' | 'hours'; share?: number; from?: Iso; to?: Iso;
}

/** Waves that complete a Horde Siege map. */
export const HORDE_WAVE_GOAL: number;
/** Coins for each medal tier, bronze to diamond. */
export const MEDAL_REWARDS: number[];
/** Chapters in the campaign. */
export const CAMPAIGN_CHAPTERS: number;
/** When the anniversary gift unlocks. */
export const GIFT_AT: string;
export function generate(options?: { seed?: number }): SeedData;
export function rankFromPoints(points: number): SeedRank;
