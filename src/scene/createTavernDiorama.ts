import {
  BoxGeometry,
  CylinderGeometry,
  FogExp2,
  Group,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  Scene,
  SpotLight,
} from "three";

export type TavernDiorama = {
  root: Group;
  tableSurfaceY: number;
  dispose: () => void;
};

function woodMaterial(color: number, roughness = 0.82): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness, metalness: 0.02 });
}

export function createTavernDiorama(scene: Scene): TavernDiorama {
  const disposables: { geometry?: { dispose: () => void }; material?: { dispose: () => void } }[] =
    [];

  const track = (mesh: Mesh) => {
    disposables.push({ geometry: mesh.geometry, material: mesh.material as MeshStandardMaterial });
    return mesh;
  };

  scene.background = null;
  scene.fog = new FogExp2(0x140f0c, 0.055);

  const root = new Group();
  root.name = "tavern-diorama";
  root.userData.kind = "tavern";

  const tableTopY = 0;
  const tableW = 2.6;
  const tableD = 1.75;
  const tableH = 0.11;

  const tableTop = track(
    new Mesh(
      new BoxGeometry(tableW, tableH, tableD),
      woodMaterial(0x4a3220, 0.72)
    )
  );
  tableTop.position.set(0, tableTopY - tableH / 2, 0);
  tableTop.receiveShadow = true;
  tableTop.castShadow = true;
  root.add(tableTop);

  const legGeo = new BoxGeometry(0.14, 0.72, 0.14);
  const legMat = woodMaterial(0x352418, 0.88);
  for (const [x, z] of [
    [-tableW / 2 + 0.18, -tableD / 2 + 0.18],
    [tableW / 2 - 0.18, -tableD / 2 + 0.18],
    [-tableW / 2 + 0.18, tableD / 2 - 0.18],
    [tableW / 2 - 0.18, tableD / 2 - 0.18],
  ]) {
    const leg = new Mesh(legGeo, legMat);
    leg.position.set(x, -0.47, z);
    leg.castShadow = true;
    root.add(leg);
  }
  disposables.push({ geometry: legGeo, material: legMat });

  const floor = track(
    new Mesh(new BoxGeometry(5.5, 0.06, 4.2), woodMaterial(0x241a14, 0.92))
  );
  floor.position.set(0, -0.78, -0.15);
  floor.receiveShadow = true;
  root.add(floor);

  const backWall = track(
    new Mesh(new BoxGeometry(6.2, 3.4, 0.18), woodMaterial(0x2a1f18, 0.9))
  );
  backWall.position.set(0, 0.95, -2.05);
  backWall.receiveShadow = true;
  root.add(backWall);

  const leftWall = track(
    new Mesh(new BoxGeometry(0.18, 3.2, 4.5), woodMaterial(0x231912, 0.92))
  );
  leftWall.position.set(-2.85, 0.85, -0.35);
  root.add(leftWall);

  const rightWall = track(
    new Mesh(new BoxGeometry(0.18, 3.2, 4.5), woodMaterial(0x231912, 0.92))
  );
  rightWall.position.set(2.85, 0.85, -0.35);
  root.add(rightWall);

  const hearth = track(
    new Mesh(
      new BoxGeometry(1.35, 0.95, 0.28),
      new MeshStandardMaterial({
        color: 0x1a1410,
        roughness: 0.95,
        emissive: 0xff5a22,
        emissiveIntensity: 0.58,
      })
    )
  );
  hearth.position.set(0.15, 0.55, -1.92);
  root.add(hearth);

  const mantle = track(
    new Mesh(new BoxGeometry(1.55, 0.12, 0.32), woodMaterial(0x3d2a1c, 0.78))
  );
  mantle.position.set(0.15, 1.08, -1.9);
  root.add(mantle);

  const shelf = track(
    new Mesh(new BoxGeometry(1.8, 0.08, 0.35), woodMaterial(0x3a281c, 0.8))
  );
  shelf.position.set(-1.55, 1.35, -1.85);
  root.add(shelf);

  const bottleMat = new MeshStandardMaterial({
    color: 0x2e4a32,
    roughness: 0.35,
    metalness: 0.05,
  });
  for (let i = 0; i < 3; i++) {
    const bottle = new Mesh(new CylinderGeometry(0.06, 0.07, 0.28, 8), bottleMat);
    bottle.position.set(-1.75 + i * 0.22, 1.52, -1.85);
    root.add(bottle);
  }
  disposables.push({ material: bottleMat });

  const mug = track(
    new Mesh(
      new CylinderGeometry(0.11, 0.09, 0.18, 10),
      new MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.55, metalness: 0.12 })
    )
  );
  mug.position.set(0.85, tableTopY + 0.09, 0.45);
  mug.castShadow = true;
  root.add(mug);

  const candleBase = track(
    new Mesh(
      new CylinderGeometry(0.05, 0.06, 0.04, 8),
      new MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.6 })
    )
  );
  candleBase.position.set(-0.75, tableTopY + 0.02, 0.35);
  root.add(candleBase);

  const candleFlame = track(
    new Mesh(
      new CylinderGeometry(0.025, 0.04, 0.12, 6),
      new MeshStandardMaterial({
        color: 0xffe8a8,
        emissive: 0xffcc66,
        emissiveIntensity: 1.4,
        roughness: 0.4,
      })
    )
  );
  candleFlame.position.set(-0.75, tableTopY + 0.1, 0.35);
  root.add(candleFlame);

  const candleLight = new PointLight(0xffddb0, 2.2, 4.5, 2);
  candleLight.position.set(-0.75, tableTopY + 0.25, 0.35);
  candleLight.castShadow = true;
  candleLight.shadow.mapSize.set(512, 512);
  root.add(candleLight);

  const hearthSpot = new SpotLight(0xff7a3a, 3.5, 8, 0.55, 0.35, 1);
  hearthSpot.position.set(0.2, 1.65, -1.2);
  hearthSpot.target.position.set(0, tableTopY, 0.1);
  root.add(hearthSpot);
  root.add(hearthSpot.target);

  scene.add(root);

  return {
    root,
    tableSurfaceY: tableTopY,
    dispose: () => {
      scene.remove(root);
      scene.fog = null;
      for (const d of disposables) {
        d.geometry?.dispose();
        d.material?.dispose();
      }
      candleLight.dispose();
      hearthSpot.dispose();
    },
  };
}
