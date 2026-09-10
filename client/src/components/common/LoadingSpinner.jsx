'use client';

import React from 'react';

/**
 * Professional Brand Loading Spinner for IlmiDunya Pakistan.
 *
 * Features:
 *  - Cornered-box (rounded-corner squircle) frame matching the authentic Ilmi site icon
 *  - Official Ilmi site icon (/icon.svg) centered inside the cornered box
 *  - Silky-smooth, continuous gradient arc animated around the rounded-corner track
 *  - Radial ambient glow backdrop (emerald, warm gold, terracotta)
 *  - Official brand wordmark (/logo.svg) and shimmer progress indicator below
 *  - Fully responsive across mobile, tablet, and desktop screens
 *
 * @param {'sm' | 'md' | 'lg'} size
 * @param {string} className
 * @param {string} text - Optional status text
 */
const LoadingSpinner = ({ size = 'md', className = '', text }) => {
  const presets = {
    sm: {
      box: 42,
      r: 12,
      sw: 3,
      pad: 2,
      side: 38,
      dashLen: 42,
      gap: 90,
      iconW: 24,
      tileW: 32,
      tileR: 9,
      logoW: 88,
    },
    md: {
      box: 76,
      r: 20,
      sw: 4,
      pad: 2.5,
      side: 71,
      dashLen: 80,
      gap: 170,
      iconW: 46,
      tileW: 58,
      tileR: 15,
      logoW: 130,
    },
    lg: {
      box: 100,
      r: 26,
      sw: 5,
      pad: 3,
      side: 94,
      dashLen: 106,
      gap: 226,
      iconW: 62,
      tileW: 76,
      tileR: 20,
      logoW: 160,
    },
  };

  const p = presets[size] ?? presets.md;
  const gradId = `ilmi-box-grad-${size}`;

  /* ── sm: compact cornered-box spinner with Ilmi icon for buttons/cards ── */
  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
        <div className="relative" style={{ width: p.box, height: p.box }}>
          {/* Subtle ambient glow */}
          <div
            className="absolute inset-0 bg-[#d4a359]/20 blur-xs rounded-xl pointer-events-none animate-pulse"
          />

          {/* Squircle track + animated arc */}
          <svg width={p.box} height={p.box} className="absolute inset-0 overflow-visible">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#143d2b" />
                <stop offset="50%" stopColor="#d4a359" />
                <stop offset="100%" stopColor="#ba4c18" />
              </linearGradient>
            </defs>
            {/* Track */}
            <rect
              x={p.pad}
              y={p.pad}
              width={p.side}
              height={p.side}
              rx={p.r}
              ry={p.r}
              fill="none"
              stroke="#143d2b"
              strokeOpacity="0.14"
              strokeWidth={p.sw}
            />
            {/* Animated Arc */}
            <rect
              x={p.pad}
              y={p.pad}
              width={p.side}
              height={p.side}
              rx={p.r}
              ry={p.r}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={p.sw}
              strokeLinecap="round"
              strokeDasharray={`${p.dashLen} ${p.gap}`}
              className="ilmi-arc-sm"
            />
          </svg>

          {/* Centered Ilmi site icon tile */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex items-center justify-center bg-white border border-[#d4a359]/30 shadow-2xs overflow-hidden"
              style={{ width: p.tileW, height: p.tileW, borderRadius: p.tileR }}
            >
              <img
                src="/icon.svg"
                alt="IlmiDunya"
                style={{ width: p.iconW, height: p.iconW }}
                className="object-contain select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── md / lg: cornered-box loader with Ilmi icon + brand wordmark below ── */
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 sm:gap-4 select-none ${className}`}
      role="status"
      aria-label="Loading..."
    >
      {/* ── Cornered-Box Spinner Frame ───────────────────── */}
      <div className="relative" style={{ width: p.box, height: p.box }}>
        {/* Ambient atmospheric brand halo */}
        <div
          className="absolute bg-gradient-to-tr from-[#143d2b]/15 via-[#d4a359]/25 to-[#ba4c18]/20 blur-xl pointer-events-none animate-pulse"
          style={{
            inset: -10,
            borderRadius: p.r + 14,
          }}
        />

        {/* Single SVG: Track + Animated Arc perfectly aligned */}
        <svg width={p.box} height={p.box} className="absolute inset-0 overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#143d2b" />
              <stop offset="50%" stopColor="#d4a359" />
              <stop offset="100%" stopColor="#ba4c18" />
            </linearGradient>
          </defs>

          {/* Track */}
          <rect
            x={p.pad}
            y={p.pad}
            width={p.side}
            height={p.side}
            rx={p.r}
            ry={p.r}
            fill="none"
            stroke="#143d2b"
            strokeOpacity="0.13"
            strokeWidth={p.sw}
          />

          {/* Animated arc via mathematically seamless stroke-dashoffset */}
          <rect
            x={p.pad}
            y={p.pad}
            width={p.side}
            height={p.side}
            rx={p.r}
            ry={p.r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={p.sw}
            strokeLinecap="round"
            strokeDasharray={`${p.dashLen} ${p.gap}`}
            className={`ilmi-arc-${size}`}
          />
        </svg>

        {/* Center: Clean card with authentic Ilmi site icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center bg-white border border-[#d4a359]/35 shadow-xs overflow-hidden"
            style={{
              width: p.tileW,
              height: p.tileW,
              borderRadius: p.tileR,
            }}
          >
            <img
              src="/icon.svg"
              alt="IlmiDunya"
              style={{ width: p.iconW, height: p.iconW }}
              className="object-contain select-none pointer-events-none drop-shadow-2xs"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* ── Official Ilmi Brand Wordmark + Progress Indicator ── */}
      <div className="flex flex-col items-center gap-2">
        <img
          src="/logo.svg"
          alt="IlmiDunya Pakistan"
          style={{ width: p.logoW }}
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
