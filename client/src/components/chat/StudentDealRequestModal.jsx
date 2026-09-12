'use client';

import React, { useState } from 'react';
import { Sparkles, Video, Home, Calendar, BookOpen, Send, X, Clock } from 'lucide-react';
import { api } from '../../services/api';

const SUBJECT_PRESETS = [
  'Tajweed al-Quran Basics (Noorani Qaida)',
  'Quran Memorization (Hifz al-Quran)',
  'Quran Translation & Tafseer',
  'Urdu Language & Literature',
  'Islamic Studies (Deeniyat / Fiqh)',
  'Arabic Language & Grammar',
  'Primary School Tutoring (All Subjects)',
  'English Language & Grammar',
  'General Mathematics',
  'custom'
];

const SCHEDULE_PRESETS = [
  '3 days per week (1 hour/session)',
  '5 days per week (Mon - Fri, 45 min)',
  'Weekend Only (Sat & Sun, 1 hr)',
  'Daily (Mon - Sat, 30 min)'
];

const StudentDealRequestModal = ({
  isOpen,
  onClose,
  tutor,
  previousSubject = '',
  onRequestSent
}) => {
  const [subject, setSubject] = useState(previousSubject || 'Tajweed al-Quran Basics (Noorani Qaida)');
  const [customSubject, setCustomSubject] = useState('');
  const [mode, setMode] = useState('online');
  const [schedule, setSchedule] = useState('3 days per week (1 hour/session)');
  const [customSchedule, setCustomSchedule] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const tutorName = tutor?.name || 'Tutor';
  const finalSubject = subject === 'custom' ? (customSubject.trim() || 'General Quran / Academic Tutoring') : subject;
  const finalSchedule = schedule === 'custom' ? (customSchedule.trim() || 'Flexible Days') : schedule;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tutor?._id && !tutor?.id) {
      setError('Tutor identifier not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const recipientId = tutor._id || tutor.id;
      const textMessage = `📋 Tutoring Deal Request: ${finalSubject} (${mode === 'online' ? 'Online Video' : 'In-Person'}) • ${finalSchedule}${note ? ` • Note: "${note}"` : ''}`;

      const res = await api.sendMessage({
        recipientId,
        messageType: 'deal_request',
        text: textMessage,
        dealOfferData: {
          subject: finalSubject,
          mode,
          schedule: finalSchedule,
          notes: note.trim()
        }
      });

      if (res.success || res.message) {
        if (onRequestSent) onRequestSent(res.message || res.chatMessage);
        onClose();
      } else {
        setError(res.message || 'Failed to submit deal request.');
      }
    } catch (err) {
      setError(err.message || 'Error sending deal request to tutor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-[#d4a359]/40 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#ebe3d3] flex items-center justify-between bg-[#faf8f5] rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0c2217] text-[#d4a359] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0c2217]">
                Request Deal Offer
              </h3>
              <p className="text-xs text-stone-500">
                Ask <strong className="text-stone-800">{tutorName}</strong> to send you a customized deal offer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Subject Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Subject or Course</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4a359]/40 focus:border-[#d4a359] font-medium"
            >
              {SUBJECT_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {s === 'custom' ? '✏️ Custom Subject (Type Your Own)' : s}
                </option>
              ))}
            </select>

            {subject === 'custom' && (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="E.g., O-Levels Physics, Arabic Grammar, etc."
                className="w-full mt-2 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4a359]/40"
                required
              />
            )}
          </div>

          {/* Learning Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">
              Preferred Learning Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('online')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'online'
                    ? 'bg-[#0c2217] text-[#faf8f5] border-[#0c2217] shadow-xs'
                    : 'bg-[#faf8f5] text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Video className="w-4 h-4 text-[#d4a359]" />
                <span>Online Video Class</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('in_person')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'in_person'
                    ? 'bg-[#0c2217] text-[#faf8f5] border-[#0c2217] shadow-xs'
                    : 'bg-[#faf8f5] text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Home className="w-4 h-4 text-[#d4a359]" />
                <span>In-Person Home Tuition</span>
              </button>
            </div>
          </div>

          {/* Preferred Schedule */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Preferred Schedule / Frequency</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SCHEDULE_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSchedule(s)}
                  className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                    schedule === s
                      ? 'bg-[#faf3e8] border-[#d4a359] text-[#0c2217] font-bold shadow-2xs'
                      : 'bg-[#faf8f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Note to Teacher */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">
              Message or Renewal Note to Teacher (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="E.g., Assalam-o-Alaikum, I want to renew our classes for the next month at our agreed time..."
              className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4a359]/40 resize-none font-medium"
            />
          </div>

          {/* Information Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Once sent, <strong>{tutorName}</strong> will receive an instant notification in chat with your course requirements and can dispatch an official deal offer in 1 click.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#874121] text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Sending Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Deal Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentDealRequestModal;
