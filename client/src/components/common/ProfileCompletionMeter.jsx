'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  Award,
  Search,
  User,
  GraduationCap
} from 'lucide-react';

export const calculateClientCompletion = (user, tutorProfile) => {
  if (!user) return { percentage: 0, items: [] };

  if (user.role === 'tutor') {
    const checks = [
      {
        key: 'name',
        label: 'Full Name',
        weight: 10,
        done: !!user.name?.trim(),
        link: '/tutor/profile#profile-name',
        actionLabel: 'Set Name'
      },
      {
        key: 'email',
        label: 'Verified Email',
        weight: 10,
        done: !!user.isVerified,
        link: `/verify-email?email=${encodeURIComponent(user?.email || '')}&role=tutor`,
        actionLabel: 'Verify Email'
      },
      {
        key: 'phone',
        label: 'WhatsApp Mobile Number',
        weight: 10,
        done: !!user.phone?.trim(),
        link: '/tutor/profile#profile-phone',
        actionLabel: 'Add Phone'
      },
      {
        key: 'avatar',
        label: 'Profile Picture',
        weight: 15,
        done: !!user.avatar?.trim(),
        link: '/tutor/profile#profile-avatar',
        actionLabel: 'Upload Photo'
      },
      {
        key: 'age',
        label: 'Tutor Age',
        weight: 10,
        done: !!user.age,
        link: '/tutor/profile#profile-age',
        actionLabel: 'Set Age'
      },
      {
        key: 'gender',
        label: 'Gender',
        weight: 5,
        done: !!user.gender && user.gender.trim() !== '',
        link: '/tutor/profile#profile-gender',
        actionLabel: 'Set Gender'
      },
      {
        key: 'city',
        label: 'City Location',
        weight: 10,
        done: !!user.city && user.city.trim() !== '',
        link: '/tutor/profile#profile-city',
        actionLabel: 'Select City'
      },
      {
        key: 'bio',
        label: 'Teaching Bio & Headline',
        weight: 10,
        done: !!tutorProfile?.bio?.trim() && tutorProfile.bio.length > 20 && !tutorProfile.bio.includes('Assalam-o-Alaikum! I am an experienced tutor on IlmPortal'),
        link: '/tutor/profile#profile-bio',
        actionLabel: 'Write Bio'
      },
      {
        key: 'qualifications',
        label: 'Educational Qualifications',
        weight: 10,
        done: !!tutorProfile?.qualifications?.trim() && tutorProfile.qualifications !== 'Tutor Qualifications',
        link: '/tutor/profile#profile-qualifications',
        actionLabel: 'Add Degrees'
      },
      {
        key: 'sanad',
        label: 'Sanad / Degree Certificate',
        weight: 10,
        done: Array.isArray(tutorProfile?.sanadDocuments) && tutorProfile.sanadDocuments.length > 0,
        link: '/tutor/profile#profile-sanads',
        actionLabel: 'Upload Sanad'
      }
    ];

    const percentage = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return { percentage, items: checks };
  } else {
    // Student
    const checks = [
      {
        key: 'name',
        label: 'Student Name',
        weight: 15,
        done: !!user.name?.trim(),
        link: '/student/profile#profile-name',
        actionLabel: 'Set Name'
      },
      {
        key: 'email',
        label: 'Verified Email',
        weight: 15,
        done: !!user.isVerified,
        link: `/verify-email?email=${encodeURIComponent(user?.email || '')}&role=student`,
        actionLabel: 'Verify Email'
      },
      {
        key: 'phone',
        label: 'Mobile / WhatsApp Number',
        weight: 15,
        done: !!user.phone?.trim() || !!user.guardianPhone?.trim(),
        link: '/student/profile#profile-phone',
        actionLabel: 'Add Phone'
      },
      {
        key: 'avatar',
        label: 'Profile Picture',
        weight: 15,
        done: !!user.avatar?.trim(),
        link: '/student/profile#profile-avatar',
        actionLabel: 'Upload Photo'
      },
      {
        key: 'age',
        label: 'Student Age',
        weight: 15,
        done: !!user.age,
        link: '/student/profile#profile-age',
        actionLabel: 'Set Age'
      },
      {
        key: 'gender',
        label: 'Gender',
        weight: 10,
        done: !!user.gender && user.gender.trim() !== '',
        link: '/student/profile#profile-gender',
        actionLabel: 'Set Gender'
      },
      {
        key: 'city',
        label: 'City Location',
        weight: 15,
        done: !!user.city && user.city.trim() !== '',
        link: '/student/profile#profile-city',
        actionLabel: 'Select City'
      }
    ];

    const percentage = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return { percentage, items: checks };
  }
};

export default function ProfileCompletionMeter({
  user,
  tutorProfile,
  className = '',
  alwaysShow = false,
  showGreeting = true
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { percentage, items } = calculateClientCompletion(user, tutorProfile);
  const isApproved = tutorProfile?.verificationStatus === 'approved';
  const isTutor = user?.role === 'tutor';

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const remainingItems = items.filter((i) => !i.done);

  const getBarColor = (pct) => {
    if (pct >= 85) return 'from-[#d4a359] via-[#b85d34] to-[#d4a359]';
    if (pct >= 60) return 'from-[#d4a359] to-amber-500';
    if (pct >= 35) return 'from-amber-400 to-amber-500';
    return 'from-rose-500 to-rose-400';
  };

  const getStatusBadge = (isDark = false) => {
    if (percentage === 100) {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
          isDark
            ? 'bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40'
            : 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
          <span>100% Completed</span>
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        isDark
          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
          : 'bg-amber-100 text-amber-900 border border-amber-200'
      }`}>
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>{percentage}% Complete</span>
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 1. UNIFIED GREETING & PROFILE STRENGTH TAB (Default)
  // ─────────────────────────────────────────────────────────────
  if (showGreeting) {
    return (
      <div
        className={`bg-[#0c2217] text-[#faf8f5] rounded-3xl p-6 sm:p-8 border border-[#d4a359]/30 shadow-[0_8px_30px_rgba(12,34,23,0.12)] relative overflow-hidden space-y-5 ${className}`}
      >
        {/* Top Gold Shimmer Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359]" />

        {/* Ambient Effects & Islamic Star Watermark */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#143d2b]/40 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-[#d4a359]/15 blur-2xl pointer-events-none animate-float-slow" />
        <div className="absolute -right-12 -top-12 w-48 h-48 pointer-events-none opacity-15 animate-spin-slow">
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="#d4a359" strokeWidth="1" strokeDasharray="4 6" />
            <rect x="55" y="55" width="90" height="90" stroke="#d4a359" strokeWidth="1" />
            <rect x="55" y="55" width="90" height="90" transform="rotate(45 100 100)" stroke="#d4a359" strokeWidth="1" />
          </svg>
        </div>

        {/* ── Top Header Row: User Name & Action Buttons ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            {/* Role Assurance Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {isTutor ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#d4a359] text-[#0c2217] shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isApproved ? 'Verified Sanad Tutor • IlmPortal Pakistan' : 'Sanad Verification Pending'}
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4a359] bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 border border-[#d4a359]/20">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Talib-e-Ilm &bull; Learning Space
                </span>
              )}
            </div>

            {/* Profile User Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#faf8f5] tracking-tight">
              {user?.name || (isTutor ? 'Mu’allim' : 'Talib-e-Ilm')}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
            {isTutor ? (
              <>
                <Link
                  href="/tutor/messages"
                  className="px-4 py-2.5 bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat &amp; Send Offers</span>
                </Link>
                <Link
                  href={`/tutors/${user?.username || user?._id}`}
                  className="px-4 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>View Public Profile</span>
                </Link>
                <Link
                  href="/tutor/profile"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#faf8f5] font-semibold text-xs rounded-xl transition-all flex items-center gap-2 border border-white/20 hover:scale-[1.02] cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#d4a359]" />
                  <span>Edit Profile &amp; Sanad</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/tutors"
                  className="px-4 py-2.5 bg-[#d4a359] hover:bg-[#c39248] active:bg-[#b08139] text-[#0c2217] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Verified Tutors</span>
                </Link>
                <Link
                  href="/student/certificates"
                  className="px-4 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <Award className="w-4 h-4 text-white" />
                  <span>My Certificates</span>
                </Link>
                <Link
                  href="/student/messages"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#faf8f5] font-semibold text-xs rounded-xl transition-all flex items-center gap-2 border border-white/20 hover:scale-[1.02] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#d4a359]" />
                  <span>Messages &amp; Class</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Lower Section: Profile Strength & Progress Bar (on SAME tab) ── */}
        <div className="pt-4 border-t border-[#d4a359]/20 space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Profile Strength</span>
              </span>
              {getStatusBadge(true)}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#d4a359]">
                {percentage >= 100 ? 'Peak Visibility: 100 / 100' : `${percentage} / 100`}
              </span>
              {remainingItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="p-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer border border-white/15"
                >
                  <span>{detailsOpen ? 'Hide Checklist' : `Missing Fields (${remainingItems.length})`}</span>
                  {detailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-900/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-[#d4a359]/30">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percentage)} transition-all duration-500 shadow-sm`}
              style={{ width: `${Math.max(percentage, 5)}%` }}
            />
          </div>

          {/* Quick Action Badges for Remaining Items (if < 100%) */}
          {remainingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-stone-400">Complete to reach 100%:</span>
              {remainingItems.slice(0, 4).map((item) => (
                <Link
                  key={item.key}
                  href={item.link}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#143d2b] hover:bg-[#1e543c] text-[#d4a359] text-[11px] font-bold border border-[#d4a359]/40 transition-all cursor-pointer"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3 text-[#d4a359]" />
                </Link>
              ))}
              {remainingItems.length > 4 && (
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="text-[11px] font-bold text-[#d4a359] hover:underline cursor-pointer"
                >
                  +{remainingItems.length - 4} more
                </button>
              )}
            </div>
          )}

          {/* Verification State Callout for Tutor */}
          {isTutor && (
            <div className="pt-1">
              {tutorProfile?.verificationStatus === 'approved' ? (
                <div className="p-2.5 bg-[#143d2b]/60 rounded-xl border border-[#d4a359]/40 flex items-center gap-2 text-xs font-medium text-stone-200">
                  <ShieldCheck className="w-4 h-4 text-[#d4a359] shrink-0" />
                  <span>Verified Sanad &amp; Degree: Your profile is Approved and publicly visible across Pakistan.</span>
                </div>
              ) : tutorProfile?.verificationStatus === 'rejected' ? (
                <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-500/40 flex items-center gap-2 text-xs font-medium text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Application Clarification: {tutorProfile?.rejectionReason || 'Please re-upload clear educational degrees for review.'}</span>
                </div>
              ) : (
                <div className="p-2.5 bg-[#143d2b]/40 rounded-xl border border-[#d4a359]/20 flex items-center gap-2 text-xs font-medium text-stone-300">
                  <Clock className="w-4 h-4 text-[#d4a359] shrink-0" />
                  <span>Pending Verification: Your degrees are in the verification queue before full public listing.</span>
                </div>
              )}
            </div>
          )}

          {/* Detailed Checklist Accordion */}
          {detailsOpen && (
            <div className="pt-3 border-t border-[#d4a359]/20 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
              {items.map((item) => (
                <div
                  key={item.key}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                    item.done
                      ? 'bg-[#143d2b]/50 border-[#d4a359]/30 text-stone-200'
                      : 'bg-white/5 border-amber-400/30 text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className={`truncate ${item.done ? 'font-medium text-stone-300' : 'font-bold text-white'}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.done ? (
                      <span className="text-[10px] font-bold text-[#d4a359] bg-[#143d2b] border border-[#d4a359]/30 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    ) : (
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. EMBEDDED PROFILE COMPLETION WIDGET (when showGreeting=false, e.g. on profile page)
  // ─────────────────────────────────────────────────────────────
  if (percentage >= 100) {
    return (
      <div className={`p-4 sm:p-5 bg-white rounded-3xl border border-[#d4a359]/40 shadow-sm space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0c2217]">Profile Strength</span>
            {getStatusBadge(false)}
          </div>
          <span className="text-xs font-mono font-bold text-[#d4a359]">100 / 100</span>
        </div>
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-200">
          <div className="h-full rounded-full bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359] w-full shadow-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 bg-white rounded-3xl border border-amber-200/90 shadow-sm space-y-3.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
            <span>Profile Strength &amp; Completion</span>
            {getStatusBadge(false)}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            {completedCount} of {totalCount} profile settings provided. Complete the remaining {remainingItems.length} field(s) to reach 100%.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="self-start sm:self-center p-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <span>{detailsOpen ? 'Hide Remaining Checklist' : `Complete Missing (${remainingItems.length})`}</span>
          {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percentage)} transition-all duration-500 shadow-xs`}
          style={{ width: `${Math.max(percentage, 5)}%` }}
        />
      </div>

      {/* Quick Action Badges for Remaining Items */}
      {remainingItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-bold text-slate-500">Remaining to reach 100%:</span>
          {remainingItems.slice(0, 4).map((item) => (
            <Link
              key={item.key}
              href={item.link}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#f0ece1] hover:bg-[#e6dfd5] text-[#0c2217] text-[11px] font-bold border border-[#d4a359]/40 transition-all cursor-pointer"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3 h-3 text-[#b85d34]" />
            </Link>
          ))}
          {remainingItems.length > 4 && (
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-[11px] font-bold text-[#b85d34] hover:underline cursor-pointer"
            >
              +{remainingItems.length - 4} more
            </button>
          )}
        </div>
      )}

      {/* Verification State Callout for Tutor */}
      {isTutor && (
        <div className="pt-1">
          {tutorProfile?.verificationStatus === 'approved' ? (
            <div className="p-2.5 bg-[#f0ece1] rounded-2xl border border-[#d4a359]/40 flex items-center gap-2 text-xs font-bold text-[#0c2217]">
              <ShieldCheck className="w-4 h-4 text-[#d4a359] shrink-0" />
              <span>Verified Sanad &amp; Degree: Your profile is Approved and publicly visible on Pakistan search filters.</span>
            </div>
          ) : tutorProfile?.verificationStatus === 'rejected' ? (
            <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Application Clarification: {tutorProfile?.rejectionReason || 'Please re-upload clear educational degrees for review.'}</span>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pending Admin Review: Your uploaded degrees are currently in the verification queue before going live.</span>
            </div>
          )}
        </div>
      )}

      {/* Detailed Checklist Accordion */}
      {detailsOpen && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in">
          {items.map((item) => (
            <div
              key={item.key}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition-all ${
                item.done
                  ? 'bg-[#faf8f5] border-[#e6dfd5] text-stone-900'
                  : 'bg-white border-amber-200/90 shadow-2xs text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className={`truncate ${item.done ? 'font-medium text-[#0c2217]' : 'font-bold text-slate-800'}`}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.done ? (
                  <span className="text-[10px] font-bold text-[#0c2217] bg-[#f0ece1] border border-[#d4a359]/30 px-2 py-0.5 rounded-full">
                    Done (+{item.weight}%)
                  </span>
                ) : (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-[11px] font-bold shadow-2xs transition-all hover:scale-102 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

