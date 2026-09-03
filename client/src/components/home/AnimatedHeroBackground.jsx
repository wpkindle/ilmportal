'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Video,
  Award,
  BookMarked,
  Layers,
  Atom,
  Languages
} from 'lucide-react';

export default function AnimatedHeroBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      
      {/* 1. Dynamic Moving Aurora Multi-Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/95 to-teal-950/90 animate-aurora opacity-95" />

      {/* 2. Deep 3D Radial Glow Beams */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.28),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_35%,rgba(20,184,166,0.22),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_65%,rgba(6,182,212,0.18),transparent_55%)]" />

      {/* 3. Embedded HD Educational Looping Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-35' : 'opacity-20'
        }`}
        style={{ filter: 'brightness(0.85) contrast(1.25) saturate(1.35)' }}
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-student-taking-notes-on-a-notebook-42880-large.mp4"
          type="video/mp4"
        />
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-student-doing-homework-in-the-library-41005-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* 4. Glowing Radiant 3D Light Spheres (Ambient Aurora Orbs with Pulsing Glow) */}
      <div className="absolute -top-24 -left-24 w-[550px] h-[550px] bg-emerald-500/25 rounded-full blur-[110px] animate-pulse-glow" />
      <div className="absolute top-1/4 -right-24 w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[130px] animate-float-reverse" />
      <div className="absolute -bottom-24 left-1/4 w-[650px] h-[450px] bg-emerald-400/20 rounded-full blur-[120px] animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-gradient-to-r from-emerald-600/15 via-teal-500/15 to-cyan-500/15 blur-[140px] rounded-full pointer-events-none" />

      {/* 5. 3D Sacred Geometry Rings (Rotating Concentric Circles with Dashes) */}
      <div className="absolute -top-36 right-4 sm:right-16 w-[620px] h-[620px] border border-emerald-500/20 rounded-full animate-spin-slow pointer-events-none flex items-center justify-center">
        <div className="w-[480px] h-[480px] border border-teal-400/25 rounded-full border-dashed" />
        <div className="w-[340px] h-[340px] border border-emerald-300/20 rounded-full" />
        <div className="w-[200px] h-[200px] border border-emerald-400/15 rounded-full border-dotted" />
      </div>

      <div className="absolute -bottom-48 -left-28 w-[580px] h-[580px] border border-emerald-500/20 rounded-full animate-spin-reverse pointer-events-none flex items-center justify-center">
        <div className="w-[420px] h-[420px] border border-teal-300/20 rounded-full border-dashed" />
        <div className="w-[260px] h-[260px] border border-emerald-400/15 rounded-full" />
      </div>

      {/* 6. Floating 3D Educational Glass Pills with Glowing Holographic Borders */}
      {/* Pill 1: Quran / Holy Scripture */}
      <div className="absolute top-20 left-[6%] animate-float-slow hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-emerald-500/40 text-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.3)] backdrop-blur-xl transform-gpu hover:scale-105 transition-transform">
        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-white">Quran &amp; Tajweed</span>
      </div>

      {/* Pill 2: Cambridge & Matric Academic Excellence */}
      <div className="absolute top-24 right-[7%] animate-float-reverse hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-teal-500/40 text-teal-300 shadow-[0_8px_32px_rgba(20,184,166,0.3)] backdrop-blur-xl transform-gpu hover:scale-105 transition-transform">
        <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-xl">
          <GraduationCap className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-white">Cambridge &amp; Matric</span>
      </div>

      {/* Pill 3: In-Platform HD Video */}
      <div className="absolute bottom-32 left-[8%] animate-float-reverse hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/70 border border-blue-500/40 text-blue-300 shadow-[0_8px_32px_rgba(59,130,246,0.25)] backdrop-blur-xl transform-gpu">
        <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl">
          <Video className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-slate-200">1:1 HD Live Class</span>
      </div>

      {/* Pill 4: Sanad Verified Tutor */}
      <div className="absolute bottom-28 right-[9%] animate-float-slow hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/70 border border-emerald-500/40 text-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.3)] backdrop-blur-xl transform-gpu">
        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-slate-200">Sanad Verified Tutors</span>
      </div>

      {/* 7. Subtle 3D Depth Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1.25px,transparent_1.25px)] [background-size:32px_32px] opacity-25" />

      {/* 8. Soft Vignette Edge Blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
    </div>
  );
}
