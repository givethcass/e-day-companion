// The website talks to the same simulated backend as the mobile app, in the browser, as Delta_Rojo.
import type {
  AchievementList, CalendarEntry, Clan, Creator, Guide, GuideSummary, Leaderboard, MatchPage, Medal, MedalUnlock, NewsArticle,
  HordeRole, MatchReport, NewsSummary, Notification, Player, Promo, PromoPlacement, ServiceRecord, SquadSession, StoreItem, StoreRotation, Wallet, WeeklyReport,
} from '@eday/api-types';
import { createApi } from '@eday/api-mock';

const core = createApi();
const playerId = core.playerIdFromToken(core.signIn()!.token)!;

type Query = Record<string, string | number | boolean | undefined>;
const call = <T,>(method: string, path: string, query: Query = {}, body?: unknown): T => {
  const clean = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
  const res = core.handle({ method, path, playerId, query: clean, body });
  if (res.status >= 400) throw new Error((res.body as { message?: string })?.message ?? `Error ${res.status}`);
  return res.body as T;
};

export const api = {
  me: () => call<Player>('GET', '/me'),
  week: (asOf: string) => call<WeeklyReport>('GET', '/me/week', { asOf }),
  wallet: (asOf: string) => call<Wallet>('GET', '/me/wallet', { asOf }),
  notifications: (asOf: string) => call<Notification[]>('GET', '/me/notifications', { asOf }),
  record: (asOf: string) => call<ServiceRecord>('GET', '/me/service-record', { asOf }),
  medals: (asOf: string) => call<Medal[]>('GET', '/me/medals', { asOf }),
  equip: (ids: string[], asOf: string) => call<MedalUnlock[]>('PUT', '/me/medals/equipped', { asOf }, { medalIds: ids }),
  achievements: (asOf: string) => call<AchievementList>('GET', '/me/achievements', { asOf }),
  matches: (asOf: string, limit = 30) => call<MatchPage>('GET', '/me/matches', { asOf, limit }),
  match: (id: string, asOf: string) => call<MatchReport>('GET', `/matches/${id}`, { asOf }),
  news: (asOf: string, tag?: string) => call<NewsSummary[]>('GET', '/news', { asOf, tag, limit: 50 }),
  article: (id: string, asOf: string) => call<NewsArticle>('GET', `/news/${id}`, { asOf }),
  calendar: (asOf: string) => call<CalendarEntry[]>('GET', '/calendar', { asOf }),
  store: (asOf: string) => call<StoreRotation>('GET', '/store/rotation', { asOf }),
  wishlist: () => call<StoreItem[]>('GET', '/me/wishlist'),
  wish: (itemId: string, on: boolean) => (on ? call('POST', '/me/wishlist', {}, { itemId }) : call('DELETE', `/me/wishlist/${itemId}`)),
  guides: () => call<GuideSummary[]>('GET', '/guides'),
  guide: (id: string) => call<Guide>('GET', `/guides/${id}`),
  creators: () => call<Creator[]>('GET', '/creators'),
  promos: (placement: PromoPlacement) => call<Promo[]>('GET', '/promos', { placement }),
  sessions: (startsAfter: string) => call<SquadSession[]>('GET', '/sessions', { startsAfter }),
  session: (id: string) => call<SquadSession>('GET', `/sessions/${id}`),
  join: (id: string, body: { squad?: number; role?: HordeRole }) => call<SquadSession>('POST', `/sessions/${id}/join`, {}, body),
  deploy: (id: string) => call<{ launchUrl: string }>('POST', `/sessions/${id}/deploy`),
  clan: (id: string) => call<Clan>('GET', `/clans/${id}`),
  clanBoard: (id: string) => call<Leaderboard>('GET', `/clans/${id}/leaderboard`),
  leaderboard: (mode: string, scope: string, limit = 10) => call<Leaderboard>('GET', `/leaderboards/${mode}`, { scope, limit }),
};
