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
      'Finding a trustworthy Quran teacher for my 8-year-old daughter who is both patient and possesses genuine Tajweed was our biggest worry. On IlmiDunya, we verified the teacher’s Sanad from Wafaq-ul-Madaris before our first interaction. The camera-off default gave our family absolute peace of mind. She has now completed two Paras with genuine joy and accurate Makharij.'
  },
  {
    featured: false,
    name: 'Hamza Rizvi',
    location: 'Gulshan-e-Iqbal, Karachi',
    role: 'Board Physics & Mathematics Student',
    rating: 5,
    highlight: 'Board Exam Past Paper Problem Solving',
    review:
      'I was struggling with Board kinematics and physics numericals. My tutor Sir Bilal explains everything on the digital whiteboard in the browser. No commuting through Shahrah-e-Faisal traffic, and I save 2 hours daily.'
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
    <section className="py-16 sm:py-24 relative overflow-hidden bg-section-testimonials border-b border-[#ebe3d3]">
      {/* Soft, static ambient glow */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#6366f1]/3 rounded-full blur-[140px] pointer-events-none" />

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
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-3xl bg-white text-[#141c19] border-2 border-[#d4a359]/50 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-6 right-6 text-7xl font-serif font-black text-[#d4a359]/15 select-none pointer-events-none">
              “
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#f5f0e6] text-[#b85d34] border border-[#d4a359]/50 shadow-2xs">
                  {featured.highlight}
                </span>
                <RatingStars rating={featured.rating} size="sm" />
              </div>

              <p className="text-sm sm:text-base text-[#2c4035] font-serif leading-relaxed italic">
                &ldquo;{featured.review}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-[#ebe3d3] flex items-center justify-between relative z-10">
              <div>
                <h4 className="font-bold text-sm text-[#0c2217]">{featured.name}</h4>
                <p className="text-xs text-[#4a5e55]">{featured.role} &bull; {featured.location}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#059669] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
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
