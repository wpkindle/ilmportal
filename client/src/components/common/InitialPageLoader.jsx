'use client';

import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

export default function InitialPageLoader() {
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash loader on initial site load for a smooth entry
    const timer = setTimeout(() => {
      setFading(true);
      const removeTimer = setTimeout(() => {
        setMounted(true);
      }, 500); // 500ms fade out transition
      return () => clearTimeout(removeTimer);
    }, 600); // 600ms initial brand display

    return () => clearTimeout(timer);
  }, []);

  if (mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#05110b] via-[#0c2217] to-[#07150e] text-white transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute w-72 h-72 bg-[#d4a359]/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center space-y-6 select-none">
        {/* Animated Brand Emblem with Squircle Spinner matching logo borders */}
        <div className="relative flex items-center justify-center">
          {/* Ambient Squircle Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#ba4c18]/25 via-[#d4a359]/35 to-[#ba4c18]/25 rounded-[30px] blur-lg opacity-75 pointer-events-none" />

          {/* Squircle Animated Spinner Frame matching logo borders */}
          <div className="relative p-[3px] rounded-[26px] overflow-hidden shadow-2xl shadow-black/80">
            {/* Base track border (subtle gold ring following squircle) */}
            <div className="absolute inset-0 bg-[#d4a359]/25 rounded-[26px]" />

            {/* Rotating colored gradient spinner beam */}
            <div
              className="absolute -inset-[100%] animate-spin"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 180deg, #d4a359 260deg, #ba4c18 330deg, #d4a359 360deg)',
                animationDuration: '2.5s',
              }}
            />

            {/* Inset container matching dark background */}
            <div className="relative z-10 p-1.5 rounded-[23px] bg-[#07150e] flex items-center justify-center">
              {/* Center Web App Logo Card with generous padding */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-[18px] bg-white p-3.5 shadow-md flex items-center justify-center border border-[#d4a359]/30">
                <img
                  src="/icon.png"
                  alt="ilmidunya"
                  width={68}
                  height={68}
                  className="w-full h-full object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Landscape Brand Logo (exact component used in footer) */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <BrandLogo variant="dark" size="md" withBadge={true} className="justify-center" />
          <p className="text-xs text-[#a3b8b0] tracking-wide font-medium">
            1-on-1 Quran &amp; Academic LMS • Direct Dealing
          </p>
        </div>

        {/* Glowing Spinner Bar */}
        <div className="flex flex-col items-center space-y-2.5 pt-1">
          <div className="w-48 h-1.5 bg-black/50 rounded-full overflow-hidden relative border border-white/10 shadow-inner">
            <div className="h-full bg-gradient-to-r from-[#d4a359] via-[#ba4c18] to-[#d4a359] rounded-full animate-indeterminate" />
          </div>
          <p className="text-[10.5px] font-mono text-[#d4a359] font-medium tracking-widest">
            INITIALIZING PLATFORM...
          </p>
        </div>
      </div>
    </div>
  );
}

