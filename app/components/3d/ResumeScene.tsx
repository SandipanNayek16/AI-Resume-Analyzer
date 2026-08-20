import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Plane } from '@react-three/drei';
import * as THREE from 'three';

export function ResumeScene({ scale = 1 }) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle breathing rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} scale={scale}>
        {/* Main Document Plane */}
        <Plane args={[3, 4]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.2} transparent opacity={0.9} />
        </Plane>
        
        {/* Document Content Mockup (Text and Lines) */}
        <Text position={[-1.2, 1.5, 0.02]} fontSize={0.2} color="#f0f0ff" anchorX="left">
          JOHN DOE
        </Text>
        <Text position={[-1.2, 1.2, 0.02]} fontSize={0.12} color="#a78bfa" anchorX="left">
          Software Engineer
        </Text>
        
        {/* Line separators */}
        <Plane args={[2.5, 0.01]} position={[0, 0.9, 0.02]}>
          <meshBasicMaterial color="#3d3d6b" />
        </Plane>

        <Text position={[-1.2, 0.6, 0.02]} fontSize={0.12} color="#f0f0ff" anchorX="left">
          EXPERIENCE
        </Text>
        <Plane args={[2.5, 0.3]} position={[0, 0.2, 0.02]}>
          <meshBasicMaterial color="#26263f" />
        </Plane>
        <Plane args={[2.5, 0.3]} position={[0, -0.2, 0.02]}>
          <meshBasicMaterial color="#26263f" />
        </Plane>

        <Text position={[-1.2, -0.6, 0.02]} fontSize={0.12} color="#f0f0ff" anchorX="left">
          SKILLS
        </Text>
        <Plane args={[2.5, 0.5]} position={[0, -1.1, 0.02]}>
          <meshBasicMaterial color="#26263f" />
        </Plane>

        {/* Floating Data Tags */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
          <group position={[2, 1, 0.5]}>
             <Plane args={[1, 0.3]} position={[0, 0, 0]}>
               <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} transparent opacity={0.8}/>
             </Plane>
             <Text position={[0, 0, 0.02]} fontSize={0.12} color="#000000" anchorX="center" anchorY="middle">
               ATS: 92
             </Text>
          </group>
        </Float>

        <Float speed={2.5} rotationIntensity={0.5} floatIntensity={2}>
          <group position={[-1.8, -0.5, 0.8]}>
             <Plane args={[1.2, 0.3]} position={[0, 0, 0]}>
               <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} transparent opacity={0.8}/>
             </Plane>
             <Text position={[0, 0, 0.02]} fontSize={0.12} color="#000000" anchorX="center" anchorY="middle">
               MATCH: 87%
             </Text>
          </group>
        </Float>

      </group>
    </Float>
  );
}
