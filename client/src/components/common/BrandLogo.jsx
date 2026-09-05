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

  const heights = {
    xs: 26,
    sm: 32,
    md: 40,
    lg: 52
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
          className="object-contain select-none transition-transform group-hover:scale-105"
          style={{ height: currentHeight, width: currentHeight }}
        />
      </div>
    );
  }

  const logoSrc = isDark ? '/logo-dark.svg' : '/logo.svg';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={logoSrc}
        alt="IlmiDunya Pakistan"
        height={currentHeight}
        className="h-auto object-contain select-none transition-transform group-hover:scale-[1.02]"
        style={{ height: currentHeight, width: 'auto' }}
      />
      {withBadge && (
        <span
          className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider ${
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

