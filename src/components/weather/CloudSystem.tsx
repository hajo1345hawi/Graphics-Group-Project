import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWeatherStore } from '../../store/weatherStore';
import * as THREE from 'three';

const CloudParticle: React.FC<{ position: [number, number, number]; scale: number }> = ({ position, scale }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { settings } = useWeatherStore();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x += settings.windStrength * 0.001;
      if (meshRef.current.position.x > 25) {
        meshRef.current.position.x = -25;
      }
    }
  });

  const opacity = useMemo(() => {
    const storminess = settings.rainIntensity / 100;
    return 0.3 + storminess * 0.4;
  }, [settings.rainIntensity]);

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshLambertMaterial 
        color={new THREE.Color().lerpColors(
          new THREE.Color(0xffffff),
          new THREE.Color(0x333366),
          settings.rainIntensity / 100
        )}
        transparent 
        opacity={opacity}
      />
    </mesh>
  );
};

export const CloudSystem: React.FC = () => {
  const { settings } = useWeatherStore();
  
  const clouds = useMemo(() => {
    const cloudCount = Math.floor(settings.cloudCoverage / 10);
    const cloudArray = [];
    
    for (let i = 0; i < cloudCount; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = 8 + Math.random() * 6;
      const z = (Math.random() - 0.5) * 50;
      const scale = 2 + Math.random() * 3;
      
      cloudArray.push(
        <CloudParticle 
          key={i} 
          position={[x, y, z]} 
          scale={scale}
        />
      );
    }
    
    return cloudArray;
  }, [settings.cloudCoverage]);

  if (settings.cloudCoverage === 0) return null;

  return <group>{clouds}</group>;
};