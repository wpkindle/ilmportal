'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  Smartphone,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Copy,
  Check,
  Star,
  Info,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

export const PAYMENT_METHOD_TYPES = [
  {
    id: 'bank',
    label: 'Bank Account',
    badgeText: 'Direct Bank Transfer',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    iconColor: 'text-emerald-700',
    description: 'Meezan, HBL, UBL, MCB, Bank Alfalah, Allied Bank, etc.'
  },
  {
    id: 'raast',
    label: 'Raast Instant ID',
    badgeText: 'Raast P2P',
    color: 'bg-orange-50 text-orange-800 border-orange-300',
    iconColor: 'text-orange-600',
    description: 'Pakistan State Bank Raast ID (Mobile Number or IBAN)'
  },
  {
    id: 'easypaisa',
    label: 'EasyPaisa',
    badgeText: 'EasyPaisa Mobile Account',
    color: 'bg-green-50 text-green-800 border-green-300',
    iconColor: 'text-green-600',
    description: 'Telenor EasyPaisa Wallet (03XX-XXXXXXX)'
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    badgeText: 'JazzCash Mobile Account',
    color: 'bg-red-50 text-red-800 border-red-300',
    iconColor: 'text-red-600',
    description: 'Mobilink JazzCash Wallet (03XX-XXXXXXX)'
  },
  {
    id: 'upaisa',
    label: 'UPaisa',
    badgeText: 'UPaisa Account',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    iconColor: 'text-amber-600',
    description: 'Ufone UPaisa Wallet (03XX-XXXXXXX)'
  }
];

export const POPULAR_PAKISTANI_BANKS = [
  'Meezan Bank',
  'Habib Bank Limited (HBL)',
  'United Bank Limited (UBL)',
  'MCB Bank',
  'Allied Bank Limited (ABL)',
  'Bank Alfalah',
  'Faysal Bank',
  'Bank of Punjab (BOP)',
  'Askari Bank',
  'Standard Chartered Pakistan',
  'Dubai Islamic Bank',
  'BankIslami Pakistan',
  'Soneri Bank',
  'National Bank of Pakistan (NBP)',
  'JS Bank',
  'Nayapay',
  'Sadapay'
];

export default function TutorPaymentMethodsManager({ onMethodsUpdated, initialMethods = [] }) {
  const [methods, setMethods] = useState(initialMethods);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Form inputs
  const [selectedType, setSelectedType] = useState('bank');
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await api.getPaymentMethods();
      if (res.success && Array.isArray(res.paymentMethods)) {
        setMethods(res.paymentMethods);
        if (onMethodsUpdated) {
          onMethodsUpdated(res.paymentMethods);
        }
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openAddModal = () => {
    setEditingMethod(null);
    setSelectedType('bank');
    setBankName('');
    setAccountTitle('');
    setAccountNumber('');
    setInstructions('');
    setIsDefault(methods.length === 0); // Default if first method
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (method) => {
    setEditingMethod(method);
    setSelectedType(method.method);
    setBankName(method.bankName || '');
    setAccountTitle(method.accountTitle || '');
    setAccountNumber(method.accountNumber || '');
    setInstructions(method.instructions || '');
    setIsDefault(Boolean(method.isDefault));
    setError('');
    setIsModalOpen(true);
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!accountTitle.trim()) {
      setError('Account Title is required.');
      setSubmitting(false);
      return;
    }

    if (!accountNumber.trim()) {
      setError('Account / Mobile Number is required.');
      setSubmitting(false);
      return;
    }

    if (selectedType === 'bank' && !bankName.trim()) {
      setError('Please select or specify the Bank Name.');
      setSubmitting(false);
      return;
    }

    const payload = {
      method: selectedType,
      bankName: selectedType === 'bank' ? bankName.trim() : '',
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      instructions: instructions.trim(),
      isDefault
    };

    try {
      let res;
      if (editingMethod && editingMethod._id) {
        res = await api.updatePaymentMethod(editingMethod._id, payload);
      } else {
        res = await api.addPaymentMethod(payload);
      }

      if (res.success) {
        setSuccess(res.message || 'Payment method saved successfully!');
        setIsModalOpen(false);
        await fetchMethods();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(res.message || 'Failed to save payment method');
      }
    } catch (err) {
      setError(err.message || 'Error saving payment method');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (methodId) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      setLoading(true);
      const res = await api.deletePaymentMethod(methodId);
      if (res.success) {
        setSuccess('Payment method deleted successfully.');
        await fetchMethods();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Error deleting payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      const res = await api.setDefaultPaymentMethod(methodId);
      if (res.success) {
        setSuccess('Default payment method updated.');
        await fetchMethods();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Error setting default payment method');
    }
  };

  const getMethodMeta = (type) => {
    return PAYMENT_METHOD_TYPES.find(m => m.id === type) || {
      id: type,
      label: type.toUpperCase(),
      badgeText: type,
      color: 'bg-slate-50 text-slate-800 border-slate-300',
      iconColor: 'text-slate-700',
      description: ''
    };
  };

  return (
    <div id="profile-payment-methods" className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6 scroll-mt-28">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#b85d34]" />
            </div>
            <h2 className="text-sm font-black text-slate-900 font-serif flex items-center gap-2">
              <span>Tuition Fee Payment Methods</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Required
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Add Pakistani receiving accounts (Bank, Raast ID, EasyPaisa, JazzCash, UPaisa). Students will see these verified methods and transfer your tuition fees directly to you.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#d4a359]" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Notification banners */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {methods.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">Action Required: At Least 1 Payment Method is Mandatory</h4>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              To protect tutors and students, your profile completion requires at least one payment method (Bank, Raast ID, EasyPaisa, JazzCash, or UPaisa). You cannot request tuition fees until an account is added.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#b85d34] hover:underline"
            >
              <span>Click here to add your first payment method</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods Cards Grid */}
      {methods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {methods.map((method) => {
            const meta = getMethodMeta(method.method);
            return (
              <div
                key={method._id}
                className={`relative p-4 rounded-2xl border transition-all ${
                  method.isDefault
                    ? 'border-[#0c2217] bg-[#fbfaf8] shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${meta.color}`}>
                      {meta.badgeText}
                    </span>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-[#0c2217] text-[#faf8f5] flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-[#d4a359] fill-[#d4a359]" />
                        <span>Primary</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!method.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(method._id)}
                        className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Set as primary receiving account"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(method)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(method._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-1.5">
                  {method.method === 'bank' && method.bankName && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{method.bankName}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400 text-[11px] block">Account Title:</span>
                    <strong className="text-slate-900 font-semibold">{method.accountTitle}</strong>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400 text-[11px] block">
                      {method.method === 'raast' ? 'Raast ID:' : method.method === 'bank' ? 'Account / IBAN:' : 'Mobile Number:'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800 tracking-wide">
                        {method.accountNumber}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(method.accountNumber, method._id)}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-[#0c2217] bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Copy account number"
                      >
                        {copiedId === method._id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {method.instructions && (
                    <p className="text-[11px] text-slate-500 italic mt-2 border-t border-slate-100 pt-1.5">
                      Note: {method.instructions}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#b85d34]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    {editingMethod ? 'Edit Payment Method' : 'Add Tuition Payment Method'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pakistani Bank, Raast ID, EasyPaisa, JazzCash, or UPaisa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Method Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Payment Method *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAYMENT_METHOD_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        selectedType === type.id
                          ? 'border-[#0c2217] bg-[#0c2217] text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{type.label}</span>
                        {selectedType === type.id && <Check className="w-3 h-3 text-[#d4a359]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Name if Bank Account */}
              {selectedType === 'bank' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    list="pakistani-banks-list"
                    required
                    placeholder="e.g. Meezan Bank, HBL, Bank Alfalah"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
                  />
                  <datalist id="pakistani-banks-list">
                    {POPULAR_PAKISTANI_BANKS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* Account Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Account Title (Full Name on Account) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ahmad"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Must match the exact name registered with your bank or wallet.
                </p>
              </div>

              {/* Account Number / Mobile / Raast ID */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {selectedType === 'bank'
                    ? 'Account / IBAN Number *'
                    : selectedType === 'raast'
                    ? 'Raast ID (Mobile Number or IBAN) *'
                    : `${getMethodMeta(selectedType).label} Mobile Number *`}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedType === 'bank'
                      ? 'e.g. 01010101234567 or PK36MEZN00010101...'
                      : selectedType === 'raast'
                      ? 'e.g. 03001234567 or PK36...'
                      : 'e.g. 03001234567'
                  }
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-mono font-medium"
                />
              </div>

              {/* Instructions / Notes (Optional) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Instructions / Branch Code (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please add your student name in transfer remarks, or branch code: 0101"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
                />
              </div>

              {/* Set as Default Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-[#0c2217] focus:ring-[#0c2217] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  Set as primary receiving method
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingMethod ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

