'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  MapPin,
  Handshake,
  MessageSquare,
  Star,
  Video,
  History,
  Settings,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

const AdminSidebar = () => {
  const pathname = usePathname();
  const { socket } = useSocket();
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  const fetchReportCounts = async () => {
    try {
      const res = await api.getReports({ status: 'pending' });
      if (res.success) {
        setPendingReportsCount(res.count || (res.reports ? res.reports.length : 0));
      }
    } catch (e) {
      // Silently catch
    }
  };

  useEffect(() => {
    fetchReportCounts();
  }, [pathname]);

  // Socket listener for new reports
  useEffect(() => {
    if (!socket) return;
    const handleAlert = (data) => {
      if (data?.type === 'safety_report') {
        fetchReportCounts();
      }
    };
    socket.on('notification-alert', handleAlert);
    return () => socket.off('notification-alert', handleAlert);
  }, [socket]);

  const navItems = [
    { to: '/admin', label: 'Analytics & Overview', icon: LayoutDashboard, exact: true },
    { to: '/admin/users', label: 'Users & Moderation', icon: Users },
    {
      to: '/admin/reports',
      label: 'Incident & Safety Reports',
      icon: AlertTriangle,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    { to: '/admin/tutor-approvals', label: 'Tutor Approval Queue', icon: UserCheck },
    { to: '/admin/categories', label: 'CMS Categories & Subjects', icon: BookOpen },
    { to: '/admin/locations', label: 'CMS Cities & Locations', icon: MapPin },
    { to: '/admin/deals', label: 'Deals & Payment Verification', icon: Handshake },
    { to: '/admin/chats', label: 'Chat Oversight Transcripts', icon: MessageSquare },
    { to: '/admin/reviews', label: 'Ratings & Reviews Control', icon: Star },
    { to: '/admin/sessions', label: 'Session & Classroom Logs', icon: Video },
    { to: '/admin/audit-logs', label: 'Audit Trail Logs', icon: History },
    { to: '/admin/settings', label: 'System & Trial Settings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 flex flex-col justify-between self-start">
      <div className="space-y-6">
        
        {/* Admin Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 bg-purple-900/50 text-purple-400 rounded-2xl border border-purple-700/50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white">Admin Center</h3>
            <p className="text-[10px] text-purple-300 font-mono">Full Control & Audit</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor || 'bg-rose-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>

      <div className="pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-500 px-2">
        <p className="font-semibold text-slate-400">IlmPortal Core v1.0</p>
        <p>Real-time audit logging active</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
