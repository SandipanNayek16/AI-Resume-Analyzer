import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AIOrbProps {
  scale?: number;
  color?: string;
  wireframe?: boolean;
}

export function AIOrb({ scale = 1, color = "#a78bfa", wireframe = true }: AIOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x = -state.clock.elapsedTime * 0.1;
      coreRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      {/* Outer Wireframe Sphere */}
      <Sphere ref={meshRef} args={[1.2 * scale, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          wireframe={wireframe}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Inner Glowing Core */}
      <Sphere ref={coreRef} args={[0.9 * scale, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.6}
          speed={3}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Sphere>

      {/* Point Light to illuminate surrounding area */}
      <pointLight color={color} intensity={2} distance={10} />
    </Float>
  );
}
