import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function FeaturedCourses() {

  return (
    <section className="py-20 bg-[#faf8f5] text-[#141c19] relative overflow-hidden border-y border-[#ebe3d3]">
      
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#d4a359]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#1e543c]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#ebe3d3]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f0e6] text-[#0c2217] border border-[#ebe3d3] text-xs font-black tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Structured Curriculum &amp; Progress Badges</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#0c2217]">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b85d34] to-[#9e4e2a]">Curriculum Courses</span>
            </h2>

            <p className="text-sm sm:text-base text-[#4a5e55] font-normal leading-relaxed">
              Step-by-step learning roadmaps with defined milestone badges, short kid-friendly lessons, and dedicated 1-on-1 certified teachers.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition-all self-start md:self-auto shrink-0 cursor-pointer"
          >
            <span>Browse All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Courses Launching Soon State */}
        <div className="rounded-3xl border-2 border-[#d4a359]/40 bg-white p-8 sm:p-14 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-[#f5f0e6] border border-[#d4a359]/40 flex items-center justify-center mx-auto text-[#b85d34]">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5f0e6] text-[#b85d34] border border-[#ebe3d3] text-xs font-black tracking-wide">
            <span>Launching Soon</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#0c2217]">
            Courses Portal Launching Soon
          </h3>

          <p className="text-xs sm:text-sm text-[#4a5e55] max-w-xl mx-auto leading-relaxed">
            Step-by-step learning roadmaps with defined milestone badges, short kid-friendly lessons, and dedicated 1-on-1 certified teachers are currently in development. You can connect directly with verified tutors across Pakistan in the meantime.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tutors"
              className="px-6 py-3.5 rounded-2xl bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Verified Tutors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

