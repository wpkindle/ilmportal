'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Calendar,
  Lock,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';

export default function StudentProfileModal({
  isOpen,
  onClose,
  studentId,
  studentData = null
}) {
  const [profile, setProfile] = useState(studentData);
  const [loading, setLoading] = useState(!studentData && !!studentId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentData) {
      setProfile(studentData);
    } else if (isOpen && studentId) {
      let isMounted = true;
      setLoading(true);
      setError('');
      api.getStudentProfileForTutor(studentId)
        .then((res) => {
          if (isMounted) {
            if (res.success && res.student) {
              setProfile({
                ...res.student,
                is100Percent: res.is100Percent,
                profileStrength: res.profileStrength,
                latestRequest: res.latestRequest,
                latestDeal: res.latestDeal
              });
            } else {
              setError(res.message || 'Unable to load student profile.');
            }
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Error fetching student profile.');
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, studentId, studentData]);

  if (!isOpen) return null;

  const studentName = profile?.name || 'Verified Student';
  const studentAvatar = profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0c2217&color=d4a359`;
  const studentAge = profile?.age;
  const studentGender = profile?.gender;
  const studentCity = profile?.city || 'Pakistan';
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg md:max-w-3xl lg:max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#07150e] text-white p-4 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-[#143d2b] border border-[#d4a359]/40 rounded-2xl text-[#d4a359] shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a359] bg-[#143d2b] px-2.5 py-0.5 rounded-full border border-[#d4a359]/40">
                Verified Student Profile
              </span>
              <h2 className="text-base sm:text-xl font-black text-white mt-0.5">
                Student Overview
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body - Responsive Landscape Grid on Desktop */}
        <div className="p-4 sm:p-6 md:p-7 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#d4a359] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-slate-500">Loading student details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
              
              {/* Left Column (Desktop Landscape): Primary Identity & Status */}
              <div className="md:col-span-5 space-y-4">
                {/* Identity Hero Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-b from-[#faf8f5] to-[#f4eee4] border border-[#e8dfcf] flex flex-col items-center text-center space-y-3 shadow-2xs">
                  <div className="relative">
                    <img
                      src={studentAvatar}
                      alt={studentName}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-3xl object-cover border-4 border-white shadow-md ring-2 ring-[#d4a359]/40"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#0c2217] text-[#f5d996] border border-[#d4a359]/40 shadow-xs" title="Verified Learner">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-tight">
                      {studentName}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span className="font-semibold">{studentCity}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#0c2217] border border-[#d4a359]/50 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>100% Profile Strength</span>
                  </span>

                  {joinedDate && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-2 border-t border-[#ebe3d3] w-full justify-center">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Member since {joinedDate}</span>
                    </div>
                  )}
                </div>

                {/* Account Status Pill */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Account Status</span>
                  <span className="text-xs font-black text-[#0c2217] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Active &amp; Verified</span>
                  </span>
                </div>

                {/* Active Deal / Course Card (if any) */}
                {profile?.latestDeal && (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Course / Deal</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/30">
                        {profile.latestDeal.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <BookOpen className="w-4 h-4 text-[#d4a359]" />
                      <span className="truncate">{profile.latestDeal.subject || 'Tuition Deal'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (Desktop Landscape): Key Details, Learning Goals, Privacy */}
              <div className="md:col-span-7 space-y-4">
                {/* 2x2 Key Student Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Student Age</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 block">
                      {studentAge ? `${studentAge} Years Old` : 'Age Not Specified'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gender</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 capitalize block">
                      {studentGender || 'Student'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">City / Location</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 block">
                      {studentCity}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tuition Mode</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 block">
                      Online 1-on-1
                    </span>
                  </div>
                </div>

                {/* Message Request Inquiry & Learning Goals (if any) */}
                {profile?.latestRequest?.details && (
                  <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#d4a359]/40 space-y-2 text-xs shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#0c2217]">
                      <MessageSquare className="w-4 h-4 text-[#d4a359]" />
                      <span>Inquiry &amp; Learning Goals:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-[#e6dfd5]">
                      &ldquo;{profile.latestRequest.details}&rdquo;
                    </p>
                  </div>
                )}

                {/* Safe Platform Privacy & Child Safety Protection Notice */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-start gap-3 shadow-2xs">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black text-amber-950 block text-xs">
                      Contact Privacy &amp; Child Safety Protection
                    </span>
                    <p className="text-amber-800/90 text-[11px] leading-relaxed">
                      Personal contact details (email address, mobile/WhatsApp number) are private and kept strictly confidential by IlmiDunya for student safety. Please conduct all conversations, tuition agreements, and classes inside IlmiDunya.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
            <span>Official Verified Student Record • IlmiDunya Academic Council</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
