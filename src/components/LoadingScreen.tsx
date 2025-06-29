import React, { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsLoading(false);
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <div className="text-center">
        <Cloud className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">Loading Weather Simulation</h2>
        <p className="text-white/60 mb-6">Initializing Three.js scene...</p>
        
        <div className="w-64 bg-white/20 rounded-full h-2 mx-auto">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <p className="text-white/40 mt-2 text-sm">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};