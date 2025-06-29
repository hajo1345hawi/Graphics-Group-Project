import React, { useMemo } from 'react';
import { useWeatherStore } from '../../store/weatherStore';
import * as THREE from 'three';

export const SkyBox: React.FC = () => {
  const { settings } = useWeatherStore();
  
  const skyColor = useMemo(() => {
    const storminess = settings.rainIntensity / 100;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x87ceeb), // Clear sky blue
      new THREE.Color(0x2c2c54), // Dark storm
      storminess
    );
  }, [settings.rainIntensity]);

  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial 
        color={skyColor} 
        side={THREE.BackSide}
      />
    </mesh>
  );
};