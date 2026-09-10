'use client';

import React from 'react';

// Inlined user-provided authentic Ilmi open-book logo (immune to CDN & browser cache)
const ILMI_SPINNER_ICON = 'data:image/png;base64,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';


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
              className="flex items-center justify-center overflow-hidden border border-[#d4a359]/30 shadow-2xs"
              style={{ width: p.tileW, height: p.tileW, borderRadius: p.tileR }}
            >
              <img
                src={ILMI_SPINNER_ICON}
                alt="Ilmi"
                className="w-full h-full object-cover select-none pointer-events-none"
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

        {/* Center: Authentic Ilmi site icon badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center overflow-hidden border border-[#d4a359]/35 shadow-xs"
            style={{
              width: p.tileW,
              height: p.tileW,
              borderRadius: p.tileR,
            }}
          >
            <img
              src={ILMI_SPINNER_ICON}
              alt="Ilmi"
              className="w-full h-full object-cover select-none pointer-events-none drop-shadow-2xs"
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
