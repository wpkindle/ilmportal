'use client';

import React from 'react';

/**
 * Professional Brand Loading Spinner for IlmiDunya Pakistan.
 *
 * Features:
 *  - Radial ambient brand glow backdrop (forest green, warm gold, terracotta)
 *  - Silky-smooth, hardware-accelerated circular dual-gradient spinner
 *  - Authentic official IlmiDunya brand logo (/logo.svg)
 *  - Refined horizontal shimmer progress indicator
 *  - Fully responsive across mobile, tablet, and desktop screens
 *
 * @param {'sm' | 'md' | 'lg'} size
 * @param {string} className
 * @param {string} text - Optional status text
 */
const LoadingSpinner = ({ size = 'md', className = '', text }) => {
  /* ── sm: ultra-sleek compact spinner for buttons, pills, and inline cards ── */
  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 rounded-full bg-[#d4a359]/20 blur-xs animate-pulse pointer-events-none" />
          <svg className="w-6 h-6 animate-spin text-[#143d2b]" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="2.5"
            />
            <path
              fill="#ba4c18"
              d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5h-2.5a7 7 0 0 0-7-7V2.5z"
            />
          </svg>
        </div>
      </div>
    );
  }

  const isLg = size === 'lg';
  const spinnerPx = isLg ? 56 : 44;
  const logoWidthPx = isLg ? 156 : 124;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 sm:gap-4 select-none ${className}`}
      role="status"
      aria-label="Loading..."
    >
      {/* ── Circular Precision Spinner ───────────────────── */}
      <div className="relative flex items-center justify-center">
        {/* Soft atmospheric brand aura */}
        <div
          className="absolute bg-gradient-to-tr from-[#143d2b]/15 via-[#d4a359]/25 to-[#ba4c18]/20 rounded-full blur-xl pointer-events-none animate-pulse"
          style={{
            width: spinnerPx + 28,
            height: spinnerPx + 28,
          }}
        />

        {/* Circular Dual-Gradient Spinner Ring */}
        <svg
          width={spinnerPx}
          height={spinnerPx}
          viewBox="0 0 50 50"
          className="relative animate-spin"
          style={{ animationDuration: '0.85s' }}
        >
          <defs>
            <linearGradient id={`ilmi-spin-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#143d2b" />
              <stop offset="50%" stopColor="#d4a359" />
              <stop offset="100%" stopColor="#ba4c18" />
            </linearGradient>
          </defs>
          {/* Subtle background track */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#143d2b"
            strokeOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Smooth animated arc */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={`url(#ilmi-spin-${size})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="45 80"
          />
        </svg>

        {/* Center brand pulse dot */}
        <div className="absolute w-2 h-2 rounded-full bg-[#143d2b]/80 shadow-xs" />
      </div>

      {/* ── Authentic Official Ilmi Brand Logo ────────────── */}
      <div className="flex flex-col items-center gap-2">
        <img
          src="/logo.svg"
          alt="IlmiDunya Pakistan"
          style={{ width: logoWidthPx }}
          className="h-auto object-contain select-none pointer-events-none drop-shadow-xs"
          draggable={false}
        />

        {/* Shimmer progress bar */}
        <div className="w-20 sm:w-24 h-0.5 rounded-full bg-[#143d2b]/10 overflow-hidden relative">
          <div
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-[#143d2b] via-[#d4a359] to-[#ba4c18] rounded-full"
            style={{
              animation: 'ilmi-shimmer 1.4s ease-in-out infinite',
            }}
          />
        </div>

        {text && (
          <p className="text-[11px] font-medium text-[#4a5e55] tracking-wide animate-pulse pt-0.5">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
