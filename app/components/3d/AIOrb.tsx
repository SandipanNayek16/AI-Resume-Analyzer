import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, MeshDistortMaterial } from '@react-three/drei';
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
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speedMultiplier = isProcessing ? 2.5 : 1;
    
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2 * speedMultiplier;
      meshRef.current.rotation.y = time * 0.3 * speedMultiplier;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x = -time * 0.1 * speedMultiplier;
      coreRef.current.rotation.y = -time * 0.15 * speedMultiplier;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = time * 0.5 * speedMultiplier;
    }
    if (ring1Ref.current && ring2Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(time * 0.5) * 0.5 + (time * 0.2);
      ring1Ref.current.rotation.y = time * 0.8 * speedMultiplier;
      
      ring2Ref.current.rotation.x = Math.cos(time * 0.4) * 0.5 - (time * 0.1);
      ring2Ref.current.rotation.z = time * 0.6 * speedMultiplier;
    }
  });

  const activeColor = isProcessing ? "#2dd4bf" : color; // Switch to cyan when processing
  const baseIntensity = isProcessing ? 4 : 2;

  return (
    <Float speed={isProcessing ? 4 : 2} rotationIntensity={isProcessing ? 2 : 1} floatIntensity={isProcessing ? 3 : 2}>
      
      {/* Outer Wireframe Energy Sphere */}
      <Sphere ref={meshRef} args={[1.2 * scale, 32, 32]}>
        <MeshDistortMaterial
          color={activeColor}
          attach="material"
          distort={isProcessing ? 0.6 : 0.3}
          speed={isProcessing ? 4 : 2}
          wireframe={wireframe}
          transparent
          opacity={isProcessing ? 0.4 : 0.2}
        />
      </Sphere>

      {/* Orbiting Energy Rings */}
      <Torus ref={ring1Ref} args={[1.4 * scale, 0.02, 16, 100]} rotation={[Math.PI / 4, 0, 0]}>
        <meshStandardMaterial color={activeColor} emissive={activeColor} emissiveIntensity={baseIntensity} transparent opacity={0.6}/>
      </Torus>
      
      <Torus ref={ring2Ref} args={[1.6 * scale, 0.015, 16, 100]} rotation={[-Math.PI / 4, Math.PI / 2, 0]}>
        <meshStandardMaterial color={activeColor} emissive={activeColor} emissiveIntensity={baseIntensity * 0.8} transparent opacity={0.4}/>
      </Torus>

      {/* Mid Layer Glowing Core */}
      <Sphere ref={coreRef} args={[0.9 * scale, 32, 32]}>
        <MeshDistortMaterial
          color={activeColor}
          attach="material"
          distort={isProcessing ? 0.7 : 0.4}
          speed={isProcessing ? 6 : 3}
          emissive={activeColor}
          emissiveIntensity={baseIntensity}
          toneMapped={false}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Solid Inner Neural Core */}
      <Sphere ref={innerCoreRef} args={[0.6 * scale, 16, 16]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={isProcessing ? 5 : 2}
          toneMapped={false}
        />
      </Sphere>

      {/* Dynamic Point Light */}
      <pointLight color={activeColor} intensity={baseIntensity * 2} distance={15} decay={2} />
    </Float>
  );
}
