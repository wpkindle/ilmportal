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
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#f5f0e6] border-b border-[#ebe3d3]">
      {/* Subtle warm glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#1e543c]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-[#d4a359]/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Editorial Header & Stream Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebe3d3] text-[#143d2b] text-xs font-bold shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-[#2b6e51]" />
              <span>Curriculum &amp; Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#141c19] tracking-tight leading-[1.15]">
              Two paths: Sacred Quranic sciences &amp; academic excellence.
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6e69] leading-relaxed">
              From gentle Noorani Qaida for young children to rigorous Cambridge CAIE O/A Levels and FSc Board prep, find specialized educators for every milestone.
            </p>
          </div>

          {/* Stream Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-[#ebe3d3] p-1.5 rounded-2xl text-xs font-bold self-start md:self-auto shrink-0 shadow-inner">
            <button
              onClick={() => setActiveTab('quran')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'quran'
                  ? 'bg-[#143d2b] text-white shadow-sm'
                  : 'text-[#2d3a37] hover:text-[#141c19]'
              }`}
            >
              Quran &amp; Islamic Sciences
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'academic'
                  ? 'bg-[#143d2b] text-white shadow-sm'
                  : 'text-[#2d3a37] hover:text-[#141c19]'
              }`}
            >
              School &amp; College Academics
            </button>
          </div>
        </div>

        {/* Featured Course Banner for Quranic Studies */}
        {activeTab === 'quran' && (
          <div className="p-6 rounded-3xl bg-[#0c2217] text-white border-2 border-[#2b6e51]/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#143d2b] border border-[#2b6e51] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#d4a359]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#d4a359] bg-[#143d2b] px-2.5 py-0.5 rounded border border-[#2b6e51]/60">
                  Recommended for Beginners
                </span>
                <h3 className="text-base sm:text-lg font-serif font-black text-white mt-1">
                  Noorani Qaida &amp; Makharij for Children (Ages 5–12)
                </h3>
                <p className="text-xs text-[#a3b8b0] leading-snug">
                  Gentle, patient 1-on-1 recitation with correct Arabic letters and vocal articulation points.
                </p>
              </div>
            </div>

            <Link
              href="/courses/nazra-quran-kids"
              className="px-5 py-2.5 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore Course</span>
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
                className="group bg-[#faf8f5] p-6 rounded-3xl border border-[#ebe3d3] hover:border-[#143d2b] shadow-2xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-[#f5f0e6] text-[#143d2b] rounded-2xl w-fit group-hover:bg-[#143d2b] group-hover:text-white transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#141c19] group-hover:text-[#143d2b] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#5c6e69] mt-1 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#ebe3d3]/80">
                  {cat.subtopics && cat.subtopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subtopics.slice(0, 3).map((st, sidx) => (
                        <span key={sidx} className="text-[10px] font-semibold bg-[#f0ece1] text-[#2d3a37] px-2 py-0.5 rounded-md">
                          {st}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-bold text-[#143d2b] pt-1">
                    <span>Find Verified Tutors</span>
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
