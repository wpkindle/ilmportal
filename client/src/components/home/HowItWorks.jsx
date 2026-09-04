import React from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Video, CreditCard, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Browse & Filter by Subject, Gender, or City',
    highlight: 'Female Alimahs & Cambridge Tutors',
    description: 'Explore verified teacher profiles with authenticated CNIC and Sanad certificates. Filter for female teachers for daughters, or academic specialists in your city.',
    detail: 'Over 20+ disciplines across Pakistan',
    icon: Search
  },
  {
    step: '02',
    title: 'Free Direct Chat to Agree on Timings & Fee',
    highlight: 'Zero Middleman Markups',
    description: 'Message teachers directly within our protected in-app chat. Discuss your child’s learning pace, preferred evening or weekend hours, and agree on a fair monthly fee in PKR.',
    detail: 'No personal phone numbers leaked',
    icon: MessageSquare
  },
  {
    step: '03',
    title: 'Join Live 1-on-1 Class (Camera-Off by Default)',
    highlight: 'Browser Native • No Zoom Downloads',
    description: 'Your child joins with 1 click right in their web browser. Interactive Quran reader, audio recitation, and digital slate. Camera stays OFF by default for complete privacy.',
    detail: 'Parents may observe silently anytime',
    icon: Video
  },
  {
    step: '04',
    title: 'Simple Direct Clearance via EasyPaisa or JazzCash',
    highlight: 'Instant Receipt & Confirmation',
    description: 'Pay your agreed monthly fee easily through your regular banking app, EasyPaisa, JazzCash, or Raast with transparent administrative verification.',
    detail: '100% money protected & confirmed',
    icon: CreditCard
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#f5f0e6] border-b border-[#ebe3d3]">
      {/* Subtle warm glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-[#d4a359]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebe3d3] text-[#143d2b] text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2b6e51]" />
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
                className="p-6 sm:p-7 rounded-3xl bg-[#faf8f5] border border-[#ebe3d3] hover:border-[#143d2b] shadow-2xs hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between group"
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

                <div className="pt-3 border-t border-[#ebe3d3]/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-[#81928e]">
                    &bull; {s.detail}
                  </span>
                  <span className="text-[#143d2b] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
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
    </section>
  );
}
