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
  Bell,
  BookOpen,
  BarChart3,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  X,
  HelpCircle,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';

export default function AdminSupportDeskPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  // Top-Level Mode: 'inbox' | 'logs' | 'faqs' | 'analytics'
  const [activeMode, setActiveMode] = useState('inbox');

  // Support Inbox State
  const [sessions, setSessions] = useState([]);
  const [counts, setCounts] = useState({ all: 0, human_requested: 0, admin_joined: 0, resolved: 0 });
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [inboxTab, setInboxTab] = useState('human_requested'); // 'human_requested' | 'admin_joined' | 'resolved' | 'all'
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // FAQ Knowledge Base State
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('all');
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'general',
    tags: '',
    displayOrder: 0,
    isActive: true
  });
  const [isSavingFaq, setIsSavingFaq] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Search & Filter in Logs
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Chime on New Human Request
  const playAlertChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  };

  // Fetch Support Sessions
  const fetchSessions = async (tab = inboxTab) => {
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

  // Fetch Full Session Transcript
  const fetchSessionTranscript = async (id) => {
    setLoadingTranscript(true);
    try {
      const res = await api.getAdminSupportSession(id);
      if (res.success && res.session) {
        setSelectedSession(res.session);
      }
    } catch (err) {
      console.error('Failed to fetch transcript:', err);
    } finally {
      setLoadingTranscript(false);
    }
  };

  // Fetch FAQs
  const fetchFaqs = async () => {
    setLoadingFaqs(true);
    try {
      const res = await api.getSupportFaqs(faqCategoryFilter === 'all' ? null : faqCategoryFilter);
      if (res.success) {
        setFaqs(res.faqs || []);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.getSupportAnalytics();
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Failed to load support analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Initial Load & Socket Setup
  useEffect(() => {
    fetchSessions();
  }, [inboxTab]);

  useEffect(() => {
    if (activeMode === 'faqs') {
      fetchFaqs();
    } else if (activeMode === 'analytics') {
      fetchAnalytics();
    }
  }, [activeMode, faqCategoryFilter]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionTranscript(selectedSessionId);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  // Socket Live Listeners
  useEffect(() => {
    if (!socket) return;

    const handleHumanAlert = (data) => {
      playAlertChime();
      fetchSessions();
    };

    const handleMessageReceived = (data) => {
      if (selectedSessionId && data.sessionId === selectedSessionId) {
        setSelectedSession((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m._id === data.message?._id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, data.message]
          };
        });
      }
      fetchSessions();
    };

    socket.on('human-support-alert', handleHumanAlert);
    socket.on('support-message-received', handleMessageReceived);
    socket.on('support-session-updated', fetchSessions);

    return () => {
      socket.off('human-support-alert', handleHumanAlert);
      socket.off('support-message-received', handleMessageReceived);
      socket.off('support-session-updated', fetchSessions);
    };
  }, [socket, selectedSessionId, soundEnabled]);

  // Admin Actions
  const handleJoinSession = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await api.adminJoinSupportSession(selectedSessionId);
      if (res.success) {
        fetchSessionTranscript(selectedSessionId);
        fetchSessions();
        if (socket) {
          socket.emit('admin-join-support', { sessionId: selectedSessionId, admin: user });
        }
      }
    } catch (err) {
      alert('Failed to join support session: ' + err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !selectedSessionId || isSending) return;

    setIsSending(true);
    const text = messageText.trim();
    setMessageText('');

    try {
      const res = await api.adminSendSupportMessage(selectedSessionId, {
        text,
        senderName: user?.name || 'Administrator'
      });

      if (res.success) {
        if (socket) {
          socket.emit('send-support-message', {
            sessionId: selectedSessionId,
            text,
            sender: 'admin',
            senderName: user?.name || 'Support Admin'
          });
        }
        fetchSessionTranscript(selectedSessionId);
      }
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveSession = async () => {
    if (!selectedSessionId) return;
    if (!confirm('Mark this support inquiry as resolved?')) return;

    try {
      const res = await api.adminResolveSupportSession(selectedSessionId);
      if (res.success) {
        fetchSessionTranscript(selectedSessionId);
        fetchSessions();
        if (socket) {
          socket.emit('support-status-change', { sessionId: selectedSessionId, status: 'resolved' });
        }
      }
    } catch (err) {
      alert('Failed to resolve session: ' + err.message);
    }
  };

  // FAQ CRUD Handlers
  const handleOpenFaqModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'general',
        tags: (faq.tags || []).join(', '),
        displayOrder: faq.display_order || faq.displayOrder || 0,
        isActive: faq.is_active !== undefined ? faq.is_active : (faq.isActive !== false)
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        question: '',
        answer: '',
        category: 'general',
        tags: '',
        displayOrder: 0,
        isActive: true
      });
    }
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer || isSavingFaq) return;

    setIsSavingFaq(true);
    try {
      if (editingFaq) {
        await api.adminUpdateSupportFaq(editingFaq.id || editingFaq._id, faqForm);
      } else {
        await api.adminCreateSupportFaq(faqForm);
      }
      setFaqModalOpen(false);
      fetchFaqs();
    } catch (err) {
      alert('Failed to save FAQ: ' + err.message);
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ? It will be removed from the AI Knowledge Base.')) return;
    try {
      await api.adminDeleteSupportFaq(id);
      fetchFaqs();
    } catch (err) {
      alert('Failed to delete FAQ: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400">
                  <Headphones className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Support Command Center
                </h1>
                <p className="text-xs text-slate-400">
                  Supabase pgvector Knowledge Base • Gemini RAG Agent • Live Staff Takeover
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
              <button
                onClick={() => setActiveMode('inbox')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === 'inbox'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Inbox</span>
                {counts.human_requested > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-bold animate-pulse">
                    {counts.human_requested}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveMode('logs')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === 'logs'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Logs</span>
              </button>

              <button
                onClick={() => setActiveMode('faqs')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === 'faqs'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge Base</span>
              </button>

              <button
                onClick={() => setActiveMode('analytics')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === 'analytics'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MODE 1: LIVE SUPPORT INBOX & CHAT TAKEOVER */}
          {/* ========================================================= */}
          {activeMode === 'inbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
              
              {/* Inbox Left Column: Session Queue */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
                
                {/* Sub-Tabs */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setInboxTab('human_requested')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      inboxTab === 'human_requested'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Waiting for Admin</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-500 text-white font-bold">
                      {counts.human_requested}
                    </span>
                  </button>

                  <button
                    onClick={() => setInboxTab('admin_joined')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      inboxTab === 'admin_joined'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>In Progress</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-600 text-white font-bold">
                      {counts.admin_joined}
                    </span>
                  </button>

                  <button
                    onClick={() => setInboxTab('resolved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      inboxTab === 'resolved'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Resolved</span>
                  </button>

                  <button
                    onClick={() => setInboxTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      inboxTab === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>All ({counts.all})</span>
                  </button>
                </div>

                {/* Session List */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                      <LoadingSpinner size="md" />
                      <p className="text-xs mt-2">Loading support inbox...</p>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/50" />
                      <p className="text-xs font-medium">No sessions in this queue.</p>
                    </div>
                  ) : (
                    sessions.map((s) => {
                      const isSelected = selectedSessionId === s.sessionId;
                      const isWaiting = s.status === 'human_requested';
                      const isLive = s.status === 'admin_joined';

                      return (
                        <div
                          key={s.sessionId}
                          onClick={() => setSelectedSessionId(s.sessionId)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-900/20'
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">
                                {s.guestInfo?.name || s.user?.name || 'Visitor'}
                              </span>
                              <span className="text-[10px] text-slate-400 capitalize px-1.5 py-0.5 rounded-md bg-slate-800">
                                {s.guestInfo?.role || s.user?.role || 'visitor'}
                              </span>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isWaiting
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                                : isLive
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {isWaiting ? 'Waiting for Admin' : isLive ? 'In Progress' : s.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-1 mb-2 font-mono">
                            {s.lastMessage || 'No messages'}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {s.assignedAdmin && (
                              <span className="text-emerald-400">Assigned: {s.assignedAdmin.name || 'Admin'}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Inbox Right Column: Live Chat & Full Transcript */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
                {!selectedSessionId ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-3">
                    <Headphones className="w-12 h-12 text-slate-700" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-300">Select a support conversation</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Live chat with students and visitors, inspect inquiries, and reply in real-time.
                      </p>
                    </div>
                  </div>
                ) : loadingTranscript ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <LoadingSpinner size="lg" />
                    <p className="text-xs mt-2">Loading full conversation transcript...</p>
                  </div>
                ) : (
                  <>
                    {/* Transcript Header */}
                    <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">
                            {selectedSession?.guestInfo?.name || selectedSession?.user?.name || 'Visitor'}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {selectedSession?.sessionId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Role: <span className="text-emerald-400 font-semibold">{selectedSession?.guestInfo?.role || 'student'}</span> • Status: <span className="capitalize text-slate-200">{selectedSession?.status}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedSession?.status === 'human_requested' && (
                          <button
                            onClick={handleJoinSession}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Join as Support Staff</span>
                          </button>
                        )}

                        {selectedSession?.status !== 'resolved' && (
                          <button
                            onClick={handleResolveSession}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all border border-slate-700 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-950/30">
                      {selectedSession?.messages?.map((m, idx) => {
                        const isUser = m.sender === 'user';
                        const isAdmin = m.sender === 'admin';
                        const isSystem = m.sender === 'system';

                        if (isSystem) {
                          return (
                            <div key={idx} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs text-center font-mono">
                              {m.text}
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className={`flex gap-2 ${isUser ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                              isUser
                                ? 'bg-slate-800 text-white rounded-bl-xs border border-slate-700'
                                : isAdmin
                                ? 'bg-emerald-600 text-white rounded-br-xs shadow-md'
                                : 'bg-slate-900 border border-emerald-500/30 text-emerald-200 rounded-br-xs'
                            }`}>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-[10px] opacity-80">
                                  {isUser ? m.senderName || 'User' : isAdmin ? `Staff (${m.senderName || 'Admin'})` : (m.senderName || 'Support Staff')}
                                </span>
                                <span className="text-[9px] opacity-60">
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Live Reply Footer */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={
                          selectedSession?.status === 'admin_joined'
                            ? 'Reply directly to user as live staff...'
                            : 'Click "Join as Support Staff" to take over live chat...'
                        }
                        disabled={selectedSession?.status !== 'admin_joined' || isSending}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={selectedSession?.status !== 'admin_joined' || isSending || !messageText.trim()}
                        className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all cursor-pointer shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 2: SUPPORT CONVERSATION LOGS (Searchable Archive) */}
          {/* ========================================================= */}
          {activeMode === 'logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Support Chat Transcripts & Archive</h3>
                  <p className="text-xs text-slate-400">Complete archive of all live support conversations to audit inquiries & review responses.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by topic, user, or text..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Table of sessions */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Session ID</th>
                      <th className="p-3.5">Visitor / User</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Last Message</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sessions
                      .filter((s) => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          s.sessionId.toLowerCase().includes(q) ||
                          (s.guestInfo?.name || '').toLowerCase().includes(q) ||
                          (s.lastMessage || '').toLowerCase().includes(q)
                        );
                      })
                      .map((s) => (
                        <tr key={s.sessionId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-mono text-emerald-400">{s.sessionId}</td>
                          <td className="p-3.5 font-semibold text-white">{s.guestInfo?.name || s.user?.name || 'Visitor'}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300 max-w-xs truncate">{s.lastMessage}</td>
                          <td className="p-3.5 text-slate-500 text-[11px]">{new Date(s.updatedAt).toLocaleDateString()}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedSessionId(s.sessionId);
                                setActiveMode('inbox');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-bold"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 3: PLATFORM KNOWLEDGE BASE & FAQS */}
          {/* ========================================================= */}
          {activeMode === 'faqs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>Platform Knowledge Base & FAQs</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage verified platform FAQs, admissions guidelines, safety rules, and payment policies for support reference.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenFaqModal()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New FAQ</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['all', 'pricing_trials', 'tutors', 'courses', 'female_safety', 'account', 'general'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFaqCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap cursor-pointer ${
                      faqCategoryFilter === cat
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* FAQs Grid */}
              {loadingFaqs ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                  <LoadingSpinner size="md" />
                  <p className="text-xs mt-2">Loading Knowledge Base FAQs...</p>
                </div>
              ) : faqs.length === 0 ? (
                <div className="py-20 text-center text-slate-500 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-slate-700" />
                  <p className="text-xs">No FAQs found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id || faq._id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-sm"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold capitalize bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            {faq.category?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Order: {faq.display_order || faq.displayOrder || 0}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white leading-snug">
                          {faq.question}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 text-[10px]">
                          Tags: {(faq.tags || []).join(', ') || 'general'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenFaqModal(faq)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id || faq._id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 4: ANALYTICS DASHBOARD */}
          {/* ========================================================= */}
          {activeMode === 'analytics' && (
            <div className="space-y-6">
              {loadingAnalytics || !analytics ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs mt-2">Aggregating live support desk analytics...</p>
                </div>
              ) : (
                <>
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold">Total Sessions</span>
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-white">
                        {analytics.metrics?.totalSessions || 0}
                      </div>
                      <p className="text-[11px] text-emerald-400 font-mono">100% Session Retention</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold">Escalation Rate</span>
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-300">
                        {analytics.metrics?.escalationRate || '0%'}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">Human handoffs requested</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold">Resolution Rate</span>
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl font-black text-purple-300">
                        {analytics.metrics?.resolutionRate || '100%'}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">Tickets solved by staff</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold">Avg Response Time</span>
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-black text-blue-300">
                        ~{analytics.metrics?.avgResponseTimeSec || 1.2}s
                      </div>
                      <p className="text-[11px] text-emerald-400 font-mono">Blazing Fast Response</p>
                    </div>
                  </div>

                  {/* Top Inquiry Topics */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Most Common Inquiry Topics</span>
                    </h3>
                    <div className="space-y-3">
                      {(analytics.topics || []).map((t, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{t.topic}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-emerald-400 font-mono font-bold">{t.count} inquiries</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {/* FAQ Edit/Create Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">
                {editingFaq ? 'Edit FAQ Entry' : 'Add New FAQ to Knowledge Base'}
              </h3>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. How does the 3-day trial work?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Write clear, accurate policy guidance..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pricing_trials">Pricing & 3-Day Trials</option>
                    <option value="tutors">Tutors & Sanad</option>
                    <option value="courses">Courses & Subjects</option>
                    <option value="female_safety">Female Safety & Privacy</option>
                    <option value="account">Account & Registration</option>
                    <option value="general">General Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={faqForm.displayOrder}
                    onChange={(e) => setFaqForm({ ...faqForm, displayOrder: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={faqForm.tags}
                  onChange={(e) => setFaqForm({ ...faqForm, tags: e.target.value })}
                  placeholder="trial, policy, meezan, jazzcash"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFaq}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingFaq && <LoadingSpinner size="xs" />}
                  <span>{editingFaq ? 'Update & Embed' : 'Save & Compute Vector'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
