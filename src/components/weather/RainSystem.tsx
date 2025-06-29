import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWeatherStore } from '../../store/weatherStore';
import * as THREE from 'three';

export const RainSystem: React.FC = () => {
  const { settings } = useWeatherStore();
  const rainRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>();
  
  const { geometry, material, particleCount } = useMemo(() => {
    const count = Math.floor(settings.rainIntensity * 50);
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    // Initialize rain particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 40; // x
      positions[i3 + 1] = Math.random() * 30 + 10; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 40; // z
      
      // Velocity
      velocities[i3] = (Math.random() - 0.5) * settings.windStrength * 0.1; // x
      velocities[i3 + 1] = -10 - Math.random() * 5; // y (falling)
      velocities[i3 + 2] = (Math.random() - 0.5) * settings.windStrength * 0.05; // z
    }
    
    velocitiesRef.current = velocities;
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0x87ceeb,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    return { geometry: geo, material: mat, particleCount: count };
  }, [settings.rainIntensity, settings.windStrength]);

  useFrame((state, delta) => {
    if (!rainRef.current || !velocitiesRef.current) return;
    
    const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Update positions
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
      
      // Reset particles that fall below ground
      if (positions[i3 + 1] < 0) {
        positions[i3] = (Math.random() - 0.5) * 40;
        positions[i3 + 1] = 30 + Math.random() * 10;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;
      }
      
      // Wrap particles horizontally
      if (Math.abs(positions[i3]) > 20) {
        positions[i3] = -Math.sign(positions[i3]) * 20;
      }
      if (Math.abs(positions[i3 + 2]) > 20) {
        positions[i3 + 2] = -Math.sign(positions[i3 + 2]) * 20;
      }
    }
    
    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (settings.rainIntensity === 0) return null;

  return (
    <points ref={rainRef} geometry={geometry} material={material} />
  );
};
