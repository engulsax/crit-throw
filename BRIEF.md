# Project brief

Status: ready
Goal: Create a small dice rolling app for DnD, use three js make it top of the art 3d envioerment dice roll with effects.
Name: crit-throw
Rounds: 5

## Who
Developer who plays in-person D&D with physical dice; building for hiring-manager portfolio review, not table use

## Pain
No pain at the table—never opens digital rollers during play. Portfolio pain: tray-first 3D dice demos are crowded; must win on one memorable crit beat, not feature parity

## What they do today
Physical polyhedral dice at the table; portfolio comparables are complete tray demos (DnDie, Solarise) and free utility rollers (3d.dev, Minva)

## Positioning
For hiring managers skimming a front-end reel, crit-throw is a single-page WebGL demo that choreographs one D20 natural 20 in a tavern diorama—not a general polyhedral dice utility.

## Cooler option on the table
Solo cinematic one-page 3D tavern (chosen over Owlbear-style synced multiplayer VTT extension)

## Constraints
- Solo browser; no VTT or Owlbear plugin path
- One fixed tavern backdrop; not explorable rooms
- No accounts, no friend rooms
- V1 scope: one D20 crit moment, not full D4–D20 toolkit

## Ideas we rejected
- Owlbear-style synced multiplayer VTT extension
- VTT marketplace / plugin competition with dddice ecosystem
- DnDie-style full polyhedral toolkit portfolio
- Explorable walk-in tavern experience (hero crit moment instead)

## Risks / why this dies
- Free incumbents (3d.dev, Owlbear, dddice, Minva) already ship 3D physics and nat-20 callouts
- Real-dice habit makes another roller redundant without a named spectacle moment
- open-dice-dnd v1.2.0 already ships spell-school and crit VFX—bar is environment and feel, not physics alone
- Tray-first portfolio rollers (DnDie, Solarise) set high completeness if scope creeps to generic toolkit
- Reviewers may spend seconds—crit beat must land with zero onboarding

## What we looked up
- Forgot My Dice Again — free 3D physics, eight scenes, friend rooms — https://3d.dev/
- Nocturne Dice — free WebGL2 3D D&D roller — https://austinbeaulier.com/dice/
- Owlbear Rodeo Dice extension — synced 3D physics for online play — https://extensions.owlbear.rodeo/dice
- dice-box-threejs — Three.js + Cannon embeddable module — https://github.com/3d-dice/dice-box-threejs
- dddice — custom 3D dice and VTT embeds — https://extensions.owlbear.rodeo/dddice
- open-dice-dnd — MIT Three.js + Cannon-es, spell-school VFX, embeddable API (2025) — https://github.com/richardhealy/open-dice/
- Project-Swords — one-file charge-throw 3D roller demo (2026) — https://johnbarongillespie.github.io/project-swords-rpg-dice-roller/
- dddice marketplace — custom 3D themes about $4.99–$7.99 — https://dddice.com/product
- Solarise Tabletop Dice Roller — polished Three.js + Cannon demo — https://solarise.dev/demos/3d-physics-dice-roller/about
- open-dice-dnd npm v1.2.0 — ten damage-type roll effects, seven settled-state effects — https://www.npmjs.com/package/open-dice-dnd
- JDR Ninja — free OBS dice overlay via Twitch chat — https://www.jdr.ninja/en/streamers
- dddice Streaming Mode — transparent OBS overlay — https://dddice.com/for-streamers
- Project-Swords — charge-throw 3D roller demo — https://johnbarongillespie.github.io/project-swords-rpg-dice-roller/
- DnDie — portfolio Three.js + Cannon-es tray, D4–D20, static deploy — https://isaklindgren.com/projects/dndie/
- Arcane Dice Tower — Feb 2026 Vite PWA, tower path, crit/fail VFX — https://github.com/charlesjohnson/arcane-dice-tower/
- Dice Atelier — 20 themed tables, notation, mixed pools (2026) — https://dev.to/penguinwearingahat/building-dice-atelier-a-3d-dice-roller-with-20-themed-tables-built-by-two-ais-and-one-director-1cml
- 3DRoll — transmission/holographic materials showcase on Three.js forum (Oct 2026) — https://discourse.threejs.org/t/3droll-physics-based-3d-dice-in-the-browser-18-materials-links-that-set-the-dice-and-material/95543
- DnDie — portfolio Three.js + Cannon-es tray, D4–D20 — https://isaklindgren.com/projects/dndie/
- Minva — free 3D physics roller with automatic nat 20 callouts — https://minvarpg.com/tools/dice-roller
- Project-Swords — charge-throw 3D roller demo (2026) — https://johnbarongillespie.github.io/project-swords-rpg-dice-roller/

## Why we are ready to plan
Portfolio-only Three.js piece: single D20 nat-20 hero moment in fixed tavern diorama; not toolkit, VTT, or explorable tavern. User rolls physical dice at play.

