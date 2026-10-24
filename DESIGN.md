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

## Crit beat
Natural 20 on settle fires one 1.6s beat from a single clock: hearth-ember and die-gold sparks off the die's shoulders, a gold shockwave on the table, a gold flash light that lights the room, the die's own glow, a camera push-in with a short shake, and the HUD number stamping in gold. No new copy; the tavern itself carries the moment. Reduced motion keeps the light and sparks and drops camera movement and the stamp.

## Last look
2026-10-24 — Playwright (Chromium, SwiftShader) on `npm run dev` at 390×844, 768×1024, 1440×900; frames at crit +90ms, +440ms, and idle +2.2s.

- **1440px:** Impact frame was black and the die was missing. The hero toss flung the die to z≈8, behind the camera, so the push-in swung the camera around. Retuned the toss to settle at table center and added an on-table assertion to the hero integration test.
- **768px:** Sparks read as fine dust, the flash barely lit the table, and the ring was hidden under the die. Doubled spark size, spawned sparks from the die's shoulders, raised the flash peak, and started the ring at the die edge.
- **390px:** The push-in crowded the die past both frame edges. Push distance now scales with aspect ratio.

Round 2: at every width, sparks fountain over the hearth and the die's top face ignites. After the beat, the camera returns to the same framing as before it. Idle FPS matched before and after a second crit at all three widths (22/23, 10/9, 7/6 under software GL). Still weak: the die is oversized for the table, and the shockwave ring is barely visible behind it.
