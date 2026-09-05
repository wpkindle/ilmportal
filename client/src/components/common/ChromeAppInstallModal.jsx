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
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center bg-[#07150e]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#faf8f5] rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-[#e6dfd5] relative overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#e6dfd5] flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0c2217] border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] shadow-md shrink-0">
              <Chrome className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a359] bg-[#143d2b] border border-[#d4a359]/40 px-2 py-0.5 rounded-full">
                  Google Chrome App
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Fast &amp; Offline Ready</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0c2217] mt-0.5">
                Install IlmiDunya App
              </h2>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-stone-400 hover:text-[#0c2217] rounded-full hover:bg-[#f4efe8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#d4a359]/40 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#0c2217] mx-auto" />
              <h4 className="font-serif font-bold text-sm text-[#0c2217]">App Already Installed!</h4>
              <p className="text-xs text-stone-600">
                You are currently enjoying IlmiDunya as a desktop/mobile standalone app with instant notifications.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Install IlmiDunya directly to your desktop or phone home screen for 1-click access, low-latency live video classes, and background notifications.
              </p>

              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] border border-[#d4a359]/40 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#0c2217]/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-[#d4a359]" />
                <span>{deferredPrompt ? '1-Click Install Chrome App' : 'How to Install Chrome App'}</span>
              </button>

              {/* Step-by-step instructions */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#0c2217]">
                  How to Install in 5 Seconds:
                </h3>

                <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd5] flex items-start gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] text-[#0c2217] shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-serif font-bold text-[#0c2217]">On Chrome Desktop (Windows / Mac / Linux)</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Look at the right end of your Chrome address bar and click the <strong className="text-[#0c2217]">Install App</strong> icon (⭳), or click <strong className="text-[#0c2217]">Chrome Menu (︙) &gt; Cast, save, share &gt; Install IlmiDunya</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#e6dfd5] flex items-start gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] text-[#0c2217] shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-serif font-bold text-[#0c2217]">On Android / Mobile Chrome</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Tap Chrome Menu (<strong className="text-[#0c2217]">︙</strong>) in the top right, then select <strong className="text-[#0c2217]">&quot;Add to Home screen&quot;</strong> or <strong className="text-[#0c2217]">&quot;Install App&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#e6dfd5] bg-white/70 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">100% Free PWA &bull; Fast &amp; Offline Ready</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#f4efe8] hover:bg-[#eae3d8] text-[#0c2217] border border-[#e6dfd5] font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

