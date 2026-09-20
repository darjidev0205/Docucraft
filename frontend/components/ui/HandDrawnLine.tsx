'use client';

import React from 'react';

export type HandDrawnVariant = 'underline' | 'arrow' | 'connector' | 'circle';

export interface HandDrawnLineProps {
  variant?: HandDrawnVariant;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export function HandDrawnLine({
  variant = 'underline',
  color = 'currentColor',
  className = '',
  strokeWidth = 1.75,
}: HandDrawnLineProps) {
  if (variant === 'underline') {
    return (
      <svg
        viewBox="0 0 320 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
        preserveAspectRatio="none"
      >
        <path
          d="M 2 8.5 C 52 4.2, 108 12.8, 164 7.5 C 220 2.8, 272 11.2, 318 6.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'arrow') {
    return (
      <svg
        viewBox="0 0 46 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
      >
        {/* Curved hand-drawn shaft */}
        <path
          d="M 3 23 C 14 21, 28 15, 41 5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Hand-drawn arrowhead */}
        <path
          d="M 31 4 C 36 4.5, 41 5, 41 5 C 40 8, 38 13, 35 17"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'connector') {
    return (
      <svg
        viewBox="0 0 80 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
      >
        <path
          d="M 2 9 C 24 4, 48 14, 72 8"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        <path
          d="M 66 4 L 73 8 L 67 13"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'circle') {
    return (
      <svg
        viewBox="0 0 100 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
      >
        <path
          d="M 12 26 C 10 12, 35 5, 62 6 C 88 7, 96 20, 89 33 C 81 44, 42 47, 21 41 C 8 36, 14 18, 30 14"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return null;
}

/**
 * Editorial annotation badge styled like a designer's pencil note on a printed proof.
 */
export function EditorialAnnotation({
  text,
  className = '',
  color = '#FFA259',
}: {
  text: string;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border shadow-subtle ${className}`}
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}12`,
        color: '#17181C',
      }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
      <span>{text}</span>
    </span>
  );
}
