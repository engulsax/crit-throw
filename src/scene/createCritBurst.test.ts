import { PointLight, Scene, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { CRIT_BEAT_MS } from "../domain/critBeat";
import { createCritBurst } from "./createCritBurst";

const STEP = 1 / 60;

function runFor(burst: ReturnType<typeof createCritBurst>, ms: number) {
  let last = null;
  for (let t = 0; t < ms && !last?.done; t += STEP * 1000) {
    last = burst.update(STEP);
  }
  return last;
}

describe("createCritBurst", () => {
  it("fires sparks and a flash, then returns to idle", () => {
    const scene = new Scene();
    const burst = createCritBurst(scene, 0, 0.55, () => 0.5);
    const flash = scene.children.find((c): c is PointLight => c instanceof PointLight);

    expect(burst.update(STEP)).toBeNull();
    expect(burst.root.visible).toBe(false);

    burst.trigger(new Vector3(0, 0.2, 0));
    const impact = burst.update(STEP);
    expect(impact?.flash).toBeGreaterThan(0);
    expect(burst.root.visible).toBe(true);
    expect(flash?.intensity).toBeGreaterThan(0);

    const end = runFor(burst, CRIT_BEAT_MS);
    expect(end?.done).toBe(true);
    expect(burst.root.visible).toBe(false);
    expect(flash?.intensity).toBe(0);
    expect(burst.update(STEP)).toBeNull();
  });

  it("repeated crits and a mid-beat reset reuse the same objects", () => {
    const scene = new Scene();
    const burst = createCritBurst(scene, 0, 0.55);
    const childCount = scene.children.length;
    const sparkCount = burst.root.children.length;

    for (let i = 0; i < 5; i += 1) {
      burst.trigger(new Vector3(0, 0.2, 0));
      runFor(burst, 400);
      burst.reset();
      expect(burst.root.visible).toBe(false);
    }
    burst.trigger(new Vector3(0, 0.2, 0));
    runFor(burst, CRIT_BEAT_MS);

    expect(scene.children.length).toBe(childCount);
    expect(burst.root.children.length).toBe(sparkCount);

    burst.dispose();
    expect(scene.children.length).toBe(0);
  });
});
