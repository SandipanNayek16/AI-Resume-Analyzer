import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Plane, Box, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export function ResumeScene({ scale = 1 }) {
  const groupRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);

  // Subtle breathing rotation and scanning beam animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
    if (scanLineRef.current) {
      // Move scanline down and reset
      const yPos = 2 - (state.clock.elapsedTime % 3) * 1.5;
      scanLineRef.current.position.y = yPos;
      
      // Flash intensity based on position
      const mat = scanLineRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = yPos > -2 && yPos < 2 ? 0.8 : 0;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} scale={scale}>
        
        {/* Holographic Document Base with realistic thickness */}
        <RoundedBox args={[3.2, 4.2, 0.05]} radius={0.05} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.8} 
            roughness={0.2} 
            transparent 
            opacity={0.85}
            envMapIntensity={2}
          />
        </RoundedBox>

        {/* Inner page edge glowing trim */}
        <RoundedBox args={[3.15, 4.15, 0.06]} radius={0.04} position={[0, 0, 0.01]}>
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} wireframe/>
        </RoundedBox>

        {/* Animated Scanning Beam */}
        <Plane ref={scanLineRef} args={[3.4, 0.05]} position={[0, 2, 0.08]}>
          <meshStandardMaterial 
            color="#2dd4bf" 
            emissive="#2dd4bf" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.8} 
          />
        </Plane>
        
        {/* Document Content Mockup */}
        <group position={[0, 0, 0.04]}>
          {/* Header */}
          <Text position={[-1.2, 1.5, 0]} fontSize={0.25} font="/fonts/Inter-Bold.ttf" color="#f8fafc" anchorX="left">
            JOHN DOE
          </Text>
          <Text position={[-1.2, 1.2, 0]} fontSize={0.12} font="/fonts/Inter-Medium.ttf" color="#a78bfa" anchorX="left">
            Senior AI Engineer
          </Text>
          <Plane args={[2.5, 0.01]} position={[0, 0.9, 0]}>
            <meshBasicMaterial color="#334155" />
          </Plane>

          {/* Section: Experience */}
          <Text position={[-1.2, 0.6, 0]} fontSize={0.12} color="#94a3b8" anchorX="left" letterSpacing={0.1}>
            EXPERIENCE
          </Text>
          {/* Layered Blocks */}
          <Box args={[2.5, 0.25, 0.02]} position={[0, 0.3, 0.02]}>
             <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5}/>
          </Box>
          <Box args={[2.0, 0.15, 0.02]} position={[-0.25, 0, 0.02]}>
             <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5}/>
          </Box>
          <Box args={[2.5, 0.25, 0.02]} position={[0, -0.3, 0.02]}>
             <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5}/>
          </Box>

          {/* Section: Skills */}
          <Text position={[-1.2, -0.7, 0]} fontSize={0.12} color="#94a3b8" anchorX="left" letterSpacing={0.1}>
            CORE SKILLS
          </Text>
          {/* Skill Nodes */}
          <group position={[-1.0, -1.1, 0.02]}>
             <RoundedBox args={[0.8, 0.2, 0.02]} radius={0.05} position={[0, 0, 0]}>
                <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.2}/>
             </RoundedBox>
             <RoundedBox args={[0.7, 0.2, 0.02]} radius={0.05} position={[0.9, 0, 0]}>
                <meshStandardMaterial color="#0f766e" emissive="#0f766e" emissiveIntensity={0.2}/>
             </RoundedBox>
             <RoundedBox args={[0.6, 0.2, 0.02]} radius={0.05} position={[1.7, 0, 0]}>
                <meshStandardMaterial color="#4338ca" emissive="#4338ca" emissiveIntensity={0.2}/>
             </RoundedBox>
          </group>
        </group>

        {/* Floating Data Tags - High-tech UI overlays */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
          <group position={[2.2, 1, 0.5]}>
             <RoundedBox args={[1.2, 0.4, 0.02]} radius={0.05} position={[0, 0, 0]}>
               <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.4} transparent opacity={0.7} metalness={0.8} roughness={0.2}/>
             </RoundedBox>
             <Text position={[-0.4, 0, 0.02]} fontSize={0.12} color="#ffffff" anchorX="left" anchorY="middle">
               ATS SCORE
             </Text>
             <Text position={[0.4, 0, 0.02]} fontSize={0.18} color="#ffffff" anchorX="right" anchorY="middle" font="/fonts/Inter-Bold.ttf">
               92/100
             </Text>
          </group>
        </Float>

        <Float speed={2.5} rotationIntensity={0.5} floatIntensity={2}>
          <group position={[-2.2, -0.5, 0.8]}>
             <RoundedBox args={[1.4, 0.4, 0.02]} radius={0.05} position={[0, 0, 0]}>
               <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.4} transparent opacity={0.7} metalness={0.8} roughness={0.2}/>
             </RoundedBox>
             <Text position={[-0.5, 0, 0.02]} fontSize={0.12} color="#ffffff" anchorX="left" anchorY="middle">
               JOB MATCH
             </Text>
             <Text position={[0.5, 0, 0.02]} fontSize={0.18} color="#ffffff" anchorX="right" anchorY="middle" font="/fonts/Inter-Bold.ttf">
               87%
             </Text>
          </group>
        </Float>

      </group>
    </Float>
  );
}
