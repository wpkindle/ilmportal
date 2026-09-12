'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import TrialBanner from '../../../components/common/TrialBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import LeaveReviewModal from '../../../components/common/LeaveReviewModal';
import { BookOpen, Star, MessageSquare, CreditCard, X, CheckCircle2, Video } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function MyDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Review Modal State
  const [reviewModalDeal, setReviewModalDeal] = useState(null);

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

  if (loading) return <LoadingSpinner />;

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
                        Tutor: <strong className="text-stone-800">{deal.tutor?.name}</strong> &bull; Mode: <span className="text-[#143d2b] font-medium">{deal.mode === 'online' ? 'Online' : 'In-Person'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {deal.status !== 'completed' && deal.mode !== 'in_person' && deal.mode !== 'physical' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && !deal.accessRestricted && (
                      <Link
                        href={`/classroom/${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                        className="px-3.5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs border border-[#d4a359]/30 transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Join Live Class</span>
                      </Link>
                    )}

                    {deal.isReviewed || deal.isStudentReviewed ? (
                      <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reviewed ★★★★★</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setReviewModalDeal(deal)}
                        className="px-3.5 py-2 bg-[#fdf6ec] hover:bg-[#faebd4] text-[#b8863b] font-bold text-xs rounded-xl border border-[#f2dfbe] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-[#d4a359] text-[#d4a359]" />
                        <span>Rate &amp; Review</span>
                      </button>
                    )}

                    <Link
                      href={`/student/messages?conversation=${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                      className="px-3.5 py-2 bg-[#faf8f5] hover:bg-[#f3ede2] text-stone-700 font-bold text-xs rounded-xl border border-[#e6dfd5] transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#143d2b]" />
                      <span>Chat</span>
                    </Link>

                    {deal.status === 'completed' && (
                      <div className="px-3 py-1.5 bg-[#f0ece1] border border-[#d4a359]/40 rounded-xl text-xs text-[#0c2217] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Completed &bull; Concluded</span>
                      </div>
                    )}
                  </div>
                </div>

                {deal.status === 'completed' ? (
                  <div className="p-4 bg-[#f0ece1] border border-[#d4a359]/40 rounded-2xl space-y-2.5 text-xs text-[#0c2217]">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#d4a359]" />
                        <span>Course Completed Successfully!</span>
                      </span>
                      <Link
                        href={`/student/messages?conversation=${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-[11px] font-bold rounded-xl shadow-xs border border-[#d4a359]/30 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Request Next Month / New Deal</span>
                      </Link>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Tutoring sessions for this course have concluded. All records and chat conversations are preserved.
                    </p>

                    {/* Tutor's Feedback on the Student */}
                    {deal.isTutorReviewed && (
                      <div className="mt-2 p-3 bg-white rounded-xl border border-[#e0d6c8] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-stone-800 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>Teacher Feedback for You</span>
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                            Verified Review ★
                          </span>
                        </div>
                        {deal.tutorReview?.comment && (
                          <p className="text-[11px] text-stone-600 italic">
                            &ldquo;{deal.tutorReview.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <TrialBanner deal={deal} onPayClick={() => {}} />
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Leave Review Modal */}
      <LeaveReviewModal
        isOpen={!!reviewModalDeal}
        onClose={() => setReviewModalDeal(null)}
        deal={reviewModalDeal}
        tutor={reviewModalDeal?.tutor}
        student={user}
        targetRole="tutor"
        onSuccess={(reviewData) => {
          setDeals((prev) =>
            prev.map((d) => (d._id === reviewModalDeal?._id ? { ...d, isReviewed: true, isStudentReviewed: true, studentReview: reviewData } : d))
          );
        }}
      />

    </div>
  );
}

