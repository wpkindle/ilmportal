'use client';

import React, { useRef, useEffect } from 'react';
import { BookOpen, GraduationCap, Award } from 'lucide-react';

// Deterministic particle coordinates & timings with larger sizes (5px to 9px) and high-visibility colors
const STARDUST_PARTICLES = [
  { top: '10%', left: '12%', size: 7, color: '#fbbf24', delay: '0s', duration: '8s' },
  { top: '18%', left: '86%', size: 6, color: '#34d399', delay: '1.2s', duration: '10s' },
  { top: '62%', left: '8%', size: 8, color: '#f59e0b', delay: '2.5s', duration: '7.5s' },
  { top: '76%', left: '78%', size: 6, color: '#fbbf24', delay: '0.8s', duration: '9s' },
  { top: '32%', left: '44%', size: 5, color: '#d4a359', delay: '3s', duration: '11s' },
  { top: '14%', left: '60%', size: 7, color: '#10b981', delay: '1.8s', duration: '7s' },
  { top: '82%', left: '32%', size: 6, color: '#f59e0b', delay: '3.6s', duration: '8.5s' },
  { top: '46%', left: '92%', size: 8, color: '#34d399', delay: '1s', duration: '9.5s' },
  { top: '38%', left: '22%', size: 6, color: '#fbbf24', delay: '2.7s', duration: '7.8s' },
  { top: '8%', left: '38%', size: 5, color: '#f59e0b', delay: '0.4s', duration: '10.5s' },
  { top: '68%', left: '50%', size: 7, color: '#10b981', delay: '2s', duration: '8.2s' },
  { top: '54%', left: '34%', size: 8, color: '#d4a359', delay: '1.5s', duration: '11.5s' },
  { top: '84%', left: '86%', size: 6, color: '#fbbf24', delay: '3.2s', duration: '7.6s' },
  { top: '26%', left: '4%', size: 7, color: '#34d399', delay: '0.2s', duration: '9.2s' },
  { top: '88%', left: '18%', size: 9, color: '#f59e0b', delay: '3.8s', duration: '11s' },
  { top: '12%', left: '94%', size: 6, color: '#fbbf24', delay: '2.5s', duration: '8.6s' },
  { top: '44%', left: '66%', size: 5, color: '#10b981', delay: '1s', duration: '10s' },
  { top: '58%', left: '80%', size: 7, color: '#d4a359', delay: '3.3s', duration: '7.2s' },
  { top: '24%', left: '30%', size: 6, color: '#fbbf24', delay: '1.7s', duration: '9.8s' },
  { top: '72%', left: '66%', size: 8, color: '#34d399', delay: '2.9s', duration: '8.4s' },
  { top: '5%', left: '74%', size: 6, color: '#f59e0b', delay: '0.9s', duration: '10.2s' },
  { top: '92%', left: '52%', size: 7, color: '#fbbf24', delay: '4.1s', duration: '7.9s' }
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#05110b] via-[#0c2217] to-[#07150e]" />

      {/* 2. Dynamic Moving Aurora Multi-Gradient Layer (High Visibility) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0c2217] via-[#1a4e36] to-[#143d2b] animate-aurora opacity-90 mix-blend-screen" />

      {/* 3. Luminous Interactive Mouse Spotlight (Bright glowing lantern effect) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `
            radial-gradient(340px circle at var(--mouse-x) var(--mouse-y), rgba(254, 240, 138, 0.32) 0%, transparent 80%),
            radial-gradient(750px circle at var(--mouse-x) var(--mouse-y), rgba(212, 163, 89, 0.45) 0%, rgba(43, 110, 81, 0.4) 42%, transparent 75%)
          `
        }}
      />

      {/* 4. Pulsing Atmospheric Ambient Orbs */}
      <div className="absolute -top-24 -left-20 w-[600px] h-[600px] bg-[#1e543c]/40 rounded-full blur-[110px] animate-pulse-glow" />
      <div className="absolute top-1/4 -right-28 w-[650px] h-[650px] bg-[#d4a359]/25 rounded-full blur-[120px] animate-float-reverse" />
      <div className="absolute -bottom-24 left-1/3 w-[680px] h-[520px] bg-[#388e6a]/30 rounded-full blur-[110px] animate-float-slow" />

      {/* 5. Sacred Islamic Geometric Wireframe (Top-Right Astrolabe & Rub el Hizb - High Visibility) */}
      <div className="absolute -top-24 right-0 sm:right-4 lg:right-8 w-[580px] h-[580px] sm:w-[700px] sm:h-[700px] pointer-events-none opacity-75 sm:opacity-85 animate-spin-slow">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(212,163,89,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="heroGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#d4a359" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="heroEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Concentric orbital rings with astrolabe markings */}
          <circle cx="200" cy="200" r="195" stroke="url(#heroGoldGrad)" strokeWidth="1.75" strokeDasharray="5 7" />
          <circle cx="200" cy="200" r="182" stroke="url(#heroEmeraldGrad)" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="170" stroke="url(#heroGoldGrad)" strokeWidth="1" strokeDasharray="2 4" />
          <circle cx="200" cy="200" r="145" stroke="url(#heroEmeraldGrad)" strokeWidth="1.5" strokeDasharray="7 7" />
          <circle cx="200" cy="200" r="118" stroke="url(#heroGoldGrad)" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="75" stroke="url(#heroEmeraldGrad)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="30" stroke="url(#heroGoldGrad)" strokeWidth="1.5" />

          {/* 8-pointed star (Rub el Hizb) - Square 1 */}
          <rect
            x="110"
            y="110"
            width="180"
            height="180"
            stroke="url(#heroGoldGrad)"
            strokeWidth="1.75"
          />
          {/* 8-pointed star (Rub el Hizb) - Square 2 (rotated 45 deg) */}
          <rect
            x="110"
            y="110"
            width="180"
            height="180"
            transform="rotate(45 200 200)"
            stroke="url(#heroGoldGrad)"
            strokeWidth="1.75"
          />

          {/* Inner 8-pointed star */}
          <rect
            x="142"
            y="142"
            width="116"
            height="116"
            stroke="url(#heroEmeraldGrad)"
            strokeWidth="1.5"
          />
          <rect
            x="142"
            y="142"
            width="116"
            height="116"
            transform="rotate(45 200 200)"
            stroke="url(#heroEmeraldGrad)"
            strokeWidth="1.5"
          />

          {/* Radial axis rays (45-degree intervals) */}
          <line x1="200" y1="5" x2="200" y2="395" stroke="url(#heroGoldGrad)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="5" y1="200" x2="395" y2="200" stroke="url(#heroGoldGrad)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="62" y1="62" x2="338" y2="338" stroke="url(#heroEmeraldGrad)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="62" y1="338" x2="338" y2="62" stroke="url(#heroEmeraldGrad)" strokeWidth="1" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* 6. Sacred Islamic Geometric Wireframe (Bottom-Left Counter-Rotating Motif - High Visibility) */}
      <div className="absolute -bottom-36 -left-24 sm:-left-16 w-[480px] h-[480px] sm:w-[580px] sm:h-[580px] pointer-events-none opacity-65 sm:opacity-75 animate-spin-reverse">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="185" stroke="#34d399" strokeWidth="1.75" strokeDasharray="6 8" />
          <circle cx="200" cy="200" r="160" stroke="#fde047" strokeWidth="1.25" />
          <circle cx="200" cy="200" r="125" stroke="#34d399" strokeWidth="1.5" strokeDasharray="5 6" />
          <circle cx="200" cy="200" r="85" stroke="#fde047" strokeWidth="1.5" />

          {/* Interlocking geometric octagram */}
          <polygon
            points="200,45 235,165 355,200 235,235 200,355 165,235 45,200 165,165"
            stroke="#fbbf24"
            strokeWidth="1.75"
          />
          <polygon
            points="200,45 235,165 355,200 235,235 200,355 165,235 45,200 165,165"
            transform="rotate(22.5 200 200)"
            stroke="#34d399"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* 7. Vivid Drifting Stardust Glowing Particles with White Centers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARDUST_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="absolute rounded-full animate-particle-drift flex items-center justify-center"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}, 0 0 30px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          >
            {/* Bright spark core */}
            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-90 block" />
          </span>
        ))}
      </div>

      {/* 8. Floating Educational Knowledge Motifs */}
      <div className="absolute top-24 left-[3%] animate-float-slow hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0c2217]/85 border border-[#d4a359]/40 text-[#faf8f5] shadow-[0_8px_30px_rgba(212,163,89,0.2)] backdrop-blur-md">
        <div className="p-1.5 bg-[#d4a359]/20 text-[#d4a359] rounded-xl">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="text-left">
          <span className="text-[11px] font-bold block text-white">Quran &amp; Tajweed</span>
          <span className="text-[9px] text-[#d4a359] block font-mono">Wafaq Alimah &amp; Qari</span>
        </div>
      </div>

      <div className="absolute top-20 right-[4%] animate-float-reverse hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0c2217]/85 border border-[#34d399]/40 text-[#faf8f5] shadow-[0_8px_30px_rgba(52,211,153,0.2)] backdrop-blur-md">
        <div className="p-1.5 bg-[#10b981]/20 text-[#34d399] rounded-xl">
          <GraduationCap className="w-4 h-4" />
        </div>
        <div className="text-left">
          <span className="text-[11px] font-bold block text-white">Cambridge &amp; Matric</span>
          <span className="text-[9px] text-[#34d399] block font-mono">Pre-Medical &amp; Pre-Eng</span>
        </div>
      </div>

      <div className="absolute bottom-28 left-[5%] animate-float-reverse hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#0c2217]/85 border border-[#d4a359]/35 text-[#d4a359] shadow-lg backdrop-blur-md">
        <Award className="w-3.5 h-3.5 text-[#d4a359]" />
        <span className="text-[10px] font-bold text-stone-200">Verified Sanad Degrees</span>
      </div>

      {/* 9. Arabesque Sacred Geometric Dot Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />

      {/* 10. Soft Vignette Edge Blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-transparent to-[#07150e]/50 pointer-events-none" />
    </div>
  );
}
