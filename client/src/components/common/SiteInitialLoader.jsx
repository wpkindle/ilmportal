'use client';

import React, { useState, useEffect } from 'react';

/**
 * SiteInitialLoader
 * 
 * Smooth, branded opening preloader:
 * 1. Shows a sleek gold & forest green emblem with subtle pulsing ring on initial visit.
 * 2. Unlocks smoothly once the page is interactive, preventing layout-shift jarring.
 * 3. Gracefully auto-dismisses so Core Web Vitals remain fast.
 */
export default function SiteInitialLoader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Dismiss preloader smoothly once page is ready
    const timer = setTimeout(() => {
      setMounted(true);
      // Allow fade-out transition to finish before removing from DOM
      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, 450);
      return () => clearTimeout(removeTimer);
    }, 280);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      id="ilmi-site-loader"
      aria-hidden={mounted ? 'true' : 'false'}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07150e] transition-opacity duration-400 ease-out select-none pointer-events-none ${
        mounted ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center text-center px-4">
        {/* Glowing Ambient Halo */}
        <div className="absolute w-36 h-36 rounded-full bg-[#d4a359]/15 blur-2xl animate-pulse" />

        {/* Central Brand Spinner Emblem */}
        <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
          {/* Outer Rotating Emerald & Gold Orbit Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#d4a359] border-r-[#10b981] animate-spin" style={{ animationDuration: '1.2s' }} />
          
          {/* Inner Counter-Rotating Golden Ring */}
          <div className="absolute inset-2 rounded-full border border-transparent border-b-[#d4a359]/80 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />

          {/* Center Brand Monogram */}
          <div className="w-12 h-12 rounded-2xl bg-[#0c2217] border border-[#d4a359]/40 shadow-inner flex items-center justify-center">
            <span className="font-serif font-black text-lg text-[#d4a359] tracking-wider">
              علم
            </span>
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="font-serif font-black text-xl sm:text-2xl text-[#faf8f5] tracking-tight mb-1">
          ilmidunya
        </h1>
        <p className="text-[11px] sm:text-xs text-[#d4a359] font-medium tracking-wide uppercase">
          Pakistan&apos;s Verified Tutor Platform
        </p>

        {/* Animated Loading Bar */}
        <div className="w-28 h-0.5 bg-white/10 rounded-full mt-4 overflow-hidden relative">
          <div className="absolute inset-y-0 bg-gradient-to-r from-transparent via-[#d4a359] to-transparent w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

