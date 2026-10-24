# crit-throw

**Live demo:** [https://engulsax.github.io/crit-throw/](https://engulsax.github.io/crit-throw/)

For hiring managers skimming a front-end reel, crit-throw is a single-page WebGL demo that choreographs one D20 natural 20 in a tavern diorama—not a general polyhedral dice utility.

## Local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static output in dist/
npm run preview      # serve dist/ at http://localhost:4173
npm test             # unit + integration
npm run test:hero    # Playwright hero crit on preview (run preview first)
npm run test:hero:live  # same check against the public GitHub Pages URL
```

## Deploy (GitHub Pages)

The Vite `base` is `./` so assets resolve under [https://engulsax.github.io/crit-throw/](https://engulsax.github.io/crit-throw/) (see `vite.config.ts`). No secrets or env files are required. The repository must be **public** for GitHub Pages on the free plan.

**Automated:** every push to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) — `npm ci`, `npm test`, `npm run build`, then the official `upload-pages-artifact` / `deploy-pages` pair publishes `dist/`.

**One-time repo setup:** [Pages settings](https://github.com/engulsax/crit-throw/settings/pages) → **Build and deployment** → Source: **GitHub Actions** (not the `gh-pages` branch).

After a successful workflow run, open the live demo — intro overlay, auto hero roll, crit on 20, one **Again** replay. Manual fallback: `npm run build` then `npx gh-pages -d dist` if you still use branch-based Pages.

To verify the production bundle locally before pushing: `npm run preview` in one terminal, then `npm run test:hero` in another.
