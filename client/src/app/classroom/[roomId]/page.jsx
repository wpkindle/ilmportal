'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import WebRTCVideoClassroom from '../../../components/video/WebRTCVideoClassroom';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function VideoClassroomPage() {
  const params = useParams();
  const roomId = params?.roomId;
  const { user } = useAuth();

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchSession = async () => {
      try {
        const res = await api.getSessionByRoomId(roomId);
        if (res.success && res.session && res.session._id) {
          setSessionData(res.session);
          api.updateSessionStatus(res.session._id, { status: 'live' }).catch(() => {});
        } else if (res && !res.success) {
          setSessionData({
            error: res.message || 'Live video classroom is only available after a tuition deal offer has been accepted.',
            isDenied: true
          });
        } else {
          setSessionData({
            title: 'Live Tutoring Classroom Session',
            roomId
          });
        }
      } catch (err) {
        console.error('Error joining classroom:', err);
        setSessionData({
          error: err.message || 'Unable to join classroom.',
          isDenied: err.status === 403 || err.message?.includes('deal')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [roomId]);

  if (loading) return <LoadingSpinner text="Connecting to In-Platform Video Classroom..." />;

  // Block classroom if access is denied / deal not accepted
  if (sessionData?.isDenied && user?.role !== 'admin') {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center fixed inset-0 z-50">
        <div className="max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <span className="text-2xl font-black">🔒</span>
          </div>
          <h2 className="text-xl font-black text-white">Classroom Locked</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {sessionData.error || 'Live video classroom is only available after a tuition deal offer has been accepted.'}
          </p>
          <button
            onClick={() => window.location.href = user?.role === 'tutor' ? '/tutor/messages' : '/student/messages'}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Return to Messages
          </button>
        </div>
      </div>
    );
  }

  // Block classroom if deal is restricted pending admin payment clearance
  if (sessionData?.isRestricted && user?.role !== 'admin') {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center fixed inset-0 z-50">
        <div className="max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <span className="text-2xl font-black">⛔</span>
          </div>
          <h2 className="text-xl font-black text-white">Classroom Access Restricted</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {sessionData.error || 'Access to this live video classroom is paused. The 72-hour grace period for platform fee clearance has expired without payment verification.'}
          </p>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-emerald-400 font-semibold space-y-1">
            <p>Official Support: <a href="mailto:contact@ilmportal.org" className="underline hover:text-emerald-300">contact@ilmportal.org</a></p>
            <p className="text-[11px] text-slate-400">Meezan Bank &bull; Raast &bull; JazzCash &bull; EasyPaisa</p>
          </div>
          <button
            onClick={() => window.location.href = user?.role === 'tutor' ? '/tutor/deals' : '/student/messages'}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {user?.role === 'tutor' ? 'Go to Deals & Submit Fee' : 'Return to Messages'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden fixed inset-0 z-50">
      <WebRTCVideoClassroom roomId={roomId} sessionData={sessionData} />
    </div>
  );
}
