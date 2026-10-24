import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WORKFLOW = resolve(process.cwd(), ".github/workflows/deploy-pages.yml");

describe("GitHub Pages deploy workflow", () => {
  it("builds dist and publishes via official Pages actions on push to main", () => {
    expect(existsSync(WORKFLOW)).toBe(true);
    const yaml = readFileSync(WORKFLOW, "utf8");
    expect(yaml).toContain("branches: [main]");
    expect(yaml).toContain("npm run build");
    expect(yaml).toContain("actions/upload-pages-artifact@v3");
    expect(yaml).toContain("actions/deploy-pages@v4");
    expect(yaml).toContain("path: dist");
    expect(yaml).toContain("pages: write");
    expect(yaml).toContain("id-token: write");
  });
});
