'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import TrialBanner from '../../../components/common/TrialBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BookOpen, Star, MessageSquare, CreditCard, X, CheckCircle2, Video } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function MyDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Review Modal State
  const [reviewModalDeal, setReviewModalDeal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalDeal) return;

    setSubmittingReview(true);
    try {
      const res = await api.createReview({
        tutorId: reviewModalDeal.tutor?._id || reviewModalDeal.tutor,
        dealId: reviewModalDeal._id,
        rating: Number(rating),
        comment: comment.trim()
      });
      if (res.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModalDeal(null);
          setReviewSuccess(false);
          setComment('');
        }, 2000);
      }
    } catch (err) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your course deals..." />;

  const filteredDeals = filter === 'all'
    ? deals
    : deals.filter(d => d.status === filter);

  return (
    <div className="py-8 bg-[#faf8f5] min-h-screen text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#143d2b] mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Agreements &amp; Subscriptions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              My Tutoring Courses &amp; Subscriptions
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Review active courses, trial periods, verified fee receipts, and submit reviews for your teachers.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#ede7de] p-1.5 rounded-2xl text-xs font-semibold overflow-x-auto border border-[#e0d6c8] scrollbar-none">
            {['all', 'active_trial', 'active_paid', 'completed', 'restricted'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl capitalize transition-all whitespace-nowrap text-xs ${
                  filter === f ? 'bg-[#0c2217] text-[#faf8f5] font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {f === 'active_trial' ? 'Active Trial' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#e6dfd5] text-center text-xs text-stone-500 shadow-xs space-y-2">
            <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
            <p>No course agreements found matching the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDeals.map((deal) => (
              <div key={deal._id} className="bg-white p-6 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-4 hover:border-[#d4a359]/40 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={deal.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.tutor?.name || 'T')}&background=0c2217&color=faf8f5`}
                      alt="Tutor"
                      className="w-12 h-12 rounded-2xl object-cover border border-[#e6dfd5]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-base text-stone-900">{deal.subject}</h3>
                        {deal.status === 'completed' && (
                          <span className="px-2.5 py-0.5 bg-[#eef5f0] text-[#143d2b] border border-[#c3dfcb] rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Course Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Tutor: <strong className="text-stone-800">{deal.tutor?.name}</strong> &bull; Mode: <span className="capitalize text-[#143d2b] font-medium">{deal.mode}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {deal.status !== 'completed' && deal.mode !== 'in_person' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && !deal.accessRestricted && (
                      <Link
                        href={`/classroom/${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                        className="px-3.5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs border border-[#d4a359]/30 transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Join Live Class</span>
                      </Link>
                    )}

                    <button
                      onClick={() => setReviewModalDeal(deal)}
                      className="px-3.5 py-2 bg-[#fdf6ec] hover:bg-[#faebd4] text-[#b8863b] font-bold text-xs rounded-xl border border-[#f2dfbe] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#d4a359] text-[#d4a359]" />
                      <span>Rate &amp; Review</span>
                    </button>

                    {deal.status !== 'completed' ? (
                      <Link
                        href={`/student/messages?conversation=${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                        className="px-3.5 py-2 bg-[#faf8f5] hover:bg-[#f3ede2] text-stone-700 font-bold text-xs rounded-xl border border-[#e6dfd5] transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#143d2b]" />
                        <span>Chat</span>
                      </Link>
                    ) : (
                      <div className="px-3 py-1.5 bg-[#f0ece1] border border-[#d4a359]/40 rounded-xl text-xs text-[#0c2217] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Completed &bull; Concluded</span>
                      </div>
                    )}
                  </div>
                </div>

                {deal.status === 'completed' ? (
                  <div className="p-4 bg-[#f0ece1] border border-[#d4a359]/40 rounded-2xl flex items-center justify-between text-xs text-[#0c2217]">
                    <div className="space-y-0.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#d4a359]" />
                        <span>Course Completed Successfully!</span>
                      </span>
                      <p className="text-[11px] text-stone-600">
                        Tutoring sessions for this course have concluded. Please leave a review for your teacher.
                      </p>
                    </div>
                  </div>
                ) : (
                  <TrialBanner deal={deal} onPayClick={() => {}} />
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Review Modal */}
      {reviewModalDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-[#e6dfd5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3ede2]">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Rate &amp; Review {reviewModalDeal.tutor?.name}
              </h3>
              <button
                onClick={() => setReviewModalDeal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-6 bg-[#f0ece1] rounded-2xl border border-[#d4a359]/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#d4a359] mx-auto" />
                <p className="font-bold text-xs text-[#0c2217]">Review Submitted Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Star Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-[#d4a359] hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= rating ? 'fill-[#d4a359]' : 'text-stone-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Your Feedback &amp; Review Comments
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Share your experience regarding punctuality, Tajweed clarity, or exam guidance..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-stone-800 outline-none focus:border-[#0c2217] focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalDeal(null)}
                    className="px-4 py-2 rounded-xl border border-[#e6dfd5] text-xs font-semibold text-stone-700 hover:bg-[#faf8f5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 border border-[#d4a359]/30"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

