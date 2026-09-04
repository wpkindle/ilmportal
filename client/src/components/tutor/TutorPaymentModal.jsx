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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-100 text-emerald-800 rounded-xl sm:rounded-2xl shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">
                Clear Platform Fee
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Student: <strong>{deal.student?.name}</strong> &bull; {deal.subject}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">

          {/* Success Notification */}
          {success ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 my-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-black text-emerald-950 text-base">
                Payment Screenshot Submitted!
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                Your payment screenshot has been sent directly to administration. Your classroom access will be cleared shortly.
              </p>
            </div>
          ) : (
            <form id="tutor-fee-modal-form" onSubmit={handleSubmit} className="space-y-4">

              {/* ── Fee Amount Banner (10% Auto Adjusted) ── */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                        Platform Fee Due
                      </span>
                      <p className="text-[11px] text-slate-600">
                        {isAutoFee
                          ? `10% of deal price (PKR ${deal.price?.toLocaleString()})`
                          : 'Admin assigned fee'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-emerald-900 text-xl sm:text-2xl">
                      PKR {platformFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Payment Method Selector Tabs ── */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Payment Method &amp; View Barcode:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                  {paymentAccounts.map((acc) => {
                    const isSelected = selectedMethod === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedMethod(acc.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                          isSelected
                            ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {acc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Prominent Barcode / QR Image Display ── */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                {/* Clear Account Details Card for Manual Transfer & Easy Copy */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                  {/* Account Title without copy button */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                        Account Title
                      </span>
                      <span className="text-sm font-black text-slate-900 select-all">
                        {activeAccount.accountTitle}
                      </span>
                    </div>
                    {activeAccount.badge ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                        {activeAccount.badge}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200">
                        {activeAccount.name}
                      </span>
                    )}
                  </div>

                  {/* Primary Account Number with Copy Button */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                        Account Number
                      </span>
                      <span className="font-mono text-sm sm:text-base font-black text-emerald-800 select-all">
                        {activeAccount.accountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeAccount.accountNumber, activeAccount.id)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-mono font-black text-emerald-800 flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                    >
                      {copiedId === activeAccount.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-sans">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-sans">Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Raast ID Number with Copy Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                        Raast ID Number
                      </span>
                      <span className="font-mono text-sm sm:text-base font-black text-slate-900 select-all">
                        {activeAccount.raastId || '03171759093'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeAccount.raastId || '03171759093', 'raast-id')}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-mono font-black text-slate-800 flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                    >
                      {copiedId === 'raast-id' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-sans">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-sans text-xs">Copy Raast ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* The Barcode Image (Unobstructed, NO overlay on top) */}
                <div className="mx-auto w-52 sm:w-56 h-52 sm:h-56 bg-white rounded-2xl border-2 border-emerald-500/40 p-2 shadow-md flex items-center justify-center">
                  <img
                    src={activeAccount.qrImage}
                    alt={`${activeAccount.name} Barcode / QR Code`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                {/* Scan Notice Below Image */}
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-[11px] font-bold mx-auto border border-emerald-300/80">
                  <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scan barcode with your {activeAccount.name} app</span>
                </div>

                <p className="text-[10.5px] text-slate-500 leading-tight text-center">
                  Open your banking/wallet app to scan this barcode, or copy the account number or Raast ID number above to transfer directly.
                </p>
              </div>

              {/* ── Screenshot Proof Upload (Required, replaces TID box) ── */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload Payment Screenshot Proof *</span>
                </label>

                {proofPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-emerald-50/70 p-3 flex flex-col items-center gap-2">
                    <img
                      src={proofPreview}
                      alt="Payment proof screenshot"
                      className="max-h-48 w-full object-contain rounded-xl bg-white border border-emerald-200 shadow-2xs"
                    />
                    <div className="w-full flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{proofImage?.name}</span>
                        <span className="text-[10px] text-emerald-600 font-normal shrink-0">
                          ({(proofImage?.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-5 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-slate-800 group-hover:text-emerald-900">
                      Tap here to upload payment screenshot
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Screenshot of transaction from your bank / EasyPaisa / JazzCash app (JPG, PNG, WEBP)
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

              {/* ── Optional Sender Notes ── */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Sender Account / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transferred from 0300-1234567 or Meezan account"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* ── Error Display ── */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                  {error}
                </div>
              )}

              <p className="text-[10.5px] text-slate-400 text-center">
                Need assistance? Official Support: <a href="mailto:contact@ilmportal.org" className="text-emerald-700 underline font-semibold">contact@ilmportal.org</a>
              </p>

            </form>
          )}

        </div>

        {/* Modal Footer */}
        {!success && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 shrink-0 bg-slate-50/90 flex items-center justify-between gap-2.5">
            <span className="text-[10.5px] text-slate-500 font-semibold hidden sm:block">
              Fee: <strong className="text-emerald-800 font-black">PKR {platformFee.toLocaleString()}</strong>
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="tutor-fee-modal-form"
                disabled={submitting || !proofImage}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Proof...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
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
