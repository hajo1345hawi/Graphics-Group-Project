import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useWeatherStore } from '../../store/weatherStore';
import * as THREE from 'three';

export const FogSystem: React.FC = () => {
  const { scene } = useThree();
  const { settings } = useWeatherStore();
  const fogRef = useRef<THREE.Fog>();

  useFrame(() => {
    if (settings.fogIntensity > 0) {
      if (!scene.fog) {
        scene.fog = new THREE.Fog(0x666699, 5, 50);
        fogRef.current = scene.fog;
      }
      
      if (fogRef.current) {
        const intensity = settings.fogIntensity / 100;
        fogRef.current.near = 5 - intensity * 3;
        fogRef.current.far = 50 - intensity * 30;
        
        // Adjust fog color based on weather
        const storminess = settings.rainIntensity / 100;
        const fogColor = new THREE.Color().lerpColors(
          new THREE.Color(0x888899), // Light fog
          new THREE.Color(0x444466), // Heavy storm fog
          storminess
        );
        fogRef.current.color = fogColor;
      }
    } else {
      scene.fog = null;
    }
  });

  return null;
};