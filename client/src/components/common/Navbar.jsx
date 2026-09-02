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
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import PromotionTopBar from './PromotionTopBar';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isTutor, isAdmin } = useAuth();
  const { socket } = useSocket();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subjectsDropdownOpen, setSubjectsDropdownOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const userMenuRef = useRef(null);
  const subjectsRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

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

    const handleNewMessage = () => {
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

    socket.on('new-message', handleNewMessage);
    socket.on('notification-alert', handleNotificationAlert);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('notification-alert', handleNotificationAlert);
    };
  }, [socket, isAuthenticated, pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
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

  return (
    <>
      <PromotionTopBar />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
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
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
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
              /* Unauthenticated Dual Portal Buttons (Student & Tutor) */
              <div className="flex items-center gap-1.5 sm:gap-2">
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

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 px-2 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              <Link
                href="/courses"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-emerald-50/70 hover:bg-emerald-50"
              >
                <span>Curriculum Courses</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white">
                  New
                </span>
              </Link>

              <Link
                href="/tutors"
                className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-emerald-50"
              >
                Find Tutors
              </Link>
              <Link
                href="/tutors?category=tajweed-al-quran"
                className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                &bull; Quran & Tajweed Tutors
              </Link>
              <Link
                href="/tutors?category=matric-ssc-science"
                className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50"
              >
                &bull; School & College Academics
              </Link>
              <Link
                href="/tutors?category=o-level-cambridge"
                className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50"
              >
                &bull; Cambridge O & A Levels
              </Link>
              <Link
                href="/how-it-works"
                className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-emerald-50"
              >
                How It Works
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <Link
                  href={isTutor ? '/tutor/messages' : isStudent ? '/student/messages' : '/admin/chats'}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-emerald-50"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Messages & Discussions</span>
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
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{isAdmin ? 'Admin Portal' : isTutor ? 'Tutor Portal' : 'Student Portal'}</span>
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  href="/login?role=student"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold text-center"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student Portal</span>
                </Link>
                <Link
                  href="/login?role=tutor"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Tutor Portal</span>
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
    </>
  );
};

export default Navbar;
