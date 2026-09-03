'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Heart,
  QrCode,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const paymentMethods = [
  {
    id: 'meezan',
    name: 'Meezan Bank',
    shortName: 'Meezan Bank',
    category: 'Islamic Banking',
    accountTitle: 'Abdul Khaliq',
    qrImage: '/images/qr-meezan.jpg',
    color: 'from-purple-600 to-emerald-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    instructions: 'Scan with Meezan Bank Mobile App or any Raast-enabled banking scanner.'
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    shortName: 'EasyPaisa',
    category: 'Mobile Wallet',
    accountTitle: 'Abdul Khaliq',
    qrImage: '/images/qr-easypaisa.jpg',
    color: 'from-emerald-600 to-green-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    instructions: 'Scan with EasyPaisa App or any Raast-enabled QR scanner.'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    shortName: 'JazzCash',
    category: 'Mobile Wallet',
    accountTitle: 'Abdul Khaliq',
    qrImage: '/images/qr-jazzcash.jpg',
    color: 'from-red-600 to-amber-600',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    instructions: 'Scan with JazzCash App or any 1Link/Raast QR scanner.'
  },
  {
    id: 'upaisa',
    name: 'UPaisa / UBank',
    shortName: 'UPaisa',
    category: 'Microfinance Bank',
    accountTitle: 'Abdul Khaliq',
    qrImage: '/images/qr-upaisa.jpg',
    color: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    instructions: 'Scan with UPaisa / UBank App or any Raast QR scanner.'
  }
];

export default function SupportPlatformWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('meezan');

  // Listen for global open-support-platform custom event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-support-platform', handleOpen);
    return () => window.removeEventListener('open-support-platform', handleOpen);
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
      {/* 1. Floating Support Platform Pill Button (Consistent bottom-left on all devices) */}
      <div className="fixed bottom-20 left-3 sm:left-6 md:bottom-5 md:left-6 z-40 transition-all">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Support the Platform"
          className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 min-h-[44px] rounded-full shadow-[0_4px_20px_rgba(5,150,105,0.45)] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl cursor-pointer"
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
          </span>
          <QrCode className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold tracking-tight">Support Platform</span>
          <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-400" />
        </button>
      </div>

      {/* 2. Full Modal Dialog with All 4 Payment Barcodes */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          
          {/* Modal Container */}
          <div
            className="w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl shadow-emerald-950/80 text-white relative animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Gradient Shimmer */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Heart className="w-5 h-5 fill-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-white leading-tight">
                    Support Our Platform
                  </h3>
                  <p className="text-xs text-emerald-300 font-medium">
                    Sadaqah Jariyah & Platform Contribution
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

            <div className="p-5 sm:p-6 pt-4 space-y-5">
              
              {/* Payment Method Tabs */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  Select Payment Method:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {paymentMethods.map((method) => {
                    const isSelected = activeTab === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setActiveTab(method.id)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? `${method.bgColor} ${method.borderColor} text-white shadow-lg shadow-black/40 ring-1 ring-emerald-400`
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-extrabold block leading-tight">{method.shortName}</span>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          {method.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Payment Method Display Card */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                
                {/* QR Code Frame */}
                <div className="p-2.5 bg-white rounded-2xl shadow-2xl border-2 border-emerald-400/80 shrink-0 relative group">
                  <img
                    key={selectedMethod.id}
                    src={selectedMethod.qrImage}
                    alt={`${selectedMethod.name} Barcode`}
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg animate-in fade-in duration-300"
                  />
                  
                  {/* QR Corner Viewfinder Accents */}
                  <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-emerald-600 pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-emerald-600 pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-emerald-600 pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-emerald-600 pointer-events-none" />
                </div>

                {/* Details & Clean Account Title Display */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  
                  {/* Bank Header Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/10 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedMethod.name}</span>
                  </div>

                  {/* Clean Static Account Title */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-left shadow-inner">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                      Account Title
                    </p>
                    <p className="text-base font-black text-white mt-0.5 tracking-wide">
                      {selectedMethod.accountTitle}
                    </p>
                  </div>

                  {/* Instructions */}
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {selectedMethod.instructions}
                  </p>
                </div>

              </div>

              {/* Thank You Note */}
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  JazakAllah Khair for supporting verified Quran & academic tutoring across Pakistan.
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
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
