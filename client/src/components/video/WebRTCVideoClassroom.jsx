'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  Flag,
  Lock,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import ReportModal from '../chat/ReportModal';

// Comprehensive STUN and Free OpenRelay TURN servers for cross-network connectivity
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.sipgate.net' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

// Tune SDP to enforce mono speech and in-band Forward Error Correction (eliminates acoustic loop screeching)
const tuneSdpForVoiceQuality = (sdp) => {
  if (!sdp) return sdp;
  return sdp.replace(/a=fmtp:(\d+) minptime=\d+;useinbandfec=\d+/g, (match) => {
    return `${match};stereo=0;sprop-stereo=0;maxaveragebitrate=32000`;
  });
};

// Smooth audio fade-in to prevent sudden pops/screeches when audio track attaches
const fadeInAudio = (audioEl, targetVolume, duration = 300) => {
  if (!audioEl) return;
  const steps = 15;
  const stepTime = duration / steps;
  const stepVolume = targetVolume / steps;
  let currentStep = 0;
  audioEl.volume = 0;

  const fade = setInterval(() => {
    currentStep++;
    audioEl.volume = Math.min(stepVolume * currentStep, targetVolume);
    if (currentStep >= steps) clearInterval(fade);
  }, stepTime);
};

const WebRTCVideoClassroom = ({ roomId, sessionData }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  // Safety Modal State
  const [safetyModalOpen, setSafetyModalOpen] = useState(true);

  // Layout view modes: 'meet' (Google Meet default: Opponent large stage + PiP self) | 'grid' (50/50 dual) | 'quran' (Quran split)
  const [viewMode, setViewMode] = useState('meet');

  // Media & Connection states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remotePeerInfo, setRemotePeerInfo] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false); // Camera OFF by default for privacy
  const [isRemoteCameraOn, setIsRemoteCameraOn] = useState(true);
  const [isRemoteMicOn, setIsRemoteMicOn] = useState(true);
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false);
  const [classReportModalOpen, setClassReportModalOpen] = useState(false);
  const [isReportingAfterLeave, setIsReportingAfterLeave] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [speakerVolume, setSpeakerVolume] = useState(0.85); // Clean balanced default volume
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [classDurationSeconds, setClassDurationSeconds] = useState(0);
  const [peerConnected, setPeerConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  // Google Meet Layout Controls:
  const [isSwapped, setIsSwapped] = useState(false); // When true: local stream is on big stage, remote is in PiP
  const [isSelfMinimized, setIsSelfMinimized] = useState(false); // Minimized self floating card
  const [objectFitMode, setObjectFitMode] = useState('cover'); // 'cover' or 'contain' for main stage
  const [showVolumePopover, setShowVolumePopover] = useState(false);

  // Video Refs
  const primaryVideoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const gridRemoteVideoRef = useRef(null);
  const gridLocalVideoRef = useRef(null);
  const quranRemoteVideoRef = useRef(null);
  const quranLocalVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const containerRef = useRef(null);
  const targetPeerSocketIdRef = useRef(null);
  const iceCandidateQueue = useRef([]);
  const makingOffer = useRef(false);

  // Determine polite peer to prevent glare: Tutor is impolite (initiator), Student is polite
  const isPolite = user?.role !== 'tutor';

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

  // Helper to reliably attach streams to video elements
  const attachStreamToVideo = useCallback((videoEl, stream, isMuted = true) => {
    if (!videoEl) return;
    if (stream) {
      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
      videoEl.muted = isMuted;
      videoEl.play().catch(() => {});
    } else {
      videoEl.srcObject = null;
    }
  }, []);

  // Update remote speaker audio volume and mute state
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerMuted;
      remoteAudioRef.current.volume = isSpeakerMuted ? 0 : speakerVolume;
    }
  }, [isSpeakerMuted, speakerVolume]);

  // Synchronize streams with all active video DOM elements
  useEffect(() => {
    const bigStream = !isSwapped ? remoteStream : localStream;
    const smallStream = !isSwapped ? localStream : remoteStream;

    attachStreamToVideo(primaryVideoRef.current, bigStream, true);
    attachStreamToVideo(pipVideoRef.current, smallStream, true);
    attachStreamToVideo(gridRemoteVideoRef.current, remoteStream, true);
    attachStreamToVideo(gridLocalVideoRef.current, localStream, true);
    attachStreamToVideo(quranRemoteVideoRef.current, remoteStream, true);
    attachStreamToVideo(quranLocalVideoRef.current, localStream, true);

    if (remoteStream && remoteAudioRef.current) {
      if (remoteAudioRef.current.srcObject !== remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
      remoteAudioRef.current.muted = isSpeakerMuted;
      remoteAudioRef.current.volume = isSpeakerMuted ? 0 : speakerVolume;
      remoteAudioRef.current.play()
        .then(() => {
          if (!isSpeakerMuted) {
            fadeInAudio(remoteAudioRef.current, speakerVolume);
          }
        })
        .catch(() => {});
    }
  }, [remoteStream, localStream, viewMode, isSwapped, isSpeakerMuted, speakerVolume, attachStreamToVideo]);

  // Helper to create and configure RTCPeerConnection
  const createPeerConnection = useCallback((targetSocketId) => {
    targetPeerSocketIdRef.current = targetSocketId;

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
    }

    console.log('[WebRTC] Creating RTCPeerConnection for:', targetSocketId || roomId);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    iceCandidateQueue.current = [];

    // Add local tracks (Audio + Video) to peer connection
    if (localStreamRef.current) {
      const existingSenders = pc.getSenders();
      localStreamRef.current.getTracks().forEach((track) => {
        const alreadyAdded = existingSenders.some((s) => s.track && s.track.kind === track.kind);
        if (!alreadyAdded) {
          console.log('[WebRTC] Adding local track to PC:', track.kind);
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    // When remote track arrives
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind, event.streams);
      let stream = event.streams && event.streams[0];
      if (!stream) {
        stream = new MediaStream([event.track]);
      }
      setRemoteStream(stream);
      setPeerConnected(true);
      setIsConnecting(false);

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.muted = isSpeakerMuted;
        remoteAudioRef.current.volume = isSpeakerMuted ? 0 : speakerVolume;
        remoteAudioRef.current.play().catch((err) => {
          console.warn('Remote audio autoplay warning:', err);
        });
      }
    };

    // Send local ICE candidates to peer via socket
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-signal', {
          roomId,
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
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
      if (['connected', 'completed'].includes(pc.iceConnectionState)) {
        setPeerConnected(true);
        setIsConnecting(false);
      } else if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
        setPeerConnected(false);
      }
    };

    return pc;
  }, [socket, user, roomId, isSpeakerMuted, speakerVolume]);

  // Flush queued ICE candidates
  const processCandidateQueue = async (pc) => {
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('ICE queue apply warning:', e);
      }
    }
  };

  // Initiate WebRTC Offer
  const sendOffer = useCallback(async (targetSocketId) => {
    if (!socket) return;
    setIsConnecting(true);
    const pc = createPeerConnection(targetSocketId);

    try {
      makingOffer.current = true;
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      // Tune SDP for voice clarity and echo reduction
      if (offer.sdp) {
        offer.sdp = tuneSdpForVoiceQuality(offer.sdp);
      }
      await pc.setLocalDescription(offer);

      console.log('[WebRTC] Sending Offer to partner');
      socket.emit('webrtc-signal', {
        roomId,
        targetSocketId,
        signalData: { type: 'offer', offer },
        callerInfo: {
          id: user?._id || user?.id,
          name: user?.name,
          role: user?.role
        }
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      setIsConnecting(false);
    } finally {
      makingOffer.current = false;
    }
  }, [socket, user, roomId, createPeerConnection]);

  // Initialize Local Media & Socket Signaling
  useEffect(() => {
    let activeStream = null;

    const initMediaAndSignaling = async () => {
      // 1. Capture local HD Camera & Noise-Cancelled Microphone
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1
            }
          });
          // Female & family safety: Disable camera tracks by default until user opts in
          stream.getVideoTracks().forEach((track) => {
            track.enabled = false;
          });
          activeStream = stream;
          localStreamRef.current = stream;
          setLocalStream(stream);

          // If peer connection already exists, attach local tracks to it
          if (peerConnectionRef.current) {
            const existingSenders = peerConnectionRef.current.getSenders();
            stream.getTracks().forEach((track) => {
              if (!existingSenders.some((s) => s.track && s.track.kind === track.kind)) {
                peerConnectionRef.current.addTrack(track, stream);
              }
            });
          }
        }
      } catch (err) {
        console.warn('Media capture error:', err.message);
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

        // When existing peers are in room
        socket.on('existing-peers', async ({ peers }) => {
          if (Array.isArray(peers) && peers.length > 0) {
            const peerSocketId = peers[0];
            targetPeerSocketIdRef.current = peerSocketId;
            console.log('[WebRTC] Existing peer in room detected:', peerSocketId);
          }
        });

        // When a new peer joins after me (I am the existing peer, so I send the offer)
        socket.on('peer-joined', ({ socketId, user: joinedUser }) => {
          console.log('[WebRTC] Peer joined, initiating offer to:', joinedUser?.name, socketId);
          setRemotePeerInfo(joinedUser);
          targetPeerSocketIdRef.current = socketId;
          sendOffer(socketId);
        });

        // Remote peer media toggle notifications
        socket.on('peer-media-toggle', ({ type, enabled }) => {
          if (type === 'camera') {
            setIsRemoteCameraOn(enabled);
          } else if (type === 'mic') {
            setIsRemoteMicOn(enabled);
          }
        });

        // Signaling receiver with Perfect Negotiation
        socket.on('webrtc-signal-received', async ({ callerSocketId, signalData, callerInfo }) => {
          if (!signalData) return;
          if (callerInfo) setRemotePeerInfo(callerInfo);
          if (callerSocketId) targetPeerSocketIdRef.current = callerSocketId;

          // 1. Handle Offer
          if (signalData.type === 'offer' && signalData.offer) {
            console.log('[WebRTC] Received Offer from:', callerSocketId);
            const pc = peerConnectionRef.current || createPeerConnection(callerSocketId);

            try {
              const offerCollision = makingOffer.current || pc.signalingState !== 'stable';
              if (offerCollision) {
                if (!isPolite) {
                  console.log('Ignoring conflicting offer because impolite');
                  return;
                }
                console.log('Offer collision on polite peer: rolling back local offer');
                await Promise.all([
                  pc.setLocalDescription({ type: 'rollback' }),
                  pc.setRemoteDescription(new RTCSessionDescription(signalData.offer))
                ]);
              } else {
                await pc.setRemoteDescription(new RTCSessionDescription(signalData.offer));
              }

              await processCandidateQueue(pc);

              const answer = await pc.createAnswer();
              if (answer.sdp) {
                answer.sdp = tuneSdpForVoiceQuality(answer.sdp);
              }
              await pc.setLocalDescription(answer);

              console.log('[WebRTC] Sending Answer');
              socket.emit('webrtc-signal', {
                roomId,
                targetSocketId: callerSocketId,
                signalData: { type: 'answer', answer },
                callerInfo: myInfo
              });
            } catch (err) {
              console.error('Error processing WebRTC offer:', err);
            }
          }

          // 2. Handle Answer
          if (signalData.type === 'answer' && signalData.answer) {
            console.log('[WebRTC] Received Answer');
            const pc = peerConnectionRef.current;
            if (pc && pc.signalingState !== 'stable') {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(signalData.answer));
                await processCandidateQueue(pc);
              } catch (err) {
                console.error('Error setting remote answer:', err);
              }
            }
          }

          // 3. Handle Candidate
          if (signalData.type === 'candidate' && signalData.candidate) {
            const pc = peerConnectionRef.current;
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
              } catch (err) {
                console.warn('Error applying ICE candidate:', err);
              }
            } else {
              iceCandidateQueue.current.push(signalData.candidate);
            }
          }
        });

        socket.on('classroom-chat-received', (msg) => {
          setChatMessages((prev) => [...prev, msg]);
        });

        socket.on('peer-left', () => {
          console.log('[WebRTC] Peer left');
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
  }, [roomId, socket, user, isPolite, createPeerConnection, sendOffer]);

  // Manual connect/reconnect action
  const handleManualReconnect = () => {
    sendOffer(targetPeerSocketIdRef.current || null);
  };

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

  // Switch mobile camera (Front / Back facing for recitation book scanning)
  const switchCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          oldVideoTrack.stop();
          localStreamRef.current.removeTrack(oldVideoTrack);
        }
        localStreamRef.current.addTrack(newVideoTrack);
      }
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(newVideoTrack);
      }
      if (localStreamRef.current) {
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      }
    } catch (err) {
      console.warn('Camera switch error:', err);
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
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
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

        setLocalStream(screenStream);

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
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socket && roomId) {
      socket.emit('leave-classroom', { roomId });
    }

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

  // Emergency Leave & Report
  const handleEmergencyLeaveAndReport = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socket && roomId) {
      socket.emit('leave-classroom', { roomId });
    }
    setIsReportingAfterLeave(true);
    setClassReportModalOpen(true);
  };

  const otherRoleName = user?.role === 'tutor' ? 'Student' : 'Tutor';
  const otherPartyName = remotePeerInfo?.name || sessionData?.tutor?.name || sessionData?.student?.name || otherRoleName;

  const getOtherUserId = () => {
    if (remotePeerInfo?._id || remotePeerInfo?.id) {
      return remotePeerInfo._id || remotePeerInfo.id;
    }
    if (user?.role === 'tutor') {
      if (sessionData?.student?._id) return sessionData.student._id;
      if (typeof sessionData?.student === 'string' && sessionData.student.length === 24) return sessionData.student;
    } else {
      if (sessionData?.tutor?._id) return sessionData.tutor._id;
      if (typeof sessionData?.tutor === 'string' && sessionData.tutor.length === 24) return sessionData.tutor;
    }
    if (roomId && roomId.includes('_')) {
      const myId = (user?._id || user?.id || '').toString();
      const parts = roomId.split('_');
      const otherPart = parts.find((p) => p !== myId && p.length === 24);
      if (otherPart) return otherPart;
    }
    return user?._id || user?.id;
  };

  const targetReportedUser = {
    name: otherPartyName,
    role: otherRoleName,
    _id: getOtherUserId()
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-[#121314] text-white overflow-hidden fixed inset-0 z-50 select-none font-sans"
    >
      {/* Dedicated audio element for crystal-clear voice without double decoding */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Pre-Class Safety Guarantee Modal */}
      {safetyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0c2217] border border-[#d4a359]/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-[#143d2b] border border-[#d4a359]/40 flex items-center justify-center mx-auto text-[#d4a359] shadow-inner">
              <ShieldCheck className="w-7 h-7 text-[#d4a359]" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40">
                <Lock className="w-3 h-3 text-[#d4a359]" />
                <span>End-to-End Encrypted Safe-Room</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-white">
                Pre-Class Privacy &amp; Safety Check
              </h3>
              <p className="text-xs text-[#d1dbd6] leading-relaxed pt-1">
                Your privacy and dignity are protected. Verify your audio/video preferences before entering the classroom.
              </p>
            </div>

            {/* Privacy Toggles Strip */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#07150e] border border-[#d4a359]/20 text-xs">
              {/* Camera State */}
              <button
                type="button"
                onClick={toggleCamera}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isCameraOn
                    ? 'bg-[#143d2b] border-[#d4a359]/40 text-[#d4a359]'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isCameraOn ? <Video className="w-4 h-4 text-[#d4a359]" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
                <span className="text-[10px] font-bold">Camera: {isCameraOn ? 'ON' : 'OFF'}</span>
              </button>

              {/* Mic State */}
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isMicOn
                    ? 'bg-[#143d2b] border-[#d4a359]/40 text-[#d4a359]'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4 text-[#d4a359]" /> : <MicOff className="w-4 h-4 text-rose-400" />}
                <span className="text-[10px] font-bold">Mic: {isMicOn ? 'ON' : 'MUTE'}</span>
              </button>

              {/* Blur Background */}
              <button
                type="button"
                onClick={() => setIsBackgroundBlurred(!isBackgroundBlurred)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isBackgroundBlurred
                    ? 'bg-[#143d2b] border-[#d4a359]/40 text-[#d4a359]'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#d4a359]" />
                <span className="text-[10px] font-bold">Blur: {isBackgroundBlurred ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Reassurance Message */}
            <div className="p-3 rounded-xl bg-[#07150e] border border-[#d4a359]/20 text-[11px] text-[#d1dbd6] text-left space-y-1">
              <div className="flex items-center gap-1.5 text-[#d4a359] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Female &amp; Family Privacy Priority</span>
              </div>
              <p className="text-[#a3b8b0] leading-snug">
                Camera is OFF by default. Unauthorized recording or outside contact solicitation is strictly prohibited under PECA 2016.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSafetyModalOpen(false);
                if (remoteAudioRef.current) {
                  remoteAudioRef.current.play().catch(() => {});
                }
              }}
              className="w-full py-3 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Safe Classroom</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Google Meet Style Minimalist Header */}
      <div className="px-4 py-2.5 bg-[#18191a]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4a359] animate-ping shrink-0" />
            <span className="font-bold text-xs sm:text-sm text-white truncate">
              {sessionData?.title || 'IlmiDunya Live Tutoring Classroom'}
            </span>
          </div>
          <span className="hidden md:inline-flex text-[9px] font-bold px-2 py-0.5 bg-[#0c2217] text-[#d4a359] rounded-full border border-[#d4a359]/40 shrink-0">
            1:1 Verified Safe Session
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* E2EE Lock */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0c2217] border border-[#d4a359]/30 text-[#d4a359] text-[11px] font-bold">
            <Lock className="w-3 h-3 text-[#d4a359]" />
            <span>E2EE 1:1 Safe Room</span>
          </div>


          {/* Emergency Safety Flag Button */}
          <button
            onClick={() => {
              setIsReportingAfterLeave(false);
              setClassReportModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Report Concern or Block Participant"
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Report / Flag</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Stage Area */}
      <div className="flex-1 flex overflow-hidden relative bg-[#121314]">
        
        {/* ========================================================================= */}
        {/* VIEW MODE 1: GOOGLE MEET LAYOUT (OPPONENT BIGGER + FLOATING LOCAL PiP)    */}
        {/* ========================================================================= */}
        {viewMode === 'meet' && (
          <div className="flex-1 relative w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            
            {/* HERO STAGE: Opponent Screen is Big & Dominant */}
            <div className="w-full h-full max-w-[1700px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#202124] border border-white/10 shadow-2xl relative flex items-center justify-center group">
              
              <video
                ref={(el) => {
                  primaryVideoRef.current = el;
                  attachStreamToVideo(el, !isSwapped ? remoteStream : localStream, true);
                }}
                autoPlay
                muted
                playsInline
                className={`w-full h-full ${
                  objectFitMode === 'cover' ? 'object-cover' : 'object-contain'
                } transition-all ${
                  (!isSwapped ? (!peerConnected || !isRemoteCameraOn) : !isCameraOn) ? 'hidden' : ''
                } ${isSwapped && isBackgroundBlurred ? 'filter blur-[5px] scale-105' : ''}`}
              />

              {/* Waiting screen when opponent has not connected yet */}
              {!isSwapped && !peerConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#202124] to-[#161718] space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0c2217] text-[#d4a359] flex items-center justify-center border-2 border-[#d4a359]/40 shadow-2xl">
                      <Users className="w-12 h-12 text-[#d4a359] animate-pulse" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4a359] rounded-full animate-ping" />
                  </div>

                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Waiting for {otherPartyName} ({otherRoleName}) to connect...
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      End-to-end encrypted classroom live stream. High-definition video will start automatically upon connection.
                    </p>
                  </div>

                  <button
                    onClick={handleManualReconnect}
                    className="px-4 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
                    <span>{isConnecting ? 'Connecting Stream...' : 'Reconnect Live Stream'}</span>
                  </button>
                </div>
              )}

              {/* Opponent Connected but Camera is OFF (Google Meet Style Avatar Card) */}
              {(!isSwapped ? (peerConnected && !isRemoteCameraOn) : !isCameraOn) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#202124] space-y-4 select-none">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#0c2217] via-[#143d2b] to-[#1e5c41] text-[#d4a359] border-4 border-[#d4a359]/50 flex items-center justify-center text-4xl sm:text-5xl font-black shadow-2xl">
                      {(!isSwapped ? otherPartyName : (user?.name || 'U')).charAt(0).toUpperCase()}
                    </div>
                    {(!isSwapped ? isRemoteMicOn : isMicOn) && (
                      <span className="absolute inset-0 rounded-full border-2 border-[#d4a359]/60 animate-ping pointer-events-none" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {!isSwapped ? otherPartyName : 'You'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Camera is turned off • Live voice audio connected
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#d4a359] animate-pulse" />
                    <span>Voice Audio Active</span>
                  </span>
                </div>
              )}

              {/* Fit / Fill Aspect Toggle Button (Google Meet Style) */}
              <button
                type="button"
                onClick={() => setObjectFitMode(objectFitMode === 'cover' ? 'contain' : 'cover')}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-lg"
                title={objectFitMode === 'cover' ? 'Fit full camera sensor to screen' : 'Fill entire video card'}
              >
                {objectFitMode === 'cover' ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{objectFitMode === 'cover' ? 'Fit Frame' : 'Fill Screen'}</span>
              </button>

              {/* Opponent / Main Stage Participant Name Capsule */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white flex items-center gap-2.5 z-20 shadow-xl">
                <span className="flex items-center justify-center">
                  {(!isSwapped ? !isRemoteMicOn : !isMicOn) ? (
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                      <MicOff className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[#143d2b] text-[#d4a359] flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                  )}
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  {!isSwapped ? otherPartyName : `You (${user?.name || 'Self'})`}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-[#d4a359] border border-[#d4a359]/30">
                  {!isSwapped ? otherRoleName : (user?.role || 'Active')}
                </span>
                {peerConnected && !isSwapped && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-[#d4a359] font-semibold bg-[#0c2217] px-2 py-0.5 rounded border border-[#d4a359]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-pulse" />
                    <span>HD 1:1</span>
                  </span>
                )}
              </div>
            </div>

            {/* FLOATING SELF PiP CARD (Corner Video Tile) */}
            {isSelfMinimized ? (
              <div
                onClick={() => setIsSelfMinimized(false)}
                className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-3.5 py-2 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xl z-30 transition-all hover:scale-105"
                title="Expand your video preview"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4a359]" />
                <span>You ({(!isSwapped ? isCameraOn : isRemoteCameraOn) ? 'Video ON' : 'Video OFF'})</span>
                <Maximize2 className="w-3.5 h-3.5 text-[#d4a359]" />
              </div>
            ) : (
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 w-44 sm:w-60 md:w-68 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/25 hover:border-[#d4a359] bg-[#202124] z-30 transition-all duration-200 group">
                <video
                  ref={(el) => {
                    pipVideoRef.current = el;
                    attachStreamToVideo(el, !isSwapped ? localStream : remoteStream, true);
                  }}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${
                    (!isSwapped ? !isCameraOn : (!peerConnected || !isRemoteCameraOn)) ? 'hidden' : ''
                  } ${!isSwapped && isBackgroundBlurred ? 'filter blur-[5px] scale-105' : ''}`}
                />

                {/* If Camera OFF in PiP Tile */}
                {(!isSwapped ? !isCameraOn : (!peerConnected || !isRemoteCameraOn)) && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#202124] text-slate-300 p-3 text-center space-y-1.5 select-none">
                    <div className="w-10 h-10 rounded-full bg-[#0c2217] border border-[#d4a359]/40 text-[#d4a359] flex items-center justify-center font-bold text-sm">
                      {(!isSwapped ? (user?.name || 'U') : otherPartyName).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">
                      {!isSwapped ? 'Your Camera is Off' : `${otherPartyName}'s Camera is Off`}
                    </span>
                    {!isSwapped && (
                      <button
                        type="button"
                        onClick={toggleCamera}
                        className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold cursor-pointer transition-colors"
                      >
                        Turn On
                      </button>
                    )}
                  </div>
                )}

                {/* Top Hover Controls: Swap to Main & Minimize */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    type="button"
                    onClick={() => setIsSwapped(!isSwapped)}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs cursor-pointer shadow-md transition-transform hover:scale-110"
                    title={isSwapped ? "Switch back: Opponent on big screen" : "Swap: Put your screen on big stage"}
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#d4a359]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSelfMinimized(true)}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs cursor-pointer shadow-md transition-transform hover:scale-110"
                    title="Minimize self preview"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Bottom Name Pill on PiP */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-[11px] font-bold text-white flex items-center gap-1.5 z-10">
                  <span>{!isSwapped ? 'You' : otherPartyName}</span>
                  {(!isSwapped ? !isMicOn : !isRemoteMicOn) ? (
                    <MicOff className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Mic className="w-3 h-3 text-[#d4a359]" />
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: DUAL 50/50 CONFERENCE GRID                                   */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 h-full w-full overflow-hidden">
            {/* Card 1: Remote Peer (Opponent) */}
            <div className="flex-1 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#202124] border-2 border-slate-800 flex items-center justify-center relative shadow-2xl">
              <video
                ref={(el) => {
                  gridRemoteVideoRef.current = el;
                  attachStreamToVideo(el, remoteStream, true);
                }}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${(!peerConnected || !isRemoteCameraOn) ? 'hidden' : ''}`}
              />

              {!peerConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#202124] space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#0c2217] text-[#d4a359] flex items-center justify-center border border-[#d4a359]/40">
                    <Users className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Waiting for {otherPartyName} ({otherRoleName})...
                  </h3>
                </div>
              )}

              {peerConnected && !isRemoteCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#202124] space-y-2">
                  <div className="w-16 h-16 rounded-full bg-[#0c2217] text-[#d4a359] border-2 border-[#d4a359]/40 flex items-center justify-center font-bold text-2xl">
                    {otherPartyName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-sm font-bold text-white">{otherPartyName}</h3>
                  <span className="text-xs text-slate-400">Camera is off • Audio active</span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-xs font-bold text-white flex items-center gap-2 border border-white/10 z-10">
                <span>{otherPartyName}</span>
                <span className="text-[10px] text-[#d4a359]">{otherRoleName}</span>
              </div>
            </div>

            {/* Card 2: Local User (Self) */}
            <div className="flex-1 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#202124] border-2 border-[#d4a359]/40 flex items-center justify-center relative shadow-2xl">
              <video
                ref={(el) => {
                  gridLocalVideoRef.current = el;
                  attachStreamToVideo(el, localStream, true);
                }}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''} ${
                  isBackgroundBlurred ? 'filter blur-[5px] scale-105' : ''
                }`}
              />

              {!isCameraOn && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#202124] text-slate-300 p-4 text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-[#0c2217] text-[#d4a359] border-2 border-[#d4a359]/40 flex items-center justify-center font-bold text-2xl">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-white">Your Camera is Off</span>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Turn Camera On</span>
                  </button>
                </div>
              )}

              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-xs font-bold text-white flex items-center gap-2 border border-white/10 z-10">
                <span>You ({user?.name || 'Self'})</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 3: DIGITAL QURAN READER SPLIT MODE                              */}
        {/* ========================================================================= */}
        {viewMode === 'quran' && (
          <div className="flex-1 flex flex-col md:flex-row gap-3 p-3 sm:p-4 h-full w-full overflow-hidden">
            {/* Quran Text Viewer */}
            <div className="flex-1 bg-[#faf8f5] text-stone-900 rounded-3xl p-6 sm:p-8 overflow-y-auto border-4 border-[#e6dfd5] shadow-2xl flex flex-col items-center justify-center">
              <div className="max-w-2xl text-center space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#0c2217] bg-[#f0ece1] px-4 py-1.5 rounded-full border border-[#d4a359]/40">
                  Surah Al-Fatihah (سورة الفاتحة) &bull; Live Tajweed Reference
                </span>
                <div className="font-arabic text-2xl sm:text-4xl text-[#0c2217] leading-[2.2] text-center select-none" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾<br />
                  الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾<br />
                  الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾<br />
                  مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾<br />
                  إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾<br />
                  اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾<br />
                  صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾
                </div>
                <p className="text-xs text-stone-500 italic">
                  Interactive reference mode for Tajweed articulation, Qira&apos;at rules, and Makharij correction.
                </p>
              </div>
            </div>

            {/* Side Floating Video Strip (Opponent is Bigger) */}
            <div className="w-full md:w-80 flex md:flex-col gap-2.5 shrink-0">
              {/* Opponent is Top Big Card (65% height on desktop) */}
              <div className="flex-1 md:flex-[2] aspect-[4/3] rounded-2xl overflow-hidden bg-[#202124] border-2 border-slate-700 relative shadow-xl">
                <video
                  ref={(el) => {
                    quranRemoteVideoRef.current = el;
                    attachStreamToVideo(el, remoteStream, true);
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[11px] bg-black/70 px-2 py-0.5 rounded-md text-white font-bold">
                  {otherPartyName} ({otherRoleName})
                </span>
              </div>

              {/* Self is Bottom Compact Card */}
              <div className="flex-1 aspect-[4/3] rounded-2xl overflow-hidden bg-[#202124] border-2 border-[#d4a359]/40 relative shadow-xl">
                <video
                  ref={(el) => {
                    quranLocalVideoRef.current = el;
                    attachStreamToVideo(el, localStream, true);
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[11px] bg-black/70 px-2 py-0.5 rounded-md text-white font-bold">
                  You
                </span>
              </div>
            </div>
          </div>
        )}

        {/* In-Call Live Chat Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-[#1e1f20] border-l border-white/10 flex flex-col z-40 animate-in slide-in-from-right duration-200 select-text">
            <div className="p-3.5 border-b border-white/10 font-bold text-xs text-[#d4a359] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>In-Class Live Chat</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-center text-slate-400 py-12 leading-relaxed">
                  Send live questions, notes, or Ayah references during the session.
                </p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                    <span className="font-bold text-[#d4a359] text-[11px] block">
                      {msg.sender}
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-white/10 flex gap-1.5">
              <input
                type="text"
                placeholder="Type in-call message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4a359] font-medium"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM GOOGLE MEET STYLE CONTROL DOCK                                     */}
      {/* ========================================================================= */}
      <div className="px-4 py-3 bg-[#18191a]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-between z-40 shrink-0 select-none">
        
        {/* Left: Meeting Info & Live Timer */}
        <div className="hidden md:flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4a359] animate-ping" />
            <span className="text-xs font-mono font-bold text-[#d4a359] bg-black/50 px-2.5 py-1 rounded-lg border border-[#d4a359]/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{formatTime(classDurationSeconds)}</span>
            </span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs font-medium text-slate-300 truncate">
            {sessionData?.title || '1:1 Live Tutoring Classroom'}
          </span>
        </div>

        {/* Center: Iconic Google Meet Circular Control Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-shrink-0 mx-auto">
          {/* Microphone Button */}
          <button
            onClick={toggleMic}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md ${
              isMicOn
                ? 'bg-[#3c4043] hover:bg-[#474a4d] text-white'
                : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400 shadow-lg shadow-red-900/40'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md ${
              isCameraOn
                ? 'bg-[#3c4043] hover:bg-[#474a4d] text-white'
                : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400 shadow-lg shadow-red-900/40'
            }`}
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Background Blur Button */}
          <button
            onClick={() => setIsBackgroundBlurred(!isBackgroundBlurred)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md ${
              isBackgroundBlurred
                ? 'bg-[#143d2b] hover:bg-[#0c2217] text-[#d4a359] ring-2 ring-[#d4a359]'
                : 'bg-[#3c4043] hover:bg-[#474a4d] text-slate-300 hover:text-white'
            }`}
            title={isBackgroundBlurred ? 'Turn Blur Off' : 'Turn Background Blur On'}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            className={`hidden md:flex w-11 h-11 sm:w-12 sm:h-12 rounded-full items-center justify-center cursor-pointer transition-all shadow-md ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400'
                : 'bg-[#3c4043] hover:bg-[#474a4d] text-slate-300 hover:text-white'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Present Screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Mobile Flip Camera Button */}
          <button
            onClick={switchCamera}
            className="md:hidden w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#3c4043] hover:bg-[#474a4d] text-slate-200 flex items-center justify-center cursor-pointer shadow-md"
            title="Switch Camera (Front / Back for Quran scanning)"
          >
            <RotateCcw className="w-5 h-5 text-[#d4a359]" />
          </button>

          {/* Speaker Volume Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowVolumePopover(!showVolumePopover)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#3c4043] hover:bg-[#474a4d] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shadow-md"
              title="Remote Speaker Volume"
            >
              {isSpeakerMuted || speakerVolume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-[#d4a359]" />
              )}
            </button>

            {showVolumePopover && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 p-3 bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl flex flex-col items-center gap-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Speaker Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isSpeakerMuted ? 0 : speakerVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSpeakerVolume(val);
                    if (val > 0 && isSpeakerMuted) setIsSpeakerMuted(false);
                  }}
                  className="w-24 accent-[#d4a359] h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                  className="text-[10px] font-bold text-[#d4a359] hover:underline cursor-pointer"
                >
                  {isSpeakerMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
            )}
          </div>

          {/* Emergency Safety Leave & Report Button */}
          <button
            onClick={handleEmergencyLeaveAndReport}
            className="px-3.5 h-11 sm:h-12 rounded-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            title="Emergency Exit & Flag Incident to Safety Team"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="hidden sm:inline text-xs">Leave &amp; Report</span>
          </button>

          {/* End Call Signature Google Meet Red Pill Button */}
          <button
            onClick={handleLeaveClassroom}
            className="w-16 sm:w-20 h-11 sm:h-12 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold transition-transform hover:scale-105 shadow-lg shadow-red-900/40 cursor-pointer flex items-center justify-center gap-1.5"
            title="Leave Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Chat Drawer & In-Call Utilities */}
        <div className="flex items-center justify-end gap-2 flex-1">
          {/* Chat Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center relative ${
              chatOpen
                ? 'bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40'
                : 'bg-[#3c4043] hover:bg-[#474a4d] text-slate-300 hover:text-white'
            }`}
            title="In-Call Chat"
          >
            <MessageSquare className="w-5 h-5" />
            {chatMessages.length > 0 && !chatOpen && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#d4a359] rounded-full animate-ping" />
            )}
          </button>
        </div>

      </div>

      {/* In-Classroom Report & Safety Incident Modal */}
      <ReportModal
        isOpen={classReportModalOpen}
        onClose={() => {
          setClassReportModalOpen(false);
          if (isReportingAfterLeave) {
            handleLeaveClassroom();
          }
        }}
        reportedUser={targetReportedUser}
        conversationId={roomId}
        messages={chatMessages}
        closeButtonText={isReportingAfterLeave ? 'Done & Exit to Dashboard' : 'Return to Classroom'}
      />

    </div>
  );
};

export default WebRTCVideoClassroom;
