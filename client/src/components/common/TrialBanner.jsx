'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CreditCard, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

  // 1. Paid & Verified status
  if (deal.status === 'active_paid' || deal.paymentStatus === 'verified') {
    return (
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Active Course Subscription</span>
            <span className="text-emerald-700 ml-1.5">&bull; Payment Verified</span>
          </div>
        </div>
        <span className="font-mono font-bold text-emerald-800 text-[11px]">
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

  // 3. Restricted or Expired
  if (deal.accessRestricted || deal.status === 'restricted' || deal.status === 'trial_expired' || isExpired) {
    return (
      <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">Tuition Fee Payment Due</p>
            <p className="text-[11px] text-red-700">
              Submit your course fee (PKR {deal.price?.toLocaleString()}) via JazzCash / EasyPaisa / Bank to continue uninterrupted live classes.
            </p>
          </div>
        </div>

        {isStudent && onPayClick && (
          <button
            onClick={onPayClick}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Fee via JazzCash / EasyPaisa</span>
          </button>
        )}
      </div>
    );
  }

  // 4. Active Course (Student View vs Tutor View)
  if (deal.status === 'active_trial') {
    return (
      <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Active Course: {deal.subject}</span>
              {/* Tutor-only countdown timer */}
              {(isTutor || isAdmin) && timeLeft && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Trial: {timeLeft}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Fee: <strong className="text-emerald-800">PKR {deal.price?.toLocaleString()}</strong> / {deal.priceUnit === 'per_hour' ? 'hour' : 'month'} &bull; {deal.mode === 'online' ? 'Live WebRTC' : 'In-Person'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {isStudent && onPayClick && (
          <button
            onClick={onPayClick}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Fee (JazzCash / EasyPaisa)</span>
          </button>
        )}

      </div>
    );
  }

  return null;
};

export default TrialBanner;
