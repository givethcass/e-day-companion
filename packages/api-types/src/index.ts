// Friendly names for the generated contract types.
import type { components, operations, paths } from './schema.ts';

export type { components, operations, paths };

type S = components['schemas'];
export type Mode = S['Mode'];
export type HordeRole = S['HordeRole'];
export type HordeDifficulty = S['HordeDifficulty'];
export type Player = S['Player'];
export type Rank = S['Rank'];
export type WeeklyReport = S['WeeklyReport'];
export type Mission = WeeklyReport['nextMission'];
export type Notification = S['Notification'];
export type Wallet = S['Wallet'];
export type NotificationPrefs = S['NotificationPrefs'];
export type MatchSummary = S['MatchSummary'];
export type MatchReport = S['MatchReport'];
export type Leaderboard = S['Leaderboard'];
export type LeaderboardEntry = S['LeaderboardEntry'];
export type Season = S['Season'];
export type Challenge = S['Challenge'];
export type StoreItem = S['StoreItem'];
export type StoreRotation = S['StoreRotation'];
export type Event = S['Event'];
export type NewSquadSession = S['NewSquadSession'];
export type SquadSession = S['SquadSession'];
export type Clan = S['Clan'];
export type ApiError = S['Error'];

export type MatchPage = operations['listMyMatches']['responses']['200']['content']['application/json'];
export type LeaderboardScope = NonNullable<NonNullable<operations['getLeaderboard']['parameters']['query']>['scope']>;
export type SessionFilters = NonNullable<operations['listSessions']['parameters']['query']>;
export type JoinRequest = NonNullable<operations['joinSession']['requestBody']>['content']['application/json'];
