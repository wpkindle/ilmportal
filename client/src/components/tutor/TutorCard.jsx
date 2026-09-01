'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  Video,
  Home,
  MessageSquare,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import RatingStars from '../common/RatingStars';
import SanadBadge, { SanadModal } from '../common/SanadBadge';
import StudentAuthModal from '../common/StudentAuthModal';
import { useAuth } from '../../context/AuthContext';

const TutorCard = ({ tutor, tutorProfile }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sanadModalOpen, setSanadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const data = tutor || tutorProfile || {};
  const tutorUser = data.user || {};
  const tutorName = tutorUser.name || data.name || 'Verified Tutor';
  const tutorCity = tutorUser.city || data.city || 'Pakistan';
  const tutorAvatar = tutorUser.avatar || data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`;

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
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between group">
      
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={tutorAvatar}
                alt={tutorName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200"
              />
              {data.isSanadVerified && (
                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full ring-2 ring-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/tutors/${data._id}`}
                  className="font-black text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  {tutorName}
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {tutorCity}
                </span>
                <span>&bull;</span>
                <span className="capitalize">{data.gender || 'Teacher'}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-1">
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

          {/* Sanad Badge Button */}
          <SanadBadge
            isVerified={data.isSanadVerified}
            documentsCount={data.sanadDocuments?.length || 0}
            onClick={() => setSanadModalOpen(true)}
          />
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {data.bio || 'Experienced verified tutor available for online live classes and academic guidance.'}
        </p>

        {/* Subjects Badges */}
        <div className="flex flex-wrap gap-1.5">
          {data.subjects?.slice(0, 3).map((subj) => (
            <span
              key={subj._id || subj}
              className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg"
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

        {/* Credentials & Tutoring Mode */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Qualifications</span>
            <p className="font-semibold text-slate-800 text-[11px] truncate">
              {data.qualifications || 'Certified Tutor'}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Mode & Timing</span>
            <p className="font-semibold text-slate-800 text-[11px] capitalize">
              {data.teachingMode === 'both' ? 'Online & In-Person' : data.teachingMode || 'Online'} &bull; Flexible
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Row: Flexible Pricing & Chat CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee / Rate</span>
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Flexible / Negotiable</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/tutors/${data._id}`}
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors text-xs font-bold"
            title="View Full Profile"
          >
            Profile
          </Link>

          <button
            onClick={handleStartChat}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Tutor</span>
          </button>
        </div>
      </div>

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

    </div>
  );
};

export default TutorCard;
