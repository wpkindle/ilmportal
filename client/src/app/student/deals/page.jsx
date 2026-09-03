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
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Tutoring Courses & Subscriptions</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review active courses, payment receipts, and submit reviews for your teachers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
            {['all', 'active_trial', 'active_paid', 'restricted'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  filter === f ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                {f === 'active_trial' ? 'Active' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center text-xs text-slate-400">
            No course agreements found matching the filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDeals.map((deal) => (
              <div key={deal._id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={deal.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.tutor?.name || 'T')}&background=059669&color=fff`}
                      alt="Tutor"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{deal.subject}</h3>
                      <p className="text-xs text-slate-500">
                        Tutor: <strong>{deal.tutor?.name}</strong> &bull; Mode: <span className="capitalize">{deal.mode}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {deal.mode !== 'in_person' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && !deal.accessRestricted && (
                      <Link
                        href={`/classroom/${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Live Class</span>
                      </Link>
                    )}

                    <button
                      onClick={() => setReviewModalDeal(deal)}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Rate & Review</span>
                    </button>

                    <Link
                      href={`/student/messages?conversation=${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat</span>
                    </Link>
                  </div>
                </div>

                <TrialBanner deal={deal} onPayClick={() => {}} />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Review Modal */}
      {reviewModalDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Rate & Review {reviewModalDeal.tutor?.name}
              </h3>
              <button
                onClick={() => setReviewModalDeal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-xs text-emerald-900">Review Submitted Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Star Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Feedback & Review Comments
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Share your experience regarding punctuality, Tajweed clarity, or exam guidance..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalDeal(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
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

