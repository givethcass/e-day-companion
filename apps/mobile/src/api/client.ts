// Typed client for contract/openapi.yaml. Screens only talk to `api`, never to a transport.
// With EXPO_PUBLIC_API_URL set it calls the HTTP mock; otherwise the simulated backend runs inside the app,
// which is what the static web demo uses.
import type {
  CalendarEntry, Challenge, Clan, Event, JoinRequest, Leaderboard, LeaderboardScope, MatchPage, MatchReport, Mode, NewSquadSession,
  NewsArticle, NewsSummary, NewsTag, Notification, NotificationPrefs, Player, Season, SessionFilters, SquadSession, StoreItem, StoreRotation, Wallet, WeeklyReport,
} from '@eday/api-types';
import { createApi, type Api } from '@eday/api-mock';

type Query = Record<string, string | number | boolean | undefined>;
interface Req { method: string; path: string; query?: Query; body?: unknown }
interface Res { status: number; body?: unknown }
export type Transport = (req: Req, token: string | null) => Promise<Res>;

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

const clean = (q: Query = {}) =>
  Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));

export const httpTransport = (baseUrl: string): Transport => async ({ method, path, query, body }, token) => {
  const qs = new URLSearchParams(clean(query)).toString();
  const res = await fetch(`${baseUrl}${path}${qs ? `?${qs}` : ''}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: res.status === 204 ? undefined : await res.json() };
};

// Created on first use so the seed is only generated when the in-app backend is actually needed.
let local: Api | undefined;
const localApi = async () => (local ??= createApi());

export const inAppTransport = (): Transport => async ({ method, path, query, body }, token) => {
  const api = await localApi();
  const playerId = api.playerIdFromToken(token);
  if (!playerId) return { status: 401, body: { code: 'unauthorized', message: 'Inicia sesión de nuevo' } };
  return api.handle({ method, path, query: clean(query), body: body === undefined ? undefined : structuredClone(body), playerId });
};

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
let transport: Transport = baseUrl ? httpTransport(baseUrl) : inAppTransport();
let token: string | null = null;

export const setToken = (t: string | null) => { token = t; };
export const setTransport = (t: Transport) => { transport = t; };

/** Simulated "Sign in with Xbox". The demo always signs in as Delta_Rojo. */
export async function signInDemo(): Promise<{ token: string; player: Player }> {
  if (baseUrl) {
    const res = await fetch(`${baseUrl}/auth/demo`, { method: 'POST' });
    return res.json();
  }
  return (await localApi()).signIn()!;
}

async function call<T>(method: string, path: string, opts: { query?: Query; body?: unknown } = {}): Promise<T> {
  const res = await transport({ method, path, ...opts }, token);
  if (res.status >= 400) {
    const err = (res.body ?? {}) as { code?: string; message?: string };
    throw new ApiError(res.status, err.code ?? 'error', err.message ?? `Error ${res.status}`);
  }
  return res.body as T;
}

const enc = encodeURIComponent;

/** One method per contract operationId. */
export const api = {
  getMe: () => call<Player>('GET', '/me'),
  getMyWeek: (asOf?: string) => call<WeeklyReport>('GET', '/me/week', { query: { asOf } }),
  listMyNotifications: (asOf?: string) => call<Notification[]>('GET', '/me/notifications', { query: { asOf } }),
  getMyWallet: (asOf?: string) => call<Wallet>('GET', '/me/wallet', { query: { asOf } }),
  getNotificationPrefs: () => call<NotificationPrefs>('GET', '/me/notification-prefs'),
  setNotificationPrefs: (prefs: NotificationPrefs) => call<NotificationPrefs>('PUT', '/me/notification-prefs', { body: prefs }),
  listMyMatches: (q: { mode?: Mode; cursor?: string; limit?: number; asOf?: string } = {}) => call<MatchPage>('GET', '/me/matches', { query: q }),
  getMatch: (matchId: string, asOf?: string) => call<MatchReport>('GET', `/matches/${enc(matchId)}`, { query: { asOf } }),
  getLeaderboard: (mode: Mode, q: { scope?: LeaderboardScope; limit?: number } = {}) => call<Leaderboard>('GET', `/leaderboards/${mode}`, { query: q }),
  getCurrentSeason: () => call<Season>('GET', '/season/current'),
  listMyChallenges: (asOf?: string) => call<Challenge[]>('GET', '/me/challenges', { query: { asOf } }),
  getStoreRotation: (asOf?: string) => call<StoreRotation>('GET', '/store/rotation', { query: { asOf } }),
  getWishlist: () => call<StoreItem[]>('GET', '/me/wishlist'),
  addToWishlist: (itemId: string) => call<void>('POST', '/me/wishlist', { body: { itemId } }),
  removeFromWishlist: (itemId: string) => call<void>('DELETE', `/me/wishlist/${enc(itemId)}`),
  listEvents: (asOf?: string) => call<Event[]>('GET', '/events', { query: { asOf } }),
  listNews: (q: { tag?: NewsTag; limit?: number; asOf?: string } = {}) => call<NewsSummary[]>('GET', '/news', { query: q }),
  getNews: (newsId: string, asOf?: string) => call<NewsArticle>('GET', `/news/${enc(newsId)}`, { query: { asOf } }),
  listCalendar: (asOf?: string) => call<CalendarEntry[]>('GET', '/calendar', { query: { asOf } }),
  listSessions: (filters: SessionFilters = {}) => call<SquadSession[]>('GET', '/sessions', { query: filters }),
  createSession: (s: NewSquadSession) => call<SquadSession>('POST', '/sessions', { body: s }),
  getSession: (sessionId: string) => call<SquadSession>('GET', `/sessions/${enc(sessionId)}`),
  joinSession: (sessionId: string, join: JoinRequest = {}) => call<SquadSession>('POST', `/sessions/${enc(sessionId)}/join`, { body: join }),
  deploySession: (sessionId: string) => call<{ launchUrl: string }>('POST', `/sessions/${enc(sessionId)}/deploy`),
  getClan: (clanId: string) => call<Clan>('GET', `/clans/${enc(clanId)}`),
  getClanLeaderboard: (clanId: string) => call<Leaderboard>('GET', `/clans/${enc(clanId)}/leaderboard`),
};
