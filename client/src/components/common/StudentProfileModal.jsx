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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#07150e] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#143d2b] border border-[#d4a359]/40 rounded-2xl text-[#d4a359]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a359] bg-[#143d2b] px-2.5 py-0.5 rounded-full border border-[#d4a359]/40">
                Verified Student Profile
              </span>
              <h2 className="text-lg font-black text-white mt-1">
                Student Overview
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#d4a359] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-slate-500">Loading student details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 text-center">
              {error}
            </div>
          ) : (
            <>
              {/* Profile Card Header */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={studentAvatar}
                  alt={studentName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {studentName}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
                      <span>100% Profile Strength</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>{studentCity}</span>
                    </span>
                    {joinedDate && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Member since {joinedDate}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Personal & Academic Details Grid (Age, Gender, City, Status) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Student Age</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 block">
                    {studentAge ? `${studentAge} Years Old` : 'Age Not Specified'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gender</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 capitalize block">
                    {studentGender || 'Student'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">City / Location</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 block">
                    {studentCity}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Status</span>
                  <span className="text-xs sm:text-sm font-black text-[#0c2217] mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Active &amp; Verified</span>
                  </span>
                </div>
              </div>

              {/* Safe Platform Notice: Contact Details Kept Confidential */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
                <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-black text-slate-800 block text-[11px]">
                    Contact Privacy &amp; Child Safety Protection
                  </span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Personal contact details (email address, username, password, and mobile/WhatsApp number) are private and kept strictly confidential by IlmPortal for student safety. Please conduct all conversations, tuition agreements, and classes inside IlmPortal.
                  </p>
                </div>
              </div>

              {/* Message Request Inquiry & Learning Goals (if any) */}
              {profile?.latestRequest?.details && (
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#d4a359]/40 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#0c2217]">
                    <MessageSquare className="w-4 h-4 text-[#0c2217]" />
                    <span>Inquiry &amp; Learning Goals:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed italic bg-white/80 p-3 rounded-xl border border-[#e6dfd5]">
                    &ldquo;{profile.latestRequest.details}&rdquo;
                  </p>
                </div>
              )}

              {/* Deal Status (if any) */}
              {profile?.latestDeal && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Deal / Course</span>
                    <span className="font-bold text-slate-800">{profile.latestDeal.subject || 'Tuition Deal'}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase bg-[#f0ece1] text-[#0c2217]">
                    {profile.latestDeal.status}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
