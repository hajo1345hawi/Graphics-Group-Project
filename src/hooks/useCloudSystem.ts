import { useRef, useCallback } from 'react';
import type { Cloud, CloudSegment } from '../types/weather';

export const useCloudSystem = (canvas: HTMLCanvasElement | null) => {
  const cloudsRef = useRef<Cloud[]>([]);
  const settingsRef = useRef({
    coverage: 0.7,
    windSpeed: 1,
    storminess: 0
  });

  const generateCloudSegments = useCallback((size: number): CloudSegment[] => {
    const segments: CloudSegment[] = [];
    const count = 8 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = size * (0.6 + Math.random() * 0.4);
      const offsetX = Math.cos(angle) * radius * (0.7 + Math.random() * 0.6);
      const offsetY = Math.sin(angle) * radius * (0.4 + Math.random() * 0.3);
      
      segments.push({
        x: offsetX,
        y: offsetY,
        radius: size * (0.3 + Math.random() * 0.4),
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    
    return segments;
  }, []);

  const createCloud = useCallback((x: number, y: number, size: number, speed: number): Cloud => {
    const opacity = 0.3 + Math.random() * 0.4;
    return {
      x,
      y,
      size,
      speed,
      opacity,
      segments: generateCloudSegments(size),
      color: `rgba(${150 + Math.random() * 50}, ${160 + Math.random() * 50}, ${180 + Math.random() * 50}, ${opacity})`,
      darkening: 0
    };
  }, [generateCloudSegments]);

  const initializeClouds = useCallback(() => {
    if (!canvas) return;
    
    cloudsRef.current = [];
    const cloudCount = Math.floor(settingsRef.current.coverage * 15);
    
    for (let i = 0; i < cloudCount; i++) {
      const x = Math.random() * (canvas.width + 400) - 200;
      const y = Math.random() * canvas.height * 0.4;
      const size = 40 + Math.random() * 80;
      const speed = 0.5 + Math.random() * 1.5;
      
      cloudsRef.current.push(createCloud(x, y, size, speed));
    }
  }, [canvas, createCloud]);

  const updateCloud = useCallback((cloud: Cloud, deltaTime: number, windSpeed: number) => {
    cloud.x += cloud.speed * windSpeed * deltaTime;
    
    // Add slight vertical movement
    cloud.y += Math.sin(Date.now() * 0.001 + cloud.x * 0.01) * 0.1 * deltaTime;
    
    // Reset position when off screen
    if (canvas && cloud.x > canvas.width + cloud.size * 2) {
      cloud.x = -cloud.size * 2;
      cloud.y = Math.random() * canvas.height * 0.4;
    }
    
    cloud.darkening = settingsRef.current.storminess;
    cloud.opacity = 0.4 + settingsRef.current.storminess * 0.4;
  }, [canvas]);

  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, cloud: Cloud) => {
    ctx.save();
    
    cloud.segments.forEach(segment => {
      ctx.globalAlpha = segment.opacity * cloud.opacity;
      
      // Create gradient for more realistic clouds
      const gradient = ctx.createRadialGradient(
        cloud.x + segment.x, cloud.y + segment.y, 0,
        cloud.x + segment.x, cloud.y + segment.y, segment.radius
      );
      
      const lightness = 180 - cloud.darkening * 80;
      gradient.addColorStop(0, `rgba(${lightness}, ${lightness}, ${lightness + 20}, ${segment.opacity})`);
      gradient.addColorStop(0.7, `rgba(${lightness - 30}, ${lightness - 30}, ${lightness - 10}, ${segment.opacity * 0.7})`);
      gradient.addColorStop(1, `rgba(${lightness - 50}, ${lightness - 50}, ${lightness - 30}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cloud.x + segment.x, cloud.y + segment.y, segment.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }, []);

  const update = useCallback((deltaTime: number) => {
    if (!canvas) return;
    
    const clouds = cloudsRef.current;
    const windSpeed = settingsRef.current.windSpeed;
    
    clouds.forEach(cloud => updateCloud(cloud, deltaTime, windSpeed));
    
    // Add new clouds if coverage increased
    const targetCount = Math.floor(settingsRef.current.coverage * 15);
    while (clouds.length < targetCount) {
      const x = -100 - Math.random() * 200;
      const y = Math.random() * canvas.height * 0.4;
      const size = 40 + Math.random() * 80;
      const speed = 0.5 + Math.random() * 1.5;
      
      clouds.push(createCloud(x, y, size, speed));
    }
    
    // Remove clouds if coverage decreased
    while (clouds.length > targetCount) {
      clouds.pop();
    }
  }, [canvas, createCloud, updateCloud]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Sort clouds by size for depth effect
    const sortedClouds = [...cloudsRef.current].sort((a, b) => b.size - a.size);
    
    sortedClouds.forEach(cloud => drawCloud(ctx, cloud));
  }, [drawCloud]);

  const setSettings = useCallback((newSettings: Partial<typeof settingsRef.current>) => {
    settingsRef.current = { ...settingsRef.current, ...newSettings };
  }, []);

  return {
    initializeClouds,
    update,
    draw,
    setSettings
  };
};