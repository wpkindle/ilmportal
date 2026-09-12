'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Ban,
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

  // 2. WARNED STATE / ACTIVE STRIKES
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
  // Active accounts in good standing do not require a status banner
  return null;
}

