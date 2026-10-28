# ADR 0004: Portable simulated backend instead of Supabase

- Status: Accepted (amends ADR 0002)
- Date: 2026-10-28

## Context

ADR 0002 planned to serve the contract from Supabase Postgres and Edge Functions. That needs an account, a deployed project and keys before anyone can open the demo, and the data is generated, read-only and fits in memory. The public web demo also has to work as a plain static page.

## Decision

`apps/api-mock` is one set of route handlers, written in TypeScript against the generated contract types, that answers every operation from the deterministic seed. The same handlers run two ways:

- **In the app**, through an in-process transport. This is the default and what the static web demo uses: no server, no network.
- **Over HTTP**, with `npm run api` (Node, port 8787, prefix `/v0`). The app uses it when `EXPO_PUBLIC_API_URL` is set.

Writes (wishlist, joining a session, notification settings) live in memory for the session. Sign-in is simulated: the demo token names the player.

## Consequences

- The demo has no hosting cost and nothing to keep running.
- Tests call the handlers directly and validate every response against the contract.
- Moving to Supabase or any real service later means writing a new transport; screens don't change.
- Nothing persists across reloads, which suits a demo but would not suit real users.
