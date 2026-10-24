import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  Body,
  ContactMaterial,
  Material,
  NaiveBroadphase,
  Plane,
  Vec3,
  World,
} from "cannon-es";
import { isNaturalCrit, type CritBeatFrame } from "../domain/critBeat";
import { buildD20FaceSet, readSettledD20Value } from "../domain/d20Faces";
import {
  canTriggerHeroRoll,
  HERO_AUTO_START_MS,
  showReplayControl,
} from "../domain/heroEntry";
import { activeRollMode } from "../domain/rollMode";
import { createRestTracker, updateRestTracker } from "../domain/resting";
import { createD20Body, tossD20 } from "../physics/d20Body";
import {
  applyHeroSettleGuidance,
  tossHeroD20,
} from "../physics/heroRoll";
import { createCritBurst } from "./createCritBurst";
import { createTavernDiorama } from "./createTavernDiorama";

const FIXED_STEP = 1 / 60;
const LOOK_AT = new Vector3(0, 0.38, 0);
const CRIT_PUSH_DISTANCE = 0.38;
const CRIT_PUSH_FULL_ASPECT = 1.3;
const CRIT_LOOK_PULL = 0.5;
const CRIT_SHAKE = 0.03;
const CRIT_DIE_GLOW = 1.1;

function applyHeroFraming(camera: PerspectiveCamera, aspect: number): void {
  if (aspect < 0.72) {
    camera.position.set(0.55, 1.72, 4.25);
    camera.fov = 34;
  } else if (aspect > 1.65) {
    camera.position.set(0.35, 1.52, 3.75);
    camera.fov = 44;
  } else {
    camera.position.set(0.5, 1.62, 3.42);
    camera.fov = 41;
  }
  camera.lookAt(LOOK_AT);
  camera.updateProjectionMatrix();
}

export type RollScene = {
  renderer: WebGLRenderer;
  dispose: () => void;
};

export function createRollScene(canvas: HTMLCanvasElement): RollScene {
  const resultEl = document.querySelector<HTMLElement>("#result");
  const rollBtn = document.querySelector<HTMLButtonElement>("#roll");
  const overlayEl = document.querySelector<HTMLElement>("#overlay");
  const skipBtn = document.querySelector<HTMLButtonElement>("#skip");
  if (!resultEl || !rollBtn || !overlayEl || !skipBtn) {
    throw new Error("HUD elements missing");
  }

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(new Color(0x0c0b0a));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const camera = new PerspectiveCamera(41, 1, 0.1, 40);

  scene.add(new HemisphereLight(0xffe8cc, 0x1a120c, 0.45));
  scene.add(new AmbientLight(0x3a2a20, 0.28));

  const fill = new DirectionalLight(0xffa866, 0.28);
  fill.position.set(-1.5, 2.2, -2.5);
  scene.add(fill);

  const key = new DirectionalLight(0xffeedd, 0.75);
  key.position.set(2.2, 4.5, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 12;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  scene.add(key);

  const tavern = createTavernDiorama(scene);

  const world = new World({ gravity: new Vec3(0, -14, 0) });
  world.broadphase = new NaiveBroadphase();
  world.allowSleep = true;

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
  floorBody.position.set(0, tavern.tableSurfaceY, 0);
  world.addBody(floorBody);

  const d20 = createD20Body(world, diceMaterial);
  const faceSet = buildD20FaceSet(d20.radius);

  const diceMeshMaterial = new MeshStandardMaterial({
    color: 0xc9a227,
    metalness: 0.35,
    roughness: 0.45,
    flatShading: true,
    emissive: 0xffb340,
    emissiveIntensity: 0,
  });
  const diceMesh = new Mesh(new IcosahedronGeometry(d20.radius, 0), diceMeshMaterial);
  diceMesh.castShadow = true;
  scene.add(diceMesh);

  const critBurst = createCritBurst(scene, tavern.tableSurfaceY, d20.radius);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cameraBase = new Vector3();
  const cameraPushDir = new Vector3();
  const lookTarget = new Vector3();

  const meshQuat = new Quaternion();
  const restTracker = createRestTracker();
  let rolling = false;
  let completedRolls = 0;
  let accumulator = 0;
  let raf = 0;
  let disposed = false;
  let lastFrameMs = performance.now();
  let autoStartTimer = 0;

  const hideOverlay = () => {
    overlayEl.classList.add("overlay--hidden");
    skipBtn.hidden = true;
  };

  const syncReplayControl = () => {
    const show = showReplayControl(completedRolls);
    rollBtn.hidden = !show;
    if (show) {
      rollBtn.focus({ preventScroll: true });
    }
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    const aspect = w / h;
    camera.aspect = aspect;
    applyHeroFraming(camera, aspect);
    cameraBase.copy(camera.position);
    renderer.setSize(w, h, false);
  };

  const applyCritCamera = (frame: CritBeatFrame | null, nowMs: number) => {
    camera.position.copy(cameraBase);
    lookTarget.copy(LOOK_AT);
    if (frame && !reducedMotion.matches) {
      cameraPushDir.subVectors(diceMesh.position, cameraBase).normalize();
      const pushReach = CRIT_PUSH_DISTANCE * Math.min(1, camera.aspect / CRIT_PUSH_FULL_ASPECT);
      camera.position.addScaledVector(cameraPushDir, frame.push * pushReach);
      const shake = frame.shake * CRIT_SHAKE;
      camera.position.x += Math.sin(nowMs * 0.071) * shake;
      camera.position.y += Math.sin(nowMs * 0.093 + 1.3) * shake;
      lookTarget.lerp(diceMesh.position, frame.push * CRIT_LOOK_PULL);
    }
    camera.lookAt(lookTarget);
  };

  const syncMeshFromBody = () => {
    diceMesh.position.set(
      d20.body.position.x,
      d20.body.position.y,
      d20.body.position.z
    );
    meshQuat.set(
      d20.body.quaternion.x,
      d20.body.quaternion.y,
      d20.body.quaternion.z,
      d20.body.quaternion.w
    );
    diceMesh.quaternion.copy(meshQuat);
  };

  const rollMode = activeRollMode();

  const onRoll = () => {
    if (!canTriggerHeroRoll(completedRolls, rolling)) return;
    hideOverlay();
    critBurst.reset();
    diceMeshMaterial.emissiveIntensity = 0;
    resultEl.classList.remove("result--crit");
    rolling = true;
    resultEl.textContent = "…";
    rollBtn.hidden = true;
    if (rollMode === "hero") {
      tossHeroD20(d20.body, d20.radius);
    } else {
      tossD20(d20.body, d20.radius);
    }
  };

  const onSkip = () => {
    window.clearTimeout(autoStartTimer);
    hideOverlay();
    if (canTriggerHeroRoll(completedRolls, rolling)) {
      onRoll();
    }
  };

  rollBtn.addEventListener("click", onRoll);
  skipBtn.addEventListener("click", onSkip);

  const tick = (nowMs: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(tick);

    const elapsed = Math.min(0.1, (nowMs - lastFrameMs) / 1000);
    lastFrameMs = nowMs;
    accumulator += elapsed;
    while (accumulator >= FIXED_STEP) {
      world.step(FIXED_STEP);
      if (rolling && rollMode === "hero") {
        applyHeroSettleGuidance(d20.body, faceSet, 20);
      }
      accumulator -= FIXED_STEP;
    }

    syncMeshFromBody();
    const critFrame = critBurst.update(elapsed);
    diceMeshMaterial.emissiveIntensity = (critFrame?.flash ?? 0) * CRIT_DIE_GLOW;
    applyCritCamera(critFrame, nowMs);
    renderer.render(scene, camera);

    if (rolling) {
      const linearSpeed = d20.body.velocity.length();
      const angularSpeed = d20.body.angularVelocity.length();
      if (updateRestTracker(restTracker, linearSpeed, angularSpeed, nowMs)) {
        const value = readSettledD20Value(faceSet, meshQuat);
        resultEl.textContent = String(value);
        if (isNaturalCrit(value)) {
          critBurst.trigger(diceMesh.position);
          resultEl.classList.add("result--crit");
        }
        rolling = false;
        completedRolls += 1;
        syncReplayControl();
      }
    }
  };

  resize();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(tick);

  autoStartTimer = window.setTimeout(() => {
    if (!disposed && canTriggerHeroRoll(completedRolls, rolling)) {
      onRoll();
    }
  }, HERO_AUTO_START_MS);

  return {
    renderer,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.clearTimeout(autoStartTimer);
      rollBtn.removeEventListener("click", onRoll);
      skipBtn.removeEventListener("click", onSkip);
      critBurst.dispose();
      tavern.dispose();
      diceMesh.geometry.dispose();
      diceMeshMaterial.dispose();
      renderer.dispose();
      world.removeBody(d20.body);
      world.removeBody(floorBody);
    },
  };
}
