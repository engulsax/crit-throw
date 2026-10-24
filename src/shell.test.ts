import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("entry shell", () => {
  const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

  it("has document title and zero-onboarding overlay copy", () => {
    expect(html).toContain("<title>Crit Throw — tavern natural 20</title>");
    expect(html).toContain('class="overlay__title">Crit Throw</h1>');
    expect(html).toContain("Candlelit table. One gold die.");
  });

  it("exposes focusable replay control and result HUD", () => {
    expect(html).toContain('id="roll"');
    expect(html).toContain("Again");
    expect(html).toContain('id="result"');
    expect(html).toContain('id="skip"');
  });

  it("includes share meta, favicon, and spoiler-free description", () => {
    expect(html).toContain('name="description"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:url"');
    expect(html).toContain('property="og:type"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('name="twitter:image"');
    expect(html).toContain('rel="icon"');
    expect(html).toContain("./favicon.svg");
    expect(html).not.toMatch(/name="description"[^>]*content="[^"]*natural 20/i);
    expect(html).not.toMatch(/property="og:description"[^>]*content="[^"]*natural 20/i);
  });
});
