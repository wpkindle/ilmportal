'use client';

import React from 'react';

/**
 * Main IlmiDunya signature brand loader / spinner.
 * Features the signature rotating dual-tone ring (terracotta & gold),
 * soft ambient gold glow, and central authentic brand emblem badge.
 *
 * @param {'sm' | 'md' | 'lg'} size - Dimension scaling
 * @param {string} text - Subtitle loading description
 * @param {boolean} showTitle - Whether to display "IlmiDunya Pakistan" brand title
 * @param {string} className - Optional container styling
 */
const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  showTitle = false,
  className = ''
}) => {
  if (size === 'sm') {
    return (
      <div className={`inline-flex flex-col items-center justify-center space-y-1.5 ${className}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-[#ba4c18]/20 border-t-[#ba4c18] border-r-[#d4a359] animate-spin" />
        </div>
        {text && <p className="text-[11px] font-medium text-stone-500 animate-pulse">{text}</p>}
      </div>
    );
  }

  const isLg = size === 'lg';

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-3.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Glow Halo */}
        <div
          className={`absolute ${
            isLg ? 'w-24 h-24' : 'w-16 h-16'
          } bg-[#d4a359]/15 rounded-full blur-xl pointer-events-none animate-pulse`}
        />

        {/* Outer Rotating Dual-Tone Spinner Ring */}
        <div
          className={`${
            isLg
              ? 'w-16 h-16 sm:w-20 sm:h-20 border-[3px]'
              : 'w-12 h-12 sm:w-14 sm:h-14 border-[2.5px]'
          } rounded-full border-[#ba4c18]/20 border-t-[#ba4c18] border-r-[#d4a359] animate-spin`}
        />

        {/* Center Brand Emblem Badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/icon.svg"
            alt="IlmiDunya Icon"
            width={isLg ? 40 : 28}
            height={isLg ? 40 : 28}
            className={`${
              isLg ? 'w-9 h-9 sm:w-11 sm:h-11' : 'w-6 h-6 sm:w-7 sm:h-7'
            } object-contain select-none drop-shadow-xs`}
          />
        </div>
      </div>

      <div className="text-center space-y-0.5">
        {(showTitle || isLg) && (
          <p className="text-xs sm:text-sm font-extrabold text-stone-800 tracking-tight">
            IlmiDunya Pakistan
          </p>
        )}
        {text && (
          <p className="text-[11px] sm:text-xs font-semibold text-stone-600 tracking-wide animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
