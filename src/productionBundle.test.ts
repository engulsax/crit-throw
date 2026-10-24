import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const LIVE = "https://engulsax.github.io/crit-throw/";

describe("production bundle", () => {
  it("uses relative asset URLs for GitHub Pages subpaths", () => {
    const html = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");
    expect(html).toMatch(/src="\.\/assets\//);
    expect(html).toMatch(/href="\.\/assets\//);
    expect(html).not.toMatch(/src="\/assets\//);
  });

  it("ships link-preview meta, favicon, and og image asset", () => {
    const html = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");
    expect(html).toContain('property="og:image"');
    expect(html).toContain(`${LIVE}og-image.png`);
    expect(html).toContain('href="./favicon.svg"');
    expect(existsSync(resolve(process.cwd(), "dist/og-image.png"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "dist/favicon.svg"))).toBe(true);
  });

  it("ships hero auto-roll (not dev random mode)", () => {
    const assetsDir = resolve(process.cwd(), "dist/assets");
    const jsName = readdirSync(assetsDir).find(
      (f) => f.startsWith("index-") && f.endsWith(".js")
    );
    expect(jsName, "run npm run build before this test").toBeTruthy();
    const js = readFileSync(resolve(assetsDir, jsName!), "utf8");
    expect(js).toContain(String(650));
    expect(js).not.toMatch(/DEV_RANDOM_ROLL&&true/);
  });
});
