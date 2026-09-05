'use client';

import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import RatingStars from '../common/RatingStars';
import SanadBadge, { SanadModal } from '../common/SanadBadge';
import StudentAuthModal from '../common/StudentAuthModal';
import FemaleTutorGateModal from '../common/FemaleTutorGateModal';
import ChatRequestModal from '../common/ChatRequestModal';
import { calculateClientCompletion } from '../common/ProfileCompletionMeter';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getTutorAvatar } from '../../utils/tutorHelpers';

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
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sanadModalOpen, setSanadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [femaleGateModalOpen, setFemaleGateModalOpen] = useState(false);
  const [chatRequestModalOpen, setChatRequestModalOpen] = useState(false);

  const data = tutor || tutorProfile || {};
  const tutorUser = data.user || {};
  const tutorName = tutorUser.name || data.name || 'Verified Tutor';
  const tutorCity = tutorUser.city || data.city || 'Pakistan';
  const tutorAvatar = getTutorAvatar(data, tutorName);

  // Resolve teachingModes — could be array or legacy string
  const rawModes = data.teachingModes || (data.teachingMode ? [data.teachingMode] : ['online']);
  const modes = Array.isArray(rawModes) ? rawModes : [rawModes];
  const hasOnline = modes.includes('online');
  const hasInPerson = modes.includes('in_person');

  const isFemaleTutor = data.gender === 'female' || tutorUser.gender === 'female';
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
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
                {data.isSanadVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1 bg-[#143d2b] text-white rounded-full ring-2 ring-white shadow" title="Sanad Verified Faculty">
                    <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
                  </div>
                )}
              </div>

              {/* Name / location / rating */}
              <div className="min-w-0">
                <Link
                  href={`/tutors/${data._id}`}
                  className="font-serif font-black text-sm sm:text-[15px] text-slate-900 hover:text-[#0c2217] transition-colors leading-tight line-clamp-1"
                >
                  {tutorName}
                </Link>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#b85d34] shrink-0" />
                    {tutorCity}
                  </span>
                  <span className="text-slate-300">·</span>
                  {data.gender === 'female' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#b85d34] bg-[#f5ebe6] px-2 py-0.5 rounded-full border border-[#b85d34]/30">
                      <ShieldCheck className="w-3 h-3 text-[#b85d34]" />
                      <span>Verified Female Alimah</span>
                    </span>
                  ) : (
                    <span className="capitalize text-slate-600 font-medium">{data.gender || 'Tutor'}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <RatingStars rating={data.averageRating || 5} size="xs" />
                  <span className="text-[11px] font-bold text-slate-700">
                    {data.averageRating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({data.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Sanad Badge */}
            <div className="shrink-0">
              <SanadBadge
                isVerified={data.isSanadVerified}
                documentsCount={data.sanadDocuments?.length || 0}
                onClick={() => setSanadModalOpen(true)}
              />
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
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e6ded1] text-xs">
            {/* Qualifications */}
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                Qualifications
              </span>
              <p className="font-semibold text-slate-800 text-[11px] truncate">
                {data.qualifications || 'Certified Educator'}
              </p>
            </div>

            {/* Teaching Modes */}
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block">
                Mode & Timing
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

            {user?.role !== 'tutor' && (
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
        documents={data.sanadDocuments || []}
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
