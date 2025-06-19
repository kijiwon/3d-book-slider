import { useRef } from "react";

export const Page = ({ number, front, back, ...props }) => {
  const group = useRef();

  return (
    <group {...props}>
      <mesh scale={0.1}>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
};
