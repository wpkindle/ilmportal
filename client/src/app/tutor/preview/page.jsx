'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Sparkles,
  Save,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import TutorProfileClient from '../../tutors/[id]/TutorProfileClient';

export default function TutorDraftPreviewPage() {
  const router = useRouter();
  const { user, tutorProfile, loading: authLoading } = useAuth();
  const [draftData, setDraftData] = useState(null);
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const broadcastRef = useRef(null);

  // Initialize draft data from storage and register real-time cross-tab sync
  useEffect(() => {
    // 1. Initial read from localStorage
    const loadStoredDraft = () => {
      try {
        const raw = localStorage.getItem('tutor_draft_preview') || sessionStorage.getItem('tutor_draft_preview');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            setDraftData(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load draft preview from storage:', e);
      }
    };

    loadStoredDraft();

    // 2. Storage event listener (standard cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'tutor_draft_preview' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (updated && typeof updated === 'object') {
            setDraftData(updated);
            setIsLiveSyncActive(true);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 3. Native BroadcastChannel for instantaneous zero-latency updates
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('ilm_tutor_draft_channel');
        broadcastRef.current = bc;

        bc.onmessage = (event) => {
          if (event.data?.type === 'DRAFT_UPDATE' && event.data.data) {
            setDraftData(event.data.data);
            setIsLiveSyncActive(true);
          } else if (event.data?.type === 'DRAFT_SAVED') {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 4000);
          }
        };

        // Ping editor tab to push its latest uncommitted state
        bc.postMessage({ type: 'REQUEST_LATEST_DRAFT' });
        setIsLiveSyncActive(true);
      } catch (err) {
        console.error('BroadcastChannel initialization error:', err);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastRef.current) {
        broadcastRef.current.close();
      }
    };
  }, []);

  // Construct fallback if no storage draft exists yet
  const effectiveTutor = draftData || (tutorProfile ? {
    ...tutorProfile,
    user: user || tutorProfile.user,
    bio: tutorProfile.bio || '',
    hourlyRate: tutorProfile.hourlyRate || 0,
    qualifications: tutorProfile.qualifications || '',
    subjects: tutorProfile.subjects || [],
  } : (user ? {
    user,
    bio: '',
    hourlyRate: 1500,
    qualifications: '',
    subjects: [],
  } : null));

  // Save changes directly from the preview tab
  const handleSaveFromPreview = async () => {
    setSavingProfile(true);
    setSaveError('');

    // If editor tab is active, request it to perform its unified save
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type: 'SAVE_PROFILE_REQUEST' });
    }

    try {
      if (draftData) {
        // Save basic user profile
        if (draftData.user) {
          await api.updateProfile({
            name: draftData.user.name,
            city: draftData.city || draftData.user.city,
            localArea: draftData.localArea || draftData.user.area,
            area: draftData.localArea || draftData.user.area,
            gender: draftData.gender || draftData.user.gender,
            tutoringType: draftData.tutoringType,
            age: draftData.user.age ? Number(draftData.user.age) : undefined,
            avatar: draftData.user.avatar,
            bio: draftData.bio,
            qualifications: draftData.qualifications,
            experienceYears: Number(draftData.experienceYears) || 0,
            hourlyRate: Number(draftData.hourlyRate) || 0,
            teachingModes: draftData.teachingModes || ['online'],
            videoIntro: draftData.videoIntro || ''
          });
        }

        // Save comprehensive tutor profile
        const cleanSanads = (draftData.sanadDocuments || []).map((d) => {
          const { isStaged, ...rest } = d;
          if (typeof rest._id === 'string' && rest._id.startsWith('staged_')) {
            delete rest._id;
          }
          return rest;
        });

        const cleanMethods = (draftData.paymentMethods || []).map((m) => {
          const { isStaged, ...rest } = m;
          if (typeof rest._id === 'string' && rest._id.startsWith('temp_')) {
            delete rest._id;
          }
          return rest;
        });

        await api.updateMyTutorProfile({
          city: draftData.city,
          localArea: draftData.localArea,
          area: draftData.localArea,
          gender: draftData.gender,
          tutoringType: draftData.tutoringType,
          subjects: (draftData.subjects || []).map((s) => s?._id || s),
          bio: draftData.bio,
          qualifications: draftData.qualifications,
          experienceYears: Number(draftData.experienceYears) || 0,
          hourlyRate: Number(draftData.hourlyRate) || 0,
          teachingModes: draftData.teachingModes || ['online'],
          videoIntro: draftData.videoIntro || '',
          sanadDocuments: cleanSanads,
          paymentMethods: cleanMethods,
          preferredAccountChoice: draftData.preferredAccountChoice || 'own'
        });
      }

      setSaveSuccess(true);
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'DRAFT_SAVED', timestamp: Date.now() });
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile from preview:', err);
      setSaveError(err.message || 'Failed to save changes. Please return to the profile editor tab.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBackToEditor = () => {
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      window.opener.focus();
    } else {
      router.push('/tutor/profile');
    }
  };

  if (authLoading && !effectiveTutor) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a359]" />
        <p className="text-xs font-semibold text-stone-600">Loading draft profile preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Top Floating / Sticky Live Draft Preview Bar */}
      <div className="bg-gradient-to-r from-[#0c2217] via-[#143826] to-[#0c2217] text-[#faf8f5] border-b border-[#d4a359]/40 py-2.5 px-4 sm:px-6 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                  Draft Profile Preview
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  Unsaved Edits
                </span>
                {isLiveSyncActive && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Sync Active</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-300">
                Any modifications made in your profile editor tab update here in real time before publishing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleBackToEditor}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Return to Profile Editor"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-400" />
              <span>Back to Editor</span>
            </button>
            <button
              type="button"
              onClick={handleSaveFromPreview}
              disabled={savingProfile}
              className={`px-4 py-1.5 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                saveSuccess
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                  : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
              }`}
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved &amp; Published</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="max-w-7xl mx-auto mt-2 text-xs text-rose-300 flex items-center gap-1.5 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/40">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      {/* Render full student-facing tutor profile client */}
      {effectiveTutor ? (
        <TutorProfileClient
          tutor={effectiveTutor}
          reviews={[]}
          id={user?.username || user?._id || 'preview'}
          isDraftPreview={true}
        />
      ) : (
        <div className="py-20 text-center space-y-4">
          <p className="text-stone-500 text-sm">No profile data available to preview.</p>
          <Link
            href="/tutor/profile"
            className="px-4 py-2 bg-[#0c2217] text-white rounded-xl text-xs font-bold inline-block"
          >
            Go to Profile Editor
          </Link>
        </div>
      )}
    </div>
  );
}

