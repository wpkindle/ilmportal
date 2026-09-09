'use client';

import React from 'react';

/**
 * IlmiDunya brand loader.
 *
 * Design:
 *  - Single SVG with squircle track + arc animated via stroke-dashoffset
 *    (CSS classes defined in globals.css — SSR-safe, no inline <style>)
 *  - Central /icon.svg in a rounded-square tile
 *  - /logo.svg brand wordmark below (md/lg only)
 *
 * @param {'sm' | 'md' | 'lg'} size
 * @param {string} className
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const presets = {
    sm: { box: 44,  r: 14, sw: 3.5, icon: 20, logoW: 88,  dashLen: 34,  gap: 86  },
    md: { box: 72,  r: 22, sw: 4.5, icon: 32, logoW: 120, dashLen: 50,  gap: 125 },
    lg: { box: 96,  r: 28, sw: 5.5, icon: 44, logoW: 156, dashLen: 67,  gap: 168 },
  };
  const p = presets[size] ?? presets.md;

  const pad  = p.sw / 2 + 1;
  const side = p.box - pad * 2;
  const rx   = p.r;

  const gradId      = `ilmi-g-${size}`;
  const iconTileW   = p.icon + 12;
  const iconTileR   = Math.round(rx * 0.55);

  /* ── sm: compact icon-only spinner ───────────────────── */
  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="relative" style={{ width: p.box, height: p.box }}>
          {/* Glow */}
          <div
            className="absolute inset-0 bg-[#d4a359]/20 blur-md pointer-events-none animate-pulse"
            style={{ borderRadius: rx + 4 }}
          />
          {/* Single SVG: track + arc */}
          <svg width={p.box} height={p.box} className="absolute inset-0" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#ba4c18" />
                <stop offset="100%" stopColor="#d4a359" />
              </linearGradient>
            </defs>
            {/* Track */}
            <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
              fill="none" stroke="#ba4c18" strokeOpacity="0.15" strokeWidth={p.sw} />
            {/* Arc */}
            <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={p.sw}
              strokeLinecap="round"
              strokeDasharray={`${p.dashLen} ${p.gap}`}
              className="ilmi-arc-sm"
            />
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{ width: iconTileW, height: iconTileW, borderRadius: iconTileR }}
            >
              <img src="/icon.svg" alt="IlmiDunya" width={p.icon} height={p.icon} className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── md / lg: spinner + brand wordmark ─────────────────── */
  return (
    <div className={`flex flex-col items-center justify-center gap-5 select-none ${className}`}>

      {/* Squircle spinner */}
      <div className="relative" style={{ width: p.box, height: p.box }}>

        {/* Glow halo */}
        <div
          className="absolute bg-[#d4a359]/20 blur-xl pointer-events-none animate-pulse"
          style={{ inset: -10, borderRadius: rx + 14 }}
        />

        {/* Single SVG: track + arc — perfectly aligned */}
        <svg width={p.box} height={p.box} className="absolute inset-0" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#ba4c18" />
              <stop offset="55%"  stopColor="#d4a359" />
              <stop offset="100%" stopColor="#ba4c18" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Track */}
          <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
            fill="none"
            stroke="#ba4c18"
            strokeOpacity="0.13"
            strokeWidth={p.sw}
          />

          {/* Animated arc via CSS class */}
          <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={p.sw}
            strokeLinecap="round"
            strokeDasharray={`${p.dashLen} ${p.gap}`}
            className={`ilmi-arc-${size}`}
          />
        </svg>

        {/* Icon in rounded-square tile */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{
              width: iconTileW,
              height: iconTileW,
              borderRadius: iconTileR,
              background: 'rgba(255,255,255,0.07)',
            }}
          >
            <img
              src="/icon.svg"
              alt="IlmiDunya"
              width={p.icon}
              height={p.icon}
              className="object-contain drop-shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Brand wordmark */}
      <img
        src="/logo.svg"
        alt="IlmiDunya Pakistan"
        style={{ width: p.logoW }}
        className="object-contain opacity-80"
        draggable={false}
      />
    </div>
  );
};

export default LoadingSpinner;
