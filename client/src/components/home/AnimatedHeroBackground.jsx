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
      
      {/* 1. Dynamic Moving Aurora Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/90 to-teal-950/80 animate-aurora opacity-90" />

      {/* 2. Embedded HD Educational Looping Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-40' : 'opacity-25'
        }`}
        style={{ filter: 'brightness(0.85) contrast(1.2) saturate(1.3)' }}
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

      {/* 3. Glowing Radiant Light Spheres (Ambient Aurora Orbs) */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-teal-500/25 rounded-full blur-[120px] animate-float-reverse" />
      <div className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] bg-emerald-400/20 rounded-full blur-[110px] animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-600/15 blur-[130px] rounded-full pointer-events-none" />

      {/* 4. Geometric Sacred & Academic Geometry Ring (Rotating slowly) */}
      <div className="absolute -top-32 right-10 w-[600px] h-[600px] border border-emerald-500/15 rounded-full animate-spin-slow pointer-events-none flex items-center justify-center">
        <div className="w-[450px] h-[450px] border border-teal-400/20 rounded-full border-dashed" />
        <div className="w-[300px] h-[300px] border border-emerald-300/15 rounded-full" />
      </div>

      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] border border-emerald-500/15 rounded-full animate-spin-slow pointer-events-none flex items-center justify-center">
        <div className="w-[350px] h-[350px] border border-emerald-400/20 rounded-full border-dashed" />
      </div>

      {/* 5. Floating 3D Educational Glass Icons in Space */}
      {/* Icon 1: Quran / Holy Scripture Book */}
      <div className="absolute top-16 left-[8%] animate-float-slow hidden md:flex items-center justify-center p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 shadow-xl shadow-emerald-950/80 backdrop-blur-md">
        <BookOpen className="w-6 h-6 text-emerald-400" />
      </div>

      {/* Icon 2: Graduation Cap / Academic Excellence */}
      <div className="absolute top-24 right-[10%] animate-float-reverse hidden md:flex items-center justify-center p-3.5 rounded-2xl bg-teal-950/60 border border-teal-500/30 text-teal-300 shadow-xl shadow-teal-950/80 backdrop-blur-md">
        <GraduationCap className="w-6 h-6 text-teal-300" />
      </div>

      {/* Icon 3: WebRTC Video Classroom */}
      <div className="absolute bottom-28 left-[12%] animate-float-reverse hidden lg:flex items-center justify-center p-3 rounded-2xl bg-blue-950/50 border border-blue-500/30 text-blue-300 shadow-xl backdrop-blur-md">
        <Video className="w-5 h-5 text-blue-400" />
      </div>

      {/* Icon 4: Sanad Trust Verification Badge */}
      <div className="absolute bottom-24 right-[12%] animate-float-slow hidden lg:flex items-center justify-center p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 shadow-xl backdrop-blur-md">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
      </div>

      {/* Icon 5: Arabic & Tajweed Linguistics */}
      <div className="absolute top-1/2 left-[3%] animate-float-slow hidden xl:flex items-center justify-center p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 shadow-xl backdrop-blur-md">
        <Sparkles className="w-5 h-5 text-amber-400" />
      </div>

      {/* Icon 6: Science / STEM Academic Symbol */}
      <div className="absolute top-1/2 right-[4%] animate-float-reverse hidden xl:flex items-center justify-center p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-300 shadow-xl backdrop-blur-md">
        <Atom className="w-5 h-5 text-purple-400" />
      </div>

      {/* 6. Subtle High-Tech Hex / Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-20" />

      {/* 7. Soft Vignette Edge Blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
    </div>
  );
}
