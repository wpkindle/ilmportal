'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Video,
  Home,
  MessageSquare,
  Sparkles,
  Wifi,
  User,
  Award,
  CheckCircle2
} from 'lucide-react';
import RatingStars from '../common/RatingStars';
import { SanadModal } from '../common/SanadBadge';
import StudentAuthModal from '../common/StudentAuthModal';
import FemaleTutorGateModal from '../common/FemaleTutorGateModal';
import ChatRequestModal from '../common/ChatRequestModal';
import { calculateClientCompletion } from '../common/ProfileCompletionMeter';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import { getTutorAvatar, parseDegreesAndCertificates } from '../../utils/tutorHelpers';

// ─────────────────────────────────────────────
// Mode Badge
// ─────────────────────────────────────────────
const ModeBadge = ({ mode }) => {
  const isOnline = mode === 'online';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        isOnline
          ? 'bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/30'
          : 'bg-[#ede6db] text-slate-700'
      }`}
    >
      {isOnline ? (
        <Wifi className="w-2.5 h-2.5 text-[#d4a359]" />
      ) : (
        <Home className="w-2.5 h-2.5 text-slate-500" />
      )}
      {isOnline ? 'Online' : 'In-Person'}
    </span>
  );
};

// ─────────────────────────────────────────────
// Card Wrapper (Gentle Zoom on Hover, non-3D)
// ─────────────────────────────────────────────
const CardHoverWrapper = ({ children }) => {
  return (
    <div className="relative h-full transition-transform duration-200 ease-out hover:scale-[1.02] will-change-transform">
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main TutorCard
// ─────────────────────────────────────────────
const TutorCard = ({ tutor, tutorProfile }) => {
  const { user, isAuthenticated, isTutor } = useAuth();
  const { onlineStatusMap } = useSocket();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sanadModalOpen, setSanadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [femaleGateModalOpen, setFemaleGateModalOpen] = useState(false);
  const [chatRequestModalOpen, setChatRequestModalOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const data = tutor || tutorProfile || {};
  const tutorUser = data.user || {};
  const tutorName = tutorUser.name || data.name || 'Verified Tutor';
  const tutorCity = tutorUser.city || data.city || 'Pakistan';
  const tutorArea = data.localArea || tutorUser.area || data.area || '';
  const tutorAvatar = getTutorAvatar(data, tutorName);
  const verifiedSanadDocs = React.useMemo(() => {
    return (Array.isArray(data.sanadDocuments) ? data.sanadDocuments : []).filter(
      (doc) => doc?.status === 'verified' || doc?.status === 'approved'
    );
  }, [data.sanadDocuments]);

  const verifiedSanadCount = verifiedSanadDocs.length || (data.isSanadVerified ? 1 : 0);
  const hasVerifiedSanad = verifiedSanadCount > 0;

  const cardDegrees = React.useMemo(() => {
    return parseDegreesAndCertificates(data.qualifications, data.sanadDocuments, data.isSanadVerified);
  }, [data.qualifications, data.sanadDocuments, data.isSanadVerified]);

  const tutorUserId = tutorUser._id || tutorUser.id || data?.user?._id || data?.user?.id || (typeof data?.user === 'string' ? data.user : null);
  const tutorUserIdStr = tutorUserId ? tutorUserId.toString() : null;

  const isOnlineLive = tutorUserIdStr ? (onlineStatusMap?.[tutorUserIdStr] === true) : false;
  const isTutorOnline = isOnlineLive || (data?.isOnline === true && onlineStatusMap?.[tutorUserIdStr] !== false);

  const isTutorVisitor = isTutor || user?.role === 'tutor' || (typeof window !== 'undefined' && (() => {
    try {
      const cached = localStorage.getItem('ilm_user');
      return cached ? JSON.parse(cached)?.role === 'tutor' : false;
    } catch (e) {
      return false;
    }
  })());

  const targetTutorId = tutorUser._id || tutorUser.id || data._id;
  const isOwnCard = Boolean((user?._id || user?.id) && (user?._id || user?.id) === targetTutorId);

  // Resolve teachingModes — could be array or legacy string
  const rawModes = data.teachingModes || (data.teachingMode ? [data.teachingMode] : ['online']);
  const modes = Array.isArray(rawModes) ? rawModes : [rawModes];
  const hasOnline = modes.includes('online');
  const hasInPerson = modes.includes('in_person');

  const isFemaleTutor = data.gender === 'female' || tutorUser.gender === 'female';
  const isAlimah =
    /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz/i.test(data.qualifications || '') ||
    /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz|quran|islamic/i.test(data.bio || '') ||
    /alimah/i.test(tutorName || '') ||
    (Array.isArray(data.subjects) &&
      data.subjects.some((s) => s?.type === 'quran' || /quran|tajweed|hifz|islamic/i.test(s?.name || s?.slug || '')));

  const isMaleTutor = data.gender === 'male' || tutorUser.gender === 'male';
  const isMaleQuran =
    /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran/i.test(data.qualifications || '') ||
    /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran|islamic/i.test(data.bio || '') ||
    /qari|hafiz/i.test(tutorName || '') ||
    (Array.isArray(data.subjects) &&
      data.subjects.some((s) => s?.type === 'quran' || /quran|tajweed|hifz|islamic/i.test(s?.name || s?.slug || '')));

  const tutorTargetId = tutorUser._id || tutorUser.id || data._id;
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

      // Student has 100% profile strength but needs to submit request
      setChatRequestModalOpen(true);
      return;
    }

    router.push(`/student/messages?conversation=${conversationId}&tutorId=${data._id}`);
  };

  return (
    <>
      <CardHoverWrapper>
      <div className="bg-white rounded-3xl border border-[#e6ded1] p-4 sm:p-5 md:p-6 shadow-sm flex flex-col justify-between h-full gap-4 transition-all duration-300 hover:border-[#b85d34]/40 hover:shadow-md">

        {/* ── Body ── */}
        <div className="space-y-3.5">

          {/* Top Header Row */}
          <div className="flex items-start gap-3 w-full">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={tutorAvatar}
                alt={tutorName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getTutorAvatar({ name: tutorName }, tutorName);
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md"
              />

              {/* Real-time Online / Offline Indicator Dot */}
              {isTutorOnline ? (
                <span
                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 z-10"
                  title="Online Now"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white shadow-xs"></span>
                </span>
              ) : (
                <span
                  className="absolute -top-1 -right-1 inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-stone-400 border-2 border-white shadow-xs z-10"
                  title="Offline"
                />
              )}

              {data.isSanadVerified && (
                <div className="absolute -bottom-1 -right-1 p-1 bg-[#143d2b] text-white rounded-full ring-2 ring-white shadow z-10" title="Sanad Verified Faculty">
                  <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
                </div>
              )}
            </div>

            {/* Name / location / rating */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <Link
                  href={`/tutors/${data._id}`}
                  className="font-serif font-black text-sm sm:text-base text-slate-900 hover:text-[#0c2217] transition-colors leading-tight truncate"
                  title={tutorName}
                >
                  {tutorName}
                </Link>
                {isTutorOnline ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold text-stone-500 bg-stone-100 border border-stone-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    <span>Offline</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                  <MapPin className="w-3 h-3 text-[#b85d34] shrink-0" />
                  <span className="truncate">{tutorArea ? `${tutorArea}, ${tutorCity}` : tutorCity}</span>
                </span>
                <span className="text-slate-300">·</span>
                {isFemaleTutor ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#b85d34] bg-[#f5ebe6] px-2 py-0.5 rounded-full border border-[#b85d34]/30 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-[#b85d34]" />
                    <span>{isAlimah ? 'Verified Female Alimah' : 'Verified Female Tutor'}</span>
                  </span>
                ) : isMaleTutor ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0c2217] bg-[#f0ece1] px-2 py-0.5 rounded-full border border-[#d4a359]/30 shrink-0">
                    <span>{isMaleQuran ? 'Male Quran Tutor' : 'Male Academic Tutor'}</span>
                  </span>
                ) : (
                  <span className="capitalize text-slate-600 font-medium shrink-0">{data.gender || 'Tutor'}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={data.averageRating || 5} size="xs" showScore={false} />
                  <span className="text-[11px] font-bold text-slate-700">
                    {data.averageRating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({data.totalReviews || 0} reviews)
                  </span>
                </div>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faf8f5] border border-[#e6ded1] text-slate-700 shrink-0">
                  {(data.experienceYears === 0 || data.experienceYears === '0' || data.experienceYears === 'fresh') ? (
                    <>
                      <Sparkles className="w-3 h-3 text-[#d4a359]" />
                      <span className="text-[#0c2217]">Fresh Tutor</span>
                    </>
                  ) : (
                    <span>{data.experienceYears || 1} yrs exp</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2">
            {data.bio ||
              'Experienced verified tutor available for online live classes and academic guidance.'}
          </p>

          {/* Subject Badges */}
          <div className="flex flex-wrap gap-1.5">
            {data.subjects?.slice(0, 3).map((subj) => (
              <span
                key={subj._id || subj}
                className="text-[10.5px] font-semibold bg-[#f0eae1] text-[#0c2217] border border-[#e6ded1] px-2.5 py-0.5 rounded-lg whitespace-nowrap"
              >
                {subj.name || subj}
              </span>
            ))}
            {data.subjects?.length > 3 && (
              <span className="text-[10px] font-bold text-slate-400 self-center">
                +{data.subjects.length - 3} more
              </span>
            )}
          </div>

          {/* Credentials + Mode row */}
          <div className="pt-3 border-t border-[#e6ded1] space-y-2 text-xs">
            {/* Qualifications */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#b85d34]" />
                  <span>Qualifications</span>
                </span>

                {hasVerifiedSanad && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSanadModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/50 hover:bg-[#e6dfd5] transition-colors shadow-2xs cursor-pointer shrink-0"
                    title="Click to inspect verified degrees & Sanad certificates"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>{verifiedSanadCount > 0 ? `Sanad (${verifiedSanadCount})` : 'Verified Sanad'}</span>
                  </button>
                )}
              </div>

              {/* Only verified Sanad degrees visible */}
              <div className="flex flex-wrap gap-1.5">
                {cardDegrees.map((deg, dIdx) => (
                  <span
                    key={dIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#faf8f5] text-slate-800 border border-[#e6ded1]"
                    title={deg}
                  >
                    {hasVerifiedSanad ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Award className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    )}
                    <span>{deg}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Teaching Modes */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Teaching Mode
              </span>
              <div className="flex flex-wrap gap-1">
                {hasOnline && <ModeBadge mode="online" />}
                {hasInPerson && <ModeBadge mode="in_person" />}
                {!hasOnline && !hasInPerson && <ModeBadge mode="online" />}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Action Row ── */}
        <div className="pt-3 border-t border-[#e6ded1] flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
              Tuition Rate
            </span>
            <p className="text-xs font-bold text-[#0c2217] flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-[#d4a359] shrink-0" />
              <span>Direct Agreed Rate</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/tutors/${data._id}`}
              className="px-3 py-2 rounded-xl text-slate-700 hover:text-[#0c2217] hover:bg-[#f5f0e6] border border-[#e6ded1] transition-all text-xs font-bold"
            >
              Profile
            </Link>

            {mounted && !isTutorVisitor && !isOwnCard && (
              <motion.button
                onClick={handleStartChat}
                whileTap={{ scale: 0.94 }}
                className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md shadow-[#b85d34]/25 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Message Tutor</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </CardHoverWrapper>

      {/* Sanad Preview Modal */}
      <SanadModal
        isOpen={sanadModalOpen}
        onClose={() => setSanadModalOpen(false)}
        documents={verifiedSanadDocs.length > 0 ? verifiedSanadDocs : (data.sanadDocuments || [])}
        degrees={cardDegrees}
        tutorName={tutorName}
      />

      {/* Student Login / Registration Modal */}
      <StudentAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        tutor={data}
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
        tutor={data}
        studentUser={user}
        onSuccess={() => {
          setTimeout(() => {
            router.push(`/student/messages?conversation=${conversationId}&tutorId=${tutorTargetId}`);
          }, 1200);
        }}
      />
    </>
  );
};

export default TutorCard;
