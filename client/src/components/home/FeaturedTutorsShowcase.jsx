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
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#faf8f5] border-b border-[#ebe3d3]">
      {/* Subtle warm ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4a359]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#1e543c]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f0e6] border border-[#ebe3d3] text-[#143d2b] text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2b6e51]" />
              <span>Audited Faculty &amp; Quran Qaris</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#141c19] tracking-tight leading-[1.18]">
              Vetted teachers who treat your children like family.
            </h2>

            <p className="text-xs sm:text-sm text-[#5c6e69] leading-relaxed">
              Every teacher holds verified CNIC records and authenticated credentials — from Wafaq-ul-Madaris Tajweed Sanads to Cambridge O/A Level and FSc university honors.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tutors?gender=female"
              className="px-4 py-2.5 bg-[#f5f0e6] hover:bg-[#ebe3d3] text-[#143d2b] border border-[#ebe3d3] font-bold text-xs rounded-xl transition-all"
            >
              Female Teachers
            </Link>
            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#143d2b] hover:bg-[#1e543c] text-white font-bold text-xs rounded-xl transition-all shadow-sm group"
            >
              <span>View All Teachers</span>
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
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Faculty Profiles Loading</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please check back in a moment or visit the complete tutors directory.
            </p>
            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              <span>Explore All Tutors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

