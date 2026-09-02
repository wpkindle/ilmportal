'use client';

import React from 'react';
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
  Compass
} from 'lucide-react';

const Footer = () => {
  const pathname = usePathname();

  // Hide footer completely on live video classroom pages for full immersion
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  return (
    <footer className="relative bg-gradient-to-b from-[#031c17] via-[#052820] to-[#02130f] text-slate-200 pt-20 pb-12 overflow-hidden border-t border-emerald-500/30 selection:bg-emerald-500 selection:text-white">
      
      {/* 🔮 Embedded Keyframe Animations for High-Performance Fluid Motion */}
      <style jsx>{`
        @keyframes floatAurora1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.7; }
          50% { transform: translate(45px, -35px) scale(1.2); opacity: 0.95; }
        }
        @keyframes floatAurora2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.1); opacity: 0.65; }
          50% { transform: translate(-50px, 40px) scale(0.95); opacity: 0.9; }
        }
        @keyframes floatAurora3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.5; }
          50% { transform: translate(30px, 30px) scale(1.15); opacity: 0.8; }
        }
        @keyframes laserScan {
          0% { transform: translateX(-100%); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes starTwinkle1 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) rotate(45deg) scale(1.25); opacity: 0.85; }
        }
        @keyframes starTwinkle2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(0.9); opacity: 0.35; }
          50% { transform: translateY(-40px) rotate(-45deg) scale(1.3); opacity: 0.9; }
        }
        @keyframes wavePulse {
          0%, 100% { opacity: 0.25; transform: scaleY(1); }
          50% { opacity: 0.45; transform: scaleY(1.15); }
        }
        .anim-aurora-1 { animation: floatAurora1 10s ease-in-out infinite; }
        .anim-aurora-2 { animation: floatAurora2 14s ease-in-out infinite; }
        .anim-aurora-3 { animation: floatAurora3 12s ease-in-out infinite; }
        .anim-laser { animation: laserScan 6s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .anim-twinkle-1 { animation: starTwinkle1 8s ease-in-out infinite; }
        .anim-twinkle-2 { animation: starTwinkle2 11s ease-in-out infinite 2s; }
        .anim-wave { animation: wavePulse 7s ease-in-out infinite; }
      `}</style>

      {/* 🌌 Rich Glowing Background Layers & Visible Geometry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Top Radiant Glowing Laser Shimmer Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-950 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.8)]">
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent anim-laser" />
        </div>

        {/* Top Central Radiant Aurora Glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[350px] anim-wave"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.35) 0%, rgba(20, 184, 166, 0.2) 50%, transparent 75%)'
          }}
        />

        {/* Dynamic Floating Color Blobs with High Luminosity */}
        <div className="absolute top-10 left-[15%] w-[450px] h-[450px] bg-gradient-to-tr from-emerald-500/30 to-teal-400/25 rounded-full blur-[70px] anim-aurora-1" />
        <div className="absolute top-48 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-teal-500/25 to-emerald-400/20 rounded-full blur-[80px] anim-aurora-2" />
        <div className="absolute -bottom-10 left-1/3 w-[600px] h-[350px] bg-gradient-to-t from-emerald-600/25 via-teal-500/20 to-transparent rounded-full blur-[90px] anim-aurora-3" />

        {/* Visible Islamic Geometric Arabesque Lattice Pattern */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="islamic-arabesque" width="60" height="60" patternUnits="userSpaceOnUse">
              <path 
                d="M30 0 L60 30 L30 60 L0 30 Z M30 10 L50 30 L30 50 L10 30 Z M0 0 L15 15 M60 0 L45 15 M60 60 L45 45 M0 60 L15 45" 
                fill="none" 
                stroke="#34d399" 
                strokeWidth="1.2" 
              />
              <circle cx="30" cy="30" r="3.5" fill="#34d399" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-arabesque)" />
        </svg>

        {/* Floating Twinkling Islamic Star Motifs with Vivid Emerald Glow */}
        <div className="absolute top-20 left-[8%] text-emerald-300 drop-shadow-[0_0_16px_rgba(52,211,153,0.8)] anim-twinkle-1">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 4.41L19.5 3.5L18.59 8.41L23 11L18.59 13.59L19.5 18.5L14.59 17.59L12 22L9.41 17.59L4.5 18.5L5.41 13.59L1 11L5.41 8.41L4.5 3.5L9.41 4.41L12 0Z" />
          </svg>
        </div>

        <div className="absolute bottom-28 right-[8%] text-teal-300 drop-shadow-[0_0_20px_rgba(45,212,191,0.8)] anim-twinkle-2">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 4.41L19.5 3.5L18.59 8.41L23 11L18.59 13.59L19.5 18.5L14.59 17.59L12 22L9.41 17.59L4.5 18.5L5.41 13.59L1 11L5.41 8.41L4.5 3.5L9.41 4.41L12 0Z" />
          </svg>
        </div>

        <div className="absolute top-1/2 left-[50%] text-emerald-200 drop-shadow-[0_0_14px_rgba(110,231,183,0.8)] anim-twinkle-1" style={{ animationDelay: '3s' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 4.41L19.5 3.5L18.59 8.41L23 11L18.59 13.59L19.5 18.5L14.59 17.59L12 22L9.41 17.59L4.5 18.5L5.41 13.59L1 11L5.41 8.41L4.5 3.5L9.41 4.41L12 0Z" />
          </svg>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">

        {/* 🌟 Pre-Footer Callout Banner with Glassmorphism and Animated Ambient Glow */}
        <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-xl border-2 border-emerald-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/25 rounded-full blur-3xl group-hover:bg-emerald-500/35 transition-all duration-700 pointer-events-none anim-aurora-2" />
          <div className="absolute -left-10 -top-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl group-hover:bg-teal-500/30 transition-all duration-700 pointer-events-none anim-aurora-1" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>3-Day Free Trial Available on All Subjects</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready to begin your Quranic &amp; Academic journey?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Connect with verified Qaris, Alimahs, and Cambridge subject specialists for 1:1 live in-platform classes and home tutoring across Pakistan.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/tutors"
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/40 hover:shadow-emerald-500/50 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400/30"
              >
                <span>Find a Verified Tutor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register/tutor"
                className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Teach on IlmPortal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🏛️ Main Footer 5-Column Grid on Glassmorphic Surface */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-emerald-500/20">
          
          {/* Col 1: Brand, Mission & Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-600/40 group-hover:scale-105 transition-transform duration-300 ring-2 ring-emerald-400/40">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Ilm<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Portal</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 block -mt-1">
                  Pakistan&apos;s National LMS
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Pakistan&apos;s premier dedicated Islamic &amp; academic tutoring platform. Empowering families nationwide with Sanad-verified Qaris, certified Alimahs, and Cambridge/Matric exam specialists.
            </p>

            {/* Quick Contact Micro-Cards with Glassmorphism */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>Gulberg III / DHA Phase 5, Lahore, Pakistan</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:support@ilmportal.pk" className="hover:text-emerald-400 transition-colors">
                  support@ilmportal.pk
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>+92 (42) 3589-7860 &bull; WhatsApp: +92 300 1234567</span>
              </div>
            </div>

            {/* Trust Badges Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-slate-900/80 text-emerald-300 border border-emerald-500/30 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sanad Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-slate-900/80 text-teal-300 border border-teal-500/30 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>PECA 2016 Compliant</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-slate-900/80 text-cyan-300 border border-cyan-500/30 shadow-xs">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Serving All Over Pakistan</span>
              </span>
            </div>
          </div>

          {/* Col 2: Portals & Learning Hub */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Portals &amp; Hub
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/register/student" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Student Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/register/tutor" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Tutor Registration</span>
                </Link>
              </li>
              <li>
                <Link href="/tutors" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <Compass className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Explore All Tutors</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>LMS Masterclasses</span>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>How It Works</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quran Disciplines */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Quran Studies
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
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
              <div className="w-1.5 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Academics
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
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
              <div className="w-1.5 h-4 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Company &amp; Legal
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
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

        </div>

        {/* 💳 Payment Method Trust Bar with Soft Shimmer */}
        <div className="py-6 px-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Supported Secure Tuition Payment Gateways:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-amber-500/40 font-bold text-[11px] text-amber-300 shadow-sm">
              ⚡ JazzCash
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-emerald-500/40 font-bold text-[11px] text-emerald-300 shadow-sm">
              🟢 EasyPaisa
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-cyan-500/40 font-bold text-[11px] text-cyan-300 shadow-sm">
              🏦 Meezan Islamic Bank
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-purple-500/40 font-bold text-[11px] text-purple-300 shadow-sm">
              ✨ Raast Instant ID
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 font-bold text-[11px] text-slate-200 shadow-sm">
              💳 1Link ATM
            </span>
          </div>
        </div>

        {/* 📜 Bottom Copyright & Founder Dedication */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <p>© {new Date().getFullYear()} IlmPortal Pakistan. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-4 py-2 rounded-xl border border-emerald-500/30 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span className="font-medium text-[11px]">
              An initiative by <strong className="text-white">Mr. &amp; Mrs. Abdul Khaliq</strong> from Lahore, Pakistan.
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
