import React from 'react';
import Link from 'next/link';
import HowItWorks from '../../components/home/HowItWorks';
import FAQ from '../../components/home/FAQ';
import { ShieldCheck, Video, CreditCard, Sparkles, GraduationCap } from 'lucide-react';

export const metadata = {
  title: 'How It Works | IlmiDunya Pakistan',
  description: 'Learn how to find verified Quran and academic tutors, negotiate custom rates, and attend live WebRTC classes in Pakistan.',
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-0">
      <div className="py-16 bg-gradient-to-b from-[#07150e] via-[#0c2217] to-[#07150e] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#d4a359] bg-[#d4a359]/20 px-3 py-1 rounded-full border border-[#d4a359]/30">
            Platform Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-serif">
            How IlmiDunya Works
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
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Ready to Begin Your Learning Journey?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?role=student"
              className="w-full sm:w-auto px-6 py-3 bg-[#0c2217] hover:bg-[#143d2b] text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Start as a Student
            </Link>
            <Link
              href="/login?role=tutor"
              className="w-full sm:w-auto px-6 py-3 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Apply as a Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

