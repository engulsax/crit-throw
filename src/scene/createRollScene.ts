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
import { buildD20FaceSet, readSettledD20Value } from "../domain/d20Faces";
import { activeRollMode } from "../domain/rollMode";
import { createRestTracker, updateRestTracker } from "../domain/resting";
import { createD20Body, tossD20 } from "../physics/d20Body";
import {
  applyHeroSettleGuidance,
  tossHeroD20,
} from "../physics/heroRoll";
import { createTavernDiorama } from "./createTavernDiorama";

const FIXED_STEP = 1 / 60;
const LOOK_AT = new Vector3(0, 0.38, 0);

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
  if (!resultEl || !rollBtn) {
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

  const diceMesh = new Mesh(
    new IcosahedronGeometry(d20.radius, 0),
    new MeshStandardMaterial({
      color: 0xc9a227,
      metalness: 0.35,
      roughness: 0.45,
      flatShading: true,
    })
  );
  diceMesh.castShadow = true;
  scene.add(diceMesh);

  const meshQuat = new Quaternion();
  const restTracker = createRestTracker();
  let rolling = false;
  let accumulator = 0;
  let raf = 0;
  let disposed = false;
  let lastFrameMs = performance.now();

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    const aspect = w / h;
    camera.aspect = aspect;
    applyHeroFraming(camera, aspect);
    renderer.setSize(w, h, false);
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
    rolling = true;
    resultEl.textContent = "…";
    if (rollMode === "hero") {
      tossHeroD20(d20.body, d20.radius);
    } else {
      tossD20(d20.body, d20.radius);
    }
  };

  rollBtn.addEventListener("click", onRoll);

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
    renderer.render(scene, camera);

    if (rolling) {
      const linearSpeed = d20.body.velocity.length();
      const angularSpeed = d20.body.angularVelocity.length();
      if (updateRestTracker(restTracker, linearSpeed, angularSpeed, nowMs)) {
        resultEl.textContent = String(readSettledD20Value(faceSet, meshQuat));
        rolling = false;
      }
    }
  };

  resize();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(tick);

  return {
    renderer,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      rollBtn.removeEventListener("click", onRoll);
      tavern.dispose();
      diceMesh.geometry.dispose();
      (diceMesh.material as MeshStandardMaterial).dispose();
      renderer.dispose();
      world.removeBody(d20.body);
      world.removeBody(floorBody);
    },
  };
}
