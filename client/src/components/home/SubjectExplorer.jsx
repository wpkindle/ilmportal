'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  BookMarked,
  Award,
  Code,
  Languages,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

const iconMap = {
  BookOpen,
  BookMarked,
  Award,
  Code,
  Languages,
  ShieldCheck
};

const SubjectExplorer = () => {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('quran');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.categories);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <section className="py-20 relative overflow-hidden bg-slate-50/70 border-b border-slate-200/80 bg-blueprint-grid">
      {/* Unique Background Effect Layer 1: Radial Glow Spots */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Unique Background Effect Layer 2: Floating Coordinate Blueprint Matrix Icons */}
      <div className="absolute top-12 left-10 pointer-events-none text-emerald-600/15 animate-float-slow hidden md:block">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="20" cy="20" r="16" strokeDasharray="3 3" />
          <path d="M20 4v32M4 20h32" />
        </svg>
      </div>

      <div className="absolute bottom-20 left-16 pointer-events-none text-teal-600/15 animate-float-reverse hidden md:block">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="1.2">
          <polygon points="25,5 45,40 5,40" />
          <circle cx="25" cy="28" r="8" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="absolute top-28 right-16 pointer-events-none text-emerald-600/20 animate-float-slow hidden md:block">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
          <ellipse cx="30" cy="30" rx="25" ry="10" transform="rotate(30 30 30)" />
          <ellipse cx="30" cy="30" rx="25" ry="10" transform="rotate(-30 30 30)" />
          <circle cx="30" cy="30" r="4" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Explore Subjects</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Quran &amp; School Subjects
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Find verified tutors for Quran and school classes with flexible timings.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => setActiveTab('quran')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'quran'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quran &amp; Islamic Subjects
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'academic'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              School &amp; College Subjects
            </button>
          </div>
        </div>

        {/* Featured Course Banner for Quranic Studies */}
        {activeTab === 'quran' && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  POPULAR FOR KIDS
                </span>
                <h4 className="text-base sm:text-lg font-black text-white mt-1">
                  Quran Reading for Kids (Ages 5–12)
                </h4>
                <p className="text-xs text-slate-300">
                  Fun, step-by-step lessons for children with Quran letters, correct pronunciation, and a free trial.
                </p>
              </div>
            </div>

            <Link
              href="/courses/nazra-quran-kids"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shrink-0 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              <span>View Course Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || BookOpen;
            return (
              <Link
                key={cat._id}
                href={`/tutors?category=${cat.slug}`}
                className="group bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {cat.subtopics && cat.subtopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subtopics.slice(0, 3).map((st, sidx) => (
                        <span key={sidx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {st}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 pt-1">
                    <span>Find Available Tutors</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SubjectExplorer;
