'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  FileText,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { api } from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function TutorCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'evaluated', 'issued'

  // Evaluation Modal State
  const [evaluatingCert, setEvaluatingCert] = useState(null);
  const [marks, setMarks] = useState('95%');
  const [grade, setGrade] = useState('A+ (Distinction / Mumtaz)');
  const [customGrade, setCustomGrade] = useState('');
  const [totalLessons, setTotalLessons] = useState(30);
  const [tutorNotes, setTutorNotes] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.getTutorCertificateRequests();
      if (res.success) {
        setCertificates(res.certificates || []);
      }
    } catch (err) {
      console.error('Error fetching tutor certificate requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenEvaluationModal = (cert) => {
    setEvaluatingCert(cert);
    setMarks(cert.marks || '95%');
    setGrade(cert.completionGrade || 'A+ (Distinction / Mumtaz)');
    setTotalLessons(cert.totalLessonsCompleted || 30);
    setTutorNotes(cert.tutorNotes || 'Completed the curriculum with excellent Tajweed and recitation.');
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    if (!evaluatingCert) return;

    if (!marks.trim()) {
      alert('Please enter marks or percentage.');
      return;
    }

    const finalGrade = grade === 'custom' ? customGrade.trim() : grade;
    if (!finalGrade) {
      alert('Please enter or select a grade.');
      return;
    }

    setSubmittingEval(true);
    try {
      const res = await api.tutorEvaluateCertificate(evaluatingCert._id, {
        marks: marks.trim(),
        grade: finalGrade,
        totalLessonsCompleted: Number(totalLessons) || 30,
        tutorNotes: tutorNotes.trim()
      });

      if (res.success) {
        alert('Marks and evaluation submitted successfully! Administration has been notified to set the certificate fee.');
        setEvaluatingCert(null);
        fetchCertificates();
      }
    } catch (err) {
      alert(err.message || 'Error submitting evaluation');
    } finally {
      setSubmittingEval(false);
    }
  };

  const filteredCerts = certificates.filter((cert) => {
    if (filter === 'pending') return cert.status === 'pending_tutor_review';
    if (filter === 'evaluated') return cert.status === 'pending_admin_pricing' || cert.status === 'awaiting_payment' || cert.status === 'payment_submitted';
    if (filter === 'issued') return cert.status === 'issued';
    return true;
  });

  const pendingCount = certificates.filter(c => c.status === 'pending_tutor_review').length;

  if (loading) return <LoadingSpinner text="Loading certificate requests..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Tutor Academic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Student Certificate Evaluations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review completion requests directly submitted by your students, enter their marks &amp; grades, and forward to admin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="px-3.5 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs rounded-full flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{pendingCount} Pending Evaluation{pendingCount > 1 ? 's' : ''}</span>
              </span>
            )}
            <Link
              href="/tutor/dashboard"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All Requests (${certificates.length})` },
            { id: 'pending', label: `Pending My Evaluation (${pendingCount})` },
            { id: 'evaluated', label: 'Evaluated / Processing' },
            { id: 'issued', label: 'Officially Issued' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        {filteredCerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Certificate Requests Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {filter === 'pending'
                ? 'Great job! You have evaluated all certificate requests from your students.'
                : 'When students request course completion certificates, they will appear here for your academic review and marks assignment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((cert) => {
              const isPendingMyReview = cert.status === 'pending_tutor_review';
              const isPendingAdminPricing = cert.status === 'pending_admin_pricing';
              const isAwaitingPayment = cert.status === 'awaiting_payment';
              const isProofSubmitted = cert.status === 'payment_submitted';
              const isIssued = cert.status === 'issued';

              return (
                <div
                  key={cert._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Top Status */}
                    <div className="flex items-center justify-between">
                      <span className={`p-2.5 rounded-2xl border ${
                        isPendingMyReview
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isIssued
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        <Award className="w-6 h-6" />
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isPendingMyReview
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isPendingAdminPricing
                          ? 'bg-blue-100 text-blue-800'
                          : isAwaitingPayment
                          ? 'bg-indigo-100 text-indigo-800'
                          : isProofSubmitted
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isPendingMyReview ? 'Action Required' : cert.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Student & Course Details */}
                    <div>
                      <h3 className="font-black text-base text-slate-900 leading-snug">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Student: <strong className="text-slate-800">{cert.studentName}</strong>
                      </p>
                      {cert.createdAt && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Requested: {new Date(cert.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Student Notes if any */}
                    {cert.studentNotes && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                        <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Student Notes:</span>
                        <p className="italic text-slate-600">"{cert.studentNotes}"</p>
                      </div>
                    )}

                    {/* Evaluation Details */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Marks / Percentage:</span>
                        <strong className="text-emerald-800 font-bold">
                          {cert.marks || (isPendingMyReview ? 'Not assigned yet' : 'N/A')}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sanad Grade:</span>
                        <strong className="text-slate-800 font-bold">{cert.completionGrade}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Cert ID:</span>
                        <strong className="font-mono text-slate-600">{cert.certificateId}</strong>
                      </div>
                      {cert.price > 0 && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                          <span>Admin Fee:</span>
                          <strong className="font-mono text-emerald-700 font-black">PKR {cert.price.toLocaleString()}</strong>
                        </div>
                      )}
                    </div>

                    {/* Status Info */}
                    {isPendingMyReview && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Waiting for Your Marks</span>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          Student has completed syllabus with you and requested certification. Please evaluate and enter their marks.
                        </p>
                      </div>
                    )}

                    {isPendingAdminPricing && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Marks Submitted to Admin</span>
                        </div>
                        <p className="text-[11px] text-blue-700">
                          Admin is reviewing your evaluation and setting the certificate invoice amount for the student.
                        </p>
                      </div>
                    )}

                    {isAwaitingPayment && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 space-y-1">
                        <p className="text-[11px] text-indigo-700">
                          Admin set fee: <strong>PKR {cert.price?.toLocaleString()}</strong>. Student has been invoiced to pay.
                        </p>
                      </div>
                    )}

                    {isProofSubmitted && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 space-y-1">
                        <p className="text-[11px] text-purple-700">
                          Student submitted payment proof (TID: {cert.paymentProofReference || 'Attached'}). Under admin verification.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Action Button */}
                  <div className="p-6 pt-0">
                    {isPendingMyReview ? (
                      <button
                        onClick={() => handleOpenEvaluationModal(cert)}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>Add Marks &amp; Grades</span>
                      </button>
                    ) : isIssued ? (
                      <Link
                        href={`/certificates/${cert.certificateId}`}
                        target="_blank"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Verified Certificate</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleOpenEvaluationModal(cert)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit Marks / Remarks</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Tutor Evaluation Modal */}
      {evaluatingCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Academic Evaluation &amp; Marks</h3>
                  <p className="text-xs text-slate-500">
                    Evaluating: <strong className="text-slate-800">{evaluatingCert.studentName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvaluatingCert(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEvaluationSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                <p className="text-slate-500">Course / Syllabus:</p>
                <p className="font-bold text-slate-900 text-sm">{evaluatingCert.courseTitle}</p>
                {evaluatingCert.studentNotes && (
                  <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                    Student note: "{evaluatingCert.studentNotes}"
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Marks / Percentage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 96%, 94/100, 98%"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">This will be permanently printed on the official certificate.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Sanad / Completion Grade *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-500"
                >
                  <option value="A+ (Distinction / Mumtaz)">A+ (Distinction / Mumtaz - ممتاز)</option>
                  <option value="A (Excellent / Jayyid Jiddan)">A (Excellent / Jayyid Jiddan - جيد جداً)</option>
                  <option value="B+ (Very Good / Jayyid)">B+ (Very Good / Jayyid - جيد)</option>
                  <option value="B (Good / Maqbool)">B (Good / Maqbool - مقبول)</option>
                  <option value="Distinction (Sanad Verified)">Distinction (Sanad Verified)</option>
                  <option value="custom">Custom Grade Title...</option>
                </select>

                {grade === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom grade (e.g. High Distinction)"
                    value={customGrade}
                    onChange={(e) => setCustomGrade(e.target.value)}
                    className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-500"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Total Sessions / Lessons Completed
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalLessons}
                  onChange={(e) => setTotalLessons(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tutor Evaluation Remarks / Comments
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Demonstrated exceptional memorization, flawless Tajweed pronunciation, and consistent attendance."
                  value={tutorNotes}
                  onChange={(e) => setTutorNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 resize-none font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-0.5">
                <p className="font-bold">Next Step in Workflow:</p>
                <p>When you click submit, your marks and remarks will be forwarded to Administration. Admin will then assign the certificate fee, after which the student will pay and receive their certificate.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEvaluatingCert(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingEval ? 'Submitting Marks...' : 'Submit Evaluation to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
