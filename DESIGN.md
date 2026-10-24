# Design — crit-throw tavern diorama

## 1. Material only we own
One D20 natural 20 landing on a **fixed tavern table** — candlelit wood, hearth glow, mug and clutter — choreographed for a hiring-manager scroll, not a dice utility tray.

## 2. Direction: **retro miniature** (forced-perspective diorama)
Earned because the product is a portfolio reel beat, not a tool: the scene should read like a painted tabletop set — warm varnish, exaggerated hearth, tight crop — not a gray physics sandbox or a SaaS “dark mode” panel. Banned: calm editorial layouts, cream paper, soft serif marketing, terracotta CTA as the whole identity.

## 3. One sentence
**The tavern table fills the viewport like a lit miniature, and the gold D20 is the only thing that moves on it.**

## Typography & palette
- Display / HUD: **IBM Plex Mono** (numeric result), system-ui for Roll label
- Body: system-ui stack
- Palette: `#0c0b0a` void, `#2a1f18` timber, `#4a3220` table, `#c9a227` die, `#ff8a3d` hearth ember, `#ffe8c8` candle key
- Banned: Fraunces/Playfair hero, warm paper full-page, purple gradients, generic “fantasy UI” frames

## Last look
2026-10-24 — Playwright screenshots at 390×844, 768×1024, 1440×900 (`npm run dev`).

- **390px:** Die dominated the frame; pulled hero camera back and tightened FOV to 34.
- **768px:** Back walls read as pure black; added warm fill directional + slightly stronger ambient.
- **1440px:** Hearth emissive read as a flat orange slab; reduced emissive intensity for softer glow.

Round 2 at 390px: table and hearth remain visible with Roll HUD clear above bottom edge.

## Last look
2026-10-24 — Playwright on `npm run dev` (localhost:5173) at 390×844, 768×1024, 1440×900.

- **390px:** Intro overlay title sat on the bright hearth; added a top gradient scrim behind overlay copy.
- **768px:** Skip control was easy to miss; bumped default skip label contrast.
- **1440px:** Wide layout read fine; no change after scrim (overlay only shows ~650ms before auto-roll).

Round 2 at 390px after ~9s: settled **20** with focusable **Again** replay; cold load shows intro copy then auto-toss within ~650ms.
