'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Monitor, Smartphone, CheckCircle2, Chrome, Sparkles } from 'lucide-react';

export default function ChromeAppInstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Chrome className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Google Chrome App
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Fast &amp; Offline Ready</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Install IlmPortal App
            </h2>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-900">App Already Installed!</h4>
            <p className="text-xs text-emerald-700">
              You are currently enjoying IlmPortal as a desktop/mobile standalone app with instant notifications.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Install IlmPortal directly to your desktop or phone home screen for 1-click access, low-latency live video classes, and background notifications.
            </p>

            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>1-Click Install Chrome App</span>
              </button>
            )}

            {/* Step-by-step instructions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                How to Install in 5 Seconds:
              </h3>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-800">On Chrome Desktop (Windows / Mac / Linux)</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Look at the right end of your Chrome address bar and click the <strong className="text-slate-800">Install App</strong> icon (⭳), or click <strong className="text-slate-800">Chrome Menu (︙) &gt; Cast, save, share &gt; Install IlmPortal</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-800">On Android / Mobile Chrome</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Tap Chrome Menu (<strong className="text-slate-800">︙</strong>) in the top right, then select <strong className="text-slate-800">&quot;Add to Home screen&quot;</strong> or <strong className="text-slate-800">&quot;Install App&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

