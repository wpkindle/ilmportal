'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ClipboardList,
  Users,
  Baby
} from 'lucide-react';

export default function CourseCard({ course }) {
  if (!course) return null;

  const totalLessons = course.totalLessons || course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0;
  
  let totalTests = 0;
  let totalAssignments = 0;
  course.chapters?.forEach((ch) => {
    totalTests += ch.tests?.length || 0;
    totalAssignments += ch.assignments?.length || 0;
  });

  const isKids = course.targetAudience?.toLowerCase().includes('kid') || course.track === 'kids';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Banner Image with Badges */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-md ${
            course.category === 'quran'
              ? 'bg-emerald-600 text-white'
              : 'bg-teal-600 text-white'
          }`}>
            <BookOpen className="w-3 h-3" />
            <span>{course.category === 'quran' ? 'Quran & Tajweed' : 'Academic'}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs flex items-center gap-1">
            {isKids ? <Baby className="w-3 h-3" /> : <Users className="w-3 h-3" />}
            <span>{course.targetAudience || 'All Ages'}</span>
          </span>
        </div>

        {/* Bottom Tagline over Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{course.sessionDuration || '20–30 mins'} sessions</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          <Link href={`/courses/${course.slug}`}>
            <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {course.subtitle || course.description}
          </p>
        </div>

        {/* Instructor Row */}
        {course.instructor && (
          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
            <img
              src={course.instructor.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={course.instructor.name}
              className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 truncate">{course.instructor.name}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                {course.tutorProfile?.qualifications || 'Verified Educator'}
              </span>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Chapters</span>
            <span className="text-xs font-black text-slate-900">{course.chapters?.length || 0}</span>
          </div>
          <div className="border-x border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Lessons</span>
            <span className="text-xs font-black text-emerald-700">{totalLessons}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Quizzes</span>
            <span className="text-xs font-black text-purple-700">{totalTests}</span>
          </div>
        </div>

        {/* Price & CTA Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tuition</span>
            <div className="text-sm font-black text-slate-900">
              PKR {course.priceSuggested?.amount?.toLocaleString() || '3,500'}
              <span className="text-[10px] font-medium text-slate-400">/mo</span>
            </div>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 group-hover:gap-2 transition-all"
          >
            <span>Outline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}

