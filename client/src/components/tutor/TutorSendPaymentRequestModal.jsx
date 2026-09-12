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
  const [amount, setAmount] = useState(deal?.price || '');
  const [title, setTitle] = useState(`Monthly Tuition Fee - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`);
  const [description, setDescription] = useState('');
  const [tutorPaymentMethods, setTutorPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(deal?.price || '');
      setTitle(`Monthly Tuition Fee - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`);
      setDescription(`Tuition fee for ${deal?.subject || 'learning classes'}.`);
      setError('');
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
        if (onSuccess) onSuccess(res.paymentRequest);
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/30">
              <CreditCard className="w-5 h-5 text-[#b85d34]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                Request Tuition Fee
              </h3>
              <p className="text-[11px] text-slate-500">
                Student: <strong className="text-slate-800">{deal.student?.name}</strong> &bull; {deal.subject}
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

        {/* Strict 3-day Threshold Information Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl space-y-2 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Strict 3-Day (72-Hour) Payment Threshold</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Your student will be notified immediately to transfer the tuition fee directly to your receiving accounts. If the payment is not cleared by you within <strong>3 days (72 hours)</strong>, live video classroom sessions will be <strong>restricted</strong> until cleared.
          </p>
        </div>

        {/* Check if tutor has methods */}
        {loadingMethods ? (
          <div className="py-4 text-center text-xs text-slate-400">Loading receiving payment methods...</div>
        ) : tutorPaymentMethods.length === 0 ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-900">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
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
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Accounts sent to student:</span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {tutorPaymentMethods.length} Active Method{tutorPaymentMethods.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 max-h-36 overflow-y-auto">
              {tutorPaymentMethods.map((m) => (
                <div key={m._id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 uppercase text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                      {m.method}
                    </span>
                    <span className="text-slate-700 font-medium">
                      {m.method === 'bank' ? `${m.bankName} - ${m.accountTitle}` : `${m.accountTitle} (${m.accountNumber})`}
                    </span>
                  </div>
                  {m.isDefault && (
                    <span className="text-[10px] font-bold text-[#b85d34] bg-[#f0ece1] px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
                className="w-full pl-14 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-[#0c2217]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || tutorPaymentMethods.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{submitting ? 'Dispatching...' : 'Dispatch Request (3-Day Limit)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

