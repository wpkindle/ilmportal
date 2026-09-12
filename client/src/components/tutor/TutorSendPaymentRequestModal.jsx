'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Building2,
  Smartphone,
  Send,
  X,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export default function TutorSendPaymentRequestModal({
  deal,
  isOpen,
  onClose,
  onSuccess
}) {
  const isPending = deal?.latestPaymentRequest?.status === 'pending';
  const [amount, setAmount] = useState(deal?.latestPaymentRequest?.amount || deal?.price || '');
  const [title, setTitle] = useState(deal?.latestPaymentRequest?.title || `Monthly Tuition Fee - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`);
  const [description, setDescription] = useState(deal?.latestPaymentRequest?.description || '');
  const [tutorPaymentMethods, setTutorPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(deal?.latestPaymentRequest?.amount || deal?.price || '');
      setTitle(deal?.latestPaymentRequest?.title || `Monthly Tuition Fee - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`);
      setDescription(deal?.latestPaymentRequest?.description || `Tuition fee for ${deal?.subject || 'learning classes'}.`);
      setError('');
      setSuccessNotice(false);
      fetchTutorPaymentMethods();
    }
  }, [isOpen, deal]);

  const fetchTutorPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.getPaymentMethods();
      if (res.success && Array.isArray(res.paymentMethods)) {
        setTutorPaymentMethods(res.paymentMethods);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoadingMethods(false);
    }
  };

  if (!isOpen || !deal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid tuition fee amount in PKR.');
      return;
    }

    if (tutorPaymentMethods.length === 0) {
      setError('You have not configured any receiving payment methods. Please add your Bank, Raast, EasyPaisa, JazzCash, or UPaisa account first.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createPaymentRequest({
        dealId: deal._id,
        amount: numAmount,
        title: title.trim(),
        description: description.trim()
      });

      if (res.success) {
        setSuccessNotice(true);
        if (onSuccess) onSuccess(res.paymentRequest);
        setTimeout(() => {
          onClose();
          setSuccessNotice(false);
        }, 1200);
      } else {
        setError(res.message || 'Failed to dispatch payment request.');
      }
    } catch (err) {
      setError(err.message || 'Error sending payment request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-auto flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/30 shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#b85d34]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 truncate">
                Request Tuition Fee
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Student: <strong className="text-slate-800">{deal.student?.name}</strong> &bull; {deal.subject}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 pt-2">
          <div className="overflow-y-auto pr-1 sm:pr-1.5 space-y-3 sm:space-y-3.5 flex-1 min-h-0">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-2.5 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-950">{isPending ? 'Payment Request Updated!' : 'Payment Request Dispatched!'}</h4>
                  <p className="text-[11px] text-emerald-800">
                    Student has been notified with your accounts and a 3-day (72-hour) payment countdown.
                  </p>
                </div>
              </div>
            )}

            {/* If pending already, show existing request status */}
            {isPending && !successNotice && (
              <div className="p-3 sm:p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-1.5 text-xs text-amber-950 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                    <span>Payment Request Active &bull; Pending Student</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                    Pending
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  You requested <strong>PKR {Number(deal.latestPaymentRequest.amount || 0).toLocaleString()}</strong> on{' '}
                  {new Date(deal.latestPaymentRequest.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.
                </p>
                <p className="text-[11px] text-amber-800">
                  Student has received your receiving accounts. You can edit and re-send the request below if you need to update the amount or notes.
                </p>
              </div>
            )}

            {/* Strict 3-day Threshold Information Notice */}
            <div className="p-3 sm:p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl space-y-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Strict 3-Day (72-Hour) Payment Threshold</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your student will be notified immediately to transfer the tuition fee directly to your receiving accounts. If the payment is not cleared by you within <strong>3 days (72 hours)</strong>, live video classroom sessions will be <strong>restricted</strong> until cleared.
              </p>
            </div>

            {/* Check if tutor has methods */}
            {loadingMethods ? (
              <div className="py-3 text-center text-xs text-slate-400">Loading receiving payment methods...</div>
            ) : tutorPaymentMethods.length === 0 ? (
              <div className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-900">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>No Receiving Payment Methods Found!</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  You must add at least one payment method (Bank, Raast, EasyPaisa, JazzCash, or UPaisa) in your profile settings before requesting fees.
                </p>
                <Link
                  href="/tutor/profile#profile-payment-methods"
                  className="inline-flex items-center gap-1 font-bold text-rose-900 underline text-xs pt-1"
                >
                  <span>Go to Profile Settings to Add Payment Method</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 text-xs">Accounts sent to student:</span>
                  <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {tutorPaymentMethods.length} Active Method{tutorPaymentMethods.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 max-h-32 overflow-y-auto">
                  {tutorPaymentMethods.map((m) => (
                    <div key={m._id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-900 uppercase text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded shrink-0">
                          {m.method}
                        </span>
                        <span className="text-slate-700 font-medium text-[11px] truncate">
                          {m.method === 'bank' ? `${m.bankName} - ${m.accountTitle}` : `${m.accountTitle} (${m.accountNumber})`}
                        </span>
                      </div>
                      {m.isDefault && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#b85d34] bg-[#f0ece1] px-1.5 py-0.5 rounded shrink-0 ml-1">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tuition Fee Amount (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  PKR
                </span>
                <input
                  type="number"
                  required
                  min="500"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 6000"
                  className="w-full pl-14 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-[#0c2217]"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                Agreed deal rate: PKR {deal.price?.toLocaleString()} ({deal.priceUnit?.replace('_', ' ') || 'per month'})
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Request Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Notes for Student (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly tuition fee for upcoming 12 lessons. Please transfer and upload receipt."
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
              />
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            {successNotice ? (
              <div className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{isPending ? 'Request Updated ✓' : 'Request Dispatched ✓'}</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting || tutorPaymentMethods.length === 0}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{submitting ? 'Dispatching...' : isPending ? 'Update & Re-send Request' : 'Dispatch Request (3-Day Limit)'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
