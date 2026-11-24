# ADR 0007: Spanish as the source, English from one catalog

- Status: Accepted
- Date: 2026-11-24

## Context

The demo has to work in Spanish and in English. Every screen, the seed content (news, guides, medals, achievements, weapons, campaign, promos) and the API's composed lines ("Te faltan 3 victorias para Ónix 1") were written in Spanish, across the Expo app, the website and the simulated backend. Moving every string to keys would touch hundreds of components and make the Spanish harder to read in code.

## Decision

Spanish stays the source. `packages/i18n` holds one catalog keyed by the Spanish text, and an engine that turns a Spanish line into English:

- **Exact entries** (`'Mi servicio': 'My service'`), in `src/ui.ts` for screens and `src/content.ts` for seed content.
- **Templates** with `{slots}` (`'Obtenido el {a}': 'Earned {a}'`). Each slot must itself translate, so a template never lets Spanish through. Templates with more fixed text win.
- **Composition**: lines are split into sentences, then on ` · `, `: `, ` — `, `, ` and ` / `, grouping the parts so a phrase like "Ultra raro · 2%" still matches. Short Spanish dates and weekdays are converted. Gamertags, numbers, units and enum codes pass through.

It runs in three places:

- **API answers**: `createApi().handle({ lang: 'en' })` localizes the body. The HTTP server reads `Accept-Language`.
- **Rendered pages**: `startDomTranslation()` watches the DOM of the website and the Expo web build and translates text and `aria-label`, `title`, `placeholder` and `alt`. It keeps the Spanish so switching back restores it. `data-no-translate` opts an element out.
- **Canvas text**: drawn through `t()`.

The language comes from `?lang=`, then `localStorage` (`eday-lang`). `switchLang()` reloads the page in that language and tells the demo shell, which reloads the other devices.

## Consequences

- Adding a screen in Spanish works as before; its English is one catalog line. `npm run check` fails when any API string has no English, so seed content can't drift.
- Screen text has no such test, since it only exists once rendered. New screen strings need a catalog entry, checked by viewing the page in English.
- Text split across several JSX nodes is translated node by node. Lines with values in the middle read best as one template string (`` {`Hora favorita ${h}, los ${d}`} ``).
- Native iOS and Android builds keep Spanish; the switch is shown on the web build only.
- The catalogs add about 30 kB gzip to the website's first load.
