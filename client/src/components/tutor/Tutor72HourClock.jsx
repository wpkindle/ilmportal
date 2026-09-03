'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

export default function Tutor72HourClock({ deal, onPayClick, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 72,
    minutes: 0,
    seconds: 0,
    isOverdue: false,
    formatted: '72h 00m 00s'
  });

  useEffect(() => {
    if (!deal) return;

    // Calculate due date (72 hours from deal start)
    const dueDate = deal.tutorFeeDueDate
      ? new Date(deal.tutorFeeDueDate)
      : deal.trialEndDate
      ? new Date(deal.trialEndDate)
      : new Date(new Date(deal.trialStartDate || deal.continuationAgreedAt || deal.createdAt || Date.now()).getTime() + 72 * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = new Date();
      const diff = dueDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOverdue: true,
          formatted: '00h 00m 00s (Expired)'
        });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (n) => String(n).padStart(2, '0');
      setTimeLeft({
        hours,
        minutes,
        seconds,
        isOverdue: false,
        formatted: `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [deal]);

  if (!deal) return null;

  // Case 1: Platform fee paid and verified by administration
  if (deal.tutorFeePaid || deal.paymentStatus === 'verified') {
    return (
      <div className={`p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-2xs ${className}`}>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="font-bold">Platform Fee Cleared &amp; Verified</span>
            <p className="text-[11px] text-emerald-700">Full unrestricted access active for chat and video classroom.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
          Permanent Access
        </span>
      </div>
    );
  }

  // Case 2: Payment proof submitted, waiting for admin approval
  if (deal.paymentStatus === 'submitted_proof' || deal.tutorPaymentProofReference) {
    return (
      <div className={`p-3.5 bg-blue-50 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-2xs ${className}`}>
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-blue-600 animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-950">Platform Fee Proof Submitted</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                Classroom &amp; Chat Active
              </span>
            </div>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Ref/TID: <strong className="font-mono">{deal.tutorPaymentProofReference || deal.paymentProofReference}</strong> &bull; Administration is reviewing your verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Overdue (72 Hours Passed without payment) -> RESTRICTION ACTIVE!
  if (timeLeft.isOverdue && !deal.tutorFeePaid) {
    const feeDisplay = deal.platformFee ? `PKR ${deal.platformFee.toLocaleString()}` : 'Admin Custom Fee';

    return (
      <div className={`p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-950 shadow-2xs animate-in fade-in ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-rose-900">72-Hour Platform Fee Clock Expired</span>
              <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] rounded-full uppercase tracking-wider animate-pulse">
                Access Restricted
              </span>
            </div>
            <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
              The 72-hour window has passed without payment verification. <strong>Chat and video classroom are paused</strong> until the platform fee ({feeDisplay}) is cleared with admin.
            </p>
          </div>
        </div>

        {onPayClick && (
          <button
            type="button"
            onClick={onPayClick}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-all cursor-pointer hover:scale-105"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Platform Fee</span>
          </button>
        )}
      </div>
    );
  }

  // Case 4: Active within 72 Hours Grace Period -> FULL ACCESS ACTIVE!
  const feeDisplay = deal.platformFee ? `PKR ${deal.platformFee.toLocaleString()}` : 'Platform Fee';

  return (
    <div className={`p-3.5 bg-gradient-to-r from-amber-50 via-emerald-50/50 to-teal-50 border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 text-amber-900 rounded-xl shrink-0 relative">
          <Clock className="w-5 h-5 text-amber-700 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-900">72-Hour Clearance Clock:</span>
            <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-mono font-black text-xs rounded-lg shadow-2xs tracking-wider">
              ⏳ {timeLeft.formatted}
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[9px] rounded-full uppercase tracking-wider">
              Full Access Active (Chat &amp; Video)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            You have full access to chat and join live video classes during this 72-hour window. Please clear the platform fee ({feeDisplay}) before the timer expires.
          </p>
        </div>
      </div>

      {onPayClick && (
        <button
          type="button"
          onClick={onPayClick}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-all cursor-pointer hover:scale-105"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Clear Fee Now</span>
        </button>
      )}
    </div>
  );
}

