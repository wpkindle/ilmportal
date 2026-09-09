'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ShieldCheck,
  Heart,
  Mail,
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
import BrandLogo from './BrandLogo';

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
    <footer className="relative bg-gradient-to-b from-[#091e14] via-[#06150e] to-[#040d09] text-[#a3bcaf] pt-16 sm:pt-20 pb-36 sm:pb-40 md:pb-36 lg:pb-36 overflow-hidden border-t-2 border-[#d4a359]/60 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
      
      {/* Subtle Ambient Background Gradients & Dark Geometric Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Gold Glowing Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a359] via-[#10b981] to-transparent shadow-[0_0_14px_rgba(212,163,89,0.6)]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#d4a359]/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#10b981]/10 rounded-full blur-[120px]" />

        {/* Fine Starry Micro-dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(212,163,89,0.18)_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">

        {/* Pre-Footer Callout Banner with Illuminated Luxury Dark Aesthetic */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#102d20] via-[#143627] to-[#0a1e15] border-2 border-[#d4a359]/50 p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Subtle inside glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#d4a359]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#d4a359]/20 text-[#f5d996] border border-[#d4a359]/50 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f5d996]" />
                <span>Female Safety &amp; Complete Family Privacy Guaranteed</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-serif font-black text-[#faf6ef] tracking-tight">
                Verified Qaris, Alimahs &amp; School Tutors for Your Children
              </h3>
              <p className="text-xs sm:text-sm text-[#b8d4c7] max-w-xl leading-relaxed">
                Connect with Wafaq-ul-Madaris certified teachers, female Alimahs for daughters, and Playgroup to FSc specialists. 1-on-1 live classes with camera-off privacy by default.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/tutors"
                className="px-6 py-3.5 bg-[#b85d34] hover:bg-[#a34d26] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#b85d34]/40 transition-all flex items-center gap-2 cursor-pointer border border-[#d4a359]/40"
              >
                <span>Find a Verified Tutor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login?role=tutor&mode=signup"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border-2 border-[#d4a359]/60 transition-all flex items-center gap-2 cursor-pointer shadow-md backdrop-blur-xs"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                <span>Apply as Tutor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Footer 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-[#1b3d2c]">
          
          {/* Col 1: Brand, Mission & Female Safety Focus */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group py-1" title="IlmiDunya">
              <BrandLogo variant="dark" size="md" withUrdu={true} />
            </Link>

            <p className="text-xs text-[#a3bcaf] leading-relaxed max-w-sm">
              Pakistan&apos;s trusted platform for Quran and academic tutoring, designed specifically for female comfort, privacy, and family dignity. Vetted with CNIC and authentic Sanads.
            </p>

            {/* Official Support Email */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0e271c] border border-[#1d4532] flex items-center justify-center text-[#d4a359] shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:info@ilmidunya.com" className="text-[#f5f1e8] hover:text-[#d4a359] font-semibold transition-colors">
                  info@ilmidunya.com
                </a>
              </div>
            </div>

            {/* Social Media Handles */}
            <div className="flex items-center gap-2 pt-0.5">
              <a
                href="https://www.facebook.com/ilmidunyapakistan"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-8 h-8 rounded-xl bg-[#0e271c] hover:bg-[#1877F2]/20 border border-[#1d4532] hover:border-[#1877F2]/60 flex items-center justify-center transition-all group"
              >
                <svg className="w-3.5 h-3.5 text-[#a3bcaf] group-hover:text-[#1877F2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/ilmidunya_com"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-8 h-8 rounded-xl bg-[#0e271c] hover:bg-[#E1306C]/20 border border-[#1d4532] hover:border-[#E1306C]/60 flex items-center justify-center transition-all group"
              >
                <svg className="w-3.5 h-3.5 text-[#a3bcaf] group-hover:text-[#E1306C] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@ilmidunyapakistan"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="w-8 h-8 rounded-xl bg-[#0e271c] hover:bg-[#FF0000]/20 border border-[#1d4532] hover:border-[#FF0000]/60 flex items-center justify-center transition-all group"
              >
                <svg className="w-3.5 h-3.5 text-[#a3bcaf] group-hover:text-[#FF0000] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Trust Badges Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0e271c] text-[#f5d996] border border-[#d4a359]/40 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-[#f5d996]" />
                <span>100% Female Privacy</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0e271c] text-white border border-[#10b981]/40 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Sanad Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0e271c] text-amber-300 border border-amber-500/40 shadow-xs">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Camera-Off Default</span>
              </span>
            </div>

            {/* Chrome App Download Badge */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setChromeModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0e271c] hover:bg-[#143526] text-white border border-[#d4a359]/50 text-xs font-bold shadow-xs transition-all cursor-pointer group"
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
              <h4 className="text-xs font-extrabold text-[#f5d996] uppercase tracking-wider">
                Gateways
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-[#a3bcaf]">
              <li>
                <Link href="/login?role=student" className="hover:text-white transition-colors flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Student Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/login?role=tutor" className="hover:text-white transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Tutor Portal</span>
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
                  <span>Courses Portal (Soon)</span>
                </Link>
              </li>
              <li>
                <Link href="/tutors?gender=female" className="text-[#f5d996] hover:text-white font-bold transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f5d996]" />
                  <span>Female Alimahs Only</span>
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-white transition-colors flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Articles &amp; Editorial (Soon)</span>
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
              <h4 className="text-xs font-extrabold text-[#f5d996] uppercase tracking-wider">
                Quran Studies
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-[#a3bcaf]">
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
              <div className="w-1.5 h-3.5 rounded-full bg-[#d4a359]" />
              <h4 className="text-xs font-extrabold text-[#f5d996] uppercase tracking-wider">
                Academics
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-[#a3bcaf]">
              <li>
                <Link href="/tutors?category=board-exam-prep" className="hover:text-white transition-colors block">
                  Board Exam Preparation
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=middle-school-academic" className="hover:text-white transition-colors block">
                  Middle School Academic (6th-8th)
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
                <Link href="/safety" className="text-[#f5d996] hover:text-white font-semibold transition-colors flex items-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Female Safety Charter</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Support Platform - Meezan Barcode & Direct Transfer Card with Dark Luxury Aesthetic */}
        <div className="bg-gradient-to-br from-[#0c2419] to-[#07170f] border-2 border-[#d4a359]/50 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#0e2c1e] text-[#d4a359] border border-[#d4a359]/40 shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-[#fcfaf6] flex items-center gap-2">
                <span>Support Platform (IlmiDunya)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d4a359]/20 text-[#f5d996] border border-[#d4a359]/50">
                  Meezan Bank &amp; Raast
                </span>
              </h4>
            </div>

            <p className="text-xs text-[#b8d4c7] leading-relaxed">
              Scan with any Pakistani banking app (Meezan, Raast, EasyPaisa, JazzCash, Nayapay) or transfer directly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="bg-[#05130b] px-3.5 py-2.5 rounded-xl border border-[#1b4330] flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#7d9e8f] block uppercase font-bold tracking-wider truncate">Account Number (Meezan Bank)</span>
                  <span className="font-mono text-[#f5d996] font-extrabold text-xs sm:text-sm select-all block mt-0.5">96010105435308</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('96010105435308', 'meezan')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0e2c1e] hover:bg-[#16442e] active:scale-95 text-[#f5d996] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-[#d4a359]/40 shadow-xs"
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
              <div className="bg-[#05130b] px-3.5 py-2.5 rounded-xl border border-[#1b4330] flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#7d9e8f] block uppercase font-bold tracking-wider truncate" title="Raast ID, EasyPaisa, JazzCash, UPaisa">
                    Raast ID, EasyPaisa, JazzCash, UPaisa
                  </span>
                  <span className="font-mono text-[#f5d996] font-extrabold text-xs sm:text-sm select-all block mt-0.5">03171759093</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('03171759093', 'wallets')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0e2c1e] hover:bg-[#16442e] active:scale-95 text-[#f5d996] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-[#d4a359]/40 shadow-xs"
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

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#a3bcaf] pt-0.5">
              <span>Account Title: <strong className="text-[#faf6ef]">Abdul Khaliq</strong></span>
              <span>&bull;</span>
              <span className="text-[#f5d996] font-semibold">100% Verified Education Platform</span>
            </div>
          </div>

          {/* Meezan Barcode Image */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white p-2 rounded-2xl shadow-xl border-2 border-[#d4a359]/60">
              <img
                src="/images/qr-meezan.jpg"
                alt="Meezan Bank Support Barcode"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[10px] font-bold text-[#b8d4c7] tracking-wider uppercase">
              Scan Barcode
            </span>
          </div>
        </div>

        {/* Bottom Bar with Family Initiative Credit */}
        <div className="pt-6 border-t border-[#173827] flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-[#8daaa0]">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2">
            <p className="font-medium text-[#a3bcaf]">
              &copy; {new Date().getFullYear()} IlmiDunya Pakistan. All rights reserved.
            </p>
            <Link href="/terms" className="hover:text-[#f5d996] transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#f5d996] transition-colors">
              Privacy Policy (PECA)
            </Link>
            <Link href="/safety" className="hover:text-[#f5d996] transition-colors">
              Female Privacy &amp; Child Safety
            </Link>
            <Link href="/disclaimer" className="hover:text-[#f5d996] transition-colors">
              Academic Disclaimer
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#0c2419] px-3.5 py-2 rounded-xl border border-[#1d4532] text-center shrink-0 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30 shrink-0" />
            <span className="text-[#b8d4c7] font-medium text-[11px] sm:text-xs">
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
