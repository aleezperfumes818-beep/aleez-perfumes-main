import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onFinish,
  minDuration = 1800,
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
        }, 650);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDuration, onFinish]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0C0D] text-white transition-all duration-700 select-none ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage:
          'radial-gradient(circle at center, rgba(184, 134, 11, 0.12) 0%, rgba(12, 12, 13, 0.98) 75%)',
      }}
    >
      {/* Decorative ambient gold glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#B8860B]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Central Brand Presentation */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto space-y-8">
        {/* Brand Typography */}
        <div className="space-y-2">
          <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-[0.28em] text-white">
            ALEEZ
          </h1>
          <p className="text-xs uppercase tracking-[0.45em] text-[#D4AF37] font-light">
            PERFUMES
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-56 sm:w-64 space-y-2">
          <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#B8860B] via-[#E5C378] to-[#F5D77F] transition-all duration-150 ease-out shadow-[0_0_10px_#E5C378]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
