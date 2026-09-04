'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import TrialBanner from '../../../components/common/TrialBanner';
import Tutor72HourClock from '../../../components/tutor/Tutor72HourClock';
import TutorPaymentModal from '../../../components/tutor/TutorPaymentModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BookOpen, MessageSquare, Plus, Video, CheckCircle2, Check, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function TutorDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealForPay, setSelectedDealForPay] = useState(null);
  const [dealToComplete, setDealToComplete] = useState(null);
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
    if (!dealToComplete) return;

    setCompleting(true);
    setFeedback(null);
    try {
      const res = await api.completeDeal(dealToComplete._id, { notes: completionNotes.trim() });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Deal marked as completed. Conversation messages removed to free storage.'
        });
        setDealToComplete(null);
        setCompletionNotes('');
        await fetchDeals();
        setTimeout(() => setFeedback(null), 6000);
      } else {
        alert(res.message || 'Failed to complete deal');
      }
    } catch (err) {
      alert(err.message || 'Error completing deal');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading deals..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Student Deals & Trial Monitoring</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review active student courses, trial durations, and verified fee payments.
            </p>
          </div>

          <Link
            href="/tutor/messages"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Send New Course Offer</span>
          </Link>
        </div>

        {/* Notification / Feedback Banner */}
        {feedback && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
          <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center text-xs text-slate-400">
            No deals currently active. Open messages to compose a course offer for an interested student.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deals.map((deal) => (
              <div key={deal._id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={deal.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.student?.name || 'S')}&background=059669&color=fff`}
                      alt="Student"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900">{deal.subject}</h3>
                        {deal.status === 'completed' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Completed &bull; Closed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Student: <strong>{deal.student?.name}</strong> ({deal.student?.city || 'Pakistan'}) &bull; PKR {deal.price?.toLocaleString()} / {deal.priceUnit === 'per_hour' ? 'hr' : 'mo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {deal.status !== 'completed' && deal.mode !== 'in_person' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && (deal.tutorFeePaid || !deal.tutorFeeDueDate || new Date(deal.tutorFeeDueDate) >= new Date() || (deal.trialEndDate && new Date(deal.trialEndDate) >= new Date())) && (
                      <Link
                        href={`/classroom/${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Live Class</span>
                      </Link>
                    )}

                    {deal.status !== 'completed' && (
                      <Link
                        href={`/tutor/messages?conversation=${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Open Chat</span>
                      </Link>
                    )}

                    {/* Mark Deal Closed / Completed Action */}
                    {deal.status !== 'completed' && deal.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => setDealToComplete(deal)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
                        title="Mark this deal as closed and clear chat to free storage"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark Deal Completed</span>
                      </button>
                    )}

                    {deal.status === 'completed' && (
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Storage Cleared</span>
                      </div>
                    )}
                  </div>
                </div>

                {deal.status !== 'completed' && (
                  <Tutor72HourClock
                    deal={deal}
                    onPayClick={() => setSelectedDealForPay(deal)}
                  />
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
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
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
                  <strong className="text-emerald-700 font-mono">PKR {dealToComplete.price?.toLocaleString()}</strong>
                </div>
              </div>

              {/* Database Storage Notice Callout */}
              <div className="p-4 bg-amber-50 border border-amber-300/80 rounded-2xl space-y-1.5 text-amber-950">
                <div className="flex items-center gap-2 font-black text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Important: Chat Conversation Cleanup</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Marking this deal as completed will close the course. To optimize database storage, <strong>all chat messages, audio recordings, and file attachments between you and this student will be permanently deleted</strong>.
                </p>
                <p className="text-[10.5px] text-amber-700">
                  This action cannot be undone. Please ensure you have concluded your correspondence.
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-xs resize-none"
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
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Completing Deal &amp; Cleaning Storage...</span>
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
    </div>
  );
}

