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
            Focused on Home-Based In-Person and Live Online Tuitions across Pakistan — with guaranteed zero phone/WhatsApp exposure.
          </p>
        </div>
      </div>

      {/* 3 Core Highlights */}
      <section className="py-8 bg-[#faf8f5] border-b border-[#ebe3d3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#ebe3d3] space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b85d34] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Zero Contact Leaks
              </span>
              <h3 className="text-sm font-serif font-bold text-slate-900">Zero Phone / WhatsApp Needed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never ask for or require your phone number or WhatsApp. Neither students nor tutors share personal numbers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#ebe3d3] space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c2217] bg-[#f0ece1] px-2.5 py-0.5 rounded-full border border-[#d4a359]/40">
                In-Person &amp; Online
              </span>
              <h3 className="text-sm font-serif font-bold text-slate-900">Home-Based &amp; Online Tuitions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter tutors by your specific Pakistani city and neighborhood for in-person home visits, or learn online from anywhere.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#ebe3d3] space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                3-Day Free Trial
              </span>
              <h3 className="text-sm font-serif font-bold text-slate-900">Risk-Free Evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Test compatibility, punctuality, and teaching style for 3 full days before mutually agreeing on monthly tuition in PKR.
              </p>
            </div>
          </div>
        </div>
      </section>

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

