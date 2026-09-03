'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const CYCLE_MS = 47 * 24 * 60 * 60 * 1000; // Exactly 47 days in milliseconds

export default function PromotionTopBar() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 47,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    setMounted(true);

    // Anchor time: start of September 1, 2026 UTC
    const ANCHOR_TIME = new Date('2026-09-01T00:00:00Z').getTime();

    const calculateRemaining = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - ANCHOR_TIME);
      // Cyclical modulo: whenever 47 days pass, it smoothly repeats
      const cycleProgress = elapsed % CYCLE_MS;
      const remainingMs = CYCLE_MS - cycleProgress;

      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUnit = (n) => String(n).padStart(2, '0');

  return (
    <aside aria-label="Special Promotion" className="hidden md:block relative z-50 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white text-xs border-b border-emerald-500/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 sm:py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2.5 text-center sm:text-left">
        
        {/* Notice Message */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>Limited Time Offer</span>
          </span>
          <p className="font-semibold text-slate-200 text-[10.5px] sm:text-xs">
            Student & Tutor Registration is <strong className="text-emerald-400 font-black underline decoration-amber-400 decoration-2 underline-offset-2">100% FREE</strong> across all Pakistan cities!
          </p>
        </div>

        {/* Dynamic 47-Day Repeating Countdown Clock & CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-black/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg shadow-inner backdrop-blur-sm">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
            <span className="text-[9px] uppercase font-bold text-slate-400 hidden md:inline">
              Free Period Ends:
            </span>

            {mounted ? (
              <div className="flex items-center gap-1 font-mono font-black text-white text-[11px]">
                <span className="bg-emerald-900/80 text-emerald-200 px-1 py-0.5 rounded border border-emerald-500/30">
                  {timeLeft.days}d
                </span>
                <span className="text-emerald-400 font-bold">:</span>
                <span className="bg-emerald-900/80 text-emerald-200 px-1 py-0.5 rounded border border-emerald-500/30">
                  {formatUnit(timeLeft.hours)}h
                </span>
                <span className="text-emerald-400 font-bold">:</span>
                <span className="bg-emerald-900/80 text-emerald-200 px-1 py-0.5 rounded border border-emerald-500/30">
                  {formatUnit(timeLeft.minutes)}m
                </span>
                <span className="text-emerald-400 font-bold">:</span>
                <span className="bg-emerald-900/80 text-amber-300 px-1 py-0.5 rounded border border-amber-500/30">
                  {formatUnit(timeLeft.seconds)}s
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 font-mono font-black text-white text-[11px]">
                <span className="bg-emerald-900/80 text-emerald-200 px-1 py-0.5 rounded">47d</span>
                <span>:</span>
                <span className="bg-emerald-900/80 text-emerald-200 px-1 py-0.5 rounded">00h</span>
                <span>:</span>
                <span className="bg-emerald-900/80 text-emerald-200 px-1 py-0.5 rounded">00m</span>
                <span>:</span>
                <span className="bg-emerald-900/80 text-emerald-200 px-1 py-0.5 rounded">00s</span>
              </div>
            )}
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-[10px] sm:text-[11px] rounded-lg shadow-xs transition-all active:scale-95 shrink-0"
          >
            <span>Claim Free</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>

      </div>
    </aside>
  );
}

