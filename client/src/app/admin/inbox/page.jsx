'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Mail,
  Send,
  Search,
  RefreshCw,
  Star,
  Archive,
  Trash2,
  Reply,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  X,
  Plus,
  Filter,
  Check,
  BookOpen,
  GraduationCap,
  Paperclip
} from 'lucide-react';

const CATEGORY_LABELS = {
  all: 'All Messages',
  unread: 'Unread',
  tutor_inquiry: 'Tutor Inquiries',
  student_admission: 'Student Admissions',
  sanad_verification: 'Sanad Verification',
  billing: 'Billing & Deals',
  general: 'General'
};

const TEMPLATES = [
  {
    title: 'Tutor Sanad Approved',
    category: 'sanad_verification',
    subject: 'Verification Approved: Welcome to IlmiDunya Faculty',
    body: `Assalam-o-Alaikum,\n\nWe are pleased to inform you that your academic credentials and Sanad (certificate) have been successfully reviewed and verified by the IlmiDunya Faculty Committee.\n\nYour profile has now been updated with the "Verified Sanad" badge, and your profile is live in our public Tutors directory.\n\nYou can now log in to your tutor dashboard to set your availability and accept demo class bookings.\n\nWarm regards,\nAcademic Faculty Verification Board\nIlmiDunya Pakistan\ninfo@ilmidunya.com`
  },
  {
    title: 'Tutor Sanad Additional Info Needed',
    category: 'sanad_verification',
    subject: 'Action Required: Additional Verification Details for IlmiDunya',
    body: `Assalam-o-Alaikum,\n\nThank you for submitting your application to join IlmiDunya as an educator.\n\nUpon reviewing your submission, we require a clearer scanned copy of your degree / Sanad certificate and your CNIC copy for background verification.\n\nPlease reply directly to this email with the requested documents attached, or message our Faculty Coordinator via WhatsApp.\n\nJazakAllah Khair,\nIlmiDunya Faculty Team\ninfo@ilmidunya.com`
  },
  {
    title: 'Student Demo Class Guidance',
    category: 'student_admission',
    subject: 'Booking Your Free Demo Class on IlmiDunya',
    body: `Assalam-o-Alaikum,\n\nThank you for your inquiry regarding our 1-on-1 personalized tutoring.\n\nEvery student on IlmiDunya is entitled to a 100% Free 30-Minute Trial Demo with their selected teacher before any payment or commitment. All classes take place inside our secure browser-based classroom with camera-off privacy mode available for female students.\n\nYou can browse our verified faculty directory, select your preferred tutor, and click "Book Free Demo".\n\nPlease let us know if you need personalized assistance matching a teacher!\n\nBest regards,\nStudent Admissions Desk\nIlmiDunya Pakistan\ninfo@ilmidunya.com`
  },
  {
    title: 'General Support Acknowledgment',
    category: 'general',
    subject: 'Inquiry Received - IlmiDunya Support Desk',
    body: `Assalam-o-Alaikum,\n\nThank you for reaching out to IlmiDunya Pakistan. We have received your message, and an academic coordinator is reviewing your request.\n\nWe will get back to you with full details shortly.\n\nSincerely,\nIlmiDunya Support Team\ninfo@ilmidunya.com\nHelpline: +92 317 1759093`
  }
];

export default function AdminMailboxPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  // Data States
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [counts, setCounts] = useState({ unread: 0, total: 0, tutors: 0, students: 0 });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, tutors, students, starred, archived

  // UI States
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [composeModalOpen, setComposeModalOpen] = useState(false);

  // Compose Modal Form
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeCategory, setComposeCategory] = useState('general');
  const [sendingCompose, setSendingCompose] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const messagesEndRef = useRef(null);

  // Auto-scroll inside message history
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (activeFilter === 'unread') params.status = 'unread';
      if (activeFilter === 'archived') params.status = 'archived';
      if (activeFilter === 'tutors') params.role = 'tutor';
      if (activeFilter === 'students') params.role = 'student';
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [resThreads, resCounts] = await Promise.all([
        api.getEmailThreads(params),
        api.getEmailCounts()
      ]);

      if (resThreads.success) {
        setThreads(resThreads.threads || []);
        // If current selected thread is in the list, update it
        if (selectedThread) {
          const updated = resThreads.threads.find(t => t.threadId === selectedThread.threadId || t._id === selectedThread._id);
          if (updated) setSelectedThread(prev => ({ ...prev, ...updated }));
        }
      }
      if (resCounts.success) {
        setCounts(resCounts.counts || { unread: 0, total: 0, tutors: 0, students: 0 });
      }
    } catch (err) {
      console.error('Error fetching mailbox:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [activeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchThreads(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Real-time socket listener for incoming emails
  useEffect(() => {
    if (!socket) return;
    const handleIncomingEmail = (data) => {
      fetchThreads(true);
      if (selectedThread && data?.threadId === selectedThread.threadId) {
        loadThreadDetails(selectedThread.threadId);
      }
      setActionNotice(`New incoming email from ${data?.from?.address || 'User'}`);
      setTimeout(() => setActionNotice(''), 4000);
    };

    socket.on('email-received', handleIncomingEmail);
    return () => socket.off('email-received', handleIncomingEmail);
  }, [socket, selectedThread]);

  const loadThreadDetails = async (id) => {
    setLoadingThread(true);
    try {
      const res = await api.getEmailThread(id);
      if (res.success && res.thread) {
        setSelectedThread(res.thread);
        // Mark as read locally in thread list
        setThreads(prev => prev.map(t => (t.threadId === id || t._id === id) ? { ...t, status: 'read' } : t));
        setCounts(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (err) {
      console.error('Error loading thread:', err);
    } finally {
      setLoadingThread(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    setSendingReply(true);
    try {
      const res = await api.replyEmailThread(selectedThread.threadId || selectedThread._id, {
        text: replyText.trim()
      });

      if (res.success && res.thread) {
        setSelectedThread(res.thread);
        setReplyText('');
        fetchThreads(true);
        setActionNotice('Reply successfully sent via Resend!');
        setTimeout(() => setActionNotice(''), 3500);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      alert(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendCompose = async (e) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      alert('Please fill out recipient, subject, and message content.');
      return;
    }

    setSendingCompose(true);
    try {
      const res = await api.composeEmail({
        to: composeTo.trim(),
        subject: composeSubject.trim(),
        text: composeBody.trim(),
        category: composeCategory
      });

      if (res.success && res.thread) {
        setComposeModalOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        fetchThreads();
        setSelectedThread(res.thread);
        setActionNotice('Email sent from info@ilmidunya.com!');
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err) {
      alert(err.message || 'Failed to compose email');
    } finally {
      setSendingCompose(false);
    }
  };

  const handleToggleStar = async (thread, e) => {
    e?.stopPropagation();
    try {
      const updatedStarred = !thread.isStarred;
      await api.updateEmailThreadStatus(thread.threadId || thread._id, { isStarred: updatedStarred });
      setThreads(prev => prev.map(t => (t.threadId === thread.threadId ? { ...t, isStarred: updatedStarred } : t)));
      if (selectedThread && (selectedThread.threadId === thread.threadId || selectedThread._id === thread._id)) {
        setSelectedThread(prev => ({ ...prev, isStarred: updatedStarred }));
      }
    } catch (e) {}
  };

  const handleArchiveThread = async (thread) => {
    try {
      const nextStatus = thread.status === 'archived' ? 'read' : 'archived';
      await api.updateEmailThreadStatus(thread.threadId || thread._id, { status: nextStatus });
      fetchThreads(true);
      if (selectedThread && (selectedThread.threadId === thread.threadId || selectedThread._id === thread._id)) {
        setSelectedThread(prev => ({ ...prev, status: nextStatus }));
      }
    } catch (e) {}
  };

  const handleDeleteThread = async (thread) => {
    if (!confirm('Are you sure you want to delete this email conversation?')) return;
    try {
      await api.deleteEmailThread(thread.threadId || thread._id);
      setSelectedThread(null);
      fetchThreads();
    } catch (e) {}
  };

  const handleApplyTemplate = (tmpl) => {
    setReplyText(tmpl.body);
  };

  const handleApplyComposeTemplate = (tmpl) => {
    setComposeSubject(tmpl.subject);
    setComposeBody(tmpl.body);
    setComposeCategory(tmpl.category);
  };

  const handleSeedDemoData = async () => {
    try {
      setLoading(true);
      await api.seedDemoEmails();
      await fetchThreads();
      setActionNotice('Sample inquiries initialized successfully!');
      setTimeout(() => setActionNotice(''), 3000);
    } catch (e) {
      alert(e.message || 'Seed failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6">
      {/* 1. Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* 2. Main Mailbox Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden min-h-[85vh]">
        
        {/* Top Header Bar */}
        <header className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4a359] to-[#b85d34] flex items-center justify-center text-white shadow-lg shadow-black/40 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">Business Mailbox</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  info@ilmidunya.com
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Resend Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official inquiries, faculty Sanad applications, and student admissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {threads.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDemoData}
                className="px-3 py-1.5 rounded-xl border border-dashed border-[#d4a359]/50 hover:bg-[#d4a359]/10 text-xs text-[#d4a359] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Add sample Pakistani inquiries for testing"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Inquiries</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fetchThreads()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Mailbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#d4a359]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setComposeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a359] to-[#b85d34] hover:from-[#e2b066] hover:to-[#c6683c] text-stone-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Compose Email</span>
            </button>
          </div>
        </header>

        {/* Action Notice Bar */}
        {actionNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-600/40 px-4 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 2-Pane Content Area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* ==================================================== */}
          {/* LEFT PANE: Filter Tabs & Thread List */}
          {/* ==================================================== */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/50 shrink-0 ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Search Input */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject, sender, email..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#d4a359]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="p-2 border-b border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All', count: counts.total },
                { id: 'unread', label: 'Unread', count: counts.unread },
                { id: 'tutors', label: 'Tutors', count: counts.tutors },
                { id: 'students', label: 'Students', count: counts.students },
                { id: 'archived', label: 'Archived', count: null }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-[#d4a359] text-stone-950 shadow-md'
                      : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{f.label}</span>
                  {f.count !== null && f.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      activeFilter === f.id ? 'bg-black/20 text-stone-950' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Thread List Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {loading && threads.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs">Loading mail conversations...</span>
                </div>
              ) : threads.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-300">No emails found</h4>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                    {activeFilter === 'unread' ? 'No unread messages in your inbox.' : 'Incoming emails from info@ilmidunya.com will appear here.'}
                  </p>
                  <button
                    onClick={handleSeedDemoData}
                    className="px-3 py-1.5 rounded-lg bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/40 text-xs font-bold hover:bg-[#d4a359]/30 transition cursor-pointer"
                  >
                    Seed Sample Inquiries
                  </button>
                </div>
              ) : (
                threads.map((thread) => {
                  const isSelected = selectedThread && (selectedThread.threadId === thread.threadId || selectedThread._id === thread._id);
                  const isUnread = thread.status === 'unread';

                  return (
                    <div
                      key={thread.threadId || thread._id}
                      onClick={() => loadThreadDetails(thread.threadId || thread._id)}
                      className={`p-3.5 transition-all cursor-pointer relative group flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-[#143d2b]/40 border-l-4 border-[#d4a359]'
                          : isUnread
                          ? 'bg-slate-850/90 hover:bg-slate-800'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Sender & Timestamp */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Unread Indicator Dot */}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#d4a359] shrink-0" />
                          )}

                          <span className={`text-xs truncate ${isUnread ? 'font-black text-white' : 'font-semibold text-slate-300'}`}>
                            {thread.from?.name || thread.from?.address || 'Unknown'}
                          </span>

                          {/* Role Badge */}
                          {thread.userRole === 'tutor' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                              Tutor
                            </span>
                          )}
                          {thread.userRole === 'student' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-950 text-sky-300 border border-sky-800 shrink-0">
                              Student
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatTimeAgo(thread.lastMessageAt || thread.createdAt)}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className={`text-xs truncate ${isUnread ? 'font-bold text-white' : 'text-slate-300'}`}>
                        {thread.subject || '(No Subject)'}
                      </div>

                      {/* Snippet Preview */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                        {thread.lastMessageSnippet || 'No preview available'}
                      </p>

                      {/* Footer tags / star */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[#d4a359] font-medium uppercase tracking-wider">
                          {CATEGORY_LABELS[thread.category] || thread.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {thread.status === 'replied' && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <Reply className="w-3 h-3" />
                              <span>Replied</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(thread, e)}
                            className={`p-1 rounded hover:bg-slate-700 ${thread.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT PANE: Conversation Viewer & Reply Composer */}
          {/* ==================================================== */}
          <div className={`flex-1 flex flex-col bg-slate-950/60 min-w-0 ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
            
            {loadingThread ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                <LoadingSpinner size="md" />
                <span className="text-xs">Loading email messages...</span>
              </div>
            ) : !selectedThread ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#d4a359] shadow-2xl">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-white">Select a conversation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    View incoming inquiries sent to <strong className="text-[#d4a359]">info@ilmidunya.com</strong>, verify faculty degrees, or compose a reply directly via Resend.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Email</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                
                {/* Thread Header Toolbar */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedThread(null)}
                        className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <h2 className="text-sm sm:text-base font-black text-white truncate">
                        {selectedThread.subject}
                      </h2>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStar(selectedThread)}
                        className={`p-2 rounded-xl border border-slate-800 hover:bg-slate-800 ${
                          selectedThread.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                        }`}
                        title="Star / Unstar"
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleArchiveThread(selectedThread)}
                        className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                        title={selectedThread.status === 'archived' ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteThread(selectedThread)}
                        className="p-2 rounded-xl border border-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                        title="Delete Conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sender Profile Header Card */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black flex items-center justify-center shrink-0 shadow">
                        {(selectedThread.from?.name || selectedThread.from?.address || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">
                            {selectedThread.from?.name || 'Inquirer'}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            &lt;{selectedThread.from?.address}&gt;
                          </span>
                          {selectedThread.userRole && selectedThread.userRole !== 'guest' && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              selectedThread.userRole === 'tutor'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-sky-950 text-sky-300 border border-sky-700'
                            }`}>
                              Registered {selectedThread.userRole}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>To: <strong>info@ilmidunya.com</strong></span>
                          <span>•</span>
                          <span>Category: <strong>{CATEGORY_LABELS[selectedThread.category] || selectedThread.category}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Matched LMS User Actions */}
                    {selectedThread.userRef && (
                      <div className="flex items-center gap-2">
                        {selectedThread.userRef.phone && (
                          <a
                            href={`https://wa.me/${selectedThread.userRef.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        <Link
                          href={selectedThread.userRole === 'tutor' ? `/tutors` : `/admin/users`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <span>View Account</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages History List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {selectedThread.messages && selectedThread.messages.map((msg, index) => {
                    const isOutbound = msg.direction === 'outbound';

                    return (
                      <div
                        key={msg._id || msg.messageId || index}
                        className={`flex flex-col gap-1 max-w-2xl ${
                          isOutbound ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        {/* Message Sender Tag */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                          <span className="font-semibold">
                            {isOutbound ? 'IlmiDunya Admin (info@ilmidunya.com)' : (msg.from?.name || msg.from?.address)}
                          </span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                            isOutbound
                              ? 'bg-gradient-to-br from-slate-800 to-slate-850 text-slate-100 border border-slate-700/80 rounded-tr-none'
                              : 'bg-gradient-to-br from-[#143d2b]/90 to-[#0c2217]/95 text-stone-100 border border-[#d4a359]/30 rounded-tl-none'
                          }`}
                        >
                          <div className="whitespace-pre-wrap font-sans">
                            {msg.text || msg.html?.replace(/<[^>]+>/g, '') || '(Empty Message Body)'}
                          </div>

                          {/* Attachments if any */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Attachments:</span>
                              <div className="flex flex-wrap gap-2">
                                {msg.attachments.map((att, i) => (
                                  <a
                                    key={i}
                                    href={att.contentUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 hover:bg-black/50 text-[11px] text-slate-200"
                                  >
                                    <Paperclip className="w-3 h-3 text-[#d4a359]" />
                                    <span>{att.filename || `Attachment-${i+1}`}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Inline Quick Reply Composer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/95 space-y-3">
                  {/* Quick Templates Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#d4a359]" />
                      <span>Quick Templates:</span>
                    </span>
                    {TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap transition cursor-pointer border border-slate-700/50"
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>

                  {/* Textarea Form */}
                  <form onSubmit={handleSendReply} className="space-y-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${selectedThread.from?.name || selectedThread.from?.address} from info@ilmidunya.com...`}
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-[#d4a359] placeholder-slate-500 resize-none font-sans"
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sending from <strong>info@ilmidunya.com</strong> via Resend</span>
                      </div>

                      <button
                        type="submit"
                        disabled={sendingReply || !replyText.trim()}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4a359] to-[#b85d34] hover:from-[#e2b066] hover:to-[#c6683c] text-stone-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                      >
                        {sendingReply ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Reply</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      {/* ==================================================== */}
      {/* 3. COMPOSE EMAIL MODAL */}
      {/* ==================================================== */}
      {composeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d4a359]/20 text-[#d4a359] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Compose New Business Email</h3>
                  <span className="text-[10px] text-slate-400">From: info@ilmidunya.com</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComposeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Buttons */}
            <div className="px-5 pt-3 pb-1 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Presets:</span>
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyComposeTemplate(tmpl)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium whitespace-nowrap border border-slate-700/50"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSendCompose} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Recipient Email (To):
                </label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="e.g. qari.student@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-[#d4a359]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="e.g. Sanad Verification Approved"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-[#d4a359]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Category:
                  </label>
                  <select
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-[#d4a359]"
                  >
                    <option value="general">General</option>
                    <option value="tutor_inquiry">Tutor Inquiry</option>
                    <option value="sanad_verification">Sanad Verification</option>
                    <option value="student_admission">Student Admission</option>
                    <option value="billing">Billing & Deals</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Message Content:
                </label>
                <textarea
                  rows={8}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your official email message here..."
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-[#d4a359] font-sans resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sendingCompose}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4a359] to-[#b85d34] text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {sendingCompose ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send from info@ilmidunya.com</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
