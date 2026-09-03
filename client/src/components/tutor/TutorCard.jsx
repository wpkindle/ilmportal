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
import { useAuth } from '../../context/AuthContext';

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

  const data = tutor || tutorProfile || {};
  const tutorUser = data.user || {};
  const tutorName = tutorUser.name || data.name || 'Verified Tutor';
  const tutorCity = tutorUser.city || data.city || 'Pakistan';
  const tutorAvatar =
    tutorUser.avatar ||
    data.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`;

  // Resolve teachingModes — could be array or legacy string
  const rawModes = data.teachingModes || (data.teachingMode ? [data.teachingMode] : ['online']);
  const modes = Array.isArray(rawModes) ? rawModes : [rawModes];
  const hasOnline = modes.includes('online');
  const hasInPerson = modes.includes('in_person');

  const handleStartChat = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    const myId = user?.id || user?._id;
    const tutorId = tutorUser._id || tutorUser.id || data._id;
    const conversationId = [myId, tutorId].sort().join('_');
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.2 rounded-full border border-rose-200">
                      <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-400" />
                      <span>Female Educator</span>
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

            <motion.button
              onClick={handleStartChat}
              whileTap={{ scale: 0.94 }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Message Tutor</span>
            </motion.button>
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
    </>
  );
};

export default TutorCard;
