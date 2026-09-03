'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, Clock, Video, MapPin, CreditCard, ShieldCheck, Award } from 'lucide-react';
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
  const [certRequested, setCertRequested] = useState(false);

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

      {/* Active Trial & Continuation Decision Area */}
      {currentStatus === 'active_trial' && isStudentUser && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-300">Free Trial In Progress</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
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
              className="w-1/3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
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
              className="w-2/3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Continue Regular Classes</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Trial Indicator for Tutor */}
      {currentStatus === 'active_trial' && !isStudentUser && (
        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Free Trial Active. Awaiting student continuation decision.</span>
        </div>
      )}

      {/* Continuation Agreed - 3-day fee notice */}
      {currentStatus === 'continuation_agreed' && (
        <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-2xl space-y-1.5 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-amber-300">Continuation Confirmed by Student!</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {isTutorUser
              ? `Student selected to continue! Please clear the platform fee with administration within 3 days (due: ${dealState.tutorFeeDueDate ? new Date(dealState.tutorFeeDueDate).toLocaleDateString() : '3 days'}) to keep classroom active.`
              : 'You have chosen to continue regular classes. The administration is finalizing tutor platform clearance.'}
          </p>
        </div>
      )}

      {/* Active Paid Classes */}
      {currentStatus === 'active_paid' && (
        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Active Paid Classes &bull; Payment Cleared by Admin</span>
        </div>
      )}

      {/* Tutor Certificate Recommendation Trigger */}
      {(currentStatus === 'active_paid' || currentStatus === 'active_trial' || currentStatus === 'continuation_agreed') && isTutorUser && (
        <div className="pt-1">
          {certRequested ? (
            <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-center text-xs text-purple-200 font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Certificate recommendation dispatched to Admin!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`Recommend official completion certificate for student ${dealState.student?.name || 'this student'}?`)) return;
                setLoading(true);
                try {
                  const res = await api.tutorRequestCertificate({
                    studentId: dealState.student?._id || dealState.student,
                    subject: dealState.subject,
                    dealId: dealState._id,
                    notes: 'Completed curriculum and lessons with distinction.'
                  });
                  if (res.success) {
                    setCertRequested(true);
                    alert('Certificate recommendation submitted! Admin will assign the fee invoice.');
                  }
                } catch (e) {
                  alert(e.message || 'Error recommending certificate');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Recommend Official Certificate for Student</span>
            </button>
          )}
        </div>
      )}

      {/* Restricted Classes */}
      {(currentStatus === 'restricted' || dealState.accessRestricted) && (
        <div className="p-3.5 bg-rose-950/80 rounded-2xl border border-rose-500/50 text-xs text-rose-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Classroom Access Suspended</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Classes are temporarily paused pending tutor platform fee clearance with admin.
          </p>
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
