import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';
import RatingStars from '../common/RatingStars';

const testimonials = [
  {
    name: 'Muhammad Tariq (Parent)',
    city: 'Lahore, Punjab',
    role: 'Parent of 2 Quran Students',
    rating: 5,
    review: 'Finding a certified Hafiz with authentic Tajweed credentials was tough. On IlmPortal, we verified Qari Sahab’s Sanad online, agreed on a convenient evening schedule, and my son loves the interactive Quran reader in the classroom!'
  },
  {
    name: 'Ayesha Siddiqui (Student)',
    city: 'Karachi, Sindh',
    role: 'CAIE A-Level Physics Student',
    rating: 5,
    review: 'My tutor Sir Bilal helped me solve past papers with screen sharing and step-by-step whiteboard derivations. Having everything inside one platform without third-party links made studying so much easier.'
  },
  {
    name: 'Qari Huzaifa ur Rehman',
    city: 'Islamabad, ICT',
    role: 'Verified Tajweed & Hifz Tutor',
    rating: 5,
    review: 'As a teacher, IlmPortal provided the exact tools I needed: Sanad verification badge, direct student chat, deal agreements, and a crystal-clear HD WebRTC classroom with built-in Quran reader.'
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white border-b border-slate-200/80">
      {/* Unique Background Effect Layer 1: Warm Mint & Amber Ambient Halo */}
      <div className="absolute -top-24 left-1/3 w-[500px] h-[300px] bg-emerald-400/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-24 right-10 w-[450px] h-[300px] bg-amber-400/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Unique Background Effect Layer 2: Giant Translucent Quote Watermarks */}
      <div className="absolute top-8 left-8 text-9xl font-serif font-black text-emerald-600/5 select-none pointer-events-none leading-none">
        “
      </div>
      <div className="absolute bottom-8 right-8 text-9xl font-serif font-black text-amber-600/5 select-none pointer-events-none leading-none">
        ”
      </div>

      {/* Unique Background Effect Layer 3: Flowing Harmonic Silk Wave Ribbon */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full text-emerald-600/20 fill-none stroke-current" preserveAspectRatio="none" viewBox="0 0 1200 400">
          <path d="M0,100 C300,300 600,0 1200,200 L1200,400 L0,400 Z" fill="rgba(16, 185, 129, 0.03)" stroke="none" />
          <path d="M0,150 C400,20 800,350 1200,100" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M0,220 C350,380 750,50 1200,250" strokeWidth="1.2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            <span>User Testimonials</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Trusted by Families & Teachers Nationwide
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real feedback from Pakistani students, parents, and certified educators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <RatingStars rating={t.rating} size="sm" />
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.role} &bull; {t.city}</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
