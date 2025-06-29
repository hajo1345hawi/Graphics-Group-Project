import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWeatherStore } from '../../store/weatherStore';
import * as THREE from 'three';

interface LightningBolt {
  id: number;
  points: THREE.Vector3[];
  life: number;
  maxLife: number;
}

export const LightningSystem: React.FC = () => {
  const { settings, lightningTrigger } = useWeatherStore();
  const [bolts, setBolts] = useState<LightningBolt[]>([]);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const [flashIntensity, setFlashIntensity] = useState(0);

  const createLightningBolt = (): LightningBolt => {
    const points: THREE.Vector3[] = [];
    const segments = 20;
    const startX = (Math.random() - 0.5) * 30;
    const startY = 15 + Math.random() * 5;
    const startZ = (Math.random() - 0.5) * 30;
    const endX = startX + (Math.random() - 0.5) * 10;
    const endY = 0;
    const endZ = startZ + (Math.random() - 0.5) * 10;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(startX, endX, t) + (Math.random() - 0.5) * 2 * (1 - Math.abs(t - 0.5));
      const y = THREE.MathUtils.lerp(startY, endY, t) + (Math.random() - 0.5) * 1;
      const z = THREE.MathUtils.lerp(startZ, endZ, t) + (Math.random() - 0.5) * 2 * (1 - Math.abs(t - 0.5));
      
      points.push(new THREE.Vector3(x, y, z));
    }

    return {
      id: Date.now() + Math.random(),
      points,
      life: 0.3,
      maxLife: 0.3
    };
  };

  // Handle lightning triggers
  useEffect(() => {
    if (lightningTrigger > 0) {
      const newBolt = createLightningBolt();
      setBolts(prev => [...prev, newBolt]);
      setFlashIntensity(5);
      
      // Screen flash effect
      document.body.style.filter = 'brightness(1.5) contrast(1.2)';
      setTimeout(() => {
        document.body.style.filter = '';
      }, 100);
    }
  }, [lightningTrigger]);

  // Auto lightning during storms
  useFrame((state, delta) => {
    const stormIntensity = settings.rainIntensity / 100;
    
    if (stormIntensity > 0.5 && Math.random() < stormIntensity * 0.001) {
      const newBolt = createLightningBolt();
      setBolts(prev => [...prev, newBolt]);
      setFlashIntensity(5);
    }

    // Update bolt lifetimes
    setBolts(prev => prev.map(bolt => ({
      ...bolt,
      life: bolt.life - delta
    })).filter(bolt => bolt.life > 0));

    // Fade flash
    setFlashIntensity(prev => Math.max(0, prev - delta * 10));

    // Update flash light
    if (flashLightRef.current) {
      flashLightRef.current.intensity = flashIntensity;
    }
  });

  return (
    <>
      <pointLight
        ref={flashLightRef}
        position={[0, 10, 0]}
        color={0xffffff}
        intensity={flashIntensity}
        distance={50}
      />
      
      {bolts.map(bolt => (
        <group key={bolt.id}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={bolt.points.length}
                array={new Float32Array(bolt.points.flatMap(p => [p.x, p.y, p.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color={0xffffff} 
              transparent 
              opacity={bolt.life / bolt.maxLife}
              linewidth={3}
            />
          </line>
        </group>
      ))}
    </>
  );
};