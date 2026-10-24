import { describe, expect, it } from "vitest";
import {
  Body,
  ContactMaterial,
  Material,
  NaiveBroadphase,
  Plane,
  Vec3,
  World,
} from "cannon-es";
import { Quaternion } from "three";
import { buildD20FaceSet, readSettledD20Value } from "../domain/d20Faces";
import {
  REST_HOLD_MS,
  createRestTracker,
  updateRestTracker,
} from "../domain/resting";
import { createD20Body, tossD20 } from "./d20Body";

function simulateSettledRoll(seed: number): number {
  const world = new World({ gravity: new Vec3(0, -14, 0) });
  world.broadphase = new NaiveBroadphase();

  const diceMaterial = new Material("dice");
  const floorMaterial = new Material("floor");
  world.addContactMaterial(
    new ContactMaterial(diceMaterial, floorMaterial, {
      friction: 0.45,
      restitution: 0.22,
    })
  );

  const floorBody = new Body({ mass: 0, material: floorMaterial });
  floorBody.addShape(new Plane());
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(floorBody);

  const d20 = createD20Body(world, diceMaterial);
  const faceSet = buildD20FaceSet(d20.radius);

  const originalRandom = Math.random;
  Math.random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  tossD20(d20.body, d20.radius);
  Math.random = originalRandom;

  const tracker = createRestTracker();
  const orientation = new Quaternion();
  const step = 1 / 60;
  let now = 0;
  const maxSteps = 60 * 8;

  for (let i = 0; i < maxSteps; i++) {
    world.step(step);
    now += step * 1000;
    const linear = d20.body.velocity.length();
    const angular = d20.body.angularVelocity.length();
    if (updateRestTracker(tracker, linear, angular, now)) {
      orientation.set(
        d20.body.quaternion.x,
        d20.body.quaternion.y,
        d20.body.quaternion.z,
        d20.body.quaternion.w
      );
      return readSettledD20Value(faceSet, orientation);
    }
  }

  throw new Error(`Die did not settle within ${maxSteps} steps`);
}

describe("D20 physics roll", () => {
  it("settles to a value between 1 and 20", () => {
    const value = simulateSettledRoll(42);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(20);
  });

  it("produces varied outcomes across repeated tosses", () => {
    const seen = new Set<number>();
    for (let seed = 1; seed <= 12; seed++) {
      seen.add(simulateSettledRoll(seed * 997));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("settles within rest hold window after motion stops", () => {
    const tracker = createRestTracker();
    expect(updateRestTracker(tracker, 0.01, 0.01, 0)).toBe(false);
    expect(updateRestTracker(tracker, 0.01, 0.01, REST_HOLD_MS)).toBe(true);
  });
});
