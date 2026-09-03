'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Video,
  Home,
  MessageSquare,
  Sparkles,
  Wifi,
  User,
  Heart
} from 'lucide-react';
import RatingStars from '../common/RatingStars';
import SanadBadge, { SanadModal } from '../common/SanadBadge';
import StudentAuthModal from '../common/StudentAuthModal';
import FemaleTutorGateModal from '../common/FemaleTutorGateModal';
import ChatRequestModal from '../common/ChatRequestModal';
import { calculateClientCompletion } from '../common/ProfileCompletionMeter';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// ─────────────────────────────────────────────
// Mode Badge
// ─────────────────────────────────────────────
const ModeBadge = ({ mode }) => {
  const isOnline = mode === 'online';
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        isOnline
          ? 'bg-sky-50 text-sky-700 border-sky-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      {isOnline ? (
        <Wifi className="w-2.5 h-2.5" />
      ) : (
        <Home className="w-2.5 h-2.5" />
      )}
      {isOnline ? 'Online' : 'In-Person'}
    </span>
  );
};

// ─────────────────────────────────────────────
// 3-D Tilt wrapper (Framer Motion)
// ─────────────────────────────────────────────
const TiltCard = ({ children }) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 260, damping: 26 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 260, damping: 26 });
  const glowOpacity = useSpring(0, { stiffness: 200, damping: 24 });
  const scale = useSpring(1, { stiffness: 260, damping: 26 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(nx);
    y.set(ny);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    scale.set(1.025);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    glowOpacity.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      className="relative h-full"
    >
      {/* Glow ring */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute -inset-[1.5px] rounded-3xl bg-gradient-to-br from-emerald-400/40 via-teal-400/30 to-sky-400/40 blur-[2px] pointer-events-none z-0"
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
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
  const isAyesha = tutorName?.toLowerCase().includes('ayesha');
  const rawAvatar = tutorUser.avatar || data.avatar;
  const tutorAvatar =
    isAyesha
      ? '/images/dr-ayesha.jpg'
      : (rawAvatar && !rawAvatar.includes('594824813575'))
        ? rawAvatar
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`;

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
      <TiltCard>
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/80 p-4 sm:p-5 md:p-6 shadow-sm flex flex-col justify-between h-full gap-4 transition-colors duration-300 hover:border-emerald-300/70">

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
                    if (isAyesha) {
                      e.currentTarget.src = '/images/dr-ayesha.jpg';
                    } else {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`;
                    }
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                {data.isSanadVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full ring-2 ring-white shadow">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Name / location / rating */}
              <div className="min-w-0">
                <Link
                  href={`/tutors/${data._id}`}
                  className="font-black text-sm sm:text-[15px] text-slate-900 hover:text-emerald-700 transition-colors leading-tight line-clamp-1"
                >
                  {tutorName}
                </Link>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    {tutorCity}
                  </span>
                  <span className="text-slate-300">·</span>
                  {data.gender === 'female' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Female Teacher</span>
                    </span>
                  ) : (
                    <span className="capitalize text-slate-600">{data.gender || 'Tutor'}</span>
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
                className="text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg whitespace-nowrap"
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
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Qualifications */}
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                Qualifications
              </span>
              <p className="font-semibold text-slate-800 text-[11px] truncate">
                {data.qualifications || 'Certified Tutor'}
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
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
              Fee / Rate
            </span>
            <p className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Flexible / Negotiable</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/tutors/${data._id}`}
              className="px-3 py-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-all text-xs font-bold"
            >
              Profile
            </Link>

            {user?.role !== 'tutor' && (
              <motion.button
                onClick={handleStartChat}
                whileTap={{ scale: 0.94 }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Message Tutor</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </TiltCard>

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
