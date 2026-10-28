# apps/mobile

The Expo app (iOS, Android and web), built with Expo Router. Week 2 sets up the base: simulated sign-in, five tabs, notifications, the Horde planner and the "Opening E-Day…" screen. Screens read real data from the simulated backend; their final design lands in weeks 3 to 5.

```bash
npm run web                       # from the repo root; opens the web build
EXPO_PUBLIC_API_URL=http://localhost:8787/v0 npm run web   # use the HTTP mock instead of the in-app one
npm run export:web                # static build in dist/, plus dist-portable/ that works from any folder
```

On a phone, `npx expo start` inside this folder and scan the QR code with Expo Go.

- `src/app/` routes (tabs in `(tabs)/`, the planner at `/escuadra/[id]`, store items at `/tienda/[id]`)
- `src/api/` typed client (one method per contract operation), session and data hook
- `src/ui/` tokens from `packages/tokens`, icons from the week 1 prototype, shared components
- `scripts/portable-web.mjs` makes the web export run from a sub-folder (used for the shared demo)

Deep links use the `edaycompanion://` scheme. `edaycompanion://launch?session=…` opens the simulated "Opening E-Day…" screen.
