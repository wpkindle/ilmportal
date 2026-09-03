'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Heart,
  QrCode,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  CreditCard
} from 'lucide-react';

const paymentMethods = [
  {
    id: 'meezan',
    name: 'Meezan Bank',
    shortName: 'Meezan Bank',
    category: 'Islamic Banking',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '96010105435308',
    qrImage: '/images/qr-meezan.jpg',
    color: 'from-purple-600 to-emerald-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    instructions: 'Scan with Meezan Bank Mobile App or transfer directly to account number 96010105435308.'
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    shortName: 'EasyPaisa',
    category: 'Mobile Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    qrImage: '/images/qr-easypaisa.jpg',
    color: 'from-emerald-600 to-green-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    instructions: 'Scan with EasyPaisa App or send money directly to 03171759093.'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    shortName: 'JazzCash',
    category: 'Mobile Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    qrImage: '/images/qr-jazzcash.jpg',
    color: 'from-red-600 to-amber-600',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    instructions: 'Scan with JazzCash App or transfer directly to 03171759093.'
  },
  {
    id: 'upaisa',
    name: 'UPaisa / UBank',
    shortName: 'UPaisa',
    category: 'Microfinance Bank',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    qrImage: '/images/qr-upaisa.jpg',
    color: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    instructions: 'Scan with UPaisa App or transfer directly to 03171759093.'
  }
];

export default function SupportPlatformWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('meezan');
  const [copiedText, setCopiedText] = useState(null);

  const handleCopy = (text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2200);
    }
  };

  // Listen for global open-support-platform custom events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-support-platform', handleOpen);
    window.addEventListener('ilmportal:open-support', handleOpen);
    return () => {
      window.removeEventListener('open-support-platform', handleOpen);
      window.removeEventListener('ilmportal:open-support', handleOpen);
    };
  }, []);

  const isAdminRoute = pathname?.startsWith('/admin');
  const isChatRoute = pathname?.includes('/messages');

  // If on admin or classroom routes, do not render support widget
  if (isAdminRoute || pathname?.startsWith('/classroom')) {
    return null;
  }

  const selectedMethod = paymentMethods.find((m) => m.id === activeTab) || paymentMethods[0];

  return (
    <>
      {/* 1. Floating Support Platform Pill Button (Desktop always, mobile hidden on /messages to keep input bar completely clear) */}
      <div className={`fixed z-40 transition-all ${
        isChatRoute
          ? 'hidden md:block md:bottom-5 md:left-6'
          : 'bottom-20 left-3 sm:left-6 md:bottom-5 md:left-6'
      }`}>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Support the Platform"
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px] rounded-full shadow-[0_4px_20px_rgba(5,150,105,0.45)] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl cursor-pointer"
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
          </span>
          <QrCode className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold tracking-tight">Support Platform</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
        </button>
      </div>

      {/* 2. Full Modal Dialog with All 4 Payment Barcodes */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          
          {/* Modal Container with Fixed Header/Footer and Scrollable Body */}
          <div
            className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl shadow-emerald-950/90 text-white relative animate-in zoom-in-95 duration-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Gradient Shimmer */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 z-20" />

            {/* Modal Header (Fixed) */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/95 z-10">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                    Support Our Platform
                  </h3>
                  <p className="text-[11px] sm:text-xs text-emerald-300 font-medium">
                    Sadaqah Jariyah &amp; Platform Contribution
                  </p>
                </div>
              </div>

              {/* Close Button (X) */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable with Smooth Momentum) */}
            <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              
              {/* Payment Method Tabs */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                  Select Payment Method:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {paymentMethods.map((method) => {
                    const isSelected = activeTab === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setActiveTab(method.id)}
                        className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? `${method.bgColor} ${method.borderColor} text-white shadow-lg shadow-black/40 ring-1 ring-emerald-400`
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs font-extrabold block leading-tight">{method.shortName}</span>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          {method.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Payment Method Display Card */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4">
                
                {/* QR Code Frame */}
                <div className="p-2 bg-white rounded-2xl shadow-xl border-2 border-emerald-400/80 shrink-0 relative group">
                  <img
                    key={selectedMethod.id}
                    src={selectedMethod.qrImage}
                    alt={`${selectedMethod.name} Barcode`}
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg animate-in fade-in duration-300"
                  />
                  
                  {/* QR Corner Viewfinder Accents */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-600 pointer-events-none" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-600 pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-600 pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-600 pointer-events-none" />
                </div>

                {/* Details & Account Title + Number Display */}
                <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
                  
                  {/* Bank Header Badge */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/10 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedMethod.name}</span>
                  </div>

                  {/* Clean Static Account Title */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-left shadow-inner">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-400">
                      Account Title
                    </p>
                    <p className="text-xs sm:text-sm font-black text-white mt-0.5 tracking-wide">
                      {selectedMethod.accountTitle}
                    </p>
                  </div>

                  {/* Account Number with 1-Click Copy */}
                  <div className="p-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/50 text-left shadow-inner flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-400">
                        Account / Mobile Number
                      </p>
                      <p className="text-xs sm:text-sm font-black text-emerald-200 mt-0.5 font-mono tracking-wider truncate">
                        {selectedMethod.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethod.accountNumber, `active-${selectedMethod.id}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-md"
                      title="Copy Account Number"
                    >
                      {copiedText === `active-${selectedMethod.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instructions */}
                  <p className="text-[11px] text-slate-300 font-medium leading-tight">
                    {selectedMethod.instructions}
                  </p>
                </div>

              </div>

              {/* Direct Account Numbers Quick Summary */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Direct Transfer Account Numbers</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Title: Abdul Khaliq</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Meezan Bank */}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 hover:border-purple-500/40 transition-colors">
                    <div>
                      <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wide">Meezan Bank</span>
                      <span className="font-mono font-black text-white text-xs">96010105435308</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('96010105435308', 'summary-meezan')}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer shrink-0"
                      title="Copy Meezan Bank Account Number"
                    >
                      {copiedText === 'summary-meezan' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* EasyPaisa, JazzCash, UPaisa */}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 hover:border-emerald-500/40 transition-colors">
                    <div>
                      <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wide">EasyPaisa / JazzCash / UPaisa</span>
                      <span className="font-mono font-black text-white text-xs">03171759093</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('03171759093', 'summary-wallets')}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer shrink-0"
                      title="Copy Mobile Wallet Number"
                    >
                      {copiedText === 'summary-wallets' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Thank You Note */}
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  JazakAllah Khair for supporting verified Quran &amp; academic tutoring across Pakistan.
                </span>
              </div>

            </div>

            {/* Modal Footer (Fixed at Bottom) */}
            <div className="p-3 sm:p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-slate-900/95 z-10">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Abdul Khaliq &bull; Meezan Bank &amp; Wallets
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer text-center"
              >
                Done / Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
