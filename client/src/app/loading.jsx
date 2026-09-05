import React from 'react';
import { BookOpen } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 p-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Glow Halo */}
        <div className="absolute w-28 h-28 bg-[#d4a359]/15 rounded-full blur-xl pointer-events-none animate-pulse" />

        {/* Outer Rotating Dual-Tone Spinner Ring */}
        <div className="w-20 h-20 rounded-full border-[3px] border-[#ba4c18]/20 border-t-[#ba4c18] border-r-[#d4a359] animate-spin" />

        {/* Center Brand Emblem Badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] p-2 shadow-md flex items-center justify-center border border-[#e6ded1]">
            <img
              src="/icon.png"
              alt="IlmiDunya Emblem"
              width={48}
              height={48}
              className="w-full h-full object-contain select-none"
            />
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs sm:text-sm font-extrabold text-stone-800 dark:text-stone-200 tracking-tight">
          IlmiDunya Pakistan
        </p>
        <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 tracking-wider animate-pulse">
          Loading platform &amp; classrooms...
        </p>
      </div>
    </div>
  );
}

