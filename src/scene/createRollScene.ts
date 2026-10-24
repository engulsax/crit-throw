import {
  AmbientLight,
  Color,
  DirectionalLight,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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
import { createRestTracker, updateRestTracker } from "../domain/resting";
import { createD20Body, tossD20 } from "../physics/d20Body";

const FIXED_STEP = 1 / 60;

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
  renderer.setClearColor(new Color(0x12100e));
  renderer.shadowMap.enabled = true;

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.set(0, 2.2, 4.2);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.target.set(0, 0.4, 0);
  controls.minDistance = 2.5;
  controls.maxDistance = 8;
  controls.maxPolarAngle = Math.PI * 0.48;

  scene.add(new AmbientLight(0xfff5e6, 0.35));
  const key = new DirectionalLight(0xffeedd, 1.1);
  key.position.set(3, 6, 2);
  key.castShadow = true;
  scene.add(key);

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

  const floorMesh = new Mesh(
    new PlaneGeometry(12, 12),
    new MeshStandardMaterial({ color: 0x2a241c, roughness: 0.92 })
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

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
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
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

  const onRoll = () => {
    rolling = true;
    resultEl.textContent = "…";
    tossD20(d20.body, d20.radius);
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
      accumulator -= FIXED_STEP;
    }

    syncMeshFromBody();
    controls.update();
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
      controls.dispose();
      diceMesh.geometry.dispose();
      (diceMesh.material as MeshStandardMaterial).dispose();
      floorMesh.geometry.dispose();
      (floorMesh.material as MeshStandardMaterial).dispose();
      renderer.dispose();
      world.removeBody(d20.body);
      world.removeBody(floorBody);
    },
  };
}
