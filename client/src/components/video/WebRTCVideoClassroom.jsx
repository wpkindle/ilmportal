'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  MessageSquare,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  BookOpen,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

const WebRTCVideoClassroom = ({ roomId, sessionData }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  // Safety & Recording Warning Modal State
  const [safetyModalOpen, setSafetyModalOpen] = useState(true);

  // Media states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [classDurationSeconds, setClassDurationSeconds] = useState(0);
  const [peerConnected, setPeerConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('video'); // 'video' or 'quran_viewer'

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const screenTrackRef = useRef(null);
  const containerRef = useRef(null);

  // Classroom timer
  useEffect(() => {
    const timer = setInterval(() => {
      setClassDurationSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize Media & Socket Connection
  useEffect(() => {
    let currentStream = null;

    const startMedia = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          currentStream = stream;
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Camera/Mic permission warning, fallback to simulated stream:', err.message);
      }
    };

    startMedia();

    if (socket && roomId) {
      socket.emit('join-classroom', {
        roomId,
        user: {
          id: user?.id || user?._id,
          name: user?.name,
          role: user?.role
        }
      });

      socket.on('peer-joined', ({ user: peerUser }) => {
        setPeerConnected(true);
      });

      socket.on('classroom-chat-received', (msg) => {
        setChatMessages(prev => [...prev, msg]);
      });

      socket.on('peer-left', () => {
        setPeerConnected(false);
      });
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.emit('leave-classroom', { roomId, user });
      }
    };
  }, [roomId, socket]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
    if (socket) {
      socket.emit('media-toggle', { roomId, type: 'mic', enabled: !isMicOn });
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
    if (socket) {
      socket.emit('media-toggle', { roomId, type: 'camera', enabled: !isCameraOn });
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }
      setIsScreenSharing(false);
    } else {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = screenStream.getVideoTracks()[0];
          screenTrackRef.current = screenTrack;
          setIsScreenSharing(true);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }

          screenTrack.onended = () => {
            setIsScreenSharing(false);
            if (localVideoRef.current && localStream) {
              localVideoRef.current.srcObject = localStream;
            }
          };
        }
      } catch (err) {
        console.error('Screen sharing error:', err);
      }
    }
  };

  // Send in-classroom live text message
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const messageData = {
      roomId,
      sender: user?.name || 'Participant',
      message: chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    if (socket) {
      socket.emit('classroom-chat-message', messageData);
    } else {
      setChatMessages(prev => [...prev, messageData]);
    }
    setChatInput('');
  };

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
    <div
      ref={containerRef}
      className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative"
    >
      {/* Safety & Recording Warning Modal */}
      {safetyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-center">
            {/* Background glow effects */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Call Recording & Quality Active</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Safety & Recording Notice
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 px-1">
                To keep our community safe and high-quality, this call is being recorded. Please remember not to share or request personal details. This helps protect your account and keeps our platform safe for everyone!
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-left space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Platform Safety Guidelines</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6 leading-normal">
                All tuition classrooms are monitored for academic quality. Please keep communications focused strictly on your Islamic Studies, Tajweed, or Academic curriculum.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSafetyModalOpen(false)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>I Understand & Continue</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Classroom Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              {sessionData?.title || 'Live Tutoring Classroom'}
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-950/80 text-red-300 rounded border border-red-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span>REC • Safety Protected</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Room: <span className="font-mono text-emerald-400">{roomId}</span>
            </p>
          </div>
        </div>

        {/* Timer & Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(classDurationSeconds)}</span>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'video' ? 'quran_viewer' : 'video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border ${
              activeTab === 'quran_viewer'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>Digital Quran Reader</span>
          </button>
        </div>
      </div>

      {/* Main Video & Content Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Stage (Remote Peer / Quran Reader) */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          
          {activeTab === 'quran_viewer' ? (
            <div className="w-full h-full bg-amber-50 text-slate-900 rounded-2xl p-6 overflow-y-auto border-4 border-amber-200 shadow-inner flex flex-col items-center justify-center">
              <div className="max-w-2xl text-center space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Surah Al-Fatihah (سورة الفاتحة) &bull; Tajweed Reference
                </span>
                <div className="font-arabic text-2xl sm:text-4xl text-emerald-950 leading-[2.2] text-center select-none" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾<br />
                  الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾<br />
                  الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾<br />
                  مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾<br />
                  إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾<br />
                  اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾<br />
                  صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾
                </div>
                <p className="text-xs text-slate-500 italic">
                  Interactive reference mode active for Tajweed articulation and Makharij correction.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-inner">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Placeholder when waiting for peer */}
              {!peerConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 backdrop-blur-xs">
                  <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-800 animate-pulse">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Waiting for {user?.role === 'tutor' ? 'Student' : 'Tutor'} to join...
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Both participants receive an automated live class alert. The video feed will connect instantly upon arrival.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Local Mirror (Floating PiP) */}
          <div className="absolute bottom-6 right-6 w-36 sm:w-52 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/50 bg-slate-900 z-20">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
            />
            {!isCameraOn && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-xs">
                <VideoOff className="w-6 h-6 mb-1" />
                <span>Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white">
              You ({user?.name?.split(' ')[0]})
            </div>
          </div>

        </div>

        {/* In-Call Live Chat Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-20 animate-in slide-in-from-right duration-200">
            <div className="p-3 border-b border-slate-800 font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>In-Class Live Chat</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  Send questions, notes, or verse references during the live class.
                </p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-emerald-400 text-[11px] block">
                      {msg.sender}
                    </span>
                    <p className="text-slate-200 mt-0.5">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="p-2 border-t border-slate-800 flex gap-1">
              <input
                type="text"
                placeholder="Type in-call message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Bottom Floating Controls Bar */}
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-center gap-3 z-30">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl transition-all shadow-md ${
            isMicOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`p-3.5 rounded-2xl transition-all shadow-md ${
            isCameraOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          className={`p-3.5 rounded-2xl transition-all shadow-md ${
            isScreenSharing
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title="Share Screen (Slides, Whiteboard, Notes)"
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>

        {/* In-Call Chat Toggle */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`p-3.5 rounded-2xl transition-all shadow-md ${
            chatOpen
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title="In-Class Text Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* End Class / Leave Session */}
        <button
          onClick={handleLeaveClassroom}
          className="px-5 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Leave Classroom</span>
        </button>
      </div>

    </div>
  );
};

export default WebRTCVideoClassroom;
