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
import { getTutorAvatar } from '../../utils/tutorHelpers';

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
  const tutorAvatar = getTutorAvatar(tutor || tutorUser, tutorName);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl md:max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#e6ded1] overflow-hidden text-slate-800 my-auto max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="p-6 sm:p-10 text-center space-y-4 max-w-md mx-auto my-auto">
            <div className="w-16 h-16 bg-[#f0ece1] text-[#0c2217] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#faf8f5] shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-[#0c2217]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 font-serif">
                Request Sent Successfully!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your 100% verified profile and study goals have been dispatched to <strong>{tutorName}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e6ded1] text-left space-y-2 text-xs text-slate-800">
              <div className="flex items-center gap-2 font-bold text-[#0c2217]">
                <Clock className="w-4 h-4 text-[#0c2217] shrink-0" />
                <span>What happens next?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] pl-1">
                <li>The tutor will review your profile and learning goals.</li>
                <li>Once accepted, your direct 1:1 chat will unlock automatically.</li>
                <li>You will receive an instant <strong>email notification</strong> and alert in your Notification Center.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white rounded-xl text-xs font-black shadow-md shadow-[#b85d34]/25 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto md:overflow-visible">
            {/* LEFT COLUMN: Tutor & Verified Profile Snapshot (md:col-span-5) */}
            <div className="md:col-span-5 bg-[#faf8f5] border-b md:border-b-0 md:border-r border-[#ebe3d3] p-5 sm:p-6 flex flex-col justify-between relative">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="md:hidden absolute top-3.5 right-3.5 p-2 text-stone-400 hover:text-[#0c2217] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 pr-8 md:pr-0">
                  <div className="p-2.5 sm:p-3 bg-[#f5f0e6] border border-[#d4a359]/40 rounded-2xl text-[#b85d34] shrink-0 shadow-2xs">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b85d34] bg-[#f5f0e6] px-2.5 py-0.5 rounded-full border border-[#d4a359]/30 inline-block">
                        Verified Request
                      </span>
                      <span className="text-[10px] font-bold text-[#0c2217] bg-[#ebe3d3] px-2 py-0.5 rounded-full border border-stone-300">
                        Female Tutor
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-[#0c2217] mt-0.5 font-serif leading-tight">
                      Send Message Request
                    </h2>
                  </div>
                </div>

                {/* Tutor Info Preview */}
                <div className="p-3 rounded-2xl bg-white border border-[#e6ded1] flex items-center gap-3 shadow-2xs">
                  <img
                    src={tutorAvatar}
                    alt={tutorName}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{tutorName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      Verified Female Tutor &bull; Direct chat unlocks upon request acceptance
                    </p>
                  </div>
                </div>

                {/* Student Verified Data Snapshot Preview */}
                <div className="p-3 rounded-2xl bg-white border border-[#e6ded1] space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0c2217] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0c2217]" />
                      <span>Verified Student Snapshot</span>
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/30 rounded-full">
                      100% Strength
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 pt-0.5">
                    <div><strong>Student:</strong> {studentUser?.name}</div>
                    <div><strong>Age:</strong> {studentUser?.age ? `${studentUser.age} Years` : 'Provided'}</div>
                    <div><strong>Gender:</strong> {studentUser?.gender || 'Provided'}</div>
                    <div><strong>City:</strong> {studentUser?.city || 'Pakistan'}</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed hidden md:block">
                  This authentic snapshot gives female tutors confidence in your identity and study requirements.
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#ebe3d3] text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#b85d34] shrink-0" />
                <span>Tutors usually respond within a few hours</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Message Form (md:col-span-7) */}
            <div className="md:col-span-7 bg-white p-5 sm:p-6 flex flex-col justify-between">
              <div className="hidden md:flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Learning Goals &amp; Introduction</h3>
                  <p className="text-[11px] text-slate-500">Describe what you want to study, schedule, and any questions</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="p-1.5 text-stone-400 hover:text-[#0c2217] rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 my-auto py-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Why are you interested to talk? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="A detailed introduction about your study goals, schedule, and any questions you have for the tutor."
                    rows={5}
                    required
                    className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-[#0c2217]/20 focus:border-[#0c2217] text-xs text-slate-800 placeholder:text-slate-400 leading-relaxed outline-none transition-all resize-none shadow-2xs"
                  />
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                    <span>Minimum 10 characters</span>
                    <span className={details.length < 10 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                      {details.length} characters
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors order-2 sm:order-1 text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || details.trim().length < 10}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-[#b85d34]/25 flex items-center justify-center gap-2 transition-all cursor-pointer order-1 sm:order-2"
                  >
                    {loading ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white/80" />
                        <span>Send Message Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
