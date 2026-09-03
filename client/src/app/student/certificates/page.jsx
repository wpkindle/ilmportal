'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Download,
  Calendar,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Printer,
  CreditCard,
  UploadCloud,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Proof Modal State
  const [selectedCertForPay, setSelectedCertForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('meezan_bank');
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await api.getMyCertificates();
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
    fetchCerts();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentProofSubmit = async (e) => {
    e.preventDefault();
    if (!trxId && !receiptUrl) {
      alert('Please enter a Transaction ID (Trx ID) or attach your payment receipt screenshot.');
      return;
    }

    setSubmittingProof(true);
    try {
      const res = await api.studentSubmitCertificatePayment(selectedCertForPay._id, {
        paymentMethod,
        paymentProofReference: trxId,
        paymentProofReceipt: receiptUrl,
        paymentProofNotes: notes
      });

      if (res.success) {
        alert('Payment proof submitted successfully! Administration will review and release your certificate.');
        setSelectedCertForPay(null);
        setTrxId('');
        setNotes('');
        setReceiptUrl('');
        fetchCerts();
      }
    } catch (err) {
      alert(err.message || 'Error submitting payment proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your certificates..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Official Sanad Accreditations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Course Completion Certificates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your certificate requests, submit fee payment proofs, and download verifiable PDF certificates.
            </p>
          </div>

          <Link
            href="/courses"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Browse More Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ask your tutor to recommend a completion certificate once you finish your Quranic studies or academic syllabus, or complete your online curriculum chapters.
            </p>
            <Link
              href="/student/messages"
              className="inline-block mt-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-500 transition-all"
            >
              Go to Messages with Tutor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => {
              const isIssued = cert.status === 'issued';
              const isProofSubmitted = cert.status === 'payment_submitted';
              const isAwaitingPayment = cert.status === 'awaiting_payment';
              const isPendingPricing = cert.status === 'pending_admin_pricing';

              return (
                <div
                  key={cert._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                        <Award className="w-6 h-6" />
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isIssued
                          ? 'bg-emerald-100 text-emerald-800'
                          : isProofSubmitted
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : isAwaitingPayment
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {isIssued ? 'Official Verified' : cert.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-base text-slate-900 leading-snug">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Instructor: <strong className="text-slate-800">{cert.instructorName}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Sanad Status:</span>
                        <strong className="text-emerald-800">{cert.completionGrade}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Cert ID:</span>
                        <strong className="font-mono text-slate-600">{cert.certificateId}</strong>
                      </div>
                      {cert.price > 0 && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                          <span>Certificate Fee:</span>
                          <strong className="font-mono text-emerald-700 font-black">PKR {cert.price}</strong>
                        </div>
                      )}
                    </div>

                    {/* Status Notice Details */}
                    {isPendingPricing && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Tutor Recommended Certificate</span>
                        </div>
                        <p className="text-[11px] text-purple-700">
                          Administration is currently reviewing your study records and pricing your certificate.
                        </p>
                      </div>
                    )}

                    {isAwaitingPayment && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Fee Invoiced: PKR {cert.price}</span>
                        </div>
                        <p className="text-[11px] text-amber-700">
                          Please send fee and submit payment proof (receipt/TID) to unlock instant PDF download.
                        </p>
                      </div>
                    )}

                    {isProofSubmitted && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Payment Proof Submitted</span>
                        </div>
                        <p className="text-[11px] text-blue-700">
                          Admin is reviewing your transaction (TID: {cert.paymentProofReference || 'Attached'}). You will receive an email as soon as it is approved.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 pt-0">
                    {isIssued ? (
                      <Link
                        href={`/certificates/${cert.certificateId}`}
                        target="_blank"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View &amp; Download PDF</span>
                      </Link>
                    ) : isAwaitingPayment ? (
                      <button
                        onClick={() => setSelectedCertForPay(cert)}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Submit Payment Proof (PKR {cert.price})</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isPendingPricing ? 'Awaiting Fee Assignment' : 'Proof Under Verification'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Submit Payment Proof Modal */}
      {selectedCertForPay && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Submit Certificate Fee Proof</h3>
              </div>
              <button
                onClick={() => setSelectedCertForPay(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Price & Official Bank Accounts */}
            <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800">
                <span className="text-emerald-300 font-bold uppercase text-[10px]">Certificate Amount Due</span>
                <span className="text-base font-black text-emerald-400 font-mono">PKR {selectedCertForPay.price}</span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium">
                Please transfer PKR {selectedCertForPay.price} to any of our official verified accounts:
              </p>
              <div className="space-y-1 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-emerald-500/30">
                <p><strong>Meezan Bank:</strong> 96010105435308 (Title: Abdul Khaliq)</p>
                <p><strong>Raast ID / EasyPaisa / JazzCash / UPaisa:</strong> 03171759093</p>
                <p className="text-emerald-400">Support Hotline: 0317 1759093 &bull; 0315 4453745</p>
              </div>
            </div>

            <form onSubmit={handlePaymentProofSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value="meezan_bank">Meezan Bank Transfer (Account: 96010105435308)</option>
                  <option value="raast">Raast Instant Transfer (03171759093)</option>
                  <option value="easypaisa">EasyPaisa (03171759093)</option>
                  <option value="jazzcash">JazzCash (03171759093)</option>
                  <option value="other">Other Banking Channel</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transaction ID / Reference Number (Trx ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 19284719284 or Bank Trx Ref"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Attach Payment Screenshot / Receipt (Optional but recommended)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {receiptUrl && (
                  <div className="mt-2 p-1 border border-emerald-200 rounded-xl bg-emerald-50 max-w-xs">
                    <img src={receiptUrl} alt="Receipt Preview" className="h-24 object-contain rounded-lg mx-auto" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Sender Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sent from account title Muhammad Ali"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCertForPay(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submittingProof ? 'Submitting...' : 'Submit Payment Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
