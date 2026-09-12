'use client';

import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ReportReviewModal({ review, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('inaccurate_info');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !review) return null;

  const reasonOptions = [
    { value: 'inaccurate_info', label: 'Inaccurate or false statements' },
    { value: 'no_lessons', label: 'No tuition classes ever took place' },
    { value: 'abusive_language', label: 'Abusive, vulgar, or offensive language' },
    { value: 'harassment', label: 'Harassment, threats, or extortion' },
    { value: 'spam_conflict', label: 'Spam, promotional, or conflicting review' },
    { value: 'other', label: 'Other violation of community guidelines' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to report this review.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedOption = reasonOptions.find((r) => r.value === reason);
      const categoryLabel = selectedOption ? selectedOption.label : reason;

      const res = await api.reportReview(review._id, {
        reason: categoryLabel,
        details: details.trim()
      });

      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess(review._id);
          onClose();
          setSuccess(false);
          setDetails('');
        }, 1800);
      } else {
        setError(res?.message || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#07150e] text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-300 shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Report Review to Admin
              </h2>
              <p className="text-[11px] text-slate-300">
                Community Trust &amp; Moderation
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Report Submitted to Administration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Thank you. Platform administrators have been alerted and will investigate this review. If verified, the review will be moderated or removed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Review Quote preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Review by <strong>{review.student?.name || review.reviewer?.name || 'User'}</strong></span>
                  <span className="font-bold text-amber-700">{review.rating} ★</span>
                </div>
                {review.comment ? (
                  <p className="text-slate-700 italic text-[11px] line-clamp-2">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">No written comment provided.</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Reason for Reporting <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2217]"
                >
                  {reasonOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Explanation Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Additional Details &amp; Context
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explain why this review is inaccurate or inappropriate so admin can verify..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2217]"
                />
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  Admin will review this submission against chat history and attendance logs to ensure fairness for both teachers and students.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="xs" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
