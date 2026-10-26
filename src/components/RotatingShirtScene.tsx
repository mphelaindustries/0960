import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Group, SRGBColorSpace } from "three";
import model from "@/assets/tshirt.glb.asset.json";
import { unwrapShirt } from "@/lib/shirt-geometry";

export type ShirtSceneProps = {
  frontArtwork: string;
  backArtwork: string;
  rotating: boolean;
  angle: number;
  compact?: boolean;
  palette: { cloth: string; pedestal: string; accent: string; light: string };
};

function Shirt({ frontArtwork, backArtwork, palette }: ShirtSceneProps) {
  const { scene } = useGLTF(model.url);
  const [front, back] = useTexture([frontArtwork, backArtwork]);
  const geometry = useMemo(() => unwrapShirt(scene), [scene]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  front.colorSpace = back.colorSpace = SRGBColorSpace;
  return (
    <mesh geometry={geometry} position-y={0.49} castShadow>
      <meshStandardMaterial attach="material-0" map={front} roughness={0.93} />
      <meshStandardMaterial attach="material-1" map={back} roughness={0.93} />
      <meshStandardMaterial attach="material-2" color={palette.cloth} roughness={0.95} />
    </mesh>
  );
}

function Turntable(props: ShirtSceneProps) {
  const group = useRef<Group>(null);
  useEffect(() => { if (group.current) group.current.rotation.y = props.angle; }, [props.angle]);
  useFrame((_, delta) => {
    if (group.current && props.rotating) group.current.rotation.y += Math.min(delta, 0.05) * 0.38;
  });
  return (
    <group ref={group} rotation-y={props.angle}>
      <Suspense fallback={null}><Shirt {...props} /></Suspense>
      <mesh position-y={0.17} receiveShadow>
        <cylinderGeometry args={[1.8, 1.87, 0.34, 64]} />
        <meshStandardMaterial color={props.palette.pedestal} metalness={0.45} roughness={0.45} />
      </mesh>
      <mesh position-y={0.35} receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.025, 64]} />
        <meshStandardMaterial color={props.palette.accent} metalness={0.25} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.172, 1.834]}>
        <boxGeometry args={[0.32, 0.05, 0.018]} />
        <meshStandardMaterial color={props.palette.accent} />
      </mesh>
    </group>
  );
}

export default function RotatingShirtScene(props: ShirtSceneProps) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2.6, 8.2], fov: props.compact ? 36 : 34 }} gl={{ antialias: true, alpha: true }} onCreated={({ camera }) => camera.lookAt(0, 1.85, 0)}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 5]} intensity={3} />
      <directionalLight position={[-4, 2, -3]} intensity={2} />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 5, 2]} scale={[8, 5, 1]} />
        <Lightformer intensity={3} position={[-4, 2, 0]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer intensity={2} position={[4, 2, -1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
      </Environment>
      <Turntable {...props} />
    </Canvas>
  );
}