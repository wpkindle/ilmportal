'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function ChatRequestModal({
  isOpen,
  onClose,
  tutor,
  studentUser,
  onSuccess
}) {
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const tutorUser = tutor?.user || tutor || {};
  const tutorName = tutorUser.name || tutor?.name || 'Female Tutor';
  const tutorAvatar = tutorUser.avatar || tutor?.avatar || '/images/dr-ayesha.jpg';
  const tutorTargetId = tutorUser._id || tutorUser.id || tutor?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim() || details.trim().length < 10) {
      setError('Please provide at least 10 characters explaining what subject or topics you wish to study.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.sendChatRequest({
        tutorId: tutorTargetId,
        details: details.trim()
      });

      if (res.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess(res.request);
      } else {
        setError(res.message || 'Failed to send message request. Please try again.');
      }
    } catch (err) {
      console.error('Error sending chat request:', err);
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setDetails('');
    setError('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 relative">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Verified Request
                </span>
                <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Female Tutor
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                Send Message Request
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Request Sent Successfully!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your 100% verified profile and request details have been dispatched to <strong>{tutorName}</strong>.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-left space-y-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>What happens next?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] pl-1">
                  <li>The tutor will review your profile and learning goals.</li>
                  <li>Once accepted, your direct 1:1 chat will unlock automatically.</li>
                  <li>You will receive an instant <strong>email notification</strong> and alert in your Notification Center as soon as she accepts or replies.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tutor Info Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
                <img
                  src={tutorAvatar}
                  alt={tutorName}
                  className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{tutorName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified Female Tutor &bull; Requires intro request before direct chat
                  </p>
                </div>
              </div>

              {/* Student Verified Data Snapshot Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your Verified Profile Snapshot</span>
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-200/70 text-emerald-800 rounded-full">
                    100% Strength
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                  <div><strong>Student:</strong> {studentUser?.name}</div>
                  <div><strong>Age:</strong> {studentUser?.age ? `${studentUser.age} Years` : 'Provided'}</div>
                  <div><strong>Gender:</strong> {studentUser?.gender || 'Provided'}</div>
                  <div><strong>City:</strong> {studentUser?.city || 'Pakistan'}</div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60">
                  This authentic snapshot ensures female tutors can verify your family/student context with confidence.
                </p>
              </div>

              {/* Detail Textarea Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Why are you interested to talk? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g., Assalam-o-Alaikum! I am looking for online tutoring in FSc Biology / Tajweed for myself / my daughter. We would like to learn 3 days a week in the evening and discuss the monthly fee..."
                  rows={4}
                  required
                  className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-slate-800 placeholder:text-slate-400 leading-relaxed outline-none transition-all resize-none"
                />
                <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                  <span>Minimum 10 characters</span>
                  <span>{details.length} characters</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || details.trim().length < 10}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <span>Sending Request...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Send Message Request</span>
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
