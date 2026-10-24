import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const LIVE = "https://engulsax.github.io/crit-throw/";

describe("README live URL", () => {
  it("documents the canonical GitHub Pages demo link", () => {
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");
    expect(readme).toContain(LIVE);
  });
});
