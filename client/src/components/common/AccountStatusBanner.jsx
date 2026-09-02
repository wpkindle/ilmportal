'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Ban,
  CheckCircle2,
  ShieldCheck,
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function AccountStatusBanner({ user, tutorProfile, role = 'student', showVerifiedState = true }) {
  if (!user) return null;

  const status = user.status || (user.isActive === false ? 'suspended' : 'active');
  const warningCount = user.warningCount || 0;
  const warnings = user.warnings || [];
  const underReviewReason = user.underReviewReason || 'Profile credentials & safety review in progress';
  const isTutor = role === 'tutor' || user.role === 'tutor';

  // 1. SUSPENDED STATE
  if (status === 'suspended' || status === 'deactivated' || user.isActive === false) {
    return (
      <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
            <Ban className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-rose-950">
                Account Suspended by Administration
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-200 text-rose-900 border border-rose-300">
                Suspended
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Your {isTutor ? 'tutor teaching profile' : 'student account'} has been suspended due to platform policy violations or audit restrictions.
            </p>
            {user.underReviewReason && (
              <p className="text-xs font-semibold text-rose-950 bg-white/70 p-2.5 rounded-xl border border-rose-200 mt-1">
                Reason: {user.underReviewReason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. UNDER REVIEW STATE (or Tutor awaiting profile approval)
  const isTutorUnderReview = isTutor && (
    tutorProfile?.verificationStatus === 'under_review' ||
    tutorProfile?.verificationStatus === 'pending' ||
    status === 'under_review'
  );

  if (isTutorUnderReview) {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-3xl p-4 sm:p-5 shadow-xs space-y-2">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-blue-950">
                Profile 100% Complete — Under Administrative Review
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-200 text-blue-900 border border-blue-300">
                Under Review
              </span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed font-medium">
              Your profile has been automatically submitted to the administration. Profile will be visible to the public on approval from administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. TUTOR INCOMPLETE PROFILE STATE
  const isTutorIncomplete = isTutor && tutorProfile?.verificationStatus === 'incomplete';
  if (isTutorIncomplete) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-xs space-y-2">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-amber-950">
                Profile Incomplete — Action Required
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                Incomplete
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Complete your profile 100%, then the administration will review it. Profile will be visible to public on approval from administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. WARNED STATE / ACTIVE STRIKES
  if (status === 'warned' || warningCount > 0) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-amber-950">
                Administrative Policy Warning Issued ({warningCount} Active)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                Warning Active
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              An administrator has flagged account activity requiring your attention. Please review the notices below.
            </p>
          </div>
        </div>
        {warnings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-amber-200/80">
            {warnings.map((w, idx) => (
              <div key={idx} className="p-3 bg-white/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold text-amber-950">{w.reason}</p>
                <p className="text-xs text-slate-700 font-medium">"{w.message}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 5. ACTIVE / APPROVED / GOOD STANDING STATE
  if (!showVerifiedState) return null;

  // If tutor is NOT approved yet, do NOT render verified faculty state
  if (isTutor && tutorProfile?.verificationStatus !== 'approved') {
    return null;
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-emerald-950">
              {isTutor ? 'Verified Faculty Account' : 'Verified Student Account'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-200/80 text-emerald-900">
              Approved & Live
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            {isTutor
              ? 'Your profile is approved by administration and publicly visible to students across Pakistan.'
              : 'Account verified & fully active across Pakistan LMS portal'}
          </p>
        </div>
      </div>
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    </div>
  );
}

