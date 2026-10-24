import {
  Body,
  Quaternion as CQuaternion,
  Vec3,
} from "cannon-es";
import { Quaternion, Vector3 } from "three";
import type { D20FaceSet } from "../domain/d20Faces";

const UP = new Vector3(0, 1, 0);
const _target = new Quaternion();
const _current = new Quaternion();
const _delta = new Quaternion();
const _axis = new Vector3();

export function orientationForTopFace(
  faceSet: D20FaceSet,
  value: number
): Quaternion {
  const faceIndex = faceSet.faceValues.indexOf(value);
  if (faceIndex < 0) {
    throw new Error(`D20 has no face with value ${value}`);
  }
  return new Quaternion().setFromUnitVectors(
    faceSet.faceNormals[faceIndex]!.clone(),
    UP
  );
}

/** Fixed throw that reads as a toss; settle guidance finishes on 20. */
export function tossHeroD20(body: Body, radius: number): void {
  body.wakeUp();
  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);

  body.position.set(-0.5, radius + 0.9, -0.45);

  const q = new CQuaternion();
  q.setFromEuler(1.05, 2.35, 0.55);
  body.quaternion.copy(q);

  body.applyImpulse(new Vec3(0.25, 0.25, 0.15));
  body.applyTorque(new Vec3(1.4, -1.8, 2.2));
}

const GUIDE_LINEAR_MAX = 1.35;
const GUIDE_ANGULAR_MAX = 9.5;
const GUIDE_TORQUE = 3.8;

/** Nudge the die toward target face-up while it is already slowing — not a snap. */
export function applyHeroSettleGuidance(
  body: Body,
  faceSet: D20FaceSet,
  targetValue: number
): void {
  const linear = body.velocity.length();
  const angular = body.angularVelocity.length();
  if (linear > GUIDE_LINEAR_MAX || angular > GUIDE_ANGULAR_MAX) {
    return;
  }

  _target.copy(orientationForTopFace(faceSet, targetValue));
  _current.set(
    body.quaternion.x,
    body.quaternion.y,
    body.quaternion.z,
    body.quaternion.w
  );
  _delta.copy(_target).multiply(_current.invert());

  if (_delta.w < 0) {
    _delta.x = -_delta.x;
    _delta.y = -_delta.y;
    _delta.z = -_delta.z;
    _delta.w = -_delta.w;
  }

  const angle = 2 * Math.acos(Math.min(1, _delta.w));
  if (angle < 0.002) {
    return;
  }

  const sinHalf = Math.sqrt(1 - _delta.w * _delta.w);
  if (sinHalf > 1e-4) {
    _axis.set(_delta.x / sinHalf, _delta.y / sinHalf, _delta.z / sinHalf);
  } else {
    _axis.set(1, 0, 0);
  }

  const falloff =
    1 - Math.min(1, linear / GUIDE_LINEAR_MAX) * 0.35;
  const torqueScale = GUIDE_TORQUE * falloff * Math.min(1, angle / 0.85);

  body.torque.x += _axis.x * torqueScale;
  body.torque.y += _axis.y * torqueScale;
  body.torque.z += _axis.z * torqueScale;
}
