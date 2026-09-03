'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  ShieldAlert,
  Send,
  CheckCircle2,
  Lock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

const incidentCategories = [
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior / Unprofessional Conduct' },
  { value: 'off_platform_contact', label: 'Off-Platform Contact Request (Phone/WhatsApp/Direct Pay)' },
  { value: 'harassment', label: 'Harassment or Safety Concern' },
  { value: 'attendance_dispute', label: 'Class Missed / Attendance Dispute' },
  { value: 'financial_dispute', label: 'Fee or Payment Dispute' },
  { value: 'technical_issue', label: 'Audio/Video or Technical Malfunction' },
  { value: 'other', label: 'Other Concern' }
];

export default function ReportModal({
  isOpen,
  onClose,
  reportedUser,
  conversationId,
  messages = [],
  closeButtonText = 'Close & Return'
}) {
  const [category, setCategory] = useState('inappropriate_behavior');
  const [description, setDescription] = useState('');
  const [attachSnapshot, setAttachSnapshot] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !reportedUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please enter a description of the issue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const snapshotData = attachSnapshot
        ? messages.slice(-10).map((m) => ({
            sender: m.sender?.name || (typeof m.sender === 'string' ? m.sender : 'User'),
            text: m.text || (m.messageType === 'voice' ? '[Voice Note]' : '[Message]'),
            createdAt: m.createdAt
          }))
        : [];

      const payload = {
        reportedUserId: reportedUser?._id || reportedUser?.id || reportedUser?.userId || 'system_incident',
        conversationId,
        category,
        subject: `Incident Report against ${reportedUser?.name || 'User'} (${category})`,
        description: description.trim(),
        chatSnapshot: snapshotData
      };

      const res = await api.createReport(payload);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || 'Failed to submit report.');
      }
    } catch (err) {
      setError(err.message || 'Error submitting report to admin');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setError('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Report Submitted to Admin</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for keeping our learning community safe and high-quality. Your report has been dispatched to the IlmPortal safety administration team for priority review.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                {closeButtonText}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60 shadow-2xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Report Issue to Admin</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Confidential review by IlmPortal Trust & Safety
                </p>
              </div>
            </div>

            {/* Target User Info */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    reportedUser.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(reportedUser.name || 'User')}&background=e11d48&color=fff`
                  }
                  alt={reportedUser.name}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <p className="font-bold text-slate-900">{reportedUser.name}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{reportedUser.role} Account</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-rose-100 text-rose-800 uppercase">
                Reporting
              </span>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Report *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-rose-500 focus:bg-white cursor-pointer"
                >
                  {incidentCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Incident Description & Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe what happened in detail so the admin team can take appropriate action..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-rose-500 focus:bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Attach Transcript Snapshot */}
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={attachSnapshot}
                  onChange={(e) => setAttachSnapshot(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <div className="text-[11px] text-slate-600 leading-snug">
                  <span className="font-bold text-slate-800">Attach recent chat messages snapshot</span>
                  <p className="text-slate-500">Helps the administration team verify the context quickly and accurately.</p>
                </div>
              </label>

              {/* Notice */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reports are strictly confidential and never visible to the other party.</span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting Report...' : 'Submit to Admin'}</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}

