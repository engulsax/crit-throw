import { describe, expect, it } from "vitest";
import { CRIT_BEAT_MS, critBeatFrame, isNaturalCrit } from "./critBeat";

describe("crit beat", () => {
  it("only a natural 20 is a crit", () => {
    expect(isNaturalCrit(20)).toBe(true);
    expect(isNaturalCrit(19)).toBe(false);
    expect(isNaturalCrit(1)).toBe(false);
  });

  it("peaks flash, shake, and push early, well inside 2s of settle", () => {
    const impact = critBeatFrame(60);
    expect(impact.flash).toBe(1);
    expect(impact.shake).toBeGreaterThan(0.5);
    expect(critBeatFrame(300).push).toBe(1);
    expect(CRIT_BEAT_MS).toBeLessThanOrEqual(2000);
  });

  it("returns to a still idle frame when the beat ends", () => {
    const end = critBeatFrame(CRIT_BEAT_MS);
    expect(end).toEqual({ flash: 0, shake: 0, push: 0, burst: 1, done: true });
    expect(critBeatFrame(CRIT_BEAT_MS - 1).done).toBe(false);
  });
});
