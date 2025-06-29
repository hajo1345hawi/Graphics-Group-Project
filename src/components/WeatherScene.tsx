import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RainSystem } from './weather/RainSystem';
import { CloudSystem } from './weather/CloudSystem';
import { LightningSystem } from './weather/LightningSystem';
import { FogSystem } from './weather/FogSystem';
import { GroundPlane } from './environment/GroundPlane';
import { SkyBox } from './environment/SkyBox';
import { useWeatherStore } from '../store/weatherStore';
import * as THREE from 'three';

export const WeatherScene: React.FC = () => {
  const { scene, camera } = useThree();
  const { settings, triggerLightning } = useWeatherStore();
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          triggerLightning();
          break;
        case 'Digit1':
          useWeatherStore.getState().setPreset('clear');
          break;
        case 'Digit2':
          useWeatherStore.getState().setPreset('light-rain');
          break;
        case 'Digit3':
          useWeatherStore.getState().setPreset('heavy-rain');
          break;
        case 'Digit4':
          useWeatherStore.getState().setPreset('storm');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerLightning]);

  // Update lighting based on weather
  useFrame(() => {
    if (ambientLightRef.current && directionalLightRef.current) {
      const storminess = settings.rainIntensity / 100;
      const baseIntensity = 0.4 - storminess * 0.3;
      const sunIntensity = 1.0 - storminess * 0.7;
      
      ambientLightRef.current.intensity = baseIntensity;
      directionalLightRef.current.intensity = sunIntensity;
      
      // Adjust sun color based on weather
      const sunColor = new THREE.Color().lerpColors(
        new THREE.Color(0xffffff), // Clear
        new THREE.Color(0x666699), // Stormy
        storminess
      );
      directionalLightRef.current.color = sunColor;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight ref={ambientLightRef} intensity={0.4} color={0x404080} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 20, 5]}
        intensity={1.0}
        color={0xffffff}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Environment */}
      <SkyBox />
      <GroundPlane />
      
      {/* Weather Systems */}
      <RainSystem />
      <CloudSystem />
      <LightningSystem />
      <FogSystem />
    </>
  );
};