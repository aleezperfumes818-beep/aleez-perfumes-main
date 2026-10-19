import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showText = true,
}) => {
  const heightClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const imageSrc = variant === 'white' ? '/logo-white.png' : '/logo.png';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      <img
        src={imageSrc}
        alt="AZ Monogram"
        className={`${heightClasses[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-serif tracking-[0.22em] font-semibold leading-tight ${
              size === 'xs'
                ? 'text-xs tracking-[0.18em]'
                : size === 'sm'
                ? 'text-sm tracking-[0.2em]'
                : size === 'lg' || size === 'xl'
                ? 'text-lg sm:text-xl tracking-[0.25em]'
                : 'text-base sm:text-lg tracking-[0.22em]'
            } ${variant === 'white' ? 'text-white' : 'text-black'}`}
          >
            ALEEZ
          </span>
          <span
            className={`text-[8px] sm:text-[9px] uppercase tracking-[0.38em] -mt-0.5 font-medium ${
              variant === 'white' ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Perfumes
          </span>
        </div>
      )}
    </div>
  );
};
