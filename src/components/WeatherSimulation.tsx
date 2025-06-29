import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Environment } from '@react-three/drei';
import { WeatherScene } from './WeatherScene';
import { WeatherControls } from './WeatherControls';
import { LoadingScreen } from './LoadingScreen';
import { useWeatherStore } from '../store/weatherStore';


export const WeatherSimulation: React.FC = () => {
  const { settings } = useWeatherStore();

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <Canvas
        camera={{
          position: [0, 5, 15],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="night" />
          <WeatherScene />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
          />
          {import.meta.env.MODE === "development" && <Stats />}
        </Suspense>
      </Canvas>

      <LoadingScreen />
      <WeatherControls />

      {/* Instructions */}
      <div className="fixed bottom-6 left-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-sm text-white/80">
        <div className="space-y-1">
          <div>
            <kbd className="bg-white/20 px-2 py-1 rounded text-xs">Mouse</kbd>{" "}
            Orbit Camera
          </div>
          <div>
            <kbd className="bg-white/20 px-2 py-1 rounded text-xs">Scroll</kbd>{" "}
            Zoom
          </div>
          <div>
            <kbd className="bg-white/20 px-2 py-1 rounded text-xs">Space</kbd>{" "}
            Lightning
          </div>
          <div>
            <kbd className="bg-white/20 px-2 py-1 rounded text-xs">1-4</kbd>{" "}
            Weather Presets
          </div>
        </div>
      </div>
    </div>
  );
};