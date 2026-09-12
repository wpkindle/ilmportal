'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { SanadModal } from '../../../components/common/SanadBadge';
import { api } from '../../../services/api';
import {
  CheckCircle2,
  XCircle,
  Mail,
  FileText,
  Award,
  MapPin,
  Eye,
  ExternalLink,
  Clock,
  AlertCircle,
  ShieldCheck,
  Video
} from 'lucide-react';
import VideoIntroPlayer from '../../../components/common/VideoIntroPlayer';


export default function TutorApprovalPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('under_review');
  const [counts, setCounts] = useState({
    under_review: 0,
    incomplete: 0,
    approved: 0,
    contact_needed: 0,
    rejected: 0,
    all: 0
  });

  // Preview Sanad Modal
  const [sanadModalOpen, setSanadModalOpen] = useState(false);
  const [activeSanads, setActiveSanads] = useState([]);
  const [activeTutorName, setActiveTutorName] = useState('');
  const [activeTutorId, setActiveTutorId] = useState(null);

  // Reject / Contact Modals
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [contactId, setContactId] = useState(null);
  const [contactNotes, setContactNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Single Document Rejection State
  const [docRejectData, setDocRejectData] = useState({
    isOpen: false,
    tutorId: null,
    docId: null,
    docTitle: '',
    reason: ''
  });

  // Verify single document (called inline from card or from modal)
  const handleVerifyDoc = async (tutorId, docId) => {
    if (!tutorId || !docId) return;
    setActionLoading(true);
    try {
      const res = await api.reviewTutorDocument(tutorId, docId, { status: 'verified' });
      if (res.success) {
        setTutors((prev) =>
          prev.map((t) => {
            if (t._id !== tutorId) return t;
            const updatedDocs = (t.sanadDocuments || []).map((d) =>
              d._id === docId ? { ...d, status: 'verified', rejectionReason: '' } : d
            );
            return {
              ...t,
              sanadDocuments: updatedDocs,
              verificationStatus: res.tutor?.verificationStatus || t.verificationStatus
            };
          })
        );
        setActiveSanads((prev) =>
          prev.map((d) => (d._id === docId ? { ...d, status: 'verified', rejectionReason: '' } : d))
        );
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Error reviewing document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySingleDoc = async (docId) => {
    if (!activeTutorId) return;
    await handleVerifyDoc(activeTutorId, docId);
  };

  const openDocRejectModal = ({ tutorId, docId, docTitle }) => {
    setDocRejectData({
      isOpen: true,
      tutorId,
      docId,
      docTitle: docTitle || 'Sanad / Degree Document',
      reason: 'Document scan is blurry or credential is unverified.'
    });
  };

  const handleDocRejectSubmit = async (e) => {
    e.preventDefault();
    const { tutorId, docId, reason } = docRejectData;
    if (!tutorId || !docId || !reason.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.reviewTutorDocument(tutorId, docId, {
        status: 'rejected',
        reason: reason.trim()
      });
      if (res.success) {
        setDocRejectData({ isOpen: false, tutorId: null, docId: null, docTitle: '', reason: '' });
        setTutors((prev) =>
          prev.map((t) => {
            if (t._id !== tutorId) return t;
            const updatedDocs = (t.sanadDocuments || []).map((d) =>
              d._id === docId ? { ...d, status: 'rejected', rejectionReason: reason.trim() } : d
            );
            return { ...t, sanadDocuments: updatedDocs };
          })
        );
        setActiveSanads((prev) =>
          prev.map((d) => (d._id === docId ? { ...d, status: 'rejected', rejectionReason: reason.trim() } : d))
        );
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Error rejecting document');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getTutorQueue(statusFilter);
      if (res.success) {
        setTutors(res.tutors);
        if (res.counts) setCounts(res.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this tutor? Their profile will be made LIVE.')) return;
    setActionLoading(true);
    try {
      const res = await api.approveTutor(id);
      if (res.success) {
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Error approving tutor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectId) return;
    setActionLoading(true);
    try {
      const res = await api.rejectTutor(rejectId, rejectReason);
      if (res.success) {
        setRejectId(null);
        setRejectReason('');
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Error rejecting tutor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactId) return;
    setActionLoading(true);
    try {
      const res = await api.contactTutor(contactId, contactNotes);
      if (res.success) {
        setContactId(null);
        setContactNotes('');
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Error sending contact notice');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Tutor Approval Queue</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect submitted Sanad documents and approve/reject tutor applications.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl text-xs font-bold">
                {[
                  { id: 'under_review', label: 'Under Review', count: counts.under_review, badgeBg: 'bg-blue-600 text-white' },
                  { id: 'incomplete', label: 'Incomplete Profiles', count: counts.incomplete, badgeBg: 'bg-amber-600 text-white' },
                  { id: 'approved', label: 'Approved & Live', count: counts.approved, badgeBg: 'bg-emerald-600 text-white' },
                  { id: 'contact_needed', label: 'Needs Contact', count: counts.contact_needed, badgeBg: 'bg-purple-600 text-white' },
                  { id: 'rejected', label: 'Rejected', count: counts.rejected, badgeBg: 'bg-rose-600 text-white' },
                  { id: 'all', label: 'All Tutors', count: counts.all, badgeBg: 'bg-slate-600 text-white' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${tab.badgeBg}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : tutors.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
                <p className="font-bold text-sm text-slate-700">No tutors found in the {statusFilter.replace('_', ' ')} section.</p>
                <p>Profiles will appear here automatically as tutors register and update their profiles.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {tutors.map((tutor) => {
                  const hasPendingDocs = tutor.sanadDocuments?.some(
                    (d) => d.status === 'pending' || (!d.status && tutor.verificationStatus !== 'approved')
                  );
                  const totalDocs = tutor.sanadDocuments?.length || 0;
                  const verifiedDocs = tutor.sanadDocuments?.filter((d) => d.status === 'verified' || d.status === 'approved').length || 0;

                  return (
                    <div
                      key={tutor._id}
                      className={`bg-white p-6 rounded-3xl border shadow-2xs space-y-4 transition-all ${
                        hasPendingDocs ? 'border-amber-300 ring-1 ring-amber-200/50' : 'border-slate-200'
                      }`}
                    >
                      {/* Top Row: Avatar, Name, Status, and Modal Trigger */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={tutor.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.user?.name || 'T')}&background=0c2217&color=d4a359`}
                            alt="Applicant"
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-slate-900">{tutor.user?.name}</h3>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                tutor.verificationStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : tutor.verificationStatus === 'under_review'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : tutor.verificationStatus === 'incomplete'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}>
                                {tutor.verificationStatus === 'under_review'
                                  ? 'Under Review'
                                  : tutor.verificationStatus === 'incomplete'
                                  ? 'Incomplete Profile'
                                  : tutor.verificationStatus.replace('_', ' ')}
                              </span>

                              {hasPendingDocs && (
                                <span className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>SANAD REVIEW PENDING</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {tutor.user?.email} &bull; {tutor.user?.phone || 'No phone'} &bull; {tutor.localArea || tutor.user?.area ? `${tutor.localArea || tutor.user?.area}, ` : ''}{tutor.user?.city || tutor.city || 'No City'}
                            </p>
                            <p className="text-xs font-semibold text-emerald-800 mt-1">
                              Declared Qualification: {tutor.qualifications || 'Not specified'} ({tutor.experienceYears || 0} Yrs Exp)
                            </p>
                          </div>
                        </div>

                        {/* Open Sanad Modal Button */}
                        <button
                          onClick={() => {
                            setActiveSanads(tutor.sanadDocuments || []);
                            setActiveTutorName(tutor.user?.name || 'Tutor');
                            setActiveTutorId(tutor._id);
                            setSanadModalOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer font-bold text-xs transition-colors shrink-0 ${
                            hasPendingDocs
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <FileText className={`w-4 h-4 ${hasPendingDocs ? 'text-amber-600' : 'text-emerald-600'}`} />
                          <span>Inspect Full Sanad ({totalDocs})</span>
                          {hasPendingDocs && (
                            <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                              NEW
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Profile Completion Bar */}
                      {tutor.completion && (
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Profile Strength &amp; Completion:</span>
                            <span className={`font-black ${tutor.completion.percentage >= 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {Math.min(100, tutor.completion.percentage)}% {tutor.completion.percentage >= 100 ? '(100% Ready for Approval)' : '(Incomplete)'}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all rounded-full ${tutor.completion.percentage >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(100, tutor.completion.percentage)}%` }}
                            />
                          </div>
                          {tutor.completion.items && tutor.completion.items.some(i => !i.done) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-500 font-bold self-center">Missing:</span>
                              {tutor.completion.items.filter(i => !i.done).map(item => (
                                <span key={item.key} className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                  {item.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bio */}
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                        {tutor.bio || 'No teaching bio written yet.'}
                      </p>

                      {/* Video Introduction Inspection (Optional) */}
                      {tutor.videoIntro && (
                        <div className="p-4 bg-violet-50/60 border border-violet-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-violet-200/60">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-violet-100 text-violet-800 rounded-lg">
                                <Video className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                  Applicant Video Introduction
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Optional video intro provided by tutor. Preview playback before approving profile.
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-violet-700 bg-white border border-violet-200 px-2.5 py-1 rounded-full shadow-2xs">
                              Video Attached
                            </span>
                          </div>
                          <div className="max-w-md mx-auto">
                            <VideoIntroPlayer
                              videoUrl={tutor.videoIntro}
                              tutorName={tutor.user?.name || 'Applicant'}
                            />
                          </div>
                        </div>
                      )}


                      {/* ========================================================= */}
                      {/* INLINE SANAD & DEGREE DOCUMENTS REVIEW PANEL             */}
                      {/* ========================================================= */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                Submitted Sanad &amp; Degree Documents ({totalDocs})
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Verify or reject each educational credential individually below.
                              </p>
                            </div>
                          </div>

                          <div className="text-xs font-semibold text-slate-600">
                            {verifiedDocs} of {totalDocs} Verified
                          </div>
                        </div>

                        {totalDocs === 0 ? (
                          <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 italic">
                            No Sanad or educational documents uploaded by this applicant yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tutor.sanadDocuments.map((doc, docIdx) => {
                              const isDocVerified = doc.status === 'verified' || doc.status === 'approved';
                              const isDocRejected = doc.status === 'rejected';
                              const isDocPending = !isDocVerified && !isDocRejected;

                              return (
                                <div
                                  key={doc._id || docIdx}
                                  className={`p-3 bg-white rounded-xl border transition-all ${
                                    isDocPending
                                      ? 'border-amber-300 shadow-xs ring-1 ring-amber-200/60'
                                      : isDocVerified
                                      ? 'border-emerald-200'
                                      : 'border-rose-200'
                                  } flex flex-col justify-between gap-3`}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Thumbnail Preview */}
                                    <div
                                      onClick={() => {
                                        setActiveSanads([doc]);
                                        setActiveTutorName(tutor.user?.name || 'Tutor');
                                        setActiveTutorId(tutor._id);
                                        setSanadModalOpen(true);
                                      }}
                                      className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer flex items-center justify-center group relative hover:opacity-90 transition-opacity"
                                      title="Click to zoom in"
                                    >
                                      {doc.fileUrl && (doc.fileUrl.endsWith('.pdf') || doc.fileType === 'application/pdf') ? (
                                        <div className="flex flex-col items-center justify-center p-1 text-center">
                                          <FileText className="w-6 h-6 text-rose-500" />
                                          <span className="text-[9px] font-bold text-slate-600 uppercase">PDF</span>
                                        </div>
                                      ) : (
                                        <img
                                          src={doc.fileUrl}
                                          alt={doc.title || 'Sanad'}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                      )}
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Eye className="w-4 h-4 text-white" />
                                      </div>
                                    </div>

                                    {/* Info & Status */}
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <h5 className="text-xs font-bold text-slate-900 leading-snug truncate" title={doc.title}>
                                        {doc.title || `Document #${docIdx + 1}`}
                                      </h5>

                                      <div>
                                        {isDocVerified ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Verified Sanad
                                          </span>
                                        ) : isDocRejected ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md">
                                            <AlertCircle className="w-3 h-3 text-rose-600" />
                                            Sanad Rejected
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
                                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                            Pending Review
                                          </span>
                                        )}
                                      </div>

                                      {isDocRejected && doc.rejectionReason && (
                                        <p className="text-[10px] text-rose-600 bg-rose-50/80 p-1.5 rounded-md border border-rose-100">
                                          <strong>Reason:</strong> {doc.rejectionReason}
                                        </p>
                                      )}

                                      <div className="pt-0.5">
                                        <a
                                          href={doc.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] font-semibold text-[#b85d34] hover:underline inline-flex items-center gap-1"
                                        >
                                          <span>Full View</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Direct Inline Action Buttons */}
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      disabled={actionLoading}
                                      onClick={() => handleVerifyDoc(tutor._id, doc._id)}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                                        isDocVerified
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      }`}
                                      title={isDocVerified ? 'Re-verify this Sanad' : 'Approve and verify this Sanad document'}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>{isDocVerified ? 'Verified ✓' : 'Approve Doc'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        openDocRejectModal({
                                          tutorId: tutor._id,
                                          docId: doc._id,
                                          docTitle: doc.title || `Document #${docIdx + 1}`
                                        })
                                      }
                                      className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                                        isDocRejected
                                          ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                      }`}
                                      title="Reject this Sanad document"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>{isDocRejected ? 'Rejected ✕' : 'Reject Doc'}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          {hasPendingDocs ? (
                            <span className="font-semibold text-amber-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              <span>Action required: Sanad credentials pending verification</span>
                            </span>
                          ) : tutor.verificationStatus === 'approved' ? (
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Profile &amp; all credentials verified &amp; live</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-600">
                              Status: {tutor.verificationStatus.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {(tutor.verificationStatus !== 'approved' || hasPendingDocs) && (
                            <button
                              onClick={() => handleApprove(tutor._id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{hasPendingDocs ? 'Approve Tutor & Verify All Sanads' : 'Approve & Make Live'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => setContactId(tutor._id)}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            <span>Contact Applicant</span>
                          </button>

                          {tutor.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => setRejectId(tutor._id)}
                              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject Application</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </main>

        </div>
      </div>

      {/* Sanad Inspection Modal */}
      <SanadModal
        isOpen={sanadModalOpen}
        onClose={() => setSanadModalOpen(false)}
        documents={activeSanads}
        tutorName={activeTutorName}
        isAdmin={true}
        onVerifyDoc={(docId) => handleVerifyDoc(activeTutorId, docId)}
        onRejectDoc={(docId, reason) => {
          const docItem = activeSanads.find((d) => (d._id || d) === docId);
          openDocRejectModal({
            tutorId: activeTutorId,
            docId,
            docTitle: docItem?.title || 'Sanad / Degree Document'
          });
        }}
      />

      {/* Individual Document Rejection Modal */}
      {docRejectData.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-rose-600 mb-1">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Reject Sanad Credential</h3>
              </div>
              <p className="text-xs text-slate-500">
                Rejecting: <span className="font-semibold text-slate-800">{docRejectData.docTitle}</span>
              </p>
            </div>

            <form onSubmit={handleDocRejectSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Quick Reason:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Document image is blurred or illegible',
                    'Missing official stamp or seal',
                    'Name does not match tutor profile',
                    'Degree from unverified institution',
                    'Incomplete certificate scan'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDocRejectData((prev) => ({ ...prev, reason: preset }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        docRejectData.reason === preset
                          ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rejection Reason Note for Tutor:
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain why this credential cannot be verified..."
                  value={docRejectData.reason}
                  onChange={(e) => setDocRejectData((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDocRejectData({ isOpen: false, tutorId: null, docId: null, docTitle: '', reason: '' })}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !docRejectData.reason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Whole Application Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Reject Tutor Application</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <textarea
                rows="3"
                required
                placeholder="State the reason (e.g. Unverifiable credentials / Illegible scan)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Send Clarification Notice</h3>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <textarea
                rows="3"
                required
                placeholder="What details should the applicant update?"
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContactId(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl"
                >
                  Send Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

