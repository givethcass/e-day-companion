# E-Day Companion (concept)

> **Unofficial portfolio concept.** Not affiliated with, endorsed by, or connected to Microsoft, Xbox or The Coalition. All player data is simulated. Game content is used under the [Microsoft Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules).

What if *Gears of War: E-Day* had an official companion app built to bring players back?

Analyst estimates suggest about 1.7M people tried E-Day through Game Pass in its first week, yet more than half of Xbox players stopped at 5 hours or less. This project imagines an official mobile companion whose job is retention: a weekly "deployment report" with a short personal mission, real match history and leaderboards, squad planning for 12-player Horde Siege, and a weekly store watchlist, each ending in one action: **Deploy** (open the game).

## Status

| Week | Focus | State |
| --- | --- | --- |
| 0 | Case, data and API contract | Done |
| 1 | Visual system and prototype | In progress |
| 2–5 | App and simulated backend | Not started |
| 6 | Polish, demo video, case study | Not started |

## Repository

```
contract/openapi.yaml    API contract (OpenAPI 3.1), written before any code
packages/seed            Deterministic simulated data + checks against the contract
packages/tokens          Design tokens (direction A) + WCAG contrast checks
apps/mobile              Expo app (iOS, Android, web) — week 2
apps/api-mock            Simulated backend serving the contract — week 2
docs/adr                 Architecture decision records
docs/case-study.md       Case study draft
docs/information-architecture.md  Tabs, screens and the contract operations behind them
```

## Run it

Requires Node 22.

```bash
npm install
npm run seed    # writes packages/seed/out/*.json
npm run check   # contract, determinism, schemas, demo story and color contrast
```

## Decisions

- [ADR 0001: Expo monorepo](docs/adr/0001-expo-monorepo.md)
- [ADR 0002: Contract-first simulated backend](docs/adr/0002-contract-first-simulated-backend.md)
- [ADR 0003: Deterministic seed and demo clock](docs/adr/0003-deterministic-seed-and-demo-clock.md)
