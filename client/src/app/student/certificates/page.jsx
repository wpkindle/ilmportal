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
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { Plus } from 'lucide-react';

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Certificate Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [deals, setDeals] = useState([]);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [studentCertName, setStudentCertName] = useState(user?.name || '');
  const [courseSubject, setCourseSubject] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [requesting, setRequesting] = useState(false);

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
    api.getMyDeals().then(res => {
      if (res.success && res.deals) {
        setDeals(res.deals);
        if (res.deals.length > 0) {
          setSelectedDealId(res.deals[0]._id);
          setCourseSubject(res.deals[0].subject);
        }
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (user?.name && !studentCertName) {
      setStudentCertName(user.name);
    }
  }, [user]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const deal = deals.find(d => d._id === selectedDealId);
    if (!deal) {
      alert('Please select a course deal with your tutor.');
      return;
    }

    setRequesting(true);
    try {
      const res = await api.studentRequestCertificate({
        tutorId: deal.tutor?._id || deal.tutor,
        dealId: deal._id,
        subject: courseSubject || deal.subject,
        studentName: studentCertName.trim() || user?.name,
        notes: requestNotes.trim()
      });

      if (res.success) {
        alert('Certificate request sent directly to your tutor! Your tutor will now evaluate your coursework and enter your marks.');
        setRequestModalOpen(false);
        setRequestNotes('');
        fetchCerts();
      }
    } catch (err) {
      alert(err.message || 'Error submitting certificate request');
    } finally {
      setRequesting(false);
    }
  };

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
    <div className="py-8 bg-[#faf8f5] min-h-screen text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6dfd5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#143d2b] uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-[#d4a359]" />
              <span>Official Sanad Accreditations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              My Course Completion Certificates
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Request official completion certificates directly from your tutor, track grading, and download verified PDFs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setRequestModalOpen(true)}
              className="px-5 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-[#d4a359]/30 hover:scale-105"
            >
              <Plus className="w-4 h-4 text-[#d4a359]" />
              <span>Request Certificate</span>
            </button>
            <Link
              href="/courses"
              className="px-4 py-2.5 bg-[#faf8f5] hover:bg-[#f3ede2] text-stone-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-[#e6dfd5]"
            >
              <span>Browse Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e6dfd5] shadow-xs space-y-3">
            <Award className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-stone-800">No Certificates Requested Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Completed your lessons? Request an official completion certificate directly. Your tutor will evaluate your marks, admin will assign the fee, and your certificate will be issued.
            </p>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#0c2217] text-[#faf8f5] text-xs font-bold rounded-xl shadow-xs hover:bg-[#143d2b] transition-all cursor-pointer border border-[#d4a359]/30"
            >
              <Plus className="w-4 h-4 text-[#d4a359]" />
              <span>Request Your Certificate Now</span>
            </button>
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
                  className="bg-white rounded-3xl border border-[#e6dfd5] overflow-hidden shadow-xs hover:border-[#d4a359]/60 transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="p-2.5 bg-[#eef5f0] text-[#143d2b] rounded-2xl border border-[#c3dfcb]">
                        <Award className="w-6 h-6 text-[#d4a359]" />
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isIssued
                          ? 'bg-[#eef5f0] text-[#143d2b] border border-[#c3dfcb]'
                          : isProofSubmitted
                          ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                          : isAwaitingPayment
                          ? 'bg-[#fdf6ec] text-[#b8863b] border border-[#f2dfbe]'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {isIssued ? 'Official Verified' : cert.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Instructor: <strong className="text-stone-800">{cert.instructorName}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-xs space-y-1 text-stone-600">
                      <div className="flex items-center justify-between">
                        <span>Grade / Marks:</span>
                        <strong className="text-[#143d2b]">
                          {cert.marks ? `${cert.marks} • ${cert.completionGrade}` : cert.completionGrade || 'Pending Evaluation'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>Cert ID:</span>
                        <strong className="font-mono text-stone-600">{cert.certificateId}</strong>
                      </div>
                      {cert.price > 0 && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e6dfd5]">
                          <span>Certificate Fee:</span>
                          <strong className="font-mono text-[#143d2b] font-bold">PKR {cert.price.toLocaleString()}</strong>
                        </div>
                      )}
                    </div>

                    {/* Status Notice Details */}
                    {cert.status === 'pending_tutor_review' && (
                      <div className="p-3 bg-[#fdf6ec] border border-[#f2dfbe] rounded-xl text-xs text-[#b8863b] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Tutor Evaluation</span>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          Request sent to tutor {cert.instructorName}. The tutor will review your coursework and enter your marks and grade.
                        </p>
                      </div>
                    )}

                    {isPendingPricing && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tutor Graded: {cert.marks || cert.completionGrade}</span>
                        </div>
                        <p className="text-[11px] text-blue-700">
                          Your tutor has submitted your marks! Administration is now assigning the payment fee for this certificate.
                        </p>
                      </div>
                    )}

                    {isAwaitingPayment && (
                      <div className="p-3 bg-[#eef5f0] border border-[#c3dfcb] rounded-xl text-xs text-[#143d2b] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#0c2217]">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Fee Invoiced: PKR {cert.price?.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          Marks: <strong>{cert.marks || cert.completionGrade}</strong>. Please transfer the fee and submit proof to unlock instant PDF download.
                        </p>
                      </div>
                    )}

                    {isProofSubmitted && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Payment Proof Submitted</span>
                        </div>
                        <p className="text-[11px] text-purple-700">
                          Admin is reviewing your transaction (TID: {cert.paymentProofReference || 'Attached'}). Your certificate download will unlock once verified.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 pt-0">
                    {isIssued ? (
                      <Link
                        href={`/certificates/${cert.certificateId}`}
                        target="_blank"
                        className="w-full py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer border border-[#d4a359]/30"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>View &amp; Download PDF</span>
                      </Link>
                    ) : isAwaitingPayment ? (
                      <button
                        onClick={() => setSelectedCertForPay(cert)}
                        className="w-full py-2.5 bg-[#b8863b] hover:bg-[#a5742e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Submit Payment Proof (PKR {cert.price?.toLocaleString()})</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-[#faf8f5] text-stone-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-[#e6dfd5]"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {cert.status === 'pending_tutor_review'
                            ? 'Awaiting Tutor Evaluation'
                            : isPendingPricing
                            ? 'Awaiting Admin Fee Assignment'
                            : 'Proof Under Verification'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Request Certificate Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#e6dfd5] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3ede2]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eef5f0] text-[#143d2b] rounded-xl border border-[#c3dfcb]">
                  <Award className="w-5 h-5 text-[#d4a359]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">Request Course Certificate</h3>
                  <p className="text-xs text-stone-500">Request goes directly to your tutor for evaluation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Select Tutor &amp; Course *
                </label>
                {deals.length === 0 ? (
                  <div className="p-3 bg-[#fdf6ec] border border-[#f2dfbe] rounded-xl text-[#b8863b] text-xs">
                    No active course deals found. You need an active or completed tuition deal with a tutor to request a certificate.
                  </div>
                ) : (
                  <select
                    value={selectedDealId}
                    onChange={(e) => {
                      setSelectedDealId(e.target.value);
                      const d = deals.find(x => x._id === e.target.value);
                      if (d) setCourseSubject(d.subject);
                    }}
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl font-medium outline-none focus:border-[#0c2217]"
                    required
                  >
                    {deals.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.subject} &bull; Tutor: {d.tutor?.name || 'Tutor'} ({d.status.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Full Name on Certificate *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full legal name as it should appear on certificate"
                  value={studentCertName}
                  onChange={(e) => setStudentCertName(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl outline-none focus:border-[#0c2217] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Course Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nazra Quran with Tajweed, Hifz Surah Al-Baqarah"
                  value={courseSubject}
                  onChange={(e) => setCourseSubject(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl outline-none focus:border-[#0c2217] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Message / Study Notes for Tutor (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Completed all chapters of Tajweed and Makharij rules with Ustadh."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl outline-none focus:border-[#0c2217] resize-none font-medium"
                />
              </div>

              <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] space-y-1 text-[11px] text-stone-600">
                <p className="font-bold text-stone-800">Certificate Process Flow:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-stone-500">
                  <li>Your tutor receives your request and assigns your marks and grade.</li>
                  <li>Administration sets the official certificate fee.</li>
                  <li>You review the grade, pay the fee, and submit Transaction ID (TID).</li>
                  <li>Admin verifies your payment and unlocks instant PDF download.</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3ede2]">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 bg-[#faf8f5] hover:bg-[#f3ede2] text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-[#e6dfd5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting || deals.length === 0}
                  className="px-5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold rounded-xl text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer border border-[#d4a359]/30"
                >
                  {requesting ? 'Submitting Request...' : 'Submit Certificate Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Payment Proof Modal */}
      {selectedCertForPay && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#e6dfd5] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3ede2]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#d4a359]" />
                <h3 className="font-serif font-bold text-stone-900 text-base">Submit Certificate Fee Proof</h3>
              </div>
              <button
                onClick={() => setSelectedCertForPay(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Price & Official Bank Accounts */}
            <div className="bg-[#0c2217] text-[#faf8f5] p-4 rounded-2xl space-y-2 text-xs border border-[#d4a359]/30">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[#d4a359] font-bold uppercase text-[10px]">Certificate Amount Due</span>
                <span className="text-base font-bold text-[#faf8f5] font-mono">PKR {selectedCertForPay.price}</span>
              </div>
              <p className="text-[11px] text-stone-300 font-medium">
                Please transfer PKR {selectedCertForPay.price} to any of our official verified accounts:
              </p>
              <div className="space-y-1 text-[11px] bg-white/5 p-2.5 rounded-xl border border-white/10">
                <p><strong>Meezan Bank:</strong> 96010105435308 (Title: Abdul Khaliq)</p>
                <p><strong>Raast ID / EasyPaisa / JazzCash / UPaisa:</strong> 03171759093</p>
                <p className="text-[#d4a359]">Official Support: <a href="mailto:contact@ilmportal.org" className="underline font-bold">contact@ilmportal.org</a></p>
              </div>
            </div>

            <form onSubmit={handlePaymentProofSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Select Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl outline-none focus:border-[#0c2217]"
                >
                  <option value="meezan_bank">Meezan Bank Transfer (Account: 96010105435308)</option>
                  <option value="raast">Raast Instant Transfer (03171759093)</option>
                  <option value="easypaisa">EasyPaisa (03171759093)</option>
                  <option value="jazzcash">JazzCash (03171759093)</option>
                  <option value="other">Other Banking Channel</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Transaction ID / Reference Number (Trx ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 19284719284 or Bank Trx Ref"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl font-mono text-xs outline-none focus:border-[#0c2217] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Attach Payment Screenshot / Receipt (Optional but recommended)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#eef5f0] file:text-[#143d2b] hover:file:bg-[#e0ede4]"
                />
                {receiptUrl && (
                  <div className="mt-2 p-1 border border-[#e6dfd5] rounded-xl bg-[#faf8f5] max-w-xs">
                    <img src={receiptUrl} alt="Receipt Preview" className="h-24 object-contain rounded-lg mx-auto" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Notes / Sender Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sent from account title Muhammad Ali"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs outline-none focus:border-[#0c2217]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3ede2]">
                <button
                  type="button"
                  onClick={() => setSelectedCertForPay(null)}
                  className="px-4 py-2 bg-[#faf8f5] hover:bg-[#f3ede2] text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-[#e6dfd5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-5 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold rounded-xl text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer border border-[#d4a359]/30"
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
