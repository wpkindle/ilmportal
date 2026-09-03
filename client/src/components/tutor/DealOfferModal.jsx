'use client';

import React, { useState, useEffect } from 'react';
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
  const [classTime, setClassTime] = useState('18:00'); // 6:00 PM default
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri']);
  const [durationMinutes, setDurationMinutes] = useState('45');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format 24h time to 12h AM/PM
  const format12Hour = (time24) => {
    if (!time24) return '6:00 PM';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' : ''}${m} ${period}`;
  };

  // Format Date to readable string
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
  const computedSchedule = `Starts ${formatReadableDate(startDate)} • ${selectedDays.join(', ')} at ${format12Hour(classTime)} PKT (${durationMinutes} min/class)`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl relative border border-slate-200/90 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        
        {/* Modal Header (Pinned at Top) */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl sm:rounded-2xl shadow-md shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex flex-wrap items-center gap-1.5 leading-tight">
                <span>Send Course Agreement Offer</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 shrink-0">
                  3-Day Free Trial
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
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
        <form id="deal-offer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}
          
          {/* 1. Subject Selection Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
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
                className="w-full mt-2 p-2.5 bg-slate-50 border border-emerald-400 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white animate-in fade-in"
              />
            )}
          </div>

          {/* 2. Agreed Rate & Billing Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>In-Person (Home Tuition)</span>
              </button>
            </div>
          </div>

          {/* 4. Calendar & Time Selection Box */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                <span>Class Schedule & Calendar Timings</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Pakistan Standard Time (PKT)
              </span>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Start Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  First Class Date
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>

              {/* Class Time */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Daily Class Time
                </label>
                <input
                  type="time"
                  required
                  value={classTime}
                  onChange={(e) => setClassTime(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>

              {/* Session Duration */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Class Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes (Recommended)</option>
                  <option value="60">60 Minutes (1 Hour)</option>
                  <option value="90">90 Minutes (1.5 Hours)</option>
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
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-1.5 py-0.5 rounded-lg cursor-pointer transition-colors"
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
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-950">Agreed Schedule Summary:</span>
                <p className="font-medium text-emerald-800">{computedSchedule}</p>
              </div>
            </div>

          </div>

          {/* Safety & Trial Guarantee Banner */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              When sent, the student receives the offer in chat and can immediately activate the <strong>3-Day Free Trial</strong> with zero advance payment.
            </p>
          </div>

        </form>

        {/* Modal Footer (Pinned at Bottom, ALWAYS visible) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Zero advance fee &bull; 3-Day Free Trial
          </p>
          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="deal-offer-form"
              disabled={loading}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{loading ? 'Sending Offer...' : 'Send Course Offer'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DealOfferModal;
