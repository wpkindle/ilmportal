'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { Handshake, CheckCircle2, XCircle, ShieldAlert, CreditCard, Clock } from 'lucide-react';

export default function DealsManagementPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Verify payment modal
  const [selectedDealForVerify, setSelectedDealForVerify] = useState(null);
  const [restrictDealId, setRestrictDealId] = useState(null);
  const [restrictionType, setRestrictionType] = useState('warn');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDeals({ status: statusFilter });
      if (res.success) setDeals(res.deals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [statusFilter]);

  const handleVerifyPayment = async (dealId, status) => {
    setActionLoading(true);
    try {
      const res = await api.verifyPayment(dealId, status);
      if (res.success) {
        setSelectedDealForVerify(null);
        fetchDeals();
      }
    } catch (err) {
      alert(err.message || 'Error verifying payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestrict = async (e) => {
    e.preventDefault();
    if (!restrictDealId) return;

    setActionLoading(true);
    try {
      const res = await api.restrictDeal(restrictDealId, {
        restrictionType,
        accessRestricted: true
      });
      if (res.success) {
        setRestrictDealId(null);
        fetchDeals();
      }
    } catch (err) {
      alert(err.message || 'Error updating restriction');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading platform deals..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Deals & Manual Payment Verification</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify JazzCash, EasyPaisa, and Bank Transfer references to activate paid courses.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
                {['all', 'active_trial', 'active_paid', 'trial_expired', 'restricted'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                      statusFilter === st ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Student & Tutor</th>
                    <th className="p-4">Subject & Fee</th>
                    <th className="p-4">Deal Status</th>
                    <th className="p-4">Payment Proof (TID)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No deals found matching filter.
                      </td>
                    </tr>
                  ) : (
                    deals.map((deal) => (
                      <tr key={deal._id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">
                            Student: {deal.student?.name}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Tutor: {deal.tutor?.name}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{deal.subject}</p>
                          <p className="text-emerald-700 font-mono font-bold">
                            PKR {deal.price} / {deal.priceUnit === 'per_hour' ? 'hr' : 'mo'}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            deal.status === 'active_paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : deal.status === 'active_trial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {deal.status.replace('_', ' ')}
                          </span>
                          {deal.accessRestricted && (
                            <span className="block text-[10px] text-red-600 font-bold mt-0.5">
                              Restricted ({deal.restrictionType})
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {deal.paymentProofReference ? (
                            <div>
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                                {deal.paymentProofReference}
                              </span>
                              <p className="text-[10px] text-slate-500 uppercase mt-0.5">
                                {deal.paymentMethod}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No TID submitted</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedDealForVerify(deal)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200"
                          >
                            Verify Payment
                          </button>
                          <button
                            onClick={() => setRestrictDealId(deal._id)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 font-bold rounded-lg border border-red-200"
                          >
                            Restrict
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </main>

        </div>
      </div>

      {/* Verify Payment Modal */}
      {selectedDealForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Verify Course Payment
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <p><strong>Course:</strong> {selectedDealForVerify.subject}</p>
              <p><strong>Fee:</strong> PKR {selectedDealForVerify.price}</p>
              <p><strong>Method:</strong> {selectedDealForVerify.paymentMethod?.toUpperCase() || 'JazzCash'}</p>
              <p><strong>TID / Reference:</strong> <span className="font-mono font-bold text-emerald-800">{selectedDealForVerify.paymentProofReference || 'None'}</span></p>
              {selectedDealForVerify.paymentProofNotes && (
                <p><strong>Notes:</strong> {selectedDealForVerify.paymentProofNotes}</p>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Confirming verification will transition the deal to <strong>Active Paid</strong> and remove any access restrictions.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDealForVerify(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedDealForVerify._id, 'rejected')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
              >
                Reject Proof
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedDealForVerify._id, 'verified')}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Verify & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict Access Modal */}
      {restrictDealId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Apply Deal Restriction
            </h3>
            <form onSubmit={handleRestrict} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Restriction Type</label>
                <select
                  value={restrictionType}
                  onChange={(e) => setRestrictionType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                >
                  <option value="warn">Warn (Banner notification only)</option>
                  <option value="limit_chat">Limit Chat (Restrict message sending)</option>
                  <option value="suspend_access">Suspend Access (Block live classes until paid)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestrictDealId(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
                >
                  Apply Restriction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

