import React from 'react';

interface BrandWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'pink';
  className?: string;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  size = 'md',
  variant = 'pink',
  className = '',
}) => {
  // Color mapping based on exact palette:
  // - Primary/accent: #cd6184
  // - Dark header/text: #254117
  // - Light/cream: #ffecf2 or white
  const colorClass =
    variant === 'dark'
      ? 'text-[#254117]'
      : variant === 'light'
      ? 'text-white'
      : variant === 'pink'
      ? 'text-[#cd6184]'
      : 'text-[#cd6184]';

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl',
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <span
        className={`font-script tracking-wide leading-none ${sizeClasses[size]} ${colorClass} drop-shadow-xs font-bold`}
        style={{
          fontFamily: "'Great Vibes', 'Alex Brush', cursive",
        }}
      >
        Laundrea
      </span>
    </div>
  );
};
