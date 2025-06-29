import { useRef, useCallback } from 'react';
import type { Particle } from '../types/weather';

export const useParticleSystem = (canvas: HTMLCanvasElement | null) => {
  const particlesRef = useRef<Particle[]>([]);
  const particlePoolRef = useRef<Particle[]>([]);
  const settingsRef = useRef({
    rainIntensity: 0.6,
    windStrength: 0.3,
    fogIntensity: 0.2,
    maxParticles: 2000
  });

  const createRainParticle = useCallback((): Particle => {
    if (!canvas) return {} as Particle;
    
    return {
      x: Math.random() * (canvas.width + 200) - 100,
      y: -10,
      vx: settingsRef.current.windStrength * 50 - 25,
      vy: 100 + Math.random() * 200,
      life: 60 + Math.random() * 40,
      maxLife: 60 + Math.random() * 40,
      size: 1 + Math.random() * 2,
      type: 'rain',
      opacity: 1,
      angle: 0,
      wind: 0
    };
  }, [canvas]);

  const createMistParticle = useCallback((): Particle => {
    if (!canvas) return {} as Particle;
    
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 20,
      vy: -10 - Math.random() * 20,
      life: 120 + Math.random() * 180,
      maxLife: 120 + Math.random() * 180,
      size: 10 + Math.random() * 30,
      type: 'mist',
      opacity: 0.3,
      angle: 0,
      wind: 0
    };
  }, [canvas]);

  const updateParticle = useCallback((particle: Particle, deltaTime: number, wind: number) => {
    particle.life -= deltaTime;
    particle.wind = wind;
    
    if (particle.type === 'rain') {
      particle.vx = particle.wind * 0.5;
      particle.vy += 0.2; // Gravity
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.opacity = Math.max(0, particle.life / particle.maxLife);
    } else if (particle.type === 'mist') {
      particle.vx += (Math.random() - 0.5) * 0.1;
      particle.vy += (Math.random() - 0.5) * 0.05;
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.opacity = (particle.life / particle.maxLife) * 0.3;
      particle.size += 0.1 * deltaTime;
    }
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    if (particle.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = particle.opacity;

    if (particle.type === 'rain') {
      ctx.strokeStyle = `rgba(173, 216, 255, ${particle.opacity})`;
      ctx.lineWidth = particle.size;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 0.5);
      ctx.stroke();
    } else if (particle.type === 'mist') {
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      );
      gradient.addColorStop(0, `rgba(200, 220, 255, ${particle.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(200, 220, 255, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  const update = useCallback((currentTime: number) => {
    if (!canvas) return;

    const deltaTime = 16.67; // 60fps target
    const particles = particlesRef.current;
    const windStrength = settingsRef.current.windStrength * 50 - 25;

    // Add new rain particles
    const rainCount = Math.floor(settingsRef.current.rainIntensity * 15);
    for (let i = 0; i < rainCount && particles.length < settingsRef.current.maxParticles; i++) {
      particles.push(createRainParticle());
    }

    // Add mist particles
    if (Math.random() < settingsRef.current.fogIntensity * 0.1) {
      particles.push(createMistParticle());
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      updateParticle(particle, deltaTime, windStrength);

      // Remove dead particles or those off screen
      if (particle.life <= 0 || 
          particle.y > canvas.height + 50 || 
          particle.x < -100 || 
          particle.x > canvas.width + 100) {
        particles.splice(i, 1);
      }
    }
  }, [canvas, createRainParticle, createMistParticle, updateParticle]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    
    // Sort particles by type for better rendering
    const rainParticles = particles.filter(p => p.type === 'rain');
    const mistParticles = particles.filter(p => p.type === 'mist');

    // Draw mist first (background layer)
    mistParticles.forEach(particle => drawParticle(ctx, particle));
    
    // Draw rain on top
    rainParticles.forEach(particle => drawParticle(ctx, particle));
  }, [drawParticle]);

  const setSettings = useCallback((newSettings: Partial<typeof settingsRef.current>) => {
    settingsRef.current = { ...settingsRef.current, ...newSettings };
  }, []);

  const getParticleCount = useCallback(() => particlesRef.current.length, []);

  const clear = useCallback(() => {
    particlesRef.current = [];
  }, []);

  return {
    update,
    draw,
    setSettings,
    getParticleCount,
    clear
  };
};