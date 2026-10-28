# Information architecture

> **Current structure (v0.6.0, week 4).** After the player research on 2026-10-28 the app moved to a Waypoint-style hub. The week 1 table below is kept as history; see [Waypoint-style structure (v0.6.0)](#waypoint-style-structure-v060).

Week 1. Five tabs, each one answering a single question, plus the profile in the top corner. Every screen ends in an action, and the main one is **Deploy** (open the game).

| Tab | Question it answers | P0 screens | Contract operations |
| --- | --- | --- | --- |
| Your week | "What should I play next, and why now?" | Your week (deployment report), Notifications | `getMyWeek`, `listMyChallenges`, `listEvents`, `listMyNotifications` |
| Matches | "How did I do?" | History, Match report | `listMyMatches`, `getMatch` |
| Leaderboards | "Where do I stand?" | Leaderboards (global, country, friends, clan) | `getLeaderboard`, `getCurrentSeason` |
| Squad | "Who am I playing with on Friday?" | Squad sessions, Horde Siege planner + Deploy | `listSessions`, `getSession`, `joinSession`, `deploySession`, `getClan` |
| Store | "Is the thing I want here this week?" | Weekly store, Item detail + wishlist | `getStoreRotation`, `getWishlist`, `addToWishlist`, `removeFromWishlist` |
| Profile (corner) | "Who am I signed in as?" | Sign in with Xbox (simulated) | `getMe` |

## Navigation rules

- Your week is the landing tab. Every card on it links to the tab that owns the detail: the Friday session opens the Horde planner, the wishlist card opens the item, the rival opens Leaderboards filtered to friends.
- Notifications open from the bell on Your week, not from a tab. Each one carries an in-app `link`.
- Deploy appears in two places only: the suggested mission and the Horde planner. In the demo both return a simulated `launchUrl`.
- Clan, lore, maps and guides from the v1 prototype move to P1. They stay reachable from Squad and Profile but are not designed this week.
- The unofficial-concept notice sits at the bottom of every screen that shows game content.

## Contract changes this produced (v0.2.0)

Mapping screens to operations exposed five gaps, now fixed in `contract/openapi.yaml`:

1. `GET /sessions/{sessionId}`, so the planner can load one session.
2. `GET /me/notifications` and the `Notification` schema. The mock derives them from the week report, wishlist and sessions.
3. `WeeklyReport.daysSinceLastMatch`, for the "15 days since you played" line.
4. `WeeklyReport.rival.rank`, so the rival card can show "Silver 2".
5. `WeeklyReport.nextMission.launchUrl`, so the mission card can deploy.

The seed also changed: players stay unranked (`rank: null`) until their first Ranked match, which is what makes Delta_Rojo's story ("Ranked is open and you have no rank yet") true in the data.

## Contract changes after the synthetic test (v0.3.0)

Ten simulated player profiles, built from real reviews and forum posts, ran the week 1 test script against the prototype. All ten asked for local times, a visible coin balance and control over notifications, and most did not care about Ranked. These changes support the six fixes:

1. `Player.timezone`, so every date renders in the player's own time.
2. `GET /me/wallet` and the `Wallet` schema: Coins, Iron, coins earned this week and the weekly cap.
3. `GET`/`PUT /me/notification-prefs`. Squad and wishlist alerts are on by default; events, rival and Ranked are opt-in, with quiet hours.
4. `WeeklyReport.nextMission.reason` and `alternatives[]`, so the mission follows how the player plays instead of always pushing Ranked.
5. `listSessions` filters (`micRequired`, `difficulty`, `startsAfter`, `startsBefore`); Horde sessions carry `difficulty` and `map`, and members carry `confirmed`.
6. `Leaderboard.metric` (`rank_points` or `best_wave`), so Horde gets its own leaderboard.

The seed now gives every player a wallet and adds a Spanish, no-mic Horde Siege starting tonight. Map names are invented placeholders.

## Contract changes for the match report (v0.4.0)

Week 3 built History, the match report and the demo clock at full design. That needed:

1. `MatchSummary.durationSeconds`, `wavesCleared` and `waveGoal`, so History can show hours played, the best wave and "Wave 17/30" without loading every report.
2. `MatchReport.takeaway`: one lesson per match with an in-app `link`. A Horde Siege without an Engineer says so and points at the player's next session, which tells them whether that squad already has one.
3. `scoreboard[].role` (Horde Siege only) and `scoreboard[].isMe`.
4. `asOf` on `listMyMatches` and `getMatch`, so the demo clock reaches every screen. The wallet also honours `asOf` now: past the weekly reset the cap starts over.

The mission also changed: a session the player already joined for today becomes the mission ("Your Horde today, 21:00") ahead of any suggestion.

The demo clock is a footer link on every screen. It jumps between four moments in the story: Tuesday noon (15 days away), Tuesday 21:30 (an hour before a Spanish no-mic Horde), Friday 20:00 (an hour before the clan's Horde) and the next Tuesday (new store, new event).

## Data aligned with the game (v0.5.0)

Player research on 2026-10-28 (Steam, Pure Xbox, PC Gamer, Game8) showed two places where the simulated data contradicted what any player knows:

1. Horde Siege classes are Assault, Breacher, Marksman and Medic. `HordeRole` is now `assault | breacher | marksman | medic`; the lesson on a match report names the missing class ("Sin Médico nadie te levantó").
2. The weekly Coin cap is 50,000 and coin items cost thousands. Coins per match, the cap, coin prices and wallets are scaled to match.

Map names stay invented on purpose.

## Waypoint-style structure (v0.6.0)

Player research (2026-10-28) showed that what players look for outside the game is news, patch notes and guides, and that squad coordination is a real but secondary need. The app now has five tabs:

| Tab | Question it answers | Screens | Contract operations |
| --- | --- | --- | --- |
| Inicio | "What matters to me this week?" | Mission, figures, latest news, squad and store cards, season calendar, recap | `getMyWeek`, `listNews`, `listCalendar`, `getStoreRotation`, `listSessions` |
| Noticias | "What changed in the game?" | News list with filters, story with known issues and a link into the app | `listNews`, `getNews` |
| Guías | "How do I play this better?" | Placeholder listing the sections (week 5) | – |
| Servicio | "How did I do?" | Service record with history, match report, leaderboards | `listMyMatches`, `getMatch`, `getLeaderboard` |
| Comunidad | "Who am I playing with?" | Squad sessions, Horde planner (clan and creators in week 5) | `listSessions`, `getSession`, `joinSession`, `deploySession` |

The store is no longer a tab: it opens over the tabs from Inicio and from news stories (`/tienda`). Routes moved with the tabs, and every in-app `link` the API returns follows them: `/comunidad/escuadra/{id}`, `/servicio/partidas/{id}`, `/servicio/clasificacion`, `/noticias/{id}`.

Contract additions: `listNews` and `getNews` (official posts tagged patch, event, season, store or community; a story is visible only once `publishedAt` is past the demo clock, so the Oct 29 patch appears when the clock moves to Friday) and `listCalendar` (event starts and ends, the Tuesday store and challenge rotation, the Nov 7 anniversary gift and the end of the season).

