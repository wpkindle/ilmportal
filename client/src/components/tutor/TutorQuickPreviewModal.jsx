'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Eye,
  MapPin,
  Sparkles,
  ShieldCheck,
  Award,
  Video,
  BookOpen,
  Calendar,
  ExternalLink,
  Save,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { getTutorAvatar, parseDegreesAndCertificates } from '../../utils/tutorHelpers';
import VideoIntroPlayer from '../common/VideoIntroPlayer';

export default function TutorQuickPreviewModal({
  isOpen,
  onClose,
  draftTutor,
  onSaveProfile,
  isSaving = false,
  fullPreviewUrl = '#'
}) {
  if (!isOpen || !draftTutor) return null;

  const user = draftTutor.user || {};
  const name = user.name || 'Verified Tutor';
  const avatar = getTutorAvatar(user, name);
  const city = user.city || draftTutor.city || 'Pakistan';
  const area = user.area || draftTutor.localArea || '';
  const location = area ? `${area}, ${city}` : city;
  const hourlyRate = draftTutor.hourlyRate || 0;
  const experienceYears = draftTutor.experienceYears || 0;
  const qualifications = draftTutor.qualifications || '';
  const bio = draftTutor.bio || 'No bio provided yet.';
  const subjects = Array.isArray(draftTutor.subjects) ? draftTutor.subjects : [];
  const teachingModes = Array.isArray(draftTutor.teachingModes) ? draftTutor.teachingModes : ['online'];
  const hasOnline = teachingModes.includes('online');
  const hasInPerson = teachingModes.includes('in_person') || teachingModes.includes('physical');
  const videoIntro = (draftTutor.videoIntro || '').trim();

  const degrees = parseDegreesAndCertificates(
    qualifications,
    draftTutor.sanadDocuments || [],
    draftTutor.isSanadVerified
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0c2217] via-[#143826] to-[#0c2217] text-[#faf8f5] px-5 sm:px-7 py-4 flex items-center justify-between border-b border-[#d4a359]/30 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  Draft Profile Preview
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider">
                  Unsaved Edits
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 hidden sm:block">
                Showing your public student profile exactly as it will appear once saved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={fullPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#d4a359] hover:text-white text-xs font-bold transition-colors cursor-pointer"
              title="Open full page in new tab"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 bg-[#faf8f5]">
          
          {/* Unsaved Notice Alert */}
          <div className="flex items-center justify-between gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Draft Mode:</strong> Changes to your bio, rates, subjects, or qualifications are shown in real time.
              </span>
            </div>
            {onSaveProfile && (
              <button
                type="button"
                onClick={() => {
                  onSaveProfile();
                  onClose();
                }}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-white font-bold rounded-xl shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Save Now</span>
              </button>
            )}
          </div>

          {/* Top Profile Card Mockup */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6ded1] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#e6ded1] shadow-2xs"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg sm:text-xl font-bold text-stone-900">{name}</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{location}</span>
                  </p>
                  <p className="text-xs text-stone-600 font-medium mt-1">
                    {qualifications || 'Certified Educator'}
                  </p>
                </div>
              </div>

              <div className="sm:text-right bg-[#faf8f5] sm:bg-transparent p-3 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-0 border-[#e6ded1]">
                <div className="text-xs text-stone-500 font-medium">Hourly Tuition</div>
                <div className="text-xl font-extrabold text-[#0c2217]">
                  PKR {Number(hourlyRate).toLocaleString()}
                  <span className="text-xs font-normal text-stone-500"> / hr</span>
                </div>
              </div>
            </div>

            {/* Teaching Modes & Stats Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100 text-xs">
              {hasOnline && (
                <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Online Classes
                </span>
              )}
              {hasInPerson && (
                <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  In-Person Tutoring
                </span>
              )}
              {experienceYears > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  {experienceYears} Years Teaching Experience
                </span>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6ded1] shadow-xs space-y-3">
            <h5 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#d4a359]" />
              <span>About & Teaching Approach</span>
            </h5>
            <div className="text-sm text-stone-700 whitespace-pre-line leading-relaxed font-normal bg-[#faf8f5] p-4 rounded-2xl border border-stone-200/60">
              {bio}
            </div>
          </div>

          {/* Subjects Offered */}
          {subjects.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6ded1] shadow-xs space-y-3">
              <h5 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#d4a359]" />
                <span>Subjects & Disciplines ({subjects.length})</span>
              </h5>
              <div className="flex flex-wrap gap-2">
                {subjects.map((sub, idx) => (
                  <span
                    key={sub._id || sub.slug || idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sub.name || sub}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Degrees & Sanads */}
          {degrees.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6ded1] shadow-xs space-y-3">
              <h5 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-[#d4a359]" />
                <span>Degrees & Sanad Certificates ({degrees.length})</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {degrees.map((deg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-[#faf8f5] border border-stone-200 rounded-2xl text-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-800 truncate">{deg.title}</p>
                      <p className="text-[11px] text-stone-500 truncate">{deg.institution || 'Verified Credential'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Intro Player */}
          {videoIntro && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6ded1] shadow-xs space-y-3">
              <h5 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-[#d4a359]" />
                <span>Video Introduction</span>
              </h5>
              <div className="overflow-hidden rounded-2xl border border-stone-200 max-w-lg">
                <VideoIntroPlayer videoUrl={videoIntro} tutorName={name} />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white px-5 sm:px-7 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Link
            href={fullPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0c2217] hover:text-[#b85d34] transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Open Full Student Page in New Tab</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Keep Editing
            </button>
            {onSaveProfile && (
              <button
                type="button"
                onClick={() => {
                  onSaveProfile();
                  onClose();
                }}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Save Profile Changes</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
