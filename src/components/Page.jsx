import { useRef } from "react";
import { BoxGeometry } from "three";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 종횡비
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS; // 각 페이지 geometry가 동일함(런타임때 계산 가능)

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);
export const Page = ({ number, front, back, ...props }) => {
  const group = useRef();

  return (
    <group {...props} ref={group}>
      <mesh scale={0.1}>
        <primitive object={pageGeometry} attach={"geometry"} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
};
