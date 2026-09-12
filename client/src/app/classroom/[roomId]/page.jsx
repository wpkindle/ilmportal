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
        const data = err.data || {};
        setSessionData({
          error: data.message || err.message || 'Unable to join classroom.',
          isRestricted: Boolean(data.isRestricted),
          hasOverduePayment: Boolean(data.hasOverduePayment),
          isDenied: Boolean(!data.isRestricted && (err.status === 403 || err.message?.includes('deal')))
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [roomId]);

  if (loading) return <LoadingSpinner />;

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
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Return to Messages
          </button>
        </div>
      </div>
    );
  }

  // Block classroom if deal is restricted (3-day tuition fee threshold or platform fee)
  if (sessionData?.isRestricted && user?.role !== 'admin') {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center fixed inset-0 z-50">
        <div className="max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <span className="text-2xl font-black">⛔</span>
          </div>
          <h2 className="text-xl font-black text-white">Classroom Access Restricted</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {sessionData.error || 'Access to this live video classroom is restricted. A 3-day payment threshold for tuition fees has expired without clearance.'}
          </p>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-amber-400 font-semibold space-y-1">
            <p>⚡ {sessionData.isPlatformFeeOverdue ? 'Platform Fee Clearance Notice' : '3-Day Threshold Notice'}</p>
            <p className="text-[11px] text-slate-400">
              {sessionData.isPlatformFeeOverdue
                ? 'The 3-day tutor platform fee clearance period expired. Please pay your platform fee to resume live video classes.'
                : "Tuition fees must be paid via tutor's Bank, Raast, EasyPaisa, JazzCash, or UPaisa and cleared by the tutor to unlock classes."}
            </p>
          </div>
          <button
            onClick={() => window.location.href = user?.role === 'tutor' ? '/tutor/deals' : '/student/deals'}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            {user?.role === 'tutor'
              ? (sessionData.isPlatformFeeOverdue ? 'Go to Deals & Pay Platform Fee' : 'Go to Deals & Clear Payment')
              : 'Go to Deals & Pay Tuition Fee'}
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
