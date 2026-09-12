'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Users } from 'lucide-react';
import TutorCard from '../tutor/TutorCard';
import { api } from '../../services/api';

export default function FeaturedTutorsShowcase({ initialTutors = [] }) {
  const [tutors, setTutors] = useState(initialTutors);
  const [loading, setLoading] = useState(initialTutors.length === 0);

  useEffect(() => {
    // If SSR provided tutors, use them
    if (initialTutors && initialTutors.length > 0) {
      setTutors(initialTutors);
      setLoading(false);
      return;
    }

    // Client-side fetch fallback
    let isMounted = true;
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicTutors({ limit: 6, sortBy: 'rating' });
        if (isMounted && res && res.success && res.tutors) {
          setTutors(res.tutors);
        }
      } catch (err) {
        console.error('Error loading featured tutors on client:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTutors();

    return () => {
      isMounted = false;
    };
  }, [initialTutors]);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-section-tutors border-b border-[#ebe3d3]">
      {/* Precision architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid opacity-35 pointer-events-none" />

      {/* Subtle top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/35 to-transparent pointer-events-none" />

      {/* Animated floating ambient glows */}
      <div className="absolute -top-12 right-1/4 w-[520px] h-[520px] bg-[#d4a359]/8 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-16 left-10 w-[480px] h-[480px] bg-[#10b981]/6 rounded-full blur-[130px] pointer-events-none animate-float-reverse" />


      {/* Precision architectural coordinate crosshairs */}
      <div className="hidden sm:block absolute top-6 left-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute top-6 right-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 left-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 right-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f0e6] border border-[#ebe3d3] text-[#0c2217] text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Audited Faculty &amp; Quran Qaris</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#141c19] tracking-tight leading-[1.18]">
              Vetted teachers who treat your children like family.
            </h2>

            <p className="text-xs sm:text-sm text-[#5c6e69] leading-relaxed">
              Every teacher holds verified CNIC records and authenticated credentials — from Wafaq-ul-Madaris Tajweed Sanads to Board Matric/FSc and university honors.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tutors?gender=female"
              className="px-4 py-2.5 bg-[#f5f0e6] hover:bg-[#ebe3d3] text-[#0c2217] border border-[#ebe3d3] font-bold text-xs rounded-xl transition-all"
            >
              Female Tutors
            </Link>
            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl transition-all shadow-md group"
            >
              <span>View All Tutors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs animate-pulse space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded-md w-full" />
                <div className="h-3 bg-slate-200 rounded-md w-5/6" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : tutors.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#ebe3d3] shadow-xs space-y-3 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#143d2b]/10 text-[#143d2b] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-[#d4a359]" />
            </div>
            <h3 className="text-lg font-serif font-black text-[#141c19]">Faculty Credentials Under Review</h3>
            <p className="text-xs text-[#5c6e69] leading-relaxed">
              New educator applications are currently undergoing manual verification and Sanad validation. Explore available subjects or browse our tutors directory.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tutors"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Browse Tutors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register/tutor"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5f0e6] hover:bg-[#ebe3d3] text-[#0c2217] border border-[#ebe3d3] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <span>Apply as Tutor</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>

      {/* Subtle Bottom Accent Ribbon */}
      <div className="absolute inset-x-0 bottom-0 section-divider-ribbon-subtle" />
    </section>
  );
}

