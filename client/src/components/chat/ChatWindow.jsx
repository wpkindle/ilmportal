'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  Paperclip,
  Video,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mic,
  Square,
  Trash2,
  Radio,
  Flag,
  AlertTriangle,
  Check,
  CheckCheck,
  Lock,
  Volume2,
  VolumeX,
  Bell,
  MoreVertical,
  Heart,
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  X,
  File,
  CreditCard
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { soundEngine } from '../../utils/soundEffects';
import { showNativeNotification } from '../../utils/notificationManager';
import DealOfferCard from './DealOfferCard';
import DealOfferModal from '../tutor/DealOfferModal';
import TutorPaymentModal from '../tutor/TutorPaymentModal';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import ReportModal from './ReportModal';
import LoadingSpinner from '../common/LoadingSpinner';
import StudentProfileModal from '../common/StudentProfileModal';
import FemaleTutorGateModal from '../common/FemaleTutorGateModal';
import ChatRequestModal from '../common/ChatRequestModal';
import { calculateClientCompletion } from '../common/ProfileCompletionMeter';

const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://ilmportal-backend.onrender.com/api').replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatWindow = ({ conversationId, partner, initialDeal, onBack }) => {
  const { user, isTutor, isStudent } = useAuth();
  const isTutorToTutor = (isTutor || user?.role === 'tutor') && partner?.role === 'tutor';
  const { socket, onlineUsers, onlineStatusMap, refreshUserOnlineStatus } = useSocket();
  const { soundEnabled, toggleSound, permissionStatus, requestPermission } = useNotifications();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [partnerDeal, setPartnerDeal] = useState(initialDeal || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialDeal) {
      setPartnerDeal(initialDeal);
    }
  }, [initialDeal]);

  // 72-hour grace period clearance check for tutors
  const isTutorFeeOverdue = Boolean(
    isTutor &&
    partnerDeal &&
    (
      partnerDeal.accessRestricted ||
      partnerDeal.status === 'restricted' ||
      (partnerDeal.tutorFeeDueDate && new Date(partnerDeal.tutorFeeDueDate) < new Date() && !partnerDeal.tutorFeePaid)
    )
  );

  // Video call / Live class option is ONLY visible when deal has been accepted AND tutor is not restricted!
  const isDealAccepted = Boolean(
    !isTutorFeeOverdue &&
    (
      (partnerDeal &&
        ['active_trial', 'continuation_agreed', 'active_paid'].includes(partnerDeal.status) &&
        !partnerDeal.accessRestricted &&
        partnerDeal.status !== 'restricted') ||
      messages.some(
        (m) =>
          m.messageType === 'deal_accept' ||
          m.dealOfferData?.status === 'active_trial' ||
          m.deal?.status === 'active_trial' ||
          (m.deal &&
            ['active_trial', 'continuation_agreed', 'active_paid'].includes(m.deal.status) &&
            !m.deal.accessRestricted &&
            m.deal.status !== 'restricted')
      )
    )
  );

  // Student Profile & Female Tutor Gate State
  const [studentProfileModalOpen, setStudentProfileModalOpen] = useState(false);
  const [tutorPaymentModalOpen, setTutorPaymentModalOpen] = useState(false);
  const [femaleTutorRequestStatus, setFemaleTutorRequestStatus] = useState(null);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Check request status if student is viewing a tutor's chat
  useEffect(() => {
    const partnerId = partner?._id || partner?.id;
    if (user?.role === 'student' && partnerId && partner?.role === 'tutor') {
      api.getChatRequestStatus(partnerId)
        .then(res => {
          if (res?.success) {
            setFemaleTutorRequestStatus(res);
          }
        })
        .catch(err => console.error('Error fetching chat request status in ChatWindow:', err));
    }
  }, [user?.role, partner]);

  // Socket listener for real-time request approval/decline
  useEffect(() => {
    if (!socket) return;
    const handleRequestUpdated = (data) => {
      if (data.conversationId === conversationId || data.requestId) {
        setFemaleTutorRequestStatus(prev => prev ? { ...prev, requestStatus: data.status } : prev);
      }
    };
    socket.on('chat-request-updated', handleRequestUpdated);
    return () => socket.off('chat-request-updated', handleRequestUpdated);
  }, [socket, conversationId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const partnerIdStr = partner?._id ? partner._id.toString() : '';
  const isPartnerOnline = partnerIdStr ? (onlineStatusMap?.[partnerIdStr] === true) : false;

  // Scroll ONLY the inner chat messages container directly to the latest message (never scrolls the outer window)
  const scrollToBottom = (smooth = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Fetch initial messages and active deal (Seen is ONLY emitted when tab has active focus)
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.getChatMessages(conversationId);
        if (res.success) {
          setMessages(res.messages || []);
          if (res.deal) {
            setPartnerDeal(res.deal);
          }
        }

        // Fetch active/pending deal if available
        const pId = (partner?._id || partner?.id)?.toString();
        const myId = (user?._id || user?.id)?.toString();
        if (pId) {
          const dealsRes = await api.getMyDeals();
          if (dealsRes.success && dealsRes.deals) {
            const currentDeal = dealsRes.deals.find((d) => {
              const tId = (d.tutor?._id || d.tutor)?.toString();
              const sId = (d.student?._id || d.student)?.toString();
              return (
                ((tId === myId && sId === pId) || (tId === pId && sId === myId)) &&
                ['active_trial', 'continuation_agreed', 'active_paid', 'pending_offer'].includes(d.status)
              );
            });
            if (currentDeal) setPartnerDeal(currentDeal);
          }
        }
      } catch (err) {
        console.error('Error loading chat messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, socket]);

  // Socket listener for new incoming messages, deal updates, and seen receipts
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation rooms
    socket.emit('join-conversation', conversationId);
    const partnerIdStr = partner?._id ? partner._id.toString() : '';
    const myIdStr = (user?._id || user?.id)?.toString();
    if (myIdStr && partnerIdStr) {
      const canonId = [myIdStr, partnerIdStr].sort().join('_');
      if (canonId !== conversationId) {
        socket.emit('join-conversation', canonId);
      }
    }

    // Immediately verify partner's online status
    if (partnerIdStr && refreshUserOnlineStatus) {
      refreshUserOnlineStatus(partnerIdStr);
    }

    const handleReceiveMessage = (msg) => {
      const currentUserId = (user?._id || user?.id)?.toString();
      const senderId = (msg.sender?._id || msg.sender)?.toString();
      const recipientId = (msg.recipient?._id || msg.recipient)?.toString();
      const pId = (partner?._id || partner?.id)?.toString();

      // Reliable match: exact conversationId OR messages between current user & this partner
      const isMatch =
        (msg.conversationId && conversationId && msg.conversationId.toString() === conversationId.toString()) ||
        (senderId === pId && recipientId === currentUserId) ||
        (senderId === currentUserId && recipientId === pId);

      if (isMatch) {
        if (
          msg.messageType === 'deal_accept' ||
          msg.dealOfferData?.status === 'active_trial' ||
          msg.deal?.status === 'active_trial'
        ) {
          const incomingDeal = msg.deal || msg.dealOfferData || { status: 'active_trial' };
          setPartnerDeal((prev) => ({ ...(prev || {}), ...incomingDeal, status: 'active_trial' }));
        }

        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          const hasTemp = prev.some((m) => m._id?.startsWith?.('temp_') && m.text === msg.text);
          if (hasTemp) {
            return prev.map((m) => (m._id?.startsWith?.('temp_') && m.text === msg.text ? msg : m));
          }
          return [...prev, msg];
        });
        setTimeout(() => scrollToBottom(true), 50);

        // If I received this message from my counterpart
        if (currentUserId && senderId !== currentUserId) {
          // Play WhatsApp/Messenger style double-chime
          soundEngine.playMessageSound();

          // If document is not currently focused/visible, show native desktop/mobile OS notification banner
          if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            showNativeNotification({
              title: `${msg.sender?.name || partner?.name || 'New Message'}`,
              body: msg.text || (msg.voiceData ? 'Sent a voice note' : 'Sent an offer update'),
              icon: msg.sender?.avatar || partner?.avatar || '/icon.png',
              url: isTutor 
                ? `/tutor/messages?conversation=${conversationId}` 
                : `/student/messages?conversation=${conversationId}`,
              tag: `msg-${msg._id}`,
              soundType: 'none'
            });
          }

          // ONLY mark as seen if the recipient is ACTUALLY viewing and focused on this window right now
          const isActivelyFocused = 
            typeof document !== 'undefined' && 
            document.visibilityState === 'visible' && 
            document.hasFocus();

          if (recipientId === currentUserId && isActivelyFocused) {
            socket.emit('mark-messages-seen', {
              conversationId,
              readerId: currentUserId
            });
          }
        }
      }
    };

    // When the other person reads my messages
    const handleMessagesSeen = ({ conversationId: seenConvId, readerId }) => {
      const currentUserId = (user?._id || user?.id)?.toString();
      if (seenConvId === conversationId && readerId.toString() !== currentUserId) {
        setMessages((prev) =>
          prev.map((m) => {
            const senderId = (m.sender?._id || m.sender)?.toString();
            if (senderId === currentUserId) {
              return { ...m, isRead: true, isDelivered: true, readAt: new Date() };
            }
            return m;
          })
        );
      }
    };

    // When messages sent by me are delivered to the recipient
    const handleMessagesDelivered = ({ conversationId: delivConvId }) => {
      const currentUserId = (user?._id || user?.id)?.toString();
      if (delivConvId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => {
            const senderId = (m.sender?._id || m.sender)?.toString();
            if (senderId === currentUserId && !m.isRead) {
              return { ...m, isDelivered: true };
            }
            return m;
          })
        );
      }
    };

    // Real-time deal status update from counterpart or admin
    const handleDealStatusUpdated = (updatedDeal) => {
      if (updatedDeal) {
        setPartnerDeal((prev) => ({ ...(prev || {}), ...updatedDeal }));
      }
    };

    socket.on('new-message', handleReceiveMessage);
    socket.on('messages-seen', handleMessagesSeen);
    socket.on('messages-delivered', handleMessagesDelivered);
    socket.on('deal-status-updated', handleDealStatusUpdated);

    return () => {
      socket.off('new-message', handleReceiveMessage);
      socket.off('messages-seen', handleMessagesSeen);
      socket.off('messages-delivered', handleMessagesDelivered);
      socket.off('deal-status-updated', handleDealStatusUpdated);
    };
  }, [socket, conversationId, user]);

  // Mark messages as seen ONLY when this chat window is actively in the user's viewport with browser focus
  useEffect(() => {
    if (!socket || !conversationId || !user) return;

    const currentUserId = (user._id || user.id)?.toString();

    const markSeenIfActive = () => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible' &&
        document.hasFocus() &&
        socket.connected
      ) {
        socket.emit('mark-messages-seen', {
          conversationId,
          readerId: currentUserId
        });
      }
    };

    // Check once on mount (only if active)
    markSeenIfActive();

    // Re-check whenever the user switches back to this browser tab
    window.addEventListener('focus', markSeenIfActive);
    document.addEventListener('visibilitychange', markSeenIfActive);

    return () => {
      window.removeEventListener('focus', markSeenIfActive);
      document.removeEventListener('visibilitychange', markSeenIfActive);
    };
  }, [socket, conversationId, user]);

  // Auto-scroll directly to the latest message whenever conversation loads or changes
  useEffect(() => {
    if (!loading) {
      scrollToBottom(false);
      const t1 = setTimeout(() => scrollToBottom(false), 20);
      const t2 = setTimeout(() => scrollToBottom(false), 120);
      const t3 = setTimeout(() => scrollToBottom(false), 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [loading, conversationId]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(false);
      const t = setTimeout(() => scrollToBottom(false), 50);
      return () => clearTimeout(t);
    }
  }, [messages.length, loading]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }
  };

  const handleClearSelectedFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user || !partner?._id) return;

    // Handle file upload if a file is selected
    if (selectedFile) {
      const fileToUpload = selectedFile;
      const previewUrl = filePreview;
      const captionText = inputText.trim();
      const currentUserId = (user._id || user.id)?.toString();
      const tempId = `temp_file_${Date.now()}`;

      // Optimistic file message
      const optimisticFileMsg = {
        _id: tempId,
        conversationId,
        sender: {
          _id: currentUserId,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        },
        recipient: partner,
        messageType: 'file',
        text: captionText || fileToUpload.name,
        fileName: fileToUpload.name,
        fileSize: fileToUpload.size,
        fileType: fileToUpload.type,
        fileUrl: previewUrl || '',
        createdAt: new Date().toISOString(),
        isDelivered: isPartnerOnline,
        isRead: false
      };

      setMessages((prev) => [...prev, optimisticFileMsg]);
      handleClearSelectedFile();
      setInputText('');
      setUploadingFile(true);
      setTimeout(() => scrollToBottom(true), 50);

      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('recipientId', partner._id);
        formData.append('conversationId', conversationId);
        if (captionText) {
          formData.append('caption', captionText);
        }

        const res = await api.uploadChatFile(formData);
        if (res.success && res.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? res.message : m))
          );
        }
      } catch (err) {
        console.error('Error uploading file attachment:', err);
        alert(err.message || 'Failed to send file attachment. Please try again.');
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
      } finally {
        setUploadingFile(false);
      }
      return;
    }

    if (!inputText.trim()) return;

    const currentUserId = (user._id || user.id)?.toString();
    const textToSend = inputText.trim();
    const tempId = `temp_${Date.now()}`;

    // Optimistic UI update: show immediately on sender's screen
    const optimisticMsg = {
      _id: tempId,
      conversationId,
      sender: {
        _id: currentUserId,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      },
      recipient: partner,
      text: textToSend,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      isDelivered: isPartnerOnline,   // if partner is online, show Delivered immediately
      isRead: false
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');

    const payload = {
      conversationId,
      senderId: currentUserId,
      recipientId: partner._id,
      text: textToSend,
      messageType: 'text',
      tempId
    };

    if (socket && socket.connected) {
      socket.emit('send-message', payload);
    } else {
      try {
        const res = await api.sendChatMessage(payload);
        if (res.success && res.chatMessage) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? res.chatMessage : m))
          );
        }
      } catch (err) {
        console.error('Error sending message fallback:', err);
      }
    }
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Voice recording is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to record voice notes.');
    }
  };

  // Cancel Audio Recording
  const cancelRecording = () => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordDuration(0);
    audioChunksRef.current = [];
  };

  // Stop and Send Audio Recording
  const sendVoiceRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result;
        const payload = {
          conversationId,
          senderId: user._id || user.id,
          recipientId: partner._id,
          messageType: 'voice',
          voiceData: base64Audio,
          voiceDuration: recordDuration
        };

        if (socket && socket.connected) {
          socket.emit('send-message', payload);
        } else {
          try {
            const res = await api.sendChatMessage(payload);
            if (res.success && res.chatMessage) {
              setMessages((prev) => {
                if (prev.some((m) => m._id === res.chatMessage._id)) return prev;
                return [...prev, res.chatMessage];
              });
            }
          } catch (err) {
            console.error('Error sending voice message:', err);
          }
        }
      };

      reader.readAsDataURL(audioBlob);

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
      setRecordDuration(0);
      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.stop();
  };

  const handleOfferSent = (createdDeal) => {
    setPartnerDeal(createdDeal);
    api.getChatMessages(conversationId).then((res) => {
      if (res.success) setMessages(res.messages);
    });
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading conversation..." />;
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-132px)] lg:h-[84vh] bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      
      {/* Top Chat Header (Responsive, Fiverr/Upwork Style Online/Offline Badge) */}
      <div className="p-2.5 sm:p-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative shrink-0">
            <img
              src={partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'User')}&background=059669&color=fff`}
              alt={partner?.name}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-white shadow-sm"
            />
            {isPartnerOnline ? (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-emerald-500/20 shadow-xs"
                title="Online Now"
              />
            ) : (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-slate-300 border-2 border-white rounded-full"
                title="Offline"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                {partner?.name || 'Tutoring Chat'}
              </h3>
              <span className="text-[8.5px] sm:text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                {partner?.role}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] sm:text-[11px] truncate">
              {isPartnerOnline ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/70 text-[9.5px] sm:text-[10px] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-[9.5px] sm:text-[10px] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Offline</span>
                </span>
              )}

              <span className="text-slate-300 shrink-0">&bull;</span>
              <span className="text-slate-500 truncate">{partner?.city || 'Pakistan'}</span>
              <span className="text-[10px] text-emerald-700 font-medium hidden sm:inline-flex items-center gap-1 shrink-0">
                <Mic className="w-3 h-3 text-emerald-600" />
                <span>Voice Notes</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live In-Platform Video Classroom Button (only visible after deal is accepted) */}
          {!isTutorToTutor && isDealAccepted && (
            <Link
              href={`/classroom/${conversationId}`}
              className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Start or Join In-Platform HD Video Class"
            >
              <Video className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
              <span className="hidden sm:inline">Join Live Class</span>
            </Link>
          )}

          {/* Action: Inspect Student Profile (available to all tutors) */}
          {(isTutor || partner?.role === 'student') && (
            <button
              type="button"
              onClick={() => setStudentProfileModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Inspect Student's Verified Profile"
            >
              <User className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Student Profile</span>
            </button>
          )}

          {/* Tutor Action: Send Course Offer */}
          {isTutor && (
            <button
              type="button"
              onClick={() => setDealModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="Send Course Offer"
            >
              <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-200 shrink-0" />
              <span className="hidden sm:inline">Send Course Offer</span>
            </button>
          )}

          {/* Desktop Inline Actions: Sound, Alerts, Report, Block */}
          <div className="hidden md:flex items-center gap-1.5">
            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={requestPermission}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Turn on desktop notifications"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Enable Alerts</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => toggleSound()}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Mute chime' : 'Enable chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {partner && (
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Report user to platform admin"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Report</span>
              </button>
            )}
          </div>

          {/* Mobile Secondary Actions Dropdown (3-Dots Menu) */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="More Options"
              aria-label="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                {!isTutorToTutor && isDealAccepted && (
                  <Link
                    href={`/classroom/${conversationId}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-emerald-700 font-semibold cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>Join Live Class</span>
                  </Link>
                )}

                {isTutor && (
                  <button
                    type="button"
                    onClick={() => {
                      setDealModalOpen(true);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-emerald-700 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Send Course Offer</span>
                  </button>
                )}

                <div className="h-px bg-slate-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    toggleSound();
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>{soundEnabled ? 'Mute Sound' : 'Enable Sound'}</span>
                </button>

                {permissionStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={() => {
                      requestPermission();
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-amber-50 text-amber-900 font-semibold cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>Enable Alerts</span>
                  </button>
                )}

                <div className="h-px bg-slate-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report to Admin</span>
                </button>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('ilmportal:open-support'));
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Support Platform</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* End-to-End Encrypted & AI Moderation Safe Banner */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border-b border-emerald-800/60 flex items-center justify-between gap-1.5 text-[10px] sm:text-xs shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <div className="p-0.5 sm:p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <span className="font-bold text-emerald-300 truncate">AI Protected Safe Chat</span>
          <span className="text-slate-400 hidden sm:inline">&bull; 100% Privacy &amp; Family Safe</span>
        </div>
        <div className="text-[9.5px] sm:text-[10px] text-slate-300 font-medium shrink-0 flex items-center gap-1.5">
          <span>Protected</span>
          <Link href="/safety" className="text-emerald-400 hover:text-emerald-300 underline font-bold">
            Rules
          </Link>
        </div>
      </div>

      {/* Messages List Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">Start the conversation</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Discuss trial timings, learning goals, or send a course agreement offer.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const currentUserId = (user?._id || user?.id)?.toString();
          const msgSenderId = (msg.sender?._id || msg.sender)?.toString();
          const isMe = msgSenderId === currentUserId;
          const isVoiceMsg = msg.messageType === 'voice' || !!msg.voiceData;
          const isFileMsg = msg.messageType === 'file' || !!msg.fileUrl;
          const isImg =
            isFileMsg &&
            (msg.fileType?.startsWith('image/') ||
              /\.(jpg|jpeg|png|webp|gif)$/i.test(msg.fileUrl || msg.fileName || ''));

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {msg.isDealOffer || msg.messageType === 'deal_offer' || msg.messageType === 'deal_accept' ? (
                <DealOfferCard
                  deal={msg.deal || msg.dealOfferData || partnerDeal}
                  onDealUpdated={(updated) => setPartnerDeal(updated)}
                />
              ) : isVoiceMsg ? (
                <VoiceMessagePlayer
                  voiceData={msg.voiceData}
                  duration={msg.voiceDuration || 0}
                  isMe={isMe}
                />
              ) : isFileMsg && isImg ? (
                /* Image Attachment Bubble */
                <div className="flex items-center gap-1.5 group/msg relative">
                  <div
                    className={`max-w-xs sm:max-w-sm rounded-2xl overflow-hidden shadow-2xs ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <a
                      href={getFileUrl(msg.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group/img overflow-hidden cursor-pointer bg-slate-950/5"
                    >
                      <img
                        src={getFileUrl(msg.fileUrl)}
                        alt={msg.fileName || 'Image Attachment'}
                        className="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold gap-1.5">
                        <ExternalLink className="w-4 h-4" />
                        <span>View Full Image</span>
                      </div>
                    </a>
                    {msg.text && msg.text !== msg.fileName && (
                      <div className="p-2.5 text-xs font-medium leading-relaxed">
                        {msg.text}
                      </div>
                    )}
                    <div
                      className={`px-3 py-1.5 text-[10px] flex items-center justify-between border-t ${
                        isMe ? 'border-emerald-600/50 text-emerald-100' : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="truncate max-w-[180px] font-medium">{msg.fileName || 'Photo'}</span>
                      {msg.fileSize ? <span>{formatFileSize(msg.fileSize)}</span> : null}
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Report this file"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : isFileMsg ? (
                /* Document Attachment Bubble (PDF / DOC / TXT) */
                <div className="flex items-center gap-1.5 group/msg relative">
                  <div
                    className={`max-w-xs sm:max-w-sm p-3.5 rounded-2xl shadow-2xs space-y-2.5 ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isMe ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate" title={msg.fileName}>
                          {msg.fileName || 'Document Attachment'}
                        </p>
                        <p className={`text-[10px] ${isMe ? 'text-emerald-200' : 'text-slate-500'}`}>
                          {formatFileSize(msg.fileSize)} &bull; {msg.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                    </div>
                    {msg.text && msg.text !== msg.fileName && (
                      <p className="text-xs font-medium leading-relaxed">
                        {msg.text}
                      </p>
                    )}
                    <a
                      href={getFileUrl(msg.fileUrl)}
                      target="_blank"
                      download={msg.fileName}
                      rel="noopener noreferrer"
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isMe
                          ? 'bg-emerald-800/90 hover:bg-emerald-900 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download / Open File</span>
                    </a>
                  </div>

                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Report this file"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                /* Standard Text Message */
                <div className="flex items-center gap-1.5 group/msg relative">
                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-br-none shadow-2xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Report this specific message for moderation review"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Timestamp + Sent / Delivered / Seen Status for Outgoing Messages */}
              <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] font-mono text-slate-400">
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {isMe && (
                  <span className="flex items-center gap-0.5 ml-1">
                    {msg.isRead ? (
                      <span className="flex items-center gap-0.5 text-emerald-600 font-bold" title={`Seen ${msg.readAt ? new Date(msg.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[8.5px] uppercase tracking-wider">Seen</span>
                      </span>
                    ) : msg.isDelivered ? (
                      <span className="flex items-center gap-0.5 text-slate-400 font-medium" title="Delivered">
                        <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[8.5px] uppercase tracking-wider">Delivered</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-slate-400" title="Sent">
                        <Check className="w-3 h-3 text-slate-400" />
                        <span className="text-[8.5px] uppercase tracking-wider">Sent</span>
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-0 w-full" />
      </div>

      {/* Bottom Message Input Area */}
      <div className="p-2 sm:p-3 bg-white border-t border-slate-200/80 shrink-0">
        {isTutorFeeOverdue ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2.5 shadow-xs animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-rose-900 font-black text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Chat &amp; Video Classroom Access Restricted</span>
            </div>
            <p className="text-[11px] text-rose-700 max-w-lg mx-auto leading-relaxed">
              The 72-hour grace period for platform fee clearance has expired without payment verification. Chat messaging and video classroom joining are paused until the platform fee is cleared with administration.
            </p>
            {partnerDeal && (
              <button
                type="button"
                onClick={() => setTutorPaymentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer hover:scale-105"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Platform Fee ({partnerDeal.platformFee ? `PKR ${partnerDeal.platformFee.toLocaleString()}` : 'Contact Admin'})</span>
              </button>
            )}
          </div>
        ) : user?.role === 'tutor' && partner?.role === 'tutor' ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-1">
            <p className="text-xs font-bold text-amber-900">Direct Chat Disabled Between Tutors</p>
            <p className="text-[11px] text-amber-700">
              IlmPortal messaging is dedicated strictly to student-tutor learning communication. Tutors cannot chat with other tutors.
            </p>
          </div>
        ) : user?.role === 'student' && femaleTutorRequestStatus?.isFemaleTutor && femaleTutorRequestStatus?.requestStatus !== 'accepted' ? (
          /* Female Tutor Request Status Gate Banner */
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5 min-w-0">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-black text-emerald-300">
                  {femaleTutorRequestStatus?.requestStatus === 'pending'
                    ? 'Message Request Pending Approval'
                    : femaleTutorRequestStatus?.requestStatus === 'declined'
                    ? 'Tutor Currently Unavailable'
                    : '100% Profile & Intro Request Required'}
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {femaleTutorRequestStatus?.requestStatus === 'pending'
                    ? `${partner?.name || 'The tutor'} has received your request. Once accepted, live messaging will unlock immediately. You will also be notified by email and in your Notification Center.`
                    : femaleTutorRequestStatus?.requestStatus === 'declined'
                    ? `${partner?.name || 'The tutor'} is currently at full capacity and unable to take on new students.`
                    : `To chat with female tutors, your profile must be 100% complete and verified before messaging.`}
                </p>
              </div>
            </div>

            {femaleTutorRequestStatus?.requestStatus === 'none' && (
              <button
                type="button"
                onClick={() => {
                  const { percentage } = calculateClientCompletion(user, null);
                  if (percentage < 100) setGateModalOpen(true);
                  else setRequestModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shrink-0 transition-colors cursor-pointer"
              >
                Send Message Request
              </button>
            )}

            {femaleTutorRequestStatus?.requestStatus === 'declined' && (
              <Link
                href="/tutors"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shrink-0 transition-colors"
              >
                Browse Other Tutors
              </Link>
            )}
          </div>
        ) : isRecording ? (
          /* Live Voice Recording UI */
          <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-rose-600 rounded-full animate-ping" />
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                <Radio className="w-4 h-4" />
                <span>Recording Voice Note:</span>
                <span className="font-mono text-sm">{formatSeconds(recordDuration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                title="Cancel Recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={sendVoiceRecording}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Note</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Text, File Attachment & Voice Input */
          <div className="w-full space-y-2">
            {/* File attachment preview chip before sending */}
            {selectedFile && (
              <div className="p-2 sm:p-2.5 bg-slate-50 border border-emerald-200 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 min-w-0">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Upload Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {formatFileSize(selectedFile.size)} &bull; Ready to send
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelectedFile}
                  disabled={uploadingFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Remove Attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-1.5 w-full">
              {/* File Attachment Input (hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              {/* File Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="p-2 sm:p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl sm:rounded-2xl transition-colors cursor-pointer shrink-0"
                title="Attach Document or Image"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Voice Recording Button */}
              <button
                type="button"
                onClick={startRecording}
                disabled={uploadingFile || !!selectedFile}
                className="p-2 sm:p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl sm:rounded-2xl transition-colors cursor-pointer shrink-0 disabled:opacity-30"
                title="Hold to Record Voice Note"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Text / Caption Input */}
              <input
                type="text"
                placeholder={selectedFile ? 'Add a caption / note (optional)...' : 'Type a message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={uploadingFile}
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm sm:text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium min-h-[40px] sm:min-h-[44px]"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={uploadingFile || (!inputText.trim() && !selectedFile)}
                className="p-2.5 sm:p-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl sm:rounded-2xl disabled:opacity-40 transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center"
              >
                {uploadingFile ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Tutor Deal Modal */}
      {isTutor && (
        <DealOfferModal
          isOpen={dealModalOpen}
          onClose={() => setDealModalOpen(false)}
          studentId={partner?._id}
          studentName={partner?.name}
          onOfferSent={handleOfferSent}
        />
      )}

      {/* Incident / Safety Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUser={partner}
        conversationId={conversationId}
        messages={messages}
      />

      {/* Student Profile Inspection Modal for Tutors */}
      <StudentProfileModal
        isOpen={studentProfileModalOpen}
        onClose={() => setStudentProfileModalOpen(false)}
        studentId={partner?._id}
        studentData={partner?.role === 'student' ? partner : null}
      />

      {/* Female Tutor Gate Modal (<100% profile strength) */}
      <FemaleTutorGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        user={user}
        tutorName={partner?.name}
        tutorAvatar={partner?.avatar}
      />

      {/* Female Tutor Message Request Modal (100% profile strength) */}
      <ChatRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        tutor={partner}
        studentUser={user}
        onSuccess={() => {
          setFemaleTutorRequestStatus(prev => ({ ...prev, requestStatus: 'pending' }));
        }}
      />

      {/* Tutor Platform Fee Payment Modal */}
      {partnerDeal && (
        <TutorPaymentModal
          deal={partnerDeal}
          isOpen={tutorPaymentModalOpen}
          onClose={() => setTutorPaymentModalOpen(false)}
          onSuccess={() => {
            setTutorPaymentModalOpen(false);
            setPartnerDeal((prev) =>
              prev ? { ...prev, paymentStatus: 'submitted_proof', tutorPaymentProofReference: 'Submitted' } : prev
            );
          }}
        />
      )}

    </div>
  );
};

export default ChatWindow;
