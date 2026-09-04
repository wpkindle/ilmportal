'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ShieldCheck,
  Heart,
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Globe,
  Lock,
  Compass,
  Landmark,
  CreditCard,
  Chrome,
  Zap,
  Check,
  Copy
} from 'lucide-react';
import ChromeAppInstallModal from './ChromeAppInstallModal';

const Footer = () => {
  const pathname = usePathname();
  const [chromeModalOpen, setChromeModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Hide footer completely on live video classroom
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  return (
    <footer className="relative bg-[#07150e] text-[#d1dbd6] pt-16 sm:pt-20 pb-28 md:pb-16 overflow-hidden border-t border-[#143d2b]">
      
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#0c2217]/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#d4a359]/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4a359_0.6px,transparent_0.6px)] [background-size:32px_32px] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">

        {/* Pre-Footer Callout Banner with Editorial Warmth */}
        <div className="relative rounded-3xl bg-[#0c2217] border-2 border-[#d4a359]/40 p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Female Safety &amp; Complete Family Privacy Guaranteed</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-serif font-black text-white tracking-tight">
                Verified Qaris, Alimahs &amp; School Tutors for Your Children
              </h3>
              <p className="text-xs sm:text-sm text-[#a3b8b0] max-w-xl leading-relaxed">
                Connect with Wafaq-ul-Madaris certified teachers, female Alimahs for daughters, and Cambridge/Matric specialists. 1-on-1 live classes with camera-off privacy by default.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/tutors"
                className="px-6 py-3.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#b85d34]/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Find a Verified Tutor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register/tutor"
                className="px-5 py-3.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#f5f0e6] font-bold text-xs sm:text-sm rounded-xl border border-[#d4a359]/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                <span>Apply as Tutor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Footer 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-[#143d2b]">
          
          {/* Col 1: Brand, Mission & Female Safety Focus */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#143d2b] flex items-center justify-center text-white shadow-md border border-[#d4a359]/40 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-[#d4a359]" />
              </div>
              <div>
                <span className="text-2xl font-serif font-black tracking-tight text-white flex items-center gap-1">
                  Ilm<span className="text-[#d4a359]">Portal</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#a3b8b0] block -mt-0.5">
                  Pakistan&apos;s Tutoring Platform
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#a3b8b0] leading-relaxed max-w-sm">
              Pakistan&apos;s trusted platform for Quran and academic tutoring, designed specifically for female comfort, privacy, and family dignity. Vetted with CNIC and authentic Sanads.
            </p>

            {/* Official Support Email */}
            <div className="space-y-2 text-xs text-[#d1dbd6]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#143d2b] border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:contact@ilmportal.org" className="hover:text-white font-semibold transition-colors">
                  contact@ilmportal.org
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-[#a3b8b0] text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#d4a359] shrink-0 ml-1.5" />
                <span>Lahore Cantt, Punjab, Pakistan</span>
              </div>
            </div>

            {/* Trust Badges Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#143d2b]/70 text-[#d4a359] border border-[#d4a359]/30">
                <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
                <span>100% Female Privacy</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#143d2b]/70 text-[#f5f0e6] border border-[#d4a359]/30">
                <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
                <span>Sanad Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#143d2b]/70 text-[#f5f0e6] border border-[#d4a359]/30">
                <Lock className="w-3 h-3 text-amber-300" />
                <span>Camera-Off Default</span>
              </span>
            </div>

            {/* Chrome App Download Badge */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setChromeModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#143d2b] hover:bg-[#1e543c] text-[#f5f0e6] border border-[#d4a359]/40 text-xs font-bold shadow-sm transition-all cursor-pointer group"
              >
                <Chrome className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Install Chrome App (PWA)</span>
              </button>
            </div>
          </div>

          {/* Col 2: Quick Gateways */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 rounded-full bg-[#d4a359]" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Gateways
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-[#a3b8b0]">
              <li>
                <Link href="/register/student" className="hover:text-white transition-colors flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Student Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/register/tutor" className="hover:text-white transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Tutor Registration</span>
                </Link>
              </li>
              <li>
                <Link href="/tutors" className="hover:text-white transition-colors flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Explore All Tutors</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Curriculum Courses</span>
                </Link>
              </li>
              <li>
                <Link href="/tutors?gender=female" className="hover:text-white font-bold text-[#d4a359] transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Female Alimahs Only</span>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>How It Works</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quran Disciplines */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 rounded-full bg-[#d4a359]" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Quran Studies
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-[#a3b8b0]">
              <li>
                <Link href="/tutors?category=tajweed-al-quran" className="hover:text-white transition-colors block">
                  Tajweed al-Quran
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=noorani-qaida" className="hover:text-white transition-colors block">
                  Noorani Qaida for Kids
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=hifz-al-quran" className="hover:text-white transition-colors block">
                  Hifz al-Quran Memorization
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=quran-translation-tafseer" className="hover:text-white transition-colors block">
                  Quran Translation &amp; Tafseer
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=arabic-grammar-spoken" className="hover:text-white transition-colors block">
                  Arabic Grammar (Sarf &amp; Nahw)
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=islamic-studies" className="hover:text-white transition-colors block">
                  Islamic Studies &amp; Fiqh
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: School & College Academics */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 rounded-full bg-[#b85d34]" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Academics
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-[#a3b8b0]">
              <li>
                <Link href="/tutors?category=o-level-cambridge" className="hover:text-white transition-colors block">
                  Cambridge O-Level Coaching
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=a-level-cambridge" className="hover:text-white transition-colors block">
                  Cambridge A-Level Coaching
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=matric-ssc-science" className="hover:text-white transition-colors block">
                  Matric Science (9th &amp; 10th)
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=fsc-hssc" className="hover:text-white transition-colors block">
                  FSc Pre-Medical &amp; Pre-Engg
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=mdcat-ecat" className="hover:text-white transition-colors block">
                  MDCAT &amp; ECAT Entry Prep
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white text-[#d4a359] font-semibold transition-colors flex items-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Female Safety Charter</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Support Platform - Meezan Barcode & Direct Transfer Card */}
        <div className="bg-[#0c2217] border border-[#d4a359]/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40 shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Support Platform (IlmPortal)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40">
                  Meezan Bank &amp; Raast
                </span>
              </h4>
            </div>

            <p className="text-xs text-[#a3b8b0] leading-relaxed">
              Scan with any Pakistani banking app (Meezan, Raast, EasyPaisa, JazzCash, Nayapay) or transfer directly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="bg-[#07150e] px-3.5 py-2.5 rounded-xl border border-[#143d2b] flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#a3b8b0] block uppercase font-bold tracking-wider truncate">Account Number (Meezan Bank)</span>
                  <span className="font-mono text-[#d4a359] font-extrabold text-xs sm:text-sm select-all block mt-0.5">96010105435308</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('96010105435308', 'meezan')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#143d2b] hover:bg-[#1a4f38] active:scale-95 text-[#d4a359] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-[#d4a359]/30 shadow-xs"
                  title="Copy Meezan Bank Account Number"
                >
                  {copiedKey === 'meezan' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#07150e] px-3.5 py-2.5 rounded-xl border border-[#143d2b] flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#a3b8b0] block uppercase font-bold tracking-wider truncate" title="Raast ID, EasyPaisa, JazzCash, UPaisa">
                    Raast ID, EasyPaisa, JazzCash, UPaisa
                  </span>
                  <span className="font-mono text-[#d4a359] font-extrabold text-xs sm:text-sm select-all block mt-0.5">03171759093</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('03171759093', 'wallets')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#143d2b] hover:bg-[#1a4f38] active:scale-95 text-[#d4a359] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-[#d4a359]/30 shadow-xs"
                  title="Copy Mobile / Raast ID Number"
                >
                  {copiedKey === 'wallets' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#a3b8b0] pt-0.5">
              <span>Account Title: <strong className="text-white">Abdul Khaliq</strong></span>
              <span>&bull;</span>
              <span className="text-[#d4a359] font-semibold">100% Verified Education Platform</span>
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
            <span className="text-[10px] font-bold text-[#a3b8b0] tracking-wider uppercase">
              Scan Barcode
            </span>
          </div>
        </div>

        {/* Bottom Bar with Family Initiative Credit */}
        <div className="pt-6 border-t border-[#143d2b] flex flex-col xl:flex-row items-center justify-between gap-4 text-xs text-[#81928e]">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4 sm:gap-6">
            <p className="font-medium text-[#a3b8b0]">
              &copy; {new Date().getFullYear()} IlmPortal Pakistan. All rights reserved.
            </p>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy (PECA)
            </Link>
            <Link href="/safety" className="hover:text-white transition-colors">
              Female Privacy &amp; Child Safety
            </Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">
              Academic Disclaimer
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#0c2217] px-4 py-2 rounded-xl border border-[#143d2b] text-center shrink-0 md:whitespace-nowrap">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
            <span className="text-[#d1dbd6] font-medium text-[11px] sm:text-xs md:whitespace-nowrap">
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
