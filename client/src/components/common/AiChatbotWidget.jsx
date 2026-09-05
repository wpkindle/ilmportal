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
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';

const QUICK_PROMPTS = [
  'Show verified female Alimahs for Quran & Tajweed',
  'Find Cambridge O/A Level subject teachers',
  'How does direct dealing with tutors work?',
  'Do you provide official course certificates?'
];

export default function AiChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Assalam-o-Alaikum! 🌟 I am **IlmiDunya AI Mentor**, connected directly to our live database.\n\nAsk me anything about verified Qaris, female Alimahs, Cambridge/Board tutors, course fees, direct dealing (no 3rd party cuts), or official certificates!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // Hide on classroom routes to keep whiteboard/video distraction-free
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await api.sendAiChat({ message: text, history });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply || 'I have retrieved information from our database.',
        source: res.source,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I apologize, I could not connect to the database right now. Please verify that the server is active or try again shortly.",
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

    // Process markdown lines
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bullet points
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

      // Simple bold parsing for parts
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

  return (
    <>
      {/* 1. FLOATING AI MENTOR TRIGGER BUTTON (Bottom-Right, Never Overlapping Support Widget) */}
      <div className="fixed bottom-20 md:bottom-5 right-3 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open IlmiDunya AI Assistant"
          className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 min-h-[44px] rounded-full shadow-[0_8px_30px_rgba(12,34,23,0.6)] bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#0c2217] hover:from-[#143d2b] hover:to-[#1a4a35] text-[#f5f0e6] border-2 border-[#10b981]/50 hover:border-[#d4a359] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#10b981] to-[#d4a359] flex items-center justify-center text-white shrink-0 shadow-sm shadow-black/40 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>Ask AI</span>
            <span className="hidden sm:inline text-[10px] text-emerald-300 font-medium px-1.5 py-0.5 bg-emerald-950/60 rounded-md border border-emerald-500/30">
              Live Data
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

      {/* 2. CHATBOT WINDOW DIALOG */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-20 right-2 sm:right-6 z-50 w-[94vw] sm:w-[410px] max-h-[82vh] h-[560px] flex flex-col rounded-2xl sm:rounded-3xl bg-[#07150e]/95 border-2 border-[#d4a359]/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 sm:py-3.5 bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#07150e] border-b border-[#d4a359]/25 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#10b981] via-[#d4a359] to-[#b85d34] p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#0c2217] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#d4a359]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    IlmiDunya AI Mentor
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live DB
                  </span>
                </div>
                <p className="text-[10px] text-stone-300">
                  Tutors &bull; Courses &bull; Policies &bull; Certificates
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

          {/* Quick Prompts Carousel Bar */}
          <div className="px-3 py-2 bg-[#0c2217]/70 border-b border-white/5 overflow-x-auto flex items-center gap-1.5 scrollbar-none text-[11px] shrink-0">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-[#143d2b]/60 hover:bg-[#143d2b] border border-[#d4a359]/25 hover:border-[#d4a359] text-stone-200 hover:text-white transition-all whitespace-nowrap shrink-0 text-[10px] sm:text-[11px] cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 text-xs text-stone-200 overscroll-contain">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#143d2b] border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-[#b85d34] to-[#9e4e2a] text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-bl-none'
                        : 'bg-[#143d2b]/60 border border-[#d4a359]/25 text-stone-200 rounded-bl-none'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
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
                  <div className="w-2 h-2 rounded-full bg-[#d4a359] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#d4a359] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#d4a359] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-stone-400 pl-1 font-medium">Checking live database...</span>
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
                placeholder="Ask about tutors, fees, female privacy..."
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

