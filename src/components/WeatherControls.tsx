import React from 'react';
import { Cloud, CloudLightning, Wind, Droplets } from 'lucide-react';
import { useWeatherStore } from '../store/weatherStore';

export const WeatherControls: React.FC = () => {
  const { settings, updateSettings, setPreset, triggerLightning, stats } = useWeatherStore();

  const handleSliderChange = (key: keyof typeof settings, value: number) => {
    updateSettings({ [key]: value });
  };

  const getWeatherStatus = () => {
    const { rainIntensity } = settings;
    if (rainIntensity === 0) return 'Clear Sky';
    if (rainIntensity < 30) return 'Light Rain';
    if (rainIntensity < 70) return 'Moderate Rain';
    if (rainIntensity < 90) return 'Heavy Rain';
    return 'Thunderstorm';
  };

  return (
    <div className="fixed top-6 right-6 z-10">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Weather Controls</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Droplets className="w-4 h-4" />
                Rain Intensity
              </label>
              <span className="text-blue-400 font-mono text-sm">{settings.rainIntensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.rainIntensity}
              onChange={(e) => handleSliderChange('rainIntensity', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Wind className="w-4 h-4" />
                Wind Strength
              </label>
              <span className="text-blue-400 font-mono text-sm">{settings.windStrength}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.windStrength}
              onChange={(e) => handleSliderChange('windStrength', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Cloud className="w-4 h-4" />
                Cloud Coverage
              </label>
              <span className="text-blue-400 font-mono text-sm">{settings.cloudCoverage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.cloudCoverage}
              onChange={(e) => handleSliderChange('cloudCoverage', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/80">Fog Intensity</label>
              <span className="text-blue-400 font-mono text-sm">{settings.fogIntensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.fogIntensity}
              onChange={(e) => handleSliderChange('fogIntensity', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-emerald-400">Weather Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'clear', label: 'Clear Sky' },
              { id: 'light-rain', label: 'Light Rain' },
              { id: 'heavy-rain', label: 'Heavy Rain' },
              { id: 'storm', label: 'Thunderstorm' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setPreset(preset.id as any)}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <button
            onClick={triggerLightning}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
          >
            <CloudLightning className="w-4 h-4" />
            Trigger Lightning
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="mt-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex justify-between items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-white/60 mb-1">Particles</div>
            <div className="text-lg font-mono text-blue-400">{stats.particleCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60 mb-1">FPS</div>
            <div className="text-lg font-mono text-blue-400">{stats.fps}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60 mb-1">Weather</div>
            <div className="text-sm font-medium text-white/90">{getWeatherStatus()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};