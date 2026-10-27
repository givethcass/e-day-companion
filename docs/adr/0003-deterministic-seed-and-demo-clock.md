# ADR 0003: Deterministic seed and demo clock

- Status: Accepted
- Date: 2026-10-27

## Context

The demo video and screenshots must show the same story every time: a player who churned after week one, a Friday Horde Siege that is 9 of 12, a wishlist item returning to the store. Retention flows also play out over days, which a 2-minute video cannot wait for.

## Decision

- Seed data comes from a fixed-seed PRNG (mulberry32, seed 2026). No external faker library.
- The playtime mix follows public analyst estimates (Alinea Analytics, Oct 2026) so the simulated churn matches the case study.
- Time-dependent endpoints accept `?asOf=` — the **demo clock** — so the app can jump from Monday to Friday on stage.

## Consequences

- `npm run check` fails if the same seed stops producing identical data or the scripted story breaks.
- Data is illustrative; names of maps, weapons and items are placeholders.
