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

export default function AccountStatusBanner({ user, role = 'student', showVerifiedState = true }) {
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

  // 2. UNDER REVIEW STATE
  if (status === 'under_review') {
    return (
      <div className="bg-orange-50 border-2 border-orange-300 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-orange-950">
                Account Placed Under Administrative Review
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-200 text-orange-900 border border-orange-300">
                Under Audit
              </span>
            </div>
            <p className="text-xs text-orange-800 leading-relaxed">
              {isTutor
                ? 'Your Sanad documents, teaching credentials, and profile are undergoing administrative verification.'
                : 'Your student account is currently undergoing a routine administrative review.'}
            </p>
            <div className="p-3 bg-white/80 rounded-2xl border border-orange-200 text-xs text-orange-900 space-y-1">
              <p className="font-bold text-[11px] text-orange-950 uppercase tracking-wider">
                Admin Review Status:
              </p>
              <p className="font-medium">
                {underReviewReason}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. WARNED STATE / ACTIVE STRIKES
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
                Official Account Policy Warning Notice
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white shadow-2xs">
                ⚠️ Strike #{warningCount}
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Administration has issued an official warning regarding conduct or policy adherence on IlmPortal. Further strikes may result in temporary or permanent profile suspension.
            </p>
          </div>
        </div>

        {/* Warning Details Log */}
        {warnings && warnings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-amber-200/80">
            <p className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">
              Recent Warning Log:
            </p>
            {warnings.slice(-2).reverse().map((w, idx) => (
              <div key={idx} className="p-3 bg-white rounded-2xl border border-amber-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black text-amber-900">{w.reason}</span>
                  {w.issuedAt && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(w.issuedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 font-medium">"{w.message}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 4. ACTIVE / GOOD STANDING STATE
  if (!showVerifiedState) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3">
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
              Good Standing
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Account verified & fully active across Pakistan LMS portal
          </p>
        </div>
      </div>
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    </div>
  );
}

