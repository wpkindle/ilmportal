'use client';

import React, { useRef, useEffect } from 'react';

// Deterministic site-wide stardust particles (24 particles spanning viewport)
const GLOBAL_PARTICLES = [
  { top: '8%', left: '11%', size: 6, color: '#f59e0b', delay: '0s', duration: '9s' },
  { top: '15%', left: '88%', size: 5, color: '#b85d34', delay: '1.5s', duration: '11s' },
  { top: '28%', left: '5%', size: 7, color: '#d4a359', delay: '2.8s', duration: '8.5s' },
  { top: '35%', left: '92%', size: 5.5, color: '#e89569', delay: '0.5s', duration: '10.5s' },
  { top: '48%', left: '14%', size: 6.5, color: '#f59e0b', delay: '3.2s', duration: '9.2s' },
  { top: '55%', left: '82%', size: 7, color: '#d4a359', delay: '1.2s', duration: '12s' },
  { top: '68%', left: '7%', size: 5, color: '#b85d34', delay: '4s', duration: '8s' },
  { top: '75%', left: '94%', size: 6, color: '#f59e0b', delay: '2.1s', duration: '10s' },
  { top: '88%', left: '18%', size: 7.5, color: '#d4a359', delay: '0.8s', duration: '9.5s' },
  { top: '92%', left: '78%', size: 5, color: '#e89569', delay: '3.6s', duration: '11.5s' },
  { top: '22%', left: '48%', size: 5.5, color: '#d4a359', delay: '1.9s', duration: '10.2s' },
  { top: '62%', left: '42%', size: 6, color: '#f59e0b', delay: '2.4s', duration: '8.8s' },
  { top: '4%', left: '65%', size: 6.5, color: '#b85d34', delay: '0.3s', duration: '9.6s' },
  { top: '42%', left: '72%', size: 5, color: '#d4a359', delay: '3.8s', duration: '11.2s' },
  { top: '82%', left: '56%', size: 7, color: '#f59e0b', delay: '1.4s', duration: '8.4s' },
  { top: '19%', left: '28%', size: 5, color: '#e89569', delay: '2.6s', duration: '10.8s' },
  { top: '51%', left: '26%', size: 6.5, color: '#d4a359', delay: '0.9s', duration: '9.1s' },
  { top: '71%', left: '32%', size: 5.5, color: '#b85d34', delay: '3.4s', duration: '12.5s' },
  { top: '95%', left: '36%', size: 7, color: '#f59e0b', delay: '1.7s', duration: '8.2s' },
  { top: '31%', left: '60%', size: 6, color: '#d4a359', delay: '4.2s', duration: '10.4s' },
  { top: '12%', left: '42%', size: 5, color: '#f59e0b', delay: '2.2s', duration: '9s' },
  { top: '64%', left: '64%', size: 6.5, color: '#e89569', delay: '0.7s', duration: '11s' },
  { top: '85%', left: '88%', size: 5.5, color: '#d4a359', delay: '3.1s', duration: '8.7s' },
  { top: '39%', left: '38%', size: 7, color: '#b85d34', delay: '1.6s', duration: '9.9s' }
];

// Educational watermarks & motifs drifting across the entire app
const EDUCATIONAL_GLYPHS = [
  { type: 'book', top: '14%', left: '6%', size: 38, delay: '0s', duration: '13s', color: '#d4a359', label: 'Quran & Ilm' },
  { type: 'cap', top: '24%', left: '91%', size: 40, delay: '2s', duration: '15s', color: '#b85d34', label: 'Academic Excellence' },
  { type: 'qalam', top: '46%', left: '4%', size: 34, delay: '3.5s', duration: '12s', color: '#f59e0b', label: 'Qalam (Pen)' },
  { type: 'award', top: '60%', left: '92%', size: 38, delay: '1.2s', duration: '14s', color: '#d4a359', label: 'Sanad Verification' },
  { type: 'atom', top: '78%', left: '8%', size: 42, delay: '4s', duration: '16s', color: '#b85d34', label: 'Science & Logic' },
  { type: 'book', top: '85%', left: '86%', size: 36, delay: '2.5s', duration: '13s', color: '#f59e0b', label: 'Tajweed' },
  { type: 'cap', top: '36%', left: '48%', size: 32, delay: '1.8s', duration: '14s', color: '#d4a359', label: 'Matric & Cambridge' },
  { type: 'qalam', top: '68%', left: '46%', size: 30, delay: '3s', duration: '11s', color: '#b85d34', label: 'Arabic Calligraphy' }
];

function RenderEducationalIcon({ type, size, color }) {
  if (type === 'book') {
    // Open Quran / Holy Scripture book with spine and curved pages
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        <path d="M6 8h2" strokeWidth="1.5" />
        <path d="M16 8h2" strokeWidth="1.5" />
        <path d="M6 12h2" strokeWidth="1.5" />
        <path d="M16 12h2" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === 'cap') {
    // Graduation Mortarboard / Academic degree cap
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }
  if (type === 'qalam') {
    // Traditional Islamic Calligraphy Reed Pen (Qalam)
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19 7-7 3 3-7 7-3-3z" />
        <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18" />
        <path d="m2 2 7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    );
  }
  if (type === 'award') {
    // Sanad / Certified Degree Rosette Seal with Ribbons
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        <circle cx="12" cy="8" r="2" strokeWidth="1.25" />
      </svg>
    );
  }
  if (type === 'atom') {
    // Science / Physics orbital structure
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" strokeDasharray="2 3" strokeWidth="1" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
      </svg>
    );
  }
  return null;
}

export default function GlobalSiteBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Window-wide cursor spotlight illumination
    const handlePointerMove = (e) => {
      if (!containerRef.current) return;
      const x = Math.max(0, Math.min(100, (e.clientX / window.innerWidth) * 100));
      const y = Math.max(0, Math.min(100, (e.clientY / window.innerHeight) * 100));
      containerRef.current.style.setProperty('--site-mouse-x', `${x.toFixed(1)}%`);
      containerRef.current.style.setProperty('--site-mouse-y', `${y.toFixed(1)}%`);
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
        '--site-mouse-x': '50%',
        '--site-mouse-y': '30%'
      }}
      className="pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* 1. Base Fixed Canvas Layer: Sacred Geometry & Ambient Light (Behind Content) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft atmospheric ambient glow orbs */}
        <div className="absolute -top-24 right-0 w-[550px] h-[550px] bg-[#d4a359]/15 rounded-full blur-[130px] animate-pulse-glow pointer-events-none" />
        <div className="absolute -bottom-24 left-0 w-[520px] h-[520px] bg-[#143d2b]/20 rounded-full blur-[140px] animate-float-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[420px] h-[420px] bg-[#f59e0b]/10 rounded-full blur-[160px] animate-float-reverse pointer-events-none" />

        {/* Sacred Islamic Geometry Wireframe (Top-Right Astrolabe & Rub el Hizb) */}
        <div className="absolute -top-16 -right-16 w-[480px] h-[480px] sm:w-[580px] sm:h-[580px] pointer-events-none opacity-45 sm:opacity-55 animate-spin-slow">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full drop-shadow-[0_0_10px_rgba(212,163,89,0.3)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="200" cy="200" r="195" stroke="#d4a359" strokeWidth="1.75" strokeDasharray="5 7" />
            <circle cx="200" cy="200" r="182" stroke="#143d2b" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="168" stroke="#d4a359" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="200" cy="200" r="142" stroke="#143d2b" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="200" cy="200" r="115" stroke="#d4a359" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="70" stroke="#143d2b" strokeWidth="1" strokeDasharray="3 5" />
            <circle cx="200" cy="200" r="28" stroke="#d4a359" strokeWidth="1.5" />

            {/* Rub el Hizb (8-pointed star) */}
            <rect x="110" y="110" width="180" height="180" stroke="#d4a359" strokeWidth="1.75" />
            <rect x="110" y="110" width="180" height="180" transform="rotate(45 200 200)" stroke="#d4a359" strokeWidth="1.75" />
            <rect x="142" y="142" width="116" height="116" stroke="#143d2b" strokeWidth="1.5" />
            <rect x="142" y="142" width="116" height="116" transform="rotate(45 200 200)" stroke="#143d2b" strokeWidth="1.5" />

            {/* Astrolabe degree rays */}
            <line x1="200" y1="5" x2="200" y2="395" stroke="#d4a359" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="5" y1="200" x2="395" y2="200" stroke="#d4a359" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="62" y1="62" x2="338" y2="338" stroke="#143d2b" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="62" y1="338" x2="338" y2="62" stroke="#143d2b" strokeWidth="1" strokeDasharray="4 8" />
          </svg>
        </div>

        {/* Sacred Islamic Geometry Wireframe (Bottom-Left Counter-Rotating Motif) */}
        <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] pointer-events-none opacity-40 sm:opacity-50 animate-spin-reverse">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full drop-shadow-[0_0_10px_rgba(20,61,43,0.3)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="200" cy="200" r="185" stroke="#143d2b" strokeWidth="1.75" strokeDasharray="6 8" />
            <circle cx="200" cy="200" r="160" stroke="#d4a359" strokeWidth="1.25" />
            <circle cx="200" cy="200" r="125" stroke="#143d2b" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle cx="200" cy="200" r="85" stroke="#d4a359" strokeWidth="1.5" />

            {/* Interlocking geometric octagram */}
            <polygon
              points="200,45 235,165 355,200 235,235 200,355 165,235 45,200 165,165"
              stroke="#d4a359"
              strokeWidth="1.75"
            />
            <polygon
              points="200,45 235,165 355,200 235,235 200,355 165,235 45,200 165,165"
              transform="rotate(22.5 200 200)"
              stroke="#143d2b"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Subtle dot lattice watermark across background */}
        <div className="absolute inset-0 bg-[radial-gradient(#143d2b_0.85px,transparent_0.85px)] [background-size:32px_32px] opacity-15" />
      </div>

      {/* 2. Global Interactive Mouse Spotlight Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(320px circle at var(--site-mouse-x) var(--site-mouse-y), rgba(254, 240, 138, 0.22) 0%, transparent 80%),
            radial-gradient(650px circle at var(--site-mouse-x) var(--site-mouse-y), rgba(212, 163, 89, 0.28) 0%, rgba(20, 61, 43, 0.15) 45%, transparent 75%)
          `
        }}
      />

      {/* 3. Floating Educational Motifs Layer (Visible Across Entire App) */}
      <div className="fixed inset-0 pointer-events-none z-15 overflow-hidden">
        {EDUCATIONAL_GLYPHS.map((g, idx) => (
          <div
            key={`edu-${idx}`}
            className="absolute animate-float-slow pointer-events-none flex items-center justify-center opacity-45 hover:opacity-75 transition-opacity"
            style={{
              top: g.top,
              left: g.left,
              animationDelay: g.delay,
              animationDuration: g.duration,
              filter: `drop-shadow(0 0 10px ${g.color}55)`
            }}
          >
            <div className="p-2 rounded-2xl bg-white/40 border border-[#d4a359]/30 backdrop-blur-xs shadow-xs flex items-center gap-1.5">
              <RenderEducationalIcon type={g.type} size={g.size} color={g.color} />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Foreground Drifting Stardust Particles Layer (Visible on Entire Site) */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {GLOBAL_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="absolute rounded-full animate-particle-drift flex items-center justify-center pointer-events-none"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          >
            {/* Bright spark center */}
            <span className="w-1.5 h-1.5 rounded-full bg-white/95 block shadow-xs" />
          </span>
        ))}
      </div>
    </div>
  );
}
