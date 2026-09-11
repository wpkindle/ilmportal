'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, X, ArrowRight, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function InAppNotificationToast() {
  const router = useRouter();
  const { toastAlert, clearToast } = useNotifications();
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
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-96 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto"
    >
      <div 
        onClick={handleOpen}
        className="p-4 rounded-2xl bg-white/95 text-[#141c19] border-2 border-[#d4a359]/60 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-[#b85d34] transition-all group relative overflow-hidden"
      >
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359]" />

        {/* Dismiss X Button */}
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
            <img
              src={toastAlert.senderAvatar || '/icon.png'}
              alt="Sender"
              className="w-10 h-10 rounded-xl object-cover border border-[#d4a359]/40 shadow-sm"
              onError={(e) => { e.target.src = '/icon.png'; }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#b85d34] border-2 border-white rounded-full" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#b85d34] uppercase tracking-wider">
                {toastAlert.senderRole === 'tutor'
                  ? 'Message from Tutor'
                  : toastAlert.senderRole === 'student'
                  ? 'Message from Student'
                  : (isMessage ? 'New Chat Message' : 'Notification')}
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-[#0c2217] truncate mt-0.5">
              {toastAlert.title || 'Incoming Message'}
            </h4>

            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
              {toastAlert.message || 'You received a new message on IlmiDunya.'}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b85d34] group-hover:text-[#9e4e2a] transition-colors">
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

