'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Smartphone,
  Send,
  X,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Lock,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';

export default function StudentPaymentRequestModal({
  paymentRequest,
  deal,
  isOpen,
  onClose,
  onSuccess
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [senderAccountTitle, setSenderAccountTitle] = useState(paymentRequest?.paymentProof?.senderAccountTitle || '');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(paymentRequest?.paymentProof?.proofImageUrl || null);
  const [notes, setNotes] = useState(paymentRequest?.paymentProof?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);
  const fileInputRef = useRef(null);

  const methods = paymentRequest?.paymentMethods || [];

  useEffect(() => {
    if (methods.length > 0 && !selectedMethod) {
      setSelectedMethod(methods[0].method);
    }
  }, [methods]);

  // Countdown timer for 3-day threshold
  useEffect(() => {
    if (!paymentRequest?.dueDate) return;

    const calculateTime = () => {
      const due = new Date(paymentRequest.dueDate).getTime();
      const now = Date.now();
      const diff = due - now;

      if (diff <= 0) {
        setIsOverdue(true);
        setTimeRemaining('Threshold expired • Live classes restricted');
      } else {
        setIsOverdue(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [paymentRequest]);

  if (!isOpen || !paymentRequest) return null;

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG, WebP) for the payment proof.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Proof image exceeds the 10MB limit. Please select a smaller screenshot.');
      return;
    }

    setError('');
    setProofImage(file);
    const url = URL.createObjectURL(file);
    setProofPreview(url);
  };

  const handleClearProofImage = () => {
    if (proofPreview && proofPreview.startsWith('blob:')) {
      URL.revokeObjectURL(proofPreview);
    }
    setProofImage(null);
    setProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!senderAccountTitle.trim()) {
      setError('Please provide the Sender Account Title / Name used for the transfer.');
      return;
    }

    if (!proofImage && !proofPreview) {
      setError('Please upload a screenshot proof of your transfer.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('method', selectedMethod || 'bank');
      formData.append('senderAccountTitle', senderAccountTitle.trim());
      formData.append('notes', notes.trim());
      if (proofImage) {
        formData.append('proofImage', proofImage);
      } else if (proofPreview) {
        formData.append('proofImageUrl', proofPreview);
      }

      const res = await api.submitPaymentRequestProof(paymentRequest._id, formData);

      if (res.success) {
        setSuccess('Payment proof submitted successfully! Your tutor will review and clear it.');
        if (onSuccess) onSuccess(res.paymentRequest);
      } else {
        setError(res.message || 'Error submitting payment proof');
      }
    } catch (err) {
      setError(err.message || 'Error submitting payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  const currentMethod = methods[activeTab] || methods[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-auto flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/40 shrink-0">
              <CreditCard className="w-5 h-5 text-[#b85d34]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Pay Tuition Fee
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  PKR {paymentRequest.amount?.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tutor: <strong className="text-slate-800">{paymentRequest.tutor?.name || deal?.tutor?.name}</strong> &bull; {deal?.subject || paymentRequest.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Day Countdown & Restriction Alert */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            paymentRequest.status === 'cleared'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isOverdue
              ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {paymentRequest.status === 'cleared' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : isOverdue ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div>
              <div className="font-bold">
                {paymentRequest.status === 'cleared'
                  ? 'Payment Cleared & Classes Active'
                  : isOverdue
                  ? '3-Day Threshold Expired (Classes Restricted)'
                  : '3-Day Payment Threshold'}
              </div>
              <div className="text-[11px] opacity-80">
                {paymentRequest.status === 'cleared'
                  ? 'Your tutor has cleared this tuition fee.'
                  : isOverdue
                  ? 'Please submit payment proof immediately so your tutor can clear it and restore video access.'
                  : `Please transfer fee within 3 days. Status: ${timeRemaining}`}
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ${
              paymentRequest.status === 'cleared'
                ? 'bg-emerald-600 text-white'
                : isOverdue
                ? 'bg-rose-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {paymentRequest.status === 'cleared'
              ? 'CLEARED'
              : isOverdue
              ? 'RESTRICTED'
              : timeRemaining.split(' ')[0]}
          </span>
        </div>

        {/* Tutor's Payment Accounts Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Tutor&apos;s Verified Payment Methods:
            </span>
            <span className="text-[11px] text-slate-500">
              Choose an account to transfer fee
            </span>
          </div>

          {methods.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
              No specific payment accounts listed by tutor. Please coordinate via chat.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Account Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {methods.map((m, idx) => (
                  <button
                    key={m._id || idx}
                    type="button"
                    onClick={() => {
                      setActiveTab(idx);
                      setSelectedMethod(m.method);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      activeTab === idx
                        ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="uppercase">{m.method}</span>
                    {m.method === 'bank' && m.bankName ? ` (${m.bankName.split(' ')[0]})` : ''}
                    {m.isDefault ? ' ★' : ''}
                  </button>
                ))}
              </div>

              {/* Selected Account Box */}
              {currentMethod && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                      {currentMethod.method === 'bank' ? currentMethod.bankName || 'Bank Transfer' : `${currentMethod.method.toUpperCase()} WALLET`}
                    </span>
                    {currentMethod.isDefault && (
                      <span className="text-[10px] font-bold text-[#b85d34] bg-[#f0ece1] px-2 py-0.5 rounded">
                        Tutor&apos;s Preferred Method
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Account Title:</span>
                      <strong className="text-slate-900 text-sm font-semibold">{currentMethod.accountTitle}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        {currentMethod.method === 'raast' ? 'Raast ID:' : currentMethod.method === 'bank' ? 'Account Number / IBAN:' : 'Mobile Number:'}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-xs tracking-wider">
                          {currentMethod.accountNumber}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentMethod.accountNumber, currentMethod._id || 'acc')}
                          className="px-2.5 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          {copiedId === (currentMethod._id || 'acc') ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#d4a359]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {currentMethod.instructions && (
                      <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200/60 mt-1">
                        Tutor note: {currentMethod.instructions}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status or Proof Form */}
        {paymentRequest.status === 'cleared' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tuition Fee Cleared by Tutor</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Your payment of PKR {paymentRequest.amount?.toLocaleString()} has been verified and cleared by {paymentRequest.tutor?.name || 'your tutor'}. Live video classes are unrestricted.
            </p>
          </div>
        ) : paymentRequest.status === 'proof_submitted' && !success ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-xs text-amber-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Proof Submitted &bull; Pending Tutor Clearance</span>
              </div>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-amber-200 font-bold uppercase">
                {paymentRequest.paymentProof?.method || 'Direct Transfer'}
              </span>
            </div>
            <p className="text-[11px] text-amber-800">
              Sender Account: <strong>{paymentRequest.paymentProof?.senderAccountTitle || 'Student'}</strong> &bull; Submitted on {new Date(paymentRequest.paymentProof?.submittedAt).toLocaleDateString()}. Your tutor has been notified to verify and clear the payment.
            </p>

            {paymentRequest.paymentProof?.proofImageUrl && (
              <div className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={paymentRequest.paymentProof.proofImageUrl}
                    alt="Uploaded Proof"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Proof Screenshot Uploaded</p>
                    <a
                      href={paymentRequest.paymentProof.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10.5px] text-[#b85d34] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>View Full Screenshot</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => setProofPreview(null)}
                className="text-[11px] text-[#b85d34] hover:text-[#9e4e2a] font-bold underline cursor-pointer"
              >
                Need to re-upload or update payment proof?
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProofSubmit} className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Submit Payment Proof to Tutor</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Payment Method Used *
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-semibold"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="raast">Raast Instant ID</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="upaisa">UPaisa</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Sender Account Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdullah Khan or Fatimah Zahra"
                  value={senderAccountTitle}
                  onChange={(e) => setSenderAccountTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c2217]"
                />
              </div>
            </div>

            {/* Screenshot Upload Dropzone */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Payment Screenshot / Receipt Proof *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="tuition-proof-screenshot-input"
              />

              {proofPreview ? (
                <div className="relative p-2 bg-slate-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {proofImage?.name || 'Payment Proof Screenshot'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Screenshot attached {proofImage ? `(${(proofImage.size / 1024).toFixed(1)} KB)` : ''}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearProofImage}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Remove Screenshot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="tuition-proof-screenshot-input"
                  className="border-2 border-dashed border-slate-200 hover:border-[#b85d34] bg-slate-50 hover:bg-amber-50/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-center group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-[#b85d34] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to Upload Screenshot Proof
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Supports PNG, JPG, JPEG, WebP (Max 10MB)
                  </span>
                </label>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Transferred via Meezan app to your EasyPaisa"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c2217]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{submitting ? 'Submitting Proof...' : 'Submit Payment Proof'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

