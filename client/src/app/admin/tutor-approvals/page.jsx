'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { SanadModal } from '../../../components/common/SanadBadge';
import { api } from '../../../services/api';
import { CheckCircle2, XCircle, Mail, FileText, Award, MapPin } from 'lucide-react';

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

  // Reject / Contact Modals
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [contactId, setContactId] = useState(null);
  const [contactNotes, setContactNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
                  Inspect submitted Sanad certificates and approve/reject tutor applications.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl text-xs font-bold">
                {[
                  { id: 'under_review', label: 'Under Review', count: counts.under_review, badgeBg: 'bg-blue-600 text-white' },
                  { id: 'incomplete', label: 'Incomplete Profiles', count: counts.incomplete, badgeBg: 'bg-amber-600 text-white' },
                  { id: 'approved', label: 'Approved & Live', count: counts.approved, badgeBg: 'bg-emerald-600 text-white' },
                  { id: 'approved', label: 'Approved & Live', count: counts.approved, badgeBg: 'bg-[#b85d34] text-white' },
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
              <LoadingSpinner text="Loading applicant queue..." />
            ) : tutors.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
                <p className="font-bold text-sm text-slate-700">No tutors found in the {statusFilter.replace('_', ' ')} section.</p>
                <p>Profiles will appear here automatically as tutors register and update their profiles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <div
                    key={tutor._id}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={tutor.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.user?.name || 'T')}&background=0c2217&color=d4a359`}
                          alt="Applicant"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">{tutor.user?.name}</h3>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              tutor.verificationStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                ? 'bg-[#f0ece1] text-[#0c2217] border-[#d4a359]/40'
                                : tutor.verificationStatus === 'under_review'
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : tutor.verificationStatus === 'incomplete'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}>
                              {tutor.verificationStatus === 'under_review'
                                ? 'Under Review (100% Done)'
                                : tutor.verificationStatus === 'incomplete'
                                ? 'Incomplete Profile'
                                : tutor.verificationStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {tutor.user?.email} &bull; {tutor.user?.phone} &bull; {tutor.user?.city || 'No City'}
                          </p>
                          <p className="text-xs font-semibold text-emerald-800 mt-1">
                          <p className="text-xs font-semibold text-[#0c2217] mt-1">
                            Degree/Sanad: {tutor.qualifications || 'Not specified'} ({tutor.experienceYears} Yrs Exp)
                          </p>
                        </div>
                      </div>

                      {/* Sanad preview button */}
                      <button
                        onClick={() => {
                          setActiveSanads(tutor.sanadDocuments || []);
                          setActiveTutorName(tutor.user?.name || 'Tutor');
                          setSanadModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5"
                        className="px-3 py-1.5 bg-[#f0ece1] hover:bg-[#e6ded1] text-[#0c2217] font-bold text-xs rounded-xl border border-[#d4a359]/40 flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <FileText className="w-4 h-4 text-[#d4a359]" />
                        <span>Inspect Sanad ({tutor.sanadDocuments?.length || 0})</span>
                      </button>
                    </div>

                    {/* Profile Completion Bar */}
                    {tutor.completion && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Profile Strength & Completion:</span>
                          <span className={`font-black ${tutor.completion.percentage >= 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          <span className={`font-black ${tutor.completion.percentage >= 100 ? 'text-[#0c2217]' : 'text-amber-700'}`}>
                            {tutor.completion.percentage}% {tutor.completion.percentage >= 100 ? '(100% Ready for Approval)' : '(Incomplete)'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all rounded-full ${tutor.completion.percentage >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            className={`h-full transition-all rounded-full ${tutor.completion.percentage >= 100 ? 'bg-[#b85d34]' : 'bg-amber-500'}`}
                            style={{ width: `${tutor.completion.percentage}%` }}
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

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                      {tutor.bio || 'No teaching bio written yet.'}
                    </p>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                      {tutor.verificationStatus !== 'approved' && (
                        <button
                          onClick={() => handleApprove(tutor._id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                          className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Make Live</span>
                        </button>
                      )}

                      <button
                        onClick={() => setContactId(tutor._id)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Contact Applicant</span>
                      </button>

                      {tutor.verificationStatus !== 'rejected' && (
                        <button
                          onClick={() => setRejectId(tutor._id)}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </main>

        </div>
      </div>

      {/* Sanad Preview Modal */}
      <SanadModal
        isOpen={sanadModalOpen}
        onClose={() => setSanadModalOpen(false)}
        documents={activeSanads}
        tutorName={activeTutorName}
      />

      {/* Reject Modal */}
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

