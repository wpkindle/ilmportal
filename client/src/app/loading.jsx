import React from 'react';
import { BookOpen } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-[#0c2217] flex items-center justify-center text-[#d4a359] border border-[#d4a359]/40 animate-pulse">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-[#b85d34] border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">
        Loading IlmiDunya Pakistan...
      </p>
    </div>
  );
}

