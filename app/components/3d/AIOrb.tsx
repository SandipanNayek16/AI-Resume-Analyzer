import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AIOrbProps {
  scale?: number;
  color?: string;
  wireframe?: boolean;
  isProcessing?: boolean;
}

export function AIOrb({ scale = 1, color = "#a78bfa", wireframe = true, isProcessing = false }: AIOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const speedMultiplier = isProcessing ? 3 : 1;
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speedMultiplier;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speedMultiplier;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x = -state.clock.elapsedTime * 0.1 * speedMultiplier;
      coreRef.current.rotation.y = -state.clock.elapsedTime * 0.15 * speedMultiplier;
      
      if (isProcessing) {
        const material = coreRef.current.material as THREE.MeshStandardMaterial;
        if (material.emissiveIntensity) {
          material.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 10) * 1;
        }
      }
    }
  });

  return (
    <Float speed={isProcessing ? 4 : 2} rotationIntensity={isProcessing ? 2 : 1} floatIntensity={isProcessing ? 3 : 2}>
      {/* Outer Wireframe Sphere */}
      <Sphere ref={meshRef} args={[1.2 * scale, 24, 24]}>
        <MeshDistortMaterial
          color={isProcessing ? "#c4b5fd" : color}
          attach="material"
          distort={isProcessing ? 0.6 : 0.4}
          speed={isProcessing ? 4 : 2}
          wireframe={wireframe}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Inner Glowing Core */}
      <Sphere ref={coreRef} args={[0.9 * scale, 24, 24]}>
        <MeshDistortMaterial
          color={isProcessing ? "#c4b5fd" : color}
          attach="material"
          distort={isProcessing ? 0.8 : 0.6}
          speed={isProcessing ? 6 : 3}
          emissive={isProcessing ? "#c4b5fd" : color}
          emissiveIntensity={isProcessing ? 3 : 2}
          toneMapped={false}
        />
      </Sphere>

      {/* Point Light to illuminate surrounding area */}
      <pointLight color={isProcessing ? "#c4b5fd" : color} intensity={isProcessing ? 3 : 2} distance={10} />
    </Float>
  );
}
