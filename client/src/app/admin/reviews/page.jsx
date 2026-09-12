'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import RatingStars from '../../../components/common/RatingStars';
import { api } from '../../../services/api';
import {
  Star,
  Edit3,
  Trash2,
  CheckCircle2,
  Flag,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldAlert,
  Check,
  Search,
  Filter
} from 'lucide-react';

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'flagged', 'published', 'hidden'
  const [searchQuery, setSearchQuery] = useState('');
  const [editReview, setEditReview] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);

  const fetchReviews = async (tab = activeTab) => {
    setLoading(true);
    try {
      const res = await api.getAdminReviews(tab);
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (e) {
      console.error('Error fetching admin reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab]);

  const openOverrideModal = (rev) => {
    setEditReview(rev);
    setRating(rev.rating);
    setComment(rev.comment || '');
    setStatus(rev.status || 'published');
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!editReview) return;

    setSaving(true);
    try {
      const res = await api.overrideReview(editReview._id, {
        rating: Number(rating),
        comment: comment.trim(),
        status
      });
      if (res.success) {
        setEditReview(null);
        fetchReviews(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Error updating review');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickApprove = async (revId) => {
    try {
      const res = await api.overrideReview(revId, {
        status: 'published'
      });
      if (res.success) {
        fetchReviews(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Error unflagging review');
    }
  };

  const handleQuickHide = async (revId) => {
    try {
      const res = await api.overrideReview(revId, {
        status: 'hidden'
      });
      if (res.success) {
        fetchReviews(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Error hiding review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review? This will recompute profile rating counts.')) return;
    try {
      await api.deleteReview(id);
      fetchReviews(activeTab);
    } catch (e) {
      alert(e.message || 'Error deleting review');
    }
  };

  const filteredReviews = reviews.filter((rev) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const studentName = (rev.student?.name || rev.reviewer?.name || '').toLowerCase();
    const tutorName = (rev.tutor?.name || rev.targetUser?.name || '').toLowerCase();
    const comm = (rev.comment || '').toLowerCase();
    const reason = (rev.reportReason || '').toLowerCase();
    return studentName.includes(query) || tutorName.includes(query) || comm.includes(query) || reason.includes(query);
  });

  const flaggedCount = reviews.filter((r) => r.status === 'flagged' || r.isReported).length;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-serif">
                  Ratings &amp; Reviews Moderation
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin control center to inspect reported reviews, edit ratings &amp; comments, and enforce authentic reviews.
                </p>
              </div>

              {flaggedCount > 0 && activeTab !== 'flagged' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('flagged')}
                  className="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Flag className="w-4 h-4 text-amber-600" />
                  <span>{flaggedCount} Reported Review{flaggedCount > 1 ? 's' : ''} Pending</span>
                </button>
              )}
            </div>

            {/* Filter Tabs & Search */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#0c2217] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Reviews
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('flagged')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'flagged'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>Reported / Flagged</span>
                  {flaggedCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'flagged' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'}`}>
                      {flaggedCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('published')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'published'
                      ? 'bg-[#0c2217] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('hidden')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'hidden'
                      ? 'bg-[#0c2217] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Hidden
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reviewer, tutor, comment..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2217]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              {loading ? (
                <div className="py-16">
                  <LoadingSpinner />
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-sm text-slate-800">No Reviews Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {activeTab === 'flagged'
                      ? 'Alhamdulillah! No reviews are currently flagged or reported by users.'
                      : 'No reviews match your current filter or search criteria.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Participants</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Review Content</th>
                        <th className="p-4">Moderation Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReviews.map((rev) => {
                        const isFlagged = rev.status === 'flagged' || rev.isReported;
                        return (
                          <tr key={rev._id} className={`hover:bg-slate-50/60 transition-colors ${isFlagged ? 'bg-amber-50/30' : ''}`}>
                            {/* Participants */}
                            <td className="p-4 align-top">
                              <div className="space-y-1 min-w-[140px]">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">By</span>
                                  <span className="font-bold text-slate-900 block">
                                    {rev.student?.name || rev.reviewer?.name || 'Student'}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block capitalize">
                                    Role: {rev.reviewerRole || rev.student?.role || 'student'}
                                  </span>
                                </div>
                                <div className="pt-1 border-t border-slate-100">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Tutor</span>
                                  <span className="font-semibold text-slate-700 block">
                                    {rev.tutor?.name || rev.targetUser?.name || 'Tutor'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Rating */}
                            <td className="p-4 align-top whitespace-nowrap">
                              <div className="space-y-1">
                                <RatingStars rating={rev.rating} size="xs" />
                                <span className="text-[11px] font-bold text-slate-700 block">
                                  {rev.rating}.0 / 5.0
                                </span>
                                {rev.adminEdited && (
                                  <span className="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-800 font-bold text-[9.5px] rounded border border-purple-200">
                                    Edited (Orig: {rev.originalRating}★)
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Comment & Report Reason */}
                            <td className="p-4 align-top max-w-sm">
                              <div className="space-y-2">
                                {rev.comment ? (
                                  <p className="text-slate-800 leading-relaxed italic text-[11.5px]">
                                    &ldquo;{rev.comment}&rdquo;
                                  </p>
                                ) : (
                                  <p className="text-slate-400 italic text-[11px]">
                                    No text review left.
                                  </p>
                                )}

                                {rev.quickTags && rev.quickTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {rev.quickTags.map((tag, idx) => (
                                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9.5px] font-medium">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Flagged Report Alert Box */}
                                {isFlagged && (
                                  <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-xs text-amber-950 space-y-1 mt-2">
                                    <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px]">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span>REPORTED BY USER:</span>
                                    </div>
                                    <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                                      {rev.reportReason || 'User flagged this review for administrative review.'}
                                    </p>
                                    {rev.reportedBy && (
                                      <span className="text-[10px] text-slate-500 block">
                                        Reporter: <strong>{rev.reportedBy?.name || 'User'}</strong> ({rev.reportedBy?.role || 'user'})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-4 align-top whitespace-nowrap">
                              <div className="space-y-1.5">
                                {rev.status === 'published' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                    <Check className="w-3 h-3" />
                                    <span>Published</span>
                                  </span>
                                )}
                                {rev.status === 'hidden' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                                    <EyeOff className="w-3 h-3" />
                                    <span>Hidden</span>
                                  </span>
                                )}
                                {rev.status === 'flagged' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold animate-pulse">
                                    <Flag className="w-3 h-3" />
                                    <span>Flagged</span>
                                  </span>
                                )}

                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {new Date(rev.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 align-top text-right whitespace-nowrap space-x-1.5">
                              {isFlagged ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(rev._id)}
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-xs transition-colors cursor-pointer"
                                  title="Clear flag and publish review"
                                >
                                  Approve / Unflag
                                </button>
                              ) : rev.status === 'published' ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickHide(rev._id)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                  title="Hide review from public profile"
                                >
                                  Hide
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(rev._id)}
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-xs transition-colors cursor-pointer"
                                  title="Publish review"
                                >
                                  Publish
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => openOverrideModal(rev)}
                                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Override / Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(rev._id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-block"
                                title="Permanently delete review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>

        </div>
      </div>

      {/* Override / Edit Modal */}
      {editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Admin Review Moderation &amp; Override
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Change rating score, moderate comments, or update visibility status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditReview(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                &times;
              </button>
            </div>

            {/* If Reported */}
            {(editReview.isReported || editReview.status === 'flagged') && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1 font-bold text-rose-700">
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Reason:</span>
                </div>
                <p className="text-slate-800">{editReview.reportReason || 'Flagged for moderation by user'}</p>
              </div>
            )}

            <form onSubmit={handleSaveOverride} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Adjusted Star Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-7 h-7 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-sm font-black text-slate-800 ml-2">
                    {rating}.0 Stars
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Review Comment</label>
                  {editReview.originalComment && (
                    <span className="text-[10px] text-purple-700 font-medium">
                      Original: &ldquo;{editReview.originalComment.substring(0, 35)}...&rdquo;
                    </span>
                  )}
                </div>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2217]"
                  placeholder="Enter moderated review comment..."
                />
              </div>

              {/* Publish Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Publish Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2217]"
                >
                  <option value="published">Published (Visible Publicly on Profile)</option>
                  <option value="hidden">Hidden (Excluded from Profile &amp; Rating Score)</option>
                  <option value="flagged">Flagged (Under Active Moderation)</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditReview(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="xs" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Override &amp; Recalculate Ratings</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
