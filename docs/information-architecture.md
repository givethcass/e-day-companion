# Information architecture

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
