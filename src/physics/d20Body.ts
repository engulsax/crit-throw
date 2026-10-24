import {
  Body,
  ConvexPolyhedron,
  Material,
  Quaternion as CQuaternion,
  Vec3,
  type World,
} from "cannon-es";
import { BufferGeometry, IcosahedronGeometry } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const D20_RADIUS = 0.55;

function geometryToConvexPolyhedron(geometry: BufferGeometry): ConvexPolyhedron {
  const position = geometry.attributes.position;
  const index = geometry.index;

  const vertices: Vec3[] = [];
  for (let i = 0; i < position.count; i++) {
    vertices.push(
      new Vec3(position.getX(i), position.getY(i), position.getZ(i))
    );
  }

  const faces: number[][] = [];
  const triangleCount = index ? index.count / 3 : position.count / 3;
  for (let face = 0; face < triangleCount; face++) {
    if (index) {
      faces.push([
        index.getX(face * 3),
        index.getX(face * 3 + 1),
        index.getX(face * 3 + 2),
      ]);
    } else {
      faces.push([face * 3, face * 3 + 1, face * 3 + 2]);
    }
  }

  return new ConvexPolyhedron({ vertices, faces });
}

export type D20Body = {
  body: Body;
  radius: number;
};

export function createD20Body(world: World, material: Material): D20Body {
  const geometry = mergeVertices(new IcosahedronGeometry(D20_RADIUS, 0));
  const shape = geometryToConvexPolyhedron(geometry);
  geometry.dispose();

  const body = new Body({
    mass: 0.35,
    material,
    shape,
    linearDamping: 0.08,
    angularDamping: 0.12,
  });
  body.position.set(0, D20_RADIUS + 0.05, 0);
  world.addBody(body);

  return { body, radius: D20_RADIUS };
}

export function tossD20(body: Body, radius: number): void {
  body.wakeUp();
  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);

  body.position.set(
    (Math.random() - 0.5) * 0.35,
    radius + 1.1 + Math.random() * 0.25,
    (Math.random() - 0.5) * 0.35
  );

  const q = new CQuaternion();
  q.setFromEuler(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
  body.quaternion.copy(q);

  const impulse = new Vec3(
    (Math.random() - 0.5) * 2.2,
    2.4 + Math.random() * 0.8,
    (Math.random() - 0.5) * 2.2
  );
  body.applyImpulse(impulse);

  const torque = new Vec3(
    (Math.random() - 0.5) * 14,
    (Math.random() - 0.5) * 14,
    (Math.random() - 0.5) * 14
  );
  body.applyTorque(torque);
}
