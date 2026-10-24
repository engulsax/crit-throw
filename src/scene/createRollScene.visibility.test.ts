import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("createRollScene visibility pause", () => {
  const src = readFileSync(
    resolve(process.cwd(), "src/scene/createRollScene.ts"),
    "utf8"
  );

  it("pauses rAF while hidden and resets frame clock when tab is visible again", () => {
    expect(src).toContain('addEventListener("visibilitychange", onVisibilityChange)');
    expect(src).toContain(
      'removeEventListener("visibilitychange", onVisibilityChange)'
    );
    expect(src).toMatch(/if\s*\(\s*document\.hidden\s*\)/);
    expect(src).toMatch(/cancelAnimationFrame\s*\(\s*raf\s*\)/);
    expect(src).toMatch(/lastFrameMs\s*=\s*performance\.now\(\)/);
    expect(src).toMatch(/const scheduleTick = \(\) => \{[\s\S]*requestAnimationFrame\(tick\)/);
    expect(src).toMatch(/if\s*\(\s*disposed\s*\|\|\s*!tabVisible\s*\)\s*return/);
  });
});
