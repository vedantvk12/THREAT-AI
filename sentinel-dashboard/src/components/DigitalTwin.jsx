import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, Grid, Box, Cylinder, Sphere, MeshReflectorMaterial, Ring, Line, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

// An animated threat marker with path prediction
function ThreatMarker({ position, isAggressive, id }) {
  const ringRef = useRef();
  
  useFrame(({ clock }) => {
    if (ringRef.current && isAggressive) {
      const scale = 1 + Math.sin(clock.elapsedTime * 6) * 0.3;
      ringRef.current.scale.set(scale, scale, scale);
      ringRef.current.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 8) * 0.5;
    }
  });

  const color = isAggressive ? "#ef4444" : "#3b82f6";
  const glow = isAggressive ? 6 : 1.5;

  // Mock predicted path points extending forward
  const pathPoints = useMemo(() => {
    return [
      position,
      [position[0] + 2, 0.1, position[2] + 2],
      [position[0] + 4, 0.1, position[2] + 1],
    ];
  }, [position]);

  return (
    <group position={position}>
      {/* Core Body */}
      <Box args={[0.4, 1.8, 0.4]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} toneMapped={false} />
      </Box>
      
      {/* Target Reticle Ring */}
      <Ring ref={ringRef} args={[0.8, 1.0, 32]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </Ring>

      {/* Trajectory Prediction Line */}
      {isAggressive && (
        <Line points={pathPoints} color="#ef4444" lineWidth={2} transparent opacity={0.5} dashed dashScale={10} />
      )}

      {/* Floating Info Label */}
      <Html position={[0, 2.5, 0]} center className="pointer-events-none">
        <div className={`px-2 py-1 rounded bg-[#030712]/80 border ${isAggressive ? 'border-red-500/50 text-red-400' : 'border-blue-500/50 text-blue-400'} text-[8px] font-mono whitespace-nowrap backdrop-blur-md`}>
          ID: {id || 'UNK-99'} | {isAggressive ? 'HOSTILE' : 'NOMINAL'}
        </div>
      </Html>
    </group>
  );
}

// CCTV Camera with FOV Cone
function SensorCamera({ position, rotation, isActive }) {
  const color = isActive ? "#10b981" : "#64748b";
  return (
    <group position={position} rotation={rotation}>
      <Box args={[0.5, 0.5, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </Box>
      <Cylinder args={[0.2, 0.2, 0.2, 16]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.6]}>
        <meshStandardMaterial color="#000" />
      </Cylinder>
      {/* FOV Cone */}
      {isActive && (
        <Cylinder args={[0.1, 8, 15, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 7.5]}>
          <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
        </Cylinder>
      )}
    </group>
  );
}

// Security Drone with scanning laser
function Drone({ initialPosition }) {
  const droneRef = useRef();
  useFrame(({ clock }) => {
    if (droneRef.current) {
      droneRef.current.position.y = initialPosition[1] + Math.sin(clock.elapsedTime * 2) * 0.2;
      droneRef.current.position.x = initialPosition[0] + Math.sin(clock.elapsedTime * 0.5) * 5;
      droneRef.current.position.z = initialPosition[2] + Math.cos(clock.elapsedTime * 0.5) * 5;
      droneRef.current.rotation.y = -clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={droneRef} position={initialPosition}>
      <Sphere args={[0.5, 16, 16]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </Sphere>
      {/* Scan cone */}
      <Cylinder args={[0, 3, 10, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, -5, 0]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </Cylinder>
    </group>
  );
}

function FacilityArchitecture() {
  return (
    <group>
      {/* Walls */}
      <Box args={[30, 4, 0.5]} position={[0, 2, -15]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.6} wireframe />
      </Box>
      <Box args={[0.5, 4, 30]} position={[-15, 2, 0]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.6} />
      </Box>
      <Box args={[0.5, 4, 30]} position={[15, 2, 0]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.6} />
      </Box>
      {/* Internal Room */}
      <Box args={[10, 4, 0.5]} position={[-10, 2, -5]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.9} />
      </Box>
      
      {/* Red Danger Zone Heatmap Decal on Floor */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[5, 0.02, 5]}>
        <circleGeometry args={[6, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Scene({ worldPeople, riskScore, isFullscreen }) {
  const controlsRef = useRef();

  useFrame((state, delta) => {
    if (controlsRef.current && !isFullscreen && riskScore < 80) {
      controlsRef.current.azimuthAngle += delta * 0.02;
    }
  });

  return (
    <>
      <CameraControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} distance={35} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#60a5fa" castShadow />
      <spotLight position={[-10, 20, 0]} intensity={3} angle={0.6} penumbra={1} color="#c084fc" castShadow />

      {/* Atmospheric Fog */}
      <fogExp2 attach="fog" color="#030712" density={0.015} />

      {/* Holographic Infinite Grid */}
      <Grid 
        infiniteGrid 
        fadeDistance={80} 
        sectionColor={riskScore > 75 ? "#7f1d1d" : "#1e293b"} 
        cellColor={riskScore > 75 ? "#450a0a" : "#0f172a"}
        sectionSize={2}
        cellSize={0.5}
      />

      {/* Reflective Dark Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial 
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={20}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#020617"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <FacilityArchitecture />
      
      {/* Sensor Network */}
      <SensorCamera position={[-14, 3.5, -14]} rotation={[0, Math.PI/4, 0]} isActive={true} />
      <SensorCamera position={[14, 3.5, -14]} rotation={[0, -Math.PI/4, 0]} isActive={true} />
      <Drone initialPosition={[0, 8, 0]} />

      {/* Render Subjects */}
      {worldPeople?.map((person, idx) => (
        <ThreatMarker 
          key={person.id || idx} 
          id={person.id}
          position={person.position || [0, 0, 0]} 
          isAggressive={person.action?.label === "AGGRESSIVE"} 
        />
      ))}

      {/* Post Processing Cinematic Effects */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.1} mipmapBlur intensity={2.0} radius={0.8} />
        {riskScore > 75 && <ChromaticAberration offset={[0.003, 0.003]} />}
        <Vignette eskil={false} offset={0.1} darkness={1.2} />
        {isFullscreen && <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />}
      </EffectComposer>
    </>
  );
}

export default function DigitalTwin({ worldPeople, riskScore, isFullscreen }) {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#030712]">
      <Canvas shadows camera={{ position: [0, 20, 35], fov: 45 }} gl={{ antialias: false }}>
        <Scene worldPeople={worldPeople} riskScore={riskScore} isFullscreen={isFullscreen} />
      </Canvas>
    </div>
  );
}
