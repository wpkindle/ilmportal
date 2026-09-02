import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Heart, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Pakistan Trust */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Ilm<span className="text-emerald-400">Portal</span>
                <span className="text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  Pakistan
                </span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan's dedicated Quran & academic tutoring platform. Connecting students with verified Qaris, Alimahs, and Cambridge/Matric subject coaches for live in-platform 1:1 classes and home tutoring.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-emerald-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Sanad Verified Credentials
              </span>
              <span>&bull;</span>
              <span>All 31+ Pakistani Cities</span>
            </div>
          </div>

          {/* Col 2: Portals & Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Portals & Access</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register/student" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/register/tutor" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tutor Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/tutors" className="hover:text-emerald-400 transition-colors">
                  Find a Tutor
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quran & Islamic Disciplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quran Disciplines</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tutors?category=tajweed-al-quran" className="hover:text-emerald-400 transition-colors">
                  Tajweed al-Quran
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=nazra-quran" className="hover:text-emerald-400 transition-colors">
                  Nazra Quran for Kids
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=hifz-al-quran" className="hover:text-emerald-400 transition-colors">
                  Hifz al-Quran Memorization
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=quran-translation-tafseer" className="hover:text-emerald-400 transition-colors">
                  Quran Translation & Tafseer
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=arabic-grammar-spoken" className="hover:text-emerald-400 transition-colors">
                  Arabic Grammar & Sarf/Nahw
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Coaching */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Academic Coaching</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tutors?category=matric-ssc-science" className="hover:text-emerald-400 transition-colors">
                  Matric & SSC Science (9 & 10)
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=fsc-hssc" className="hover:text-emerald-400 transition-colors">
                  FSc Pre-Medical & Pre-Engineering
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=o-level-cambridge" className="hover:text-emerald-400 transition-colors">
                  Cambridge CAIE O-Level / IGCSE
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=a-level-cambridge" className="hover:text-emerald-400 transition-colors">
                  Cambridge CAIE A-Level
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=computer-science-coding" className="hover:text-emerald-400 transition-colors">
                  Computer Science & Coding
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about-us" className="hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-emerald-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} IlmPortal Pakistan. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
            <Link href="/about-us" className="hover:text-emerald-400 transition-colors">About</Link>
            <span>&bull;</span>
            <Link href="/contact-us" className="hover:text-emerald-400 transition-colors">Contact</Link>
            <span>&bull;</span>
            <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <span>&bull;</span>
            <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">Disclaimer</Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span className="text-slate-300 font-medium">An initiative by Mr. & Mrs. Abdul Khaliq from Lahore, Pakistan.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
