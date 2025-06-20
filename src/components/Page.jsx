import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkeletonHelper,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";

// 페이지 크기
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 종횡비
const PAGE_DEPTH = 0.003;
// skin이 걸릴 세그먼트 수
const PAGE_SEGMENTS = 5; // 페이지를 가로로 5등분
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS; // 각 페이지 geometry가 동일함(런타임때 계산 가능)

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);
const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  // all vertices
  vertex.fromBufferAttribute(position, 1);
  const x = vertex.x; // vertex의 x 좌표

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)); // 영향을 받는 skin을 파악
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "pink",
  }),
  new MeshStandardMaterial({
    color: "blue",
  }),
];

export const Page = ({ number, front, back, ...props }) => {
  const group = useRef();
  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        // 첫 페이지
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = pageMaterials;
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  useHelper(skinnedMeshRef, SkeletonHelper, "red");
  useFrame(() => {
    if (!skinnedMeshRef.current) {
      return;
    }
    const bones = skinnedMeshRef.current.skeleton.bones;
    bones[2].rotation.y = degToRad(40);
    bones[4].rotation.y = degToRad(-40);
    bones[4].rotation.x = degToRad(10);
  });

  return (
    <group {...props} ref={group}>
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  );
};
