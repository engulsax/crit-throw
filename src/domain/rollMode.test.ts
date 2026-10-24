import { describe, expect, it } from "vitest";
import { activeRollMode } from "./rollMode";

describe("rollMode", () => {
  it("defaults to hero for the public demo", () => {
    expect(activeRollMode()).toBe("hero");
  });
});
