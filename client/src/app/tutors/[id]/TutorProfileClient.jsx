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
  AlertTriangle
} from 'lucide-react';
import RatingStars from '../../../components/common/RatingStars';
import SanadBadge, { SanadModal } from '../../../components/common/SanadBadge';
import StudentAuthModal from '../../../components/common/StudentAuthModal';
import FemaleTutorGateModal from '../../../components/common/FemaleTutorGateModal';
import ChatRequestModal from '../../../components/common/ChatRequestModal';
import { calculateClientCompletion } from '../../../components/common/ProfileCompletionMeter';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { api } from '../../../services/api';
import { getTutorAvatar } from '../../../utils/tutorHelpers';

export default function TutorProfileClient({ tutor, reviews = [] }) {
  const router = useRouter();
  const { user, isAuthenticated, isTutor } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sanadModalOpen, setSanadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [femaleGateModalOpen, setFemaleGateModalOpen] = useState(false);
  const [chatRequestModalOpen, setChatRequestModalOpen] = useState(false);
  const [authoredCourses, setAuthoredCourses] = useState([]);

  const { onlineStatusMap, refreshUserOnlineStatus, isConnected } = useSocket();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const tutorUser = tutor?.user || {};
  const tutorName = tutorUser.name || 'Verified Tutor';
  const tutorArea = tutor?.localArea || tutorUser.area || tutor?.area || '';
  const tutorCity = tutorUser.city || tutor?.city || 'Pakistan';
  const tutorAvatar = getTutorAvatar(tutor || tutorUser, tutorName);

  const tutorUserId = tutorUser._id || tutorUser.id || tutor?.user?._id || tutor?.user?.id || (typeof tutor?.user === 'string' ? tutor.user : null);
  const tutorUserIdStr = tutorUserId ? tutorUserId.toString() : null;

  // Real-time online check, falling back to initial SSR isOnline flag
  const isOnlineLive = tutorUserIdStr ? (onlineStatusMap?.[tutorUserIdStr] === true) : false;
  const isTutorOnline = isOnlineLive || (tutor?.isOnline === true && onlineStatusMap?.[tutorUserIdStr] !== false);

  useEffect(() => {
    if (tutorUserIdStr) {
      refreshUserOnlineStatus(tutorUserIdStr);
    }
  }, [tutorUserIdStr, isConnected]);

  const rawJoiningDate = tutorUser?.createdAt || tutor?.createdAt;
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ded1] shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
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

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-slate-900">{tutorName}</h1>

                  {/* Real-time Online / Offline Badge */}
                  {isTutorOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online Now</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                      <span className="w-2 h-2 rounded-full bg-stone-400" />
                      <span>Offline</span>
                    </span>
                  )}

                  {isFemaleTutor ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#f5ebe6] text-[#b85d34] border border-[#b85d34]/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                      <span>{isAlimah ? 'Verified Female Alimah' : 'Verified Female Tutor'}</span>
                    </span>
                  ) : isMaleTutor ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40">
                      <span>{isMaleQuran ? 'Male Quran Tutor' : 'Male Academic Tutor'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0eae1] text-[#0c2217]">
                      {tutor.gender || 'Teacher'}
                    </span>
                  )}
                  {tutorUser.status === 'under_review' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-800 border border-orange-200">
                      <Search className="w-3 h-3" />
                      <span>Under Review</span>
                    </span>
                  ) : tutorUser.status === 'warned' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Policy Warning</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40">
                      <CheckCircle2 className="w-3 h-3 text-[#d4a359]" />
                      <span>Verified Faculty</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center flex-wrap gap-x-2 gap-y-1">
                  <span className="inline-flex items-center gap-1.5 text-slate-800">
                    <MapPin className="w-4 h-4 text-[#b85d34] shrink-0" />
                    <span>City: <strong className="text-slate-900">{tutorCity}</strong></span>
                    {tutorArea && (
                      <span className="text-stone-600 font-medium">&bull; Area: <strong className="text-slate-900">{tutorArea}</strong></span>
                    )}
                  </span>
                  <span className="text-stone-300">&bull;</span>
                  <span className="capitalize">{tutor.teachingMode === 'both' ? 'Online & In-Person' : tutor.teachingMode}</span>
                </p>

                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <RatingStars rating={tutor.averageRating || 5} size="sm" />
                    <span className="text-xs font-bold text-slate-800">
                      {tutor.averageRating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({reviews.length} reviews)
                    </span>
                  </div>

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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <SanadBadge
                isVerified={tutor.isSanadVerified}
                documentsCount={tutor.sanadDocuments?.length || 0}
                onClick={() => setSanadModalOpen(true)}
              />

              {mounted && !isTutorVisitor && !isOwnProfile && (
                <button
                  onClick={handleStartChat}
                  className="px-6 py-3 bg-[#b85d34] hover:bg-[#9e4e2a] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#b85d34]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Key Qualifications & Subjects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Verified Credentials</span>
              <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate" title={tutor.qualifications || 'Dars-e-Nizami / Shahadat-ul-Alimiyya'}>
                <Award className="w-4 h-4 text-[#0c2217] shrink-0" />
                <span className="truncate">{tutor.qualifications || 'Dars-e-Nizami / Shahadat-ul-Alimiyya'}</span>
              </p>
            </div>

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
              <span className="text-[10px] uppercase font-bold text-slate-400">Platform Member</span>
              <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#b85d34] shrink-0" />
                <span>Joined {formattedJoiningDate || 'Recently'}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tuition Fee</span>
              <p className="font-bold text-xs text-[#0c2217] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4a359] shrink-0" />
                <span>Flexible / Negotiable</span>
              </p>
            </div>
          </div>

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
            <h2 className="text-base font-black text-slate-900 font-serif">Student Reviews &amp; Ratings ({reviews.length})</h2>
            <div className="flex items-center gap-1.5">
              <RatingStars rating={tutor.averageRating || 5} size="xs" />
              <span className="text-xs font-bold text-slate-800">{tutor.averageRating?.toFixed(1) || '5.0'} / 5.0</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No reviews recorded yet for this tutor.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {rev.student?.name || 'Verified Student'}
                    </span>
                    <RatingStars rating={rev.rating} size="xs" />
                  </div>
                  <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
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
        documents={tutor.sanadDocuments || []}
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

    </div>
  );
}

