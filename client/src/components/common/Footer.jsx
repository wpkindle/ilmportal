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
  Award,
  Video,
  Compass,
  MessageCircle
} from 'lucide-react';

const Footer = () => {
  const pathname = usePathname();

  // Hide footer completely on live video classroom pages for full immersion
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-20 pb-12 overflow-hidden border-t border-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* 🌌 Background Ambient Glows & Islamic Geometric Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top ambient glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        {/* Radial light orbs */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-600/5 rounded-full blur-3xl" />

        {/* Subtle decorative grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">

        {/* 🌟 Pre-Footer Callout Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>3-Day Free Trial Available on All Subjects</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready to begin your Quranic &amp; Academic journey?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Connect with verified Qaris, Alimahs, and Cambridge subject specialists for 1:1 live in-platform classes and home tutoring across Pakistan.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/tutors"
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
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

        {/* 🏛️ Main Footer 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          
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
                  Pakistan&apos;s National LMS
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan&apos;s premier dedicated Islamic &amp; academic tutoring platform. Empowering families nationwide with Sanad-verified Qaris, certified Alimahs, and Cambridge/Matric exam specialists.
            </p>

            {/* Quick Contact Micro-Cards */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>Gulberg III / DHA Phase 5, Lahore, Pakistan</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:support@ilmportal.pk" className="hover:text-emerald-400 transition-colors">
                  support@ilmportal.pk
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>+92 (42) 3589-7860 &bull; WhatsApp: +92 300 1234567</span>
              </div>
            </div>

            {/* Trust Badges Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-emerald-300 border border-slate-800">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Sanad Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-teal-300 border border-slate-800">
                <Lock className="w-3 h-3 text-teal-400" />
                <span>PECA 2016 Compliant</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-cyan-300 border border-slate-800">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Serving All Over Pakistan</span>
              </span>
            </div>
          </div>

          {/* Col 2: Portals & Learning Hub */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Portals &amp; Hub
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

        {/* 💳 Payment Method Trust Bar */}
        <div className="py-6 px-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Supported Secure Tuition Payment Gateways:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-amber-300">
              ⚡ JazzCash
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-emerald-300">
              🟢 EasyPaisa
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-cyan-300">
              🏦 Meezan Islamic Bank
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-purple-300">
              ✨ Raast Instant ID
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-[11px] text-slate-200">
              💳 1Link ATM
            </span>
          </div>
        </div>

        {/* 📜 Bottom Copyright & Founder Dedication */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p>© {new Date().getFullYear()} IlmPortal Pakistan. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800/60">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span className="text-slate-300 font-medium text-[11px]">
              An initiative by <strong className="text-white">Mr. &amp; Mrs. Abdul Khaliq</strong> from Lahore, Pakistan.
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
