'use client';

import React from 'react';

/**
 * SiteAmbientBackdrop
 * Provides a continuous, GPU-accelerated animated gradient mesh, architectural grid,
 * and floating luminous beams behind all pages across the platform.
 */
export default function SiteAmbientBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Global Architectural Vector Grid with Soft Radial Mask */}
      <div className="absolute inset-0 architectural-grid opacity-25" />

      {/* 2. Floating Ambient Gradient Orbs (CSS Keyframe Animated) */}
      {/* Top-Right Warm Gold Halo */}
      <div className="absolute -top-32 right-[-10%] w-[680px] h-[680px] rounded-full bg-[#d4a359]/7 blur-[140px] animate-float-slow pointer-events-none" />

      {/* Center-Left Emerald Glow */}
      <div className="absolute top-[35%] left-[-12%] w-[620px] h-[620px] rounded-full bg-[#10b981]/6 blur-[150px] animate-float-reverse pointer-events-none" />

      {/* Lower-Right Soft Amber/Terracotta Aura */}
      <div className="absolute bottom-[20%] right-[5%] w-[580px] h-[480px] rounded-full bg-[#b85d34]/4 blur-[130px] animate-float-slow pointer-events-none" />

      {/* Bottom Center Sage Glow */}
      <div className="absolute -bottom-40 left-[25%] w-[750px] h-[500px] rounded-full bg-[#059669]/5 blur-[160px] animate-float-reverse pointer-events-none" />

      {/* 3. Subtle Drifting Horizon Beams */}
      <div className="absolute top-[28%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/20 via-[#10b981]/15 to-transparent animate-light-sweep" />
      <div className="absolute top-[68%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/15 via-[#b85d34]/15 to-transparent animate-beam-drift" />

      {/* 4. Peripheral Precision Corner Crosshairs */}
      <div className="hidden lg:block absolute top-24 left-6 text-[#d4a359]/30 font-mono text-[9px] tracking-widest">
        +
      </div>
      <div className="hidden lg:block absolute top-24 right-6 text-[#d4a359]/30 font-mono text-[9px] tracking-widest">
        +
      </div>
      <div className="hidden lg:block absolute bottom-24 left-6 text-[#10b981]/30 font-mono text-[9px] tracking-widest">
        +
      </div>
      <div className="hidden lg:block absolute bottom-24 right-6 text-[#10b981]/30 font-mono text-[9px] tracking-widest">
        +
      </div>
    </div>
  );
}

