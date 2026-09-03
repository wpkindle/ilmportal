'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  X,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Smartphone,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import CustomSelect from '../common/CustomSelect';

const paymentAccounts = [
  {
    id: 'meezan',
    title: 'Meezan Bank (Islamic)',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '96010105435308',
    type: 'Bank Account / IBAN',
    badge: 'Preferred'
  },
  {
    id: 'easypaisa',
    title: 'EasyPaisa Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    type: 'Mobile Wallet'
  },
  {
    id: 'jazzcash',
    title: 'JazzCash Wallet',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    type: 'Mobile Wallet'
  },
  {
    id: 'raast',
    title: 'Raast Instant ID',
    accountTitle: 'Abdul Khaliq',
    accountNumber: '03171759093',
    type: 'State Bank Raast'
  }
];

export default function TutorPaymentModal({ deal, isOpen, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('meezan');
  const [referenceCode, setReferenceCode] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !deal) return null;

  const handleCopy = (text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
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
      const res = await api.submitPaymentProof(deal._id, {
        paymentMethod,
        referenceCode: referenceCode.trim(),
        notes: notes.trim()
      });

      if (res.success) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSuccess(false);
          setReferenceCode('');
          setNotes('');
          onClose();
        }, 2200);
      } else {
        setError(res.message || 'Error submitting payment proof');
      }
    } catch (err) {
      setError(err.message || 'Network error submitting payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  const hasAssignedFee = deal.platformFee !== null && deal.platformFee !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden">
        
        {/* Header - Fixed at Top */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-100 text-emerald-800 rounded-xl sm:rounded-2xl shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">
                Tutor Platform Fee Clearance
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

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Success State */}
          {success ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2.5 my-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-black text-emerald-950 text-base">
                Platform Fee Proof Submitted!
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your Transaction ID (<strong>{referenceCode}</strong>) has been submitted to the administration. Your classroom access clearance will be verified shortly.
              </p>
            </div>
          ) : (
            <form id="tutor-fee-modal-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Fee summary banner */}
              <div className="p-3 sm:p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase text-emerald-800 tracking-wider block">
                    Platform Fee Amount
                  </span>
                  <p className="text-[11px] text-slate-600 truncate">
                    {hasAssignedFee
                      ? '72-hour clearance policy for continuation'
                      : 'Pending admin assessment (call 0317 1759093)'}
                  </p>
                </div>
                <span className="font-mono font-black text-emerald-900 text-base sm:text-lg whitespace-nowrap">
                  {hasAssignedFee ? `PKR ${deal.platformFee.toLocaleString()}` : 'Awaiting Fee Assessment'}
                </span>
              </div>

              {/* Official Bank / Wallet Accounts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Official IlmPortal Payment Accounts:
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold">Tap to copy</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {paymentAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => handleCopy(acc.accountNumber, acc.id)}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1 hover:border-emerald-300 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-[11px] truncate">
                          {acc.title}
                        </span>
                        {acc.badge && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold text-[8.5px] rounded shrink-0">
                            {acc.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Title: {acc.accountTitle}
                      </p>
                      <div className="flex items-center justify-between pt-0.5 font-mono font-bold text-emerald-800 text-[11.5px]">
                        <span>{acc.accountNumber}</span>
                        <span className="text-slate-400 group-hover:text-emerald-700">
                          {copiedId === acc.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 text-right">
                  Admin Support: 0317 1759093 &bull; 0315 4453745
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {error}
                </div>
              )}

              {/* Payment Method Select */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Method Used
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

              {/* Transaction ID / Reference Code */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Transaction ID (TID) / Reference Number *
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

              {/* Additional Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sender Account / Notes (Optional)
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

        {/* Footer - Fixed/Sticky at Bottom */}
        {!success && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 shrink-0 bg-slate-50/90 flex items-center justify-end gap-2.5">
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
                  <span>Submitting Proof...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Platform Fee Proof</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

