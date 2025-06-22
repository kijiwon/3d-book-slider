import { useHelper, useTexture } from "@react-three/drei";
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
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";

import { pages } from "./UI";
import { degToRad } from "three/src/math/MathUtils.js";
import { easing } from "maath";

const easingFactor = 0.5;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

// 페이지 크기
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 종횡비
const PAGE_DEPTH = 0.003;
// skin이 걸릴 세그먼트 수
const PAGE_SEGMENTS = 30; // 페이지를 가로로 30등분
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
];

pages.forEach((page) => {
  useTexture.preload(`/textures/${page.front}.jpg`);
  useTexture.preload(`/textures/${page.back}.jpg`);
  useTexture.preload(`/textures/book-cover-roughness.jpg`);
});

export const Page = ({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  ...props
}) => {
  const group = useRef();
  const skinnedMeshRef = useRef();

  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1
      ? [`textures/book-cover-roughness.jpg`]
      : []),
  ]);
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace; // picture과 picture2를 동시에 srgb로 변경

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

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(number === 0
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(number === pages.length - 1
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  //   useHelper(skinnedMeshRef, SkeletonHelper, "red");

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      // 페이지 충돌 조절
      targetRotation += degToRad(number * 0.5);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.25) : 0;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation;

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
        } else {
          rotationAngle = 0;
        }
      }

      // 페이지 회전 애니메이션
      easing.dampAngle(
        target.rotation,
        "y", // 회전키
        rotationAngle,
        easingFactor,
        delta
      );
    }
  });

  return (
    <group {...props} ref={group}>
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};
