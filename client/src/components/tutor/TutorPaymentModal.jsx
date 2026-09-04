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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../../services/api';
import CustomSelect from '../common/CustomSelect';

const paymentAccounts = [
  {
    id: 'meezan',
    title: 'Meezan Bank (Islamic)',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '96010105435308',
    type: 'Bank Transfer / IBAN',
    badge: 'Preferred',
    color: 'from-green-700 to-emerald-700',
    // Meezan QR placeholder (replace with real QR image URL or import)
    qrInfo: 'IBAN: PK00MEZN0001960101054353'
  },
  {
    id: 'easypaisa',
    title: 'EasyPaisa',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    type: 'Mobile Wallet',
    color: 'from-green-600 to-lime-600',
    qrInfo: 'Send to: 0317-1759093'
  },
  {
    id: 'jazzcash',
    title: 'JazzCash',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    type: 'Mobile Wallet',
    color: 'from-red-600 to-orange-600',
    qrInfo: 'Send to: 0317-1759093'
  },
  {
    id: 'raast',
    title: 'Raast Instant',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    type: 'State Bank Raast ID',
    color: 'from-blue-600 to-indigo-600',
    qrInfo: 'Raast ID: 0317-1759093'
  }
];

export default function TutorPaymentModal({ deal, isOpen, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('meezan');
  const [referenceCode, setReferenceCode] = useState('');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');
  const [expandedQr, setExpandedQr] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen || !deal) return null;

  // Auto-calculated fee: 10% of deal price (or admin-assigned custom fee)
  const platformFee = deal.platformFee !== null && deal.platformFee !== undefined
    ? deal.platformFee
    : Math.round((deal.price || 0) * 0.10);

  const isAutoFee = deal.platformFeeNotes?.includes('Auto-calculated') || 
                    (deal.platformFee === null || deal.platformFee === undefined);

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
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be under 5MB.');
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
    if (!referenceCode.trim()) {
      setError('Please provide the Transaction ID (TID) / reference code.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.submitPaymentProof(
        deal._id,
        { paymentMethod, referenceCode: referenceCode.trim(), notes: notes.trim() },
        proofImage
      );

      if (res.success) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSuccess(false);
          setReferenceCode('');
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

  const selectedAccount = paymentAccounts.find(a => a.id === paymentMethod) || paymentAccounts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-100 text-emerald-800 rounded-xl sm:rounded-2xl shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">
                Pay Platform Fee
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">

          {success ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2.5 my-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-black text-emerald-950 text-base">
                Payment Proof Submitted!
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Transaction ID <strong>{referenceCode}</strong>{proofImage ? ' + screenshot' : ''} sent to admin. Classroom access will be cleared shortly.
              </p>
            </div>
          ) : (
            <form id="tutor-fee-modal-form" onSubmit={handleSubmit} className="space-y-4">

              {/* ── Fee Amount Banner ── */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Percent className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                        Platform Fee Due
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {isAutoFee
                          ? `10% of deal price (PKR ${deal.price?.toLocaleString()})`
                          : 'Admin-assigned custom fee'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-emerald-900 text-xl">
                      PKR {platformFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Payment Method Select ── */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Payment Method
                </label>
                <CustomSelect
                  options={[
                    { value: 'meezan', label: 'Meezan Bank Transfer', sublabel: '96010105435308' },
                    { value: 'easypaisa', label: 'EasyPaisa Mobile Wallet', sublabel: '0317-1759093' },
                    { value: 'jazzcash', label: 'JazzCash Mobile Wallet', sublabel: '0317-1759093' },
                    { value: 'raast', label: 'Raast Instant Transfer', sublabel: '0317-1759093' }
                  ]}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  variant="filter"
                />
              </div>

              {/* ── Payment Details + QR ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Payment Details
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold">Tap number to copy</span>
                </div>

                {/* All accounts list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {paymentAccounts.map((acc) => (
                    <div key={acc.id} className="rounded-xl border border-slate-200 overflow-hidden">
                      {/* Account header row */}
                      <div
                        onClick={() => handleCopy(acc.accountNumber, acc.id)}
                        className="p-2.5 bg-slate-50 hover:bg-emerald-50/60 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-[11px]">{acc.title}</span>
                          {acc.badge && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[8.5px] rounded">
                              {acc.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">Title: {acc.accountTitle}</p>
                        <div className="flex items-center justify-between pt-1 font-mono font-bold text-emerald-800 text-[11.5px]">
                          <span>{acc.accountNumber}</span>
                          {copiedId === acc.id
                            ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                            : <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />}
                        </div>
                      </div>

                      {/* QR Code toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedQr(expandedQr === acc.id ? null : acc.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border-t border-slate-100 text-[10px] font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          {expandedQr === acc.id ? 'Hide QR / Details' : 'Show QR / Details'}
                        </span>
                        {expandedQr === acc.id
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* QR expanded panel */}
                      {expandedQr === acc.id && (
                        <div className="p-3 bg-white border-t border-slate-100 text-center space-y-2">
                          {/* QR Code visual (text-based barcode style with border) */}
                          <div className="mx-auto w-28 h-28 bg-white border-2 border-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {/* Styled QR representation */}
                            <div className="w-24 h-24 grid grid-cols-6 grid-rows-6 gap-0.5 p-1">
                              {/* Top-left finder */}
                              <div className="col-span-2 row-span-2 border-2 border-slate-800 rounded-sm" />
                              {/* Top-right finder */}
                              <div className="col-start-5 col-span-2 row-span-2 border-2 border-slate-800 rounded-sm" />
                              {/* Bottom-left finder */}
                              <div className="col-span-2 row-start-5 row-span-2 border-2 border-slate-800 rounded-sm" />
                              {/* Center icon */}
                              <div className="col-start-3 col-span-2 row-start-3 row-span-2 flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-slate-700" />
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 rounded px-2 py-1">
                            {acc.qrInfo}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Open your banking app → Scan QR or enter number manually
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 text-right">
                  Admin Helpline: 0317 1759093 &bull; 0315 4453745
                </p>
              </div>

              {/* ── Screenshot Upload ── */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Payment Screenshot <span className="text-emerald-600 font-bold">(Recommended)</span>
                </label>

                {proofPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50">
                    <img
                      src={proofPreview}
                      alt="Payment proof"
                      className="w-full max-h-48 object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-2 flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {proofImage?.name} ({(proofImage?.size / 1024).toFixed(0)} KB)
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/40 rounded-xl p-4 text-center transition-all cursor-pointer group"
                  >
                    <ImageIcon className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 mx-auto mb-1.5 transition-colors" />
                    <p className="text-xs font-semibold text-slate-600 group-hover:text-emerald-800">
                      Upload payment screenshot
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, WEBP &bull; max 5MB
                    </p>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              {/* ── Error ── */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {error}
                </div>
              )}

              {/* ── Transaction ID ── */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Transaction ID (TID) / Reference Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JC992817291 or Bank Ref 01054353"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              {/* ── Sender Notes ── */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sender Account / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transferred from 0300-1234567"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 shrink-0 bg-slate-50/90 flex items-center justify-between gap-2.5">
            <span className="text-[10px] text-slate-500 font-semibold hidden sm:block">
              Fee: <span className="text-emerald-700 font-black">PKR {platformFee.toLocaleString()}</span>
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
                disabled={submitting || !referenceCode.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Proof</span>
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
