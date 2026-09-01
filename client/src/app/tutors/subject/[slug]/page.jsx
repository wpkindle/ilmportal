import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import TutorCard from '../../../../components/tutor/TutorCard';
import { api } from '../../../../services/api';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const subjectSlug = decodeURIComponent(params.slug);
  const formattedName = subjectSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${formattedName} Tutors in Pakistan | IlmPortal Pakistan`,
    description: `Find certified ${formattedName} tutors across Pakistan for personalized 1:1 live video classes. Authentic Sanad verified scholars & educators.`,
    openGraph: {
      title: `${formattedName} Tutors - IlmPortal Pakistan`,
      description: `Learn ${formattedName} with certified tutors in Pakistan.`,
    }
  };
}

export default async function SubjectTutorsPage({ params }) {
  const rawSlug = decodeURIComponent(params.slug);
  const formattedName = rawSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  let tutors = [];
  try {
    const res = await api.getTutors({ category: rawSlug });
    if (res && res.success) tutors = res.tutors || [];
  } catch (err) {
    console.error('SSR fetch error for subject tutors:', err);
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link
          href="/tutors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Disciplines</span>
        </Link>

        {/* Subject Hero Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Discipline Specialization</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            {formattedName} Tutors in Pakistan
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Find certified specialists for {formattedName}. Coordinate schedules, discuss tuition fees in 1:1 chat, and join live video classroom sessions.
          </p>
        </div>

        {/* Tutors Count & Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">
              {tutors.length} Certified Tutors Teaching {formattedName}
            </span>
          </div>

          {tutors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No tutors currently listed for {formattedName}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore all verified tutors across Pakistan who teach related Quranic & academic subjects.
              </p>
              <Link
                href="/tutors"
                className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Browse All Tutors
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

      </div>
    </div>
  );
}

