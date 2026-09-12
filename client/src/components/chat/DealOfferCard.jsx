'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, Clock, Video, Home, MapPin, CreditCard, ShieldCheck, Award, AlertTriangle, X, Star } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Tutor72HourClock from '../tutor/Tutor72HourClock';
import TutorPaymentModal from '../tutor/TutorPaymentModal';
import LeaveReviewModal from '../common/LeaveReviewModal';

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentNoticeModal, setShowPaymentNoticeModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  const isFeeCleared = Boolean(
    dealState.tutorFeePaid === true ||
    dealState.paymentStatus === 'verified' ||
    dealState.platformFee === 0
  );

  const handleComplete = async () => {
    if (!dealId) return;

    if (isTutorUser && !isFeeCleared) {
      setShowPaymentNoticeModal(true);
      return;
    }

    const ok = window.confirm(
      'Are you sure you want to mark this deal as completed?\n\nBoth you and the student will be invited to rate and review each other.'
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await api.completeDeal(dealId);
      const updated = res.deal || { ...dealState, status: 'completed' };
      setDealState(updated);
      if (onDealUpdated) onDealUpdated(updated);
      alert(res.message || 'Course marked as completed successfully! Both you and the student can now leave a review.');
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already')) {
        const updated = { ...dealState, status: 'completed' };
        setDealState(updated);
        if (onDealUpdated) onDealUpdated(updated);
        alert('Course marked as completed! Both you and the student can now leave a review.');
      } else if (err.message && (err.message.toLowerCase().includes('platform fee') || err.message.toLowerCase().includes('cleared'))) {
        setShowPaymentNoticeModal(true);
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
              Official Deal Offer
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
          {isAccepted ? 'Active Deal' : isDeclined ? 'Declined' : 'Pending Acceptance'}
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

      {/* Direct Deal Notice for Student */}
      {isPending && isStudentUser && (
        <div className="p-3 bg-[#faf8f5] border border-[#ebe3d3] rounded-2xl text-[11px] text-stone-700 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0c2217] shrink-0 mt-0.5" />
          <p className="leading-snug">
            Review the agreed tuition fee and schedule above. Accepting confirms your deal directly with your tutor.
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
            <span>{loading ? 'Accepting...' : 'Accept Deal Offer'}</span>
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

      {/* Active Deal - Notice for Student */}
      {(currentStatus === 'active_trial' || currentStatus === 'continuation_agreed') && isStudentUser && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-emerald-900">Deal Active &bull; Classes in Progress</span>
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed">
            Your tutoring arrangement is active directly with your teacher.
          </p>
        </div>
      )}

      {/* 72-Hour Grace Period Clock for Tutors */}
      {isTutorUser && ['active_trial', 'continuation_agreed', 'restricted'].includes(currentStatus) && (
        <Tutor72HourClock
          deal={dealState}
          className="text-slate-900"
        />
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
        <div className="space-y-2.5">
          <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 text-center text-xs font-bold text-stone-700 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Course Completed &bull; Concluded</span>
          </div>

          {/* Student Review Prompt / Status */}
          {isStudentUser && (
            <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-stone-800">
                    {(dealState.isStudentReviewed || dealState.isReviewed) ? 'Your Review for Teacher' : 'Rate Your Teacher'}
                  </span>
                </div>
                {(dealState.isStudentReviewed || dealState.isReviewed) ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Submitted ★★★★★</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-3 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#d4a359]/30"
                  >
                    <Star className="w-3.5 h-3.5 text-[#d4a359] fill-[#d4a359]" />
                    <span>Rate Tutor</span>
                  </button>
                )}
              </div>

              {/* Tutor's evaluation of this student if provided */}
              {dealState.isTutorReviewed && (
                <div className="p-2.5 rounded-xl bg-white border border-[#e6dfd5] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>Teacher Evaluation of You</span>
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Verified ★
                    </span>
                  </div>
                  {dealState.tutorReview?.comment && (
                    <p className="text-[11px] text-stone-600 italic">
                      &ldquo;{dealState.tutorReview.comment}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tutor Review Prompt / Status */}
          {isTutorUser && (
            <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ebe3d3] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-stone-800">
                    {dealState.isTutorReviewed ? 'Your Student Evaluation' : 'Evaluate & Review Student'}
                  </span>
                </div>
                {dealState.isTutorReviewed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Submitted ★★★★★</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-3 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#d4a359]/30"
                  >
                    <Star className="w-3.5 h-3.5 text-[#d4a359] fill-[#d4a359]" />
                    <span>Rate Student</span>
                  </button>
                )}
              </div>

              {/* Student's review of this tutor if provided */}
              {(dealState.isStudentReviewed || dealState.isReviewed) && (
                <div className="p-2.5 rounded-xl bg-white border border-[#e6dfd5] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>Student Feedback on You</span>
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Published ★
                    </span>
                  </div>
                  {dealState.studentReview?.comment && (
                    <p className="text-[11px] text-stone-600 italic">
                      &ldquo;{dealState.studentReview.comment}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tutor Action: Mark Deal Completed / Closed */}
      {isTutorUser && ['active_trial', 'continuation_agreed', 'active_paid'].includes(currentStatus) && (
        <div className="pt-2 border-t border-[#ebe3d3] space-y-2">
          {!isFeeCleared && dealState.paymentStatus === 'submitted_proof' && (
            <div className="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-2 text-xs">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <span className="text-[11px] font-bold text-amber-900 block">Payment Proof Under Review</span>
                <p className="text-[10.5px] text-amber-800 leading-snug">
                  Your payment screenshot proof has been submitted and is currently being reviewed by administration. Once verified, the &quot;Mark Completed&quot; button will become active.
                </p>
              </div>
            </div>
          )}

          {!isFeeCleared && dealState.paymentStatus !== 'submitted_proof' && (
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-2 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[11px] font-bold text-amber-900 block">Platform Fee Clearance Required</span>
                <p className="text-[10.5px] text-amber-800 leading-snug">
                  Platform fee must be cleared with administration before you can mark this deal as completed.
                </p>
              </div>
            </div>
          )}

          {isFeeCleared && (
            <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-black text-emerald-950 block">Platform Payment Verified</span>
                  <p className="text-[10.5px] text-emerald-700 leading-none">Administration cleared platform fee. You may continue your deal.</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Verified
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10.5px] text-stone-500">Course completed?</span>
            <div className="flex items-center gap-2">
              {dealState.paymentStatus === 'submitted_proof' && !isFeeCleared && (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Payment proof submitted • Click to view or update screenshot"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>Proof Under Review</span>
                </button>
              )}

              {!isFeeCleared && dealState.paymentStatus !== 'submitted_proof' && (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs border border-[#d4a359]/30"
                  title="Clear platform fee payment"
                >
                  <CreditCard className="w-3 h-3 text-[#d4a359]" />
                  <span>Pay Platform Fee</span>
                </button>
              )}

              {isFeeCleared && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Verified</span>
                </span>
              )}

              <button
                type="button"
                onClick={handleComplete}
                disabled={loading}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
                  isFeeCleared
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md ring-2 ring-emerald-400/30'
                    : 'bg-stone-100 hover:bg-amber-50 text-stone-400 border border-stone-200'
                }`}
                title={isFeeCleared ? 'Mark this deal as completed and permanently delete chat to free storage' : 'Platform payment clearance required before completing deal'}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isFeeCleared ? 'text-white' : 'text-stone-400'}`} />
                <span>Mark Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Modal when tutor clicks Mark Completed with uncleared platform payment */}
      {showPaymentNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Platform Payment Required</h4>
                  <p className="text-[11px] text-stone-500">Course: {dealState.subject}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentNoticeModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <p className="text-amber-900 font-bold leading-relaxed">
                {dealState.paymentStatus === 'submitted_proof'
                  ? 'Payment proof has been submitted and is awaiting admin verification.'
                  : 'You cannot mark this deal as completed until the platform fee has been cleared.'}
              </p>
              <p className="text-[11px] text-amber-800 leading-snug">
                {dealState.paymentStatus === 'submitted_proof'
                  ? 'Once an administrator verifies and approves your payment, you will be able to mark this deal as completed.'
                  : `Please clear your platform fee (${dealState.platformFee ? `PKR ${dealState.platformFee.toLocaleString()}` : '10% of deal'}) and submit payment proof to proceed.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowPaymentNoticeModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentNoticeModal(false);
                  setShowPaymentModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{dealState.paymentStatus === 'submitted_proof' ? 'View / Update Proof' : 'Clear Platform Fee'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutor Platform Fee Payment Modal */}
      {showPaymentModal && (
        <TutorPaymentModal
          deal={dealState}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updatedDeal) => {
            const updated = updatedDeal || { ...dealState, paymentStatus: 'submitted_proof' };
            setDealState(updated);
            if (onDealUpdated) onDealUpdated(updated);
          }}
        />
      )}

      {/* Leave Review Modal (Mutual Review) */}
      {showReviewModal && (
        <LeaveReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          deal={dealState}
          tutor={dealState.tutor}
          student={dealState.student}
          targetRole={isTutorUser ? 'student' : 'tutor'}
          onSuccess={(reviewData) => {
            const updated = isTutorUser
              ? { ...dealState, isTutorReviewed: true, tutorReview: reviewData }
              : { ...dealState, isStudentReviewed: true, isReviewed: true, studentReview: reviewData };
            setDealState(updated);
            if (onDealUpdated) onDealUpdated(updated);
          }}
        />
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
