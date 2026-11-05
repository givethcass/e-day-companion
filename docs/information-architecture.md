# Information architecture

> **Current structure (v0.10.0, week 5, with tablet and web).** After the player research on 2026-10-28 the app moved to a Waypoint-style hub. The week 1 table below is kept as history; see [Waypoint-style structure (v0.6.0)](#waypoint-style-structure-v060) and [Service record and medals (v0.7.0)](#service-record-and-medals-v070), with the full medal catalogue in v0.8.0 and [week 5 (v0.9.0)](#guides-class-levels-achievements-clan-creators-and-partner-slots-v090).

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
| Guías | "How do I play this better?" | Guides by section, the player's class first, guide detail (week 5) | `listGuides`, `getGuide` |
| Servicio | "How did I do?" | Service record with history, match report, leaderboards | `listMyMatches`, `getMatch`, `getLeaderboard` |
| Comunidad | "Who am I playing with?" | Squad sessions, Horde planner, clan, creators (week 5) | `listSessions`, `getSession`, `joinSession`, `deploySession` |

The store is no longer a tab: it opens over the tabs from Inicio and from news stories (`/tienda`). Routes moved with the tabs, and every in-app `link` the API returns follows them: `/comunidad/escuadra/{id}`, `/servicio/partidas/{id}`, `/servicio/clasificacion`, `/noticias/{id}`.

Contract additions: `listNews` and `getNews` (official posts tagged patch, event, season, store or community; a story is visible only once `publishedAt` is past the demo clock, so the Nov 2 patch and the 20th anniversary story appear when the clock moves to Nov 3; patch and event stories follow what The Coalition shipped up to Nov 3, 2026) and `listCalendar` (event starts and ends, the Tuesday store and challenge rotation, the Nov 7 anniversary gift and the end of the season).

## Service record and medals (v0.7.0)

Feedback on 2026-11-05: the mission hero on Inicio felt like a launcher, not like Waypoint. Inicio now opens on the player's card (level, profile title, gamertag, hours, matches, days since the last match) with tabs for Versus, Horde and Campaña, four figures per mode, the latest medal, and a link to the full record. The tab that opens first is the mode the player spends the most time in.

| Screen | What it shows | Contract operations |
| --- | --- | --- |
| Inicio (hero) | Card, figures per mode, latest medal, "Ver mi servicio" | `getServiceRecord` |
| Mi servicio | Profile card with the 3 medals shown in game, career, every figure per mode and map, latest medals, GTA-style curiosities, leaderboards, history | `getServiceRecord`, `listMyMatches` |
| Medallas | 13 series in 5 categories, 5 tiers each (Bronce to Diamante, as in E-Day's profile customisation), filters for earned and missing, progress to the next tier | `listMyMedals` |
| Medalla | Next tier's challenge with its Monedas reward, the 5 tiers with unlock date or what is left, put on or take off the profile card | `getMyMedal`, `setEquippedMedals` |

Medal progress is computed from the player's matches, so every tier's unlock date is the end of the match that crossed its goal. The profile card holds up to 3 medals; without a choice it shows the 3 with the most tiers. Curiosities (blood spilled, bullets fired, distance run in cover, latest night played, busiest week) are derived from the same matches and come already worded from the API. The full list of metrics a game like E-Day could expose is in the "Métricas de jugador" doc.


**Demo player (2026-11-05).** Delta_Rojo is now a veteran instead of the player who left after week 1, so the service record and medals have something to show: about 100 hours since launch, playing most nights, 300 matches, a Versus K/D near 3.3, Ónix in Ranked and the campaign finished. Medal goals grew to match (Diamante takes thousands of kills), so even this player has tiers to chase. Delta_Rojo's matches come from their own random stream, so changing their schedule never reshuffles the rest of the seed.

**Full medal catalogue (v0.8.0).** E-Day launched with more than 80 medal series, so the demo now has 74 in ten groups: Armas (16 weapons, with the game's 100 / 500 / 1,500 / 3,000 / 5,000 kill tiers), Granadas y minas, Tipo de baja, Apoyo, Horde Siege (including one per class), Enemigos, Versus, Campaña, Progresión (Re-up) and Eventos. Every tier pays Coins; Oro and Ónix also unlock a cosmetic and Diamante a player title (`reward.unlock`). The Medallas screen adds a row of group chips and lists each group closest-to-next-tier first. Counts the seed does not record per match (revives, headshots, enemy types, tags) are estimated from kills and matches with fixed ratios.

## Guides, class levels, achievements, clan, creators and partner slots (v0.9.0)

Week 5 fills the last placeholders.

| Where | What it adds | Contract operations |
| --- | --- | --- |
| Guías | 17 guides in five sections (classes, weapons, maps, collectibles, community builds), official or by a creator, with key facts, the body and related guides. The guides for the player's main class open the list | `listGuides`, `getGuide` |
| Mi servicio | Level 1 to 20 for each Horde class, from waves cleared and finished maps; a Logros row | `getServiceRecord` (`classes`) |
| Logros | 30 Xbox-style achievements worth 1,000 Gamerscore, with unlock date, progress and rarity | `listMyAchievements` |
| Comunidad | The player's clan (sessions and Horde ranking) and creators, live first | `getClan`, `getClanLeaderboard`, `listCreators` |
| Inicio, Noticias, Guías, Comunidad | One partner slot each, labelled "Patrocinado" or "Colaboración" | `listPromos` |

Partner slots show where an official app could carry sponsorships and collaborations. In the demo the brands are invented, nothing is sold and there is no ad network; the slots are dashed and labelled so they never read as official content. Creators are invented people too.

## Tablet and desktop (no contract change)

The demo now switches between three devices. Nothing new was needed from the API: every screen reads the same operations.

- **Phone** (440 × 956). Unchanged.
- **Tablet** (from 700 points wide, shown at 820 × 1180). The same Expo app with wider margins, a centred column up to 1,180 points, labels beside the tab icons, and long lists (news, guides, medals, achievements, matches, squads, creators, calendar) in two columns, three from 1,100. `apps/mobile/src/ui/layout.tsx`.
- **Web** (`apps/web`, laid out for 1,280 and up). Same five sections as top navigation, each opening on a solid red band:
  - Inicio: full-bleed hero with a three.js medal and rising embers that lean toward the cursor, the mode tabs with counting stats, a headline ticker, the week and next mission, a news mosaic, the partner slot, the store with tilting cards and a wishlist toggle, the calendar as a timeline, and open squads.
  - Noticias: tag filters over a card grid; articles with a reading progress bar.
  - Guías: section filters, a creator sidebar, and guides with the key facts pinned beside the text.
  - Mi servicio: career summary, Versus and Horde breakdowns, class levels, medal and Gamerscore rings, trivia and a match table; Medallas with all 74 series, tier tooltips and equip on click (up to three, like the API); Logros with filters.
  - Comunidad: squads you can join or leave, the clan and its board, creators (live ones pulse), the partner slot and the global ranked board.
  - Micro-interactions: sliding nav underline, magnetic buttons, cursor spotlight on cards, reveal on scroll, count-up numbers, toasts. All of them stand still under reduced motion.


## Service record as charts (v0.10.0)

Giveth asked for Mi servicio to read as charts instead of label / value lines, with pie-style charts where a figure splits into parts. The contract adds `ServiceRecord.breakdown`: kills by mode, by weapon (top five plus «Otras armas y granadas») and by enemy (top five plus «Otros»), special kills (they overlap, so they are bars, never a pie), Versus maps, and matches by local hour and weekday.

- Donuts only for real partitions of up to six parts (time by mode, kills by weapon, enemies, Horde matches by class); each has a legend with value and share, and hover or tap shows a part in the middle.
- A tall split bar for one whole in two or three parts (kills by mode, Versus wins / losses / draws, Horde finished or not).
- Ranked bars when parts are compared (win rate by mode and map, best wave by map, special kills); columns for hours and weekdays, the busiest in the accent.
- Colours: a categorical set checked with the dataviz validator against the dark surface (red, blue, yellow, aqua, violet, magenta), «Otras» always grey, and a fixed colour per mode and per class in the app and on the web.
