'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, Clock, Video, MapPin, CreditCard, ShieldCheck, Award } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Tutor72HourClock from '../tutor/Tutor72HourClock';

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

  const handleComplete = async () => {
    if (!dealId) return;
    const ok = window.confirm(
      'Are you sure you want to mark this deal as completed?\n\nNotice: This will finalize the course and permanently delete all conversation messages between you and this student to free database storage.'
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await api.completeDeal(dealId);
      const updated = res.deal || { ...dealState, status: 'completed' };
      setDealState(updated);
      if (onDealUpdated) onDealUpdated(updated);
      alert(res.message || 'Deal marked as completed! Conversation messages have been deleted to save storage.');
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already')) {
        const updated = { ...dealState, status: 'completed' };
        setDealState(updated);
        if (onDealUpdated) onDealUpdated(updated);
        alert('Deal is marked as completed! Conversation messages have been deleted to save storage.');
      } else {
        alert(err.message || 'Error completing deal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-3 max-w-md w-full bg-gradient-to-br from-[#0c2217] via-[#143d2b] to-[#07150e] text-white rounded-3xl p-5 border border-[#d4a359]/30 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#d4a359]/20 text-[#d4a359] rounded-xl border border-[#d4a359]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4a359] block">
              Official Course Offer
            </span>
            <h4 className="font-serif font-bold text-sm text-white">{dealState.subject}</h4>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
          isAccepted
            ? 'bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40'
            : isDeclined
            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
            : 'bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/40 animate-pulse'
        }`}>
          {isAccepted ? 'Active Course' : isDeclined ? 'Declined' : 'Pending Acceptance'}
        </span>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-stone-400">Tuition Fee</span>
          <p className="font-bold text-[#d4a359] font-mono text-sm">
            PKR {dealState.price?.toLocaleString()}
            <span className="text-[10px] font-normal text-stone-400"> / {dealState.priceUnit === 'per_hour' ? 'hr' : 'mo'}</span>
          </p>
        </div>

        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-stone-400">Teaching Mode</span>
          <p className="font-bold text-stone-200 capitalize flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>{dealState.mode === 'online' ? 'Live WebRTC' : 'In-Person'}</span>
          </p>
        </div>
      </div>

      {/* Schedule Summary */}
      {(dealState.scheduleDetails || dealState.schedule) && (
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-stone-300 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Agreed Class Schedule</span>
          <p className="font-medium text-stone-200">{dealState.scheduleDetails || dealState.schedule}</p>
        </div>
      )}

      {/* 3-Day Free Trial Notice for Student */}
      {isPending && isStudentUser && (
        <div className="p-3 bg-[#0c2217]/80 border border-[#d4a359]/30 rounded-2xl text-[11px] text-[#faf8f5] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
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
            className="w-1/3 py-2.5 bg-white/10 hover:bg-white/20 text-stone-300 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleResponse('accept')}
            disabled={loading}
            className="w-2/3 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{loading ? 'Activating...' : 'Accept & Start 3-Day Trial'}</span>
          </button>
        </div>
      )}

      {/* Tutor Pending Indicator */}
      {isPending && !isStudentUser && (
        <div className="p-2.5 bg-amber-950/40 border border-[#d4a359]/30 rounded-2xl text-[11px] text-[#d4a359] text-center font-medium flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#d4a359] animate-spin" />
          <span>Offer dispatched to student. Waiting for acceptance.</span>
        </div>
      )}

      {/* Active Trial & Continuation Decision Area */}
      {currentStatus === 'active_trial' && isStudentUser && (
        <div className="p-3.5 bg-[#0c2217]/90 border border-[#d4a359]/40 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4a359] animate-ping" />
            <span className="text-xs font-bold text-[#d4a359]">Free Trial In Progress</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Are you satisfied with your trial classes? Choose whether you would like to continue regular tutoring with this teacher:
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={async () => {
                if (!confirm('Are you sure you do not wish to continue classes after the trial?')) return;
                setLoading(true);
                try {
                  const res = await api.respondToTrialContinuation(dealId, { decision: 'decline' });
                  if (res.success) {
                    setDealState(res.deal);
                    if (onDealUpdated) onDealUpdated(res.deal);
                  }
                } catch (e) {
                  alert(e.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-1/3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-stone-700"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await api.respondToTrialContinuation(dealId, { decision: 'continue' });
                  if (res.success) {
                    runConfetti();
                    setDealState(res.deal);
                    if (onDealUpdated) onDealUpdated(res.deal);
                  }
                } catch (e) {
                  alert(e.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-2/3 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Continue Regular Classes</span>
            </button>
          </div>
        </div>
      )}

      {/* 72-Hour Grace Period Clock for Tutors */}
      {isTutorUser && ['active_trial', 'continuation_agreed', 'restricted'].includes(currentStatus) && (
        <Tutor72HourClock
          deal={dealState}
          className="text-slate-900"
        />
      )}

      {/* Continuation Agreed - Notice for Student */}
      {currentStatus === 'continuation_agreed' && isStudentUser && (
        <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-2xl space-y-1.5 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
            <span className="font-bold text-amber-300">Continuation Confirmed!</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            You have chosen to continue regular classes. Live classes are active.
          </p>
        </div>
      )}

      {/* Active Paid Classes */}
      {currentStatus === 'active_paid' && (
        <div className="p-3 bg-[#0c2217]/90 rounded-2xl border border-[#d4a359]/40 text-center text-xs font-bold text-[#d4a359] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#d4a359]" />
          <span>Active Paid Classes &bull; Payment Cleared by Admin</span>
        </div>
      )}

      {/* Restricted Classes */}
      {(currentStatus === 'restricted' || dealState.accessRestricted) && (
        <div className="p-3.5 bg-rose-950/80 rounded-2xl border border-rose-500/50 text-xs text-rose-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Classroom Access Suspended</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Classes are temporarily paused pending tutor platform fee clearance with admin.
          </p>
        </div>
      )}

      {/* Course Completed / Deal Closed Indicator */}
      {currentStatus === 'completed' && (
        <div className="p-3 bg-[#0c2217]/90 rounded-2xl border border-[#d4a359]/40 text-center text-xs font-bold text-[#d4a359] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#d4a359]" />
          <span>Course Completed &bull; Deal Closed</span>
        </div>
      )}

      {/* Tutor Action: Mark Deal Completed / Closed */}
      {isTutorUser && ['active_trial', 'continuation_agreed', 'active_paid'].includes(currentStatus) && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-[10.5px] text-stone-400">Course completed?</span>
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading}
            className="px-3.5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 border border-[#d4a359]/40"
            title="Mark this deal as completed and permanently delete chat to free storage"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Mark Completed</span>
          </button>
        </div>
      )}

      {/* Declined Indicator */}
      {(isDeclined || currentStatus === 'trial_declined') && (
        <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30 text-center text-xs font-bold text-red-300 flex items-center justify-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          <span>{currentStatus === 'trial_declined' ? 'Trial concluded without continuation.' : 'This course offer was declined.'}</span>
        </div>
      )}

    </div>
  );
};

export default DealOfferCard;
