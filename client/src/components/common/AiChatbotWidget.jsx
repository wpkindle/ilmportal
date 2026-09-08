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
  AlertCircle,
  Check,
  CheckCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

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
          className="inline-flex items-center gap-1 font-bold text-[#065f46] hover:underline bg-[#ecfdf5] px-2 py-0.5 rounded-md border border-[#a7f3d0] my-0.5"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 text-[#059669]" />
        </a>
      );
    }

    // Bold formatting **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bi) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return <strong key={bi} className="font-bold">{bPart.slice(2, -2)}</strong>;
      }
      return bPart;
    });
  });
};

export default function LiveSupportWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { socket, isAdminOnline: socketAdminOnline } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [supportStatus, setSupportStatus] = useState('open'); // 'open' | 'human_requested' | 'admin_joined' | 'resolved'
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [serverAdminOnline, setServerAdminOnline] = useState(false);
  const [isOfflineView, setIsOfflineView] = useState(false);

  // Query REST admin status on mount and on a 15-second heartbeat as reliable presence fallback
  useEffect(() => {
    let isMounted = true;
    const checkServerAdminStatus = async () => {
      try {
        const res = await api.getAdminOnlineStatus();
        if (isMounted && res && typeof res.isOnline === 'boolean') {
          setServerAdminOnline(res.isOnline);
        }
      } catch (err) {
        // silent fallback
      }
    };
    checkServerAdminStatus();
    const interval = setInterval(checkServerAdminStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Listen for immediate logout to instantly wipe stale presence
  useEffect(() => {
    const handleImmediateLogout = () => {
      setServerAdminOnline(false);
    };
    window.addEventListener('ilmidunya:logout', handleImmediateLogout);
    return () => window.removeEventListener('ilmidunya:logout', handleImmediateLogout);
  }, []);

  // When user identity changes (e.g. logout or login), re-verify admin online presence
  useEffect(() => {
    if (!user) {
      setServerAdminOnline(false);
      api.getAdminOnlineStatus().then((res) => {
        if (res && typeof res.isOnline === 'boolean') {
          setServerAdminOnline(res.isOnline);
        }
      }).catch(() => {});
    }
  }, [user]);

  // Determine if admin is online:
  // 1. Current logged-in user is an admin
  // 2. OR socket reported admin is online via real-time event or check query
  // 3. OR REST endpoint confirmed an active admin is online
  const isCurrentUserAdmin = user?.role === 'admin';
  const isAdminOnline = Boolean(
    isCurrentUserAdmin || socketAdminOnline || serverAdminOnline
  );

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'admin',
      senderName: 'IlmiDunya Helpdesk',
      text: "Assalam-o-Alaikum! Welcome to IlmiDunya Helpdesk. 👋\n\nHow can we help you today? Send your inquiry below and we will assist you right away.\n\nIf we are away, you can also leave your email and message, and our team will get back to you promptly.",
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
        const cleanMessages = [];
        for (const m of res.messages) {
          const isDup = cleanMessages.some(
            (prev) =>
              (m._id && (prev.id === m._id || prev._id === m._id)) ||
              (prev.text === m.text && prev.sender === m.sender && Math.abs(new Date(prev.timestamp) - new Date(m.createdAt)) < 5000)
          );
          if (!isDup) {
            cleanMessages.push({
              id: m._id || (Date.now() + Math.random()).toString(),
              _id: m._id,
              sender: m.sender,
              senderName: m.sender === 'user' ? 'You' : 'IlmiDunya Helpdesk',
              senderAvatar: m.senderAvatar,
              text: m.text,
              fileUrl: m.fileUrl,
              fileName: m.fileName,
              fileType: m.fileType,
              fileSize: m.fileSize,
              delivered: m.delivered !== false,
              seen: !!m.seen,
              seenAt: m.seenAt || null,
              timestamp: new Date(m.createdAt || Date.now())
            });
          }
        }
        setMessages(cleanMessages);
        if (res.session?.status) {
          setSupportStatus(res.session.status);
        }
        if (res.session?.assignedAdmin?.name) {
          setAssignedAdmin(res.session.assignedAdmin.name);
        }
      }
    }).catch(() => {});
  }, [sessionId]);

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

  // Lock body scroll on mobile and listen for Escape key when chat is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isOpen) {
      document.body.classList.add('chat-widget-open');
    } else {
      document.body.classList.remove('chat-widget-open');
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('chat-widget-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Dynamic visual viewport tracking for mobile virtual keyboards (iOS Safari & Android Chrome)
  const [viewportHeight, setViewportHeight] = useState(null);
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        setViewportOffsetTop(window.visualViewport.offsetTop);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, [isOpen]);

  // 4. Socket listeners for real-time live chat with Admin
  useEffect(() => {
    if (!socket || !sessionId) return;

    // Check online status via socket
    socket.emit('check-admin-online-status', (res) => {
      if (res && typeof res.isOnline === 'boolean') {
        setServerAdminOnline(res.isOnline);
      }
    });

    const handleAdminOnlineStatus = (data) => {
      if (typeof data?.isOnline === 'boolean') {
        setServerAdminOnline(data.isOnline);
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
          // Avoid duplicate appends:
          // Check if message ID already exists or if exact same sender/text/attachment was added recently
          const isDuplicate = prev.some((m) => {
            if (incoming._id && (m.id === incoming._id || m._id === incoming._id)) return true;
            if (m.sender === incoming.sender && m.text === incoming.text && (m.fileName || '') === (incoming.fileName || '')) {
              const timeDiff = Math.abs(new Date(m.timestamp || Date.now()) - new Date(incoming.createdAt || Date.now()));
              if (isNaN(timeDiff) || timeDiff < 30000) {
                return true;
              }
            }
            return false;
          });

          if (isDuplicate) {
            // Upgrade optimistic message id to incoming._id if applicable
            return prev.map((m) => {
              if (m.sender === incoming.sender && m.text === incoming.text && (m.fileName || '') === (incoming.fileName || '')) {
                return {
                  ...m,
                  id: incoming._id || m.id,
                  _id: incoming._id || m._id,
                  delivered: incoming.delivered !== false,
                  seen: !!incoming.seen,
                  seenAt: incoming.seenAt || m.seenAt
                };
              }
              return m;
            });
          }

          // If incoming message is from admin, mark all existing user messages as seen
          const updatedPrev = incoming.sender === 'admin'
            ? prev.map((m) => (m.sender === 'user' ? { ...m, seen: true, delivered: true } : m))
            : prev;

          if (incoming.sender === 'admin') {
            playMessageChime();
            if (!isOpen) {
              setUnreadCount((c) => c + 1);
            }
          }

          return [
            ...updatedPrev,
            {
              id: incoming._id || (Date.now() + Math.random()).toString(),
              _id: incoming._id,
              sender: incoming.sender,
              senderName: incoming.sender === 'admin' ? 'IlmiDunya Helpdesk' : 'You',
              senderAvatar: incoming.senderAvatar,
              text: incoming.text,
              fileUrl: incoming.fileUrl,
              fileName: incoming.fileName,
              fileType: incoming.fileType,
              fileSize: incoming.fileSize,
              delivered: incoming.delivered !== false,
              seen: !!incoming.seen,
              seenAt: incoming.seenAt || null,
              timestamp: new Date(incoming.createdAt || Date.now())
            }
          ];
        });
      }
    };

    const handleMessagesSeen = (data) => {
      if (data?.sessionId === sessionId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender === 'user' ? { ...m, seen: true, delivered: true, seenAt: data.seenAt || new Date() } : m
          )
        );
      }
    };

    const handleAdminJoined = (data) => {
      if (data?.sessionId === sessionId) {
        setSupportStatus('admin_joined');
        setAssignedAdmin(data.admin?.name || 'Representative');
        setMessages((prev) => {
          const hasJoinNotice = prev.some(
            (m) => m.sender === 'system' && m.text && m.text.includes('IlmiDunya Helpdesk')
          );
          if (hasJoinNotice) {
            return prev.map((m) => (m.sender === 'user' ? { ...m, seen: true, delivered: true } : m));
          }
          return [
            ...prev.map((m) => (m.sender === 'user' ? { ...m, seen: true, delivered: true } : m)),
            {
              id: `join_${Date.now()}`,
              sender: 'system',
              text: `🟢 **IlmiDunya Helpdesk is now connected with you live.** How may we assist you today?`,
              timestamp: new Date()
            }
          ];
        });
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
    socket.on('support-messages-seen', handleMessagesSeen);
    socket.on('admin-joined-support', handleAdminJoined);
    socket.on('support-status-changed', handleStatusChanged);
    socket.on('support-typing', handleTyping);
    socket.on('support-stop-typing', handleStopTyping);

    return () => {
      socket.off('admin-online-status', handleAdminOnlineStatus);
      socket.off('support-message-received', handleMessageReceived);
      socket.off('support-messages-seen', handleMessagesSeen);
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
      delivered: true,
      seen: false,
      seenAt: null,
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
      const guestInfo = user ? {
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city
      } : {
        name: senderName,
        role: 'visitor'
      };

      const res = await api.sendSupportChatMessage({
        message: text,
        sessionId,
        guestInfo,
        fileUrl: uploadedAttachment?.fileUrl,
        fileName: uploadedAttachment?.fileName,
        fileType: uploadedAttachment?.fileType,
        fileSize: uploadedAttachment?.fileSize
      });

      if (res?.success && res.message?._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === localMessage.id
              ? {
                  ...m,
                  id: res.message._id,
                  _id: res.message._id,
                  delivered: res.message.delivered !== false,
                  seen: !!res.message.seen,
                  seenAt: res.message.seenAt || null
                }
              : m
          )
        );
      }
    } catch (err) {
      console.warn('Support message sync notice:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Submit Offline Email Message
  const handleSendOfflineMessage = async (e) => {
    e.preventDefault();
    if (offlineSending) return;

    if (!offlineEmail.trim()) {
      alert('Please enter your email address so our helpdesk can reply to you.');
      return;
    }
    if (!offlineMessage.trim()) {
      alert('Please write your message or inquiry before sending.');
      return;
    }

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
            text: `📬 **Email Inquiry Received.** We have received your inquiry for **${offlineEmail.trim()}**. Our team will reply to your email promptly.`,
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
      'Are you sure you want to delete this chat session?\n\nThis will permanently delete all messages in this conversation.'
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
        senderName: 'IlmiDunya Helpdesk',
        text: "Assalam-o-Alaikum! Welcome to IlmiDunya Helpdesk. 👋\n\nHow can we help you today? Send your inquiry below and we will assist you right away.\n\nIf we are away, you can also leave your email and message, and our team will get back to you promptly.",
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

  const handleToggleWidget = () => {
    if (!isOpen) {
      if (!isAdminOnline) {
        setIsOfflineView(true);
      } else {
        setIsOfflineView(false);
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const isAdminConnected = supportStatus === 'admin_joined';
  const isWaitingForAdmin = supportStatus === 'human_requested' && !isAdminConnected;

  return (
    <>
      {/* 1. FLOATING BOTTOM-RIGHT SUPPORT TRIGGER BUTTON WITH BOUNCING ATTRACTOR EFFECTS */}
      <div
        id="ai-chatbot-widget-trigger"
        className={`fixed z-[100002] print:hidden items-center transition-all duration-300 ${
          isOpen
            ? 'hidden sm:flex sm:bottom-6 sm:right-6'
            : 'flex bottom-20 right-4 sm:bottom-6 sm:right-6'
        }`}
      >
        {/* Attractor Speech Callout Pill (Visible on Desktop when closed) */}
        {!isOpen && (
          <div
            onClick={handleToggleWidget}
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 mr-3 rounded-2xl bg-[#0c2217]/95 hover:bg-[#0c2217] text-white border ${
              isAdminOnline ? 'border-[#10b981]/70 shadow-[0_10px_25px_rgba(16,185,129,0.25)]' : 'border-white/20 shadow-[0_10px_25px_rgba(12,34,23,0.3)]'
            } cursor-pointer select-none transition-all hover:scale-105 active:scale-95 group/bubble animate-widget-bounce`}
            title="Click to start live conversation"
          >
            <span className="relative flex h-2 w-2">
              {isAdminOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" style={{ backgroundColor: '#10b981' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" style={{ backgroundColor: '#10b981' }} />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              )}
            </span>
            <span className="text-xs font-bold tracking-tight text-white/95">
              {isAdminOnline ? 'Need help? Chat live!' : 'Have questions? Ask us!'}
            </span>
            <span className="text-sm transition-transform group-hover/bubble:rotate-12">👋</span>
          </div>
        )}

        {/* Circular Toggle Button (Open / Close) with Bouncing Background Ripple Effects */}
        <div className="relative flex items-center justify-center">
          {/* Bouncing Background Radar Waves and Halo Glow (Active when closed to attract user) */}
          {!isOpen && (
            <>
              {/* Outer expanding radar wave */}
              <span className={`absolute -inset-2.5 sm:-inset-3 rounded-full border-2 ${isAdminOnline ? 'border-[#10b981]/60' : 'border-[#10b981]/30'} animate-radar-wave pointer-events-none`} />
              {/* Second offset radar wave */}
              <span className={`absolute -inset-3.5 sm:-inset-4 rounded-full border ${isAdminOnline ? 'border-[#34d399]/50' : 'border-[#10b981]/20'} animate-radar-wave pointer-events-none`} style={{ animationDelay: '1.1s' }} />
              {/* Radiant blurred ambient aura glow */}
              <span className={`absolute -inset-2 sm:-inset-2.5 rounded-full ${isAdminOnline ? 'bg-gradient-to-tr from-[#10b981]/50 via-[#34d399]/40 to-[#0c2217]/30' : 'bg-gradient-to-tr from-[#10b981]/20 via-white/10 to-[#0c2217]/30'} blur-md animate-attractor-halo pointer-events-none`} />
            </>
          )}

          <button
            onClick={handleToggleWidget}
            className={`group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0c2217] hover:bg-[#123323] text-white shadow-[0_10px_25px_rgba(12,34,23,0.35)] hover:shadow-[0_14px_32px_rgba(12,34,23,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border-2 ${
              isAdminOnline ? 'border-[#10b981] ring-2 ring-[#10b981]/40' : 'border-[#10b981]/30 ring-2 ring-[#0c2217]/20'
            } ${!isOpen ? 'animate-widget-bounce' : ''}`}
            aria-label={isOpen ? "Close Helpdesk" : "Open IlmiDunya Support Desk"}
            title={isOpen ? "Close Support Desk" : (isAdminOnline ? "Chat with Support Desk (Online)" : "Support Desk (Offline • Leave an Email Note)")}
          >
            {isOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-200 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Secondary dialogue bubble */}
                <path
                  d="M17 8.5H18.5C19.8807 8.5 21 9.61929 21 11V15C21 16.3807 19.8807 17.5 18.5 17.5H17.5V20L14.5 17.5H13"
                  stroke={isAdminOnline ? '#10b981' : '#ffffff'}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Primary dialogue bubble */}
                <path
                  d="M3 6.5C3 5.11929 4.11929 4 5.5 4H14.5C15.8807 4 17 5.11929 17 6.5V12C17 13.8807 15.8807 15 14.5 15H8L4 18.5V15C3.4 14.5 3 13.5 3 12.5V6.5Z"
                  fill={isAdminOnline ? '#10b981' : 'white'}
                  fillOpacity={isAdminOnline ? '0.2' : '0.12'}
                  stroke={isAdminOnline ? '#34d399' : 'white'}
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 3 conversation dots */}
                <circle cx="7" cy="9.5" r="1" fill={isAdminOnline ? '#10b981' : '#ffffff'} />
                <circle cx="10" cy="9.5" r="1" fill={isAdminOnline ? '#10b981' : '#ffffff'} />
                <circle cx="13" cy="9.5" r="1" fill={isAdminOnline ? '#10b981' : '#ffffff'} />
              </svg>
            )}

            {/* Online/Offline Status Indicator Dot (Green when Online, Red when Offline) */}
            {!isOpen && (
              <span className="absolute top-0 right-0 -mt-0.5 -mr-0.5 flex h-3.5 w-3.5 pointer-events-none">
                {isAdminOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" style={{ backgroundColor: '#10b981' }} />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#10b981] border-2 border-white shadow-xs" style={{ backgroundColor: '#10b981' }} />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white shadow-xs" />
                )}
              </span>
            )}

            {/* Unread Message Count Badge */}
            {unreadCount > 0 && !isOpen && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] text-white font-black items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. SUPPORT CHAT PANEL (Full-Screen on Mobile, Floating Drawer on Desktop) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="IlmiDunya Live Support Helpdesk"
          style={viewportHeight && typeof window !== 'undefined' && window.innerWidth < 640 ? { height: `${viewportHeight}px`, top: `${viewportOffsetTop}px` } : undefined}
          className="fixed inset-0 sm:inset-auto sm:bottom-[88px] sm:right-6 z-[99999] w-full sm:w-[450px] h-[100dvh] sm:h-[640px] sm:max-h-[calc(100vh-104px)] flex flex-col rounded-none sm:rounded-3xl bg-white border-0 sm:border-2 border-[#10b981]/30 shadow-[0_20px_50px_rgba(12,34,23,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          
          {/* Header */}
          <div className="pt-[max(0.75rem,env(safe-area-inset-top))] px-3.5 sm:px-4 pb-2.5 sm:pb-3.5 bg-[#faf8f5] border-b border-[#ebe3d3] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-2 -ml-1 text-stone-600 hover:text-[#0c2217] active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-stone-200/50"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className={`w-9 h-9 rounded-xl ${isAdminOnline ? 'bg-[#062419] border border-[#10b981]/70' : 'bg-[#0c2217] border border-[#10b981]/30'} flex items-center justify-center shadow-xs shrink-0`}>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M16 8.5H17.5C18.8807 8.5 20 9.61929 20 11V14.5C20 15.8807 18.8807 17 17.5 17H16.5V19.5L13.8 17H12.5"
                    stroke={isAdminOnline ? '#10b981' : '#ffffff'}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.5 6.5C3.5 5.11929 4.61929 4 6 4H14C15.3807 4 16.5 5.11929 16.5 6.5V12C16.5 13.3807 15.3807 14.5 14 14.5H8L4.5 17.5V14.5C3.9 14.1 3.5 13.1 3.5 12V6.5Z"
                    fill={isAdminOnline ? '#10b981' : 'white'}
                    fillOpacity={isAdminOnline ? '0.2' : '0.15'}
                    stroke={isAdminOnline ? '#34d399' : 'white'}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="7" cy="9.25" r="0.9" fill={isAdminOnline ? '#10b981' : '#ffffff'} />
                  <circle cx="10" cy="9.25" r="0.9" fill={isAdminOnline ? '#10b981' : '#ffffff'} />
                  <circle cx="13" cy="9.25" r="0.9" fill={isAdminOnline ? '#10b981' : '#ffffff'} />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0c2217] leading-tight truncate">
                    IlmiDunya Helpdesk
                  </h3>
                  {isAdminOnline ? (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#065f46] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#10b981]/50 shrink-0 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" style={{ backgroundColor: '#10b981' }} />
                      Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300 shrink-0 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-[#4a5e55] truncate">
                  {isAdminOnline
                    ? 'Live support • Typically replies within minutes'
                    : 'Currently offline • Leave a message & email'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Delete / Clear Chat Button */}
              <button
                type="button"
                onClick={handleDeleteChat}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Delete Chat History"
                aria-label="Delete Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="hidden sm:flex p-2 rounded-xl text-stone-400 hover:text-[#0c2217] hover:bg-stone-100 active:scale-95 transition-all cursor-pointer min-w-[38px] min-h-[38px] items-center justify-center"
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-2 rounded-xl text-stone-600 hover:text-[#0c2217] hover:bg-stone-200/50 active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Sub-Banner / Mode Switcher */}
          <div className="px-3.5 py-2 bg-[#f5f0e6] border-b border-[#ebe3d3] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] min-w-0">
              {isAdminOnline && isAdminConnected ? (
                <span className="flex items-center gap-1 text-[#065f46] font-semibold truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span className="truncate">Connected to Support Desk ({assignedAdmin || 'Active'})</span>
                </span>
              ) : isAdminOnline && isWaitingForAdmin ? (
                <span className="flex items-center gap-1 text-amber-800 font-semibold truncate">
                  <Clock className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
                  <span className="truncate">Connecting to Support Desk...</span>
                </span>
              ) : isAdminOnline ? (
                <span className="flex items-center gap-1.5 text-[#065f46] font-medium truncate">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0 animate-pulse" style={{ backgroundColor: '#10b981' }} />
                  <span className="truncate">Support is Online • Live assistance available</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-rose-800 font-medium truncate">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate">Support is currently offline • Leave an email note</span>
                </span>
              )}
            </div>

            {/* Offline Email Form Toggle Button */}
            {!isAdminOnline && (
              <button
                type="button"
                onClick={() => setIsOfflineView((prev) => !prev)}
                className="px-2.5 py-1 rounded-full bg-[#faf8f5] hover:bg-white text-[#065f46] text-[10.5px] font-bold flex items-center gap-1 transition-all border border-[#10b981]/40 cursor-pointer shrink-0 shadow-2xs"
              >
                <Mail className="w-3 h-3 text-[#10b981]" />
                <span>{isOfflineView ? 'View Chat' : 'Leave Email Note'}</span>
              </button>
            )}
          </div>

          {/* OFFLINE EMAIL INQUIRY FORM VIEW (Light Theme) */}
          {isOfflineView ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#faf8f5] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Helpdesk is currently offline</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Leave your message and contact email below. Our team reviews all offline inquiries promptly and will reply directly to your email.
                </p>
              </div>

              {offlineSubmitted ? (
                <div className="p-6 rounded-2xl bg-white border border-[#a7f3d0] text-center space-y-2.5 shadow-md animate-in fade-in">
                  <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0c2217]">Message Sent Successfully!</h4>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-[280px] mx-auto">
                    Thank you. We have received your message and will get back to you via email shortly.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOfflineSubmitted(false);
                        setIsOfflineView(false);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0c2217] font-bold text-xs transition-colors cursor-pointer"
                    >
                      Back to Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfflineSubmitted(false)}
                      className="px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendOfflineMessage} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2217] mb-1">
                      Your Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={offlineEmail}
                      onChange={(e) => setOfflineEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs text-[#141c19] placeholder:text-stone-400 focus:outline-none focus:border-[#10b981] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2217] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={offlineName}
                      onChange={(e) => setOfflineName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs text-[#141c19] placeholder:text-stone-400 focus:outline-none focus:border-[#10b981] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0c2217] mb-1">
                      Message / Inquiry <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={offlineMessage}
                      onChange={(e) => setOfflineMessage(e.target.value)}
                      placeholder="Write a detailed message"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-base sm:text-xs text-[#141c19] placeholder:text-stone-400 focus:outline-none focus:border-[#10b981] resize-none shadow-2xs"
                    />
                  </div>

                  {/* Attachment Preview Chip */}
                  {selectedFile && (
                    <div className="p-2 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#059669]" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-[#0c2217] truncate font-medium">{selectedFile.name}</p>
                          <p className="text-[10px] text-stone-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedFile}
                        className="p-1 text-stone-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Accessible File Input strictly for PNG, JPG, JPEG, PDF */}
                  <input
                    id="offline-support-file-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    className="sr-only"
                  />

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <label
                      htmlFor="offline-support-file-input"
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#f0ece1] hover:bg-[#ebe3d3] active:bg-[#e4dac7] text-[#0c2217] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#ebe3d3] min-h-[44px] select-none active:scale-[0.98]"
                    >
                      <Paperclip className="w-4 h-4 text-[#059669] shrink-0" />
                      <span className="truncate">{selectedFile ? 'Change File' : 'Attach File (PNG, JPG, PDF)'}</span>
                    </label>

                    <button
                      type="submit"
                      disabled={offlineSending}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#059669] to-[#0c2217] hover:from-[#10b981] hover:to-[#123323] hover:scale-[1.01] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md min-h-[44px] disabled:opacity-50"
                    >
                      {offlineSending ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin shrink-0" />
                          <span>Sending Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 shrink-0" />
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
              {/* Messages Scroll Area (Light Theme) */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-3 bg-[#fcfdfc] scrollbar-thin">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  const isSystem = m.sender === 'system';
                  const hasFile = !!m.fileUrl;
                  const isImage = hasFile && (m.fileType?.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(m.fileName || m.fileUrl || ''));

                  if (isSystem) {
                    return (
                      <div key={m.id} className="p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs leading-relaxed space-y-1 shadow-2xs">
                        <div className="whitespace-pre-wrap font-sans">{renderFormattedText(m.text)}</div>
                        <div className="text-[9px] text-[#059669]/70 text-right">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full border border-[#10b981]/40 bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                          <Headphones className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-gradient-to-r from-[#047857] to-[#0c2217] text-white rounded-br-xs shadow-md'
                          : 'bg-[#f5f0e6] border border-[#ebe3d3] text-[#141c19] rounded-bl-xs shadow-2xs'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold ${isUser ? 'text-white/90' : 'text-[#0c2217]'}`}>
                            {isUser ? 'You' : 'IlmiDunya Helpdesk'}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] ${isUser ? 'text-white/70' : 'text-stone-500'}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isUser && (
                              <span className="inline-flex items-center gap-0.5">
                                {m.seen ? (
                                  <span
                                    className="inline-flex items-center gap-0.5 text-[9px] text-[#a7f3d0] font-semibold"
                                    title={m.seenAt ? `Seen at ${new Date(m.seenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Seen by IlmiDunya Helpdesk'}
                                  >
                                    <CheckCheck className="w-3.5 h-3.5 text-[#34d399] stroke-[2.5]" />
                                    <span>Seen</span>
                                  </span>
                                ) : m.delivered !== false ? (
                                  <span
                                    className="inline-flex items-center gap-0.5 text-[9px] text-white/75 font-medium"
                                    title="Delivered to IlmiDunya Helpdesk"
                                  >
                                    <CheckCheck className="w-3.5 h-3.5 text-white/75 stroke-[2]" />
                                    <span>Delivered</span>
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-0.5 text-[9px] text-white/60 font-medium"
                                    title="Sending..."
                                  >
                                    <Clock className="w-3 h-3 text-white/70 animate-spin" />
                                    <span>Sending</span>
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* File Attachment Render */}
                        {hasFile && (
                          isImage ? (
                            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
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
                                <div className="p-1.5 bg-black/70 text-[10px] text-white flex items-center justify-between">
                                  <span className="truncate">{m.fileName || 'Image'}</span>
                                  {m.fileSize ? <span>{formatFileSize(m.fileSize)}</span> : null}
                                </div>
                              </a>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-white border border-[#ebe3d3] flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-5 h-5 text-[#059669] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#0c2217] truncate" title={m.fileName}>
                                    {m.fileName || 'Document.pdf'}
                                  </p>
                                  <p className="text-[10px] text-stone-500">
                                    {formatFileSize(m.fileSize)} &bull; PDF
                                  </p>
                                </div>
                              </div>
                              <a
                                href={getFileUrl(m.fileUrl)}
                                target="_blank"
                                download={m.fileName}
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#faf8f5] hover:bg-[#f0ece1] text-[#0c2217] border border-[#ebe3d3] transition-colors shrink-0"
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
                  <div className="flex items-center gap-2 text-xs text-[#059669] italic">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ backgroundColor: '#10b981', animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ backgroundColor: '#10b981', animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ backgroundColor: '#10b981', animationDelay: '300ms' }} />
                    </div>
                    <span>IlmiDunya Helpdesk is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input & Send Footer (Light Theme) */}
              <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#faf8f5] border-t border-[#ebe3d3] shrink-0 space-y-2">
                {/* File Attachment Chip before sending */}
                {selectedFile && (
                  <div className="p-2 bg-white border border-[#10b981]/40 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#059669] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0c2217] truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-stone-500">{formatFileSize(selectedFile.size)} &bull; Ready to send</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* File Input strictly for PNG, JPG, JPEG, PDF */}
                <input
                  id="live-support-file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                  className="sr-only"
                />

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <label
                    htmlFor="live-support-file-input"
                    className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-stone-500 hover:text-[#065f46] hover:bg-stone-200/50 active:scale-95 transition-colors cursor-pointer shrink-0"
                    title="Attach file (PNG, JPG, JPEG, PDF only)"
                  >
                    <Paperclip className="w-4 h-4 text-[#059669]" />
                  </label>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={selectedFile ? 'Add caption (optional)...' : 'Write a detailed message...'}
                    className="flex-1 min-w-0 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-base sm:text-xs text-[#141c19] placeholder:text-stone-400 focus:outline-none focus:border-[#10b981] transition-colors shadow-2xs"
                    disabled={isSending || uploadingFile}
                  />

                  <button
                    type="submit"
                    disabled={isSending || uploadingFile || (!inputValue.trim() && !selectedFile)}
                    className={`p-2 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl ${
                      isAdminOnline
                        ? 'bg-gradient-to-r from-[#059669] to-[#0c2217] hover:from-[#10b981] hover:to-[#047857]'
                        : 'bg-[#0c2217] hover:bg-[#123323]'
                    } hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 text-white transition-all cursor-pointer shrink-0 shadow-xs`}
                    aria-label="Send message"
                  >
                    {uploadingFile ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[9.5px] text-stone-500">
                  <span>IlmiDunya Helpdesk • Quick &amp; Friendly Assistance</span>
                  <span className="text-stone-400">Only PNG, JPG, PDF supported</span>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
}
