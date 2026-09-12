'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  Award,
  Video,
  Home,
  MessageSquare,
  Star,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Baby,
  Layers,
  Search,
  AlertTriangle,
  GraduationCap,
  Flag
} from 'lucide-react';
import RatingStars from '../../../components/common/RatingStars';
import { SanadModal } from '../../../components/common/SanadBadge';
import StudentAuthModal from '../../../components/common/StudentAuthModal';
import FemaleTutorGateModal from '../../../components/common/FemaleTutorGateModal';
import ChatRequestModal from '../../../components/common/ChatRequestModal';
import ReportReviewModal from '../../../components/common/ReportReviewModal';
import VideoIntroPlayer from '../../../components/common/VideoIntroPlayer';
import { calculateClientCompletion } from '../../../components/common/ProfileCompletionMeter';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { api } from '../../../services/api';
import { getTutorAvatar, parseDegreesAndCertificates } from '../../../utils/tutorHelpers';

export default function TutorProfileClient({ tutor, reviews = [] }) {
  const router = useRouter();
  const { user, isAuthenticated, isTutor } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sanadModalOpen, setSanadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [femaleGateModalOpen, setFemaleGateModalOpen] = useState(false);
  const [chatRequestModalOpen, setChatRequestModalOpen] = useState(false);
  const [authoredCourses, setAuthoredCourses] = useState([]);
  const [reviewsList, setReviewsList] = useState(reviews || []);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReviewToReport, setSelectedReviewToReport] = useState(null);
  const [reportedReviewIds, setReportedReviewIds] = useState(new Set());

  const tutorUser = tutor?.user || {};
  const tutorName = tutorUser.name || 'Verified Tutor';
  const tutorArea = tutor?.localArea || tutorUser.area || tutor?.area || '';
  const tutorCity = tutorUser.city || tutor?.city || 'Pakistan';
  const tutorAvatar = getTutorAvatar(tutor || tutorUser, tutorName);

  const tutorUserId = tutorUser._id || tutorUser.id || tutor?.user?._id || tutor?.user?.id || (typeof tutor?.user === 'string' ? tutor.user : null);
  const tutorUserIdStr = tutorUserId ? tutorUserId.toString() : null;

  const handleOpenReportModal = (rev) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedReviewToReport(rev);
    setReportModalOpen(true);
  };

  const { onlineStatusMap, refreshUserOnlineStatus, isConnected } = useSocket();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial reviews prop if changed
  useEffect(() => {
    if (Array.isArray(reviews) && reviews.length > 0) {
      setReviewsList(reviews);
    }
  }, [reviews]);

  // Client-side fetch fresh reviews on mount to avoid stale ISR cache
  useEffect(() => {
    const idToFetch = tutorUserIdStr || tutor?._id || tutorUser?._id || tutorUser?.id;
    if (idToFetch) {
      api.getTutorReviews(idToFetch).then((res) => {
        if (res?.success && Array.isArray(res.reviews)) {
          setReviewsList(res.reviews);
        }
      }).catch((err) => {
        console.error('Error fetching client-side tutor reviews:', err);
      });
    }
  }, [tutorUserIdStr, tutor?._id, tutorUser?._id]);

  const verifiedSanadDocs = React.useMemo(() => {
    return (Array.isArray(tutor?.sanadDocuments) ? tutor.sanadDocuments : []).filter(
      (doc) => doc?.status === 'verified' || doc?.status === 'approved'
    );
  }, [tutor?.sanadDocuments]);

  const verifiedSanadCount = verifiedSanadDocs.length || (tutor?.isSanadVerified ? 1 : 0);

  const allDegrees = React.useMemo(() => {
    return parseDegreesAndCertificates(tutor?.qualifications, tutor?.sanadDocuments, tutor?.isSanadVerified);
  }, [tutor?.qualifications, tutor?.sanadDocuments, tutor?.isSanadVerified]);

  // Real-time online check, falling back to initial SSR isOnline flag
  const isOnlineLive = tutorUserIdStr ? (onlineStatusMap?.[tutorUserIdStr] === true) : false;
  const isTutorOnline = isOnlineLive || (tutor?.isOnline === true && onlineStatusMap?.[tutorUserIdStr] !== false);

  useEffect(() => {
    if (tutorUserIdStr) {
      refreshUserOnlineStatus(tutorUserIdStr);
    }
  }, [tutorUserIdStr, isConnected]);

  const rawJoiningDate = tutorUser?.createdAt || tutor?.createdAt;
  const rawModes = tutor?.teachingModes || (tutor?.teachingMode ? [tutor?.teachingMode] : ['online']);
  const modes = Array.isArray(rawModes) ? rawModes : [rawModes];
  const hasOnline = modes.includes('online');
  const hasInPerson = modes.includes('in_person') || modes.includes('physical');
  const teachingModeLabel = (hasOnline && hasInPerson) || tutor?.teachingMode === 'both'
    ? 'Online & In-Person'
    : hasOnline
    ? 'Online Classes'
    : hasInPerson
    ? 'In-Person Tutoring'
    : 'Online Classes';
  const formattedJoiningDate = rawJoiningDate
    ? new Date(rawJoiningDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : null;

  const isTutorVisitor = isTutor || user?.role === 'tutor' || (typeof window !== 'undefined' && (() => {
    try {
      const cached = localStorage.getItem('ilm_user');
      return cached ? JSON.parse(cached)?.role === 'tutor' : false;
    } catch (e) {
      return false;
    }
  })());

  const tutorTargetId = tutorUser._id || tutorUser.id || tutor._id;
  const isOwnProfile = Boolean((user?._id || user?.id) && (user?._id || user?.id) === tutorTargetId);

  React.useEffect(() => {
    const fetchCourses = async () => {
      const tutorUserId = tutorUser._id || tutorUser.id;
      if (tutorUserId) {
        try {
          const res = await api.getTutorCourses(tutorUserId);
          if (res?.success) setAuthoredCourses(res.courses || []);
        } catch (err) {
          console.error('Error loading tutor authored courses:', err);
        }
      }
    };
    fetchCourses();
  }, [tutorUser._id, tutorUser.id]);

  const isFemaleTutor = tutor?.gender === 'female' || tutorUser?.gender === 'female';
  const isAlimah =
    /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz/i.test(tutor?.qualifications || '') ||
    /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz|quran|islamic/i.test(tutor?.bio || '') ||
    /alimah/i.test(tutorUser?.name || tutor?.name || '') ||
    (Array.isArray(tutor?.subjects) &&
      tutor.subjects.some((s) => s?.type === 'quran' || /quran|tajweed|hifz|islamic/i.test(s?.name || s?.slug || '')));

  const isMaleTutor = tutor?.gender === 'male' || tutorUser?.gender === 'male';
  const isMaleQuran =
    /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran/i.test(tutor?.qualifications || '') ||
    /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran|islamic/i.test(tutor?.bio || '') ||
    /qari|hafiz/i.test(tutorUser?.name || tutor?.name || '') ||
    (Array.isArray(tutor?.subjects) &&
      tutor.subjects.some((s) => s?.type === 'quran' || /quran|tajweed|hifz|islamic/i.test(s?.name || s?.slug || '')));

  const myId = user?.id || user?._id;
  const conversationId = [myId, tutorTargetId].sort().join('_');

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (user?.role === 'tutor') {
      alert('Tutors cannot message other tutors. Messaging is reserved for student-tutor learning communication.');
      return;
    }

    if (user?.role === 'student' && isFemaleTutor) {
      const { percentage } = calculateClientCompletion(user, null);
      if (percentage < 100) {
        setFemaleGateModalOpen(true);
        return;
      }

      // Check existing chat request status
      try {
        const res = await api.getChatRequestStatus(tutorTargetId);
        if (res?.success) {
          if (res.requestStatus === 'accepted') {
            router.push(`/student/messages?conversation=${conversationId}&tutorId=${tutorTargetId}`);
            return;
          }
          if (res.requestStatus === 'pending') {
            router.push(`/student/messages?conversation=${conversationId}&tutorId=${tutorTargetId}`);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking chat request status:', err);
      }

      // Open request modal
      setChatRequestModalOpen(true);
      return;
    }

    router.push(`/student/messages?conversation=${conversationId}&tutorId=${tutor._id}`);
  };

  return (
    <div className="py-8 bg-[#faf8f5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Profile Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-[#e6ded1] shadow-xs space-y-6">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0 w-full">
              <div className="relative shrink-0">
                <img
                  src={tutorAvatar}
                  alt={tutorName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getTutorAvatar({ name: tutorName }, tutorName);
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-[#e6ded1] shadow-sm"
                />

                {/* Real-time Online / Offline Indicator Dot */}
                {isTutorOnline ? (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 z-10"
                    title="Tutor is Online Now"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 border-2 sm:border-[2.5px] border-white shadow-xs"></span>
                  </span>
                ) : (
                  <span
                    className="absolute -top-1 -right-1 inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-stone-400 border-2 sm:border-[2.5px] border-white shadow-xs z-10"
                    title="Tutor is Offline"
                  />
                )}

                {tutor.isSanadVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#143d2b] text-white rounded-full ring-2 ring-white shadow z-10" title="Sanad Verified">
                    <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-slate-900 leading-tight break-words">
                    {tutorName}
                  </h1>

                  {/* Real-time Online / Offline Badge */}
                  {isTutorOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online Now</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-stone-400" />
                      <span>Offline</span>
                    </span>
                  )}

                  {isFemaleTutor ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#f5ebe6] text-[#b85d34] border border-[#b85d34]/30 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                      <span>{isAlimah ? 'Verified Female Alimah' : 'Verified Female Tutor'}</span>
                    </span>
                  ) : isMaleTutor ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 shrink-0">
                      <span>{isMaleQuran ? 'Male Quran Tutor' : 'Male Academic Tutor'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0eae1] text-[#0c2217] shrink-0">
                      {tutor.gender || 'Teacher'}
                    </span>
                  )}
                  {tutorUser.status === 'under_review' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                      <Search className="w-3 h-3" />
                      <span>Under Review</span>
                    </span>
                  ) : tutorUser.status === 'warned' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Policy Warning</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-[#d4a359]" />
                      <span>Verified Faculty</span>
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm font-medium text-slate-600 flex items-center flex-wrap gap-x-2.5 gap-y-1">
                  <span className="inline-flex items-center gap-1.5 text-slate-800">
                    <MapPin className="w-4 h-4 text-[#b85d34] shrink-0" />
                    <span>City: <strong className="text-slate-900">{tutorCity}</strong></span>
                  </span>
                  {tutorArea && (
                    <>
                      <span className="text-stone-300">&bull;</span>
                      <span className="text-stone-600">Area: <strong className="text-slate-900">{tutorArea}</strong></span>
                    </>
                  )}
                  <span className="text-stone-300">&bull;</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0c2217]">
                    <span className="capitalize">{teachingModeLabel}</span>
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5">
                  {reviewsList.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <RatingStars
                        rating={reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length}
                        size="sm"
                        showScore={false}
                      />
                      <span className="text-xs font-bold text-slate-800">
                        {(reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({reviewsList.length} {reviewsList.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                        New Tutor
                      </span>
                      <span className="text-xs text-slate-400 font-medium">No reviews yet</span>
                    </div>
                  )}

                  {formattedJoiningDate && (
                    <>
                      <span className="text-stone-300">&bull;</span>
                      <span className="inline-flex items-center gap-1 text-xs text-stone-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#b85d34]" />
                        <span>Joined: <strong className="text-slate-800">{formattedJoiningDate}</strong></span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100">
              {verifiedSanadCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSanadModalOpen(true)}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#f0ece1] hover:bg-[#e6ded1] text-[#0c2217] border border-[#d4a359]/50 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
                  title="Inspect verified degrees & Sanad certificates"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Verified Sanad ({verifiedSanadCount})</span>
                  <GraduationCap className="w-4 h-4 text-[#b85d34]" />
                </button>
              )}

              {tutor.videoIntro && (
                <a
                  href="#tutor-video-intro"
                  className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#faf8f5] hover:bg-[#f0ece1] text-[#0c2217] border border-[#e6ded1] hover:border-[#b85d34]/40 transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
                  title="Watch tutor video introduction"
                >
                  <Video className="w-4 h-4 text-[#b85d34]" />
                  <span>Watch Video Intro</span>
                </a>
              )}

              {mounted && !isTutorVisitor && !isOwnProfile && (
                <button
                  onClick={handleStartChat}
                  className="px-6 py-3 bg-[#b85d34] hover:bg-[#9e4e2a] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-[#b85d34]/20 transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message &amp; Discuss Schedule</span>
                </button>
              )}
            </div>

          </div>

          {/* Bio Section */}
          <div className="pt-6 border-t border-slate-100 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">About the Tutor</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {tutor.bio}
            </p>
          </div>

          {/* Key Qualifications, Verified Credentials & Metrics */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {/* Verified Credentials Box - Displays ALL degrees, certificates, and religious Sanads without truncation */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] sm:text-[11px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#b85d34]" />
                  <span>Verified Credentials &amp; Degrees ({allDegrees.length})</span>
                </span>
                {verifiedSanadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSanadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/50 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Sanad Scans ({verifiedSanadCount})</span>
                  </button>
                )}
              </div>

              {/* All degrees rendered cleanly as wrap-friendly badges with green verification checkmark */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {allDegrees.map((degree, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#e6ded1] shadow-2xs text-xs font-bold text-slate-900 group hover:border-[#b85d34]/40 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="break-words leading-snug">{degree}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teaching Experience, Tuition Fee, Platform Member */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Teaching Experience</span>
                <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  {(tutor.experienceYears === 0 || tutor.experienceYears === '0' || tutor.experienceYears === 'fresh') ? (
                    <>
                      <Sparkles className="w-4 h-4 text-[#d4a359] shrink-0" />
                      <span className="text-[#0c2217]">Fresh Tutor (&lt; 1 Yr)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#0c2217] shrink-0" />
                      <span>{tutor.experienceYears || 1} {Number(tutor.experienceYears) === 1 ? 'Year' : 'Years'} Exp</span>
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tuition Fee</span>
                <p className="font-bold text-xs text-[#0c2217] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#d4a359] shrink-0" />
                  <span>Flexible / Negotiable</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Platform Member</span>
                <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#b85d34] shrink-0" />
                  <span>Joined {formattedJoiningDate || 'Recently'}</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Tutor Video Introduction Section (Displayed only if tutor has added one) */}
        {tutor.videoIntro && (
          <div id="tutor-video-intro" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ded1] shadow-2xs space-y-4 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#f0ece1] text-[#0c2217]">
                    <Video className="w-5 h-5 text-[#b85d34]" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 font-serif">
                    Tutor Video Introduction
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Watch {tutorName}&apos;s video introduction and teaching style before booking a session.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#f5ebe6] text-[#b85d34] border border-[#b85d34]/30 shrink-0">
                <Video className="w-3.5 h-3.5 text-[#b85d34]" />
                <span>Verified Video Intro</span>
              </span>
            </div>

            <div className="max-w-3xl mx-auto pt-1">
              <VideoIntroPlayer
                videoUrl={tutor.videoIntro}
                tutorName={tutorName}
              />
            </div>
          </div>
        )}

        {/* Verified Degrees, Sanads & Certifications Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ded1] shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#f0ece1] text-[#0c2217]">
                  <GraduationCap className="w-5 h-5 text-[#b85d34]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-serif">
                  Verified Degrees &amp; Religious Sanads
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                All educational degrees, certificates, and religious Sanads authenticated by IlmiDunya verification committee.
              </p>
            </div>

            {verifiedSanadCount > 0 && (
              <button
                type="button"
                onClick={() => setSanadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0c2217] hover:bg-[#163826] text-[#f5d996] text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                <span>Inspect Verified Scans ({verifiedSanadCount})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {allDegrees.map((degree, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] flex items-start gap-3.5 hover:border-[#b85d34]/40 transition-colors shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#e6ded1] flex items-center justify-center text-[#0c2217] shrink-0 mt-0.5 shadow-2xs">
                  <Award className="w-5 h-5 text-[#b85d34]" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">
                      {degree}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Official credential authenticated and on record with platform administration.
                  </p>
                </div>
              </div>
            ))}
          </div>

          {verifiedSanadDocs.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{verifiedSanadDocs.length} original credential certificate document(s) authenticated.</span>
              </span>
              <button
                type="button"
                onClick={() => setSanadModalOpen(true)}
                className="text-[#b85d34] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Certificate Scans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Subjects & Disciplines Taught */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ded1] shadow-2xs space-y-4">
          <h2 className="text-base font-black text-slate-900 font-serif">Disciplines &amp; Programs Offered</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tutor.subjects?.map((subj) => (
              <div key={subj._id} className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1">
                <h4 className="font-bold text-xs text-slate-900">{subj.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{subj.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Courses Offered by this Tutor */}
        {authoredCourses.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ded1] shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#d4a359] bg-[#0c2217] px-2.5 py-1 rounded-full border border-[#d4a359]/30 tracking-wider">
                  TUTOR-AUTHORED CURRICULUM
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1 font-serif">
                  Structured Courses by {tutorName}
                </h2>
                <p className="text-xs text-slate-500">
                  Enrolling in these tracks includes chapters, video lessons, quizzes, homework assignments &amp; live classes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authoredCourses.map((c) => (
                <div
                  key={c._id}
                  className="rounded-3xl border border-[#e6ded1] overflow-hidden bg-[#faf8f5] hover:border-[#b85d34]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-[#0c2217]">
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="w-full h-full object-cover opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-[#0c2217]/40 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#143d2b] text-[#faf8f5] border border-[#d4a359]/30 shadow-md flex items-center gap-1">
                          <Baby className="w-3 h-3" />
                          <span>{c.targetAudience}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-[#d4a359] border border-[#d4a359]/30">
                          {c.sessionDuration}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="font-black text-base leading-snug line-clamp-1 font-serif">{c.title}</h4>
                        <p className="text-[11px] text-[#d4a359] font-semibold truncate">{c.subtitle}</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#e6ded1]">
                        <span className="font-bold text-slate-800">{c.chapters?.length || 0} Chapters &bull; {c.totalLessons || 0} Lessons</span>
                        <span className="text-[#0c2217] font-bold">PKR {c.priceSuggested?.amount?.toLocaleString() || '3,500'}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/courses/${c.slug}`}
                      className="w-full py-2.5 rounded-xl bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] text-xs font-bold text-center block shadow-md border border-[#d4a359]/30 hover:scale-[1.01] transition-all"
                    >
                      View Syllabus, Tests &amp; Book Trial →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Reviews Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ded1] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 font-serif">
              Student Reviews &amp; Ratings ({reviewsList.length})
            </h2>
            {reviewsList.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <RatingStars
                  rating={reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length}
                  size="xs"
                  showScore={false}
                />
                <span className="text-xs font-bold text-slate-800">
                  {(reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)} / 5.0
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">No ratings yet</span>
            )}
          </div>

          {reviewsList.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No reviews recorded yet for this tutor.</p>
          ) : (
            <div className="space-y-4">
              {reviewsList.map((rev) => {
                const isReported = rev.isReported || reportedReviewIds.has(rev._id);
                return (
                  <div key={rev._id} className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0c2217] text-[#d4a359] font-bold text-xs flex items-center justify-center border border-[#d4a359]/30 shrink-0">
                          {((rev.student?.name || rev.reviewer?.name || 'S').charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">
                            {rev.student?.name || rev.reviewer?.name || 'Verified Student'}
                          </span>
                          {(rev.student?.city || rev.reviewer?.city) && (
                            <span className="text-[10px] text-slate-500 font-medium block">{rev.student?.city || rev.reviewer?.city}</span>
                          )}
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} size="xs" />
                    </div>
                    {rev.comment && <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>}
                    {rev.quickTags && rev.quickTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {rev.quickTags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-[#f0ece1] text-[#0c2217] text-[10px] font-semibold border border-[#d4a359]/30">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenReportModal(rev)}
                        disabled={isReported}
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                          isReported ? 'text-amber-600 cursor-default' : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title={isReported ? 'This review has been reported to administration' : 'Report this review to administration'}
                      >
                        <Flag className="w-3 h-3" />
                        <span>{isReported ? 'Under Admin Review' : 'Report'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-[#e6ded1] shadow-2xl flex items-center gap-2.5">
        <button
          onClick={handleStartChat}
          className="flex-1 py-3 px-4 min-h-[48px] bg-[#b85d34] hover:bg-[#9e4e2a] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#b85d34]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message &amp; Book Free Trial</span>
        </button>

        <button
          onClick={() => setSanadModalOpen(true)}
          className="py-3 px-3.5 min-h-[48px] bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 active:bg-[#e6ded1] transition-colors shrink-0"
          title="Inspect verified credentials"
        >
          <ShieldCheck className="w-4 h-4 text-[#0c2217]" />
          <span>Sanad</span>
        </button>
      </div>

      {/* Sanad Modal */}
      <SanadModal
        isOpen={sanadModalOpen}
        onClose={() => setSanadModalOpen(false)}
        documents={verifiedSanadDocs.length > 0 ? verifiedSanadDocs : (tutor.sanadDocuments || [])}
        degrees={allDegrees}
        tutorName={tutorName}
      />

      {/* Student Login / Registration Modal */}
      <StudentAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        tutor={tutor}
      />

      {/* Female Tutor Gate Modal (<100% profile strength) */}
      <FemaleTutorGateModal
        isOpen={femaleGateModalOpen}
        onClose={() => setFemaleGateModalOpen(false)}
        user={user}
        tutorName={tutorName}
        tutorAvatar={tutorAvatar}
      />

      {/* Female Tutor Message Request Modal (100% profile strength) */}
      <ChatRequestModal
        isOpen={chatRequestModalOpen}
        onClose={() => setChatRequestModalOpen(false)}
        tutor={tutor}
        studentUser={user}
        onSuccess={() => {
          setTimeout(() => {
            router.push(`/student/messages?conversation=${conversationId}&tutorId=${tutorTargetId}`);
          }, 1200);
        }}
      />

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
  );
}

