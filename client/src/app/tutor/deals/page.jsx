'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import TrialBanner from '../../../components/common/TrialBanner';
import Tutor72HourClock from '../../../components/tutor/Tutor72HourClock';
import TutorPaymentModal from '../../../components/tutor/TutorPaymentModal';
import TutorSendPaymentRequestModal from '../../../components/tutor/TutorSendPaymentRequestModal';
import TutorClearPaymentModal from '../../../components/tutor/TutorClearPaymentModal';
import LeaveReviewModal from '../../../components/common/LeaveReviewModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BookOpen, MessageSquare, Plus, Video, CheckCircle2, Check, AlertTriangle, X, Loader2, Clock, CreditCard, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function TutorDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealForPay, setSelectedDealForPay] = useState(null);
  const [dealForTuitionRequest, setDealForTuitionRequest] = useState(null);
  const [prForClearModal, setPrForClearModal] = useState(null);
  const [clearModalDeal, setClearModalDeal] = useState(null);
  const [dealToComplete, setDealToComplete] = useState(null);
  const [reviewModalDeal, setReviewModalDeal] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completing, setCompleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchDeals = async () => {
    try {
      const res = await api.getMyDeals();
      if (res.success) setDeals(res.deals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCompleteDeal = async (e) => {
    e.preventDefault();
    if (!dealToComplete || completing) return;

    const isCleared = Boolean(dealToComplete.tutorFeePaid || dealToComplete.paymentStatus === 'verified' || dealToComplete.platformFee === 0);
    if (!isCleared) {
      alert('Platform Payment Required: Please clear your platform fee or submit payment proof before marking this deal completed.');
      setSelectedDealForPay(dealToComplete);
      setDealToComplete(null);
      return;
    }

    setCompleting(true);
    setFeedback(null);
    try {
      const res = await api.completeDeal(dealToComplete._id, { notes: completionNotes.trim() });
      setDealToComplete(null);
      setCompletionNotes('');
      setFeedback({
        type: 'success',
        message: res?.message || 'Deal marked as completed! You and your student can now rate & review each other.'
      });
      await fetchDeals();
      setTimeout(() => setFeedback(null), 6000);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already')) {
        setDealToComplete(null);
        setCompletionNotes('');
        setFeedback({
          type: 'success',
          message: 'Deal is marked as completed. You and your student can now rate & review each other.'
        });
        await fetchDeals();
        setTimeout(() => setFeedback(null), 6000);
      } else if (err.message && (err.message.toLowerCase().includes('platform fee') || err.message.toLowerCase().includes('cleared'))) {
        alert(err.message);
        setSelectedDealForPay(dealToComplete);
        setDealToComplete(null);
      } else {
        alert(err.message || 'Error completing deal');
      }
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const overdueDeals = deals.filter(d => {
    const isCleared = Boolean(d.tutorFeePaid || d.paymentStatus === 'verified' || d.platformFee === 0);
    if (isCleared) return false;
    return Boolean(d.tutorFeeDueDate && new Date(d.tutorFeeDueDate) < new Date() && !d.tutorFeePaid);
  });

  return (
    <div className="py-8 bg-[#faf8f5] min-h-screen text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#143d2b] mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Deal Agreements &amp; 72h Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Student Deals &amp; Trial Monitoring
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Review active student courses, trial durations, 72-hour platform fee timers, and verified fee payments.
            </p>
          </div>

          <Link
            href="/tutor/messages"
            className="px-4 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 self-start sm:self-auto border border-[#d4a359]/30 transition-all"
          >
            <Plus className="w-4 h-4 text-[#d4a359]" />
            <span>Send New Course Offer</span>
          </Link>
        </div>

        {/* Overdue Platform Fee Warning Notice */}
        {overdueDeals.length > 0 && (
          <div className="p-5 bg-rose-50 border-2 border-rose-400 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-950 shadow-md animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif font-black text-sm text-rose-950">
                    Urgent: Platform Fee Overdue ({overdueDeals.length} {overdueDeals.length === 1 ? 'Course' : 'Courses'})
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white animate-pulse">
                    Live Classes Locked
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  The 3-day payment clearance period has expired for: {overdueDeals.map(d => `"${d.subject}" (PKR ${(d.platformFee || Math.round((d.price || 0) * 0.10)).toLocaleString()})`).join(', ')}. Live video classroom access is paused until payment is cleared.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDealForPay(overdueDeals[0])}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Platform Fee Now</span>
            </button>
          </div>
        )}

        {/* Notification / Feedback Banner */}
        {feedback && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border ${
            feedback.type === 'success'
              ? 'bg-[#f0ece1] border-[#d4a359]/40 text-[#0c2217]'
              : 'bg-[#fdf2f0] border-[#f5d6cf] text-[#b85d34]'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {deals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#e6dfd5] text-center text-xs text-stone-500 shadow-xs space-y-2">
            <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
            <p>No deals currently active. Open messages to compose a course offer for an interested student.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deals.map((deal) => (
              <div key={deal._id} className="bg-white p-6 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-4 hover:border-[#d4a359]/40 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={deal.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.student?.name || 'S')}&background=0c2217&color=faf8f5`}
                      alt="Student"
                      className="w-12 h-12 rounded-2xl object-cover border border-[#e6dfd5]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-base text-stone-900">{deal.subject}</h3>
                        {deal.status === 'completed' && (
                          <span className="px-2.5 py-0.5 bg-[#eef5f0] text-[#143d2b] border border-[#c3dfcb] rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Completed &bull; Closed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Student: <strong className="text-stone-800">{deal.student?.name}</strong> ({deal.student?.city || 'Pakistan'}) &bull; PKR {deal.price?.toLocaleString()} / {deal.priceUnit === 'per_hour' ? 'hr' : 'mo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Join Live Classroom */}
                    {deal.status !== 'completed' && deal.mode !== 'in_person' && deal.mode !== 'physical' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && (() => {
                      const isOverdue = Boolean(deal.tutorFeeDueDate && new Date(deal.tutorFeeDueDate) < new Date() && !deal.tutorFeePaid);
                      if (isOverdue) {
                        return (
                          <button
                            type="button"
                            onClick={() => setSelectedDealForPay(deal)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-xs border border-rose-300 transition-all cursor-pointer"
                            title="Live classroom is locked because the 3-day platform fee threshold has expired. Click to pay platform fee."
                          >
                            <Video className="w-4 h-4 text-rose-500" />
                            <span>Class Locked (Pay Fee)</span>
                          </button>
                        );
                      }
                      return (
                        <Link
                          href={`/classroom/${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                          className="px-3.5 py-2 rounded-xl bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] text-xs font-bold flex items-center gap-1.5 shadow-xs border border-[#d4a359]/30 transition-all cursor-pointer"
                        >
                          <Video className="w-4 h-4 text-[#d4a359]" />
                          <span>Join Live Class</span>
                        </Link>
                      );
                    })()}

                    <Link
                      href={`/tutor/messages?conversation=${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                      className="px-3.5 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#f3ede2] text-stone-700 text-xs font-semibold flex items-center gap-1.5 border border-[#e6dfd5] cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#143d2b]" />
                      <span>Chat</span>
                    </Link>

                    {/* Request Tuition Fee Button */}
                    {deal.status !== 'completed' && deal.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => setDealForTuitionRequest(deal)}
                        className="px-3.5 py-2 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Send tuition fee payment request to student with 3-day threshold"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Request Tuition Fee</span>
                      </button>
                    )}

                    {/* Mark Completed Button & Clearance Status */}
                    {deal.status !== 'completed' && deal.status !== 'cancelled' && (() => {
                      const isCleared = Boolean(deal.tutorFeePaid || deal.paymentStatus === 'verified' || deal.platformFee === 0);
                      const isInPerson = deal.mode === 'in_person' || deal.mode === 'physical';
                      const isPlatformFeeDue = isInPerson || Boolean(deal.tutorFeeDueDate);
                      const isOverdue = Boolean(deal.tutorFeeDueDate && new Date(deal.tutorFeeDueDate) < new Date() && !deal.tutorFeePaid);

                      return (
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                          {isCleared ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Payment Verified</span>
                            </span>
                          ) : deal.paymentStatus === 'submitted_proof' ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDealForPay(deal)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                              title="Payment proof submitted • Under review by admin (Click to view or update)"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                              <span>Proof Under Review</span>
                            </button>
                          ) : isPlatformFeeDue ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDealForPay(deal)}
                              className={`px-2.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                isOverdue ? 'bg-rose-600 hover:bg-rose-700 animate-pulse' : 'bg-[#0c2217] hover:bg-[#143d2b] border border-[#d4a359]/30'
                              }`}
                              title={isOverdue ? '72h Platform Fee Overdue! Click to clear payment.' : 'Submit platform fee payment proof'}
                            >
                              <CreditCard className="w-3.5 h-3.5 text-[#d4a359]" />
                              <span>{isOverdue ? 'Pay Overdue Fee' : 'Pay Platform Fee'}</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              if (!isCleared) {
                                alert(
                                  deal.paymentStatus === 'submitted_proof'
                                    ? 'Notice: Your platform payment proof has been submitted and is currently under review by administration. You can mark this deal as completed once admin verifies the payment.'
                                    : 'Notice: Platform Payment Required!\n\nYou cannot mark this deal as completed until the platform fee has been cleared. Please submit your payment proof first.'
                                );
                                setSelectedDealForPay(deal);
                                return;
                              }
                              setDealToComplete(deal);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-[1.02] ${
                              isCleared
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-400/30'
                                : 'bg-stone-100 hover:bg-amber-50 text-stone-400 border border-stone-200'
                            }`}
                            title={isCleared ? 'Mark deal completed and clear chat messages to save storage' : 'Platform payment clearance required before completing deal'}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isCleared ? 'text-white' : 'text-stone-400'}`} />
                            <span>Mark Completed</span>
                          </button>
                        </div>
                      );
                    })()}

                    {deal.status === 'completed' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {deal.isReviewed || deal.isStudentReviewed ? (
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Reviewed by Student</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs rounded-xl flex items-center gap-1 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Student Review Pending</span>
                          </span>
                        )}

                        {deal.isTutorReviewed ? (
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>You Reviewed Student ★★★★★</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReviewModalDeal(deal)}
                            className="px-2.5 py-1 bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-[#0c2217]" />
                            <span>Rate Student</span>
                          </button>
                        )}

                        <Link
                          href={`/tutor/messages?conversation=${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                          className="px-3 py-1.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>New Deal Offer</span>
                        </Link>

                        <div className="px-3 py-1.5 bg-[#f0ece1] border border-[#d4a359]/40 rounded-xl text-xs text-[#0c2217] font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>Completed &bull; Concluded</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Tuition Fee Status & Student Proof Banner */}
                {deal.status !== 'completed' && deal.latestPaymentRequest && (
                  <div className="space-y-2">
                    {deal.latestPaymentRequest.status === 'proof_submitted' ? (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <Clock className="w-5 h-5 text-amber-600 animate-pulse shrink-0 mt-0.5 sm:mt-0" />
                          <div>
                            <div className="font-black text-amber-950 text-sm">
                              Student Submitted Tuition Payment Proof!
                            </div>
                            <p className="text-[11px] text-amber-800">
                              Amount: <strong>PKR {deal.latestPaymentRequest.amount?.toLocaleString()}</strong> &bull; Method: <strong>{deal.latestPaymentRequest.paymentProof?.method?.toUpperCase()}</strong> &bull; Trx ID: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 font-mono font-bold text-amber-900">{deal.latestPaymentRequest.paymentProof?.transactionId}</code>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPrForClearModal(deal.latestPaymentRequest);
                            setClearModalDeal(deal);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Review Proof &amp; Clear Payment</span>
                        </button>
                      </div>
                    ) : deal.latestPaymentRequest.status === 'overdue' ? (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-rose-950">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <span className="font-bold text-rose-950">3-Day Payment Threshold Expired &bull; Classes Restricted</span>
                            <p className="text-[11px] text-rose-800">Payment of PKR {deal.latestPaymentRequest.amount?.toLocaleString()} has not been cleared. Live video classes are paused.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPrForClearModal(deal.latestPaymentRequest);
                            setClearModalDeal(deal);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer shrink-0"
                        >
                          Clear Payment Manually
                        </button>
                      </div>
                    ) : deal.latestPaymentRequest.status === 'cleared' ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-950">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold">Tuition Fee Cleared (PKR {deal.latestPaymentRequest.amount?.toLocaleString()}) &bull; Classroom Unlocked</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white">
                          CLEARED
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl flex items-center justify-between gap-2 text-xs text-stone-800">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#b85d34] shrink-0" />
                          <div>
                            <span className="font-bold">Tuition Fee Requested: PKR {deal.latestPaymentRequest.amount?.toLocaleString()}</span>
                            <p className="text-[11px] text-stone-500">Student has 3 days (72 hours) to transfer fee via your receiving accounts.</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-bold uppercase">
                          Pending Student Transfer
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {deal.status !== 'completed' ? (
                  <Tutor72HourClock
                    deal={deal}
                    onPayClick={() => setSelectedDealForPay(deal)}
                  />
                ) : (
                  <div className="p-3.5 bg-[#f0ece1] border border-[#d4a359]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0c2217]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                      <div>
                        <span className="font-bold">Course Completed &bull; Concluded</span>
                        <p className="text-[11px] text-stone-600">All conversation messages and learning records remain safely preserved.</p>
                      </div>
                    </div>
                    {!deal.isTutorReviewed ? (
                      <button
                        type="button"
                        onClick={() => setReviewModalDeal(deal)}
                        className="px-3.5 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border border-[#d4a359]/30"
                      >
                        <Star className="w-3.5 h-3.5 text-[#d4a359] fill-[#d4a359]" />
                        <span>Rate &amp; Review Student</span>
                      </button>
                    ) : (
                      <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Review Published</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Tutor Platform Fee Payment Proof Modal */}
      {selectedDealForPay && (
        <TutorPaymentModal
          deal={selectedDealForPay}
          isOpen={!!selectedDealForPay}
          onClose={() => setSelectedDealForPay(null)}
          onSuccess={fetchDeals}
        />
      )}

      {/* Mark Deal Completed Confirmation Modal */}
      {dealToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#d4a359]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Mark Deal as Completed</h3>
                  <p className="text-xs text-slate-500">Course: {dealToComplete.subject}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDealToComplete(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <strong className="text-slate-900">{dealToComplete.student?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject:</span>
                  <strong className="text-slate-900">{dealToComplete.subject}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreed Fee:</span>
                  <strong className="text-[#0c2217] font-mono">PKR {dealToComplete.price?.toLocaleString()}</strong>
                </div>
              </div>

              {/* Course Completion & Review Notice Callout */}
              <div className="p-4 bg-[#f0ece1] border border-[#d4a359]/40 rounded-2xl space-y-1.5 text-[#0c2217]">
                <div className="flex items-center gap-2 font-black text-[#0c2217] text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Course Completion &amp; Mutual Review</span>
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  Marking this deal as completed will conclude the course. All messages, recordings, and learning history remain preserved, and both you and the student will be able to rate and review each other.
                </p>
              </div>

              <form onSubmit={handleCompleteDeal} className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Completion Notes / Feedback (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="e.g. Student successfully completed Quran Tajweed syllabus..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0c2217] text-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDealToComplete(null)}
                    disabled={completing}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={completing}
                    className="px-5 py-2.5 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#b85d34]/20 cursor-pointer disabled:opacity-50"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Completing Course Deal...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Complete Deal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mutual Leave Review Modal for Tutor reviewing Student */}
      {reviewModalDeal && (
        <LeaveReviewModal
          isOpen={!!reviewModalDeal}
          onClose={() => setReviewModalDeal(null)}
          deal={reviewModalDeal}
          student={reviewModalDeal.student}
          tutor={user}
          targetRole="student"
          onSuccess={async () => {
            await fetchDeals();
            setReviewModalDeal(null);
          }}
        />
      )}

      {/* Tuition Payment Request Modal (Strict 3-Day Threshold) */}
      {dealForTuitionRequest && (
        <TutorSendPaymentRequestModal
          deal={dealForTuitionRequest}
          isOpen={!!dealForTuitionRequest}
          onClose={() => setDealForTuitionRequest(null)}
          onSuccess={() => {
            fetchDeals();
            setFeedback({
              type: 'success',
              message: 'Tuition payment request sent to student with 3-day payment threshold!'
            });
            setTimeout(() => setFeedback(null), 5000);
          }}
        />
      )}

      {/* Tutor Clear Payment Modal */}
      {prForClearModal && (
        <TutorClearPaymentModal
          paymentRequest={prForClearModal}
          deal={clearModalDeal}
          isOpen={!!prForClearModal}
          onClose={() => {
            setPrForClearModal(null);
            setClearModalDeal(null);
          }}
          onSuccess={() => {
            fetchDeals();
            setFeedback({
              type: 'success',
              message: 'Tuition payment cleared successfully! Live video classes are unrestricted.'
            });
            setTimeout(() => setFeedback(null), 5000);
          }}
        />
      )}
    </div>
  );
}

