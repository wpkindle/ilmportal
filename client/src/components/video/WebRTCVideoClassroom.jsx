'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  ShieldAlert,
  Flag,
  Lock,
  AlertTriangle,
  RotateCcw,
  X
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

  // Layout view modes: 'grid' (50/50 dual conference) | 'spotlight' | 'quran'
  const [viewMode, setViewMode] = useState('grid');

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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const spotlightRemoteVideoRef = useRef(null);
  const quranRemoteVideoRef = useRef(null);
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

  // Update remote speaker audio volume and mute state
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerMuted;
      remoteAudioRef.current.volume = isSpeakerMuted ? 0 : speakerVolume;
    }
  }, [isSpeakerMuted, speakerVolume]);

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

    // Add local tracks (Audio + Video) to peer connection — ensuring no duplicate senders
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

      // IMPORTANT FOR NOISE SUPPRESSION:
      // Keep all <video> elements MUTED to prevent double-audio decoding and howling loops!
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.muted = true; // Video element is muted, only audio tag plays sound
        remoteVideoRef.current.play().catch(() => {});
      }
      if (spotlightRemoteVideoRef.current) {
        spotlightRemoteVideoRef.current.srcObject = stream;
        spotlightRemoteVideoRef.current.muted = true;
        spotlightRemoteVideoRef.current.play().catch(() => {});
      }
      if (quranRemoteVideoRef.current) {
        quranRemoteVideoRef.current.srcObject = stream;
        quranRemoteVideoRef.current.muted = true;
        quranRemoteVideoRef.current.play().catch(() => {});
      }

      // Dedicated audio tag plays remote voice directly
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
  }, [socket, user, roomId]);

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
              channelCount: 1 // Single-channel mono prevents acoustic feedback phase screeching
            }
          });
          // Female & family safety: Disable camera tracks by default until user opts in
          stream.getVideoTracks().forEach((track) => {
            track.enabled = false;
          });
          activeStream = stream;
          localStreamRef.current = stream;
          setLocalStream(stream);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.muted = true;
            localVideoRef.current.play().catch(() => {});
          }

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

        // When existing peers are in room (I am the newly joined peer)
        socket.on('existing-peers', async ({ peers }) => {
          if (Array.isArray(peers) && peers.length > 0) {
            const peerSocketId = peers[0];
            targetPeerSocketIdRef.current = peerSocketId;
            console.log('[WebRTC] Existing peer in room detected:', peerSocketId);
            // We wait for the existing peer to initiate the offer to prevent double-offer glare
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

        // Signaling receiver with Perfect Negotiation (Glaring prevention)
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

  // Keep video and audio elements updated cleanly without audio doubling
  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = true; // Kept muted to prevent loop
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.muted = isSpeakerMuted;
        remoteAudioRef.current.play()
          .then(() => {
            if (!isSpeakerMuted) {
              fadeInAudio(remoteAudioRef.current, speakerVolume);
            }
          })
          .catch(() => {});
      }
      if (spotlightRemoteVideoRef.current) {
        spotlightRemoteVideoRef.current.srcObject = remoteStream;
        spotlightRemoteVideoRef.current.muted = true;
        spotlightRemoteVideoRef.current.play().catch(() => {});
      }
      if (quranRemoteVideoRef.current) {
        quranRemoteVideoRef.current.srcObject = remoteStream;
        quranRemoteVideoRef.current.muted = true;
        quranRemoteVideoRef.current.play().catch(() => {});
      }
    }
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream, localStream, viewMode, isSpeakerMuted, speakerVolume]);

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
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
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

  // Emergency Leave & Report: Instantly cuts all media & connection, but keeps user on screen to fill report!
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
      className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden fixed inset-0 z-50 select-none font-sans"
    >
      {/* Single dedicated remote audio element for crystal-clear voice without echo loops */}
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

      {/* Top Classroom Bar */}
      <div className="px-4 py-3 bg-[#0c2217]/95 backdrop-blur-md border-b border-[#143d2b] flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#d4a359] animate-ping shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 truncate">
              <span>{sessionData?.title || 'Live Tutoring Class'}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#143d2b] text-[#d4a359] rounded border border-[#d4a359]/40 shrink-0">
                LIVE • 1:1 Class
              </span>
            </h2>
          </div>
        </div>

        {/* Center/Right Timer, Modes & Security Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* End-to-End Encrypted Label */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#143d2b] border border-[#d4a359]/40 text-[#d4a359] text-[11px] font-bold">
            <Lock className="w-3 h-3 text-[#d4a359]" />
            <span>E2EE 1:1 Safe Room</span>
          </div>

          {/* Always-Visible Report / Block Button */}
          <button
            onClick={() => {
              setIsReportingAfterLeave(false);
              setClassReportModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Report Concern or Block Participant"
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Report / Block</span>
          </button>

          {/* Duration Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-[#d4a359]/30 text-xs font-mono font-bold text-[#d4a359]">
            <Clock className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>{formatTime(classDurationSeconds)}</span>
          </div>

          {/* Conference 50/50 Grid vs Spotlight Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'spotlight' : 'grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#143d2b] text-[#d4a359] border-[#d4a359]/40 shadow-xs'
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
                ? 'bg-[#143d2b] text-[#d4a359] border-[#d4a359]/40 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
            <span className="hidden sm:inline">Quran Reader</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Stage */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-950">
        
        {/* VIEW MODE 1: True Dual 50/50 Conference Grid (Desktop 50/50, Mobile: Opponent in bottom big screen) */}
        {viewMode === 'grid' && (
          <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-2 sm:gap-4 p-2 sm:p-4 h-full w-full overflow-hidden">
            
            {/* Card 1: Remote Peer (Opponent) - Placed in the bottom big video screen on mobile */}
            <div className="order-2 md:order-1 flex-1 w-full h-full min-h-[56%] md:min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800/90 flex items-center justify-center relative shadow-2xl">
              <video
                ref={remoteVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!peerConnected ? 'hidden' : ''}`}
              />

              {/* Waiting screen when remote peer hasn't connected */}
              {!peerConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-900 to-slate-950 space-y-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-[#0c2217] text-[#d4a359] flex items-center justify-center border border-[#d4a359]/40 shadow-lg">
                      <Users className="w-10 h-10 animate-pulse" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4a359] rounded-full animate-ping" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Waiting for {otherRoleName} to connect...
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Automated in-platform live stream active with echo cancellation and noise suppression.
                    </p>
                  </div>

                  <button
                    onClick={handleManualReconnect}
                    className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                    <span>{isConnecting ? 'Connecting Stream...' : 'Connect Video & Voice Now'}</span>
                  </button>
                </div>
              )}

              {/* If remote peer connected but turned their camera off */}
              {peerConnected && !isRemoteCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900 space-y-2.5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                    <VideoOff className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {otherPartyName}&apos;s Camera is Off
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live voice audio is active.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-pulse" />
                    <span>Voice Audio Connected</span>
                  </span>
                </div>
              )}

              {/* Peer Name & Role Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-sm text-xs font-bold text-white flex items-center gap-2 border border-white/10 z-10">
                <span className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-[#d4a359] animate-pulse' : 'bg-amber-400'}`} />
                <span>{otherPartyName}</span>
                <span className="text-[10px] font-normal text-slate-300 bg-white/10 px-1.5 py-0.2 rounded">
                  {otherRoleName}
                </span>
              </div>
            </div>

            {/* Card 2 (Right on desktop, Top compact preview on mobile): Local User (Self) */}
            <div className="order-1 md:order-2 w-full h-36 sm:h-48 md:h-full md:flex-1 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border-2 border-[#d4a359]/40 flex items-center justify-center relative shadow-2xl shrink-0">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transition-all ${!isCameraOn ? 'hidden' : ''} ${
                  isBackgroundBlurred ? 'filter blur-[5px] scale-105' : ''
                }`}
              />

              {!isCameraOn && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs space-y-2.5 p-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                    <VideoOff className="w-7 h-7 text-slate-400" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Your Camera is Off (Privacy Safe)</span>
                    <span className="text-[11px] text-slate-400">Click below or use toolbar to show your video</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Turn Camera On</span>
                  </button>
                </div>
              )}

              {/* Local User Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-sm text-xs font-bold text-white flex items-center gap-2 border border-white/10 z-10">
                <span className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-[#d4a359]' : 'bg-slate-500'}`} />
                <span>You ({user?.name || 'Self'})</span>
                <span className="text-[10px] font-normal text-[#d4a359] bg-[#143d2b] px-1.5 py-0.2 rounded border border-[#d4a359]/40">
                  {user?.role || 'Active'}
                </span>
                {isBackgroundBlurred && (
                  <span className="text-[9px] font-bold text-[#faf8f5] bg-[#143d2b] px-1.5 py-0.2 rounded border border-[#d4a359]/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#d4a359]" />
                    <span>Blur</span>
                  </span>
                )}
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
                muted
                playsInline
                className={`w-full h-full object-cover ${!peerConnected ? 'hidden' : ''}`}
              />

              {!peerConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 backdrop-blur-xs">
                  <div className="w-16 h-16 rounded-full bg-[#0c2217] text-[#d4a359] flex items-center justify-center mb-3 border border-[#d4a359]/40 animate-pulse">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Waiting for {otherRoleName} to connect...
                  </h3>
                </div>
              )}
            </div>

            {/* Floating Local PiP */}
            <div className="absolute bottom-6 right-6 w-40 sm:w-56 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#d4a359]/70 bg-slate-900 z-20">
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
                  Interactive reference mode for Tajweed articulation, Qira'at rules, and Makharij correction.
                </p>
              </div>
            </div>

            {/* Side Floating Video Strip */}
            <div className="w-full md:w-64 flex md:flex-col gap-2 shrink-0">
              <div className="flex-1 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                <video
                  ref={quranRemoteVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.2 rounded text-white font-bold">
                  {otherPartyName}
                </span>
              </div>
              <div className="flex-1 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-[#d4a359]/50 relative">
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
            <div className="p-3.5 border-b border-slate-800 font-bold text-xs text-[#d4a359] flex items-center justify-between">
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
                <p className="text-center text-slate-500 py-12">
                  Send live questions, notes, or Ayah references during the class.
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

            <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-slate-800 flex gap-1.5">
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

      {/* Bottom Floating Controls Bar */}
      <div className="px-4 py-3 pb-safe bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 flex items-center justify-center gap-2.5 sm:gap-4 z-30 shrink-0">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`p-3 sm:p-3.5 min-h-[44px] min-w-[44px] rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center ${
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
          className={`p-3 sm:p-3.5 min-h-[44px] min-w-[44px] rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center ${
            isCameraOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400'
          }`}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Privacy Background Blur Toggle */}
        <button
          onClick={() => setIsBackgroundBlurred(!isBackgroundBlurred)}
          className={`p-3 sm:p-3.5 min-h-[44px] min-w-[44px] rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center ${
            isBackgroundBlurred
              ? 'bg-[#143d2b] hover:bg-[#0c2217] text-[#d4a359] ring-2 ring-[#d4a359]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isBackgroundBlurred ? 'Turn Blur Off' : 'Turn Privacy Background Blur On'}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Mobile Switch Camera (Front/Back) */}
        <button
          onClick={switchCamera}
          className="md:hidden p-3 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white shadow-md cursor-pointer flex items-center justify-center"
          title="Flip Camera (Front / Back for Quran scanning)"
        >
          <RotateCcw className="w-5 h-5 text-[#d4a359]" />
        </button>

        {/* Speaker Volume & Mute Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-2 rounded-2xl border border-slate-700">
          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
            title={isSpeakerMuted || speakerVolume === 0 ? 'Unmute Remote Speaker' : 'Mute Remote Speaker'}
          >
            {isSpeakerMuted || speakerVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#d4a359]" />
            )}
          </button>
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
            className="w-14 sm:w-20 accent-[#d4a359] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            title="Classroom Speaker Volume"
          />
        </div>

        {/* Desktop Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          className={`hidden md:flex p-3 sm:p-3.5 min-h-[44px] min-w-[44px] rounded-2xl transition-all shadow-md cursor-pointer items-center justify-center ${
            isScreenSharing
              ? 'bg-[#143d2b] hover:bg-[#0c2217] text-[#d4a359] ring-2 ring-[#d4a359]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen with Student'}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* Live Chat Toggle */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`relative p-3 sm:p-3.5 min-h-[44px] min-w-[44px] rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center ${
            chatOpen
              ? 'bg-[#143d2b] text-[#d4a359]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Open Classroom Live Chat"
        >
          <MessageSquare className="w-5 h-5" />
          {chatMessages.length > 0 && !chatOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#d4a359] rounded-full animate-ping" />
          )}
        </button>

        {/* Emergency Leave & Report Button */}
        <button
          onClick={handleEmergencyLeaveAndReport}
          className="p-3 sm:p-3.5 min-h-[44px] min-w-[44px] rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold transition-all shadow-lg shadow-amber-900/40 cursor-pointer flex items-center justify-center gap-1.5"
          title="Emergency Exit & Flag Incident to Lahore Safety Team"
        >
          <ShieldAlert className="w-5 h-5 text-white" />
          <span className="hidden sm:inline text-xs font-bold">Leave &amp; Report</span>
        </button>

        {/* Leave Classroom */}
        <button
          onClick={handleLeaveClassroom}
          className="p-3 sm:p-3.5 min-h-[44px] min-w-[44px] rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold transition-all shadow-lg shadow-red-900/40 cursor-pointer flex items-center justify-center gap-1.5"
          title="End Live Class Session"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold">End Class</span>
        </button>
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
