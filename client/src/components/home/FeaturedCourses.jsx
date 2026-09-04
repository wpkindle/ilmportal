'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Baby,
  Star,
  Layers,
  Check
} from 'lucide-react';
import { api } from '../../services/api';

const fallbackCourses = [
  {
    title: 'Quran Recitation Course for Kids (Ages ~5–12)',
    slug: 'nazra-quran-kids',
    subtitle: 'Standalone foundational Quran reading curriculum designed specifically for children with gentle, short sessions and joyful milestones.',
    description: 'A dedicated kids-only track separate from adult recitation and separate from Hifz memorization. Focused purely on learning to recognize Arabic letters, join sounds, and recite the Holy Quran with proper Makharij at a child-friendly pace.',
    targetAudience: 'Kids (Ages ~5–12)',
    sessionDuration: '15–20 minutes',
    totalLessons: 38,
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80',
    priceSuggested: { amount: 3500, unit: 'month' },
    stages: [
      { name: 'Stage 1: Letter Recognition (Huroof)', lessonCount: 12, badgeReward: 'Huroof Explorer Badge' },
      { name: 'Stage 2: Short & Long Vowels (Harakat)', lessonCount: 16, badgeReward: 'Harakat Master Badge' },
      { name: 'Stage 3: Word Formation & Noon Sakin', lessonCount: 18, badgeReward: 'Tajweed Junior Badge' },
      { name: 'Stage 4: Complete Juz Amma Recitation', lessonCount: 24, badgeReward: 'Juz Amma Graduate Ribbon' }
    ]
  },
  {
    title: 'Tajweed al-Quran & Melodious Qirat (Adults & Teens)',
    slug: 'tajweed-adults-teens',
    subtitle: 'Comprehensive Tajweed rules, Makharij precision, and melodious Quranic recitation for older students and adults.',
    description: 'Designed for adults, university students, and teenagers aiming to correct accent, master classical Tajweed principles (Ahkam al-Noon, Meem, Madd, Waqf), and recite with confidence.',
    targetAudience: 'Adults & Teens (Ages 13+)',
    sessionDuration: '30–45 minutes',
    totalLessons: 24,
    thumbnail: 'https://images.unsplash.com/photo-1584281722572-887498c87103?w=800&q=80',
    priceSuggested: { amount: 4500, unit: 'month' },
    stages: [
      { name: 'Stage 1: Makharij al-Huroof', lessonCount: 8, badgeReward: 'Makharij Certificate' },
      { name: 'Stage 2: Ahkam Noon & Meem', lessonCount: 8, badgeReward: 'Tajweed Intermediate' },
      { name: 'Stage 3: Advanced Qirat & Melody', lessonCount: 8, badgeReward: 'Master Qari Award' }
    ]
  }
];

export default function FeaturedCourses() {
  const [courses, setCourses] = useState(fallbackCourses);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.getCourses();
        if (res?.success && res.courses?.length) {
          setCourses(res.courses);
        }
      } catch (err) {
        console.warn('Using fallback courses while API initializes:', err);
      }
    };
    loadCourses();
  }, []);

  return (
    <section className="py-20 bg-[#0c2217] text-white relative overflow-hidden border-y border-[#d4a359]/30">
      
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#d4a359]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#143d2b]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/40 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Structured Curriculum &amp; Progress Badges</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a359] to-[#f5f0e6]">Curriculum Courses</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Step-by-step learning roadmaps with defined milestone badges, short kid-friendly lessons, and dedicated 1-on-1 certified teachers.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition-all self-start md:self-auto shrink-0"
          >
            <span>Browse All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {courses.map((course) => {
            const isKidsCourse = course.slug === 'nazra-quran-kids';
            return (
              <div
                key={course.slug}
                className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl relative group ${
                  isKidsCourse
                    ? 'bg-[#143d2b]/60 border-[#d4a359]/50 ring-2 ring-[#d4a359]/20'
                    : 'bg-[#07150e]/80 border-white/10 hover:border-[#d4a359]/40'
                }`}
              >
                <div>
                  {/* Top Image Banner */}
                  <div className="relative h-60 overflow-hidden bg-black">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-[#0c2217]/60 to-transparent" />

                    {/* Highlighted Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-[#143d2b] text-[#faf8f5] border border-[#d4a359]/30 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                        <Baby className="w-3.5 h-3.5" />
                        <span>{course.targetAudience}</span>
                      </span>

                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-black/60 text-[#d4a359] border border-[#d4a359]/40 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                        <Clock className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>{course.sessionDuration}</span>
                      </span>

                      {isKidsCourse && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-[#d4a359] text-[#0c2217] shadow-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#0c2217]" />
                          <span>POPULAR FOR KIDS</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl sm:text-2xl font-serif font-black leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#d4a359] font-semibold mt-1 truncate">
                        {course.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-5">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {course.description}
                    </p>

                    {/* 4 Stages Breakdown */}
                    <div className="space-y-2.5 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1.5 text-[#d4a359]">
                          <Award className="w-4 h-4" />
                          <span>4 Structured Stages ({course.totalLessons} Lessons)</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Milestone Badges</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {course.stages?.map((stage, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#d4a359]/30 transition-colors text-xs space-y-0.5"
                          >
                            <span className="font-extrabold text-white block truncate">
                              {stage.name}
                            </span>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>{stage.lessonCount} Lessons</span>
                              <span className="text-[#d4a359] font-bold truncate ml-1">{stage.badgeReward}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kids Key Design Principles (Only for Kids Course) */}
                    {isKidsCourse && (
                      <div className="p-4 rounded-2xl bg-[#07150e] border border-[#d4a359]/30 text-xs text-slate-200 space-y-2">
                        <div className="flex items-center gap-2 text-[#d4a359] font-bold">
                          <Sparkles className="w-4 h-4 text-[#d4a359]" />
                          <span>Kids&apos; Lesson Highlights:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                            <span>15–20 min micro lessons</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                            <span>Letter tracing &amp; chants</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                            <span>Shaddah clapping trick</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                            <span>Parent lesson summaries</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Tuition & Direct CTA */}
                <div className="p-6 sm:p-7 pt-0 border-t border-white/10 mt-2">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Tuition
                      </span>
                      <span className="text-lg font-black text-white">
                        PKR {course.priceSuggested?.amount?.toLocaleString() || '3,500'}
                        <span className="text-xs font-normal text-slate-400"> / {course.priceSuggested?.unit || 'month'}</span>
                      </span>
                      <span className="inline-block ml-2 text-[10px] font-bold text-[#d4a359] bg-[#07150e] border border-[#d4a359]/40 px-2 py-0.5 rounded-full">
                        3-Day Free Trial Available
                      </span>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Explore 4 Stages &amp; Syllabus</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

