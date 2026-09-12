'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Copy,
  CreditCard,
  X,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';

export default function TutorClearPaymentModal({
  paymentRequest,
  deal,
  isOpen,
  onClose,
  onSuccess
}) {
  const [clearing, setClearing] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !paymentRequest) return null;

  const proof = paymentRequest.paymentProof || {};

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = async () => {
    setError('');
    try {
      setClearing(true);
      const res = await api.clearPaymentRequest(paymentRequest._id, {
        notes: notes.trim()
      });

      if (res.success) {
        if (onSuccess) onSuccess(res.paymentRequest);
        onClose();
      } else {
        setError(res.message || 'Error clearing payment request');
      }
    } catch (err) {
      setError(err.message || 'Failed to clear payment');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                Verify &amp; Clear Tuition Payment
              </h3>
              <p className="text-[11px] text-slate-500">
                Student: <strong className="text-slate-800">{deal?.student?.name || paymentRequest.student?.name}</strong> &bull; PKR {paymentRequest.amount?.toLocaleString()}
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

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment & Proof Details Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
            <span className="text-xs font-bold text-slate-600">Requested Amount:</span>
            <span className="text-sm font-black text-slate-900">
              PKR {paymentRequest.amount?.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Payment Method:</span>
              <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px]">
                {proof.method || 'Direct Transfer'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Transaction Reference ID:</span>
              <div className="flex items-center gap-1.5">
                <code className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs">
                  {proof.transactionId || 'N/A'}
                </code>
                {proof.transactionId && (
                  <button
                    type="button"
                    onClick={() => handleCopy(proof.transactionId)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy Transaction ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {proof.senderAccountTitle && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Sender Name:</span>
                <span className="font-semibold text-slate-800">{proof.senderAccountTitle}</span>
              </div>
            )}

            {proof.submittedAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Submitted Date:</span>
                <span className="text-slate-700">{new Date(proof.submittedAt).toLocaleString()}</span>
              </div>
            )}

            {proof.notes && (
              <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 italic">
                Student remarks: &ldquo;{proof.notes}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* 3-Day Rule Assurance Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl space-y-1 text-xs">
          <div className="font-bold flex items-center gap-1.5 text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Restore &amp; Maintain Unrestricted Live Classes</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            By clicking &ldquo;Clear Payment&rdquo;, you confirm receiving PKR {paymentRequest.amount?.toLocaleString()}. Live classroom sessions will be fully unrestricted.
          </p>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Verification Remarks (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Received in Meezan Bank account. Thanks!"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{clearing ? 'Clearing...' : 'Clear Payment & Unlock Classes'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

