'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  ShieldCheck,
  BookOpen,
  PhoneOff,
  Maximize2,
  ExternalLink,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const WebRTCVideoClassroom = ({ roomId, sessionData }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [safetyModalOpen, setSafetyModalOpen] = useState(true);
  const [classDurationSeconds, setClassDurationSeconds] = useState(0);
  const [quranOpen, setQuranOpen] = useState(false);
  const [loadingConference, setLoadingConference] = useState(true);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  // Classroom timer
  useEffect(() => {
    const timer = setInterval(() => {
      setClassDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cleanRoomName = `IlmPortalClass_${(roomId || 'classroom').replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Initialize Embedded Zoom/Meet Style Conference (Jitsi Meet Enterprise SFU)
  useEffect(() => {
    let isMounted = true;

    const loadAndInitJitsi = () => {
      const initConference = () => {
        if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

        // Clean any previous instance
        if (jitsiApiRef.current) {
          try {
            jitsiApiRef.current.dispose();
          } catch (e) {}
        }

        const domain = 'meet.jit.si';
        const roleLabel = user?.role === 'tutor' ? 'Tutor' : 'Student';
        const displayName = `${user?.name || 'User'} (${roleLabel})`;

        const options = {
          roomName: cleanRoomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName,
            email: user?.email
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableTileView: true,
            defaultRemoteDisplayName: user?.role === 'tutor' ? 'Student' : 'Tutor',
            toolbarButtons: [
              'microphone',
              'camera',
              'desktop',
              'chat',
              'raisehand',
              'tileview',
              'fullscreen',
              'hangup'
            ]
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            DEFAULT_REMOTE_DISPLAY_NAME: user?.role === 'tutor' ? 'Student' : 'Tutor',
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'desktop',
              'chat',
              'raisehand',
              'tileview',
              'fullscreen',
              'hangup'
            ]
          }
        };

        try {
          const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
          jitsiApiRef.current = apiInstance;

          apiInstance.addEventListener('videoConferenceJoined', () => {
            if (isMounted) setLoadingConference(false);
          });

          apiInstance.addEventListener('readyToClose', () => {
            handleLeaveClassroom();
          });
        } catch (err) {
          console.error('Error initiating conference:', err);
          if (isMounted) setLoadingConference(false);
        }
      };

      if (window.JitsiMeetExternalAPI) {
        initConference();
      } else {
        const existingScript = document.getElementById('jitsi-external-api');
        if (existingScript) {
          existingScript.onload = initConference;
        } else {
          const script = document.createElement('script');
          script.id = 'jitsi-external-api';
          script.src = 'https://meet.jit.si/external_api.js';
          script.async = true;
          script.onload = initConference;
          document.body.appendChild(script);
        }
      }
    };

    loadAndInitJitsi();

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {}
      }
    };
  }, [roomId, cleanRoomName, user]);

  // Leave / End Classroom
  const handleLeaveClassroom = async () => {
    if (sessionData?._id) {
      try {
        await api.updateSessionStatus(sessionData._id, {
          status: 'completed',
          durationMinutes: Math.round(classDurationSeconds / 60)
        });
      } catch (e) {
        console.error(e);
      }
    }
    router.push(user?.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden fixed inset-0 z-50 select-none font-sans">
      
      {/* Safety Notice Modal */}
      {safetyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>HD Video &amp; Voice Conference Room</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Live 1:1 Class Safety Notice
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Welcome to your interactive live session. All classroom communications are monitored for academic quality and student safety under IlmPortal guidelines.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSafetyModalOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Join Live Video Conference</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Classroom Bar */}
      <div className="px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 truncate">
              <span>{sessionData?.title || 'Live Tutoring Classroom'}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-950/80 text-red-300 rounded border border-red-800 shrink-0">
                LIVE • HD Audio &amp; Video
              </span>
            </h2>
          </div>
        </div>

        {/* Center/Right Controls: Timer, Quran Reader & Exit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Duration Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTime(classDurationSeconds)}</span>
          </div>

          {/* Digital Quran Reader Drawer Toggle */}
          <button
            onClick={() => setQuranOpen(!quranOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border cursor-pointer ${
              quranOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">{quranOpen ? 'Hide Quran' : 'Quran Reader'}</span>
          </button>

          {/* End / Leave Class */}
          <button
            onClick={handleLeaveClassroom}
            className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-xl border border-red-500 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <PhoneOff className="w-3 h-3" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Main Conference Area */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-950">
        
        {/* Left Side: Embedded Zoom/Meet Style Video Conference (with 50/50 dual grid, audio & screen sharing) */}
        <div className="flex-1 h-full w-full relative bg-slate-950">
          <div
            ref={jitsiContainerRef}
            className="w-full h-full"
            style={{ minHeight: '100%' }}
          />
        </div>

        {/* Right Side: Slide-out Quran & Tajweed Viewer Drawer */}
        {quranOpen && (
          <div className="w-full sm:w-96 md:w-[420px] bg-amber-50 text-slate-900 border-l-4 border-amber-300 flex flex-col z-30 animate-in slide-in-from-right duration-200 overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-bold text-emerald-950">Digital Quran &amp; Tajweed</h3>
              </div>
              <button
                onClick={() => setQuranOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold px-2 py-0.5 rounded-lg hover:bg-amber-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-6 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300">
                Surah Al-Fatihah (سورة الفاتحة)
              </span>

              <div className="font-arabic text-2xl text-emerald-950 leading-[2.4] text-center select-none pt-2" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾<br />
                الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾<br />
                الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾<br />
                مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾<br />
                إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾<br />
                اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾<br />
                صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾
              </div>

              <div className="p-3 bg-amber-100/70 rounded-2xl border border-amber-200 text-left text-xs text-slate-700 space-y-1">
                <p className="font-bold text-emerald-900">Tajweed Articulation Points (Makharij):</p>
                <p className="text-[11px] leading-relaxed">
                  Focus on correct pronunciation of <span className="font-bold">ح (Ḥā)</span> in الرَّحْمَٰنِ and the heavy letter <span className="font-bold">ض (Ḍād)</span> in الضَّالِّينَ.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default WebRTCVideoClassroom;
