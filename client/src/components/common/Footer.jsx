'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ShieldCheck,
  Heart,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Globe,
  Lock,
  Compass,
  Headphones,
  Zap,
  Landmark,
  CreditCard,
  Chrome
} from 'lucide-react';
import ChromeAppInstallModal from './ChromeAppInstallModal';

const Footer = () => {
  const pathname = usePathname();
  const [chromeModalOpen, setChromeModalOpen] = useState(false);

  // Hide footer completely only on live video classroom
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-20 pb-36 md:pb-16 overflow-hidden border-t border-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* Embedded CSS Animations for High-Performance GPU Acceleration */}
      <style jsx>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(35px, -25px) scale(1.12); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.05); }
          50% { transform: translate(-40px, 30px) scale(0.95); }
        }
        @keyframes floatSlow3 {
          0%, 100% { transform: translate(0px, 0px) scale(0.98); }
          50% { transform: translate(25px, -35px) scale(1.08); }
        }
        @keyframes shimmerSlow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes beamScan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes starDrift1 {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.25; }
          50% { transform: rotate(180deg) scale(1.25); opacity: 0.45; }
        }
        @keyframes starDrift2 {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.2; }
          50% { transform: rotate(-180deg) scale(1.3); opacity: 0.5; }
        }

        .anim-orb-1 { animation: floatSlow1 22s ease-in-out infinite alternate; }
        .anim-orb-2 { animation: floatSlow2 26s ease-in-out infinite alternate; }
        .anim-orb-3 { animation: floatSlow3 30s ease-in-out infinite alternate; }
        .anim-shimmer { animation: shimmerSlow 6s ease-in-out infinite; background-size: 200% 100%; }
        .anim-beam { animation: beamScan 7s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .anim-star-1 { animation: starDrift1 12s ease-in-out infinite; }
        .anim-star-2 { animation: starDrift2 15s ease-in-out infinite 2s; }
      `}</style>

      {/* Animated Background Ambient Glows & Floating Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Top Sweeping Animated Laser Beam */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-slate-800 overflow-hidden">
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent anim-beam" />
        </div>

        {/* Floating Animated Radial Glow Orbs */}
        <div className="absolute -top-36 left-1/4 w-[480px] h-[480px] bg-emerald-500/15 rounded-full blur-[100px] anim-orb-1" />
        <div className="absolute top-32 right-12 w-[420px] h-[420px] bg-teal-500/15 rounded-full blur-[110px] anim-orb-2" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-emerald-600/10 rounded-full blur-[120px] anim-orb-3" />

        {/* Floating Islamic Geometric Stars (Subtle background motifs) */}
        <div className="absolute top-24 left-[10%] text-emerald-400/20 anim-star-1">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 4.41L19.5 3.5L18.59 8.41L23 11L18.59 13.59L19.5 18.5L14.59 17.59L12 22L9.41 17.59L4.5 18.5L5.41 13.59L1 11L5.41 8.41L4.5 3.5L9.41 4.41L12 0Z" />
          </svg>
        </div>

        <div className="absolute bottom-32 right-[12%] text-teal-400/20 anim-star-2">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 4.41L19.5 3.5L18.59 8.41L23 11L18.59 13.59L19.5 18.5L14.59 17.59L12 22L9.41 17.59L4.5 18.5L5.41 13.59L1 11L5.41 8.41L4.5 3.5L9.41 4.41L12 0Z" />
          </svg>
        </div>

        <div className="absolute top-1/2 left-[48%] text-cyan-400/15 anim-star-1" style={{ animationDelay: '4s' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 4.41L19.5 3.5L18.59 8.41L23 11L18.59 13.59L19.5 18.5L14.59 17.59L12 22L9.41 17.59L4.5 18.5L5.41 13.59L1 11L5.41 8.41L4.5 3.5L9.41 4.41L12 0Z" />
          </svg>
        </div>

        {/* Subtle decorative grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">

        {/* Pre-Footer Callout Banner with Animated Shimmer Glow */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl group-hover:bg-emerald-500/25 transition-all duration-700 pointer-events-none anim-orb-2" />
          <div className="absolute -left-10 -top-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-700 pointer-events-none anim-orb-1" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>3-Day Free Trial Available on All Subjects</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready to start learning Quran and school subjects?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Learn Quran and school subjects with verified Pakistani tutors. Safe 1-on-1 online classes and home tutoring.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/tutors"
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Find a Verified Tutor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register/tutor"
                className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Teach on IlmPortal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Footer 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand, Mission & Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 group-hover:scale-105 transition-transform duration-300 ring-2 ring-emerald-400/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Ilm<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Portal</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/90 block -mt-1">
                  Pakistan&apos;s Online Learning Platform
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan&apos;s trusted Quran and school tutoring platform. Helping families find verified Quran tutors and qualified school tutors with complete safety and privacy.
            </p>

            {/* Quick Contact Micro-Cards */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:contact@ilmportal.org" className="hover:text-emerald-400 font-semibold transition-colors">
                  contact@ilmportal.org
                </a>
              </div>
            </div>

            {/* Trust Badges Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-emerald-300 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Sanad Verified Tutors</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-teal-300 border border-slate-800 hover:border-teal-500/40 transition-colors">
                <Lock className="w-3 h-3 text-teal-400" />
                <span>100% Safe &amp; Private</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Serving All Over Pakistan</span>
              </span>
            </div>

            {/* Chrome App Download Badge */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setChromeModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 hover:from-emerald-950 hover:to-slate-900 text-white border border-emerald-500/40 hover:border-emerald-400 text-xs font-bold shadow-md transition-all cursor-pointer group"
              >
                <Chrome className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span>Download Chrome App</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">PWA</span>
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Quick Links
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/register/student" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span>Student Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/register/tutor" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span>Tutor Registration</span>
                </Link>
              </li>
              <li>
                <Link href="/tutors" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <Compass className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span>Explore All Tutors</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span>LMS Masterclasses</span>
                </Link>
              </li>
              <li>
                <Link href="/tutors?gender=female" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Female Tutors &amp; Alimahs</span>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span>How It Works</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quran Disciplines */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-teal-500" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Quran Studies
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/tutors?category=tajweed-al-quran" className="hover:text-emerald-400 transition-colors block">
                  Tajweed al-Quran
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=nazra-quran" className="hover:text-emerald-400 transition-colors block">
                  Nazra Quran for Kids
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=hifz-al-quran" className="hover:text-emerald-400 transition-colors block">
                  Hifz al-Quran Memorization
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=quran-translation-tafseer" className="hover:text-emerald-400 transition-colors block">
                  Quran Translation &amp; Tafseer
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=arabic-grammar-spoken" className="hover:text-emerald-400 transition-colors block">
                  Arabic Grammar (Sarf &amp; Nahw)
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=islamic-studies" className="hover:text-emerald-400 transition-colors block">
                  Islamic Jurisprudence &amp; Fiqh
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Tutoring */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-cyan-500" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Academics
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/tutors?category=o-level-cambridge" className="hover:text-emerald-400 transition-colors block">
                  Cambridge O-Level &amp; IGCSE
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=a-level-cambridge" className="hover:text-emerald-400 transition-colors block">
                  Cambridge CAIE A-Level
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=matric-ssc-science" className="hover:text-emerald-400 transition-colors block">
                  Matric Board (Class 9 &amp; 10)
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=fsc-hssc" className="hover:text-emerald-400 transition-colors block">
                  FSc Pre-Med &amp; Pre-Engg
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=mdcat-ecat" className="hover:text-emerald-400 transition-colors block">
                  MDCAT &amp; ECAT Entry Prep
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=computer-science-coding" className="hover:text-emerald-400 transition-colors block">
                  Computer Science &amp; Coding
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Company & Legal Policies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-amber-500" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Company &amp; Legal
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/about-us" className="hover:text-emerald-400 transition-colors block">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-emerald-400 transition-colors block">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Safety, Privacy &amp; Trust</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors block">
                  Privacy Policy (PECA)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors block">
                  Academic Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Platform - Meezan Barcode & Account Info (Spans 4 columns in Row 2 to cover empty space) */}
          <div className="md:col-span-2 lg:col-span-4 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl transition-all">
            <div className="space-y-3 flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>Support Platform</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Meezan Bank
                    </span>
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Scan with any Pakistani banking app (Meezan, Raast, EasyPaisa, JazzCash) or transfer directly:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Meezan Bank</span>
                  <span className="font-mono text-emerald-300 font-extrabold text-xs sm:text-sm select-all">96010105435308</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Raast, EasyPaisa, JazzCash, UPaisa</span>
                  <span className="font-mono text-amber-300 font-extrabold text-xs sm:text-sm select-all">03171759093</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                <span>Account Title: <strong className="text-white">Abdul Khaliq</strong></span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-emerald-400 font-semibold">100% Verified Platform</span>
              </div>
            </div>

            {/* Meezan Barcode Image */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white p-2 rounded-2xl shadow-lg border border-slate-200">
                <img
                  src="/images/qr-meezan.jpg"
                  alt="Meezan Bank Support Barcode"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Scan to Support
              </span>
            </div>
          </div>

        </div>

        {/* Payment Method Trust Bar with Soft Shimmer */}
        <div className="py-6 px-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-inner">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Supported Secure Tuition Payment Gateways:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-amber-300 hover:border-amber-500/40 transition-colors flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>JazzCash</span>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-emerald-300 hover:border-emerald-500/40 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>EasyPaisa</span>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-cyan-300 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>Meezan Islamic Bank</span>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-purple-300 hover:border-purple-500/40 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Raast Instant ID</span>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-slate-200 hover:border-slate-600 transition-colors flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>1Link ATM</span>
            </span>
          </div>
        </div>

        {/* Security & Data Compliance Trust Bar */}
        <div className="py-4 px-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>SSL 256-Bit Transport Encryption</span>
            </span>
            <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>PECA 2016 Law Compliant</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Female Tutors &amp; Privacy Verified</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Wifaq-ul-Madaris Sanad Verified</span>
            </span>
          </div>

          <Link
            href="/safety"
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors shrink-0"
          >
            <span>Learn About Safety Protocols</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
            <p className="text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} IlmPortal. All rights reserved.
            </p>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/safety" className="hover:text-slate-200 transition-colors">
              Child Protection
            </Link>
            <Link href="/disclaimer" className="hover:text-slate-200 transition-colors">
              Academic Disclaimer
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800/80 shadow-xs text-center">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span className="text-slate-300 font-medium text-[11px] sm:text-xs">
              An initiative by <strong className="text-white">Mr. &amp; Mrs. Abdul Khaliq</strong> from Lahore, Pakistan.
            </span>
          </div>
        </div>

      </div>

      {/* Chrome App Installation Guide Modal */}
      <ChromeAppInstallModal
        isOpen={chromeModalOpen}
        onClose={() => setChromeModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
