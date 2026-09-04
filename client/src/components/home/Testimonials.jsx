import React from 'react';
import { Star, ShieldCheck, Quote, CheckCircle2 } from 'lucide-react';
import RatingStars from '../common/RatingStars';

const testimonials = [
  {
    featured: true,
    name: 'Mrs. Shazia Farooq',
    location: 'DHA Phase 5, Lahore',
    role: 'Mother of 8-year-old Quran student',
    rating: 5,
    highlight: 'Daughter learning with verified female Alimah',
    review:
      'Finding a trustworthy Quran teacher for my 8-year-old daughter who is both patient and possesses genuine Tajweed was our biggest worry. On IlmPortal, we verified the teacher’s Sanad from Wafaq-ul-Madaris before our first interaction. The camera-off default gave our family absolute peace of mind. She has now completed two Paras with genuine joy and accurate Makharij.'
  },
  {
    featured: false,
    name: 'Hamza Rizvi',
    location: 'Gulshan-e-Iqbal, Karachi',
    role: 'Cambridge O-Level Physics Student',
    rating: 5,
    highlight: 'CAIE Past Paper Problem Solving',
    review:
      'I was struggling with CAIE kinematics and paper-2 numericals. My tutor Sir Bilal explains everything on the digital whiteboard in the browser. No commuting through Shahrah-e-Faisal traffic, and I save 2 hours daily.'
  },
  {
    featured: false,
    name: 'Tariq Mehmood',
    location: 'Sector F-10, Islamabad',
    role: 'Father of Matric & Hifz students',
    rating: 5,
    highlight: 'Direct Fee Agreement & Zero Hassle',
    review:
      'The fee transparency is what impressed me most. We agreed on a fair monthly fee in chat, paid via Raast directly, and classes happen punctually every evening. Exactly what Pakistani parents need.'
  }
];

export default function Testimonials() {
  const featured = testimonials[0];
  const supporting = testimonials.slice(1);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#faf8f5] border-b border-[#ebe3d3]">
      {/* Subtle warm glow */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#d4a359]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Editorial Header */}
        <div className="max-w-2xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f0e6] border border-[#ebe3d3] text-[#0c2217] text-xs font-bold shadow-2xs">
            <Quote className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Family Voices across Pakistan</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#141c19] tracking-tight leading-[1.15]">
            Trusted by parents who wanted something better than tuition centers.
          </h2>

          <p className="text-xs sm:text-sm text-[#5c6e69] leading-relaxed">
            Real experiences from families across Lahore, Karachi, Islamabad, and nationwide studying with verified educators.
          </p>
        </div>

        {/* Asymmetric Testimonial Grid (1 Large Featured + 2 Supporting) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Featured Large Card (7 cols) */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-3xl bg-[#0c2217] text-white border border-[#d4a359]/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-6 right-6 text-7xl font-serif font-black text-white/5 select-none pointer-events-none">
              “
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40">
                  {featured.highlight}
                </span>
                <RatingStars rating={featured.rating} size="sm" />
              </div>

              <p className="text-sm sm:text-base text-[#e5f3ec] font-serif leading-relaxed italic">
                &ldquo;{featured.review}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-[#143d2b] flex items-center justify-between relative z-10">
              <div>
                <h4 className="font-bold text-sm text-white">{featured.name}</h4>
                <p className="text-xs text-[#a3b8b0]">{featured.role} &bull; {featured.location}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#d4a359] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                <span>Verified Family</span>
              </div>
            </div>
          </div>

          {/* Supporting Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {supporting.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#f5f0e6] border border-[#ebe3d3] shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ebe3d3] text-[#5e4e37]">
                      {item.highlight}
                    </span>
                    <RatingStars rating={item.rating} size="xs" />
                  </div>
                  <p className="text-xs text-[#2d3a37] leading-relaxed italic">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ebe3d3] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-[#141c19]">{item.name}</h5>
                    <p className="text-[11px] text-[#5c6e69]">{item.role} &bull; {item.location}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
