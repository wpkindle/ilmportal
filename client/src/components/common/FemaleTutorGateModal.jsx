'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  X,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { calculateClientCompletion } from './ProfileCompletionMeter';
import { getTutorAvatar } from '../../utils/tutorHelpers';

export default function FemaleTutorGateModal({
  isOpen,
  onClose,
  user,
  tutorName = 'Female Tutor',
  tutorAvatar
}) {
  if (!isOpen) return null;

  const { percentage, items } = calculateClientCompletion(user, null);
  const missingItems = items.filter(item => !item.done);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg md:max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#e6ded1] overflow-hidden text-slate-800 my-auto max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Landscape Grid: 2 columns on md+, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto md:overflow-visible">
          
          {/* LEFT COLUMN: Safety & Tutor Context (md:col-span-5) */}
          <div className="md:col-span-5 bg-[#faf8f5] border-b md:border-b-0 md:border-r border-[#ebe3d3] p-5 sm:p-6 flex flex-col justify-between relative">
            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden absolute top-3.5 right-3.5 p-2 text-stone-400 hover:text-[#0c2217] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 pr-8 md:pr-0">
                <div className="p-2.5 sm:p-3 bg-[#f5f0e6] border border-[#d4a359]/40 rounded-2xl text-[#b85d34] shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b85d34] bg-[#f5f0e6] px-2.5 py-0.5 rounded-full border border-[#d4a359]/30 inline-block">
                    Safety &amp; Privacy Protocol
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#0c2217] mt-0.5 font-serif leading-tight">
                    100% Profile Required
                  </h2>
                </div>
              </div>

              {/* Tutor Preview Card */}
              <div className="p-3 rounded-2xl bg-white border border-[#e6ded1] flex items-center gap-3 shadow-2xs">
                <img
                  src={getTutorAvatar(tutorAvatar ? { avatar: tutorAvatar, name: tutorName } : { name: tutorName }, tutorName)}
                  alt={tutorName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getTutorAvatar({ name: tutorName }, tutorName);
                  }}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{tutorName}</h4>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/30 rounded-full shrink-0">
                      Female Tutor
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Direct messaging is safeguarded for verified authentic learners.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
                <p>
                  To protect the privacy, dignity, and security of female tutors on IlmiDunya, learners must achieve <strong>100% profile strength</strong> before sending a message.
                </p>
                <p className="text-slate-500 hidden md:block text-[11.5px]">
                  This authentic snapshot ensures female tutors can verify your student context with confidence.
                </p>
              </div>
            </div>

            {/* Safe & Secure Bottom Note */}
            <div className="pt-3 mt-3 border-t border-[#ebe3d3] flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-[#b85d34] shrink-0" />
              <span>Safe-space verified tutoring &bull; 100% Secure</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Checklist & Actions (md:col-span-7) */}
          <div className="md:col-span-7 bg-white p-5 sm:p-6 flex flex-col justify-between">
            {/* Desktop Close Button Row */}
            <div className="hidden md:flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Your Completion Checklist</h3>
                <p className="text-[11px] text-slate-500">
                  {missingItems.length > 0
                    ? `Complete the ${missingItems.length} missing field${missingItems.length === 1 ? '' : 's'} below to reach 100%`
                    : 'Your profile is 100% complete!'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-[#0c2217] rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar Box */}
            <div className="my-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Profile Strength</span>
                <span className="font-mono font-black text-[#0c2217]">{percentage}% / 100%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0c2217] to-[#d4a359] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {missingItems.length > 0 ? (
                  <>Complete <strong>{missingItems.length} remaining field{missingItems.length === 1 ? '' : 's'}</strong> to unlock direct messaging:</>
                ) : (
                  <>Ready to connect with verified tutors!</>
                )}
              </p>
            </div>

            {/* Missing Checklist Items Scrollable List */}
            <div className="space-y-2 max-h-[190px] md:max-h-[210px] overflow-y-auto overscroll-contain pr-1">
              {missingItems.map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#faf8f5] border border-amber-200/90 flex items-center justify-between gap-3 text-xs transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{item.label}</span>
                    <span className="text-[10px] font-bold text-[#0c2217] bg-[#f0ece1] border border-[#d4a359]/30 px-1.5 py-0.5 rounded shrink-0">
                      +{item.weight}%
                    </span>
                  </div>
                  <Link
                    href={item.link}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3.5 mt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors order-2 sm:order-1 text-center cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href="/student/profile"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:scale-98 text-white rounded-xl text-xs font-black shadow-md shadow-[#b85d34]/25 flex items-center justify-center gap-2 transition-all order-1 sm:order-2 text-center cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span>Complete My Profile ({percentage}% Done)</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
