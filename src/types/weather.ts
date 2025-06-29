export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'rain' | 'mist';
  opacity: number;
  angle: number;
  wind: number;
}

export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  segments: CloudSegment[];
  color: string;
  darkening: number;
}

export interface CloudSegment {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

export interface LightningBolt {
  points: Point[];
  life: number;
  maxLife: number;
  width: number;
  brightness: number;
  color: string;
  branches: Point[][];
}

export interface Point {
  x: number;
  y: number;
}

export interface WeatherSettings {
  rainIntensity: number;
  windStrength: number;
  cloudCoverage: number;
  fogIntensity: number;
}

export type WeatherPreset = 'clear' | 'light-rain' | 'heavy-rain' | 'storm';