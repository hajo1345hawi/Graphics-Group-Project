import { create } from 'zustand';

export interface WeatherSettings {
  rainIntensity: number;
  windStrength: number;
  cloudCoverage: number;
  fogIntensity: number;
}

export interface WeatherStats {
  particleCount: number;
  fps: number;
}

export type WeatherPreset = 'clear' | 'light-rain' | 'heavy-rain' | 'storm';

interface WeatherStore {
  settings: WeatherSettings;
  stats: WeatherStats;
  lightningTrigger: number;
  updateSettings: (newSettings: Partial<WeatherSettings>) => void;
  setPreset: (preset: WeatherPreset) => void;
  triggerLightning: () => void;
  updateStats: (stats: Partial<WeatherStats>) => void;
}

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  settings: {
    rainIntensity: 60,
    windStrength: 30,
    cloudCoverage: 70,
    fogIntensity: 20
  },
  stats: {
    particleCount: 0,
    fps: 60
  },
  lightningTrigger: 0,
  
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },
  
  setPreset: (preset) => {
    const presets: Record<WeatherPreset, WeatherSettings> = {
      'clear': { rainIntensity: 0, windStrength: 10, cloudCoverage: 20, fogIntensity: 5 },
      'light-rain': { rainIntensity: 40, windStrength: 25, cloudCoverage: 60, fogIntensity: 15 },
      'heavy-rain': { rainIntensity: 80, windStrength: 50, cloudCoverage: 85, fogIntensity: 30 },
      'storm': { rainIntensity: 95, windStrength: 70, cloudCoverage: 95, fogIntensity: 40 }
    };
    
    set({ settings: presets[preset] });
  },
  
  triggerLightning: () => {
    set((state) => ({ lightningTrigger: state.lightningTrigger + 1 }));
  },
  
  updateStats: (newStats) => {
    set((state) => ({
      stats: { ...state.stats, ...newStats }
    }));
  }
}));