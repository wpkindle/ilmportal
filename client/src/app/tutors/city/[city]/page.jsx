import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import TutorCard from '../../../../components/tutor/TutorCard';
import { api } from '../../../../services/api';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const cityName = decodeURIComponent(params.city);
  const formattedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  return {
    title: `Verified Quran & Academic Tutors in ${formattedCity} | IlmPortal Pakistan`,
    description: `Find top-rated Quran Qaris, Alimahs, and Cambridge/Matric academic tutors available for live online classes and home tutoring in ${formattedCity}, Pakistan.`,
    openGraph: {
      title: `Quran & Academic Tutors in ${formattedCity} - IlmPortal`,
      description: `Connect with certified tutors in ${formattedCity} for 1:1 live sessions.`,
    }
  };
}

export default async function CityTutorsPage({ params }) {
  const rawCity = decodeURIComponent(params.city);
  const formattedCity = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);

  let tutors = [];
  try {
    const res = await api.getTutors({ city: formattedCity });
    if (res && res.success) tutors = res.tutors || [];
  } catch (err) {
    console.error('SSR fetch error for city tutors:', err);
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
          <span>All Pakistani Cities</span>
        </Link>

        {/* City Hero Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <MapPin className="w-3.5 h-3.5" />
            <span>{formattedCity}, Pakistan</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Quran & Academic Tutors in {formattedCity}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Connect with certified Quran Qaris, Alimahs, and Cambridge/Matric subject tutors residing in or teaching online for students in {formattedCity}.
          </p>
        </div>

        {/* Tutors Count & Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">
              {tutors.length} Verified Tutors in {formattedCity}
            </span>
          </div>

          {tutors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No tutors specifically listed in {formattedCity} yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our nationwide verified online tutors who conduct live 1:1 sessions across all Pakistan.
              </p>
              <Link
                href="/tutors"
                className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Browse All Online Tutors
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

