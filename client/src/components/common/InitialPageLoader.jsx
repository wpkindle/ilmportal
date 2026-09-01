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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/40 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <BookOpen className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg animate-spin">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Ilm</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Portal
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-full">
              Pakistan
            </span>
          </h1>
          <p className="text-xs text-slate-400 tracking-wide">
            Verified Quran & Academic Tutoring Platform
          </p>
        </div>

        {/* Glowing Spinner Bar */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="w-44 h-1.5 bg-slate-800/80 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full animate-indeterminate" />
          </div>
          <p className="text-[11px] font-mono text-emerald-400/90 font-medium tracking-wider">
            INITIALIZING PLATFORM...
          </p>
        </div>
      </div>
    </div>
  );
}

