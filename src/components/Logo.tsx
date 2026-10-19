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
  showText = false,
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
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      <img
        src={imageSrc}
        alt="AZ Monogram"
        className={`${heightClasses[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-serif text-sm tracking-[0.25em] font-semibold leading-tight ${
              variant === 'white' ? 'text-white' : 'text-black'
            }`}
          >
            ALEEZ
          </span>
          <span
            className={`text-[8px] uppercase tracking-[0.35em] ${
              variant === 'white' ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Parfums
          </span>
        </div>
      )}
    </div>
  );
};
