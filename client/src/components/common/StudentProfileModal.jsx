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
  XCircle,
  AlertCircle,
  Clock,
  BookOpen,
  MessageSquare,
  Globe,
  Star,
  GraduationCap,
  Flag
} from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import ReportReviewModal from './ReportReviewModal';
import { calculateClientCompletion } from './ProfileCompletionMeter';

export default function StudentProfileModal({
  isOpen,
  onClose,
  studentId,
  studentData = null
}) {
  const [profile, setProfile] = useState(studentData);
  const [loading, setLoading] = useState(!studentData && !!studentId);
  const [error, setError] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReviewToReport, setSelectedReviewToReport] = useState(null);
  const [reportedReviewIds, setReportedReviewIds] = useState(new Set());

  useEffect(() => {
    if (studentData) {
      setProfile((prev) => ({ ...(prev || {}), ...studentData }));
    }
    if (isOpen && studentId) {
      let isMounted = true;
      if (!studentData) setLoading(true);
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
                latestDeal: res.latestDeal,
                tuitionsHistory: res.tuitionsHistory || [],
                reviews: res.reviews || []
              });
            } else if (!studentData) {
              setError(res.message || 'Unable to load student profile.');
            }
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            if (!studentData) {
              setError(err.message || 'Error fetching student profile.');
            }
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, studentId, studentData]);

  if (!isOpen) return null;

  const studentName = profile?.name || 'Student';
  const studentAvatar = profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0c2217&color=d4a359`;
  const studentAge = profile?.age;
  const studentGender = profile?.gender;
  const studentCity = profile?.city || '';
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  // Accurately compute client completion and use API strength if present
  const clientCalc = calculateClientCompletion(profile || {}, null);
  const strengthPercentage = typeof profile?.profileStrength === 'number'
    ? profile.profileStrength
    : clientCalc.percentage;
  const is100Percent = strengthPercentage >= 100;
  const isVerifiedEmail = Boolean(profile?.isVerified);
  const checklistItems = clientCalc.items || [];

  const rawMode = profile?.tuitionMode || profile?.preferredMode || 'both';
  const modeBadge = (() => {
    if (rawMode === 'both') {
      return {
        label: 'Online & In-Person',
        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200'
      };
    }
    if (rawMode === 'in_person') {
      return {
        label: 'In-Person Only',
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-200'
      };
    }
    return {
      label: 'Online Only',
      badgeClass: 'text-blue-800 bg-blue-50 border-blue-200'
    };
  })();

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
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                is100Percent && isVerifiedEmail
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                  : 'text-amber-300 bg-amber-950/60 border-amber-500/40'
              }`}>
                {is100Percent && isVerifiedEmail
                  ? '100% Verified Profile'
                  : `${strengthPercentage}% Profile Strength`}
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
            <div className="py-12 flex items-center justify-center">
              <LoadingSpinner size="md" />
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
                    {is100Percent && isVerifiedEmail ? (
                      <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#0c2217] text-[#f5d996] border border-[#d4a359]/40 shadow-xs" title="100% Verified Learner">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-500 text-white border border-amber-300 shadow-xs" title={`${strengthPercentage}% Profile Strength`}>
                        <Clock className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-tight">
                      {studentName}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span className="font-semibold">{studentCity || 'City Not Specified'}</span>
                    </div>
                  </div>

                  {is100Percent && isVerifiedEmail ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Profile Strength</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{strengthPercentage}% Profile Strength</span>
                    </span>
                  )}

                  {/* Profile Health Progress Bar */}
                  <div className="w-full space-y-1.5 pt-1 px-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">Profile Health</span>
                      <span className={`font-mono font-black ${is100Percent ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {strengthPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          is100Percent ? 'bg-emerald-600' : strengthPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(strengthPercentage, 5)}%` }}
                      />
                    </div>
                    {!is100Percent && (
                      <p className="text-[10.5px] text-amber-800 font-medium leading-tight">
                        Fresh / Incomplete Profile ({strengthPercentage}% filled)
                      </p>
                    )}
                  </div>

                  {/* Checklist breakdown for incomplete profile */}
                  {!is100Percent && checklistItems.length > 0 && (
                    <div className="w-full text-[10.5px] text-slate-600 bg-white p-2.5 rounded-2xl border border-[#ebe3d3] space-y-1 text-left">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider">
                        Completion Checklist
                      </span>
                      <div className="space-y-1">
                        {checklistItems.map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span className="truncate">{item.label}</span>
                            {item.done ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5 shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Done</span>
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium flex items-center gap-0.5 shrink-0">
                                <Clock className="w-3 h-3 text-amber-500" />
                                <span>Missing</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {joinedDate && (
                    <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 pt-2 border-t border-[#ebe3d3] w-full justify-center">
                      <Calendar className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>Joined {joinedDate}</span>
                    </div>
                  )}
                </div>

                {/* Account Status Pill */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Account Status</span>
                  {isVerifiedEmail ? (
                    is100Percent ? (
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active &amp; 100% Complete</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Email Verified ({strengthPercentage}% Profile)</span>
                      </span>
                    )
                  ) : (
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Unverified Account ({strengthPercentage}%)</span>
                    </span>
                  )}
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
                    <span className={`text-xs sm:text-sm font-black mt-1 block ${studentAge ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
                      {studentAge ? `${studentAge} Years Old` : 'Not Specified'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gender</span>
                    <span className={`text-xs sm:text-sm font-black mt-1 capitalize block ${studentGender ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
                      {studentGender || 'Not Specified'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">City / Location</span>
                    <span className={`text-xs sm:text-sm font-black mt-1 block ${studentCity ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
                      {studentCity || 'Not Specified'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tuition Mode</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border ${modeBadge.badgeClass}`}>
                        {rawMode === 'both' ? (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : rawMode === 'in_person' ? (
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                        <span>{modeBadge.label}</span>
                      </span>
                    </div>
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

                {/* Tuitions History (if does) */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0c2217] flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#d4a359]" />
                      <span>Tuitions History</span>
                    </span>
                    {profile?.tuitionsHistory && profile.tuitionsHistory.length > 0 ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#143d2b] text-[#f5d996]">
                        {profile.tuitionsHistory.length} {profile.tuitionsHistory.length === 1 ? 'Tuition' : 'Tuitions'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        New Student
                      </span>
                    )}
                  </div>

                  {profile?.tuitionsHistory && profile.tuitionsHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {profile.tuitionsHistory.map((t, idx) => (
                        <div key={t._id || idx} className="p-2.5 rounded-xl bg-white border border-[#e6dfd5] text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="min-w-0 space-y-0.5">
                            <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                              <span className="truncate">{t.subject || 'Tuition Course'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span className="font-medium text-slate-600">
                                {t.mode === 'in_person' ? 'In-Person (Home)' : 'Online WebRTC'}
                              </span>
                              {t.createdAt && (
                                <span>• {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                              )}
                              {t.tutor?.name && (
                                <span className="truncate">• Tutor: {t.tutor.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {t.status === 'completed' && (
                              (t.isReviewed || t.isStudentReviewed) ? (
                                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                                  <span>Reviewed</span>
                                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                  Review Pending
                                </span>
                              )
                            )}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/30">
                              {t.status ? t.status.replace(/_/g, ' ') : 'Active'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] italic bg-white p-3 rounded-xl border border-slate-100">
                      No prior tuition history recorded yet on IlmiDunya.
                    </p>
                  )}
                </div>

                {/* Reviews & Ratings (if does) */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0c2217] flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Reviews &amp; Feedback</span>
                    </span>
                    {profile?.reviews && profile.reviews.length > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {profile.reviews.length} {profile.reviews.length === 1 ? 'Review' : 'Reviews'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        0 Reviews
                      </span>
                    )}
                  </div>

                  {profile?.reviews && profile.reviews.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {profile.reviews.map((r, idx) => (
                        <div key={r._id || idx} className="p-3 rounded-xl bg-white border border-[#e6dfd5] text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${star <= (r.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                                />
                              ))}
                              <span className="text-[11px] font-black text-slate-800 ml-1">
                                {r.rating || 5}.0
                              </span>
                            </div>
                            {r.createdAt && (
                              <span className="text-[10px] text-slate-400">
                                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          {r.comment && (
                            <p className="text-slate-700 italic text-[11px] leading-relaxed">
                              &ldquo;{r.comment}&rdquo;
                            </p>
                          )}
                          {r.quickTags && r.quickTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {r.quickTags.map((tag, tIdx) => (
                                <span key={tIdx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9.5px] font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            {(r.reviewer?.name || r.tutor?.name) ? (
                              <div className="text-[10px] font-medium text-slate-500">
                                Feedback from Tutor: {r.reviewer?.name || r.tutor?.name}
                              </div>
                            ) : <div />}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReviewToReport(r);
                                setReportModalOpen(true);
                              }}
                              disabled={r.isReported || reportedReviewIds.has(r._id)}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                                (r.isReported || reportedReviewIds.has(r._id))
                                  ? 'text-amber-600 cursor-default'
                                  : 'text-slate-400 hover:text-rose-600'
                              }`}
                              title={(r.isReported || reportedReviewIds.has(r._id)) ? 'Reported to admin' : 'Report this review to admin'}
                            >
                              <Flag className="w-2.5 h-2.5" />
                              <span>{(r.isReported || reportedReviewIds.has(r._id)) ? 'Reported' : 'Report'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] italic bg-white p-3 rounded-xl border border-slate-100">
                      No reviews recorded yet for this student.
                    </p>
                  )}
                </div>

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
            <span>Official Student Profile Record &bull; IlmiDunya Learning Portal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Report Review Modal */}
        <ReportReviewModal
          review={selectedReviewToReport}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSuccess={(revId) => {
            setReportedReviewIds((prev) => new Set([...prev, revId]));
          }}
        />
      </div>
    </div>
  );
}
