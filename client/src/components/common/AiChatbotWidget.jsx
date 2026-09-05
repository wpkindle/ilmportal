'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  X,
  Send,
  User,
  ChevronDown,
  Headphones,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Paperclip,
  Trash2,
  Mail,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const QUICK_INQUIRIES = [
  'Inquire about 3-Day Free Trial',
  'Find verified female Quran Alimah',
  'Find Cambridge O/A Level tutor',
  'Tuition fees & payment methods',
  'Tutor verification & registration help'
];

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

const renderFormattedText = (content) => {
  if (!content) return null;

  // Split by markdown links [label](url)
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-[#d4a359] hover:underline bg-[#0c2217]/70 px-2 py-0.5 rounded-md border border-[#d4a359]/30 my-0.5"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 text-[#d4a359]" />
        </a>
      );
    }

    // Bold formatting **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bi) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return <strong key={bi} className="font-bold text-white">{bPart.slice(2, -2)}</strong>;
      }
      return bPart;
    });
  });
};

export default function LiveSupportWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [supportStatus, setSupportStatus] = useState('open'); // 'open' | 'human_requested' | 'admin_joined' | 'resolved'
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [isOfflineView, setIsOfflineView] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'admin',
      senderName: 'IlmiDunya Support Desk',
      text: "Assalam-o-Alaikum! Welcome to IlmiDunya Live Support. 👋\n\nHow can we help you today? Send your inquiry below and our administrative team will respond right here in real-time.\n\nIf staff is away, you can also leave a message with your email and our team will get back to you.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  // File upload state (strictly PNG, JPG, JPEG, PDF)
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Offline message form state
  const [offlineEmail, setOfflineEmail] = useState('');
  const [offlineName, setOfflineName] = useState('');
  const [offlineMessage, setOfflineMessage] = useState('');
  const [offlineSending, setOfflineSending] = useState(false);
  const [offlineSubmitted, setOfflineSubmitted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Pre-fill user email/name when user changes
  useEffect(() => {
    if (user?.email) setOfflineEmail(user.email);
    if (user?.name) setOfflineName(user.name);
  }, [user]);

  // Play gentle chime on incoming admin message
  const playMessageChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  // 1. Initialize or restore persistent sessionId from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('ilmidunya_support_session_id');
      if (!storedId) {
        storedId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('ilmidunya_support_session_id', storedId);
      }
      setSessionId(storedId);
    }
  }, []);

  // 2. Restore previous live conversation history from database
  useEffect(() => {
    if (!sessionId) return;
    api.getSupportSessionHistory(sessionId).then((res) => {
      if (res?.success && Array.isArray(res.messages) && res.messages.length > 0) {
        setMessages(res.messages.map((m) => ({
          id: m._id || (Date.now() + Math.random()).toString(),
          sender: m.sender,
          senderName: m.senderName || (m.sender === 'user' ? 'You' : 'Staff Admin'),
          senderAvatar: m.senderAvatar,
          text: m.text,
          fileUrl: m.fileUrl,
          fileName: m.fileName,
          fileType: m.fileType,
          fileSize: m.fileSize,
          timestamp: new Date(m.createdAt || Date.now())
        })));
        if (res.session?.status) {
          setSupportStatus(res.session.status);
        }
        if (res.session?.assignedAdmin?.name) {
          setAssignedAdmin(res.session.assignedAdmin.name);
        }
      }
    }).catch(() => {});
  }, [sessionId]);

  // 3. Query initial Admin Online Status via REST
  useEffect(() => {
    api.getAdminOnlineStatus()
      .then((res) => {
        if (res && typeof res.isOnline === 'boolean') {
          setIsAdminOnline(res.isOnline);
        }
      })
      .catch(() => {});
  }, []);

  // 3. Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // 4. Socket listeners for real-time live chat with Admin
  useEffect(() => {
    if (!socket || !sessionId) return;

    // Check online status via socket
    socket.emit('check-admin-online-status', (res) => {
      if (res && typeof res.isOnline === 'boolean') {
        setIsAdminOnline(res.isOnline);
      }
    });

    const handleAdminOnlineStatus = (data) => {
      if (typeof data?.isOnline === 'boolean') {
        setIsAdminOnline(data.isOnline);
      }
    };

    socket.on('admin-online-status', handleAdminOnlineStatus);

    if (sessionId) {
      socket.emit('join-support-session', { sessionId });
    }

    const handleMessageReceived = (data) => {
      if (data?.sessionId === sessionId && data?.message) {
        const incoming = data.message;
        setMessages((prev) => {
          // Avoid duplicate appends
          if (prev.some((m) => m.id === incoming._id || (m.text === incoming.text && m.sender === incoming.sender && Math.abs(new Date(m.timestamp) - new Date(incoming.createdAt)) < 2000))) {
            return prev;
          }

          if (incoming.sender === 'admin') {
            playMessageChime();
            if (!isOpen) {
              setUnreadCount((c) => c + 1);
            }
          }

          return [
            ...prev,
            {
              id: incoming._id || (Date.now() + Math.random()).toString(),
              sender: incoming.sender,
              senderName: incoming.senderName || (incoming.sender === 'admin' ? 'Staff Specialist' : 'You'),
              senderAvatar: incoming.senderAvatar,
              text: incoming.text,
              fileUrl: incoming.fileUrl,
              fileName: incoming.fileName,
              fileType: incoming.fileType,
              fileSize: incoming.fileSize,
              timestamp: new Date(incoming.createdAt || Date.now())
            }
          ];
        });
      }
    };

    const handleAdminJoined = (data) => {
      if (data?.sessionId === sessionId) {
        setSupportStatus('admin_joined');
        setAssignedAdmin(data.admin?.name || 'Support Staff');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'system',
            text: `🟢 **${data.admin?.name || 'A Support Administrator'} has joined this chat.** You are now speaking directly in real-time.`,
            timestamp: new Date()
          }
        ]);
        playMessageChime();
      }
    };

    const handleStatusChanged = (data) => {
      if (data?.sessionId === sessionId && data.status) {
        setSupportStatus(data.status);
      }
    };

    const handleTyping = (data) => {
      if (data?.sessionId === sessionId && data.sender === 'admin') {
        setIsAdminTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data?.sessionId === sessionId && data.sender === 'admin') {
        setIsAdminTyping(false);
      }
    };

    socket.on('support-message-received', handleMessageReceived);
    socket.on('admin-joined-support', handleAdminJoined);
    socket.on('support-status-changed', handleStatusChanged);
    socket.on('support-typing', handleTyping);
    socket.on('support-stop-typing', handleStopTyping);

    return () => {
      socket.off('admin-online-status', handleAdminOnlineStatus);
      socket.off('support-message-received', handleMessageReceived);
      socket.off('admin-joined-support', handleAdminJoined);
      socket.off('support-status-changed', handleStatusChanged);
      socket.off('support-typing', handleTyping);
      socket.off('support-stop-typing', handleStopTyping);
    };
  }, [socket, sessionId, isOpen]);

  // Handle typing debounce to alert admin desk
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!socket || !sessionId) return;

    socket.emit('support-typing', {
      sessionId,
      sender: 'user',
      senderName: user?.name || 'Website Visitor'
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('support-stop-typing', {
        sessionId,
        sender: 'user',
        senderName: user?.name || 'Website Visitor'
      });
    }, 1500);
  };

  // Handle file selection (strictly PNG, JPG, JPEG, PDF)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const isAllowed = allowedMimeTypes.includes(file.type) || allowedExtensions.includes(ext);

    if (!isAllowed) {
      alert('Only PNG, JPG, JPEG, and PDF files are allowed.');
      e.target.value = '';
      return;
    }

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

  // Send message directly to Admin Support Team
  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if ((!text && !selectedFile) || isSending || uploadingFile) return;

    const senderName = user?.name || 'Website Visitor';
    const senderAvatar = user?.avatar || '';

    let uploadedAttachment = null;

    // If file is attached, upload first
    if (selectedFile) {
      setUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('sessionId', sessionId);
        const uploadRes = await api.uploadSupportFile(formData);
        if (uploadRes?.success) {
          uploadedAttachment = {
            fileUrl: uploadRes.fileUrl,
            fileName: uploadRes.fileName,
            fileType: uploadRes.fileType,
            fileSize: uploadRes.fileSize
          };
        }
      } catch (uploadErr) {
        console.error('Support file upload failed:', uploadErr);
        alert('Failed to upload file. Please try again.');
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    }

    const localMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: user?.name || 'You',
      text,
      fileUrl: uploadedAttachment?.fileUrl,
      fileName: uploadedAttachment?.fileName,
      fileType: uploadedAttachment?.fileType,
      fileSize: uploadedAttachment?.fileSize,
      timestamp: new Date()
    };

    // Optimistically show user's message
    setMessages((prev) => [...prev, localMessage]);
    setInputValue('');
    handleClearSelectedFile();
    setIsSending(true);

    if (supportStatus !== 'admin_joined') {
      setSupportStatus('human_requested');
    }

    try {
      // 1. Send via WebSocket for instant delivery to admins
      if (socket) {
        socket.emit('send-support-message', {
          sessionId,
          text,
          sender: 'user',
          senderName,
          senderAvatar,
          fileUrl: uploadedAttachment?.fileUrl || '',
          fileName: uploadedAttachment?.fileName || '',
          fileType: uploadedAttachment?.fileType || '',
          fileSize: uploadedAttachment?.fileSize || 0
        });
      }

      // 2. Also persist via REST API fallback to guarantee DB write & admin alert
      const guestInfo = user ? {
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city
      } : {
        name: senderName,
        role: 'visitor'
      };

      await api.sendSupportChatMessage({
        message: text,
        sessionId,
        guestInfo,
        fileUrl: uploadedAttachment?.fileUrl,
        fileName: uploadedAttachment?.fileName,
        fileType: uploadedAttachment?.fileType,
        fileSize: uploadedAttachment?.fileSize
      });
    } catch (err) {
      console.warn('Support message sync notice:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Submit Offline Email Message
  const handleSendOfflineMessage = async (e) => {
    e.preventDefault();
    if (!offlineEmail.trim() || !offlineMessage.trim() || offlineSending) return;

    setOfflineSending(true);

    let uploadedAttachment = null;
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('sessionId', sessionId);
        const uploadRes = await api.uploadSupportFile(formData);
        if (uploadRes?.success) {
          uploadedAttachment = {
            fileUrl: uploadRes.fileUrl,
            fileName: uploadRes.fileName,
            fileType: uploadRes.fileType,
            fileSize: uploadRes.fileSize
          };
        }
      } catch (err) {
        console.error('File upload error in offline inquiry:', err);
      }
    }

    try {
      const res = await api.sendOfflineSupportMessage({
        sessionId,
        email: offlineEmail.trim(),
        name: offlineName.trim() || 'Visitor',
        message: offlineMessage.trim(),
        fileUrl: uploadedAttachment?.fileUrl,
        fileName: uploadedAttachment?.fileName,
        fileType: uploadedAttachment?.fileType,
        fileSize: uploadedAttachment?.fileSize
      });

      if (res?.success) {
        // Record in chat messages so visitor sees their message
        const recordedMsg = {
          id: Date.now().toString(),
          sender: 'user',
          senderName: offlineName.trim() || 'You',
          text: offlineMessage.trim(),
          fileUrl: uploadedAttachment?.fileUrl,
          fileName: uploadedAttachment?.fileName,
          fileType: uploadedAttachment?.fileType,
          fileSize: uploadedAttachment?.fileSize,
          timestamp: new Date()
        };
        setMessages((prev) => [
          ...prev,
          recordedMsg,
          {
            id: (Date.now() + 1).toString(),
            sender: 'system',
            text: `📬 **Email Inquiry Received.** Our administrative team has been notified at **${offlineEmail.trim()}**. We will reply to your inbox as soon as an administrator is online.`,
            timestamp: new Date()
          }
        ]);

        setOfflineSubmitted(true);
        setOfflineMessage('');
        handleClearSelectedFile();
      } else {
        alert(res?.message || 'Failed to submit offline inquiry. Please try again.');
      }
    } catch (err) {
      alert(err.message || 'Error sending offline message. Please try again.');
    } finally {
      setOfflineSending(false);
    }
  };

  // Clear / Delete Chat History
  const handleDeleteChat = async () => {
    const ok = window.confirm(
      'Are you sure you want to delete this chat session?\n\nThis will permanently delete all messages in this support conversation.'
    );
    if (!ok) return;

    try {
      await api.deleteSupportSession(sessionId);
    } catch (err) {
      console.warn('Session delete note:', err);
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ilmidunya_support_session_id', newSessionId);
    }
    setSessionId(newSessionId);
    setMessages([
      {
        id: 'welcome',
        sender: 'admin',
        senderName: 'IlmiDunya Support Desk',
        text: "Assalam-o-Alaikum! Welcome to IlmiDunya Live Support. 👋\n\nHow can we help you today? Send your inquiry below and our administrative team will respond right here in real-time.\n\nIf staff is away, you can also leave a message with your email and our team will get back to you.",
        timestamp: new Date()
      }
    ]);
    setSupportStatus('open');
    setAssignedAdmin(null);
    handleClearSelectedFile();
    if (socket) {
      socket.emit('join-support-session', { sessionId: newSessionId });
    }
  };

  const isAdminConnected = supportStatus === 'admin_joined';
  const isWaitingForAdmin = supportStatus === 'human_requested' && !isAdminConnected;

  return (
    <>
      {/* 1. FLOATING BOTTOM-RIGHT SUPPORT TRIGGER PILL */}
      <div className="fixed bottom-20 right-4 sm:bottom-20 sm:right-6 md:bottom-6 md:right-6 z-40 print:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#0c2217] border-2 border-[#d4a359]/60 shadow-[0_10px_30px_rgba(12,34,23,0.55)] hover:shadow-[0_15px_35px_rgba(212,163,89,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer"
          aria-label="Open IlmiDunya Live Support Chat"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d4a359]/20 border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] group-hover:bg-[#d4a359] group-hover:text-[#0c2217] transition-colors shrink-0">
            <Headphones className="w-4 h-4 text-emerald-400 group-hover:text-[#0c2217]" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span>Support</span>
            {isAdminOnline ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold px-2 py-0.5 bg-emerald-950/80 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Staff
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-300 font-semibold px-2 py-0.5 bg-amber-950/70 rounded-full border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Leave Email
              </span>
            )}
          </span>
          {unreadCount > 0 && !isOpen && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 text-[9px] text-white font-bold items-center justify-center">
                {unreadCount}
              </span>
            </span>
          )}
        </button>
      </div>

      {/* 2. SUPPORT CHAT PANEL (Full-Screen on Mobile, Floating Drawer on Desktop) */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-50 w-full sm:w-[450px] h-[100dvh] sm:h-[640px] sm:max-h-[85vh] flex flex-col rounded-none sm:rounded-3xl bg-[#07150e]/95 border-0 sm:border-2 border-[#d4a359]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 sm:py-3.5 bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#07150e] border-b border-[#d4a359]/25 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1.5 -ml-1 text-stone-300 hover:text-white cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10b981] via-[#d4a359] to-[#b85d34] p-0.5 flex items-center justify-center shadow-md shrink-0">
                <div className="w-full h-full bg-[#0c2217] rounded-[10px] flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-[#d4a359]" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
                    {isAdminConnected ? `Staff (${assignedAdmin || 'Active'})` : 'IlmiDunya Live Support'}
                  </h3>
                  {isAdminOnline ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Staff Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/40 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Staff Away
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-stone-300 truncate">
                  {isAdminConnected
                    ? 'Speaking live with administration specialist'
                    : isAdminOnline
                    ? 'Admissions • Verified Tutors • Free Trial'
                    : 'Leave message • Admin will reply via email'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Delete / Clear Chat Button */}
              <button
                type="button"
                onClick={handleDeleteChat}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete Chat History"
                aria-label="Delete Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="hidden sm:flex p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Sub-Banner / Mode Switcher */}
          <div className="px-3.5 py-2 bg-[#0c2217]/90 border-b border-white/5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] min-w-0">
              {isAdminConnected ? (
                <span className="flex items-center gap-1 text-emerald-300 font-semibold truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Live with Admin ({assignedAdmin})</span>
                </span>
              ) : isWaitingForAdmin ? (
                <span className="flex items-center gap-1 text-amber-300 font-semibold truncate">
                  <Clock className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                  <span className="truncate">Desk notified • Staff connecting...</span>
                </span>
              ) : isAdminOnline ? (
                <span className="flex items-center gap-1 text-stone-300 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                  <span className="truncate">Official Live Support Desk</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-300 font-medium truncate">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Admin currently away • Leave email note</span>
                </span>
              )}
            </div>

            {/* Offline Email Form Toggle Button */}
            {!isAdminOnline && (
              <button
                type="button"
                onClick={() => setIsOfflineView((prev) => !prev)}
                className="px-2.5 py-1 rounded-full bg-[#d4a359]/20 hover:bg-[#d4a359]/30 text-[#d4a359] text-[10.5px] font-bold flex items-center gap-1 transition-all border border-[#d4a359]/40 cursor-pointer shrink-0"
              >
                <Mail className="w-3 h-3" />
                <span>{isOfflineView ? 'View Chat' : 'Leave Email Note'}</span>
              </button>
            )}
          </div>

          {/* OFFLINE EMAIL INQUIRY FORM VIEW */}
          {isOfflineView ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/60">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Mail className="w-4 h-4" />
                  <span>Admin is currently offline</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Leave your message and contact email below. When an administrator comes online, they will review your inquiry and reach out to you directly via email.
                </p>
              </div>

              {offlineSubmitted ? (
                <div className="p-6 rounded-2xl bg-[#0c2217] border border-emerald-500/40 text-center space-y-2.5 animate-in fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Message Sent Successfully!</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Our administrative team has received your message and will reach out to you via email shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOfflineSubmitted(false);
                      setIsOfflineView(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Back to Chat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendOfflineMessage} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1">
                      Your Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={offlineEmail}
                      onChange={(e) => setOfflineEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#d4a359]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={offlineName}
                      onChange={(e) => setOfflineName(e.target.value)}
                      placeholder="e.g. Muhammad / Fatima"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#d4a359]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1">
                      Message / Inquiry <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={offlineMessage}
                      onChange={(e) => setOfflineMessage(e.target.value)}
                      placeholder="Describe your inquiry (e.g. course timings, tutor matching, fee verification)..."
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#d4a359] resize-none"
                    />
                  </div>

                  {/* Attachment Preview Chip */}
                  {selectedFile && (
                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#d4a359]" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-white truncate font-medium">{selectedFile.name}</p>
                          <p className="text-[10px] text-stone-400">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="p-1 text-stone-400 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Hidden File Input strictly for PNG, JPG, JPEG, PDF */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    className="hidden"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>{selectedFile ? 'Change File' : 'Attach File (PNG, JPG, PDF)'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={offlineSending || !offlineEmail.trim() || !offlineMessage.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ba4c18] to-[#963b10] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      {offlineSending ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Email Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Messages Scroll Area */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-stone-700">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  const isSystem = m.sender === 'system';
                  const hasFile = !!m.fileUrl;
                  const isImage = hasFile && (m.fileType?.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(m.fileName || m.fileUrl || ''));

                  if (isSystem) {
                    return (
                      <div key={m.id} className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed space-y-1">
                        <div className="whitespace-pre-wrap font-sans">{renderFormattedText(m.text)}</div>
                        <div className="text-[9px] text-emerald-400/60 text-right">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                          <Headphones className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-gradient-to-r from-[#ba4c18] to-[#963b10] text-white rounded-br-xs shadow-md'
                          : 'bg-[#0c2217] border border-emerald-500/30 text-emerald-100 rounded-bl-xs shadow-md'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold opacity-85">
                            {isUser ? 'You' : (m.senderName || 'IlmiDunya Support Desk')}
                          </span>
                          <span className="text-[9px] opacity-60">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* File Attachment Render */}
                        {hasFile && (
                          isImage ? (
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                              <a
                                href={getFileUrl(m.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group relative cursor-pointer"
                              >
                                <img
                                  src={getFileUrl(m.fileUrl)}
                                  alt={m.fileName || 'Attachment'}
                                  className="w-full max-h-48 object-cover hover:scale-105 transition-transform duration-200"
                                />
                                <div className="p-1.5 bg-black/60 text-[10px] text-white flex items-center justify-between">
                                  <span className="truncate">{m.fileName || 'Image'}</span>
                                  {m.fileSize ? <span>{formatFileSize(m.fileSize)}</span> : null}
                                </div>
                              </a>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-black/30 border border-white/15 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-5 h-5 text-[#d4a359] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate" title={m.fileName}>
                                    {m.fileName || 'Document.pdf'}
                                  </p>
                                  <p className="text-[10px] text-stone-400">
                                    {formatFileSize(m.fileSize)} &bull; PDF
                                  </p>
                                </div>
                              </div>
                              <a
                                href={getFileUrl(m.fileUrl)}
                                target="_blank"
                                download={m.fileName}
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )
                        )}

                        {m.text && (
                          <div className="whitespace-pre-wrap font-sans space-y-1">
                            {renderFormattedText(m.text)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isAdminTyping && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 italic">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Support staff is typing a reply...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiries Bar */}
              <div className="px-3 py-2 bg-[#0c2217]/70 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
                {QUICK_INQUIRIES.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    disabled={isSending}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#d4a359]/20 text-stone-300 hover:text-[#d4a359] text-[10.5px] border border-white/10 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input & Send Footer */}
              <div className="p-3 bg-[#0c2217] border-t border-[#d4a359]/25 shrink-0 space-y-2">
                {/* File Attachment Chip before sending */}
                {selectedFile && (
                  <div className="p-2 bg-black/40 border border-[#d4a359]/40 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#d4a359] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-stone-400">{formatFileSize(selectedFile.size)} &bull; Ready to send</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      className="p-1 text-stone-400 hover:text-rose-400 cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Hidden File Input strictly for PNG, JPG, JPEG, PDF */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                  className="hidden"
                />

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-stone-400 hover:text-[#d4a359] hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                    title="Attach file (PNG, JPG, JPEG, PDF only)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={selectedFile ? 'Add caption (optional)...' : 'Type your message to support team...'}
                    className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-[#d4a359] transition-colors"
                    disabled={isSending || uploadingFile}
                  />

                  <button
                    type="submit"
                    disabled={isSending || uploadingFile || (!inputValue.trim() && !selectedFile)}
                    className="p-2 rounded-xl bg-gradient-to-r from-[#ba4c18] to-[#963b10] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 text-white transition-all cursor-pointer shrink-0"
                    aria-label="Send message to support"
                  >
                    {uploadingFile ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[9.5px] text-stone-400">
                  <span>IlmiDunya Pakistan • Official Live Support Desk</span>
                  <span className="text-stone-500">Only PNG, JPG, PDF supported</span>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
}
