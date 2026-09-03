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
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-emerald-500/30 flex items-start gap-3 relative">
        <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0 mt-0.5">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Alerts
            </span>
            <span className="text-xs font-bold text-white">Enable Notifications?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Get instant sound alerts when verified tutors reply to your messages, send trial offers, or start live classes.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleAllow}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
            >
              Allow Notifications
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

