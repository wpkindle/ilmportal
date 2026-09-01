import React from 'react';
import Link from 'next/link';
import HowItWorks from '../../components/home/HowItWorks';
import FAQ from '../../components/home/FAQ';
import { ShieldCheck, Video, CreditCard, Sparkles, GraduationCap } from 'lucide-react';

export const metadata = {
  title: 'How It Works | IlmPortal Pakistan',
  description: 'Learn how to find verified Quran and academic tutors, negotiate custom rates, and attend live WebRTC classes in Pakistan.',
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-0">
      <div className="py-16 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Platform Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            How IlmPortal Works
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            From discovering verified Sanad scholars to joining interactive live video sessions and straightforward Pakistani fee payment methods.
          </p>
        </div>
      </div>

      <HowItWorks />

      <FAQ />

      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Ready to Begin Your Learning Journey?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?role=student"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Start as a Student
            </Link>
            <Link
              href="/login?role=tutor"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Apply as a Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

