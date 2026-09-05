'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Headphones,
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Clock,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const QUICK_PROMPTS = [
  'Show verified female Alimahs for Quran & Tajweed',
  'Find Cambridge O/A Level subject teachers',
  'How does the 3-day free trial work?',
  'Do you have tutors in Peshawar or Lahore?',
  'What payment methods are supported in Pakistan?',
  '🙋‍♂️ Talk to a Human Support Agent'
];

export default function AiChatbotWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [supportStatus, setSupportStatus] = useState('ai_active'); // 'ai_active' | 'human_requested' | 'admin_joined' | 'resolved'
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      senderName: 'IlmiDunya Support Guide',
      text: "Assalam-o-Alaikum! 🌟 Welcome to **IlmiDunya Support Hub**.\n\nI am your AI Academic Counselor & Support Guide, connected live to our database.\n\nAsk me anything about verified tutors, female Alimahs, Cambridge faculty, trial periods, or your active lessons. You can also tap **'Talk to Human'** at any time to reach our administration!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingHuman, setIsRequestingHuman] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // 2. Restore previous chat history for returning users/sessions
  useEffect(() => {
    if (!sessionId) return;
    api.getSupportSessionHistory(sessionId).then((res) => {
      if (res?.success && Array.isArray(res.messages) && res.messages.length > 0) {
        setMessages(res.messages.map((m) => ({
          id: m._id || (Date.now() + Math.random()).toString(),
          sender: m.sender,
          senderName: m.senderName || (m.sender === 'user' ? 'You' : 'IlmiDunya Counselor'),
          senderAvatar: m.senderAvatar,
          text: m.text,
          thoughts: m.thoughts,
          timestamp: new Date(m.createdAt || Date.now())
        })));
        if (res.session?.status) {
          setSupportStatus(res.session.status);
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

  // 4. Connect to live support socket room
  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit('join-support-session', { sessionId });

    const handleMessageReceived = (data) => {
      if (data?.sessionId === sessionId && data?.message) {
        const incoming = data.message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming._id || (m.text === incoming.text && m.sender === incoming.sender))) {
            return prev;
          }
          if (!isOpen) {
            setUnreadCount((c) => c + 1);
          }
          return [
            ...prev,
            {
              id: incoming._id || (Date.now() + Math.random()).toString(),
              sender: incoming.sender,
              senderName: incoming.senderName || 'Staff Agent',
              senderAvatar: incoming.senderAvatar,
              text: incoming.text,
              thoughts: incoming.thoughts,
              timestamp: new Date(incoming.createdAt || Date.now())
            }
          ];
        });
      }
    };

    const handleAdminJoined = (data) => {
      if (data?.sessionId === sessionId) {
        setSupportStatus('admin_joined');
        setAssignedAdmin(data.admin?.name || 'Official Staff');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'system',
            text: `🟢 **${data.admin?.name || 'A Support Specialist'} has joined the chat.** You are now speaking directly with our administrative team.`,
            timestamp: new Date()
          }
        ]);
      }
    };

    const handleStatusChanged = (data) => {
      if (data?.sessionId === sessionId && data.status) {
        setSupportStatus(data.status);
      }
    };

    const handleTyping = (data) => {
      if (data?.sessionId === sessionId && data.sender === 'admin') {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data?.sessionId === sessionId && data.sender === 'admin') {
        setIsTyping(false);
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

  // 5. Explicit Human Support Handoff Trigger
  const handleRequestHuman = async () => {
    if (isRequestingHuman) return;
    setIsRequestingHuman(true);

    try {
      const guestInfo = user ? {
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city
      } : {
        name: 'Website Visitor',
        role: 'visitor'
      };

      const res = await api.escalateSupportToHuman({
        sessionId,
        guestInfo,
        note: 'User clicked Talk to Human Support button'
      });

      if (res.success) {
        setSupportStatus('human_requested');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'system',
            text: "🙋‍♂️ **Human Support Staff Alerted!**\n\nWe have alerted our administration team. An official support specialist will join this chat shortly.\n\nYou can continue typing your questions below, or reach out on WhatsApp at **+92 317 1759093** if urgent.",
            timestamp: new Date()
          }
        ]);

        if (socket) {
          socket.emit('request-human-support', { sessionId, user: guestInfo });
        }
      }
    } catch (err) {
      console.error('Error requesting human support:', err);
    } finally {
      setIsRequestingHuman(false);
    }
  };

  // 6. Handle User Message Dispatch
  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    // Quick prompt check for human handoff
    if (text.includes('Talk to a Human') || text.includes('Human Support Agent')) {
      setInputValue('');
      await handleRequestHuman();
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: user?.name || 'You',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // If an admin is connected live, route directly through WebSockets
    if (supportStatus === 'admin_joined') {
      if (socket) {
        socket.emit('send-support-message', {
          sessionId,
          text,
          sender: 'user',
          senderName: user?.name || 'User'
        });
      }
      return;
    }

    // Otherwise, dispatch to AI Support Agent with live RAG context
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome' && m.sender !== 'system')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const guestInfo = user ? {
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city
      } : {
        name: 'Website Visitor',
        role: 'visitor'
      };

      const res = await api.sendSupportChatMessage({
        message: text,
        history,
        sessionId,
        guestInfo
      });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        senderName: 'IlmiDunya Counselor',
        text: res.reply || 'Assalam-o-Alaikum! How can I assist you further?',
        thoughts: res.thoughts,
        source: res.source,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);

      if (res.shouldEscalate) {
        setSupportStatus('human_requested');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          text: 'Assalam-o-Alaikum! Please tap **"🙋‍♂️ Talk to Human Support"** right above to connect directly with our administrative team.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminConnected = supportStatus === 'admin_joined';
  const isHumanRequested = supportStatus === 'human_requested';

  return (
    <>
      {/* 1. FLOATING BOTTOM-RIGHT SUPPORT TRIGGER PILL */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 print:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#0c2217] border-2 border-[#d4a359]/60 shadow-[0_10px_30px_rgba(12,34,23,0.55)] hover:shadow-[0_15px_35px_rgba(212,163,89,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer"
          aria-label="Open IlmiDunya Support Chat"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d4a359]/20 border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] group-hover:bg-[#d4a359] group-hover:text-[#0c2217] transition-colors shrink-0">
            {isAdminConnected ? (
              <Headphones className="w-4 h-4 text-emerald-400 group-hover:text-[#0c2217]" />
            ) : (
              <Headphones className="w-4 h-4" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span>Support</span>
            <span className="hidden sm:inline text-[10px] text-emerald-300 font-semibold px-1.5 py-0.5 bg-emerald-950/70 rounded-md border border-emerald-500/30">
              {isAdminConnected ? 'Live Staff' : 'AI & Staff'}
            </span>
          </span>
          {unreadCount > 0 && !isOpen && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#fbbf24]"></span>
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
                className="sm:hidden p-1.5 -ml-1 text-stone-300 hover:text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#10b981] via-[#d4a359] to-[#b85d34] p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#0c2217] rounded-[10px] flex items-center justify-center">
                  {isAdminConnected ? (
                    <Headphones className="w-4 h-4 text-[#10b981]" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#d4a359]" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    {isAdminConnected ? `Support Staff (${assignedAdmin})` : 'IlmiDunya Support'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isAdminConnected ? 'Live Staff' : isHumanRequested ? 'Connecting Staff' : 'AI Counselor'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-300">
                  {isAdminConnected
                    ? 'Connected with human support specialist'
                    : '1:1 Tutors • Direct Dealing • 3-Day Trial • Safety'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
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
                className="sm:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Persistent Human Escalation Banner */}
          {!isAdminConnected && (
            <div className="px-3.5 py-2 bg-[#0c2217]/90 border-b border-white/5 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
                {isHumanRequested ? (
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Admin notified & connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-stone-300 text-[10.5px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                    AI Support Counselor Active
                  </span>
                )}
              </div>

              {!isHumanRequested ? (
                <button
                  onClick={handleRequestHuman}
                  disabled={isRequestingHuman}
                  className="px-2.5 py-1 rounded-full bg-[#ba4c18]/90 hover:bg-[#ba4c18] text-white text-[11px] font-bold flex items-center gap-1 transition-transform hover:scale-105 shadow-sm border border-[#d4a359]/30 cursor-pointer"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Talk to Human</span>
                </button>
              ) : (
                <span className="text-[10px] text-amber-200/80 font-mono">Live Queue: #1</span>
              )}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-stone-700">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              const isSystem = m.sender === 'system';
              const isAdmin = m.sender === 'admin';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1">
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                    <div className="text-[9px] text-amber-400/60 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#d4a359]/20 border border-[#d4a359]/40 flex items-center justify-center shrink-0 mt-1">
                      {isAdmin ? (
                        <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-[#d4a359]" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#ba4c18] to-[#963b10] text-white rounded-br-xs shadow-md'
                      : isAdmin
                      ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-100 rounded-bl-xs shadow-md'
                      : 'bg-[#102a1d]/90 border border-[#d4a359]/20 text-stone-200 rounded-bl-xs shadow-md'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold opacity-75">
                        {isUser ? 'You' : isAdmin ? `Staff (${m.senderName || 'Admin'})` : 'IlmiDunya Counselor'}
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

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-stone-400 italic">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Staff agent is typing...</span>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#d4a359] italic">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Retrieving verified platform data...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-[#0c2217]/70 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#d4a359]/20 text-stone-300 hover:text-[#d4a359] text-[10.5px] border border-white/10 transition-colors shrink-0 cursor-pointer"
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
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isAdminConnected
                    ? 'Message support staff directly...'
                    : 'Ask about tutors, trials, fees, or your lessons...'
                }
                className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-[#d4a359] transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-[#ba4c18] to-[#963b10] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 text-white transition-all cursor-pointer shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-stone-400">
              <span>IlmiDunya Pakistan • AI & Live Support Desk</span>
              <span className="text-emerald-400/80">Support: contact@ilmidunya.pk</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
