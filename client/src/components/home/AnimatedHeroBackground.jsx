'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedHeroBackground
 * Professional interactive background system featuring:
 * 1. Interactive mouse-following dual-layer radial spotlight
 * 2. Precision architectural grid with radial fade mask
 * 3. Luminous horizontal & diagonal ambient light beams
 * 4. Micro-crosshair coordinate accents and framing bars
 */
export default function AnimatedHeroBackground() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 35 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Listen to mousemove on parent section or window
    const handlePointerMove = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Smoothly clamp within reasonable bounds
        setMousePos({
          x: Math.max(0, Math.min(100, Math.round(x * 10) / 10)),
          y: Math.max(0, Math.min(100, Math.round(y * 10) / 10))
        });
        setIsHovered(true);
      });
    };

    const handlePointerLeave = () => {
      setIsHovered(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none bg-section-hero"
      aria-hidden="true"
      style={{
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
      }}
    >
      {/* 1. Precision Architectural Grid with Elliptical Radial Mask */}
      <div className="absolute inset-0 architectural-grid opacity-75 pointer-events-none" />

      {/* 2. Interactive Mouse Spotlight Glow (Dual Layer: Warm Gold + Soft Emerald) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`}
        style={{
          background: `
            radial-gradient(750px circle at var(--mouse-x, 50%) var(--mouse-y, 35%), rgba(212, 163, 89, 0.13), transparent 65%),
            radial-gradient(480px circle at calc(var(--mouse-x, 50%) - 30px) calc(var(--mouse-y, 35%) + 20px), rgba(16, 185, 129, 0.09), transparent 55%),
            radial-gradient(350px circle at calc(var(--mouse-x, 50%) + 40px) calc(var(--mouse-y, 35%) - 20px), rgba(184, 93, 52, 0.06), transparent 50%)
          `
        }}
      />

      {/* 3. Deep Ambient Backing Glows (Base Atmosphere) */}
      <div className="absolute -top-28 -left-20 w-[620px] h-[620px] bg-[#10b981]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 -right-28 w-[680px] h-[680px] bg-[#d4a359]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-[550px] h-[450px] bg-[#b85d34]/4 rounded-full blur-[130px] pointer-events-none" />

      {/* 4. Subtle Luminous Light Beams / Drifting Horizontal Accent Bars */}
      <div className="absolute top-20 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/30 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 inset-x-12 h-px bg-gradient-to-r from-transparent via-[#10b981]/20 via-[#d4a359]/30 to-transparent pointer-events-none animate-light-sweep" />
      <div className="absolute bottom-28 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b85d34]/20 to-transparent pointer-events-none" />

      {/* 5. Slow Floating Shimmer Ribbon */}
      <div className="absolute top-32 -left-1/4 w-[150%] h-[2px] bg-gradient-to-r from-transparent via-[#d4a359]/35 via-[#10b981]/25 to-transparent pointer-events-none animate-beam-drift blur-[0.5px]" />

      {/* 6. Precision Architectural Coordinate Marks & Crosshairs */}
      <div className="hidden sm:block absolute top-12 left-8 text-[#d4a359]/40 font-mono text-[10px] tracking-widest pointer-events-none select-none">
        +
      </div>
      <div className="hidden sm:block absolute top-12 right-8 text-[#d4a359]/40 font-mono text-[10px] tracking-widest pointer-events-none select-none">
        +
      </div>
      <div className="hidden sm:block absolute bottom-20 left-8 text-[#10b981]/40 font-mono text-[10px] tracking-widest pointer-events-none select-none">
        +
      </div>
      <div className="hidden sm:block absolute bottom-20 right-8 text-[#10b981]/40 font-mono text-[10px] tracking-widest pointer-events-none select-none">
        +
      </div>

      {/* 7. Subtle Islamic Academic Geometric Rosette Outline Watermark */}
      <div className="absolute -top-12 -right-12 w-96 h-96 opacity-[0.035] pointer-events-none select-none text-[#0c2217]">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full animate-spin-slow">
          <circle cx="100" cy="100" r="90" />
          <circle cx="100" cy="100" r="70" />
          <circle cx="100" cy="100" r="50" />
          <rect x="30" y="30" width="140" height="140" transform="rotate(45 100 100)" />
          <rect x="30" y="30" width="140" height="140" />
          <polygon points="100,10 120,70 190,70 135,110 155,180 100,140 45,180 65,110 10,70 80,70" />
        </svg>
      </div>

      {/* 8. Bottom Edge Seamless Gradient Blend */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f3ede0] to-transparent pointer-events-none" />
    </div>
  );
}

