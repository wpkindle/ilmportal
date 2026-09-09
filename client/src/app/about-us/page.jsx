'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CMSContentRenderer from '../../components/common/CMSContentRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import { defaultPageData } from '../../services/defaultPages';
import {
  Heart,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  Compass,
  Target,
  ArrowRight,
  Home,
  Video,
  PhoneOff,
  Award
} from 'lucide-react';

export default function AboutUsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultAbout = defaultPageData['about-us'];

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.getPage('about-us');
        if (res.success && res.page) {
          setPage(res.page);
        }
      } catch (err) {
        console.error('Error loading about us:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  const titleToDisplay = page?.title || defaultAbout.title;
  const subtitleToDisplay = page?.subtitle || defaultAbout.subtitle;
  const contentToDisplay = page?.content || defaultAbout.content;
  const initiativeTag = page?.aboutDetails?.initiativeText || defaultAbout.aboutDetails.initiativeText;
  const missionText = page?.aboutDetails?.mission || defaultAbout.aboutDetails.mission;
  const visionText = page?.aboutDetails?.vision || defaultAbout.aboutDetails.vision;

  return (
    <div className="flex-1 bg-[#faf8f5]">

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#07150e] via-[#0c2217] to-[#07150e] text-white pt-12 pb-16 border-b border-[#143d2b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Link href="/" className="hover:text-[#d4a359] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[#d4a359]">About Us</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/30 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#d4a359] fill-[#d4a359]" />
              <span>Our Roots &amp; Foundation</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white">
            {titleToDisplay}
          </h1>
          <p className="text-sm sm:text-base text-[#d1dbd6] max-w-2xl leading-relaxed">
            {subtitleToDisplay}
          </p>

          {/* Founder Initiative Box */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#143d2b] border border-[#d4a359]/40 rounded-2xl shadow-lg shrink-0 md:whitespace-nowrap">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#d4a359] md:whitespace-nowrap">
                {initiativeTag}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-12 -mt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mission */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebe3d3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/40 shadow-xs">
                <Target className="w-5 h-5 text-[#d4a359]" />
              </div>
              <h3 className="text-lg font-serif font-black text-slate-900">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {missionText}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebe3d3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f5ebe6] text-[#b85d34] flex items-center justify-center border border-[#b85d34]/30 shadow-xs">
                <Compass className="w-5 h-5 text-[#b85d34]" />
              </div>
              <h3 className="text-lg font-serif font-black text-slate-900">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {visionText}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Core Pillars of IlmiDunya */}
      <section className="pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#ebe3d3] space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/40">
              <Home className="w-4 h-4 text-[#d4a359]" />
            </div>
            <h4 className="text-xs font-serif font-bold text-slate-900">Home-Based Tuitions</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Filter vetted male and female tutors by your specific Pakistani city and local area for physical home coaching.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe3d3] space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/40">
              <Video className="w-4 h-4 text-[#d4a359]" />
            </div>
            <h4 className="text-xs font-serif font-bold text-slate-900">1-on-1 Online WebRTC</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Browser-native live lessons with camera-off modesty by default, interactive Quran, and digital blackboard.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe3d3] space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#b85d34] flex items-center justify-center border border-rose-200">
              <PhoneOff className="w-4 h-4 text-[#b85d34]" />
            </div>
            <h4 className="text-xs font-serif font-bold text-slate-900">Zero Phone / WhatsApp</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Neither student nor tutor numbers are ever asked or shared. 100% spam-free and safe from harassment.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ebe3d3] space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Award className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="text-xs font-serif font-bold text-slate-900">Sanad-Verified Faculty</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every educator undergoes manual credential review of Wafaq-ul-Madaris Sanads and government CNICs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Narrative Content Container */}
      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#ebe3d3] shadow-xs space-y-8">
            {loading && !contentToDisplay ? (
              <LoadingSpinner />
            ) : (
              <CMSContentRenderer content={contentToDisplay} />
            )}

            {/* Call to Action Bar */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-serif font-bold text-slate-900">Ready to start learning?</h4>
                <p className="text-xs text-slate-500">Explore verified Qaris and academic faculty with a 3-day risk-free trial.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/tutors"
                  className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Find a Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/login?role=tutor&mode=signup"
                  className="px-4 py-2 bg-[#f0ece1] hover:bg-[#e4ddcf] text-[#0c2217] font-bold text-xs rounded-xl border border-[#d4a359]/30 transition-all cursor-pointer"
                >
                  <span>Join as Tutor</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
