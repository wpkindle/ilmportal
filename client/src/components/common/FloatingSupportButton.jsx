'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headphones, X, MessageSquare, Phone, Mail, Sparkles } from 'lucide-react';

const FloatingSupportButton = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide completely on live video classroom pages
  if (pathname?.startsWith('/classroom')) {
    return null;
  }

  const whatsappNumber = '923001234567';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Assalam-o-Alaikum, I need assistance with IlmPortal.')}`;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end">
      {/* Expanded Support Card / Popover */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-4 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">IlmPortal Support</h4>
                <p className="text-[10px] text-emerald-400 font-medium">Lahore Administration Help Desk</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close support dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Need help finding a verified tutor, setting up free trials, or resolving a query? Our support team is here to help!
          </p>

          <div className="space-y-1.5 pt-1">
            {/* WhatsApp Direct Action */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl text-xs font-bold transition-all shadow-md group"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span>WhatsApp Helpline</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                Instant 🟢
              </span>
            </a>

            {/* Direct Phone Helpline */}
            <a
              href="tel:+924235897860"
              className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white rounded-2xl text-xs font-semibold transition-all border border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Helpline</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">+92 42 3589-7860</span>
            </a>

            {/* Online Contact Form */}
            <Link
              href="/contact-us"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-700 active:scale-98 text-slate-300 hover:text-white rounded-2xl text-xs font-semibold transition-all border border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>Contact &amp; Inquiry Form</span>
              </div>
              <span className="text-emerald-400 text-xs font-bold">&rarr;</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Circular / Pill Floating Support Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-3.5 py-3 min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-full shadow-[0_4px_20px_rgba(5,150,105,0.45)] border border-emerald-400/40 transition-all cursor-pointer"
        aria-label="Support and Helpline"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200" />
        </span>
        <Headphones className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        <span className="font-bold tracking-tight">Support</span>
      </button>
    </div>
  );
};

export default FloatingSupportButton;

