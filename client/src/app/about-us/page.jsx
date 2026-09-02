'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CMSContentRenderer from '../../components/common/CMSContentRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import {
  Heart,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  Compass,
  Target,
  ArrowRight
} from 'lucide-react';

export default function AboutUsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const initiativeTag = page?.aboutDetails?.initiativeText || 'An initiative by Mr. & Mrs. Abdul Khaliq from Lahore, Pakistan.';
  const missionText = page?.aboutDetails?.mission || 'Empowering Pakistani families with accessible, authentic Quranic studies and high-achieving academic tutoring from the safety of home.';
  const visionText = page?.aboutDetails?.vision || 'To be the most trusted and credible learning platform in Pakistan, upholding academic excellence and authentic Quranic tradition.';

  return (
    <div className="flex-1 bg-slate-50">

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white pt-12 pb-16 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400">About Us</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Our Roots & Story</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {page?.title || 'About IlmPortal Pakistan'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {page?.subtitle || 'Empowering Pakistani homes with authentic Quranic education and academic excellence.'}
          </p>

          {/* Founder Initiative Box */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-950/80 to-slate-900/80 border border-emerald-500/40 rounded-2xl shadow-lg">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-emerald-300">
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {missionText}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {visionText}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Main Narrative Content Container */}
      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-xs space-y-8">
            {loading ? (
              <LoadingSpinner text="Loading about us narrative..." />
            ) : page?.content ? (
              <CMSContentRenderer content={page.content} />
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                Content is being updated.
              </p>
            )}

            {/* Call to Action Bar */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ready to start learning?</h4>
                <p className="text-xs text-slate-500">Explore verified Qaris and academic faculty with a 3-day free trial.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/tutors"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Find a Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/register/tutor"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
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
