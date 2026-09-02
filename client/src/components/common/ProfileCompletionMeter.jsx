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
  ArrowRight
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

export default function ProfileCompletionMeter({ user, tutorProfile, className = '', alwaysShow = false }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { percentage, items } = calculateClientCompletion(user, tutorProfile);

  // Once 100% complete, do not show on profile or portal pages (unless forced)
  if (percentage >= 100 && !alwaysShow) {
    return null;
  }

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const remainingItems = items.filter((i) => !i.done);

  const getBarColor = (pct) => {
    if (pct >= 85) return 'from-emerald-500 to-teal-500';
    if (pct >= 60) return 'from-emerald-500 to-amber-500';
    if (pct >= 35) return 'from-amber-400 to-amber-500';
    return 'from-rose-500 to-rose-400';
  };

  const getStatusBadge = () => {
    if (percentage === 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Completed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>{percentage}% Complete</span>
      </span>
    );
  };

  return (
    <div className={`p-4 sm:p-5 bg-white rounded-3xl border border-amber-200/90 shadow-sm space-y-3.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
            <span>Profile Strength & Completion</span>
            {getStatusBadge()}
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

      {/* Quick Action Badges for Remaining Items (Visible without opening checklist) */}
      {remainingItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-bold text-slate-500">Remaining to reach 100%:</span>
          {remainingItems.slice(0, 4).map((item) => (
            <Link
              key={item.key}
              href={item.link}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 transition-all cursor-pointer"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3 h-3 text-emerald-600" />
            </Link>
          ))}
          {remainingItems.length > 4 && (
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              +{remainingItems.length - 4} more
            </button>
          )}
        </div>
      )}

      {/* Verification State Callout for Tutor */}
      {user?.role === 'tutor' && (
        <div className="pt-1">
          {tutorProfile?.verificationStatus === 'approved' ? (
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Sanad & Degree: Your profile is Approved and publicly visible on Pakistan search filters.</span>
            </div>
          ) : tutorProfile?.verificationStatus === 'rejected' ? (
            <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Application Rejected: {tutorProfile?.rejectionReason || 'Please re-upload clear educational degrees for review.'}</span>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pending Admin Review: Your uploaded degrees are currently in the verification queue before going live.</span>
            </div>
          )}
        </div>
      )}

      {/* Detailed Checklist Accordion with Direct Action Links */}
      {detailsOpen && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in">
          {items.map((item) => (
            <div
              key={item.key}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition-all ${
                item.done
                  ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                  : 'bg-white border-amber-200/90 shadow-2xs text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className={`truncate ${item.done ? 'font-medium text-emerald-900' : 'font-bold text-slate-800'}`}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.done ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Done (+{item.weight}%)
                  </span>
                ) : (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-all hover:scale-102 cursor-pointer"
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

