'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  X,
  Sparkles,
  Heart,
  QrCode,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Bell,
  ArrowRight
} from 'lucide-react';

const socialChannels = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Channel',
    handle: 'IlmiDunya Official',
    url: 'https://whatsapp.com/channel/0029VbDT9HCI7Be90yESwo3y',
    badge: 'Fastest Alerts',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Instant tutor announcements, class schedules, and parent educational alerts directly on WhatsApp.',
    cta: 'Join Channel',
    buttonColor: 'bg-[#25D366] hover:bg-[#20ba59] text-white shadow-emerald-500/20',
    icon: (
      <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    )
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    handle: '@ilmidunyapakistan',
    url: 'https://www.facebook.com/ilmidunyapakistan',
    badge: 'Community & Reviews',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Educational articles, featured teacher bios, board exam guidance, and community discussion.',
    cta: 'Follow Page',
    buttonColor: 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-blue-500/20',
    icon: (
      <svg className="w-5 h-5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    )
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@ilmidunya_com',
    url: 'https://www.instagram.com/ilmidunya_com',
    badge: 'Daily Study Reels',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    description: 'Visual Tajweed tips, Quranic verses, quick study routines, and student success highlights.',
    cta: 'Follow @ilmidunya_com',
    buttonColor: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white shadow-pink-500/20',
    icon: (
      <svg className="w-5 h-5 text-pink-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube Channel',
    handle: '@ilmidunyapakistan',
    url: 'https://www.youtube.com/@ilmidunyapakistan',
    badge: 'Lectures & Demos',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    description: 'Video lessons, demo tutoring sessions, Tajweed pronunciation drills, and platform guides.',
    cta: 'Subscribe',
    buttonColor: 'bg-[#FF0000] hover:bg-[#d90000] text-white shadow-red-500/20',
    icon: (
      <svg className="w-5 h-5 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
];

// Pop-up delay: 2 minutes (120,000 ms) after page load
const POPUP_DELAY_MS = 120 * 1000;
// Dismissal memory: 24 hours
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default function SocialUpdatesPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Never display on live classroom session or admin dashboards
    if (pathname?.startsWith('/classroom') || pathname?.startsWith('/admin')) {
      return;
    }

    // Check if dismissed in the last 24 hours
    try {
      const dismissedAt = localStorage.getItem('ilmidunya_social_popup_dismissed_at');
      if (dismissedAt) {
        const timePassed = Date.now() - parseInt(dismissedAt, 10);
        if (timePassed < DISMISS_COOLDOWN_MS) {
          return;
        }
      }
    } catch (e) {
      // Storage access fallback
    }

    // Set timer to trigger after a few minutes of browsing
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, POPUP_DELAY_MS);

    // Also support manual trigger via window event for testing or direct navigation
    const handleManualOpen = () => setIsOpen(true);
    window.addEventListener('open-social-updates', handleManualOpen);
    window.addEventListener('ilmportal:open-social-updates', handleManualOpen);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-social-updates', handleManualOpen);
      window.removeEventListener('ilmportal:open-social-updates', handleManualOpen);
    };
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('ilmidunya_social_popup_dismissed_at', Date.now().toString());
    } catch (e) {}
  };

  const handleOpenSupport = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('ilmidunya_social_popup_dismissed_at', Date.now().toString());
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-support-platform'));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/45 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-3xl bg-white border-2 border-[#d4a359]/70 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold & Emerald Illuminated Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#d4a359] via-[#10b981] to-[#b85d34] z-20" />

        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#faf8f5] via-[#f7f3eb] to-[#f0ece1] border-b border-[#ebe3d3] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close social updates popup"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5 pr-8">
            <div className="p-3 rounded-2xl bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40 shadow-md shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#d4a359]/20 text-[#8f6424] border border-[#d4a359]/40">
                <Sparkles className="w-3 h-3 text-[#d4a359]" />
                <span>Stay Connected &amp; Informed</span>
              </div>
              <h2 id="social-popup-title" className="font-serif font-black text-lg sm:text-xl text-[#0c2217] leading-snug">
                Follow IlmiDunya for Official Announcements &amp; Updates
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Stay updated with verified Quran Qaris, female Alimahs, new academic classes (Grades 1-8, Civics, Political Science &amp; Constitution), and learning tips across our social channels.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          
          {/* Social Channels 2x2 Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {socialChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-[#ebe3d3] hover:border-[#d4a359]/60 hover:shadow-md transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                        {channel.icon}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 leading-tight">
                          {channel.name}
                        </h3>
                        <p className="text-[10px] font-medium text-slate-500">
                          {channel.handle}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${channel.badgeColor}`}>
                      {channel.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {channel.description}
                  </p>
                </div>

                <div className="pt-3 mt-1 border-t border-slate-100">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-xs ${channel.buttonColor}`}
                  >
                    <span>{channel.cta}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Dedicated Support Platform Dialogue Trigger Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#0c2217] via-[#102d20] to-[#07150e] border-2 border-[#d4a359]/70 p-4 sm:p-5 text-white shadow-xl overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#d4a359]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d4a359]/20 text-[#f5d996] border border-[#d4a359]/40">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                  <span>Sadaqah Jariyah &bull; Platform Continuity</span>
                </div>
                <h4 className="font-serif font-black text-sm sm:text-base text-[#faf8f5]">
                  Support IlmiDunya Platform
                </h4>
                <p className="text-[11px] text-[#c4d9ce] leading-relaxed">
                  Help us maintain free listings, manual tutor document verification, and subsidize education for deserving students across Pakistan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenSupport}
                className="shrink-0 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a359] to-[#c29048] hover:from-[#c29048] hover:to-[#b07d37] text-[#0c2217] font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#f5d996]/50"
              >
                <QrCode className="w-4 h-4 text-[#0c2217]" />
                <span>Support Platform Dialogue</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0c2217]" />
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-4 bg-[#faf8f5] border-t border-[#ebe3d3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official IlmiDunya Verification &amp; Security</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}

