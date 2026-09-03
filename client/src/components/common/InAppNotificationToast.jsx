'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, X, ArrowRight, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function InAppNotificationToast() {
  const router = useRouter();
  const { toastAlert, permissionStatus, requestPermission } = useNotifications();
  const { user } = useAuth();

  if (!toastAlert) return null;

  const isMessage = toastAlert.type === 'new_message';
  const targetUrl = toastAlert.link || (user?.role === 'tutor' ? '/tutor/messages' : '/student/messages');

  const handleOpen = () => {
    if (targetUrl && targetUrl !== '#') {
      router.push(targetUrl);
    }
  };

  return (
    <aside
      aria-label="New Message Notification"
      className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-96 animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div 
        onClick={handleOpen}
        className="p-4 rounded-2xl bg-slate-900/95 text-white border border-emerald-500/50 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-emerald-400 transition-all group relative overflow-hidden"
      >
        {/* Top emerald accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300" />

        <div className="flex items-start gap-3">
          {/* Avatar / Icon */}
          <div className="relative shrink-0 mt-0.5">
            <img
              src={toastAlert.senderAvatar || '/icon.png'}
              alt="Sender"
              className="w-10 h-10 rounded-xl object-cover border border-emerald-400/40 shadow-sm"
              onError={(e) => { e.target.src = '/icon.png'; }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {isMessage ? 'New Chat Message' : 'Notification'}
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-white truncate mt-0.5">
              {toastAlert.title || 'Incoming Message'}
            </h4>

            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {toastAlert.message || 'You received a new message on IlmPortal.'}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">
                <span>Open in Chat</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

