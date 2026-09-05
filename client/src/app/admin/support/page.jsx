'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Headphones,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  Sparkles,
  ExternalLink,
  BrainCircuit,
  Filter,
  RefreshCw,
  Bell
} from 'lucide-react';

export default function AdminSupportDeskPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [counts, setCounts] = useState({ all: 0, human_requested: 0, admin_joined: 0, resolved: 0 });
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState('human_requested'); // default to pending requests
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // Play audio chime when a user requests human support
  const playAlertChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // Audio autoplay policy catch
    }
  };

  const fetchSessions = async (tab = activeTab) => {
    try {
      const filterStatus = tab === 'all' ? undefined : tab;
      const res = await api.getAdminSupportSessions({ status: filterStatus });
      if (res.success) {
        setSessions(res.sessions || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load support sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTranscript = async (id) => {
    if (!id) return;
    setLoadingTranscript(true);
    try {
      const res = await api.getAdminSupportSession(id);
      if (res.success && res.session) {
        setSelectedSession(res.session);
        setSelectedSessionId(res.session.sessionId);
        // Join the live socket room
        if (socket) {
          socket.emit('join-support-session', { sessionId: res.session.sessionId });
        }
      }
    } catch (err) {
      console.error('Failed to load transcript:', err);
    } finally {
      setLoadingTranscript(false);
    }
  };

  useEffect(() => {
    fetchSessions(activeTab);
  }, [activeTab]);

  // Handle URL query session preselection if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionParam = urlParams.get('session');
      if (sessionParam) {
        loadSessionTranscript(sessionParam);
      }
    }
  }, []);

  // Socket listener for live support updates and new messages
  useEffect(() => {
    if (!socket) return;

    const handleHumanAlert = (data) => {
      playAlertChime();
      fetchSessions(activeTab);
      if (selectedSessionId && data?.sessionId === selectedSessionId) {
        loadSessionTranscript(selectedSessionId);
      }
    };

    const handleSessionUpdated = (data) => {
      fetchSessions(activeTab);
      if (selectedSessionId && data?.sessionId === selectedSessionId) {
        loadSessionTranscript(selectedSessionId);
      }
    };

    const handleSupportMessage = (data) => {
      if (selectedSessionId && data?.sessionId === selectedSessionId && data?.message) {
        setSelectedSession((prev) => {
          if (!prev) return prev;
          // Avoid duplicate messages
          const exists = prev.messages?.some(m => m._id === data.message._id);
          if (exists) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), data.message]
          };
        });
      }
      fetchSessions(activeTab);
    };

    const handleStatusChanged = (data) => {
      if (selectedSessionId && data?.sessionId === selectedSessionId) {
        setSelectedSession((prev) => prev ? { ...prev, status: data.status } : prev);
      }
      fetchSessions(activeTab);
    };

    socket.on('human-support-alert', handleHumanAlert);
    socket.on('support-session-updated', handleSessionUpdated);
    socket.on('support-message-received', handleSupportMessage);
    socket.on('support-status-changed', handleStatusChanged);

    return () => {
      socket.off('human-support-alert', handleHumanAlert);
      socket.off('support-session-updated', handleSessionUpdated);
      socket.off('support-message-received', handleSupportMessage);
      socket.off('support-status-changed', handleStatusChanged);
      if (selectedSessionId) {
        socket.emit('leave-support-session', { sessionId: selectedSessionId });
      }
    };
  }, [socket, selectedSessionId, activeTab]);

  // Auto scroll transcript to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  const handleJoinChat = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await api.adminJoinSupportSession(selectedSessionId);
      if (res.success && res.session) {
        setSelectedSession(res.session);
        fetchSessions(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Failed to join support chat');
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = messageText.trim();
    if (!text || !selectedSessionId || isSending) return;

    setIsSending(true);
    try {
      if (socket) {
        socket.emit('send-support-message', {
          sessionId: selectedSessionId,
          text,
          sender: 'admin',
          senderName: user?.name || 'Support Specialist',
          senderAvatar: user?.avatar || ''
        });
      } else {
        await api.adminSendSupportMessage(selectedSessionId, { text });
      }
      setMessageText('');
      // Optimistic append
      setSelectedSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              sender: 'admin',
              senderName: user?.name || 'Support Specialist',
              senderAvatar: user?.avatar || '',
              text,
              createdAt: new Date()
            }
          ]
        };
      });
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveSession = async () => {
    if (!selectedSessionId) return;
    if (!window.confirm('Mark this support ticket as resolved?')) return;
    try {
      const res = await api.adminResolveSupportSession(selectedSessionId);
      if (res.success) {
        setSelectedSession((prev) => prev ? { ...prev, status: 'resolved' } : prev);
        fetchSessions(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Failed to resolve support session');
    }
  };

  return (
    <div className="py-8 bg-slate-950 min-h-screen text-stone-100 selection:bg-[#d4a359] selection:text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10b981] via-[#d4a359] to-[#b85d34] p-0.5 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-[#d4a359]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white">Live Support Desk</h1>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Real-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live Human Agent Takeover &bull; Gemini 3.7 Flash Thinking Oversight &bull; Full Chat Transcripts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    soundEnabled
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={soundEnabled ? 'Chime sound active for new requests' : 'Muted'}
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">{soundEnabled ? 'Chime On' : 'Muted'}</span>
                </button>
                <button
                  onClick={() => fetchSessions(activeTab)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Refresh Sessions"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('human_requested')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'human_requested'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Waiting for Human</span>
                {counts.human_requested > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black animate-pulse">
                    {counts.human_requested}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('admin_joined')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'admin_joined'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>In Progress with Admin</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                  {counts.admin_joined}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolved</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                  {counts.resolved}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>All Sessions ({counts.all})</span>
              </button>
            </div>

            {/* Main Desk 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
              
              {/* Left Column: Support Queue List */}
              <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-4 flex flex-col overflow-hidden shadow-xl">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Active Queue ({sessions.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">Auto-synced</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
                  {loading ? (
                    <div className="py-12 flex justify-center">
                      <LoadingSpinner text="Loading tickets..." />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto" />
                      <p className="text-xs font-semibold">No tickets in this queue</p>
                      <p className="text-[11px] text-slate-600">Great job! All support inquiries are clear.</p>
                    </div>
                  ) : (
                    sessions.map((s) => {
                      const isSelected = selectedSessionId === s.sessionId;
                      const isPending = s.status === 'human_requested';
                      const isAdminJoined = s.status === 'admin_joined';
                      const requesterName = s.user?.name || s.guestInfo?.name || 'Guest Visitor';
                      const requesterRole = s.user?.role || s.guestInfo?.role || 'visitor';
                      const requesterCity = s.user?.city || s.guestInfo?.city || '';

                      return (
                        <button
                          key={s.sessionId}
                          onClick={() => loadSessionTranscript(s.sessionId)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-slate-800/90 border-[#d4a359] shadow-lg shadow-black/40'
                              : isPending
                              ? 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-800/40 hover:border-rose-600'
                              : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[#d4a359] font-bold text-xs shrink-0">
                                {requesterName.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#d4a359] transition-colors">
                                  {requesterName}
                                </h4>
                                <p className="text-[10px] text-slate-400 capitalize">
                                  {requesterRole} {requesterCity ? `• ${requesterCity}` : ''}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                isPending
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : isAdminJoined
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : s.status === 'resolved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {s.status.replace('_', ' ')}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 font-normal">
                            {s.lastMessage || 'Inquiry started...'}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-800/60">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>{s.messages?.length || 0} messages</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Live Chat Console & Transcript */}
              <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
                {selectedSession ? (
                  <>
                    {/* Transcript Console Header */}
                    <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#10b981] to-[#d4a359] p-0.5">
                          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-white text-sm">
                            {(selectedSession.user?.name || selectedSession.guestInfo?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white">
                              {selectedSession.user?.name || selectedSession.guestInfo?.name || 'Guest Visitor'}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 uppercase">
                              {selectedSession.user?.role || selectedSession.guestInfo?.role || 'visitor'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Session: <span className="font-mono text-stone-300">{selectedSession.sessionId}</span>
                            {selectedSession.assignedAdmin && (
                              <span className="ml-2 text-emerald-400 font-semibold">
                                &bull; Handled by {selectedSession.assignedAdmin?.name || 'Admin'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedSession.status !== 'admin_joined' && selectedSession.status !== 'resolved' && (
                          <button
                            onClick={handleJoinChat}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Join as Support Agent</span>
                          </button>
                        )}

                        {selectedSession.status !== 'resolved' && (
                          <button
                            onClick={handleResolveSession}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 text-slate-300 border border-slate-700 hover:border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-950/40">
                      {loadingTranscript ? (
                        <div className="py-20 flex justify-center">
                          <LoadingSpinner text="Fetching full transcript..." />
                        </div>
                      ) : (
                        selectedSession.messages?.map((msg, idx) => {
                          const isUser = msg.sender === 'user';
                          const isBot = msg.sender === 'bot';
                          const isAdmin = msg.sender === 'admin';
                          const isSystem = msg.sender === 'system';

                          if (isSystem) {
                            return (
                              <div key={idx} className="flex justify-center my-2">
                                <span className="text-[10px] font-semibold text-amber-300/90 bg-amber-950/50 border border-amber-800/40 px-3 py-1 rounded-full">
                                  {msg.text}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={idx}
                              className={`flex gap-2.5 ${
                                isAdmin
                                  ? 'justify-end'
                                  : isUser
                                  ? 'justify-start'
                                  : 'justify-start'
                              }`}
                            >
                              {/* Avatar */}
                              {!isAdmin && (
                                <div
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1 border ${
                                    isBot
                                      ? 'bg-slate-800 border-[#d4a359]/40 text-[#d4a359]'
                                      : 'bg-slate-800 border-slate-700 text-white font-bold'
                                  }`}
                                >
                                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4 text-purple-400" />}
                                </div>
                              )}

                              <div className={`max-w-[82%] space-y-1`}>
                                <div className={`flex items-center gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {msg.senderName}
                                  </span>
                                  {isBot && (
                                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                      Gemini 3.7 Flash
                                    </span>
                                  )}
                                  {isAdmin && (
                                    <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/30">
                                      Support Specialist (You)
                                    </span>
                                  )}
                                  <span className="text-[9px] text-slate-500">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                {/* Thinking reflection accordion if present */}
                                {msg.thoughts && (
                                  <details className="text-[10px] bg-slate-900/90 border border-[#d4a359]/30 rounded-xl p-2 text-stone-300 space-y-1">
                                    <summary className="font-bold text-[#d4a359] cursor-pointer flex items-center gap-1 select-none">
                                      <BrainCircuit className="w-3 h-3 text-[#d4a359]" />
                                      <span>Gemini 3.7 Flash Reasoning Chain</span>
                                    </summary>
                                    <p className="mt-1.5 whitespace-pre-wrap font-mono text-slate-400 leading-relaxed border-t border-slate-800 pt-1.5">
                                      {msg.thoughts}
                                    </p>
                                  </details>
                                )}

                                <div
                                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                    isAdmin
                                      ? 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-br-none shadow-md'
                                      : isUser
                                      ? 'bg-slate-800 border border-slate-700 text-stone-200 rounded-bl-none'
                                      : 'bg-[#0c2217] border border-[#d4a359]/30 text-stone-200 rounded-bl-none'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                              </div>

                              {isAdmin && (
                                <div className="w-7 h-7 rounded-xl bg-[#10b981] border border-white/20 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm font-bold text-xs">
                                  A
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 shrink-0 flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={
                          selectedSession.status === 'resolved'
                            ? 'Session is marked resolved. Type to reopen and reply...'
                            : `Reply to ${selectedSession.user?.name || selectedSession.guestInfo?.name || 'User'} live...`
                        }
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || isSending}
                        className="px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[#d4a359]">
                      <Headphones className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Select a Support Session</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Choose a pending ticket or active conversation from the left to inspect the full AI transcript and take over live.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

