# crit-throw

For hiring managers skimming a front-end reel, crit-throw is a single-page WebGL demo that choreographs one D20 natural 20 in a tavern diorama—not a general polyhedral dice utility.

## Local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static output in dist/
npm run preview      # serve dist/ at http://localhost:4173
npm test             # unit + integration
npm run test:hero    # Playwright hero crit on preview (run preview first)
```

## Deploy (GitHub Pages)

The Vite `base` is `./` so assets resolve under a project URL such as `https://<user>.github.io/crit-throw/` (see `vite.config.ts`). No secrets or env files are required.

1. Build: `npm run build`
2. Publish `dist/` to the `gh-pages` branch (one-time [Pages](https://github.com/engulsax/crit-throw/settings/pages) source: **Deploy from branch** → `gh-pages` → `/ (root)`):

   ```bash
   npx gh-pages -d dist
   ```

3. After GitHub finishes the Pages build, open `https://engulsax.github.io/crit-throw/` — intro overlay, auto hero roll, crit on 20, one **Again** replay.

To verify the production bundle locally before pushing: `npm run preview` in one terminal, then `npm run test:hero` in another.
