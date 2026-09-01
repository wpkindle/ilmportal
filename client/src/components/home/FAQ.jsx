'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does tutoring work on IlmPortal Pakistan?',
    a: 'Students can search for verified Quran teachers and academic coaches across Pakistan. Once you find a tutor, you can chat 1:1, discuss your syllabus, agree on custom flexible rates, and attend live classes directly in our browser-based video classroom.'
  },
  {
    q: 'Do I need Zoom or Google Meet to attend classes?',
    a: 'No! IlmPortal features a 100% in-platform HD live video classroom with audio/video, screen sharing, an interactive digital Quran reader tab, and in-call live chat. You simply click "Join Live Class" from your portal.'
  },
  {
    q: 'How do tutors verify their Sanad / Credentials?',
    a: 'Tutors upload their authentic Dars-e-Nizami, Shahadat-ul-Alimiyya, Hifz certificates, or academic university degrees during onboarding. Our administrative team verifies the documents before approving the tutor with a verified Sanad trust badge.'
  },
  {
    q: 'What payment methods are supported in Pakistan?',
    a: 'We support standard Pakistani payment channels including JazzCash Mobile Account, EasyPaisa, and Online Bank Transfers (e.g., Meezan Bank, Raast). Students simply enter their Transaction ID (TID) for rapid admin verification.'
  },
  {
    q: 'Can female students request female Quran teachers (Alimahs)?',
    a: 'Yes! Our search filters include a gender preference filter so female students and young children can connect specifically with certified female Alimahs and Quran teachers.'
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
