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

  // Set Platform Fee modal
  const [feeModalDeal, setFeeModalDeal] = useState(null);
  const [inputPlatformFee, setInputPlatformFee] = useState('');
  const [feeNotes, setFeeNotes] = useState('');

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

  const handleSavePlatformFee = async (e) => {
    e.preventDefault();
    if (!feeModalDeal || inputPlatformFee === '') return;

    setActionLoading(true);
    try {
      const res = await api.adminSetPlatformFee(feeModalDeal._id, {
        platformFee: Number(inputPlatformFee),
        notes: feeNotes.trim()
      });
      if (res.success) {
        setFeeModalDeal(null);
        fetchDeals();
      }
    } catch (err) {
      alert(err.message || 'Error updating platform fee');
    } finally {
      setActionLoading(false);
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

  const handleClearTutorFee = async (dealId) => {
    if (!confirm('Clear tutor platform fee for this deal and activate regular classes?')) return;
    setActionLoading(true);
    try {
      const res = await api.adminClearTutorFee(dealId);
      if (res.success) {
        fetchDeals();
      }
    } catch (err) {
      alert(err.message || 'Error clearing tutor fee');
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

              <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
                {['all', 'continuation_agreed', 'active_trial', 'active_paid', 'trial_expired', 'restricted'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                      statusFilter === st ? 'bg-white text-[#0c2217] shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
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
                    <th className="p-4">Tuition Price</th>
                    <th className="p-4">Platform Fee (Admin)</th>
                    <th className="p-4">Deal Status & 72h</th>
                    <th className="p-4">Payment Proof (TID)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
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
                          <p className="text-[#b85d34] font-mono font-bold">
                            PKR {deal.price?.toLocaleString()} / {deal.priceUnit === 'per_hour' ? 'hr' : 'mo'}
                          </p>
                        </td>
                        <td className="p-4">
                          {deal.platformFee !== null && deal.platformFee !== undefined ? (
                            <div>
                              <span className="font-mono font-bold text-[#b85d34] text-sm">
                                PKR {deal.platformFee.toLocaleString()}
                              </span>
                              <button
                                onClick={() => {
                                  setFeeModalDeal(deal);
                                  setInputPlatformFee(deal.platformFee);
                                  setFeeNotes(deal.platformFeeNotes || '');
                                }}
                                className="block text-[10px] text-[#b85d34] hover:underline font-bold mt-0.5 cursor-pointer"
                              >
                                Edit Fee
                              </button>
                            </div>
                          ) : (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                Not Decided
                              </span>
                              <button
                                onClick={() => {
                                  setFeeModalDeal(deal);
                                  setInputPlatformFee('');
                                  setFeeNotes('');
                                }}
                                className="block text-[11px] text-[#b85d34] hover:underline font-bold mt-1 cursor-pointer"
                              >
                                + Set Fee
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            deal.status === 'active_paid'
                              ? 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
                              : deal.status === 'continuation_agreed'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : deal.status === 'active_trial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {deal.status.replace('_', ' ')}
                          </span>

                          {deal.tutorFeeDueDate && deal.status === 'continuation_agreed' && (
                            <div className="mt-1 text-[10px]">
                              <span className="text-slate-600 font-medium">Fee Deadline: </span>
                              <span className="font-bold text-slate-800">
                                {new Date(deal.tutorFeeDueDate).toLocaleDateString()}
                              </span>
                              {new Date(deal.tutorFeeDueDate) < new Date() && !deal.tutorFeePaid ? (
                                <span className="block text-red-600 font-extrabold animate-pulse">
                                  OVERDUE (72h Expired)
                                </span>
                              ) : (
                                <span className="block text-[#0c2217] font-semibold">
                                  Within 72h Grace (Live classes active)
                                </span>
                              )}
                            </div>
                          )}

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
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setFeeModalDeal(deal);
                              setInputPlatformFee(deal.platformFee !== null && deal.platformFee !== undefined ? deal.platformFee : '');
                              setFeeNotes(deal.platformFeeNotes || '');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs"
                          >
                            {deal.platformFee !== null && deal.platformFee !== undefined ? 'Edit Fee' : 'Set Fee'}
                          </button>
                          {deal.status === 'continuation_agreed' && !deal.tutorFeePaid && (
                            <button
                              onClick={() => handleClearTutorFee(deal._id)}
                              className="px-2.5 py-1.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                            >
                              Clear Fee
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedDealForVerify(deal)}
                            className="px-2.5 py-1.5 bg-[#f0ece1] hover:bg-[#e4dcce] text-[#0c2217] font-bold rounded-lg border border-[#d4a359]/40"
                          >
                            Verify
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
              <p><strong>Method:</strong> {selectedDealForVerify.paymentMethod?.toUpperCase() || 'Meezan'}</p>
              <p><strong>Proof Status:</strong> <span className="font-mono font-bold text-[#b85d34]">{selectedDealForVerify.paymentProofReference || 'Screenshot Proof Attached'}</span></p>
              {selectedDealForVerify.paymentProofNotes && (
                <p><strong>Notes:</strong> {selectedDealForVerify.paymentProofNotes}</p>
              )}
              {selectedDealForVerify.proofImageUrl && (
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800">Screenshot Proof:</span>
                    <a
                      href={selectedDealForVerify.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#b85d34] hover:underline text-[11px] font-semibold"
                    >
                      View Full Size ↗
                    </a>
                  </div>
                  <a href={selectedDealForVerify.proofImageUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedDealForVerify.proofImageUrl}
                      alt="Payment proof screenshot"
                      className="w-full max-h-56 object-contain rounded-xl border border-slate-300 bg-white hover:opacity-95 transition-opacity cursor-zoom-in"
                    />
                  </a>
                </div>
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
                className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
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

      {/* Set Platform Fee Modal */}
      {feeModalDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Decide Tutor Platform Fee
                </h3>
                <p className="text-xs text-slate-500">
                  Tutor: <strong>{feeModalDeal.tutor?.name}</strong> &bull; {feeModalDeal.subject}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeeModalDeal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlatformFee} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p className="text-slate-600">
                  Student Tuition Rate: <strong className="text-slate-900">PKR {feeModalDeal.price?.toLocaleString()}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Specify the exact platform commission fee for this tutor deal. This amount will be charged to the tutor.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Platform Fee Amount (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 1000 or 1500"
                  value={inputPlatformFee}
                  onChange={(e) => setInputPlatformFee(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:border-[#d4a359] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admin Notes / Commission Justification (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard 25% first month platform commission"
                  value={feeNotes}
                  onChange={(e) => setFeeNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#d4a359]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeeModalDeal(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || inputPlatformFee === ''}
                  className="px-5 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Platform Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

