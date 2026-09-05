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
  PhoneCall
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const QUICK_PROMPTS = [
  'Show verified female Alimahs for Quran & Tajweed',
  'Find Cambridge O/A Level subject teachers',
  'How does direct dealing with tutors work?',
  'Do you provide official course certificates?',
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
      text: "Assalam-o-Alaikum! 🌟 Welcome to **IlmiDunya Support Hub**.\n\nI am your AI Academic Counselor, equipped with deep reasoning and connected directly to our live database.\n\nAsk me anything about verified Qaris, female Alimahs, Cambridge tutors, or platform policies. If you need human assistance, tap **'Talk to Human Support'** at any time!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingHuman, setIsRequestingHuman] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize or retrieve persistent sessionId from localStorage
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

  // Auto-scroll to latest message
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

  // Connect to live support socket room
  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit('join-support-session', { sessionId });

    const handleMessageReceived = (data) => {
      if (data?.sessionId === sessionId && data?.message) {
        const incoming = data.message;
        // Check if message is already present
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
              senderName: incoming.senderName,
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
        setAssignedAdmin(data.admin?.name || 'Support Specialist');
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'system',
            text: `🟢 ${data.admin?.name || 'A Support Specialist'} has joined this conversation. You are now speaking directly with a human team member.`,
            timestamp: new Date()
          }
        ]);
        if (!isOpen) setUnreadCount((c) => c + 1);
      }
    };

    const handleStatusChanged = (data) => {
      if (data?.sessionId === sessionId && data?.status) {
        setSupportStatus(data.status);
        if (data.assignedAdmin) {
          setAssignedAdmin(data.assignedAdmin);
        }
      }
    };

    socket.on('support-message-received', handleMessageReceived);
    socket.on('admin-joined-support', handleAdminJoined);
    socket.on('support-status-changed', handleStatusChanged);

    return () => {
      socket.off('support-message-received', handleMessageReceived);
      socket.off('admin-joined-support', handleAdminJoined);
      socket.off('support-status-changed', handleStatusChanged);
    };
  }, [socket, sessionId, isOpen]);

  // Hide on classroom routes to keep video calls distraction-free
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  // Request Human Support escalation
  const handleRequestHuman = async () => {
    if (isRequestingHuman || supportStatus === 'admin_joined') return;
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

      const res = await api.requestHumanSupport({
        sessionId,
        guestInfo,
        note: 'User tapped Talk to Human Support button'
      });

      if (res.success) {
        setSupportStatus('human_requested');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'system',
            text: "🙋‍♂️ **Human Support Requested!**\n\nWe have notified our administration team. An official support specialist will join this chat shortly. You can continue typing your questions below.",
            timestamp: new Date()
          }
        ]);

        if (socket) {
          socket.emit('request-human-support', { sessionId, user: guestInfo });
        }
      }
    } catch (err) {
      console.error('Error requesting human support:', err);
      alert('Unable to request human support at this moment. Please email contact@ilmidunya.pk or try again.');
    } finally {
      setIsRequestingHuman(false);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    // Quick prompt check for human support
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

    // If an admin has already joined the chat, route directly to human support via socket
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

    // Otherwise, query Gemini 3.7 Flash thinking model
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

      const res = await api.sendAiChat({
        message: text,
        history,
        sessionId,
        guestInfo
      });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        senderName: 'IlmiDunya AI Mentor',
        text: res.reply || 'I have retrieved information from our database.',
        thoughts: res.thoughts,
        source: res.source,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);

      if (res.status && res.status !== supportStatus) {
        setSupportStatus(res.status);
      }
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        senderName: 'IlmiDunya AI Mentor',
        text: "I apologize, I am experiencing a brief connection delay with our AI reasoning service. You can ask again, or tap **'Talk to Human Support'** above to reach our team immediately.",
        isError: true,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render bold markdown and links
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const cleanLine = isBullet ? line.replace(/^[•*-]\s*/, '') : line;

      // Link regex: [Title](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            className="text-[#d4a359] hover:underline font-bold inline-flex items-center gap-0.5 ml-1"
            target={match[2].startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
          >
            {match[1]}
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const formattedParts = parts.map((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return <strong key={bIdx} className="text-white font-bold">{bPart.slice(2, -2)}</strong>;
          }
          return bPart;
        });
      });

      if (!cleanLine.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className={`${isBullet ? 'pl-3 flex items-start gap-1.5' : ''} leading-relaxed`}>
          {isBullet && <span className="text-[#d4a359] mt-0.5 shrink-0">•</span>}
          <span>{formattedParts}</span>
        </p>
      );
    });
  };

  const isAdminConnected = supportStatus === 'admin_joined';
  const isHumanRequested = supportStatus === 'human_requested';

  return (
    <>
      {/* 1. FLOATING SUPPORT TRIGGER BUTTON */}
      <div className="fixed bottom-20 md:bottom-5 right-3 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open IlmiDunya Support"
          className="flex items-center gap-2.5 px-4 py-2.5 sm:px-4 sm:py-2.5 min-h-[44px] rounded-full shadow-[0_8px_30px_rgba(12,34,23,0.6)] bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#0c2217] hover:from-[#143d2b] hover:to-[#1a4a35] text-[#f5f0e6] border-2 border-[#10b981]/50 hover:border-[#d4a359] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#10b981] via-[#d4a359] to-[#ba4c18] flex items-center justify-center text-white shrink-0 shadow-sm shadow-black/40 group-hover:rotate-12 transition-transform">
            <Headphones className="w-3.5 h-3.5 text-white" />
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

      {/* 2. SUPPORT CHAT WINDOW DIALOG */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-20 right-2 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[84vh] h-[580px] flex flex-col rounded-2xl sm:rounded-3xl bg-[#07150e]/95 border-2 border-[#d4a359]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 sm:py-3.5 bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#07150e] border-b border-[#d4a359]/25 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
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
                    {isAdminConnected ? 'Live Agent' : isHumanRequested ? 'Alerting Admin' : 'Gemini 3.7'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-300">
                  {isAdminConnected
                    ? 'Connected with human support specialist'
                    : '1:1 Tutors • Direct Dealing • Certificates • Safety'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Human Escalation Banner / Action */}
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
                    AI Thinking Model Active
                  </span>
                )}
              </div>

              {!isHumanRequested && (
                <button
                  onClick={handleRequestHuman}
                  disabled={isRequestingHuman}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-200 hover:text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Headphones className="w-3 h-3 text-emerald-400" />
                  <span>Talk to Human</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Prompts Carousel Bar (Only in AI Mode) */}
          {!isAdminConnected && (
            <div className="px-3 py-1.5 bg-[#0c2217]/50 border-b border-white/5 overflow-x-auto flex items-center gap-1.5 scrollbar-none text-[11px] shrink-0">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-[#143d2b]/60 hover:bg-[#143d2b] border border-[#d4a359]/25 hover:border-[#d4a359] text-stone-200 hover:text-white transition-all whitespace-nowrap shrink-0 text-[10px] sm:text-[10.5px] cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 text-xs text-stone-200 overscroll-contain">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isBot = msg.sender === 'bot';
              const isAdmin = msg.sender === 'admin';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="max-w-[90%] text-center text-[10.5px] font-medium text-amber-200/90 bg-amber-950/60 border border-amber-800/40 px-3.5 py-1.5 rounded-2xl leading-relaxed">
                      {renderFormattedText(msg.text)}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 border ${
                        isAdmin
                          ? 'bg-[#10b981] border-white/40 text-white'
                          : 'bg-[#143d2b] border-[#d4a359]/40 text-[#d4a359]'
                      }`}
                    >
                      {isAdmin ? <Headphones className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-1">
                    {/* Sender Tag */}
                    {isAdmin && (
                      <span className="text-[9.5px] font-bold text-emerald-400 pl-1 flex items-center gap-1">
                        <span>Staff Support Specialist</span>
                      </span>
                    )}

                    {/* Gemini Thinking Accordion */}
                    {msg.thoughts && (
                      <details className="text-[10px] bg-[#0c2217]/90 border border-[#d4a359]/30 rounded-xl p-2 text-stone-300 space-y-1">
                        <summary className="font-bold text-[#d4a359] cursor-pointer flex items-center gap-1 select-none">
                          <BrainCircuit className="w-3 h-3 text-[#d4a359]" />
                          <span>AI Reasoned with Database</span>
                        </summary>
                        <p className="mt-1 whitespace-pre-wrap font-mono text-[9.5px] text-stone-400 leading-relaxed border-t border-white/10 pt-1">
                          {msg.thoughts}
                        </p>
                      </details>
                    )}

                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-[#b85d34] to-[#9e4e2a] text-white rounded-br-none'
                          : isAdmin
                          ? 'bg-gradient-to-r from-[#143d2b] to-[#0c2217] border-2 border-[#10b981]/50 text-stone-100 rounded-bl-none shadow-md'
                          : msg.isError
                          ? 'bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-bl-none'
                          : 'bg-[#143d2b]/60 border border-[#d4a359]/25 text-stone-200 rounded-bl-none'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#b85d34] flex items-center justify-center text-white shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#143d2b] border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#143d2b]/60 border border-[#d4a359]/25 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-2 text-stone-300">
                  <BrainCircuit className="w-4 h-4 text-[#d4a359] animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4a359] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-stone-300 pl-1 font-medium">
                    Reasoning through inquiry with live database...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-2.5 sm:p-3 bg-[#07150e] border-t border-[#d4a359]/20 shrink-0">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAdminConnected
                    ? `Message ${assignedAdmin || 'Support Staff'} live...`
                    : 'Ask about tutors, fees, or request human support...'
                }
                className="w-full bg-[#0c2217] border border-[#d4a359]/30 rounded-xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#d4a359] focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white disabled:opacity-40 disabled:hover:from-[#10b981] transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1.5 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#d4a359]" />
                100% Direct Dealing &bull; Female Safe
              </span>
              <span>English &bull; اردو</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
