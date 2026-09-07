'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f0e6] text-[#b85d34] border border-[#d4a359]/40 text-xs font-black tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#b85d34]" />
            <span>Structured Learning Curriculums</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#0c2217] tracking-tight">
            Courses Portal Launching Soon
          </h1>
          <p className="text-sm sm:text-base text-[#4a5e55] leading-relaxed">
            We are preparing comprehensive, stage-by-stage learning tracks with milestone badges, short kid-friendly lessons, and dedicated 1-on-1 verified teachers.
          </p>
        </div>

        {/* Main Courses Portal Announcement Showcase */}
        <div className="bg-white rounded-3xl border-2 border-[#d4a359]/40 p-8 sm:p-12 shadow-xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4a359]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#b85d34]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#f5f0e6] text-[#b85d34] flex items-center justify-center mx-auto sm:mx-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0c2217]">
                Structured Roadmaps
              </h3>
              <p className="text-xs text-[#52665b] leading-relaxed">
                Step-by-step syllabuses for Noorani Qaida, Tajweed Mastery, Hifz al-Quran, and Playgroup to FSc Academic subjects.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#f5f0e6] text-[#b85d34] flex items-center justify-center mx-auto sm:mx-0">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0c2217]">
                Milestones &amp; Badges
              </h3>
              <p className="text-xs text-[#52665b] leading-relaxed">
                Rewarding progression badges for students at every stage to keep motivation high and track real recitation progress.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#f5f0e6] text-[#b85d34] flex items-center justify-center mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0c2217]">
                Verified 1-on-1 Guidance
              </h3>
              <p className="text-xs text-[#52665b] leading-relaxed">
                Sanad-certified Qaris, female Alimahs from Wafaq-ul-Madaris, and top academic educators with camera-off privacy by default.
              </p>
            </div>
          </div>

          {/* Action Callout */}
          <div className="pt-6 border-t border-[#ebe3d3] flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-bold text-lg text-[#0c2217]">
                Looking for 1-on-1 Tuition Right Now?
              </h4>
              <p className="text-xs text-[#52665b]">
                You can browse and connect directly with verified teachers across Pakistan today.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/tutors"
                className="px-6 py-3.5 rounded-2xl bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Verified Tutors</span>
                <ArrowRight className="w-4 h-4 text-[#d4a359]" />
              </Link>
              <Link
                href="/"
                className="px-5 py-3.5 rounded-2xl bg-[#faf8f5] hover:bg-[#f5f0e6] text-[#0c2217] font-bold text-xs sm:text-sm border border-[#ebe3d3] transition-all cursor-pointer"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
