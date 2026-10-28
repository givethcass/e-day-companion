# ADR 0005: Visual direction B, "Tactical HUD"

- Status: Accepted
- Date: 2026-10-28

## Context

Week 1 explored two directions on the same "Tu semana" screen. A ("Mando COG") used crimson and ember on charcoal, Barlow Condensed titles and rounded, boxed cards. B ("HUD táctico") used amber on near-black, IBM Plex Sans Condensed titles, IBM Plex Mono for labels and numbers, square corners and log-style rows. The P0 screens were first built in A while the choice was open.

## Decision

The product owner chose B. `packages/tokens/src/tokens.json` now holds B; A stays in `tokens-a.json` for the record. The app, the web demo and the P0 artboards use B:

- One accent, amber `#F2A900`, with dark text on it (`onPrimary`). It marks the one thing that asks for action: the priority card's 3px left rule, the primary button, the active tab and selected chips.
- Numbers, tags, dates and labels are monospaced, so readouts line up and scan like a HUD.
- Lists are logs: a short mono tag column, the entry, a mono readout, hairlines between rows instead of boxed cards.
- Every corner is 4px or square.

## Consequences

- All text pairs pass WCAG AA (checked by `npm run check` in `packages/tokens`).
- Three font families load at startup instead of two; all are open source (OFL).
- Amber is used for both "act" and "good" states, so status that must not be confused with an action needs a word, not just colour.
