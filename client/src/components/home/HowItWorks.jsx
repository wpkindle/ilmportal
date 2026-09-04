'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageSquare,
  Video,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Browse & Filter by Subject, Gender, or City',
    highlight: 'Female Alimahs & Cambridge Tutors',
    description: 'Explore verified teacher profiles with authenticated CNIC and Sanad certificates. Filter for female teachers for daughters, or academic specialists in your city.',
    detail: 'Over 20+ disciplines across Pakistan',
    icon: Search,
    modalTitle: '1. Browse & Filter Verified Teachers',
    modalIntro: 'Find verified Quran scholars, certified female Alimahs, and top academic educators tailored to your family’s exact requirements.',
    features: [
      {
        title: 'Authentic Sanad & CNIC Verification',
        desc: 'Every teacher profile is verified by platform administrators against their official degree certificates (Wafaq-ul-Madaris, Tanzeem-ul-Madaris, HEC universities).'
      },
      {
        title: '100% Female Privacy & Alimahs for Girls',
        desc: 'Filter specifically for certified female Alimahs for daughters and mothers to ensure absolute comfort, dignity, and cultural respect.'
      },
      {
        title: 'Flexible City & Online Availability',
        desc: 'Select in-person home tutoring in major Pakistani cities (Lahore, Karachi, Islamabad, Rawalpindi) or nationwide online WebRTC live classes.'
      }
    ],
    actionText: 'Browse Verified Tutors Now',
    actionHref: '/tutors'
  },
  {
    step: '02',
    title: 'Free Direct Chat to Agree on Timings & Fee',
    highlight: 'Zero Middleman Markups',
    description: 'Message teachers directly within our protected in-app chat. Discuss your child’s learning pace, preferred evening or weekend hours, and agree on a fair monthly fee in PKR.',
    detail: 'No personal phone numbers leaked',
    icon: MessageSquare,
    modalTitle: '2. Free Direct In-App Chat',
    modalIntro: 'Connect directly with teachers within our monitored in-app chat with zero phone number leaks and zero agency markups.',
    features: [
      {
        title: 'Zero Personal Phone Number Sharing',
        desc: 'Keep your personal WhatsApp and mobile numbers completely private. Inquire, interview, and test compatibility within our encrypted chat.'
      },
      {
        title: 'Direct PKR Fee Agreement',
        desc: 'Negotiate and agree on an honest monthly tuition fee in PKR directly with your tutor without middleman cuts or inflated agency commissions.'
      },
      {
        title: 'Custom Timetable & Days',
        desc: 'Agree on the exact schedule that suits your child—whether 3 days, 5 days, or weekend revisions with morning or evening slots.'
      }
    ],
    actionText: 'Start Direct Chat as Student',
    actionHref: '/register/student'
  },
  {
    step: '03',
    title: 'Join Live 1-on-1 Class (Camera-Off by Default)',
    highlight: 'Browser Native • No Zoom Downloads',
    description: 'Your child joins with 1 click right in their web browser. Interactive Quran reader, audio recitation, and digital slate. Camera stays OFF by default for complete privacy.',
    detail: 'Parents may observe silently anytime',
    icon: Video,
    modalTitle: '3. 1-Click Live WebRTC Classroom',
    modalIntro: 'Attend interactive live classes directly in your web browser with camera-off privacy by default and digital learning tools.',
    features: [
      {
        title: 'Camera-Off Privacy by Default',
        desc: 'Student video camera is strictly OFF by default. Female students and children learn with complete modesty and peace of mind.'
      },
      {
        title: 'No Zoom or Third-Party Downloads',
        desc: 'Our WebRTC classroom runs directly inside Google Chrome or your browser with 1 click. Zero external links or security vulnerabilities.'
      },
      {
        title: 'Integrated Quran Reader & Digital Slate',
        desc: 'Page-by-page Mushaf reader, synchronized audio recitation, whiteboard notes, and real-time screen sharing for academic subjects.'
      }
    ],
    actionText: 'Read Female Safety Protocols',
    actionHref: '/safety'
  },
  {
    step: '04',
    title: 'Simple Direct Clearance via EasyPaisa or JazzCash',
    highlight: 'Instant Receipt & Confirmation',
    description: 'Pay your agreed monthly fee easily through your regular banking app, EasyPaisa, JazzCash, or Raast with transparent administrative verification.',
    detail: '100% money protected & confirmed',
    icon: CreditCard,
    modalTitle: '4. Transparent Fee Clearance',
    modalIntro: 'Pay your tutor securely through standard Pakistani mobile wallets or bank transfers with administrative trial protection.',
    features: [
      {
        title: 'EasyPaisa, JazzCash & Bank Transfer',
        desc: 'Clear tuition fees smoothly using any Pakistani mobile account, Raast ID, or online bank transfer with instant digital receipts.'
      },
      {
        title: '72-Hour Trial Protection Guarantee',
        desc: 'Your first tuition payment is held in administrative escrow until after the trial period, ensuring you are 100% satisfied with the teacher.'
      },
      {
        title: 'Transparent Portal Ledger',
        desc: 'Track all class sessions, payment receipts, attendance logs, and upcoming renewal dates directly inside your Student Portal.'
      }
    ],
    actionText: 'View How Platform Works',
    actionHref: '/how-it-works'
  }
];

export default function HowItWorks() {
  const [activeModalStep, setActiveModalStep] = useState(null);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#f5f0e6] border-b border-[#ebe3d3]">
      {/* Subtle warm glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-[#d4a359]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebe3d3] text-[#143d2b] text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Transparent 4-Step Process</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#141c19] tracking-tight leading-[1.15]">
            How Pakistani families get started in 4 calm steps.
          </h2>

          <p className="text-xs sm:text-sm text-[#5c6e69] leading-relaxed">
            No upfront agency commissions, no pushy sales calls. You talk directly with certified teachers, test compatibility, and start lessons with complete family dignity.
          </p>
        </div>

        {/* Varied Editorial Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveModalStep(s)}
                className="p-5 sm:p-7 rounded-3xl bg-[#faf8f5] border border-[#ebe3d3] hover:border-[#143d2b] shadow-2xs hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-[#b85d34]">
                      {s.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f0ece1] text-[#5e4e37]">
                      {s.highlight}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className="p-2.5 rounded-2xl bg-[#f5f0e6] text-[#143d2b] group-hover:bg-[#143d2b] group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#141c19] group-hover:text-[#143d2b] transition-colors leading-snug">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[#5c6e69] mt-2 leading-relaxed font-normal">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ebe3d3]/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-[#81928e]">
                    &bull; {s.detail}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalStep(s);
                    }}
                    className="text-[#143d2b] hover:text-[#b85d34] font-bold flex items-center gap-1.5 group-hover:translate-x-1 transition-all cursor-pointer p-1 -m-1"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d4a359]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout Strip */}
        <div className="p-6 rounded-3xl bg-[#143d2b] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-base">
              Ready to find a teacher for your child?
            </h4>
            <p className="text-xs text-[#d1dbd6]">
              Browse verified Quran Qaris and academic educators with full profiles and Sanad degrees.
            </p>
          </div>
          <Link
            href="/tutors"
            className="px-6 py-3 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            Browse Verified Tutors
          </Link>
        </div>

      </div>

      {/* Step Detail Explanation Modal */}
      {activeModalStep && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center bg-[#07150e]/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalStep(null);
          }}
        >
          <div className="bg-[#faf8f5] rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-[#e6dfd5] relative overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#e6dfd5] flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-2xl text-[#b85d34]">
                  {activeModalStep.step}
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a359] bg-[#143d2b] border border-[#d4a359]/40 px-2 py-0.5 rounded-full">
                    {activeModalStep.highlight}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#0c2217] mt-0.5 leading-snug">
                    {activeModalStep.modalTitle}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveModalStep(null)}
                aria-label="Close dialog"
                className="p-2 text-stone-400 hover:text-[#0c2217] rounded-full hover:bg-[#f4efe8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {activeModalStep.modalIntro}
              </p>

              {/* Feature Points */}
              <div className="space-y-3 pt-1">
                {activeModalStep.features.map((feat, fIdx) => (
                  <div key={fIdx} className="p-3.5 rounded-2xl bg-white border border-[#e6dfd5] space-y-1 shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0c2217] shrink-0" />
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[#0c2217]">
                        {feat.title}
                      </h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-stone-600 pl-6 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={activeModalStep.actionHref}
                  onClick={() => setActiveModalStep(null)}
                  className="w-full py-3.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] border border-[#d4a359]/40 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#0c2217]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{activeModalStep.actionText}</span>
                  <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-[#e6dfd5] bg-white/70 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-stone-500 font-medium">IlmPortal Pakistan Family Safety</span>
              <button
                type="button"
                onClick={() => setActiveModalStep(null)}
                className="px-4 py-1.5 bg-[#f4efe8] hover:bg-[#eae3d8] text-[#0c2217] border border-[#e6dfd5] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

