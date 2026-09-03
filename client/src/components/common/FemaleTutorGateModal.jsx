'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  X,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { calculateClientCompletion } from './ProfileCompletionMeter';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Safety &amp; Privacy Protocol
              </span>
              <h2 className="text-lg font-black text-white mt-1">
                100% Profile Strength Required
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Tutor Info Preview */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
            <img
              src={tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`}
              alt={tutorName}
              className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 truncate">{tutorName}</h4>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Female Tutor
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Direct messaging is safeguarded for verified, authentic learners.
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
            <p>
              To protect the privacy, dignity, and safety of female tutors on IlmPortal, students must achieve a <strong>100% complete profile</strong> before sending a message request.
            </p>
            <p className="text-slate-500">
              Once your profile reaches 100%, you can submit a message request introducing yourself and your study goals.
            </p>
          </div>

          {/* Completion Progress Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Your Current Profile Strength</span>
              <span className="font-mono font-black text-emerald-700">{percentage}% / 100%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(percentage, 5)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Complete the remaining <strong>{missingItems.length} field(s)</strong> below to unlock access:
            </p>
          </div>

          {/* Missing Checklist Items */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Missing Profile Settings ({missingItems.length})</span>
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {missingItems.map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-xl bg-white border border-amber-200/90 flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{item.label}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                      +{item.weight}%
                    </span>
                  </div>
                  <Link
                    href={item.link}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors shrink-0"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors"
          >
            Cancel
          </button>
          <Link
            href="/student/profile"
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Complete My Profile ({percentage}% Done)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
