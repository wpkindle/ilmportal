import React from 'react';
import { Search, MessageSquare, Video, CreditCard, ShieldCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Find a Tutor',
    description: 'Search verified Quran teachers and school tutors for your subject, class, and city.',
    icon: Search
  },
  {
    step: '02',
    title: 'Chat & Agree on Fee',
    description: 'Message tutors for free to discuss class timings and agree on a fair hourly or monthly fee.',
    icon: MessageSquare
  },
  {
    step: '03',
    title: 'Start Live Classes',
    description: 'Join 1-on-1 video lessons right in your browser with screen sharing and digital Quran.',
    icon: Video
  },
  {
    step: '04',
    title: 'Easy Payments',
    description: 'Pay easily using EasyPaisa, JazzCash, or bank transfer with quick confirmation.',
    icon: CreditCard
  }
];

const stepColors = [
  { glow: 'from-emerald-500/20 to-transparent', border: 'border-emerald-500/30', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', numText: 'text-emerald-400/80 group-hover:text-emerald-300' },
  { glow: 'from-teal-500/20 to-transparent', border: 'border-teal-500/30', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30', numText: 'text-teal-400/80 group-hover:text-teal-300' },
  { glow: 'from-purple-500/20 to-transparent', border: 'border-purple-500/30', iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', numText: 'text-purple-400/80 group-hover:text-purple-300' },
  { glow: 'from-amber-500/20 to-transparent', border: 'border-amber-500/30', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', numText: 'text-amber-400/80 group-hover:text-amber-300' }
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-honeycomb-dark text-white border-b border-emerald-950/80">
      {/* Unique Background Effect Layer 1: Ambient Cyber Aurora Glows */}
      <div className="absolute -top-32 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Unique Background Effect Layer 2: Connecting Flow Circuit Path (Desktop) */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 pointer-events-none hidden lg:block -translate-y-12">
        <svg className="w-full h-8" preserveAspectRatio="none">
          <line
            x1="10%"
            y1="50%"
            x2="90%"
            y2="50%"
            stroke="rgba(16, 185, 129, 0.25)"
            strokeWidth="2"
            strokeDasharray="8 8"
            style={{ animation: 'dashFlow 3s linear infinite' }}
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-4 py-1.5 rounded-full border border-emerald-800 shadow-lg inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Simple 4 Steps</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Start learning with a verified teacher in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const styling = stepColors[idx % stepColors.length];
            return (
              <div
                key={idx}
                className={`bg-slate-900/90 backdrop-blur-xs p-6 rounded-3xl border ${styling.border} shadow-xl space-y-4 relative overflow-hidden group hover:scale-105 hover:border-emerald-400/60 transition-all duration-300`}
              >
                {/* Radial Glow on Top of Card */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${styling.glow} rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform`} />

                <span className={`absolute top-4 right-4 text-3xl font-black font-mono select-none transition-colors duration-200 ${styling.numText}`}>
                  {s.step}
                </span>
                <div className={`p-3.5 w-fit rounded-2xl border ${styling.iconBg} shadow-inner`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base text-white group-hover:text-emerald-300 transition-colors">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
