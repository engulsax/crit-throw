import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("production bundle", () => {
  it("uses relative asset URLs for GitHub Pages subpaths", () => {
    const html = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");
    expect(html).toMatch(/src="\.\/assets\//);
    expect(html).toMatch(/href="\.\/assets\//);
    expect(html).not.toMatch(/src="\/assets\//);
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
