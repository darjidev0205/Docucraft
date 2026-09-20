import React from 'react';

interface DocuCraftLogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  variant?: 'dark' | 'light' | 'mono';
  showWordmark?: boolean;
  className?: string;
}

export function DocuCraftLogo({
  size = 'md',
  variant = 'dark',
  showWordmark = true,
  className = '',
}: DocuCraftLogoProps) {
  // Dimensions
  let pixelSize = 28;
  let textSize = 'text-lg';
  let badgePadding = 'px-1.5 py-0.5 text-[9px]';

  if (typeof size === 'number') {
    pixelSize = size;
  } else if (size === 'sm') {
    pixelSize = 20;
    textSize = 'text-sm';
    badgePadding = 'px-1 py-0.2 text-[8px]';
  } else if (size === 'lg') {
    pixelSize = 36;
    textSize = 'text-xl';
    badgePadding = 'px-2 py-0.5 text-[10px]';
  }

  // Color tokens
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-ink-900';
  const textMuted = isLight ? 'text-white/60' : 'text-ink-500';
  const sheetStroke = isLight ? '#FFFFFF' : '#17181C';
  const foldColor = isLight ? '#FFA259' : '#FFA259';
  const lineStroke = isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(23, 24, 28, 0.3)';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Document & Fold Mark */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
      >
        {/* Main Document Body with folded top-right */}
        <path
          d="M6 4C6 2.89543 6.89543 2 8 2H20L27 9V28C27 29.1046 26.1046 30 25 30H8C6.89543 30 6 29.1046 6 28V4Z"
          fill={isLight ? '#22242A' : '#FFFFFF'}
          stroke={sheetStroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 45-degree Precision Corner Fold */}
        <path
          d="M20 2V7C20 8.10457 20.8954 9 22 9H27L20 2Z"
          fill={foldColor}
          stroke={sheetStroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Tactile Editorial Ruled Lines */}
        <line
          x1="10"
          y1="14"
          x2="23"
          y2="14"
          stroke={lineStroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="19"
          x2="23"
          y2="19"
          stroke={lineStroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="24"
          x2="18"
          y2="24"
          stroke={lineStroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Crafted Wordmark */}
      {showWordmark && (
        <div className="flex items-center gap-1.5 font-sans tracking-tight">
          <span className={`font-extrabold tracking-[-0.03em] ${textSize} ${textColor}`}>
            DOCU<span className="text-brand-orange font-bold">CRAFT</span>
          </span>
        </div>
      )}
    </div>
  );
}

export function DocuCraftIcon({ size = 24, className = '', variant = 'dark' }: { size?: number; className?: string; variant?: 'dark' | 'light' }) {
  return <DocuCraftLogo size={size} showWordmark={false} className={className} variant={variant} />;
}
