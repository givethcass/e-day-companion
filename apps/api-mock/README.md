# apps/api-mock

Simulated backend for `contract/openapi.yaml`. It generates the seed in memory and answers every operation in the contract, with the demo clock (Tue Oct 27, 2026, 18:00 UTC) as "now" unless a request passes `asOf`. See [ADR 0004](../../docs/adr/0004-portable-simulated-backend.md).

```bash
npm run api                                   # http://localhost:8787/v0
TOKEN=$(curl -s -X POST localhost:8787/v0/auth/demo | jq -r .token)
curl -H "Authorization: Bearer $TOKEN" localhost:8787/v0/me/week
npm run check -w @eday/api-mock               # contract and behavior tests
```

`POST /v0/auth/demo` stands in for "Sign in with Xbox" and is not part of the contract. Writes stay in memory until the server restarts.

What the handlers derive from the seed:

- **Weekly report:** the suggested mission follows the player's most played kind of game (Versus, Horde, Campaign); the other two come back as `alternatives`. A Horde session tonight in the player's language, with no mic required, becomes the Horde option.
- **Notifications:** only squad and wishlist alerts unless the player turns on events, rival or Ranked. Times in the text are in the player's time zone.
- **Leaderboards:** Horde Siege ranks by best wave of the season; every other mode by rank points.
