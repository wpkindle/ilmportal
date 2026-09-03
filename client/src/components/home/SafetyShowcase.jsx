'use client';

import React from 'react';
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
  Sparkles,
  Camera,
  Ban
} from 'lucide-react';

const safetyHighlights = [
  {
    icon: ShieldCheck,
    title: 'Female Tutors for Girls & Kids',
    badge: '100% Privacy',
    accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    description:
      'Qualified female tutors for girls and young children, so your family can learn comfortably and privately.',
    link: '/tutors?gender=female',
    linkText: 'Find Female Tutors'
  },
  {
    icon: Video,
    title: 'Camera Privacy Control',
    badge: 'Camera Off by Default',
    accent: 'from-teal-500/20 to-cyan-500/10 text-teal-400 border-teal-500/30',
    description:
      'Your camera stays OFF when you join a class. You choose whether to turn your video on or off at any time.',
    link: '/safety',
    linkText: 'Learn About Privacy'
  },
  {
    icon: MessageSquare,
    title: 'Safe In-App Chat',
    badge: 'Protected Messaging',
    accent: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
    description:
      'Chat directly on our website without giving out your personal phone number or WhatsApp.',
    link: '/safety',
    linkText: 'Chat Rules'
  },
  {
    icon: Award,
    title: 'Verified ID & Qualifications',
    badge: 'Background Checked',
    accent: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    description:
      'We check national ID cards, university degrees, and Quran certificates before approving any teacher.',
    link: '/safety',
    linkText: 'How We Verify'
  }
];

export default function SafetyShowcase() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-950 text-white border-b border-slate-900">
      {/* 3D Multi-Gradient Ambient Lights */}
      <div className="absolute top-1/3 -left-36 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-600/15 to-teal-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-24 right-10 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/15 via-cyan-500/10 to-transparent rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle 3D Geometric Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.12)_1px,transparent_1px)] [background-size:28px_28px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Safe &amp; Trusted Learning</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Safe and Private Learning for Every Family
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Your family&apos;s safety and privacy come first. Here is how we protect our students and teachers:
          </p>
        </div>

        {/* 4 Cards Grid with 3D Glass Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/50 backdrop-blur-xl flex flex-col justify-between space-y-4 transform-gpu hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                {/* 3D Top Shimmer */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${item.accent} w-fit`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={item.link}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Assurance Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated 24/7 Safety &amp; Trust Hotline in Lahore</span>
            </h4>
            <p className="text-xs text-slate-300">
              Immediate intervention for any privacy concern, inquiry, or incident report across all Pakistan cities.
            </p>
          </div>

          <Link
            href="/safety"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-700/30 transition-all shrink-0 flex items-center gap-2"
          >
            <span>Explore Complete Safety Standards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}

