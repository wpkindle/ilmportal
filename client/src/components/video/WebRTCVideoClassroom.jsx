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
  BookOpen,
  Send,
  LayoutGrid,
  Maximize2,
  Sparkles,
  Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

const WebRTCVideoClassroom = ({ roomId, sessionData }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  // Safety & Recording Warning Modal State
  const [safetyModalOpen, setSafetyModalOpen] = useState(true);

  // Layout view modes: 'grid' (50/50 dual conference) | 'spotlight' (large remote + pip) | 'quran' (digital Quran reader)
  const [viewMode, setViewMode] = useState('grid');

  // Media states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remotePeerInfo, setRemotePeerInfo] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [classDurationSeconds, setClassDurationSeconds] = useState(0);
  const [peerConnected, setPeerConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const spotlightRemoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const containerRef = useRef(null);
  const targetPeerSocketIdRef = useRef(null);

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

  // Helper to create and configure RTCPeerConnection
  const setupPeerConnection = (targetSocketId) => {
    targetPeerSocketIdRef.current = targetSocketId;

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Attach local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // When remote track is received
    pc.ontrack = (event) => {
      console.log('🎥 Received remote media track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemoteStream(stream);
        setPeerConnected(true);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        if (spotlightRemoteVideoRef.current) {
          spotlightRemoteVideoRef.current.srcObject = stream;
        }
      }
    };

    // Send ICE candidate to peer
    pc.onicecandidate = (event) => {
      if (event.candidate && targetSocketId && socket) {
        socket.emit('webrtc-signal', {
          targetSocketId,
          signalData: { type: 'candidate', candidate: event.candidate },
          callerInfo: {
            id: user?._id || user?.id,
            name: user?.name,
            role: user?.role
          }
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('📡 WebRTC ICE state changed to:', pc.iceConnectionState);
      if (['connected', 'completed'].includes(pc.iceConnectionState)) {
        setPeerConnected(true);
      } else if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
        setPeerConnected(false);
      }
    };

    return pc;
  };

  // Initialize Local Media & Socket Signaling
  useEffect(() => {
    let activeStream = null;

    const initMediaAndSignaling = async () => {
      // 1. Get User Media
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          activeStream = stream;
          localStreamRef.current = stream;
          setLocalStream(stream);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Media device access error:', err.message);
      }

      // 2. Join Socket Classroom Room
      if (socket && roomId) {
        const myInfo = {
          id: user?._id || user?.id,
          name: user?.name || 'Class Participant',
          role: user?.role || 'student'
        };

        socket.emit('join-classroom', {
          roomId,
          user: myInfo
        });

        // If existing peers are already waiting in the room, initiate offer to them
        socket.on('existing-peers', async ({ peers }) => {
          if (Array.isArray(peers) && peers.length > 0) {
            const peerSocketId = peers[0];
            console.log('🤝 Found existing peer in room, initiating WebRTC offer to:', peerSocketId);
            const pc = setupPeerConnection(peerSocketId);

            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);

              socket.emit('webrtc-signal', {
                targetSocketId: peerSocketId,
                signalData: { type: 'offer', offer },
                callerInfo: myInfo
              });
            } catch (err) {
              console.error('Error creating WebRTC offer:', err);
            }
          }
        });

        // When a new peer joins the room
        socket.on('peer-joined', ({ socketId, user: joinedUser }) => {
          console.log('👋 Peer joined classroom:', joinedUser?.name, socketId);
          setRemotePeerInfo(joinedUser);
          targetPeerSocketIdRef.current = socketId;
        });

        // Receive WebRTC Signaling (Offer / Answer / Candidate)
        socket.on('webrtc-signal-received', async ({ callerSocketId, signalData, callerInfo }) => {
          if (!signalData) return;
          if (callerInfo) setRemotePeerInfo(callerInfo);

          // Handle Offer
          if (signalData.type === 'offer' && signalData.offer) {
            console.log('📥 Received WebRTC Offer from:', callerSocketId);
            const pc = setupPeerConnection(callerSocketId);

            try {
              await pc.setRemoteDescription(new RTCSessionDescription(signalData.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              socket.emit('webrtc-signal', {
                targetSocketId: callerSocketId,
                signalData: { type: 'answer', answer },
                callerInfo: myInfo
              });
            } catch (err) {
              console.error('Error handling WebRTC offer:', err);
            }
          }

          // Handle Answer
          if (signalData.type === 'answer' && signalData.answer) {
            console.log('📥 Received WebRTC Answer from:', callerSocketId);
            if (peerConnectionRef.current) {
              try {
                await peerConnectionRef.current.setRemoteDescription(
                  new RTCSessionDescription(signalData.answer)
                );
              } catch (err) {
                console.error('Error setting remote description answer:', err);
              }
            }
          }

          // Handle ICE Candidate
          if (signalData.type === 'candidate' && signalData.candidate) {
            if (peerConnectionRef.current) {
              try {
                await peerConnectionRef.current.addIceCandidate(
                  new RTCIceCandidate(signalData.candidate)
                );
              } catch (err) {
                console.warn('Error adding ICE candidate:', err);
              }
            }
          }
        });

        socket.on('classroom-chat-received', (msg) => {
          setChatMessages((prev) => [...prev, msg]);
        });

        socket.on('peer-left', () => {
          console.log('👋 Peer left the classroom');
          setPeerConnected(false);
          setRemoteStream(null);
          setRemotePeerInfo(null);
        });
      }
    };

    initMediaAndSignaling();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch (e) {}
      }
      if (socket) {
        socket.emit('leave-classroom', { roomId, user });
        socket.off('existing-peers');
        socket.off('peer-joined');
        socket.off('webrtc-signal-received');
        socket.off('classroom-chat-received');
        socket.off('peer-left');
      }
    };
  }, [roomId, socket, user]);

  // Keep video elements updated when remote stream arrives or viewMode changes
  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (spotlightRemoteVideoRef.current) {
        spotlightRemoteVideoRef.current.srcObject = remoteStream;
      }
    }
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [remoteStream, localStream, viewMode]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
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
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
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
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (peerConnectionRef.current && videoTrack) {
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
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
      setChatMessages((prev) => [...prev, messageData]);
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

  const otherRoleName = user?.role === 'tutor' ? 'Student' : 'Tutor';
  const otherPartyName = remotePeerInfo?.name || sessionData?.tutor?.name || sessionData?.student?.name || otherRoleName;

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden fixed inset-0 z-50 select-none font-sans"
    >
      {/* Safety & Recording Warning Modal */}
      {safetyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Encrypted HD Live Video Classroom</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Live Class Safety Notice
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Welcome to your 1:1 live session. All classroom communications are monitored for academic quality and minor protection under platform guidelines.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSafetyModalOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Classroom Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Classroom Bar */}
      <div className="px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 truncate">
              <span>{sessionData?.title || 'Live Tutoring Class'}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-950/80 text-red-300 rounded border border-red-800 shrink-0">
                REC • Live
              </span>
            </h2>
          </div>
        </div>

        {/* Center/Right Timer & View Modes */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Duration Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTime(classDurationSeconds)}</span>
          </div>

          {/* Conference 50/50 Grid vs Spotlight Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'spotlight' : 'grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-emerald-600/90 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Conference Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">{viewMode === 'grid' ? 'Conference Grid' : 'Spotlight'}</span>
          </button>

          {/* Digital Quran Reader Tab */}
          <button
            onClick={() => setViewMode(viewMode === 'quran' ? 'grid' : 'quran')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border cursor-pointer ${
              viewMode === 'quran'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Quran Reader</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Stage */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-950">
        
        {/* VIEW MODE 1: True Dual 50/50 Conference Grid (Google Meet / Zoom style) */}
        {viewMode === 'grid' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 h-full w-full overflow-hidden">
            
            {/* Card 1: Remote Peer (Tutor or Student) */}
            <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800/90 flex items-center justify-center relative shadow-2xl">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!peerConnected ? 'hidden' : ''}`}
              />

              {/* Waiting Radar when peer hasn't connected */}
              {!peerConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-900 to-slate-950">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/80 shadow-lg">
                      <Users className="w-10 h-10 animate-pulse" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Waiting for {otherRoleName} to join...
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Automated live connection active. Your partner’s HD video will stream automatically upon arrival.
                  </p>
                  <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    🟢 Ready for WebRTC Connection
                  </span>
                </div>
              )}

              {/* Peer Name & Role Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-sm text-xs font-bold text-white flex items-center gap-2 border border-white/10 z-10">
                <span className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span>{otherPartyName}</span>
                <span className="text-[10px] font-normal text-slate-300 bg-white/10 px-1.5 py-0.2 rounded">
                  {otherRoleName}
                </span>
              </div>
            </div>

            {/* Card 2: Local User (Self) */}
            <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-900 border-2 border-emerald-500/40 flex items-center justify-center relative shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
              />

              {!isCameraOn && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-2 border border-slate-700">
                    <VideoOff className="w-8 h-8 text-slate-500" />
                  </div>
                  <span className="font-bold text-slate-300">Your Camera is Off</span>
                </div>
              )}

              {/* Local User Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-sm text-xs font-bold text-white flex items-center gap-2 border border-white/10 z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>You ({user?.name || 'Self'})</span>
                <span className="text-[10px] font-normal text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700/50">
                  {user?.role || 'Active'}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* VIEW MODE 2: Spotlight View (Large Remote + Floating Local PiP) */}
        {viewMode === 'spotlight' && (
          <div className="flex-1 flex items-center justify-center p-4 relative h-full w-full">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-inner">
              <video
                ref={spotlightRemoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!peerConnected ? 'hidden' : ''}`}
              />

              {!peerConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 backdrop-blur-xs">
                  <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-800 animate-pulse">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Waiting for {otherRoleName} to join...
                  </h3>
                </div>
              )}
            </div>

            {/* Floating Local PiP */}
            <div className="absolute bottom-6 right-6 w-40 sm:w-56 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/70 bg-slate-900 z-20">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
              />
              <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">
                You ({user?.name?.split(' ')[0]})
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: Digital Quran Reader Split Mode */}
        {viewMode === 'quran' && (
          <div className="flex-1 flex flex-col md:flex-row gap-3 p-3 sm:p-4 h-full w-full overflow-hidden">
            {/* Quran Text Viewer */}
            <div className="flex-1 bg-amber-50 text-slate-900 rounded-3xl p-6 sm:p-8 overflow-y-auto border-4 border-amber-200 shadow-2xl flex flex-col items-center justify-center">
              <div className="max-w-2xl text-center space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-900 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-200">
                  Surah Al-Fatihah (سورة الفاتحة) &bull; Live Tajweed Reference
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
                  Interactive reference mode for Tajweed articulation, Qira'at rules, and Makharij correction.
                </p>
              </div>
            </div>

            {/* Side Floating Video Strip */}
            <div className="w-full md:w-64 flex md:flex-col gap-2 shrink-0">
              <div className="flex-1 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.2 rounded text-white font-bold">
                  {otherPartyName}
                </span>
              </div>
              <div className="flex-1 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/50 relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.2 rounded text-white font-bold">
                  You
                </span>
              </div>
            </div>
          </div>
        )}

        {/* In-Call Live Chat Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-slate-900/95 border-l border-slate-800 flex flex-col z-30 animate-in slide-in-from-right duration-200">
            <div className="p-3.5 border-b border-slate-800 font-bold text-xs text-emerald-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>In-Class Live Chat</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-center text-slate-500 py-12">
                  Send live questions, notes, or Ayah references during the class.
                </p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                    <span className="font-bold text-emerald-400 text-[11px] block">
                      {msg.sender}
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-slate-800 flex gap-1.5">
              <input
                type="text"
                placeholder="Type in-call message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-medium"
              />
              <button
                type="submit"
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Bottom Floating Controls Bar */}
      <div className="px-4 py-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 flex items-center justify-center gap-3 sm:gap-4 z-30 shrink-0">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md cursor-pointer ${
            isMicOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400'
          }`}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md cursor-pointer ${
            isCameraOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400'
          }`}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md cursor-pointer ${
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
          className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md cursor-pointer ${
            chatOpen
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title="In-Class Text Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Leave Classroom */}
        <button
          onClick={handleLeaveClassroom}
          className="px-4 sm:px-5 py-3 sm:py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Leave Class</span>
        </button>
      </div>

    </div>
  );
};

export default WebRTCVideoClassroom;
