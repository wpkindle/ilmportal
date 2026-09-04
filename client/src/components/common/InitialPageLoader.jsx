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

      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#d4a359] via-[#fde047] to-[#d4a359] p-0.5 shadow-2xl shadow-[#d4a359]/30 animate-bounce">
            <div className="w-full h-full bg-[#0c2217] rounded-[22px] flex items-center justify-center">
              <BookOpen className="w-9 h-9 text-[#d4a359]" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#b85d34] text-white flex items-center justify-center shadow-lg animate-spin">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Ilm</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a359] via-[#fde047] to-[#d4a359]">
              Portal
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40 rounded-full">
              Pakistan
            </span>
          </h1>
          <p className="text-xs text-stone-300 tracking-wide">
            Verified Quran & Academic Tutoring Platform
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

