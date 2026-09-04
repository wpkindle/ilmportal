'use client';

import React, { useRef, useEffect } from 'react';

// Deterministic particle coordinates & timings to ensure 100% SSR-Client hydration parity
const STARDUST_PARTICLES = [
  { top: '12%', left: '14%', size: 3.5, color: '#d4a359', delay: '0s', duration: '9s' },
  { top: '22%', left: '84%', size: 3, color: '#388e6a', delay: '1.4s', duration: '11s' },
  { top: '64%', left: '9%', size: 4.5, color: '#d4a359', delay: '2.5s', duration: '8.5s' },
  { top: '78%', left: '76%', size: 3, color: '#f59e0b', delay: '0.8s', duration: '10s' },
  { top: '34%', left: '46%', size: 2.5, color: '#d4a359', delay: '3.2s', duration: '12s' },
  { top: '16%', left: '62%', size: 4, color: '#388e6a', delay: '2.1s', duration: '7.8s' },
  { top: '84%', left: '34%', size: 3, color: '#d4a359', delay: '4s', duration: '9.2s' },
  { top: '48%', left: '92%', size: 4, color: '#388e6a', delay: '1.2s', duration: '10.5s' },
  { top: '40%', left: '24%', size: 3, color: '#d4a359', delay: '3s', duration: '8.2s' },
  { top: '9%', left: '40%', size: 2.5, color: '#f59e0b', delay: '0.5s', duration: '11.5s' },
  { top: '70%', left: '52%', size: 3.5, color: '#388e6a', delay: '2.2s', duration: '9s' },
  { top: '56%', left: '36%', size: 4, color: '#d4a359', delay: '1.8s', duration: '13s' },
  { top: '86%', left: '88%', size: 2.5, color: '#d4a359', delay: '3.5s', duration: '8.5s' },
  { top: '28%', left: '5%', size: 3.5, color: '#388e6a', delay: '0.3s', duration: '10.2s' },
  { top: '90%', left: '20%', size: 4, color: '#f59e0b', delay: '4.2s', duration: '12.5s' },
  { top: '14%', left: '94%', size: 3, color: '#d4a359', delay: '2.8s', duration: '9.5s' },
  { top: '46%', left: '68%', size: 2, color: '#388e6a', delay: '1.1s', duration: '11s' },
  { top: '60%', left: '82%', size: 3.5, color: '#d4a359', delay: '3.7s', duration: '8s' }
];

export default function AnimatedHeroBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Interactive mouse cursor spotlight tracker
    const handlePointerMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      containerRef.current.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
      containerRef.current.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '38%'
      }}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Deep Editorial Base Tones */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07150e] via-[#0c2217] to-[#07150e]" />

      {/* 2. Dynamic Moving Aurora Multi-Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0c2217] via-[#143d2b]/80 to-[#1e543c]/60 animate-aurora opacity-75 mix-blend-screen" />

      {/* 3. Interactive Mouse Spotlight (illuminates around cursor) */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(650px circle at var(--mouse-x) var(--mouse-y), rgba(212, 163, 89, 0.16), rgba(43, 110, 81, 0.2) 40%, transparent 75%)`
        }}
      />

      {/* 4. Pulsing Atmospheric Ambient Orbs */}
      <div className="absolute -top-24 -left-20 w-[550px] h-[550px] bg-[#1e543c]/25 rounded-full blur-[130px] animate-pulse-glow" />
      <div className="absolute top-1/4 -right-28 w-[600px] h-[600px] bg-[#d4a359]/12 rounded-full blur-[150px] animate-float-reverse" />
      <div className="absolute -bottom-24 left-1/3 w-[620px] h-[480px] bg-[#388e6a]/20 rounded-full blur-[130px] animate-float-slow" />

      {/* 5. Sacred Islamic Geometric Wireframe (Top-Right Astrolabe & Rub el Hizb) */}
      <div className="absolute -top-28 right-0 sm:right-6 lg:right-12 w-[520px] h-[520px] sm:w-[620px] sm:h-[620px] pointer-events-none opacity-20 sm:opacity-25 animate-spin-slow">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Concentric rings */}
          <circle cx="200" cy="200" r="195" stroke="#d4a359" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="200" cy="200" r="182" stroke="#388e6a" strokeWidth="1" />
          <circle cx="200" cy="200" r="170" stroke="#d4a359" strokeWidth="0.75" strokeDasharray="1 5" />
          <circle cx="200" cy="200" r="145" stroke="#388e6a" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="118" stroke="#d4a359" strokeWidth="1" />
          <circle cx="200" cy="200" r="75" stroke="#388e6a" strokeWidth="0.75" strokeDasharray="3 5" />
          <circle cx="200" cy="200" r="30" stroke="#d4a359" strokeWidth="1" />

          {/* 8-pointed star (Rub el Hizb) - Square 1 */}
          <rect
            x="110"
            y="110"
            width="180"
            height="180"
            stroke="#d4a359"
            strokeWidth="1.25"
            strokeOpacity="0.8"
          />
          {/* 8-pointed star (Rub el Hizb) - Square 2 (rotated 45 deg) */}
          <rect
            x="110"
            y="110"
            width="180"
            height="180"
            transform="rotate(45 200 200)"
            stroke="#d4a359"
            strokeWidth="1.25"
            strokeOpacity="0.8"
          />

          {/* Inner 8-pointed star */}
          <rect
            x="142"
            y="142"
            width="116"
            height="116"
            stroke="#388e6a"
            strokeWidth="1"
            strokeOpacity="0.9"
          />
          <rect
            x="142"
            y="142"
            width="116"
            height="116"
            transform="rotate(45 200 200)"
            stroke="#388e6a"
            strokeWidth="1"
            strokeOpacity="0.9"
          />

          {/* Radial axis rays (45-degree intervals) */}
          <line x1="200" y1="5" x2="200" y2="395" stroke="#d4a359" strokeWidth="0.5" strokeDasharray="3 9" />
          <line x1="5" y1="200" x2="395" y2="200" stroke="#d4a359" strokeWidth="0.5" strokeDasharray="3 9" />
          <line x1="62" y1="62" x2="338" y2="338" stroke="#388e6a" strokeWidth="0.5" strokeDasharray="3 9" />
          <line x1="62" y1="338" x2="338" y2="62" stroke="#388e6a" strokeWidth="0.5" strokeDasharray="3 9" />
        </svg>
      </div>

      {/* 6. Sacred Islamic Geometric Wireframe (Bottom-Left Counter-Rotating Motif) */}
      <div className="absolute -bottom-36 -left-24 sm:-left-16 w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] pointer-events-none opacity-15 sm:opacity-20 animate-spin-reverse">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="185" stroke="#388e6a" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="200" cy="200" r="160" stroke="#d4a359" strokeWidth="0.75" />
          <circle cx="200" cy="200" r="125" stroke="#388e6a" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="85" stroke="#d4a359" strokeWidth="1" />

          {/* Interlocking geometric octagram */}
          <polygon
            points="200,45 235,165 355,200 235,235 200,355 165,235 45,200 165,165"
            stroke="#d4a359"
            strokeWidth="1.25"
            strokeOpacity="0.7"
          />
          <polygon
            points="200,45 235,165 355,200 235,235 200,355 165,235 45,200 165,165"
            transform="rotate(22.5 200 200)"
            stroke="#388e6a"
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      {/* 7. Drifting Stardust Glowing Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARDUST_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="absolute rounded-full animate-particle-drift"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </div>

      {/* 8. Arabesque Sacred Geometric Dot Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#2b6e51_0.85px,transparent_0.85px)] [background-size:28px_28px] opacity-25" />

      {/* 9. Soft Vignette Edge Blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-transparent to-[#07150e]/60 pointer-events-none" />
    </div>
  );
}
