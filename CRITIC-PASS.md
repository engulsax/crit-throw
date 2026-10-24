# Pre-ship adversarial review — 2026-10-24

Scope: production preview (`npm run build && npm run preview`), hero path load → auto crit → Again replay at 390 / 768 / 1440. Playwright + manual skip/mouse checks.

**Headline (user quote):** “It told me it would hit twenty before I even saw the die move — why am I watching?”

## Findings

| Severity | Where | Reproduce | Why it matters |
|----------|-------|-----------|----------------|
| **major** | `#overlay` copy | Cold load | Line spoils the nat-20 payoff and reads like demo narration, not a tavern beat. **Fixed:** shorter line without outcome spoiler. |
| **paper-cut** | `#overlay` timing | Load page | Auto-roll at 650ms hides intro before most humans finish reading title + line. Acceptable for reel; bad if Skip is meant for “read first.” |
| **paper-cut** | `.overlay` + `#skip` | Playwright `locator.click` | Parent `pointer-events: none` makes automated “visible” checks fail; real `mouse.click` at button coords and DOM `.click()` work. |
| **paper-cut** | `dist/assets/*.js` | `npm run build` | ~571 kB minified Three+cannon chunk; first visit on mobile data stutters before WebGL starts. Not hero-breaking for portfolio host. |
| **paper-cut** | `index.html` fonts | Offline / blocked Google | IBM Plex Mono falls back to system monospace; HUD still readable. |
| **paper-cut** | `DESIGN.md` Last look entries | — | Multiple “Last look” sections; history only, not a runtime bug. |

## P0 status

- Hero auto-roll → settled **20** + `result--crit` on production preview: **pass** (`node scripts/hero-preview-check.mjs`).
- Again replay → second **20**, replay control hides after second roll: **pass**.
- Console errors on hero path: **none** observed.
- HUD legibility at 390px: **pass** (3rem tabular result above safe-area bottom inset).

## Verification commands

- `npm test` — unit/integration + production bundle guard
- `npm run build`
- `npm run preview` then `node scripts/hero-preview-check.mjs` (production hero e2e)
