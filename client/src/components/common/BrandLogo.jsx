'use client';

import React from 'react';

/**
 * BrandLogo component for IlmiDunya Pakistan.
 * Renders the authentic logo artwork provided by the user.
 *
 * @param {'light' | 'dark' | 'icon'} variant - Color scheme ('light' for navbar/white cards, 'dark' for footer)
 * @param {'xs' | 'sm' | 'md' | 'lg'} size - Overall dimension scaling
 * @param {boolean} withUrdu - Display option
 * @param {boolean} withBadge - Whether to display the "Pakistan" badge
 * @param {string} className - Optional custom class name
 */
export default function BrandLogo({
  variant = 'light',
  size = 'md',
  withBadge = false,
  className = ''
}) {
  const isDark = variant === 'dark';
  const isIconOnly = variant === 'icon';

  const sizeClasses = {
    xs: 'h-6 sm:h-7',
    sm: 'h-7 sm:h-9',
    md: 'h-8 sm:h-10 md:h-12',
    lg: 'h-10 sm:h-12 md:h-16'
  };

  const heights = {
    xs: 28,
    sm: 36,
    md: 48,
    lg: 64
  };

  const currentHeight = heights[size] || heights.md;

  if (isIconOnly) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/icon.svg"
          alt="IlmiDunya Icon"
          width={currentHeight}
          height={currentHeight}
          className={`${sizeClasses[size] || 'h-8 sm:h-10'} w-auto object-contain select-none transition-transform group-hover:scale-105`}
        />
      </div>
    );
  }

  const logoSrc = isDark ? '/logo-dark.svg' : '/logo.svg';

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 select-none shrink-0 ${className}`}>
      <img
        src={logoSrc}
        alt="IlmiDunya Pakistan"
        height={currentHeight}
        className={`${sizeClasses[size] || 'h-8 sm:h-10'} w-auto object-contain select-none transition-transform group-hover:scale-[1.02]`}
      />
      {withBadge && (
        <span
          className={`px-1.5 py-0.5 rounded text-[7.5px] sm:text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${
            isDark
              ? 'bg-[#c25d33] text-white border border-[#c25d33]/50 shadow-xs'
              : 'bg-[#c25d33] text-white shadow-2xs'
          }`}
        >
          Pakistan
        </span>
      )}
    </div>
  );
}

