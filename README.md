# kept-ui

A UI lab for **Kept**, a library you can actually operate. Every screen is built with
[Base UI](https://base-ui.com) (`@base-ui/react`) and styled after the base-ui.com docs and homepage.

This is a lab, not the product: data and sign-in are mocked in the browser, and there is no backend.

## Run it

```sh
pnpm install
pnpm dev
```

The dev server runs on port 5190 and is exposed on your network, so you can open it on a phone.

- `http://localhost:5190/#/kept`: the Kept recreation. Sign in with the lab account **wade / 1234**
  (it only exists in the mock and protects nothing).
- `http://localhost:5190/#/kept/m/tsp8f3k2qx`: a published board, no sign-in needed.
- `http://localhost:5190/`: every Base UI docs demo, styled as on base-ui.com. **Dev only.**

Production builds (`pnpm build`, and the Vercel deploy at https://kept-ui.vercel.app) contain Kept
alone: `/` is the Kept landing, and the component lab and its demos are left out of the bundle.

The UI spec (every screen, shell and rule) is in [docs/ui.html](docs/ui.html).

## Where things are

| Path | What |
| --- | --- |
| `src/App.tsx` | Top-level router: Kept everywhere in production, the lab too in dev |
| `src/LabApp.tsx` | The component lab shell (dev only) |
| `src/kept/KeptApp.tsx` | Routing and the four shells: marketing, auth, app, board |
| `src/kept/KeptLanding.tsx` | Landing with the invite-only Access section |
| `src/kept/KeptLogin.tsx` | Username and password sign-in |
| `src/kept/KeptLibrary.tsx` | Collections index and the New collection dialog |
| `src/kept/KeptCollection.tsx` | A collection's references, as a grid or a list |
| `src/kept/KeptReference.tsx` | One reference: image with pins, notes, tags, annotations, file facts |
| `src/kept/KeptShare.tsx` | Publish, copy, rotate and unpublish a board |
| `src/kept/KeptBoard.tsx` | The public read-only board and its lightbox |
| `src/kept/repository.ts` | Mock data layer; the real one swaps in behind the same functions |
| `src/kept/session.ts` | Mock sign-in session |
| `src/kept/kept.css` | All Kept styles (`Kept`-prefixed classes) |
| `src/docs.css` | Design tokens and the lab shell, ported from the Base UI docs |
| `src/demos/` | The Base UI docs demos (CSS Modules), copied from the Base UI repo |

## Conventions

- Every interactive control goes through Base UI; layout is plain CSS.
- Placeholder images are light gray squares.
- Routes live under `#/kept/…`, so the lab shell and Kept never collide.

## Credits

Typeface: [Geist](https://vercel.com/font) Sans and Mono (SIL Open Font License), loaded from npm.
Demo code and docs styles come from [mui/base-ui](https://github.com/mui/base-ui) under the MIT
license; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Not affiliated with Base UI or MUI.
