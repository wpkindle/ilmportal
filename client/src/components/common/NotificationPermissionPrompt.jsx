'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationPermissionPrompt() {
  const { permissionStatus, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Only prompt if permission is 'default' (not granted, not denied)
    if (typeof window !== 'undefined' && permissionStatus === 'default') {
      const isDismissed = sessionStorage.getItem('ilmportal_notif_prompt_dismissed');
      if (!isDismissed) {
        // Slight delay on landing so it feels gentle and non-intrusive
        const timer = setTimeout(() => setDismissed(false), 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setDismissed(true);
    }
  }, [permissionStatus]);

  const handleAllow = async () => {
    await requestPermission();
    setDismissed(true);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('ilmportal_notif_prompt_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed || permissionStatus !== 'default') return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md text-[#141c19] p-4 rounded-3xl shadow-2xl border-2 border-[#d4a359]/60 flex items-start gap-3 relative">
        <div className="p-2.5 bg-[#f5f0e6] text-[#b85d34] rounded-2xl border border-[#d4a359]/40 shrink-0 mt-0.5">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b85d34] bg-[#f5f0e6] px-2 py-0.5 rounded-full border border-[#d4a359]/40">
              Live Alerts
            </span>
            <span className="text-xs font-bold text-[#0c2217]">Enable Notifications?</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Get instant sound alerts when verified tutors reply to your messages, send trial offers, or start live classes.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleAllow}
              className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Allow Notifications
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

