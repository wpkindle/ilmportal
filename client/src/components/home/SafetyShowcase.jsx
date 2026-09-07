'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
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
    <section className="py-16 sm:py-24 relative overflow-hidden bg-section-safety border-b border-[#ebe3d3]">
      {/* Precision architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid opacity-50 pointer-events-none" />

      {/* Subtle top accent bar */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/40 to-transparent pointer-events-none" />

      {/* Animated floating ambient glows */}
      <div className="absolute top-1/4 -left-32 w-[550px] h-[550px] bg-[#10b981]/7 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-24 right-10 w-[580px] h-[580px] bg-[#d4a359]/9 rounded-full blur-[150px] pointer-events-none animate-float-reverse" />

      {/* Drifting horizontal light sweep */}
      <div className="absolute top-1/2 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#10b981]/25 via-[#d4a359]/35 to-transparent pointer-events-none animate-light-sweep" />

      {/* Precision architectural coordinate crosshairs */}
      <div className="hidden sm:block absolute top-6 left-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute top-6 right-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 left-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 right-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Asymmetric 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column (5 cols): The Female Safety & Family Privacy Manifesto */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d4a359]/50 text-[#b85d34] text-xs font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Designed Especially for Females &amp; Families</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#0c2217] tracking-tight leading-[1.15]">
              Built so females feel 100% comfortable &amp; protected.
            </h2>

            <p className="text-xs sm:text-sm text-[#4a5e55] leading-relaxed font-normal">
              In Pakistan, female learners, mothers, and daughters deserve complete peace of mind. IlmiDunya was built from the ground up so females never have any concern regarding their privacy — with camera-off learning, verified female Alimahs, and zero exposure of personal phone numbers.
            </p>

            {/* Stat Callout Strip */}
            <div className="p-5 rounded-2xl bg-white border border-[#ebe3d3] shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-2xl text-[#b85d34]">100%</span>
                <p className="text-xs text-[#4a5e55] font-medium">
                  CNIC &amp; Sanad degrees manually vetted before any tutor can teach.
                </p>
              </div>
              <div className="w-full h-px bg-stone-200" />
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-2xl text-[#b85d34]">Zero</span>
                <p className="text-xs text-[#4a5e55] font-medium">
                  Personal phone number exchange needed; all messaging is safe in-app.
                </p>
              </div>
            </div>

            <div>
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#b85d34] hover:text-[#0c2217] transition-colors group"
              >
                <span>Read our full Safety &amp; Trust Guidelines</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column (7 cols): Varied Concrete Feature Demonstrations */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Feature 1: Interactive Camera-Off Guarantee Card */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#d4a359]/40 shadow-md space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#f5f0e6] border border-[#d4a359]/40 text-[#b85d34]">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#0c2217] text-sm sm:text-base">
                      Camera-Off by Default Guarantee
                    </h3>
                    <p className="text-[11px] text-[#4a5e55]">
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
                      ? 'bg-rose-50 text-rose-700 border border-rose-300'
                      : 'bg-[#f5f0e6] text-[#b85d34] border border-[#d4a359]/50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cameraDemoState ? 'bg-rose-500' : 'bg-[#d4a359]'}`} />
                  <span>{cameraDemoState ? 'Camera: ON' : 'Camera: OFF (Locked)'}</span>
                </button>
              </div>

              <p className="text-xs text-[#4a5e55] leading-relaxed">
                When your child joins a video lesson, their video feed is <strong className="text-[#0c2217]">permanently off by default</strong>. Neither the tutor nor the platform can turn it on. Your family has 100% control to keep video off throughout the entire course.
              </p>

              <div className="flex items-center gap-4 text-[11px] text-[#4a5e55] pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Crystal Clear Audio</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Interactive Quran &amp; Slate</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Parent May Observe Live</span>
                </span>
              </div>
            </div>

            {/* 2-Column Split: Female Tutors & Sanad Auditing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Feature 2: Female Alimahs */}
              <div className="p-5 rounded-2xl bg-white border border-[#ebe3d3] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 w-fit">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                      Girls &amp; Kids
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0c2217]">Female Tutors &amp; Alimahs</h4>
                  <p className="text-xs text-[#4a5e55] leading-relaxed">
                    Qualified female Quran teachers and university graduates specifically designated for daughters and young boys.
                  </p>
                </div>
                <Link
                  href="/tutors?gender=female"
                  className="text-xs font-bold text-[#b85d34] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>Browse Female Tutors</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Feature 3: Sanad & ID Verification */}
              <div className="p-5 rounded-2xl bg-white border border-[#ebe3d3] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 w-fit">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                      ID &amp; Sanad
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0c2217]">Manual Document Verification</h4>
                  <p className="text-xs text-[#4a5e55] leading-relaxed">
                    We review CNIC cards, Wafaq-ul-Madaris Sanad degrees, and HEC-recognized qualifications before approval.
                  </p>
                </div>
                <Link
                  href="/safety"
                  className="text-xs font-bold text-[#b85d34] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>Verification Process</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Safety Contact Strip */}
        <div className="p-5 rounded-2xl bg-white border border-[#d4a359]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f5f0e6] rounded-xl text-[#b85d34] shrink-0 border border-[#d4a359]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0c2217]">
                Official Administration Support &amp; Incident Monitoring
              </h4>
              <p className="text-xs text-[#4a5e55]">
                Immediate review for any family inquiry or feedback: <a href="mailto:info@ilmidunya.com" className="text-[#b85d34] underline font-bold">info@ilmidunya.com</a>
              </p>
            </div>
          </div>

          <Link
            href="/safety"
            className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] border border-[#b85d34]/40 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md"
          >
            Safety FAQ &amp; Rules
          </Link>
        </div>

      </div>

      {/* Subtle Bottom Accent Ribbon */}
      <div className="absolute inset-x-0 bottom-0 section-divider-ribbon-subtle" />
    </section>
  );
}

