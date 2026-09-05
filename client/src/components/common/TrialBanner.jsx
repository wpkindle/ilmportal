'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CreditCard, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Tutor72HourClock from '../tutor/Tutor72HourClock';

const TrialBanner = ({ deal, onPayClick }) => {
  const { isStudent, isTutor, isAdmin } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deal?.trialEndDate || deal.status !== 'active_trial') return;

    const calculateTime = () => {
      const diff = new Date(deal.trialEndDate) - new Date();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Trial Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m remaining`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [deal]);

  if (!deal) return null;

  // Completed status
  if (deal.status === 'completed') {
    return (
      <div className="p-3 bg-[#f0ece1] rounded-2xl border border-[#d4a359]/40 flex items-center justify-between text-xs text-[#0c2217] shadow-2xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
          <div>
            <span className="font-bold">Course Completed</span>
            <span className="text-[#0c2217]/80 ml-1.5">&bull; Deal Concluded</span>
          </div>
        </div>
      </div>
    );
  }

  // If viewed by tutor, show the dedicated 72-hour clearance clock & access status
  if (isTutor) {
    return <Tutor72HourClock deal={deal} onPayClick={onPayClick} />;
  }

  // 1. Paid & Verified status
  if (deal.status === 'active_paid' || deal.paymentStatus === 'verified') {
    return (
      <div className="p-3 bg-[#f0ece1] rounded-2xl border border-[#d4a359]/40 flex items-center justify-between text-xs text-[#0c2217] shadow-2xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0c2217] shrink-0" />
          <div>
            <span className="font-bold">Active Course Subscription</span>
            <span className="text-[#0c2217]/80 ml-1.5">&bull; Payment Verified</span>
          </div>
        </div>
        <span className="font-mono font-bold text-[#0c2217] text-[11px]">
          PKR {deal.price?.toLocaleString()} / {deal.priceUnit === 'per_hour' ? 'hr' : 'mo'}
        </span>
      </div>
    );
  }

  // 2. Submitted Payment Proof pending admin approval
  if (deal.paymentStatus === 'submitted_proof') {
    return (
      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 flex items-center justify-between text-xs text-blue-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
          <div>
            <span className="font-bold">Payment Proof Submitted ({deal.paymentMethod?.toUpperCase() || 'JazzCash'})</span>
            <p className="text-[11px] text-blue-700">TID: {deal.paymentProofReference} &bull; Admin verification in progress</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Restricted or Expired (after 72h overdue)
  if (deal.accessRestricted || deal.status === 'restricted' || deal.status === 'trial_expired' || isExpired) {
    const feeText = deal.platformFee !== null && deal.platformFee !== undefined
      ? `PKR ${deal.platformFee.toLocaleString()}`
      : 'Contact Admin';

    return (
      <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold text-rose-900">
              {isTutor ? '72-Hour Platform Fee Clearance Expired' : 'Classroom Access Paused'}
            </p>
            <p className="text-[11px] text-rose-700">
              {isTutor
                ? `The 72-hour grace period expired without payment clearance. Please submit the platform fee (${feeText}) to reactivate live classes.`
                : 'Live classes are paused pending tutor platform clearance with administration. Official Support: contact@ilmidunya.pk.'}
            </p>
          </div>
        </div>

        {isTutor && onPayClick && (
          <button
            onClick={onPayClick}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Platform Fee</span>
          </button>
        )}
      </div>
    );
  }

  // 4. Continuation Agreed - Platform fee due within 72 hours (Classes remain 100% active!)
  if (deal.status === 'continuation_agreed') {
    const feeText = deal.platformFee !== null && deal.platformFee !== undefined
      ? `PKR ${deal.platformFee.toLocaleString()}`
      : 'Admin Fee Pending';

    return (
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-amber-900">
                {isTutor ? 'Student Agreed to Continue - Platform Fee Due' : 'Course Continuation Confirmed'}
              </p>
              <span className="px-2 py-0.5 bg-[#0c2217] text-[#d4a359] border border-[#0c2217] font-bold text-[9px] rounded-full uppercase tracking-wider">
                Video Classroom Active
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              {isTutor
                ? `Student agreed to continue! Classes are active with a 72-hour grace window. Please submit the platform fee (${feeText}) within 72 hours.`
                : `You agreed to continue regular learning for ${deal.subject}. Live video classroom is active.`}
            </p>
          </div>
        </div>

        {isTutor && onPayClick && (
          <button
            onClick={onPayClick}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Platform Fee</span>
          </button>
        )}
      </div>
    );
  }

  // 5. Active Trial
  if (deal.status === 'active_trial') {
    return (
      <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#d4a359]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#0c2217] text-[#d4a359] rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">
                {isStudent ? 'Complimentary 3-Day Free Trial' : `Active Course Trial: ${deal.subject}`}
              </span>
              {timeLeft && (
                <span className="px-2 py-0.5 rounded-full bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/30 font-bold text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0c2217]" />
                  <span>{timeLeft}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              {isStudent
                ? `Free trial classes active. Decide whether to continue anytime during your trial.`
                : `Agreed Fee: PKR ${deal.price?.toLocaleString()} / ${deal.priceUnit === 'per_hour' ? 'hr' : 'mo'} &bull; ${deal.mode === 'online' ? 'Live WebRTC' : 'In-Person'}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
