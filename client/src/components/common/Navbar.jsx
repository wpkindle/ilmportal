'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  BookMarked,
  Award,
  Code,
  CheckCircle2,
  Clock,
  ArrowRight,
  CreditCard,
  Headphones,
  Heart,
  QrCode,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { soundEngine } from '../../utils/soundEffects';
import { showNativeNotification } from '../../utils/notificationManager';
import { api } from '../../services/api';
import PromotionTopBar from './PromotionTopBar';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isTutor, isAdmin } = useAuth();
  const { socket } = useSocket();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subjectsDropdownOpen, setSubjectsDropdownOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [scrolledPastTopBar, setScrolledPastTopBar] = useState(false);

  const {
    notifications,
    unreadCount: unreadNotifCount,
    markAsRead,
    markAllAsRead,
    soundEnabled,
    toggleSound,
    permissionStatus,
    requestPermission,
    testChime
  } = useNotifications();
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const subjectsRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

  // Scroll listener to keep header fixed at top-0 when scrolled past topbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastTopBar(window.scrollY > 36);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch unread messages count on load and route change
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessagesCount(0);
      return;
    }

    // When on the messages page, clear immediately (backend marks as read on getMessages)
    if (pathname?.includes('/messages')) {
      setUnreadMessagesCount(0);
      // Re-fetch after 2s to reflect any still-unread from other conversations
      const timer = setTimeout(async () => {
        try {
          const res = await api.getConversations();
          if (res.success && res.conversations) {
            const totalUnread = res.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
            setUnreadMessagesCount(totalUnread);
          }
        } catch (e) {}
      }, 2000);
      return () => clearTimeout(timer);
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await api.getConversations();
        if (res.success && res.conversations) {
          const totalUnread = res.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMessagesCount(totalUnread);
        }
      } catch (e) {
        // Silently catch
      }
    };

    fetchUnreadCount();
  }, [isAuthenticated, pathname]);

  // Real-time Socket listener for incoming messages and alerts
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewMessage = (msg) => {
      const currentUserId = (user?._id || user?.id)?.toString();
      const senderId = (msg?.sender?._id || msg?.sender)?.toString();

      // If this incoming message is from someone else
      if (currentUserId && senderId && senderId !== currentUserId) {
        soundEngine.playMessageSound();

        // If not actively on the messages page, show native OS desktop & mobile notification banner
        if (!pathname?.includes('/messages')) {
          showNativeNotification({
            title: `${msg?.sender?.name || 'New Message'} (${msg?.sender?.role || 'User'})`,
            body: msg?.text || (msg?.voiceData ? 'Sent a voice note' : 'Sent an update'),
            icon: msg?.sender?.avatar || '/icon.png',
            url: isTutor 
              ? `/tutor/messages?conversation=${msg?.conversationId}` 
              : isStudent 
              ? `/student/messages?conversation=${msg?.conversationId}` 
              : '/admin/chats',
            tag: `chat-${msg?.conversationId || 'new'}`,
            soundType: 'none'
          });
        }
      }

      if (pathname?.includes('/messages')) {
        api.getConversations().then((res) => {
          if (res.success && res.conversations) {
            const totalUnread = res.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
            setUnreadMessagesCount(totalUnread);
          }
        });
      } else {
        setUnreadMessagesCount((prev) => prev + 1);
      }
    };

    const handleNotificationAlert = (data) => {
      if (data?.type === 'new_message' || data?.type === 'deal_offer') {
        if (!pathname?.includes('/messages')) {
          setUnreadMessagesCount((prev) => prev + 1);
        }
      }
    };

    const handleUnreadCountUpdated = ({ totalUnread }) => {
      if (typeof totalUnread === 'number') {
        setUnreadMessagesCount(totalUnread);
      }
    };

    const handleMessagesSeen = () => {
      api.getConversations().then((res) => {
        if (res.success && res.conversations) {
          const totalUnread = res.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMessagesCount(totalUnread);
        }
      }).catch(() => {});
    };

    socket.on('new-message', handleNewMessage);
    socket.on('notification-alert', handleNotificationAlert);
    socket.on('unread-count-updated', handleUnreadCountUpdated);
    socket.on('messages-seen', handleMessagesSeen);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('notification-alert', handleNotificationAlert);
      socket.off('unread-count-updated', handleUnreadCountUpdated);
      socket.off('messages-seen', handleMessagesSeen);
    };
  }, [socket, isAuthenticated, pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotifMenuOpen(false);
      }
      if (subjectsRef.current && !subjectsRef.current.contains(event.target)) {
        setSubjectsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setNotifMenuOpen(false);
    setSubjectsDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const getDashboardRoute = () => {
    if (isAdmin) return '/admin';
    if (isTutor) return '/tutor/dashboard';
    return '/student/dashboard';
  };

  const subjectCategories = [
    {
      title: 'Quran & Islamic Sciences',
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50',
      items: [
        { name: 'Nazra Quran Reading & Qaida', link: '/tutors?category=nazra-quran' },
        { name: 'Tajweed al-Quran', link: '/tutors?category=tajweed-al-quran' },
        { name: 'Hifz al-Quran Memorization', link: '/tutors?category=hifz-al-quran' },
        { name: 'Tafseer & Quranic Translation', link: '/tutors?category=quran-translation-tafseer' },
        { name: 'Islamic Studies & Fiqh', link: '/tutors?category=islamic-studies-fiqh' }
      ]
    },
    {
      title: 'School & College Academics',
      icon: GraduationCap,
      color: 'text-teal-600 bg-teal-50',
      items: [
        { name: 'Matric / SSC Science & Arts', link: '/tutors?category=matric-ssc-science' },
        { name: 'FSc Pre-Medical & Engineering', link: '/tutors?category=fsc-pre-engineering' },
        { name: 'Cambridge O Level Coaching', link: '/tutors?category=o-level-cambridge' },
        { name: 'Cambridge A Level Coaching', link: '/tutors?category=a-level-cambridge' },
        { name: 'MDCAT & ECAT Entry Prep', link: '/tutors?category=entry-test-prep' }
      ]
    },
    {
      title: 'Structured Courses',
      icon: BookMarked,
      color: 'text-amber-600 bg-amber-50',
      items: [
        { name: 'Nazra Quran for Kids (Ages 5–12)', link: '/courses/nazra-quran-kids' },
        { name: 'Tajweed Mastery Masterclass', link: '/courses' },
        { name: 'Noorani Qaida for Beginners', link: '/courses' },
        { name: 'Cambridge O-Level Mathematics', link: '/courses' },
        { name: 'Browse All LMS Courses →', link: '/courses' }
      ]
    }
  ];

  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  return (
    <>
      <PromotionTopBar />
      <header
        className={`fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-[top] duration-150 ${
          scrolledPastTopBar ? 'top-0' : 'top-0 md:top-[37px]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-display">
                  Ilm<span className="text-emerald-700">Portal</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                  Pakistan
                </span>
              </div>
              <p className="text-[9.5px] font-medium text-slate-400 -mt-0.5 hidden sm:block">
                Quran & Academic Tutoring Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/courses"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/courses')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <span>Courses</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white">
                New
              </span>
            </Link>

            <Link
              href="/tutors"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pathname === '/tutors'
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Find Tutors
            </Link>

            {/* Subjects & Programs Dropdown */}
            <div className="relative" ref={subjectsRef}>
              <button
                onClick={() => setSubjectsDropdownOpen(!subjectsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  subjectsDropdownOpen || pathname.includes('/tutors')
                    ? 'text-emerald-800 bg-emerald-50'
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <span>Subjects</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${subjectsDropdownOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
              </button>

              {subjectsDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[680px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  {subjectCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <div className={`p-1.5 rounded-lg ${cat.color}`}>
                          <cat.icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{cat.title}</h4>
                      </div>
                      <ul className="space-y-1">
                        {cat.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              href={item.link}
                              onClick={() => setSubjectsDropdownOpen(false)}
                              className="text-[11px] font-semibold text-slate-600 hover:text-emerald-700 hover:translate-x-0.5 block py-0.5 transition-all"
                            >
                              &bull; {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="col-span-1 md:col-span-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Over 20+ disciplines & structured courses</span>
                    <Link
                      href="/courses"
                      onClick={() => setSubjectsDropdownOpen(false)}
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Explore Course Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/how-it-works"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pathname === '/how-it-works'
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              How It Works
            </Link>

            <Link
              href="/safety"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname === '/safety'
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safety &amp; Privacy</span>
            </Link>
          </nav>

          {/* Right Action Buttons & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Active Portal Badge Link */}
                <Link
                  href={getDashboardRoute()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {isAdmin ? 'Admin Portal' : isTutor ? 'Tutor Portal' : 'Student Portal'}
                  </span>
                </Link>

                {/* Messages Link with Counter Badge */}
                <Link
                  href={isTutor ? '/tutor/messages' : isStudent ? '/student/messages' : '/admin/chats'}
                  className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 relative transition-colors"
                  title="Messages & Discussions"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[18px] h-[18px] bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                    className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 relative transition-colors cursor-pointer"
                    title="Notifications & Safety Alerts"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[18px] h-[18px] bg-emerald-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                        {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {notifMenuOpen && (
                    <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] sm:max-w-none bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-black text-slate-900">Notifications</span>
                          {unreadNotifCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {unreadNotifCount} new
                            </span>
                          )}
                        </div>
                        {unreadNotifCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Audio & Browser Alert Settings Bar */}
                      <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between text-[11px] text-slate-700">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSound()}
                            className="flex items-center gap-1 font-semibold hover:text-emerald-700 transition-colors cursor-pointer"
                            title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
                          >
                            {soundEnabled ? (
                              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>Sound {soundEnabled ? 'ON' : 'MUTED'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={testChime}
                            className="text-[10px] text-slate-500 hover:text-slate-900 underline font-medium cursor-pointer"
                            title="Test audio chime"
                          >
                            (Test)
                          </button>
                        </div>

                        {permissionStatus !== 'granted' ? (
                          <button
                            type="button"
                            onClick={requestPermission}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-200 cursor-pointer flex items-center gap-1"
                          >
                            <Bell className="w-3 h-3 text-amber-600 animate-pulse" />
                            <span>Enable OS Alerts</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>OS Alerts Active</span>
                          </span>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                            <ShieldCheck className="w-6 h-6 mx-auto text-slate-400" />
                            <p className="font-semibold text-slate-700">All caught up!</p>
                            <p className="text-[11px] text-slate-400">No new notifications or safety alerts.</p>
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <Link
                              key={n._id}
                              href={n.link || '#'}
                              onClick={() => {
                                markAsRead(n._id);
                                setNotifMenuOpen(false);
                              }}
                              className={`block p-3.5 hover:bg-slate-50 transition-colors text-xs space-y-1 ${
                                !n.isRead ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {n.type === 'safety_report' && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  )}
                                  <span>{n.title}</span>
                                </span>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 block pt-0.5">
                                {new Date(n.createdAt).toLocaleDateString('en-PK', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </Link>
                          ))
                        )}
                      </div>

                      {user?.role && (
                        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                          <Link
                            href={user.role === 'tutor' ? '/tutor/profile#safety-reports' : '/student/profile#safety-reports'}
                            onClick={() => setNotifMenuOpen(false)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>View Safety Reports &amp; Incident Resolutions</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=059669&color=fff`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-100"
                    />
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-bold text-slate-800 leading-tight max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </p>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-72 max-w-[calc(100vw-1.5rem)] sm:max-w-none bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                      <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 uppercase">
                          {user?.role} Account
                        </span>
                      </div>

                      <div className="p-2 space-y-0.5">
                        <Link
                          href={getDashboardRoute()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl transition-colors"
                        >
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <span>{isAdmin ? 'Admin Dashboard' : isTutor ? 'Tutor Dashboard' : 'Student Dashboard'}</span>
                        </Link>

                        {isStudent && (
                          <>
                            <Link
                              href="/student/deals"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl transition-colors"
                            >
                              <BookOpen className="w-4 h-4 text-emerald-600" />
                              <span>My Courses & Subscriptions</span>
                            </Link>
                            <Link
                              href="/student/certificates"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl transition-colors"
                            >
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span>My Certificates</span>
                            </Link>
                            <Link
                              href="/student/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl transition-colors"
                            >
                              <User className="w-4 h-4 text-emerald-600" />
                              <span>Profile & Account Settings</span>
                            </Link>
                          </>
                        )}

                        {isTutor && (
                          <>
                            <Link
                              href="/tutor/courses"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl transition-colors"
                            >
                              <BookOpen className="w-4 h-4 text-emerald-600" />
                              <span>Course Studio (Chapters, Tests)</span>
                            </Link>
                            <Link
                              href="/tutor/deals"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl transition-colors"
                            >
                              <CreditCard className="w-4 h-4 text-emerald-600" />
                              <span>Student Deals & Trials</span>
                            </Link>
                            <Link
                              href="/tutor/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl transition-colors"
                            >
                              <User className="w-4 h-4 text-emerald-600" />
                              <span>Profile & Sanad Credentials</span>
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <Link
                            href="/admin/tutor-approvals"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-2xl transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Tutor Approvals Queue</span>
                          </Link>
                        )}
                      </div>

                      <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100/70 rounded-2xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Unauthenticated Dual Portal Buttons (Student & Tutor) - Desktop Only, shown inside mobile drawer on small screens */
              <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login?role=student"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student Portal</span>
                </Link>

                <Link
                  href="/login?role=tutor"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Tutor Portal</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button (44x44px touch target) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 px-3 space-y-3 animate-in slide-in-from-top-2 duration-150 bg-white/95 backdrop-blur-md">
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
                <Link
                  href="/login?role=student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 min-h-[44px] bg-slate-900 active:bg-slate-950 text-white rounded-2xl text-xs font-bold text-center transition-transform active:scale-95 shadow-sm"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Student Portal</span>
                </Link>
                <Link
                  href="/login?role=tutor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 min-h-[44px] bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl text-xs font-bold text-center transition-transform active:scale-95 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Tutor Portal</span>
                </Link>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-slate-900 bg-emerald-50/70 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
              >
                <span>Curriculum Courses</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white">
                  New
                </span>
              </Link>

              <Link
                href="/tutors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
              >
                Find Tutors
              </Link>
              <Link
                href="/tutors?category=tajweed-al-quran"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
              >
                &bull; Quran &amp; Tajweed Tutors
              </Link>
              <Link
                href="/tutors?category=matric-ssc-science"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 transition-colors"
              >
                &bull; School &amp; College Academics
              </Link>
              <Link
                href="/tutors?category=o-level-cambridge"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 transition-colors"
              >
                &bull; Cambridge O &amp; A Levels
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 hover:bg-emerald-50 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/safety"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Safety &amp; Privacy (Female Protection)</span>
              </Link>
              <Link
                href="/contact-us"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 transition-colors"
              >
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>Need Help? Contact Support</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-support-platform'));
                  }
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-100 active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Support Platform</span>
                </div>
                <QrCode className="w-4 h-4 text-emerald-700" />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  href={isTutor ? '/tutor/messages' : isStudent ? '/student/messages' : '/admin/chats'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Messages &amp; Discussions</span>
                  </div>
                  {unreadMessagesCount > 0 ? (
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-full animate-pulse">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">0 unread</span>
                  )}
                </Link>

                <Link
                  href={getDashboardRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{isAdmin ? 'Admin Portal' : isTutor ? 'Tutor Portal' : 'Student Portal'}</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </header>
    {/* Spacer so page content flows seamlessly below fixed header */}
    <div className="h-14 sm:h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
