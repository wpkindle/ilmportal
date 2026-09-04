'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Award,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfileCompletionMeter from '../../components/common/ProfileCompletionMeter';

export default function StudentLayout({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isProfilePage = pathname === '/student/profile';
  const isChatPage = pathname?.startsWith('/student/messages');

  const navTabs = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Course Deals', href: '/student/deals', icon: BookOpen },
    { label: 'Messages & Class', href: '/student/messages', icon: MessageSquare },
    { label: 'Certificates', href: '/student/certificates', icon: Award },
    { label: 'Profile & Safety', href: '/student/profile', icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-[#d4a359]/30">
      {/* Student Portal Sub-Navigation Header */}
      <div className="bg-white border-b border-[#e6dfd5] sticky top-16 md:top-20 z-30 shadow-[0_2px_12px_rgba(12,34,23,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-2 border-b border-[#f3ede2]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0c2217] text-[#d4a359] flex items-center justify-center font-serif text-base font-bold shadow-xs">
                ط
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#143d2b] bg-[#eef5f0] px-2 py-0.5 rounded-md border border-[#c3dfcb]">
                    Student Portal
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Female Privacy Protected
                  </span>
                </div>
                <h2 className="text-sm font-serif font-bold text-stone-900 leading-tight">
                  {user?.name ? `${user.name}’s Learning Space` : 'Talib-e-Ilm Workspace'}
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct WebRTC Classrooms &bull; Zero Personal Phone Sharing</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#0c2217] text-[#faf8f5] shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-[#f3ede2]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#d4a359]' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Completion Meter */}
      {!isProfilePage && !isChatPage && user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 -mb-2 w-full">
          <ProfileCompletionMeter user={user} />
        </div>
      )}

      {/* Main Page Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
