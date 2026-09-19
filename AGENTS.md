# Agent guide

Instructions for any coding agent working in this repo. Read `README.md` for how to run the project and where things are. Read `docs/ui.html` for the UI spec.

## What this is

A UI lab that recreates **Kept** (kept.design), "a library you can actually operate", using only Base UI (`@base-ui/react`), styled to look like the base-ui.com docs. The owner cares a lot about this lab because it feeds the real Kept product. The data layer and sign-in are mocks, and there is no backend.

Kept is invite-only: sign-in is by username and password, not email. The landing page has an Access section with Sign in and Request an invite, and the owner approves every account by hand.

## How to work

- **One screen at a time.** Build a screen, show it, and get the owner's approval before starting the next.
- **Commit only when asked.** "Ship" means commit and push to `origin/main`. Pushing triggers a production deploy on Vercel (https://kept-ui.vercel.app).
- **This repo only.** Never touch the real Kept repo.
- Use pnpm, and run the dev server with `pnpm dev` on port 5190. Before committing, check that `pnpm build` and `pnpm lint` pass.

## Hard rules

- **Keep the lab out of production.** The component lab (`src/LabApp.tsx`, `src/pages`, `src/demos`) only loads under `pnpm dev`. Production builds contain Kept alone, with `/` as the Kept landing.
- **Never add the licensed fonts.** The repo is public, and Die Grotesk and Paper Mono were removed from its history. Fonts are Geist Sans and Geist Mono from npm.
- **Leave `src/demos` alone.** These are verbatim copies of the Base UI docs demos. Don't refactor them or "fix" lint findings in them.
- **Base UI for every control.** Every interactive control goes through Base UI; layout is plain CSS. Kept styles live in `src/kept/kept.css` with `Kept`-prefixed classes, and design tokens are in `src/docs.css`.
- **No personal data.** The repo is public: no absolute home paths, secrets or personal files.

## Health log

Code-quality checks are logged in `health/`. See `health/README.md` for the full conventions.

- Each check is a run with the ID `YYYYMMDD-HHMM_tool_shortsha`. It produces `health/runs/<id>.html`, `health/runs/<id>.json` and one new row in `health/log.csv`.
- Commit before a run, so the ID's commit matches the code that was checked.
- Show the results in the terminal as well as writing the report.
- Replace absolute paths in the saved JSON with `.`.
- Never edit an old run.
- **Report style:** match the existing reports. That means Inter 400 from Google Fonts, a white page with black text, `margin: 32px`, `max-width: 42em`, `line-height: 1.5` and regular-weight headings, with plain `h2` sections, lists and `pre` blocks and no other styling.
- The first run is `20260919-0148_react-doctor_cb6dd28` (score 63). Its suggested fix order: first the loading flags reset outside `finally`, then revoking object URLs and the upload list key, then the `await` loop in `repository.ts`.
