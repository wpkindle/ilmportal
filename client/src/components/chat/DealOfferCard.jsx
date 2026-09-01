'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, Clock, Video, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const runConfetti = async () => {
  if (typeof window !== 'undefined') {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log(e);
    }
  }
};

const DealOfferCard = ({ deal, onDealUpdated }) => {
  const { user, isStudent: authIsStudent, isTutor: authIsTutor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dealState, setDealState] = useState(deal);

  useEffect(() => {
    if (deal) {
      setDealState(deal);
    }
  }, [deal]);

  if (!dealState) return null;

  const dealId = dealState._id || dealState.dealId || dealState.id;
  const currentStatus = dealState.status || 'pending_offer';

  const isPending = currentStatus === 'pending_offer';
  const isAccepted = currentStatus === 'active_trial' || currentStatus === 'active_paid';
  const isDeclined = currentStatus === 'declined' || currentStatus === 'cancelled';

  // Determine if viewer is the student
  const currentUserId = user?._id || user?.id;
  const isStudentUser = authIsStudent || user?.role === 'student' || (dealState.student && (dealState.student === currentUserId || dealState.student?._id === currentUserId));
  const isTutorUser = authIsTutor || user?.role === 'tutor';

  const handleResponse = async (action) => {
    if (!dealId) {
      alert('Deal identifier not found.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.respondToDeal(dealId, action);
      if (res.success) {
        setDealState(res.deal);
        if (onDealUpdated) onDealUpdated(res.deal);

        if (action === 'accept') {
          runConfetti();
        }
      }
    } catch (err) {
      alert(err.message || 'Error responding to deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-3 max-w-md w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-emerald-500/30 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
              Official Course Offer
            </span>
            <h4 className="font-black text-sm text-white">{dealState.subject}</h4>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
          isAccepted
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : isDeclined
            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
        }`}>
          {isAccepted ? 'Active Course' : isDeclined ? 'Declined' : 'Pending Acceptance'}
        </span>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tuition Fee</span>
          <p className="font-bold text-emerald-300 font-mono text-sm">
            PKR {dealState.price?.toLocaleString()}
            <span className="text-[10px] font-normal text-slate-400"> / {dealState.priceUnit === 'per_hour' ? 'hr' : 'mo'}</span>
          </p>
        </div>

        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Teaching Mode</span>
          <p className="font-bold text-slate-200 capitalize flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>{dealState.mode === 'online' ? 'Live WebRTC' : 'In-Person'}</span>
          </p>
        </div>
      </div>

      {/* Schedule Summary */}
      {(dealState.scheduleDetails || dealState.schedule) && (
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Agreed Class Schedule</span>
          <p className="font-medium text-slate-200">{dealState.scheduleDetails || dealState.schedule}</p>
        </div>
      )}

      {/* 3-Day Free Trial Notice for Student */}
      {isPending && isStudentUser && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-200 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Accepting unlocks your <strong>3-Day Free Trial</strong> immediately. No payment is required until you complete your trial classes.
          </p>
        </div>
      )}

      {/* Action Buttons for Student */}
      {isPending && isStudentUser && (
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleResponse('decline')}
            disabled={loading}
            className="w-1/3 py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleResponse('accept')}
            disabled={loading}
            className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{loading ? 'Activating...' : 'Accept & Start 3-Day Trial'}</span>
          </button>
        </div>
      )}

      {/* Tutor Pending Indicator */}
      {isPending && !isStudentUser && (
        <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300 text-center font-medium flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Offer dispatched to student. Waiting for acceptance.</span>
        </div>
      )}

      {/* Active Course Indicator */}
      {isAccepted && (
        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Course Agreement Active & Free Trial In Progress</span>
        </div>
      )}

      {/* Declined Indicator */}
      {isDeclined && (
        <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30 text-center text-xs font-bold text-red-300 flex items-center justify-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          <span>This course offer was declined.</span>
        </div>
      )}

    </div>
  );
};

export default DealOfferCard;
