import React, { useState, useEffect } from 'react';

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
          ? 'opacity-0 scale-[1.02] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      aria-hidden="true"
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto space-y-7 animate-fade-in">
        {/* AZ Monogram Emblem */}
        <div className="transition-transform duration-500">
          <img
            src="/logo-white.png"
            alt="AZ Monogram"
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-md"
            loading="eager"
          />
        </div>

        {/* Brand Typography */}
        <div className="space-y-1.5 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.32em] font-light text-white uppercase">
            ALEEZ
          </h1>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.5em] text-neutral-400 font-light">
            Haute Parfumerie
          </p>
        </div>

        {/* Minimalist Hairline Progress Bar */}
        <div className="w-48 sm:w-56 space-y-2.5 pt-2">
          <div className="h-[1.5px] w-full bg-neutral-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-white transition-all duration-150 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-0.5">
            <span>Essence</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
