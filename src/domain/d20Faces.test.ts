import { describe, expect, it } from "vitest";
import { Euler, Quaternion } from "three";
import { buildD20FaceSet, readSettledD20Value } from "./d20Faces";

describe("readSettledD20Value", () => {
  it("returns a value between 1 and 20 for identity orientation", () => {
    const faceSet = buildD20FaceSet(1);
    const value = readSettledD20Value(faceSet, new Quaternion());
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(20);
  });

  it("changes when the die is rotated to another face-up pose", () => {
    const faceSet = buildD20FaceSet(1);
    const base = readSettledD20Value(faceSet, new Quaternion());

    const rotated = new Quaternion().setFromEuler(
      new Euler(2.1, 0.7, 1.4, "XYZ")
    );
    const other = readSettledD20Value(faceSet, rotated);

    expect(other).toBeGreaterThanOrEqual(1);
    expect(other).toBeLessThanOrEqual(20);
    expect(other).not.toBe(base);
  });
});
