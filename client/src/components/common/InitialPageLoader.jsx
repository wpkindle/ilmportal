'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

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
        {/* Animated Brand Emblem with Rotating Spinner Ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer rotating glowing ring */}
          <div className="w-28 h-28 rounded-full border-[3px] border-[#d4a359]/20 border-t-[#ba4c18] border-r-[#d4a359] animate-spin" />

          {/* Center Brand Emblem Badge Card */}
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <div className="w-20 h-20 rounded-2xl bg-white/95 p-1.5 shadow-2xl shadow-black/50 flex items-center justify-center border border-[#d4a359]/30">
              <img
                src="/icon.png"
                alt="IlmiDunya Pakistan"
                width={72}
                height={72}
                className="w-full h-full object-contain select-none"
              />
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>ilmi</span>
            <span className="text-[#ba4c18]">Dunya</span>
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 rounded-full">
              Pakistan
            </span>
          </h1>
          <p className="text-xs text-stone-300 tracking-wide">
            1-on-1 Quran &amp; Academic LMS • Direct Dealing
          </p>
        </div>

        {/* Glowing Spinner Bar */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="w-44 h-1.5 bg-black/40 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359] rounded-full animate-indeterminate" />
          </div>
          <p className="text-[11px] font-mono text-[#d4a359] font-medium tracking-wider">
            INITIALIZING PLATFORM...
          </p>
        </div>
      </div>
    </div>
  );
}

