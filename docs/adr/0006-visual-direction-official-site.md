# ADR 0006: Visual direction C, the look of the official site

- Status: Accepted (supersedes ADR 0005)
- Date: 2026-10-28

## Context

The case study imagines the app as the official companion for Gears of War: E-Day. Direction B ("Tactical HUD") was chosen in the morning, but an official companion would follow the brand's own web presence, so the product owner asked to take the look and feel of gearsofwar.com instead. The sandbox cannot reach the site, so the work used a full-page capture supplied by the product owner.

## Decision

Direction C follows the site's visual language without copying its assets:

- **Colour**, measured from the capture: black pages, a deep red band (`#800000`) that fades to black behind section titles, solid red buttons (`#BF0A0A`) with white labels, grey (`#959393`) for secondary titles. The site's accent red (`#E43127`) is nudged to `#F0473A` so red text keeps 4.5:1 on dark surfaces.
- **Type**: the site's lettering is DIN-like; Barlow Condensed (titles, labels, figures with tabular numbers) and Barlow (body) are free, close equivalents.
- **Shape**: square corners, outlined black secondary buttons, text tabs with a red underline, hairlines between rows.
- **Art**: original. An ember glow and coloured gradients stand in for key art. No logos, game art, screenshots, textures or fonts from the site are used, and every screen keeps the "concepto no oficial" notice.

`packages/tokens/src/tokens.json` holds C; A and B stay in `tokens-a.json` and `tokens-b.json`. Buttons and selected chips use the new `action` / `onAction` pair; `primary` is the red used for text and rules.

## Consequences

- All text pairs pass WCAG AA (`npm run check` in `packages/tokens`).
- Fonts drop from three families to two.
- The app reads as part of the official ecosystem, which is the premise of the case, while staying clear of Microsoft's rule against using its logos or marks as the app's own branding.
