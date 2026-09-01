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
    <div className="p-4 sm:p-6 bg-slate-900 min-h-screen flex items-center justify-center">
      <div className="max-w-7xl w-full">
        <WebRTCVideoClassroom roomId={roomId} sessionData={sessionData} />
      </div>
    </div>
  );
}

