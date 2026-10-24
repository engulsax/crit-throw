# Mood
Surface: Fixed tavern diorama — hero camera on the crit roll zone

## References
- DnDie (Isak Lindgren) — https://isaklindgren.com/projects/dndie/
  Layout: Tray and dice fill the viewport; UI is a thin strip, not a dashboard.
  Leave: Multi-die toolkit tray; we show one D20 moment.
- Solarise Tabletop Dice Roller — https://solarise.dev/demos/3d-physics-dice-roller/about
  Layout: Table surface is the horizon line; environment is backdrop, not explorable space.
  Leave: Generic polyhedral picker chrome.
- open-dice-dnd — https://github.com/richardhealy/open-dice/
  Layout: Full-screen WebGL stage; effects originate from the die, scene stays readable.
  Leave: Spell-school VFX catalog as the hero.
- Dice Atelier — https://dev.to/penguinwearingahat/building-dice-atelier-a-3d-dice-roller-with-20-themed-tables-built-by-two-ais-and-one-director-1cml
  Layout: Themed table is the identity; one camera angle sells the room in seconds.
  Leave: Twenty-table breadth; we commit to one tavern.
- Project-Swords RPG Dice Roller — https://johnbarongillespie.github.io/project-swords-rpg-dice-roller/
  Layout: Charge-to-throw motion reads against a simple ground plane; die is always center mass.
  Leave: Charge mechanic; physics toss stays as-is.
- Minva 3D Dice — https://minvarpg.com/tools/dice-roller
  Layout: Result HUD floats over the canvas bottom; scene never scrolls.
  Leave: Utility-first minimal room.

## Three structures
- A: Low three-quarter camera over a plank table; back wall + hearth fills upper frame; HUD docked below die — tradeoff: less “room”, more jewelry-box diorama.
- B: Eye-level across the table; mug and candle in foreground bokeh; hearth glow behind — tradeoff: harder to read die faces on small screens.
- C: Slightly elevated hero angle (chosen): table center is crit zone; walls taper in with warm fog; props sit mid-ground — tradeoff: less immersive walk-in, stronger portfolio thumbnail.
