import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  Points,
  PointsMaterial,
  RGBAFormat,
  RingGeometry,
  Scene,
  Vector3,
} from "three";
import { critBeatFrame, type CritBeatFrame } from "../domain/critBeat";

const SPARK_COUNT = 160;
const SPARK_GRAVITY = 5.5;
const SPARK_DRAG = 1.4;
const SPARK_BOUNCE = 0.3;
const FLASH_PEAK = 30;
const RING_LIFE = 0.55;
const RING_MAX_SCALE = 2.6;
const DIE_GOLD = new Color(0xffd36a);
const HEARTH_EMBER = new Color(0xff8a3d);

export type CritBurst = {
  root: Group;
  /** Starts the beat at the settled die; restarts cleanly if already running. */
  trigger: (origin: Vector3) => void;
  /** Advances the beat; returns null when idle. */
  update: (dtSec: number) => CritBeatFrame | null;
  reset: () => void;
  dispose: () => void;
};

function createSparkSprite(): DataTexture {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  const half = (size - 1) / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = Math.hypot(x - half, y - half) / half;
      const a = Math.max(0, 1 - d) ** 2;
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.round(a * 255);
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createCritBurst(
  scene: Scene,
  tableSurfaceY: number,
  dieRadius: number,
  random: () => number = Math.random
): CritBurst {
  const root = new Group();
  root.name = "crit-burst";
  root.visible = false;

  const positions = new Float32Array(SPARK_COUNT * 3);
  const velocities = new Float32Array(SPARK_COUNT * 3);
  const colors = new Float32Array(SPARK_COUNT * 3);
  const tint = new Color();
  for (let i = 0; i < SPARK_COUNT; i += 1) {
    tint.copy(HEARTH_EMBER).lerp(DIE_GOLD, random());
    tint.toArray(colors, i * 3);
  }

  const sparkGeometry = new BufferGeometry();
  const positionAttr = new BufferAttribute(positions, 3);
  sparkGeometry.setAttribute("position", positionAttr);
  sparkGeometry.setAttribute("color", new BufferAttribute(colors, 3));
  const sparkSprite = createSparkSprite();
  const sparkMaterial = new PointsMaterial({
    size: 0.16,
    map: sparkSprite,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const sparks = new Points(sparkGeometry, sparkMaterial);
  sparks.frustumCulled = false;
  root.add(sparks);

  const ringGeometry = new RingGeometry(0.82, 1, 48);
  const ringMaterial = new MeshBasicMaterial({
    color: DIE_GOLD,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  });
  const ring = new Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  root.add(ring);

  const flashLight = new PointLight(DIE_GOLD, 0, 6, 2);
  scene.add(flashLight);
  scene.add(root);

  let elapsedMs = 0;
  let active = false;

  const reset = () => {
    active = false;
    elapsedMs = 0;
    root.visible = false;
    flashLight.intensity = 0;
  };

  const trigger = (origin: Vector3) => {
    for (let i = 0; i < SPARK_COUNT; i += 1) {
      const o = i * 3;
      const angle = random() * Math.PI * 2;
      positions[o] = origin.x + Math.cos(angle) * dieRadius * 0.6;
      positions[o + 1] = origin.y + dieRadius * 0.7;
      positions[o + 2] = origin.z + Math.sin(angle) * dieRadius * 0.6;
      const spread = 0.35 + random() * 1.15;
      const lift = 1.6 + random() * 2.2;
      velocities[o] = Math.cos(angle) * spread;
      velocities[o + 1] = lift;
      velocities[o + 2] = Math.sin(angle) * spread;
    }
    positionAttr.needsUpdate = true;
    ring.position.set(origin.x, tableSurfaceY + 0.004, origin.z);
    flashLight.position.set(origin.x, origin.y + dieRadius + 0.35, origin.z + 0.3);
    elapsedMs = 0;
    active = true;
    root.visible = true;
  };

  const update = (dtSec: number): CritBeatFrame | null => {
    if (!active) return null;
    elapsedMs += dtSec * 1000;
    const frame = critBeatFrame(elapsedMs);
    if (frame.done) {
      reset();
      return frame;
    }

    const drag = Math.max(0, 1 - SPARK_DRAG * dtSec);
    for (let i = 0; i < SPARK_COUNT; i += 1) {
      const o = i * 3;
      velocities[o + 1] -= SPARK_GRAVITY * dtSec;
      velocities[o] *= drag;
      velocities[o + 1] *= drag;
      velocities[o + 2] *= drag;
      positions[o] += velocities[o] * dtSec;
      positions[o + 1] += velocities[o + 1] * dtSec;
      positions[o + 2] += velocities[o + 2] * dtSec;
      if (positions[o + 1] < tableSurfaceY) {
        positions[o + 1] = tableSurfaceY;
        velocities[o + 1] *= -SPARK_BOUNCE;
      }
    }
    positionAttr.needsUpdate = true;
    sparkMaterial.opacity = (1 - frame.burst) ** 1.5;

    const ringT = Math.min(1, frame.burst / RING_LIFE);
    ring.visible = ringT < 1;
    ring.scale.setScalar(dieRadius + (1 - (1 - ringT) ** 3) * RING_MAX_SCALE);
    ringMaterial.opacity = 0.85 * (1 - ringT) ** 2;

    flashLight.intensity = frame.flash * FLASH_PEAK;
    return frame;
  };

  return {
    root,
    trigger,
    update,
    reset,
    dispose: () => {
      scene.remove(root);
      scene.remove(flashLight);
      sparkGeometry.dispose();
      sparkMaterial.dispose();
      sparkSprite.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      flashLight.dispose();
    },
  };
}
