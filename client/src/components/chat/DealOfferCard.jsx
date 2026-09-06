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
    <div className="my-3 max-w-md w-full bg-white text-[#141c19] rounded-3xl p-5 border-2 border-[#d4a359]/60 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ebe3d3]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#f5f0e6] text-[#b85d34] rounded-xl border border-[#d4a359]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#b85d34] block">
              Official Course Offer
            </span>
            <h4 className="font-serif font-bold text-sm text-[#0c2217]">{dealState.subject}</h4>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
          isAccepted
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
            : isDeclined
            ? 'bg-rose-50 text-rose-800 border border-rose-300'
            : 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
        }`}>
          {isAccepted ? 'Active Course' : isDeclined ? 'Declined' : 'Pending Acceptance'}
        </span>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-stone-500">Tuition Fee</span>
          <p className="font-bold text-[#0c2217] font-mono text-sm">
            PKR {dealState.price?.toLocaleString()}
            <span className="text-[10px] font-normal text-stone-500"> / {dealState.priceUnit === 'per_hour' ? 'hr' : 'mo'}</span>
          </p>
        </div>

        <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-stone-500">Teaching Mode</span>
          <p className="font-bold text-[#0c2217] flex items-center gap-1">
            {dealState.mode === 'online' ? (
              <>
                <Video className="w-3.5 h-3.5 text-[#b85d34]" />
                <span>Online Video</span>
              </>
            ) : (
              <>
                <Home className="w-3.5 h-3.5 text-[#b85d34]" />
                <span>In-Person</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Schedule Box */}
      {(dealState.scheduleDetails || dealState.schedule) && (
        <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] text-xs text-stone-700 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">Agreed Class Schedule</span>
          <p className="font-medium text-stone-800">{dealState.scheduleDetails || dealState.schedule}</p>
        </div>
      )}

      {/* 3-Day Free Trial Notice for Student */}
      {isPending && isStudentUser && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-2xl text-[11px] text-emerald-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
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
            className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleResponse('accept')}
            disabled={loading}
            className="w-2/3 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{loading ? 'Activating...' : 'Accept & Start 3-Day Trial'}</span>
          </button>
        </div>
      )}

      {/* Tutor Pending Indicator */}
      {isPending && !isStudentUser && (
        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-2xl text-[11px] text-amber-900 text-center font-medium flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
          <span>Offer dispatched to student. Waiting for acceptance.</span>
        </div>
      )}

      {/* Active Trial & Continuation Decision Area */}
      {currentStatus === 'active_trial' && isStudentUser && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            <span className="text-xs font-bold text-amber-900">Free Trial In Progress</span>
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed">
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
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1.5 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-emerald-900">Continuation Confirmed!</span>
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed">
            You have chosen to continue regular classes. Live classes are active.
          </p>
        </div>
      )}

      {/* Active Paid Classes */}
      {currentStatus === 'active_paid' && (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 text-center text-xs font-bold text-emerald-900 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Active Paid Classes &bull; Payment Cleared by Admin</span>
        </div>
      )}

      {/* Restricted Classes */}
      {(currentStatus === 'restricted' || dealState.accessRestricted) && (
        <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-300 text-xs text-rose-950 space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Classroom Access Suspended</span>
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed">
            Classes are temporarily paused pending tutor platform fee clearance with admin.
          </p>
        </div>
      )}

      {/* Course Completed / Deal Closed Indicator */}
      {currentStatus === 'completed' && (
        <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 text-center text-xs font-bold text-stone-700 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Course Completed &bull; Deal Closed</span>
        </div>
      )}

      {/* Tutor Action: Mark Deal Completed / Closed */}
      {isTutorUser && ['active_trial', 'continuation_agreed', 'active_paid'].includes(currentStatus) && (
        <div className="pt-2 border-t border-[#ebe3d3] flex items-center justify-between gap-3">
          <span className="text-[10.5px] text-stone-500">Course completed?</span>
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading}
            className="px-3.5 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Mark this deal as completed and permanently delete chat to free storage"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
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
