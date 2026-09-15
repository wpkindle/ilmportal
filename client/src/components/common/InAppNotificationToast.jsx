'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Bell, BellRing, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function InAppNotificationToast() {
  const router = useRouter();
  const { toastAlert, clearToast, permissionStatus, requestPermission } = useNotifications();
  const { user } = useAuth();
  const [showPermPrompt, setShowPermPrompt] = useState(false);

  // Show OS permission prompt for admin if not yet granted/denied
  useEffect(() => {
    if (
      user?.role === 'admin' &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      // Slight delay so it doesn't pop immediately on page load
      const t = setTimeout(() => setShowPermPrompt(true), 3500);
      return () => clearTimeout(t);
    }
  }, [user]);

  const handleGrantPermission = async () => {
    await requestPermission();
    setShowPermPrompt(false);
  };

  const isAdmin = user?.role === 'admin';
  const isMessage = toastAlert?.type === 'new_message';
  const targetUrl = toastAlert?.link || (
    user?.role === 'tutor' ? '/tutor/messages' :
    user?.role === 'admin' ? '/admin' :
    '/student/messages'
  );

  const handleOpen = () => {
    if (clearToast) clearToast();
    if (targetUrl && targetUrl !== '#') {
      router.push(targetUrl);
    }
  };

  return (
    <>
      {/* OS Notification Permission Prompt — Admin only */}
      {showPermPrompt && (
        <aside
          aria-label="Enable browser notifications"
          className="fixed top-4 right-4 z-[60] max-w-sm w-[calc(100%-2rem)] sm:w-88 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
        >
          <div className="p-4 rounded-2xl bg-[#0c2217] text-white border border-[#d4a359]/60 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359]" />
            <button
              type="button"
              onClick={() => setShowPermPrompt(false)}
              className="absolute top-2.5 right-2.5 p-1 text-white/50 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="p-2 rounded-xl bg-[#d4a359]/20 border border-[#d4a359]/40 shrink-0 mt-0.5">
                <BellRing className="w-4 h-4 text-[#d4a359]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-[#faf8f5]">Enable Admin Alerts</p>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Get OS browser notifications even when you're on another tab — so you never miss a tutor signup, report, or support request.
                </p>
                <button
                  type="button"
                  onClick={handleGrantPermission}
                  className="mt-2 px-3 py-1.5 bg-[#d4a359] hover:bg-[#c29048] text-[#0c2217] font-black text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Allow Notifications
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* In-App Toast Alert */}
      {toastAlert && (
        <aside
          aria-label="Notification Alert"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-96 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto"
        >
          <div
            onClick={handleOpen}
            className={`p-4 rounded-2xl bg-white/95 text-[#141c19] border-2 shadow-2xl backdrop-blur-xl cursor-pointer transition-all group relative overflow-hidden ${
              isAdmin && !isMessage
                ? 'border-amber-400/70 hover:border-amber-500'
                : 'border-[#d4a359]/60 hover:border-[#b85d34]'
            }`}
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              isAdmin && !isMessage
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400'
                : 'bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359]'
            }`} />

            {/* Dismiss X */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (clearToast) clearToast();
              }}
              className="absolute top-2.5 right-2.5 p-1 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors z-10 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              {/* Avatar / Icon */}
              <div className="relative shrink-0 mt-0.5">
                {isAdmin && !isMessage ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                  </div>
                ) : (
                  <img
                    src={toastAlert.senderAvatar || '/icon.png'}
                    alt="Sender"
                    className="w-10 h-10 rounded-xl object-cover border border-[#d4a359]/40 shadow-sm"
                    onError={(e) => { e.target.src = '/icon.png'; }}
                  />
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${
                  isAdmin && !isMessage ? 'bg-amber-500' : 'bg-[#b85d34]'
                }`} />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isAdmin && !isMessage ? 'text-amber-600' : 'text-[#b85d34]'
                  }`}>
                    {isAdmin && !isMessage
                      ? 'Admin Alert'
                      : toastAlert.senderRole === 'tutor'
                      ? 'Message from Tutor'
                      : toastAlert.senderRole === 'student'
                      ? 'Message from Student'
                      : (isMessage ? 'New Chat Message' : 'Notification')}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-[#0c2217] truncate mt-0.5">
                  {toastAlert.title || 'New Notification'}
                </h4>

                <p className="text-xs text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                  {toastAlert.message || 'You have a new notification on IlmiDunya.'}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
                    isAdmin && !isMessage
                      ? 'text-amber-600 group-hover:text-amber-700'
                      : 'text-[#b85d34] group-hover:text-[#9e4e2a]'
                  }`}>
                    <span>{isMessage ? 'Open in Chat' : 'View'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
