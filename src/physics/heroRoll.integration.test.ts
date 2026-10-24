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
  createRestTracker,
  updateRestTracker,
} from "../domain/resting";
import { createD20Body } from "./d20Body";
import {
  applyHeroSettleGuidance,
  tossHeroD20,
} from "./heroRoll";

const TABLE_Y = 0;

const TABLE_HALF_WIDTH = 1.3;
const TABLE_HALF_DEPTH = 0.875;

type SettledHeroRoll = { value: number; x: number; z: number };

function simulateHeroSettledRoll(run: number): SettledHeroRoll {
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
  floorBody.position.set(0, TABLE_Y, 0);
  world.addBody(floorBody);

  const d20 = createD20Body(world, diceMaterial);
  d20.body.position.y = TABLE_Y + d20.radius + 0.05;
  const faceSet = buildD20FaceSet(d20.radius);

  tossHeroD20(d20.body, d20.radius);
  d20.body.position.x += (run % 3) * 0.01 - 0.01;

  const tracker = createRestTracker();
  const orientation = new Quaternion();
  const step = 1 / 60;
  let now = 0;
  const maxSteps = 60 * 10;

  for (let i = 0; i < maxSteps; i++) {
    world.step(step);
    applyHeroSettleGuidance(d20.body, faceSet, 20);
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
      return {
        value: readSettledD20Value(faceSet, orientation),
        x: d20.body.position.x,
        z: d20.body.position.z,
      };
    }
  }

  throw new Error(`Hero die did not settle within ${maxSteps} steps`);
}

describe("Hero roll choreography", () => {
  it("lands on 20 for ten consecutive portfolio rolls", () => {
    for (let run = 1; run <= 10; run++) {
      expect(simulateHeroSettledRoll(run).value).toBe(20);
    }
  });

  it("settles on the tavern table, in front of the hero camera", () => {
    for (let run = 1; run <= 3; run++) {
      const { x, z } = simulateHeroSettledRoll(run);
      expect(Math.abs(x)).toBeLessThan(TABLE_HALF_WIDTH);
      expect(Math.abs(z)).toBeLessThan(TABLE_HALF_DEPTH);
    }
  });
});
