'use client';

import React from 'react';

export default function AnimatedHeroBackground() {
  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none bg-section-hero"
      aria-hidden="true"
    >
      {/* Soft, static, elegant ambient glows for subtle depth without motion */}
      <div className="absolute -top-24 -left-20 w-[550px] h-[550px] bg-[#10b981]/4 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-10 -right-20 w-[600px] h-[600px] bg-[#d4a359]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-[500px] h-[400px] bg-[#b85d34]/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Gentle bottom edge blend into next section */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f4eee2]/50 to-transparent pointer-events-none" />
    </div>
  );
}

