import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("entry shell", () => {
  it("exposes Roll control and result HUD", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    expect(html).toContain('id="roll"');
    expect(html).toContain("Roll");
    expect(html).toContain('id="result"');
  });
});
