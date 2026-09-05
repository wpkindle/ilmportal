'use client';

import React from 'react';

/**
 * BrandLogo component for IlmiDunya Pakistan.
 * Inspired by the authentic open-book emblem, modern typography, and Urdu calligraphy.
 *
 * @param {'light' | 'dark' | 'icon'} variant - Color scheme ('light' for navbar/white cards, 'dark' for footer)
 * @param {'xs' | 'sm' | 'md' | 'lg'} size - Overall dimension scaling
 * @param {boolean} withUrdu - Whether to display the "علمی دنیا" subtitle
 * @param {boolean} withBadge - Whether to display the "Pakistan" badge
 * @param {string} className - Optional custom class name
 */
export default function BrandLogo({
  variant = 'light',
  size = 'md',
  withUrdu = true,
  withBadge = true,
  className = ''
}) {
  const isDark = variant === 'dark';
  const isIconOnly = variant === 'icon';

  // Size specifications
  const heights = {
    xs: 28,
    sm: 34,
    md: 42,
    lg: 52
  };

  const currentHeight = heights[size] || heights.md;

  if (isIconOnly) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          height={currentHeight}
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <g transform="translate(1, 1)">
            {/* Outer Book Frame */}
            <path
              d="M 6 12 L 6 42 C 6 45 8 47 11 47 L 40 47 L 40 41 L 12 41 C 11.5 41 11 40.5 11 40 L 11 14 L 6 12 Z"
              fill={isDark ? '#00d1a7' : '#00a884'}
            />
            {/* Top Open Pages Arch */}
            <path
              d="M 6 12 C 13 8 21 10 26 16 C 31 10 39 8 46 12 L 46 18 C 39 14 31 16 26 21 C 21 16 13 14 6 18 Z"
              fill={isDark ? '#00d1a7' : '#00a884'}
            />
            {/* Inner Pages Line */}
            <path
              d="M 14 22 Q 20 18 26 24 Q 32 18 38 22"
              stroke={isDark ? '#d4a359' : '#0c2217'}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Emblem */}
      <div className="shrink-0 flex items-center">
        <svg
          height={currentHeight}
          viewBox="0 0 52 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:scale-105"
        >
          {/* Outer Book Spine & Lower Horizontal Shelf */}
          <path
            d="M 5 10 L 5 44 C 5 48 8 51 12 51 L 44 51 L 44 43 L 13 43 C 12.5 43 12 42.5 12 42 L 12 12 L 5 10 Z"
            fill={isDark ? '#00d1a7' : '#00a884'}
          />
          {/* Top Open Pages Arch */}
          <path
            d="M 5 10 C 13 5 22 7 26 14 C 30 7 39 5 47 10 L 47 18 C 39 13 31 15 26 20 C 21 15 13 13 5 18 Z"
            fill={isDark ? '#00d1a7' : '#00a884'}
          />
          {/* Inner Curved Page Spine Highlight */}
          <path
            d="M 13 22 Q 20 17 26 23 Q 32 17 39 22"
            stroke={isDark ? '#ffffff' : '#143d2b'}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Typography & Badge Lockup */}
      <div className="flex flex-col justify-center text-left leading-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`font-sans font-black tracking-tight flex items-baseline ${
              size === 'xs'
                ? 'text-base'
                : size === 'sm'
                ? 'text-lg'
                : size === 'lg'
                ? 'text-2xl sm:text-3xl'
                : 'text-xl sm:text-2xl'
            } ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            <span>ilmi</span>
            <span className={isDark ? 'text-[#00d1a7]' : 'text-[#00a884]'}>dunya</span>
          </span>

          {withBadge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider ${
                isDark
                  ? 'bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40 shadow-xs'
                  : 'bg-[#143d2b] text-[#f5f0e6] border border-[#d4a359]/30 shadow-2xs'
              }`}
            >
              Pakistan
            </span>
          )}
        </div>

        {withUrdu && (
          <div className="flex items-center justify-between -mt-0.5 sm:mt-0">
            <span
              className={`font-serif text-[11px] sm:text-[12px] font-bold tracking-normal ${
                isDark ? 'text-[#00d1a7]' : 'text-[#00a884]'
              }`}
              dir="rtl"
            >
              علمی دُنیا پاکستان
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

