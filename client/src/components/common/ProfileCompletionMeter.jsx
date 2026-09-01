'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  AlertCircle
} from 'lucide-react';

export const calculateClientCompletion = (user, tutorProfile) => {
  if (!user) return { percentage: 0, items: [] };

  if (user.role === 'tutor') {
    const checks = [
      { key: 'name', label: 'Full Name', weight: 10, done: !!user.name?.trim() },
      { key: 'email', label: 'Verified Email', weight: 10, done: !!user.isVerified },
      { key: 'phone', label: 'Mobile Number (WhatsApp)', weight: 10, done: !!user.phone?.trim() },
      { key: 'avatar', label: 'Profile Picture', weight: 15, done: !!user.avatar?.trim() },
      { key: 'age', label: 'Tutor Age', weight: 10, done: !!user.age },
      { key: 'gender', label: 'Gender', weight: 5, done: !!user.gender },
      { key: 'city', label: 'City Location', weight: 10, done: !!user.city?.trim() },
      { key: 'bio', label: 'Teaching Bio & Headline', weight: 10, done: !!tutorProfile?.bio?.trim() && tutorProfile.bio.length > 20 },
      { key: 'qualifications', label: 'Educational Qualifications', weight: 10, done: !!tutorProfile?.qualifications?.trim() },
      { key: 'sanad', label: 'Sanad / Degree Document', weight: 10, done: Array.isArray(tutorProfile?.sanadDocuments) && tutorProfile.sanadDocuments.length > 0 }
    ];

    const percentage = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return { percentage, items: checks };
  } else {
    // Student
    const checks = [
      { key: 'name', label: 'Student Name', weight: 15, done: !!user.name?.trim() },
      { key: 'email', label: 'Verified Email', weight: 15, done: !!user.isVerified },
      { key: 'phone', label: 'Contact Phone Number', weight: 15, done: !!user.phone?.trim() || !!user.guardianPhone?.trim() },
      { key: 'avatar', label: 'Profile Picture', weight: 15, done: !!user.avatar?.trim() },
      { key: 'age', label: 'Student Age', weight: 15, done: !!user.age },
      { key: 'gender', label: 'Gender', weight: 10, done: !!user.gender },
      { key: 'city', label: 'City', weight: 15, done: !!user.city?.trim() }
    ];

    const percentage = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return { percentage, items: checks };
  }
};

export default function ProfileCompletionMeter({ user, tutorProfile, className = '' }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { percentage, items } = calculateClientCompletion(user, tutorProfile);

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  const getBarColor = (pct) => {
    if (pct >= 85) return 'from-emerald-500 to-teal-500';
    if (pct >= 60) return 'from-emerald-500 to-amber-500';
    if (pct >= 35) return 'from-amber-400 to-amber-500';
    return 'from-rose-500 to-rose-400';
  };

  const getStatusBadge = () => {
    if (percentage === 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Completed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>{percentage}% Complete</span>
      </span>
    );
  };

  return (
    <div className={`p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
            <span>Profile Strength & Completion</span>
            {getStatusBadge()}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            {completedCount} of {totalCount} profile fields provided. A complete profile increases trust and faster trial matching.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <span className="hidden sm:inline">{detailsOpen ? 'Hide Checklist' : 'View Checklist'}</span>
          {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percentage)} transition-all duration-500 shadow-xs`}
          style={{ width: `${Math.max(percentage, 5)}%` }}
        />
      </div>

      {/* Verification State Callout for Tutor */}
      {user?.role === 'tutor' && (
        <div className="pt-1">
          {tutorProfile?.verificationStatus === 'approved' ? (
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Sanad & Degree: Your profile is Approved and publicly visible on Pakistan search filters.</span>
            </div>
          ) : tutorProfile?.verificationStatus === 'rejected' ? (
            <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Application Rejected: {tutorProfile?.rejectionReason || 'Please re-upload clear educational degrees for review.'}</span>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pending Admin Review: Your uploaded degrees are currently in the verification queue before going live.</span>
            </div>
          )}
        </div>
      )}

      {/* Detailed Checklist Accordion */}
      {detailsOpen && (
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
          {items.map((item) => (
            <div
              key={item.key}
              className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between ${
                item.done
                  ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={`font-medium ${item.done ? 'font-bold' : ''}`}>{item.label}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                +{item.weight}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

