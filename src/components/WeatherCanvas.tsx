import { useRef, useEffect, useCallback } from 'react';

interface WeatherCanvasProps {
  onCanvasReady: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}

export const WeatherCanvas: React.FC<WeatherCanvasProps> = ({ onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctxRef.current = ctx;
    onCanvasReady(canvas, ctx);
  }, [onCanvasReady]);

  useEffect(() => {
    setupCanvas();
    
    const handleResize = () => {
      setupCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 cursor-crosshair"
      style={{
        background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 20%, #0f3460 50%, #533483 100%)'
      }}
      onClick={(e) => {
        if (e.shiftKey) {
          // Manual lightning trigger on shift+click
          const event = new CustomEvent('manualLightning');
          window.dispatchEvent(event);
        }
      }}
    />
  );
};