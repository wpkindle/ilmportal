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
        if (res.success) {
          setSessionData(res.session);
          api.updateSessionStatus(res.session._id, { status: 'live' }).catch(() => {});
        }
      } catch (err) {
        console.error('Error joining classroom:', err);
        setSessionData({
          title: 'Live Tutoring Classroom Session',
          roomId
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [roomId]);

  if (loading) return <LoadingSpinner text="Connecting to In-Platform Video Classroom..." />;

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden fixed inset-0 z-50">
      <WebRTCVideoClassroom roomId={roomId} sessionData={sessionData} />
    </div>
  );
}
