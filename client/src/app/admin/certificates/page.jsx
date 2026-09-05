'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [pricingModalCert, setPricingModalCert] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [pricingNotes, setPricingNotes] = useState('');
  const [submittingPrice, setSubmittingPrice] = useState(false);

  const [proofModalCert, setProofModalCert] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingProof, setProcessingProof] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCertificateRequests(statusFilter !== 'all' ? { status: statusFilter } : {});
      if (res.success) {
        setCertificates(res.certificates || []);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  const handleSetPriceSubmit = async (e) => {
    e.preventDefault();
    if (!pricingModalCert || !priceInput || Number(priceInput) <= 0) {
      alert('Please provide a valid price in PKR.');
      return;
    }

    setSubmittingPrice(true);
    try {
      const res = await api.adminSetCertificatePrice(pricingModalCert._id, Number(priceInput), pricingNotes);
      if (res.success) {
        setPricingModalCert(null);
        setPriceInput('');
        setPricingNotes('');
        fetchCertificates();
      }
    } catch (err) {
      alert(err.message || 'Error setting price');
    } finally {
      setSubmittingPrice(false);
    }
  };

  const handleApproveProof = async (certId) => {
    if (!confirm('Approve payment and officially release this certificate?')) return;
    setProcessingProof(true);
    try {
      const res = await api.adminApproveCertificate(certId);
      if (res.success) {
        setProofModalCert(null);
        fetchCertificates();
      }
    } catch (err) {
      alert(err.message || 'Error approving certificate');
    } finally {
      setProcessingProof(false);
    }
  };

  const handleRejectProof = async (certId) => {
    if (!rejectReason) {
      alert('Please enter a rejection reason.');
      return;
    }
    setProcessingProof(true);
    try {
      const res = await api.adminRejectCertificatePayment(certId, rejectReason);
      if (res.success) {
        setProofModalCert(null);
        setRejectReason('');
        fetchCertificates();
      }
    } catch (err) {
      alert(err.message || 'Error rejecting payment proof');
    } finally {
      setProcessingProof(false);
    }
  };

  const filteredCerts = certificates.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.certificateId?.toLowerCase().includes(q) ||
      c.studentName?.toLowerCase().includes(q) ||
      c.instructorName?.toLowerCase().includes(q) ||
      c.courseTitle?.toLowerCase().includes(q) ||
      c.paymentProofReference?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-black text-slate-900">Certificate Issue Management</h1>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Review tutor recommendations, set official pricing, verify payment proof, and release completion certificates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchCertificates}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold w-full sm:w-auto">
                {[
                  { key: 'all', label: 'All Requests' },
                  { key: 'pending_tutor_review', label: 'With Tutor' },
                  { key: 'pending_admin_pricing', label: 'Needs Fee' },
                  { key: 'awaiting_payment', label: 'Awaiting Payment' },
                  { key: 'payment_submitted', label: 'Review Proof' },
                  { key: 'issued', label: 'Issued / Verified' }
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStatusFilter(st.key)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                      statusFilter === st.key ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student, cert ID, TID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Certificate Requests Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              {loading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner text="Loading certificate requests..." />
                </div>
              ) : filteredCerts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Award className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No certificates found matching filter criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Certificate ID & Subject</th>
                        <th className="p-4">Student & Tutor</th>
                        <th className="p-4">Tutor Marks & Grade</th>
                        <th className="p-4">Fee (PKR)</th>
                        <th className="p-4">Workflow Status</th>
                        <th className="p-4">Payment Proof</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCerts.map((cert) => {
                        const isPendingTutor = cert.status === 'pending_tutor_review';
                        const isPendingPrice = cert.status === 'pending_admin_pricing';
                        const isAwaitingPayment = cert.status === 'awaiting_payment';
                        const isProofSubmitted = cert.status === 'payment_submitted';
                        const isIssued = cert.status === 'issued';

                        return (
                          <tr key={cert._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4">
                              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px] block w-fit">
                                {cert.certificateId}
                              </span>
                              <p className="font-extrabold text-slate-900 mt-1 text-xs">
                                {cert.courseTitle}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {new Date(cert.createdAt).toLocaleDateString()}
                              </span>
                            </td>

                            <td className="p-4">
                              <p className="font-bold text-slate-900">
                                Student: {cert.studentName || cert.student?.name}
                              </p>
                              <p className="text-slate-500 text-[11px]">
                                Tutor: {cert.instructorName || cert.instructor?.name}
                              </p>
                              {cert.studentEmail && (
                                <p className="text-[10px] text-slate-400">{cert.studentEmail}</p>
                              )}
                            </td>

                            <td className="p-4">
                              {cert.marks || cert.completionGrade ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[#0c2217] font-mono text-xs block">
                                    {cert.marks ? `Marks: ${cert.marks}` : 'Marks Pending'}
                                  </span>
                                  <span className="text-[11px] text-slate-600 block">
                                    {cert.completionGrade}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-amber-700 italic text-[11px]">Awaiting Tutor</span>
                              )}
                            </td>

                            <td className="p-4">
                              {cert.price > 0 ? (
                                <span className="font-bold text-[#b85d34] font-mono text-sm">
                                  PKR {cert.price.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Price Not Set
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isIssued
                                  ? 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
                                  : isProofSubmitted
                                  ? 'bg-blue-100 text-blue-800 animate-pulse'
                                  : isAwaitingPayment
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {cert.status.replace(/_/g, ' ')}
                              </span>
                            </td>

                            <td className="p-4">
                              {cert.paymentProofReference ? (
                                <div>
                                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                    TID: {cert.paymentProofReference}
                                  </span>
                                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">
                                    Method: {cert.paymentMethod?.replace('_', ' ')}
                                  </p>
                                </div>
                              ) : isAwaitingPayment ? (
                                <span className="text-slate-400 italic">Waiting for student</span>
                              ) : (
                                <span className="text-slate-400 italic">&mdash;</span>
                              )}
                            </td>

                            <td className="p-4 text-right space-x-1.5">
                              {/* Action: Set Price */}
                              {isPendingPrice && (
                                <button
                                  onClick={() => {
                                    setPricingModalCert(cert);
                                    setPriceInput(cert.price > 0 ? cert.price : '1500');
                                  }}
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                                >
                                  Assign Price
                                </button>
                              )}

                              {/* Action: Review Payment Proof */}
                              {isProofSubmitted && (
                                <button
                                  onClick={() => setProofModalCert(cert)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                                >
                                  Review Payment
                                </button>
                              )}

                              {/* Action: View Live / Issued */}
                              {isIssued && (
                                <Link
                                  href={`/certificates/${cert.certificateId}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f0ece1] hover:bg-[#e6dfd5] text-[#0c2217] font-bold rounded-lg border border-[#d4a359]/40 text-xs transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#d4a359]" />
                                  <span>View Certificate</span>
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

      {/* Set Price Modal */}
      {pricingModalCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-slate-900 text-base">Assign Certificate Fee</h3>
              </div>
              <button
                onClick={() => setPricingModalCert(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs space-y-1.5">
              <p className="text-purple-900 font-bold text-sm">{pricingModalCert.courseTitle}</p>
              <div className="flex items-center justify-between text-slate-700">
                <span>Student: <strong>{pricingModalCert.studentName}</strong></span>
                <span>Tutor: <strong>{pricingModalCert.instructorName}</strong></span>
              </div>
              <div className="pt-1.5 border-t border-purple-200 grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-[10px] text-purple-700 font-bold uppercase block">Tutor Marks:</span>
                  <strong className="text-[#0c2217] font-mono text-xs">{pricingModalCert.marks || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-purple-700 font-bold uppercase block">Sanad Grade:</span>
                  <strong className="text-slate-800 text-xs">{pricingModalCert.completionGrade}</strong>
                </div>
              </div>
              {pricingModalCert.tutorNotes && (
                <div className="pt-1 border-t border-purple-200 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700">Tutor Remarks: </span>
                  <span className="italic">"{pricingModalCert.tutorNotes}"</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSetPriceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate Price in PKR *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">PKR</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-purple-500 focus:bg-white font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Once assigned, student will be invoiced and asked to transfer this amount to IlmiDunya account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Note for Student (Optional)
                </label>
                <textarea
                  rows={2}
                  value={pricingNotes}
                  onChange={(e) => setPricingNotes(e.target.value)}
                  placeholder="e.g. Official printed & digital verifiable sanad issuance fee."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPricingModalCert(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPrice}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submittingPrice ? 'Sending Invoice...' : 'Send Invoice to Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Payment Proof Modal */}
      {proofModalCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4a359]" />
                <h3 className="font-black text-slate-900 text-base">Review Payment Proof</h3>
              </div>
              <button
                onClick={() => setProofModalCert(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student</span>
                <strong className="text-slate-900">{proofModalCert.studentName}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount Due</span>
                <strong className="text-[#b85d34] font-mono">PKR {proofModalCert.price}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Method</span>
                <strong className="text-slate-900 uppercase">{proofModalCert.paymentMethod?.replace('_', ' ')}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transaction ID (TID)</span>
                <strong className="font-mono text-purple-700 font-bold">{proofModalCert.paymentProofReference || 'None'}</strong>
              </div>
            </div>

            {proofModalCert.paymentProofReceipt && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Uploaded Receipt Screenshot:</span>
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 p-1 bg-slate-100 flex items-center justify-center">
                  <img
                    src={proofModalCert.paymentProofReceipt}
                    alt="Payment Receipt"
                    className="max-h-56 object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {proofModalCert.paymentProofNotes && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-400 block text-[10px] font-bold">Student Notes:</span>
                <p className="text-slate-700">{proofModalCert.paymentProofNotes}</p>
              </div>
            )}

            {/* Rejection input box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Rejection Reason (if declining proof):
              </label>
              <input
                type="text"
                placeholder="e.g. Transaction ID not found in Meezan Bank statement."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleRejectProof(proofModalCert._id)}
                disabled={processingProof}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Reject Proof
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProofModalCert(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => handleApproveProof(proofModalCert._id)}
                  disabled={processingProof}
                  className="px-5 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{processingProof ? 'Approving...' : 'Approve & Release Certificate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

