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
  Search,
  User,
  GraduationCap
} from 'lucide-react';

export const calculateClientCompletion = (user, tutorProfile) => {
  if (!user) return { percentage: 0, items: [] };

  const isTutor = user.role === 'tutor' || !!tutorProfile;
  if (isTutor) {
    const hasApprovedSanad = Array.isArray(tutorProfile?.sanadDocuments) &&
      tutorProfile.sanadDocuments.length > 0 &&
      tutorProfile.sanadDocuments.some(
        (doc) => doc.status === 'verified' || doc.status === 'approved'
      );

    const hasUploadedSanad = Array.isArray(tutorProfile?.sanadDocuments) && tutorProfile.sanadDocuments.length > 0;
    const hasPendingSanad = hasUploadedSanad && !hasApprovedSanad;

    const checks = [
      {
        key: 'name',
        label: 'Full Name',
        weight: 10,
        done: !!user.name?.trim(),
        tab: 'personal',
        targetFieldId: 'profile-name',
        link: '/tutor/profile?tab=personal#profile-name',
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
        key: 'avatar',
        label: 'Profile Picture',
        weight: 10,
        done: !!user.avatar?.trim(),
        tab: 'personal',
        targetFieldId: 'profile-avatar',
        link: '/tutor/profile?tab=personal#profile-avatar',
        actionLabel: 'Upload Photo'
      },
      {
        key: 'age',
        label: 'Tutor Age',
        weight: 5,
        done: !!user.age,
        tab: 'personal',
        targetFieldId: 'profile-age',
        link: '/tutor/profile?tab=personal#profile-age',
        actionLabel: 'Set Age'
      },
      {
        key: 'gender',
        label: 'Gender',
        weight: 5,
        done: !!(user.gender?.trim() || tutorProfile?.gender?.trim()),
        tab: 'personal',
        targetFieldId: 'profile-gender',
        link: '/tutor/profile?tab=personal#profile-gender',
        actionLabel: 'Set Gender'
      },
      {
        key: 'city',
        label: 'City Location',
        weight: 10,
        done: !!(user.city?.trim() || tutorProfile?.city?.trim()),
        tab: 'personal',
        targetFieldId: 'profile-city',
        link: '/tutor/profile?tab=personal#profile-city',
        actionLabel: 'Select City'
      },
      {
        key: 'subjects',
        label: 'Subjects & Classes',
        weight: 10,
        done: Array.isArray(tutorProfile?.subjects) && tutorProfile.subjects.length > 0,
        tab: 'personal',
        targetFieldId: 'profile-subjects',
        link: '/tutor/profile?tab=personal#profile-subjects',
        actionLabel: 'Select Subjects'
      },
      {
        key: 'bio',
        label: 'Teaching Bio & Headline',
        weight: 15,
        done: !!tutorProfile?.bio?.trim() && tutorProfile.bio.length > 20 && !tutorProfile.bio.includes('Assalam-o-Alaikum! I am an experienced tutor on IlmPortal') && !tutorProfile.bio.includes('Assalam-o-Alaikum! I am an experienced tutor on IlmiDunya'),
        tab: 'personal',
        targetFieldId: 'profile-bio',
        link: '/tutor/profile?tab=personal#profile-bio',
        actionLabel: 'Write Bio'
      },
      {
        key: 'qualifications',
        label: 'Educational Qualifications',
        weight: 10,
        done: !!tutorProfile?.qualifications?.trim() && tutorProfile.qualifications !== 'Tutor Qualifications',
        tab: 'degrees',
        targetFieldId: 'profile-qualifications',
        link: '/tutor/profile?tab=degrees#profile-qualifications',
        actionLabel: 'Add Degrees'
      },
      {
        key: 'sanad',
        label: hasApprovedSanad
          ? 'Sanad / Degree Approved'
          : hasPendingSanad
            ? 'Sanad / Degree (Pending Admin Review)'
            : 'Sanad / Degree Document',
        weight: 15,
        done: hasApprovedSanad,
        tab: 'degrees',
        targetFieldId: 'profile-sanads',
        link: '/tutor/profile?tab=degrees#profile-sanads',
        actionLabel: hasApprovedSanad
          ? 'Approved'
          : hasPendingSanad
            ? 'Pending Review'
            : 'Upload Sanad'
      },
      {
        key: 'paymentMethods',
        label: 'Payment Method (Optional)',
        weight: 0,
        optional: true,
        done: Array.isArray(tutorProfile?.paymentMethods) && tutorProfile.paymentMethods.length > 0,
        tab: 'payments',
        targetFieldId: 'profile-payment-methods',
        link: '/tutor/profile?tab=payments#profile-payment-methods',
        actionLabel: Array.isArray(tutorProfile?.paymentMethods) && tutorProfile.paymentMethods.length > 0
          ? 'Manage Methods'
          : 'Add Method (Optional)'
      }
    ];

    const percentage = Math.min(100, Math.max(0, checks.filter(c => !c.optional).reduce((sum, item) => sum + (item.done ? item.weight : 0), 0)));
    return { percentage, items: checks };
  } else {
    // Student
    const checks = [
      {
        key: 'name',
        label: 'Student Name',
        weight: 20,
        done: !!user.name?.trim(),
        link: '/student/profile#profile-name',
        actionLabel: 'Set Name'
      },
      {
        key: 'email',
        label: 'Verified Email',
        weight: 20,
        done: !!user.isVerified,
        link: `/verify-email?email=${encodeURIComponent(user?.email || '')}&role=student`,
        actionLabel: 'Verify Email'
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
        weight: 15,
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

    const percentage = Math.min(100, Math.max(0, checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0)));
    return { percentage, items: checks };
  }
};

export default function ProfileCompletionMeter({
  user,
  tutorProfile,
  className = '',
  alwaysShow = false,
  showGreeting = true,
  onNavigate,
  onTabSelect
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { percentage, items } = calculateClientCompletion(user, tutorProfile);

  const handleItemClick = (e, item) => {
    if (!item) return;

    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    // External link (e.g. /verify-email)
    if (item.key === 'email' || item.link?.startsWith('/verify-email')) {
      if (typeof window !== 'undefined') {
        window.location.href = item.link;
      }
      return;
    }

    // 1. Direct onTabSelect callback to immediately switch active tab
    if (onTabSelect && item.tab) {
      onTabSelect(item.tab, item.targetFieldId);
      return;
    }

    // 2. Direct DOM Tab Button click: physically trigger the tab button if on profile page
    if (typeof window !== 'undefined' && item.tab) {
      const tabBtn = document.getElementById(`tab-btn-${item.tab}`);
      if (tabBtn) {
        tabBtn.click();
        if (item.targetFieldId) {
          setTimeout(() => {
            const el = document.getElementById(item.targetFieldId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              el.classList.add('ring-4', 'ring-[#d4a359]', 'ring-offset-4', 'transition-all', 'duration-500');
              setTimeout(() => el.classList.remove('ring-4', 'ring-[#d4a359]', 'ring-offset-4'), 2500);
            }
          }, 120);
        }
        return;
      }
    }

    // 3. Direct onNavigate callback
    if (onNavigate) {
      onNavigate(item.link || item.tab, item);
      return;
    }

    // 4. Fallback navigation: when clicked from another page (e.g. /tutor/dashboard)
    if (typeof window !== 'undefined') {
      const targetUrl = item.link || `/tutor/profile?tab=${item.tab || 'personal'}`;
      window.location.href = targetUrl;
    }
  };
  const isApproved = tutorProfile?.verificationStatus === 'approved';
  const isTutor = user?.role === 'tutor' || !!tutorProfile;
  const hasPendingSanad = isTutor &&
    Array.isArray(tutorProfile?.sanadDocuments) &&
    tutorProfile.sanadDocuments.length > 0 &&
    !tutorProfile.sanadDocuments.some(
      (doc) => doc.status === 'verified' || doc.status === 'approved'
    );

  const completedCount = items.filter((i) => i.done && !i.optional).length;
  const totalCount = items.filter((i) => !i.optional).length;
  const remainingItems = items.filter((i) => !i.done && !i.optional);

  const getBarColor = (pct) => {
    if (pct >= 85) return 'from-[#d4a359] via-[#b85d34] to-[#d4a359]';
    if (pct >= 60) return 'from-[#d4a359] to-amber-500';
    if (pct >= 35) return 'from-amber-400 to-amber-500';
    return 'from-rose-500 to-rose-400';
  };

  const getStatusBadge = (isDark = false) => {
    if (percentage >= 100) {
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
        className={`bg-white text-[#141c19] rounded-3xl p-6 sm:p-8 border-2 border-[#d4a359]/40 shadow-xl relative overflow-hidden space-y-5 ${className}`}
      >
        {/* Top Gold Shimmer Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359]" />

        {/* Ambient Effects & Islamic Star Watermark */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#f5f0e6] blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-[#d4a359]/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-48 h-48 pointer-events-none opacity-10 animate-spin-slow">
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#f5f0e6] text-[#0c2217] border border-[#d4a359]/40 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                  {isApproved ? 'Verified Sanad Tutor • IlmiDunya Pakistan' : 'Sanad Verification Pending'}
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#b85d34] bg-[#f5f0e6] px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#d4a359]/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Talib-e-Ilm &bull; Learning Space
                </span>
              )}
            </div>

            {/* Profile User Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#0c2217] tracking-tight">
              {user?.name || (isTutor ? 'Mu’allim' : 'Talib-e-Ilm')}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
            {isTutor ? (
              <>
                <Link
                  href="/tutor/messages"
                  className="px-4 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat &amp; Send Offers</span>
                </Link>
                <Link
                  href={`/tutors/${user?.username || user?._id}`}
                  className="px-4 py-2.5 bg-[#f5f0e6] hover:bg-[#ebe3d3] text-[#0c2217] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 border border-[#ebe3d3] hover:scale-[1.02] cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#b85d34]" />
                  <span>View Public Profile</span>
                </Link>
                <Link
                  href="/tutor/profile"
                  className="px-4 py-2.5 bg-white hover:bg-stone-50 text-[#0c2217] font-semibold text-xs rounded-xl transition-all flex items-center gap-2 border border-stone-300 hover:scale-[1.02] cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-[#b85d34]" />
                  <span>Edit Profile &amp; Sanad</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/tutors"
                  className="px-4 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Verified Tutors</span>
                </Link>
                <Link
                  href="/student/messages"
                  className="px-4 py-2.5 bg-[#f5f0e6] hover:bg-[#ebe3d3] text-[#0c2217] font-semibold text-xs rounded-xl transition-all flex items-center gap-2 border border-[#ebe3d3] hover:scale-[1.02] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#b85d34]" />
                  <span>Messages &amp; Class</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Lower Section: Profile Strength & Progress Bar (on SAME tab) ── */}
        <div className="pt-4 border-t border-[#ebe3d3] space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#0c2217] flex items-center gap-2">
                <span>Profile Strength</span>
              </span>
              {getStatusBadge(true)}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#b85d34]">
                {percentage >= 100 ? 'Peak Visibility: 100 / 100' : `${percentage} / 100`}
              </span>
              {remainingItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="p-1 px-2.5 rounded-lg bg-[#faf8f5] hover:bg-[#f5f0e6] text-stone-700 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer border border-[#ebe3d3]"
                >
                  <span>{detailsOpen ? 'Hide Checklist' : `Missing Fields (${remainingItems.length})`}</span>
                  {detailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percentage)} transition-all duration-500 shadow-sm`}
              style={{ width: `${Math.min(100, Math.max(percentage, 5))}%` }}
            />
          </div>

          {/* Quick Action Badges for Remaining Items (if < 100%) */}
          {remainingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-stone-500">Complete to reach 100%:</span>
              {remainingItems.slice(0, 4).map((item) => {
                const isExternal = item.key === 'email' || item.link?.startsWith('/verify-email');
                if (isExternal) {
                  return (
                    <Link
                      key={item.key}
                      href={item.link}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f5f0e6] text-[#0c2217] text-[11px] font-bold border border-[#ebe3d3] transition-all cursor-pointer shadow-xs"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 text-[#b85d34]" />
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={(e) => handleItemClick(e, item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f5f0e6] text-[#0c2217] text-[11px] font-bold border border-[#ebe3d3] transition-all cursor-pointer shadow-xs"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 text-[#b85d34]" />
                  </button>
                );
              })}
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
              {percentage < 100 ? (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 flex items-center gap-2 text-xs font-medium text-amber-950">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {hasPendingSanad
                      ? `Profile Under Review (${percentage}%): Your uploaded Sanad document is awaiting admin review to reach 100% profile health.`
                      : `Incomplete Profile (${percentage}%): 100% profile health is strictly required to be listed publicly in the tutor directory.`}
                  </span>
                </div>
              ) : tutorProfile?.verificationStatus === 'approved' ? (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center gap-2 text-xs font-medium text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Sanad &amp; Degree: Your profile is 100% complete, Approved, and publicly visible across Pakistan.</span>
                </div>
              ) : tutorProfile?.verificationStatus === 'rejected' ? (
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-300 flex items-center gap-2 text-xs font-medium text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Application Clarification: {tutorProfile?.rejectionReason || 'Please re-upload clear educational degrees for review.'}</span>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 flex items-center gap-2 text-xs font-medium text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pending Verification: Your 100% completed profile is in the verification queue before full public listing.</span>
                </div>
              )}
            </div>
          )}

          {/* Detailed Checklist Accordion */}
          {detailsOpen && (
            <div className="pt-3 border-t border-[#ebe3d3] grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
              {items.map((item) => (
                <div
                  key={item.key}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                    item.done
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : item.optional
                      ? 'bg-stone-50/80 border-stone-200 text-stone-700'
                      : 'bg-[#faf8f5] border-[#ebe3d3] text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : item.optional ? (
                      <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className={`truncate ${item.done ? 'font-medium text-stone-600' : item.optional ? 'font-medium text-stone-600' : 'font-bold text-[#0c2217]'}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.done ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                        {item.optional ? 'Provided (Optional)' : 'Done'}
                      </span>
                    ) : item.key === 'email' || item.link?.startsWith('/verify-email') ? (
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleItemClick(e, item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-xs transition-all cursor-pointer ${
                          item.optional
                            ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                            : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
                        }`}
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
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
          style={{ width: `${Math.min(100, Math.max(percentage, 5))}%` }}
        />
      </div>

      {/* Quick Action Badges for Remaining Items */}
      {remainingItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-bold text-slate-500">Remaining to reach 100%:</span>
          {remainingItems.slice(0, 4).map((item) => {
            const isExternal = item.key === 'email' || item.link?.startsWith('/verify-email');
            if (isExternal) {
              return (
                <Link
                  key={item.key}
                  href={item.link}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#f0ece1] hover:bg-[#e6dfd5] text-[#0c2217] text-[11px] font-bold border border-[#d4a359]/40 transition-all cursor-pointer"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3 text-[#b85d34]" />
                </Link>
              );
            }
            return (
              <button
                key={item.key}
                type="button"
                onClick={(e) => handleItemClick(e, item)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#f0ece1] hover:bg-[#e6dfd5] text-[#0c2217] text-[11px] font-bold border border-[#d4a359]/40 transition-all cursor-pointer"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3 h-3 text-[#b85d34]" />
              </button>
            );
          })}
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
          {percentage < 100 ? (
            <div className="p-2.5 bg-amber-50/80 rounded-2xl border border-amber-300 flex items-center gap-2 text-xs font-bold text-amber-950">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {hasPendingSanad
                  ? `Profile Under Review (${percentage}%): Your uploaded Sanad document is awaiting admin review to reach 100% profile health.`
                  : `Incomplete Profile (${percentage}%): 100% profile health is strictly required to be listed publicly in the tutor directory.`}
              </span>
            </div>
          ) : tutorProfile?.verificationStatus === 'approved' ? (
            <div className="p-2.5 bg-[#f0ece1] rounded-2xl border border-[#d4a359]/40 flex items-center gap-2 text-xs font-bold text-[#0c2217]">
              <ShieldCheck className="w-4 h-4 text-[#d4a359] shrink-0" />
              <span>Verified Sanad &amp; Degree: Your profile is 100% complete, Approved, and publicly visible on Pakistan search filters.</span>
            </div>
          ) : tutorProfile?.verificationStatus === 'rejected' ? (
            <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Application Clarification: {tutorProfile?.rejectionReason || 'Please re-upload clear educational degrees for review.'}</span>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pending Admin Review: Your 100% completed profile is currently in the verification queue before going live.</span>
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
                  : item.optional
                  ? 'bg-stone-50 border-stone-200 text-stone-700'
                  : 'bg-white border-amber-200/90 shadow-2xs text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                ) : item.optional ? (
                  <Circle className="w-4 h-4 text-stone-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className={`truncate ${item.done ? 'font-medium text-[#0c2217]' : item.optional ? 'font-medium text-stone-600' : 'font-bold text-slate-800'}`}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.done ? (
                  <span className="text-[10px] font-bold text-[#0c2217] bg-[#f0ece1] border border-[#d4a359]/30 px-2 py-0.5 rounded-full">
                    {item.optional ? 'Provided (Optional)' : `Done (+${item.weight}%)`}
                  </span>
                ) : item.key === 'email' || item.link?.startsWith('/verify-email') ? (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-[11px] font-bold shadow-2xs transition-all hover:scale-102 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleItemClick(e, item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xs transition-all hover:scale-102 cursor-pointer ${
                      item.optional
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                        : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

