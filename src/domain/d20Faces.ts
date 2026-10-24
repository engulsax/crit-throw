import { IcosahedronGeometry, Quaternion, Vector3 } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type D20FaceSet = {
  /** Unit normals in mesh-local space, one per icosahedron face. */
  faceNormals: Vector3[];
  /** D20 value 1–20 parallel to `faceNormals`. */
  faceValues: readonly number[];
};

const _worldNormal = new Vector3();

export function buildD20FaceSet(radius: number): D20FaceSet {
  const geometry = mergeVertices(new IcosahedronGeometry(radius, 0));
  const index = geometry.index;
  const position = geometry.attributes.position;

  const faceNormals: Vector3[] = [];
  const triangleCount = index ? index.count / 3 : position.count / 3;
  for (let face = 0; face < triangleCount; face++) {
    const ia = index ? index.getX(face * 3) : face * 3;
    const ib = index ? index.getX(face * 3 + 1) : face * 3 + 1;
    const ic = index ? index.getX(face * 3 + 2) : face * 3 + 2;
    const a = new Vector3().fromBufferAttribute(position, ia);
    const b = new Vector3().fromBufferAttribute(position, ib);
    const c = new Vector3().fromBufferAttribute(position, ic);
    const normal = new Vector3()
      .crossVectors(b.sub(a), c.sub(a))
      .normalize();
    faceNormals.push(normal);
  }
  geometry.dispose();

  const ranked = faceNormals
    .map((normal, faceIndex) => ({ faceIndex, normal }))
    .sort((left, right) => {
      if (left.normal.y !== right.normal.y) {
        return right.normal.y - left.normal.y;
      }
      if (left.normal.x !== right.normal.x) {
        return left.normal.x - right.normal.x;
      }
      return left.normal.z - right.normal.z;
    });

  const faceValues: number[] = new Array(faceNormals.length);
  ranked.forEach(({ faceIndex }, rank) => {
    faceValues[faceIndex] = rank + 1;
  });

  return { faceNormals, faceValues };
}

/** Face whose normal best aligns with world +Y after `orientation`. */
export function readSettledD20Value(
  faceSet: D20FaceSet,
  orientation: Quaternion
): number {
  let bestFace = 0;
  let bestDot = -Infinity;

  for (let i = 0; i < faceSet.faceNormals.length; i++) {
    _worldNormal.copy(faceSet.faceNormals[i]).applyQuaternion(orientation);
    const dot = _worldNormal.y;
    if (dot > bestDot) {
      bestDot = dot;
      bestFace = i;
    }
  }

  return faceSet.faceValues[bestFace]!;
}
