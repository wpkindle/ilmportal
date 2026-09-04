'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { Settings, CheckCircle2, CreditCard } from 'lucide-react';

export default function SystemSettingsPage() {
  const [trialDurationDays, setTrialDurationDays] = useState(3);
  const [bankName, setBankName] = useState('Meezan Bank Limited');
  const [accountTitle, setAccountTitle] = useState('IlmPortal Education Pvt Ltd');
  const [iban, setIban] = useState('PK36MEZN0001020304050607');
  const [jazzcashNumber, setJazzcashNumber] = useState('03001234567');
  const [jazzcashTitle, setJazzcashTitle] = useState('IlmPortal Online Tutoring');
  const [easypaisaNumber, setEasypaisaNumber] = useState('03451234567');
  const [easypaisaTitle, setEasypaisaTitle] = useState('IlmPortal Online Tutoring');
  const [instructionsNotes, setInstructionsNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.getSystemConfig();
        if (res.success && res.config) {
          setTrialDurationDays(res.config.trialDurationDays || 3);
          const pay = res.config.paymentInstructions || {};
          setBankName(pay.bankName || 'Meezan Bank Limited');
          setAccountTitle(pay.accountTitle || 'IlmPortal Education Pvt Ltd');
          setIban(pay.iban || 'PK36MEZN0001020304050607');
          setJazzcashNumber(pay.jazzcashNumber || '03001234567');
          setJazzcashTitle(pay.jazzcashTitle || 'IlmPortal Online Tutoring');
          setEasypaisaNumber(pay.easypaisaNumber || '03451234567');
          setEasypaisaTitle(pay.easypaisaTitle || 'IlmPortal Online Tutoring');
          setInstructionsNotes(pay.instructionsNotes || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.updateSystemConfig({
        trialDurationDays: Number(trialDurationDays),
        paymentInstructions: {
          bankName,
          accountTitle,
          iban,
          jazzcashNumber,
          jazzcashTitle,
          easypaisaNumber,
          easypaisaTitle,
          instructionsNotes
        }
      });
      if (res.success) {
        setMessage('System settings saved successfully!');
      }
    } catch (err) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading system settings..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">System & Trial Configuration</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure trial durations and manual payment accounts (JazzCash, EasyPaisa, Bank Details).
              </p>
            </div>

            {message && (
              <div className="p-3 bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4a359]" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trial Period Policy</h3>
                <div className="mt-2 max-w-xs">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Free Trial Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={trialDurationDays}
                    onChange={(e) => setTrialDurationDays(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">JazzCash Payment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">JazzCash Account Number</label>
                    <input
                      type="text"
                      value={jazzcashNumber}
                      onChange={(e) => setJazzcashNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Title</label>
                    <input
                      type="text"
                      value={jazzcashTitle}
                      onChange={(e) => setJazzcashTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">EasyPaisa Payment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">EasyPaisa Account Number</label>
                    <input
                      type="text"
                      value={easypaisaNumber}
                      onChange={(e) => setEasypaisaNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Title</label>
                    <input
                      type="text"
                      value={easypaisaTitle}
                      onChange={(e) => setEasypaisaTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Bank Transfer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Title</label>
                    <input
                      type="text"
                      value={accountTitle}
                      onChange={(e) => setAccountTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">IBAN / Account Number</label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving Settings...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </main>

        </div>
      </div>
    </div>
  );
}

