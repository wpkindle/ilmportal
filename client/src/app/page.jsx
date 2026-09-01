import React from 'react';
import Link from 'next/link';
import Hero from '../components/home/Hero';
import SubjectExplorer from '../components/home/SubjectExplorer';
import CityGrid from '../components/home/CityGrid';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import TutorCard from '../components/tutor/TutorCard';
import { api } from '../services/api';
import { ArrowRight } from 'lucide-react';

export const revalidate = 60; // SSR with ISR caching every 60s

async function getFeaturedTutors() {
  try {
    const res = await api.getPublicTutors({ limit: 6, sortBy: 'rating' });
    if (res && res.success) {
      return res.tutors || [];
    }
  } catch (err) {
    console.error('SSR fetch error for featured tutors:', err);
  }
  return [];
}

export default async function HomePage() {
  const featuredTutors = await getFeaturedTutors();

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Top Verified Tutors Showcase with Unique Islamic Geometry & Shimmer Orbs */}
      <section className="py-24 relative overflow-hidden bg-slate-50/30 border-b border-slate-200/60 bg-islamic-geometry-light">
        {/* Unique Background Effect Layer 1: Ambient Glowing Spheres */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-[110px] pointer-events-none animate-float-slow" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-teal-400/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Unique Background Effect Layer 2: Rotating Islamic Octagram Star Watermark */}
        <div className="absolute top-6 right-8 w-72 h-72 pointer-events-none opacity-30 animate-spin-slow">
          <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-600/20 fill-none stroke-current" strokeWidth="1.2">
            <rect x="30" y="30" width="140" height="140" rx="10" />
            <rect x="30" y="30" width="140" height="140" rx="10" transform="rotate(45 100 100)" />
            <circle cx="100" cy="100" r="55" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="25" />
          </svg>
        </div>

        <div className="absolute -bottom-10 left-10 w-80 h-80 pointer-events-none opacity-20 animate-spin-reverse">
          <svg viewBox="0 0 200 200" className="w-full h-full text-amber-600/30 fill-none stroke-current" strokeWidth="1">
            <polygon points="100,10 120,70 190,70 135,115 155,185 100,140 45,185 65,115 10,70 80,70" />
            <circle cx="100" cy="100" r="70" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3.5 py-1.5 rounded-full border border-emerald-300/60 inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Top Rated Scholars & Educators</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2.5 tracking-tight">
                Featured Verified Tutors
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                Sanad-certified Quran Qaris and top university graduates ready for online & in-person tutoring across Pakistan.
              </p>
            </div>

            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all self-start md:self-auto shadow-md hover:scale-105"
            >
              <span>View All Faculty</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTutors.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Subject Disciplines Explorer */}
      <SubjectExplorer />

      {/* 4. Pakistan City Coverage Grid */}
      <CityGrid />

      {/* 5. How It Works Flow */}
      <HowItWorks />

      {/* 6. Authentic Testimonials */}
      <Testimonials />

      {/* 7. FAQs */}
      <FAQ />
    </div>
  );
}
