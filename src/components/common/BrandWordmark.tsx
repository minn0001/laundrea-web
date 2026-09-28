import React from 'react';

interface BrandWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'header';
  variant?: 'dark' | 'light' | 'pink';
  showLogo?: boolean;
  className?: string;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  size = 'md',
  variant = 'pink',
  showLogo = false,
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
      : 'text-[#cd6184]';

  const sizeClasses: Record<string, string> = {
    sm: 'text-2xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl',
    '2xl': 'text-6xl sm:text-7xl',
    header: 'text-[26px] sm:text-[32px]',
  };

  const textElement = (
    <span
      className={`font-script tracking-wide leading-none ${sizeClasses[size] || sizeClasses.md} ${colorClass} drop-shadow-xs font-bold ${
        showLogo ? 'relative top-[4px] sm:top-[5px]' : ''
      }`}
      style={{
        fontFamily: "'Great Vibes', 'Alex Brush', cursive",
        lineHeight: 1,
      }}
    >
      Laundrea
    </span>
  );

  if (showLogo) {
    return (
      <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
        {/* Square circular wrapper with diameter 1.4–1.5x font-size (38px/26px = 1.46x mobile, 46px/32px = 1.44x desktop) */}
        <div className="w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] rounded-full overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src="/Logo.png"
            alt="Laundrea"
            className="w-full h-full object-cover object-center scale-[1.08] origin-center"
            referrerPolicy="no-referrer"
          />
        </div>
        {textElement}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {textElement}
    </div>
  );
};
