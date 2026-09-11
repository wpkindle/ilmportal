'use client';

import React, { useState } from 'react';
import { Star, X, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { getTutorAvatar } from '../../utils/tutorHelpers';

const runConfetti = async () => {
  if (typeof window !== 'undefined') {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log(e);
    }
  }
};

const RATING_DESCRIPTIONS = {
  5: '⭐⭐⭐⭐⭐ Outstanding & Highly Recommended',
  4: '⭐⭐⭐⭐ Very Good & Engaging',
  3: '⭐⭐⭐ Good & Satisfactory',
  2: '⭐⭐ Fair & Needs Improvement',
  1: '⭐ Disappointing'
};

const QUICK_TAGS = [
  'Punctual & Patient',
  'Excellent Tajweed',
  'Clear Explanations',
  'Great with Kids',
  'Polite & Professional',
  'Thorough Homework Guidance'
];

export default function LeaveReviewModal({
  isOpen,
  onClose,
  deal,
  tutor,
  onSuccess
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Resolve tutor information
  const resolvedTutor = tutor || deal?.tutor;
  const tutorName = resolvedTutor?.name || 'Your Tutor';
  const tutorId = resolvedTutor?._id || resolvedTutor?.id || (typeof resolvedTutor === 'string' ? resolvedTutor : null);
  const dealId = deal?._id || deal?.id;
  const courseSubject = deal?.subject || 'Tutoring Course';
  const avatarUrl = getTutorAvatar(resolvedTutor || {}, tutorName);

  const activeRating = hoverRating || rating;

  const handleAddTag = (tag) => {
    setComment((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes(tag)) return trimmed;
      return `${trimmed}, ${tag}`;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating) {
      setError('Please select a star rating from 1 to 5.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        rating: Number(rating),
        comment: comment.trim(),
        dealId: dealId || undefined,
        tutorId: tutorId || undefined
      };

      const res = await api.createReview(payload);
      if (res && res.success) {
        setSubmitted(true);
        if (rating >= 4) {
          runConfetti();
        }
        if (onSuccess) {
          onSuccess(res.review || { rating, comment, dealId, tutorId });
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        throw new Error(res?.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error posting review:', err);
      setError(err.message || 'Error submitting review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 text-stone-900 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Review Published! 🎉
            </h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Thank you! Your verified student feedback and <strong className="text-emerald-800">{rating} ★ rating</strong> have been applied to <strong className="text-stone-800">{tutorName}</strong>&apos;s public profile.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Header with Tutor Info */}
            <div className="flex items-center gap-3 pr-8 pb-3 border-b border-stone-100">
              <img
                src={avatarUrl}
                alt={tutorName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#d4a359]/40 shrink-0 bg-stone-100"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#b85d34] block">
                  Course Completed Review
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate">
                  {tutorName}
                </h3>
                <p className="text-[11px] text-stone-500 truncate">
                  Subject: <span className="font-medium text-stone-700">{courseSubject}</span>
                </p>
              </div>
            </div>

            {/* Star Rating Interactive Selector */}
            <div className="space-y-1.5 text-center bg-[#faf8f5] p-3.5 rounded-2xl border border-[#ebe3d3]">
              <span className="text-[11px] font-bold text-stone-700 block">
                How would you rate your experience?
              </span>

              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-hidden"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                            : 'text-stone-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] font-semibold text-[#0c2217] transition-all min-h-[16px]">
                {RATING_DESCRIPTIONS[activeRating] || ''}
              </p>
            </div>

            {/* Quick Feedback Chips */}
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-stone-500 block">
                Quick Tags (Click to add)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="text-[10.5px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-[#faf8f5] hover:border-[#d4a359] text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Comment Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                Your Written Feedback <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding Quran Tajweed clarity, punctuality, concept explanations, or general teaching attitude..."
                className="w-full p-3 bg-[#faf8f5] border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-[#0c2217] focus:bg-white transition-all resize-none"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Maybe Later
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-[#d4a359]/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{loading ? 'Submitting...' : 'Post Review & Rate'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

