import { useRef, useCallback } from 'react';
import type { LightningBolt, Point } from '../types/weather';

export const useLightningSystem = (canvas: HTMLCanvasElement | null) => {
  const boltsRef = useRef<LightningBolt[]>([]);
  const flashesRef = useRef<Array<{life: number; maxLife: number; intensity: number; fadeRate: number}>>([]);
  const autoLightningRef = useRef(true);
  const lastLightningRef = useRef(0);

  const createLightningBolt = useCallback((startX: number, startY: number, endX: number, endY: number, segments = 20): LightningBolt => {
    const bolt: LightningBolt = {
      points: [],
      life: 30,
      maxLife: 30,
      width: 2 + Math.random() * 4,
      brightness: 0.8 + Math.random() * 0.2,
      color: `hsl(${200 + Math.random() * 60}, 100%, ${80 + Math.random() * 20}%)`,
      branches: []
    };

    // Generate main bolt path
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 50 * (1 - Math.abs(t - 0.5) * 2);
      const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 30;
      bolt.points.push({ x, y });
    }

    // Add branches
    for (let i = 0; i < 3 + Math.random() * 4; i++) {
      const branchStart = Math.floor(Math.random() * (segments - 2)) + 1;
      const branchLength = 3 + Math.random() * 5;
      const branch: Point[] = [];
      
      const startPoint = bolt.points[branchStart];
      for (let j = 0; j < branchLength; j++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.8;
        const distance = 20 + Math.random() * 40;
        const x = startPoint.x + Math.cos(angle) * distance * (j + 1) / branchLength;
        const y = startPoint.y + Math.sin(angle) * distance * (j + 1) / branchLength;
        branch.push({ x, y });
      }
      bolt.branches.push(branch);
    }

    return bolt;
  }, []);

  const createLightningFlash = useCallback(() => {
    return {
      life: 20,
      maxLife: 20,
      intensity: 0.8 + Math.random() * 0.2,
      fadeRate: 0.95
    };
  }, []);

  const triggerLightning = useCallback(() => {
    if (!canvas) return;
    
    const startX = Math.random() * canvas.width;
    const startY = 0;
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = canvas.height * (0.3 + Math.random() * 0.4);

    boltsRef.current.push(createLightningBolt(startX, startY, endX, endY));
    flashesRef.current.push(createLightningFlash());
    
    // Flash screen effect
    document.body.style.filter = 'brightness(1.5) contrast(1.2)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, 100);
  }, [canvas, createLightningBolt, createLightningFlash]);

  const drawLightningBolt = useCallback((ctx: CanvasRenderingContext2D, bolt: LightningBolt) => {
    ctx.save();
    
    const opacity = bolt.life / bolt.maxLife;
    ctx.globalAlpha = opacity * bolt.brightness;
    ctx.shadowColor = bolt.color;
    ctx.shadowBlur = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw main bolt
    ctx.strokeStyle = bolt.color;
    ctx.lineWidth = bolt.width;
    ctx.beginPath();
    if (bolt.points.length > 0) {
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) {
        ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      }
    }
    ctx.stroke();

    // Draw branches
    bolt.branches.forEach(branch => {
      ctx.lineWidth = bolt.width * 0.6;
      ctx.beginPath();
      if (branch.length > 0) {
        ctx.moveTo(branch[0].x, branch[0].y);
        for (let i = 1; i < branch.length; i++) {
          ctx.lineTo(branch[i].x, branch[i].y);
        }
      }
      ctx.stroke();
    });

    ctx.restore();
  }, []);

  const drawFlash = useCallback((ctx: CanvasRenderingContext2D, flash: {intensity: number}) => {
    if (!canvas) return;
    
    ctx.save();
    ctx.globalAlpha = flash.intensity * 0.3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [canvas]);

  const update = useCallback((deltaTime: number, stormIntensity: number) => {
    const currentTime = Date.now();

    // Auto lightning trigger
    if (autoLightningRef.current && stormIntensity > 0.5) {
      const timeSinceLastLightning = currentTime - lastLightningRef.current;
      const lightningChance = stormIntensity * 0.0001 * deltaTime;
      
      if (timeSinceLastLightning > 3000 && Math.random() < lightningChance) {
        triggerLightning();
        lastLightningRef.current = currentTime;
      }
    }

    // Update lightning bolts
    const bolts = boltsRef.current;
    for (let i = bolts.length - 1; i >= 0; i--) {
      const bolt = bolts[i];
      bolt.life -= deltaTime;
      
      if (bolt.life <= 0) {
        bolts.splice(i, 1);
      }
    }

    // Update flashes
    const flashes = flashesRef.current;
    for (let i = flashes.length - 1; i >= 0; i--) {
      const flash = flashes[i];
      flash.life -= deltaTime;
      flash.intensity *= flash.fadeRate;
      
      if (flash.life <= 0) {
        flashes.splice(i, 1);
      }
    }
  }, [triggerLightning]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw flashes first (background)
    flashesRef.current.forEach(flash => drawFlash(ctx, flash));
    
    // Draw lightning bolts
    boltsRef.current.forEach(bolt => drawLightningBolt(ctx, bolt));
  }, [drawFlash, drawLightningBolt]);

  const manualTrigger = useCallback(() => {
    triggerLightning();
    lastLightningRef.current = Date.now();
  }, [triggerLightning]);

  const setAutoLightning = useCallback((enabled: boolean) => {
    autoLightningRef.current = enabled;
  }, []);

  return {
    update,
    draw,
    manualTrigger,
    setAutoLightning
  };
};