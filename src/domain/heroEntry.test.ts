import { describe, expect, it } from "vitest";
import {
  canTriggerHeroRoll,
  showReplayControl,
} from "./heroEntry";

describe("hero entry", () => {
  it("shows replay after the auto crit finishes", () => {
    expect(showReplayControl(0)).toBe(false);
    expect(showReplayControl(1)).toBe(true);
    expect(showReplayControl(2)).toBe(false);
  });

  it("allows auto roll and one manual replay", () => {
    expect(canTriggerHeroRoll(0, false)).toBe(true);
    expect(canTriggerHeroRoll(0, true)).toBe(false);
    expect(canTriggerHeroRoll(1, false)).toBe(true);
    expect(canTriggerHeroRoll(2, false)).toBe(false);
  });
});
