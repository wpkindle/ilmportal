'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  MessageSquare,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const notificationCtx = useNotifications();
  const [unreadMsgCount, setUnreadMsgCount] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.getConversations();
        if (res?.success && res.conversations) {
          const total = res.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMsgCount(total);
        }
      } catch (e) {}
    };
    fetchUnread();
  }, [user, pathname]);

  const unreadCount = unreadMsgCount || notificationCtx?.unreadCount || 0;

  // Hide completely on live video classroom pages for full screen immersion
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  // Determine role-specific navigation items
  let navItems = [];

  if (!user) {
    navItems = [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Find Tutors', href: '/tutors', icon: Compass },
      { label: 'Courses', href: '/courses', icon: BookOpen },
      { label: 'Student', href: '/login?role=student', icon: GraduationCap },
      { label: 'Teach', href: '/register/tutor', icon: ShieldCheck, highlight: true }
    ];
  } else if (user.role === 'student') {
    navItems = [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Tutors', href: '/tutors', icon: Compass },
      { 
        label: 'Messages', 
        href: '/student/messages', 
        icon: MessageSquare,
        badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null 
      },
      { label: 'My Classes', href: '/student/deals', icon: Calendar },
      { label: 'Dashboard', href: '/student/dashboard', icon: User }
    ];
  } else if (user.role === 'tutor') {
    navItems = [
      { label: 'Home', href: '/', icon: Home },
      { 
        label: 'Messages', 
        href: '/tutor/messages', 
        icon: MessageSquare,
        badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null 
      },
      { label: 'My Deals', href: '/tutor/deals', icon: Layers },
      { label: 'Courses', href: '/tutor/courses', icon: BookOpen },
      { label: 'Dashboard', href: '/tutor/dashboard', icon: User }
    ];
  } else if (user.role === 'admin') {
    navItems = [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Tutors', href: '/tutors', icon: Compass },
      { label: 'Admin Hub', href: '/admin', icon: ShieldCheck, highlight: true }
    ];
  }

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-safe"
    >
      <div className="grid grid-cols-5 items-center justify-around h-14 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 transition-all rounded-xl active:scale-90 ${
                isActive 
                  ? 'text-emerald-400 font-bold' 
                  : item.highlight 
                    ? 'text-teal-300 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Indicator Top Dot */}
              {isActive && (
                <span className="absolute top-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative mt-0.5">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-[9px] font-black text-white flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] mt-0.5 leading-tight truncate max-w-[60px] ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
