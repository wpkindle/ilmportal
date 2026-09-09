'use client';

import React from 'react';

/**
 * IlmiDunya brand loader.
 *
 * Design:
 *  - Rounded-square (squircle) SVG spinner track with animated gradient arc
 *  - Central /icon.svg emblem in a rounded-square container
 *  - /logo.svg brand wordmark displayed below — no loading text
 *
 * @param {'sm' | 'md' | 'lg'} size
 * @param {string}  className  - Optional extra classes on wrapper
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  /* ── Size presets ─────────────────────────────────── */
  const presets = {
    sm: { box: 40, r: 14, sw: 3, icon: 18, logoW: 80 },
    md: { box: 64, r: 22, sw: 4, icon: 28, logoW: 112 },
    lg: { box: 90, r: 30, sw: 5, icon: 40, logoW: 152 },
  };
  const p = presets[size] ?? presets.md;

  /*
   * Squircle path via SVG rect with rx — the spinner arc runs around
   * a rounded-corner square so both the track and the moving stroke cap
   * have rounded corners.
   */
  const pad  = p.sw / 2 + 1;            // inset so stroke isn't clipped
  const side = p.box - pad * 2;         // rect side length inside svg
  const rx   = p.r;                     // corner radius

  // Approximate perimeter: 4*(side-2rx) + 2π*rx
  const perimeter = 4 * (side - 2 * rx) + 2 * Math.PI * rx;
  const dashLen   = perimeter * 0.28;   // ~28 % visible arc
  const gap       = perimeter - dashLen;

  /* sm: tiny inline variant — icon only, no logo */
  if (size === 'sm') {
    return (
      <div className={`inline-flex flex-col items-center justify-center gap-1.5 ${className}`}>
        <div className="relative" style={{ width: p.box, height: p.box }}>
          {/* Glow */}
          <div
            className="absolute inset-0 bg-[#d4a359]/20 blur-md pointer-events-none animate-pulse"
            style={{ borderRadius: rx + 4 }}
          />
          {/* Static track */}
          <svg width={p.box} height={p.box} className="absolute inset-0">
            <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
              fill="none" stroke="#ba4c18" strokeOpacity="0.15" strokeWidth={p.sw} />
          </svg>
          {/* Rotating arc */}
          <svg width={p.box} height={p.box} className="absolute inset-0 animate-spin"
            style={{ animationDuration: '1.2s' }}>
            <defs>
              <linearGradient id="ilmi-grad-sm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ba4c18" />
                <stop offset="100%" stopColor="#d4a359" />
              </linearGradient>
            </defs>
            <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
              fill="none" stroke="url(#ilmi-grad-sm)" strokeWidth={p.sw}
              strokeLinecap="round" strokeDasharray={`${dashLen} ${gap}`} />
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center overflow-hidden"
              style={{ width: p.icon + 6, height: p.icon + 6, borderRadius: Math.round(rx * 0.55) }}>
              <img src="/icon.svg" alt="IlmiDunya" width={p.icon} height={p.icon} className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* md / lg: full variant — spinner + brand wordmark below */
  return (
    <div className={`flex flex-col items-center justify-center gap-5 select-none ${className}`}>

      {/* ── Squircle spinner ─────────────────────────── */}
      <div className="relative" style={{ width: p.box, height: p.box }}>

        {/* Ambient glow halo */}
        <div
          className="absolute bg-[#d4a359]/20 blur-xl pointer-events-none animate-pulse"
          style={{
            inset: -8,
            borderRadius: rx + 12,
          }}
        />

        {/* Static track */}
        <svg width={p.box} height={p.box} className="absolute inset-0">
          <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
            fill="none" stroke="#ba4c18" strokeOpacity="0.15" strokeWidth={p.sw} />
        </svg>

        {/* Rotating gradient arc */}
        <svg
          width={p.box} height={p.box}
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '1.3s' }}
        >
          <defs>
            <linearGradient id={`ilmi-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#ba4c18" />
              <stop offset="60%"  stopColor="#d4a359" />
              <stop offset="100%" stopColor="#ba4c18" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect x={pad} y={pad} width={side} height={side} rx={rx} ry={rx}
            fill="none"
            stroke={`url(#ilmi-grad-${size})`}
            strokeWidth={p.sw}
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${gap}`}
          />
        </svg>

        {/* Center icon in rounded-square tile */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center overflow-hidden shadow-sm"
            style={{
              width:  p.icon + 10,
              height: p.icon + 10,
              borderRadius: Math.round(rx * 0.55),
              background: 'rgba(255,255,255,0.06)',
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

      {/* ── Brand wordmark ───────────────────────────── */}
      <img
        src="/logo.svg"
        alt="IlmiDunya Pakistan"
        style={{ width: p.logoW }}
        className="object-contain opacity-75"
        draggable={false}
      />
    </div>
  );
};

export default LoadingSpinner;
