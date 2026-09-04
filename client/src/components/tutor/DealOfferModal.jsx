'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  X,
  CheckCircle2,
  ShieldCheck,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  CreditCard,
  Video,
  Home,
  Check,
  ChevronDown
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

const subjectOptions = [
  // Quranic & Islamic
  { value: 'Tajweed al-Quran Basics (Noorani Qaida)', label: 'Tajweed al-Quran Basics (Noorani Qaida)', sublabel: 'Quranic Foundation', badge: 'Quran' },
  { value: 'Quran Nazra with Proper Makharij', label: 'Quran Nazra with Proper Makharij', sublabel: 'Fluent Recitation', badge: 'Quran' },
  { value: 'Hifz-ul-Quran (Memorization & Revision)', label: 'Hifz-ul-Quran (Memorization & Revision)', sublabel: 'Quran Memorization', badge: 'Quran' },
  { value: 'Tafseer-ul-Quran & Translation', label: 'Tafseer-ul-Quran & Translation', sublabel: 'Understanding Meaning', badge: 'Islamic' },
  { value: 'Islamic Studies, Hadith & Daily Duas', label: 'Islamic Studies, Hadith & Daily Duas', sublabel: 'Fiqh & Sunnah', badge: 'Islamic' },
  { value: 'Arabic Grammar & Spoken Arabic (Sarf o Nahw)', label: 'Arabic Grammar & Spoken Arabic (Sarf o Nahw)', sublabel: 'Arabic Language', badge: 'Arabic' },

  // Academic Sciences & Mathematics
  { value: 'Mathematics (Matric / FSc / O-Level / A-Level)', label: 'Mathematics (Matric / FSc / O-Level / A-Level)', sublabel: 'Algebra, Calculus & Geometry', badge: 'Academic' },
  { value: 'Physics (Theory & Numericals)', label: 'Physics (Theory & Numericals)', sublabel: 'Matric / FSc / Cambridge', badge: 'Academic' },
  { value: 'Chemistry (Organic & Inorganic)', label: 'Chemistry (Organic & Inorganic)', sublabel: 'Matric / FSc / MDCAT', badge: 'Academic' },
  { value: 'Biology & Medical Sciences (MDCAT Prep)', label: 'Biology & Medical Sciences (MDCAT Prep)', sublabel: 'Pre-Medical Curriculum', badge: 'Academic' },
  { value: 'Computer Science & Programming (Python/Web)', label: 'Computer Science & Programming (Python/Web)', sublabel: 'Coding & ICS', badge: 'Academic' },
  { value: 'English Grammar, Composition & IELTS', label: 'English Grammar, Composition & IELTS', sublabel: 'Spoken & Academic English', badge: 'Language' },
  { value: 'Urdu Literature & Grammar (Adab)', label: 'Urdu Literature & Grammar (Adab)', sublabel: 'School & College Urdu', badge: 'Language' },
  { value: 'Junior / Primary All Subjects (Grade 1-8)', label: 'Junior / Primary All Subjects (Grade 1-8)', sublabel: 'School Foundation', badge: 'School' },
  { value: 'custom', label: 'Other / Custom Subject Title...', sublabel: 'Type custom title' }
];

const billingOptions = [
  { value: 'per_month', label: 'PKR / Month (Standard)', sublabel: 'Monthly recurring tuition fee' },
  { value: 'per_hour', label: 'PKR / Hour (Flexible)', sublabel: 'Hourly session-based billing' }
];

const weekDaysList = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' }
];

const dayPresets = [
  { label: 'Mon, Wed, Fri', days: ['Mon', 'Wed', 'Fri'] },
  { label: 'Tue, Thu, Sat', days: ['Tue', 'Thu', 'Sat'] },
  { label: 'Mon - Fri', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { label: 'Weekend Only', days: ['Sat', 'Sun'] },
  { label: 'Daily (Mon-Sat)', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
];

const DealOfferModal = ({ isOpen, onClose, studentId, studentName, onOfferSent }) => {
  const [selectedSubject, setSelectedSubject] = useState('Tajweed al-Quran Basics (Noorani Qaida)');
  const [customSubjectText, setCustomSubjectText] = useState('');
  
  // Rate & Mode
  const [price, setPrice] = useState(4000);
  const [priceUnit, setPriceUnit] = useState('per_month');
  const [mode, setMode] = useState('online');

  // Calendar & Schedule Selection
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [hour, setHour] = useState('06');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('PM');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri']);
  const [durationMinutes, setDurationMinutes] = useState('45');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dateInputRef = useRef(null);

  // Formatted display time in 12-hour AM/PM format
  const formattedDisplayTime = `${parseInt(hour, 10)}:${minute} ${period}`;

  // Format Date to readable string (e.g. 4 Sep 2026)
  const formatReadableDate = (dateStr) => {
    if (!dateStr) return 'Immediately';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Toggle individual day
  const toggleDay = (dayKey) => {
    if (selectedDays.includes(dayKey)) {
      if (selectedDays.length === 1) return; // keep at least one
      setSelectedDays(selectedDays.filter((d) => d !== dayKey));
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  };

  // Apply quick preset
  const applyPreset = (presetDays) => {
    setSelectedDays(presetDays);
  };

  // Computed schedule details string
  const computedSchedule = `Starts ${formatReadableDate(startDate)} • ${selectedDays.join(', ')} at ${formattedDisplayTime} PKT (${durationMinutes} min/class)`;

  const finalSubject = selectedSubject === 'custom' ? customSubjectText.trim() || 'Custom Quran / Academic Tuition' : selectedSubject;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubject === 'custom' && !customSubjectText.trim()) {
      setError('Please type your custom subject title.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createDealOffer({
        studentId,
        subject: finalSubject,
        price: Number(price),
        priceUnit,
        mode,
        scheduleDetails: computedSchedule
      });

      if (res.success) {
        if (onOfferSent) onOfferSent(res.deal);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Error creating deal offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-200/90 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] overflow-hidden my-auto">
        
        {/* Modal Header (Pinned at Top, 100% visible) */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2.5 bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40 rounded-xl sm:rounded-2xl shadow-md shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 flex flex-wrap items-center gap-1.5 leading-tight">
                <span>Send Course Agreement Offer</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0ece1] text-[#0c2217] rounded-full border border-[#d4a359]/40 shrink-0">
                  3-Day Free Trial
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5">
                To student: <strong className="text-slate-800">{studentName || 'Student'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="deal-offer-form" onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 text-left">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}
          
          {/* 1. Subject Selection Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Select Subject / Curriculum *</span>
            </label>
            
            <CustomSelect
              options={subjectOptions}
              value={selectedSubject}
              onChange={setSelectedSubject}
              placeholder="Select Course Curriculum..."
              searchable={true}
              variant="filter"
            />

            {/* Custom Subject Text Input (if 'custom' selected) */}
            {selectedSubject === 'custom' && (
              <input
                type="text"
                required
                placeholder="Enter custom course or subject name (e.g. Advanced Arabic Sarf, Cambridge O-Level Accounting)..."
                value={customSubjectText}
                onChange={(e) => setCustomSubjectText(e.target.value)}
                className="w-full mt-2 p-2.5 bg-slate-50 border border-[#d4a359]/60 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white animate-in fade-in"
              />
            )}
          </div>

          {/* 2. Agreed Rate & Billing Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Agreed Tuition Fee (PKR) *</span>
              </label>
              <input
                type="number"
                required
                min="500"
                step="100"
                placeholder="4000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Billing Cycle
              </label>
              <CustomSelect
                options={billingOptions}
                value={priceUnit}
                onChange={setPriceUnit}
                variant="filter"
              />
            </div>
          </div>

          {/* 3. Tutoring Delivery Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Teaching Delivery Mode
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('online')}
                className={`py-2.5 px-3 rounded-2xl text-center border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'online'
                    ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217] shadow-sm font-bold'
                    : 'bg-[#f4efe8] border-[#e6dfd5] text-stone-700 hover:bg-[#eae3d8]'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Online (WebRTC Video)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('physical')}
                className={`py-2.5 px-3 rounded-2xl text-center border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'physical'
                    ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217] shadow-sm font-bold'
                    : 'bg-[#f4efe8] border-[#e6dfd5] text-stone-700 hover:bg-[#eae3d8]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>In-Person (Home Tuition)</span>
              </button>
            </div>
          </div>

          {/* 4. Calendar & Time Selection Box */}
          <div className="p-4 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#e6ded1] pb-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <CalendarIcon className="w-4 h-4 text-[#0c2217]" />
                <span>Class Schedule &amp; Calendar Timings</span>
              </div>
              <span className="text-[10px] font-bold text-[#0c2217] bg-[#f0ece1] border border-[#d4a359]/30 px-2 py-0.5 rounded-md">
                Pakistan Standard Time (PKT)
              </span>
            </div>

            {/* Date & Time Row (Generous width with fully visible AM/PM) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* 1. First Class Date */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#0c2217]" />
                  <span>First Class Date *</span>
                </label>
                
                {/* Entire Box Opens Calendar Picker */}
                <div
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker();
                    } catch {
                      dateInputRef.current?.focus();
                    }
                  }}
                  className="relative flex items-center bg-white border border-slate-200 hover:border-[#0c2217] focus-within:border-[#0c2217] rounded-xl p-2 cursor-pointer transition-colors shadow-2xs group h-[42px]"
                >
                  <input
                    ref={dateInputRef}
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => {
                      try { e.currentTarget.showPicker(); } catch {}
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Daily Class Time with Fully Visible AM/PM */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0c2217]" />
                  <span>Class Time (PKT) *</span>
                </label>
                
                <div className="flex items-center justify-between gap-1 bg-white border border-slate-200 focus-within:border-[#0c2217] rounded-xl px-2 py-1 shadow-2xs h-[42px]">
                  <div className="flex items-center gap-1 min-w-0">
                    {/* Hour */}
                    <select
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 text-xs font-bold text-slate-800 outline-none cursor-pointer text-center shrink-0"
                      aria-label="Select Hour"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    
                    <span className="font-bold text-slate-400 text-xs shrink-0">:</span>

                    {/* Minute */}
                    <select
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 text-xs font-bold text-slate-800 outline-none cursor-pointer text-center shrink-0"
                      aria-label="Select Minute"
                    >
                      {['00', '15', '30', '45'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* AM / PM Toggle Buttons - Guaranteed 100% Visible */}
                  <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-bold shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={() => setPeriod('AM')}
                      className={`px-2 py-1 transition-colors cursor-pointer text-[11px] font-extrabold ${
                        period === 'AM'
                          ? 'bg-[#0c2217] text-[#d4a359]'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriod('PM')}
                      className={`px-2 py-1 transition-colors cursor-pointer text-[11px] font-extrabold ${
                        period === 'PM'
                          ? 'bg-[#0c2217] text-[#d4a359]'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Session Duration */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Class Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0c2217] cursor-pointer shadow-2xs h-[42px]"
                >
                  <option value="30">30 Min</option>
                  <option value="45">45 Min (Best)</option>
                  <option value="60">60 Min (1h)</option>
                  <option value="90">90 Min (1.5h)</option>
                </select>
              </div>

            </div>

            {/* Recurring Days Selection */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Select Teaching Days:
                </label>
                
                {/* Presets */}
                <div className="flex items-center gap-1 flex-wrap">
                  {dayPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset.days)}
                      className="text-[10px] font-bold text-[#0c2217] hover:text-black bg-[#f0ece1] hover:bg-[#e6ded1] border border-[#d4a359]/30 px-1.5 py-0.5 rounded-lg cursor-pointer transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
                {weekDaysList.map((day) => {
                  const isSelected = selectedDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Schedule Summary Pill */}
            <div className="p-2.5 bg-[#f0ece1] border border-[#d4a359]/30 rounded-xl text-[11px] text-[#0c2217] flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-[#0c2217] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[#0c2217]">Agreed Schedule Summary:</span>
                <p className="font-medium text-slate-700">{computedSchedule}</p>
              </div>
            </div>

          </div>

          {/* Safety & Trial Guarantee Banner */}
          <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#e6ded1] text-[11px] text-slate-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0c2217] shrink-0 mt-0.5" />
            <p className="leading-snug">
              When sent, the student receives the offer in chat and can immediately activate the <strong>3-Day Free Trial</strong> with zero advance payment.
            </p>
          </div>

        </form>

        {/* Modal Footer (Pinned at Bottom, ALWAYS visible) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 z-10">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Zero advance fee &bull; 3-Day Free Trial
          </p>
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="deal-offer-form"
              disabled={loading}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#b85d34]/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-white/80 shrink-0" />
              <span>{loading ? 'Sending Offer...' : 'Send Course Offer'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DealOfferModal;
