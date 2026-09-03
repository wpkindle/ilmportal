'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does tutoring work on IlmPortal?',
    a: 'You can search for verified Quran teachers and school tutors. Once you choose a tutor, you can chat for free, set your schedule and monthly fee, and take 1-on-1 video classes right on our website.'
  },
  {
    q: 'Do I need Zoom or any other app to join classes?',
    a: 'No! You do not need to download Zoom or any app. Classes happen directly in your internet browser with clear video, screen sharing, and an online Quran.'
  },
  {
    q: 'How are teachers verified?',
    a: 'Every teacher uploads their government ID card, university degrees, and Quran certificates. Our team checks each document carefully before approving the teacher.'
  },
  {
    q: 'How do I pay my teacher\'s fee?',
    a: 'You can pay easily using EasyPaisa, JazzCash, or online bank transfer (like Meezan Bank or Raast). Simply enter your payment confirmation number for instant verification.'
  },
  {
    q: 'Can female students learn from female teachers?',
    a: 'Yes! You can filter your search to find qualified female teachers (Alimahs) for girls and young children with complete privacy.'
  }
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/80 border-b border-slate-200/80">
      {/* Unique Background Effect Layer 1: Central Knowledge Glow Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-400/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Unique Background Effect Layer 2: Concentric Acoustic Ripple Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none opacity-20">
        <svg viewBox="0 0 900 900" className="w-full h-full text-emerald-700 stroke-current fill-none">
          <circle cx="450" cy="450" r="150" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="450" cy="450" r="260" strokeWidth="1.2" strokeDasharray="6 6" />
          <circle cx="450" cy="450" r="370" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="450" cy="450" r="440" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Unique Background Effect Layer 3: Floating Question Sparkle Nodes */}
      <div className="absolute top-16 left-12 pointer-events-none opacity-15 hidden md:block animate-float-slow">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-700">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div className="absolute bottom-16 right-12 pointer-events-none opacity-15 hidden md:block animate-float-reverse">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-700">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        <div className="text-center space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Frequently Asked Questions</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Got Questions? We Have Answers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Everything you need to know about starting your online Quran & academic tutoring.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
