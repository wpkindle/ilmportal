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
  PhoneCall,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const QUICK_INQUIRIES = [
  'Inquire about 3-Day Free Trial',
  'Find verified female Quran Alimah',
  'Find Cambridge O/A Level tutor',
  'Tuition fees & payment methods',
  'Tutor verification & registration help',
  'Chat on WhatsApp (+92 317 1759093)'
];

export default function LiveSupportWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [supportStatus, setSupportStatus] = useState('open'); // 'open' | 'human_requested' | 'admin_joined' | 'resolved'
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'admin',
      senderName: 'IlmiDunya Support Desk',
      text: "Assalam-o-Alaikum! Welcome to IlmiDunya Live Support. 👋\n\nHow can we help you today? Send your inquiry below and our administrative team will respond right here in real-time.\n\nFor urgent admissions or fee verification, you can also reach us directly on WhatsApp at **+92 317 1759093**.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

    socket.emit('join-support-session', { sessionId });

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

  // 5. Send message directly to Admin Support Team
  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    // Check if user clicked WhatsApp prompt
    if (text.includes('WhatsApp')) {
      window.open('https://wa.me/923171759093?text=Assalam-o-Alaikum%20IlmiDunya%20Team%2C%20I%20need%20assistance%20regarding...', '_blank', 'noopener,noreferrer');
      return;
    }

    const senderName = user?.name || 'Website Visitor';
    const senderAvatar = user?.avatar || '';

    const localMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: user?.name || 'You',
      text,
      timestamp: new Date()
    };

    // Optimistically show user's message
    setMessages((prev) => [...prev, localMessage]);
    setInputValue('');
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
          senderAvatar
        });
      }

      // 2. Also persist via REST API fallback to guarantee DB write & admin alert
      const guestInfo = user ? {
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city
      } : {
        name: 'Website Visitor',
        role: 'visitor'
      };

      await api.sendSupportChatMessage({
        message: text,
        sessionId,
        guestInfo
      });
    } catch (err) {
      console.warn('Support message sync notice:', err);
    } finally {
      setIsSending(false);
    }
  };

  const isAdminConnected = supportStatus === 'admin_joined';
  const isWaitingForAdmin = supportStatus === 'human_requested' && !isAdminConnected;

  return (
    <>
      {/* 1. FLOATING BOTTOM-RIGHT SUPPORT TRIGGER PILL */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 print:hidden">
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
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold px-2 py-0.5 bg-emerald-950/80 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Staff
            </span>
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
        <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-50 w-full sm:w-[440px] h-[100dvh] sm:h-[620px] sm:max-h-[85vh] flex flex-col rounded-none sm:rounded-3xl bg-[#07150e]/95 border-0 sm:border-2 border-[#d4a359]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 sm:py-3.5 bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#07150e] border-b border-[#d4a359]/25 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1.5 -ml-1 text-stone-300 hover:text-white cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10b981] via-[#d4a359] to-[#b85d34] p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#0c2217] rounded-[10px] flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-[#d4a359]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    {isAdminConnected ? `Staff Support (${assignedAdmin || 'Active'})` : 'IlmiDunya Live Support'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isAdminConnected ? 'Live Staff Active' : 'Staff Online'}
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-300">
                  {isAdminConnected
                    ? 'Speaking live with administration specialist'
                    : '1:1 Tutors • Admissions • 3-Day Trial • Fee Inquiries'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="https://wa.me/923171759093"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/50 transition-colors"
                title="Open WhatsApp Support (+92 317 1759093)"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
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

          {/* Status Sub-Banner */}
          <div className="px-3.5 py-2 bg-[#0c2217]/90 border-b border-white/5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px]">
              {isAdminConnected ? (
                <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Live with Administrator ({assignedAdmin})
                </span>
              ) : isWaitingForAdmin ? (
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  Admin desk alerted • Connecting with staff...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-stone-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                  Verified Official Admin Support
                </span>
              )}
            </div>

            <a
              href="https://wa.me/923171759093"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10.5px] font-bold flex items-center gap-1 transition-all border border-emerald-500/40"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-stone-700">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              const isSystem = m.sender === 'system';
              const isAdmin = m.sender === 'admin';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed space-y-1">
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                    <div className="text-[9px] text-emerald-400/60 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#d4a359]/20 border border-[#d4a359]/40 flex items-center justify-center shrink-0 mt-1">
                      <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#ba4c18] to-[#963b10] text-white rounded-br-xs shadow-md'
                      : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-100 rounded-bl-xs shadow-md'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold opacity-75">
                        {isUser ? 'You' : `Staff (${m.senderName || 'Admin Desk'})`}
                      </span>
                      <span className="text-[9px] opacity-60">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans space-y-1">
                      {m.text}
                    </div>
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
          <div className="p-3 bg-[#0c2217] border-t border-[#d4a359]/25 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your message to support team..."
                className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-[#d4a359] transition-colors"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !inputValue.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-[#ba4c18] to-[#963b10] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 text-white transition-all cursor-pointer shrink-0"
                aria-label="Send message to support"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-stone-400">
              <span>IlmiDunya Pakistan • Official Live Support Desk</span>
              <span className="text-emerald-400/80">WhatsApp: +92 317 1759093</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
