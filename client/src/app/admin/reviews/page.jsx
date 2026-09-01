'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import RatingStars from '../../../components/common/RatingStars';
import { api } from '../../../services/api';
import { Star, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editReview, setEditReview] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.getAdminReviews('all');
      if (res.success) setReviews(res.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openOverrideModal = (rev) => {
    setEditReview(rev);
    setRating(rev.rating);
    setComment(rev.comment);
    setStatus(rev.status);
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
        fetchReviews();
      }
    } catch (err) {
      alert(err.message || 'Error updating review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await api.deleteReview(id);
      fetchReviews();
    } catch (e) {
      alert(e.message || 'Error deleting review');
    }
  };

  if (loading) return <LoadingSpinner text="Loading reviews for moderation..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Ratings & Reviews Moderation</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin control center to edit star ratings, moderate comments, and maintain audit logs.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Student & Tutor</th>
                    <th className="p-4">Star Rating</th>
                    <th className="p-4">Review Comment</th>
                    <th className="p-4">Admin Edited</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <tr key={rev._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">
                          By: {rev.student?.name}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Tutor: {rev.tutor?.name}
                        </p>
                      </td>
                      <td className="p-4">
                        <RatingStars rating={rev.rating} size="xs" />
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs">
                        "{rev.comment}"
                      </td>
                      <td className="p-4">
                        {rev.adminEdited ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                            Yes (Original: {rev.originalRating}★)
                          </span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openOverrideModal(rev)}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200"
                        >
                          Override / Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </main>

        </div>
      </div>

      {/* Override Modal */}
      {editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Admin Override: Review Rating & Comment
            </h3>

            <form onSubmit={handleSaveOverride} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Star Rating (1-5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400"
                    >
                      <Star className={`w-6 h-6 ${s <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Review Comment</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Publish Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                >
                  <option value="published">Published (Visible Publicly)</option>
                  <option value="hidden">Hidden (Moderated)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditReview(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

