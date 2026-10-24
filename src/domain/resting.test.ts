import { describe, expect, it } from "vitest";
import {
  REST_HOLD_MS,
  createRestTracker,
  updateRestTracker,
} from "./resting";

describe("updateRestTracker", () => {
  it("requires continuous rest before settling", () => {
    const tracker = createRestTracker();
    expect(updateRestTracker(tracker, 0.01, 0.01, 0)).toBe(false);
    expect(updateRestTracker(tracker, 0.01, 0.01, REST_HOLD_MS - 1)).toBe(
      false
    );
    expect(updateRestTracker(tracker, 0.01, 0.01, REST_HOLD_MS)).toBe(true);
  });

  it("resets when motion returns", () => {
    const tracker = createRestTracker();
    updateRestTracker(tracker, 0.01, 0.01, 0);
    updateRestTracker(tracker, 2, 2, 100);
    expect(updateRestTracker(tracker, 0.01, 0.01, 200)).toBe(false);
  });
});
