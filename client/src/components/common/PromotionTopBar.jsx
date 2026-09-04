'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function PromotionTopBar() {
  return (
    <aside aria-label="Official Announcement" className="hidden md:block relative z-50 bg-[#07150e] text-[#f5f0e6] text-xs border-b border-[#143d2b] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        
        {/* Left Trust Statement */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#143d2b] text-[#d4a359] font-bold text-[10px] tracking-wide uppercase border border-[#2b6e51]/40">
            <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
            <span>Female-First Safety</span>
          </span>
          <p className="font-medium text-[#ebe3d3] text-xs">
            Designed for Female Safety &amp; Comfort • <strong className="text-white font-bold">Verified Qaris, Alimahs &amp; Academic Tutors</strong> • Camera-Off by Default
          </p>
        </div>

        {/* Right Authentic Value & Link */}
        <div className="flex items-center gap-4 shrink-0 text-xs">
          <Link
            href="/safety"
            className="text-[#d4a359] hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
          >
            <span>Female Privacy Shield</span>
          </Link>
          <span className="text-[#3b5949]">|</span>
          <Link
            href="/tutors"
            className="inline-flex items-center gap-1 text-[#ebe3d3] hover:text-[#d4a359] font-bold text-xs transition-colors group"
          >
            <span>Find Tutors</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </aside>
  );
}

