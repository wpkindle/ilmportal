'use client';

import React, { useState } from 'react';
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
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';

export default function TutorProfileClient({ tutor, reviews = [] }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [sanadModalOpen, setSanadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authoredCourses, setAuthoredCourses] = useState([]);

  const tutorUser = tutor?.user || {};
  const tutorName = tutorUser.name || 'Verified Tutor';
  const isAyesha = tutorName?.toLowerCase().includes('ayesha');
  const rawAvatar = tutorUser.avatar;
  const tutorAvatar =
    isAyesha
      ? '/images/dr-ayesha.jpg'
      : (rawAvatar && !rawAvatar.includes('594824813575'))
        ? rawAvatar
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`;

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

  const handleStartChat = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    const myId = user?.id || user?._id;
    const tutorId = tutorUser._id || tutorUser.id || tutor._id;
    const conversationId = [myId, tutorId].sort().join('_');
    router.push(`/student/messages?conversation=${conversationId}&tutorId=${tutor._id}`);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
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
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-sm"
                />
                {tutor.isSanadVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{tutorName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {tutor.gender || 'Teacher'}
                  </span>
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Faculty</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{tutorUser.city || 'Pakistan'}</span>
                  <span>&bull;</span>
                  <span className="capitalize">{tutor.teachingMode === 'both' ? 'Online & In-Person' : tutor.teachingMode}</span>
                </p>

                <div className="flex items-center gap-2 pt-0.5">
                  <RatingStars rating={tutor.averageRating || 5} size="sm" />
                  <span className="text-xs font-bold text-slate-800">
                    {tutor.averageRating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({reviews.length} reviews)
                  </span>
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

              {isAuthenticated && (user?.id || user?._id) !== (tutorUser._id || tutorUser.id || tutor._id) && (
                <Link
                  href={`/classroom/${[user?.id || user?._id, tutorUser._id || tutorUser.id || tutor._id].sort().join('_')}`}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Join Live Class</span>
                </Link>
              )}

              <button
                onClick={handleStartChat}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message & Discuss Schedule</span>
              </button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Verified Credentials</span>
              <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tutor.qualifications || 'Dars-e-Nizami / Shahadat-ul-Alimiyya'}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Experience</span>
              <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tutor.experienceYears || 3} Years Teaching Experience</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tuition Fee</span>
              <p className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Flexible / Negotiable in Chat</span>
              </p>
            </div>
          </div>

        </div>

        {/* Subjects & Disciplines Taught */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-base font-black text-slate-900">Disciplines & Programs Offered</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tutor.subjects?.map((subj) => (
              <div key={subj._id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                <h4 className="font-bold text-xs text-slate-900">{subj.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{subj.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Courses Offered by this Tutor */}
        {authoredCourses.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  TUTOR-AUTHORED CURRICULUM
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Structured Courses by {tutorName}
                </h2>
                <p className="text-xs text-slate-500">
                  Enrolling in these tracks includes chapters, video lessons, quizzes, homework assignments & live classes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authoredCourses.map((c) => (
                <div
                  key={c._id}
                  className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-50/60 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="w-full h-full object-cover opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1">
                          <Baby className="w-3 h-3" />
                          <span>{c.targetAudience}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/30">
                          {c.sessionDuration}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="font-black text-base leading-snug line-clamp-1">{c.title}</h4>
                        <p className="text-[11px] text-emerald-300 font-semibold truncate">{c.subtitle}</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-800">{c.chapters?.length || 0} Chapters &bull; {c.totalLessons || 0} Lessons</span>
                        <span className="text-emerald-700 font-bold">PKR {c.priceSuggested?.amount?.toLocaleString() || '3,500'}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/courses/${c.slug}`}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center block shadow-md hover:scale-[1.02] transition-all"
                    >
                      View Syllabus, Tests & Book Trial →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Reviews Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Student Reviews & Ratings ({reviews.length})</h2>
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
                <div key={rev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
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
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl flex items-center gap-2.5">
        <button
          onClick={handleStartChat}
          className="flex-1 py-3 px-4 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message &amp; Book Free Trial</span>
        </button>

        <button
          onClick={() => setSanadModalOpen(true)}
          className="py-3 px-3.5 min-h-[48px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 active:bg-emerald-100 transition-colors shrink-0"
          title="Inspect verified credentials"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
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

    </div>
  );
}

