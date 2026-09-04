'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Heart,
  Video,
  Lock,
  MessageSquare,
  Award,
  ArrowRight,
  CheckCircle2,
  Camera,
  EyeOff,
  UserCheck,
  FileCheck
} from 'lucide-react';

export default function SafetyShowcase() {
  const [cameraDemoState, setCameraDemoState] = useState(false);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#07150e] text-[#f5f0e6] border-b border-[#143d2b]">
      {/* Ambient Deep Emerald Glows */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[#1e543c]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 right-10 w-[550px] h-[550px] bg-[#d4a359]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Tasteful subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e543c_0.75px,transparent_0.75px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Asymmetric 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column (5 cols): The Female Safety & Family Privacy Manifesto */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#143d2b] border border-[#2b6e51]/60 text-[#d4a359] text-xs font-bold shadow-sm">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Designed Especially for Females &amp; Families</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight leading-[1.15]">
              Built so females feel 100% comfortable &amp; protected.
            </h2>

            <p className="text-xs sm:text-sm text-[#d1dbd6] leading-relaxed font-normal">
              In Pakistan, female learners, mothers, and daughters deserve complete peace of mind. IlmPortal was built from the ground up so females never have any concern regarding their privacy — with camera-off learning, verified female Alimahs, and zero exposure of personal phone numbers.
            </p>

            {/* Stat Callout Strip */}
            <div className="p-5 rounded-2xl bg-[#0c2217] border border-[#143d2b] space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-2xl text-[#d4a359]">100%</span>
                <p className="text-xs text-[#d1dbd6] font-medium">
                  CNIC &amp; Sanad degrees manually vetted before any tutor can teach.
                </p>
              </div>
              <div className="w-full h-px bg-[#143d2b]" />
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-2xl text-emerald-400">Zero</span>
                <p className="text-xs text-[#d1dbd6] font-medium">
                  Personal phone number exchange needed; all messaging is safe in-app.
                </p>
              </div>
            </div>

            <div>
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#d4a359] hover:text-white transition-colors group"
              >
                <span>Read our full Safety &amp; Trust Guidelines</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column (7 cols): Varied Concrete Feature Demonstrations */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Feature 1: Interactive Camera-Off Guarantee Card */}
            <div className="p-6 rounded-3xl bg-[#0c2217] border-2 border-[#2b6e51]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm sm:text-base">
                      Camera-Off by Default Guarantee
                    </h3>
                    <p className="text-[11px] text-[#a3b8b0]">
                      Standard for every class across all cities in Pakistan
                    </p>
                  </div>
                </div>

                {/* Interactive Demo Toggle */}
                <button
                  type="button"
                  onClick={() => setCameraDemoState(!cameraDemoState)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    cameraDemoState
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cameraDemoState ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                  <span>{cameraDemoState ? 'Camera: ON' : 'Camera: OFF (Locked)'}</span>
                </button>
              </div>

              <p className="text-xs text-[#d1dbd6] leading-relaxed">
                When your child joins a video lesson, their video feed is <strong className="text-white">permanently off by default</strong>. Neither the tutor nor the platform can turn it on. Your family has 100% control to keep video off throughout the entire course.
              </p>

              <div className="flex items-center gap-4 text-[11px] text-[#a3b8b0] pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Crystal Clear Audio</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Quran &amp; Slate</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Parent May Observe Live</span>
                </span>
              </div>
            </div>

            {/* 2-Column Split: Female Tutors & Sanad Auditing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Feature 2: Female Alimahs */}
              <div className="p-5 rounded-2xl bg-[#0c2217] border border-[#143d2b] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-500/30 w-fit">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      Girls &amp; Kids
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Female Tutors &amp; Alimahs</h4>
                  <p className="text-xs text-[#a3b8b0] leading-relaxed">
                    Qualified female Quran teachers and university graduates specifically designated for daughters and young boys.
                  </p>
                </div>
                <Link
                  href="/tutors?gender=female"
                  className="text-xs font-bold text-[#d4a359] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>Browse Female Tutors</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Feature 3: Sanad & ID Verification */}
              <div className="p-5 rounded-2xl bg-[#0c2217] border border-[#143d2b] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-500/30 w-fit">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      ID &amp; Sanad
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Manual Document Verification</h4>
                  <p className="text-xs text-[#a3b8b0] leading-relaxed">
                    We review CNIC cards, Wafaq-ul-Madaris Sanad degrees, and HEC-recognized certificates before approval.
                  </p>
                </div>
                <Link
                  href="/safety"
                  className="text-xs font-bold text-[#d4a359] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>Verification Process</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Safety Contact Strip */}
        <div className="p-5 rounded-2xl bg-[#0c2217] border border-[#2b6e51]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#143d2b] rounded-xl text-[#d4a359] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">
                Official Administration Support &amp; Incident Monitoring
              </h4>
              <p className="text-xs text-[#a3b8b0]">
                Immediate review for any family inquiry or feedback: <a href="mailto:contact@ilmportal.org" className="text-[#d4a359] underline font-bold">contact@ilmportal.org</a>
              </p>
            </div>
          </div>

          <Link
            href="/safety"
            className="px-4 py-2 bg-[#143d2b] hover:bg-[#1e543c] border border-[#2b6e51] text-white rounded-xl text-xs font-bold transition-all shrink-0"
          >
            Safety FAQ &amp; Rules
          </Link>
        </div>

      </div>
    </section>
  );
}

