'use client';

import React, { useState, useRef } from 'react';
import {
  CreditCard,
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Upload,
  ImageIcon,
  Trash2,
  Percent,
  QrCode,
  ScanLine,
  Building2,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';

const paymentAccounts = [
  {
    id: 'meezan',
    name: 'Meezan Bank',
    fullTitle: 'Meezan Bank (Islamic)',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '96010105435308',
    raastId: '03171759093',
    badge: 'Recommended',
    qrImage: '/images/qr-meezan.jpg',
    qrNote: 'Scan Meezan QR or transfer to Account: 96010105435308'
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    fullTitle: 'EasyPaisa Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    raastId: '03171759093',
    qrImage: '/images/qr-easypaisa.jpg',
    qrNote: 'Scan EasyPaisa QR or send to: 0317-1759093'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    fullTitle: 'JazzCash Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    raastId: '03171759093',
    qrImage: '/images/qr-jazzcash.jpg',
    qrNote: 'Scan JazzCash QR or send to: 0317-1759093'
  },
  {
    id: 'upaisa',
    name: 'UPaisa / Raast',
    fullTitle: 'UPaisa & Raast Instant ID',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    raastId: '03171759093',
    qrImage: '/images/qr-upaisa.jpg',
    qrNote: 'Scan UPaisa QR or send via Raast to: 0317-1759093'
  }
];

export default function TutorPaymentModal({ deal, isOpen, onClose, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('meezan');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !deal) return null;

  // Auto-calculated fee: 10% of deal price (or admin-assigned custom fee)
  const platformFee = deal.platformFee !== null && deal.platformFee !== undefined
    ? deal.platformFee
    : Math.round((deal.price || 0) * 0.10);

  const isAutoFee = deal.platformFeeNotes?.includes('Auto-calculated') ||
                    (deal.platformFee === null || deal.platformFee === undefined);

  const activeAccount = paymentAccounts.find(a => a.id === selectedMethod) || paymentAccounts[0];

  const handleCopy = (text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Screenshot must be under 8MB.');
      return;
    }
    setProofImage(file);
    setProofPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemoveImage = () => {
    setProofImage(null);
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofImage) {
      setError('Please attach your payment screenshot proof before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.submitPaymentProof(
        deal._id,
        {
          paymentMethod: selectedMethod,
          referenceCode: 'Screenshot Proof Attached',
          notes: notes.trim()
        },
        proofImage
      );

      if (res.success) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSuccess(false);
          setNotes('');
          setProofImage(null);
          setProofPreview(null);
          onClose();
        }, 2500);
      } else {
        setError(res.message || 'Error submitting payment proof');
      }
    } catch (err) {
      setError(err.message || 'Network error submitting payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg md:max-w-4xl lg:max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] overflow-hidden">

        {/* Modal Header - Pinned at top */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-stone-200 shrink-0 bg-white z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0c2217] text-[#d4a359] rounded-xl sm:rounded-2xl shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-[#0c2217] text-sm sm:text-base truncate">
                Clear Platform Fee
              </h3>
              <p className="text-[10.5px] sm:text-xs text-stone-500 truncate">
                Student: <strong>{deal.student?.name}</strong> &bull; {deal.subject}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content - flex-1 min-h-0 ensures it properly scrolls within bounds */}
        <div className="p-3 sm:p-4 md:p-5 overflow-y-auto flex-1 min-h-0">

          {/* Success Notification */}
          {success ? (
            <div className="p-8 bg-[#f0ece1] rounded-3xl border border-[#d4a359]/40 text-center space-y-3 my-6 max-w-md mx-auto">
              <CheckCircle2 className="w-16 h-16 text-[#0c2217] mx-auto animate-bounce" />
              <h4 className="font-serif font-bold text-[#0c2217] text-lg">
                Payment Screenshot Submitted!
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Your payment screenshot has been sent directly to administration. Your classroom access will be cleared shortly.
              </p>
            </div>
          ) : (
            <form id="tutor-fee-modal-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:gap-5 items-start">

                {/* ── Left Column: Payment Method & Barcode Details ── */}
                <div className="space-y-2.5">
                  {/* Payment Method Selector Tabs */}
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                      <ScanLine className="w-3.5 h-3.5 text-[#0c2217]" />
                      <span>Select Payment Method &amp; View Barcode:</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-stone-100 rounded-xl">
                      {paymentAccounts.map((acc) => {
                        const isSelected = selectedMethod === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => setSelectedMethod(acc.id)}
                            className={`py-1.5 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                              isSelected
                                ? 'bg-[#0c2217] text-[#d4a359] shadow-xs border border-[#0c2217]'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                            }`}
                          >
                            {acc.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prominent Barcode & Account Display */}
                  <div className="p-2.5 sm:p-3 bg-[#faf8f5] border border-stone-200 rounded-2xl space-y-2">
                    {/* Clear Account Details Card */}
                    <div className="p-2 sm:p-2.5 bg-white border border-stone-200 rounded-xl space-y-1.5 shadow-2xs">
                      {/* Account Title */}
                      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block">
                            Account Title
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-stone-900 select-all">
                            {activeAccount.accountTitle}
                          </span>
                        </div>
                        {activeAccount.badge ? (
                          <span className="px-2 py-0.5 bg-[#f0ece1] text-[#0c2217] text-[10px] font-bold rounded-md border border-[#d4a359]/40">
                            {activeAccount.badge}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-bold rounded-md border border-stone-200">
                            {activeAccount.name}
                          </span>
                        )}
                      </div>

                      {/* Primary Account Number */}
                      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block">
                            Account Number
                          </span>
                          <span className="font-mono text-xs sm:text-sm font-bold text-[#0c2217] select-all truncate block">
                            {activeAccount.accountNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeAccount.accountNumber, activeAccount.id)}
                          className="px-2 py-1 bg-[#faf8f5] hover:bg-[#f0ece1] border border-[#d4a359]/40 rounded-lg text-[10.5px] sm:text-xs font-mono font-bold text-[#0c2217] flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                          {copiedId === activeAccount.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#0c2217]" />
                              <span className="text-[#0c2217] font-sans">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#0c2217]" />
                              <span className="font-sans">Copy Number</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Raast ID Number with Copy Button */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block">
                            Raast ID Number
                          </span>
                          <span className="font-mono text-xs sm:text-sm font-bold text-stone-900 select-all truncate block">
                            {activeAccount.raastId || '03171759093'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeAccount.raastId || '03171759093', 'raast-id')}
                          className="px-2 py-1 bg-[#faf8f5] hover:bg-[#f0ece1] border border-[#d4a359]/40 rounded-lg text-[10.5px] sm:text-xs font-mono font-bold text-[#0c2217] flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                          {copiedId === 'raast-id' ? (
                            <>
                              <Check className="w-3 h-3 text-[#0c2217]" />
                              <span className="text-[#0c2217] font-sans">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-500" />
                              <span className="font-sans text-[10.5px] sm:text-xs">Copy Raast ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* The Barcode Image (Optimized compact sizing for responsive height) */}
                    <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-xl border-2 border-[#d4a359]/40 p-1 shadow-xs flex items-center justify-center">
                      <img
                        src={activeAccount.qrImage}
                        alt={`${activeAccount.name} Barcode / QR Code`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Scan Notice Below Image */}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#f0ece1] text-[#0c2217] rounded-full text-[10px] font-bold border border-[#d4a359]/40">
                        <ScanLine className="w-3 h-3 text-[#0c2217]" />
                        <span>Scan barcode with your {activeAccount.name} app</span>
                      </div>
                    </div>

                    <p className="text-[9.5px] sm:text-[10px] text-stone-500 leading-tight text-center">
                      Open your banking/wallet app to scan this barcode, or transfer directly via account number / Raast ID.
                    </p>
                  </div>
                </div>

                {/* ── Right Column: Fee Due & Proof Upload ── */}
                <div className="space-y-2.5">
                  {/* Fee Amount Banner */}
                  <div className="p-2.5 sm:p-3 bg-[#faf8f5] border border-[#d4a359]/30 rounded-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0c2217] text-[#d4a359] flex items-center justify-center shrink-0 shadow-xs">
                          <Percent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase text-[#0c2217] tracking-wider block font-serif truncate">
                            Platform Fee Due
                          </span>
                          <p className="text-[10px] sm:text-[10.5px] text-stone-600 truncate">
                            {isAutoFee
                              ? `10% of deal price (PKR ${deal.price?.toLocaleString()})`
                              : 'Admin assigned fee'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-[#0c2217] text-xl sm:text-2xl">
                          PKR {platformFee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Proof Upload */}
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1 flex items-center gap-1.5 font-serif">
                      <ImageIcon className="w-3.5 h-3.5 text-[#0c2217]" />
                      <span>Upload Payment Screenshot Proof *</span>
                    </label>

                    {proofPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#d4a359]/40 bg-[#faf8f5] p-2 flex flex-col items-center gap-1.5">
                        <img
                          src={proofPreview}
                          alt="Payment proof screenshot"
                          className="max-h-28 sm:max-h-36 w-full object-contain rounded-xl bg-white border border-stone-200 shadow-2xs"
                        />
                        <div className="w-full flex items-center justify-between text-xs pt-0.5">
                          <div className="flex items-center gap-1.5 text-[#0c2217] font-bold truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0c2217] shrink-0" />
                            <span className="truncate text-xs">{proofImage?.name}</span>
                            <span className="text-[10px] text-stone-500 font-normal shrink-0">
                              ({(proofImage?.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#d4a359]/50 hover:border-[#0c2217] bg-[#faf8f5] hover:bg-[#f0ece1] rounded-2xl p-3 sm:p-3.5 text-center transition-all cursor-pointer group"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0c2217] text-[#d4a359] flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform shadow-xs">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-[11.5px] sm:text-xs font-bold text-stone-800 group-hover:text-[#0c2217]">
                          Tap here to upload payment screenshot
                        </p>
                        <p className="text-[9.5px] sm:text-[10px] text-stone-500 mt-0.5">
                          Screenshot from bank / EasyPaisa / JazzCash app (JPG, PNG, WEBP)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>

                  {/* Optional Sender Notes */}
                  <div>
                    <label className="text-[10px] sm:text-[10.5px] font-bold text-stone-600 block mb-0.5">
                      Sender Account / Notes <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Transferred from 0300-1234567 or Meezan account"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                      {error}
                    </div>
                  )}

                  <div className="p-1.5 sm:p-2 bg-[#faf8f5] rounded-xl border border-stone-200 text-center">
                    <p className="text-[9.5px] sm:text-[10px] text-stone-500">
                      Need assistance? Official Support: <a href="mailto:contact@ilmportal.org" className="text-[#b85d34] underline font-bold">contact@ilmportal.org</a>
                    </p>
                  </div>
                </div>

              </div>
            </form>
          )}

        </div>

        {/* Modal Footer (Pinned at bottom, fully responsive) */}
        {!success && (
          <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-stone-200 shrink-0 bg-[#faf8f5] z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="text-[11px] sm:text-xs text-stone-600 font-medium text-center sm:text-left truncate">
              Fee Due: <strong className="text-[#0c2217] font-bold">PKR {platformFee.toLocaleString()}</strong> &bull; Student: <strong className="text-stone-800">{deal.student?.name}</strong>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 sm:py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="tutor-fee-modal-form"
                disabled={submitting || !proofImage}
                className="flex-1 sm:flex-initial px-4 py-1.5 sm:py-2 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#874121] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Submit Screenshot Proof</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
