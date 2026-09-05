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
    instructions: 'Scan with Meezan Bank App or transfer directly to account 96010105435308.'
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    shortName: 'EasyPaisa',
    category: 'Mobile Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    qrImage: '/images/qr-easypaisa.jpg',
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
      {/* 1. Floating Support Platform Pill Button */}
      <div className={`fixed z-40 transition-all ${
        isChatRoute
          ? 'hidden md:block md:bottom-6 md:left-6'
          : 'bottom-20 left-3 sm:left-6 md:bottom-6 md:left-6'
      }`}>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Support the Platform"
          className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 min-h-[44px] rounded-full shadow-[0_8px_30px_rgba(12,34,23,0.5)] bg-[#0c2217] hover:bg-[#143d2b] text-[#f5f0e6] border-2 border-[#d4a359]/40 hover:border-[#d4a359] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl cursor-pointer group"
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a359] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4a359]"></span>
          </span>
          <QrCode className="w-4 h-4 text-[#d4a359]" />
          <span className="text-xs font-bold tracking-tight text-white">Support Platform</span>
          <span className="hidden sm:inline text-[10px] font-mono text-[#d4a359] bg-[#143d2b] px-2 py-0.5 rounded-full border border-[#d4a359]/40">
            Sadaqah Jariyah
          </span>
          <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        </button>
      </div>

      {/* 2. Full Modal Dialog with All 4 Payment Barcodes */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#07150e]/85 backdrop-blur-md animate-in fade-in duration-200">
          
          {/* Modal Container with Editorial Styling */}
          <div
            className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-3xl bg-[#0c2217] border-2 border-[#d4a359]/40 shadow-2xl shadow-[#040e09] text-[#f5f0e6] relative animate-in zoom-in-95 duration-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Warm Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359] z-20" />

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#143d2b] flex items-center justify-between shrink-0 bg-[#0c2217]/95 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40">
                  <Heart className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-white leading-tight">
                    Support IlmiDunya Pakistan
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#d4a359] font-medium">
                    Sadaqah Jariyah &bull; Platform Server &amp; Verification Fund
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
                className="p-2 rounded-full text-[#a3b8b0] hover:text-white hover:bg-[#143d2b] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              
              {/* Payment Method Selector Tabs */}
              <div>
                <p className="text-[11px] font-bold text-[#d4a359] uppercase tracking-wider mb-2">
                  Select Transfer Method:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {paymentMethods.map((method) => {
                    const isSelected = activeTab === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setActiveTab(method.id)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#b85d34] border-[#d4a359] text-white shadow-lg shadow-black/40 ring-1 ring-[#d4a359]'
                            : 'bg-[#143d2b]/60 border-[#d4a359]/20 text-[#a3b8b0] hover:bg-[#143d2b] hover:text-white'
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs font-black block leading-tight text-white">
                          {method.shortName}
                        </span>
                        <span className="text-[9px] text-[#a3b8b0] font-medium block">
                          {method.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Method Display Card */}
              <div className="rounded-2xl bg-[#07150e] border border-[#d4a359]/40 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-4 shadow-inner">
                
                {/* QR Code Frame */}
                <div className="p-2.5 bg-white rounded-2xl shadow-xl border-2 border-[#d4a359]/40 shrink-0 relative group">
                  <img
                    key={selectedMethod.id}
                    src={selectedMethod.qrImage}
                    alt={`${selectedMethod.name} QR Code`}
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                  />
                  
                  {/* Traditional Viewfinder Corners */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#b85d34] pointer-events-none" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#b85d34] pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#b85d34] pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#b85d34] pointer-events-none" />
                </div>

                {/* Details Box */}
                <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
                  
                  {/* Method Header Badge */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#143d2b] border border-[#d4a359]/40 text-[#d4a359]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>{selectedMethod.name}</span>
                  </div>

                  {/* Account Title */}
                  <div className="p-2.5 rounded-xl bg-[#143d2b]/80 border border-[#d4a359]/40 text-left">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-[#d4a359]">
                      Account Title
                    </p>
                    <p className="text-xs sm:text-sm font-black text-white mt-0.5 tracking-wide font-serif">
                      {selectedMethod.accountTitle}
                    </p>
                  </div>

                  {/* Account Number with 1-Click Copy */}
                  <div className="p-2.5 rounded-xl bg-[#0c2217] border border-[#d4a359]/60 text-left flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-[#a3b8b0]">
                        {selectedMethod.id === 'meezan' ? 'Account Number' : 'Account Number / Raast ID'}
                      </p>
                      <p className="text-xs sm:text-sm font-black text-[#d4a359] mt-0.5 font-mono tracking-wider truncate">
                        {selectedMethod.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethod.accountNumber, `active-${selectedMethod.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#b85d34] hover:bg-[#9e4e2a] active:scale-95 text-white text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer border border-[#d4a359]/40"
                      title="Copy Account Number"
                    >
                      {copiedText === `active-${selectedMethod.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-300" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instructions */}
                  <p className="text-[11px] text-[#a3b8b0] leading-snug">
                    {selectedMethod.instructions}
                  </p>
                </div>

              </div>

              {/* Direct Account Numbers Quick Ledger */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#143d2b]/50 border border-[#d4a359]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4a359]">
                      Direct Transfer Ledger
                    </span>
                  </div>
                  <span className="text-[10px] text-[#a3b8b0] font-semibold">Title: Abdul Khaliq</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Meezan Bank */}
                  <div className="p-2.5 rounded-xl bg-[#0c2217] border border-[#d4a359]/30 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[#a3b8b0] text-[9px] font-bold block uppercase tracking-wide">Meezan Bank</span>
                      <span className="font-mono font-black text-white text-xs">96010105435308</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('96010105435308', 'summary-meezan')}
                      className="p-1.5 hover:bg-[#143d2b] rounded-lg text-[#d4a359] transition-colors cursor-pointer shrink-0"
                      title="Copy Meezan Bank Account"
                    >
                      {copiedText === 'summary-meezan' ? (
                        <Check className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Wallets */}
                  <div className="p-2.5 rounded-xl bg-[#0c2217] border border-[#d4a359]/30 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[#a3b8b0] text-[9px] font-bold block uppercase tracking-wide">EasyPaisa / JazzCash / UPaisa</span>
                      <span className="font-mono font-black text-white text-xs">03171759093</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('03171759093', 'summary-wallets')}
                      className="p-1.5 hover:bg-[#143d2b] rounded-lg text-[#d4a359] transition-colors cursor-pointer shrink-0"
                      title="Copy Mobile Wallet Number"
                    >
                      {copiedText === 'summary-wallets' ? (
                        <Check className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Purpose & Impact Assurance */}
              <div className="p-3 rounded-2xl bg-[#143d2b]/40 border border-[#d4a359]/40 text-[11px] text-[#d1dbd6] flex items-start gap-2.5 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
                <span>
                  <strong>Sadaqah Jariyah Impact:</strong> 100% of community contributions fund low-latency WebRTC servers, secure browser storage, and zero-fee Sanad credential verifications for female teachers across Pakistan.
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-[#143d2b] flex items-center justify-between shrink-0 bg-[#0c2217]/95 z-10">
              <span className="text-[11px] text-[#a3b8b0] font-medium hidden sm:inline">
                Abdul Khaliq &bull; Meezan Bank &amp; Mobile Wallets
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] border border-[#d4a359]/40 text-xs font-bold text-white transition-all cursor-pointer text-center"
              >
                Close Dialog
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
