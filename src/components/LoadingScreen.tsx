import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

interface LoadingScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onFinish,
  minDuration = 1200,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / minDuration) * 100));
      setProgress(currentProgress);

      if (elapsed >= minDuration) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          setIsRemoved(true);
          if (onFinish) onFinish();
        }, 500);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minDuration, onFinish]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white transition-all duration-700 select-none ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Central Brand Presentation with AZ Logo */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto space-y-6">
        <div className="animate-fade-in flex flex-col items-center">
          <Logo variant="white" size="lg" className="mb-2" />
          <p className="text-[10px] uppercase tracking-[0.45em] text-neutral-400 font-light mt-1">
            Haute Parfumerie
          </p>
        </div>

        {/* Loading Progress Bar - Pure Minimalist Monochrome */}
        <div className="w-44 sm:w-52 space-y-2 pt-2">
          <div className="h-[2px] w-full bg-neutral-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-white transition-all duration-150 ease-out shadow-[0_0_8px_rgba(255,255,255,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
