'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MessageSquare,
  FileText,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [notifyReportedUser, setNotifyReportedUser] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedSnapshotId, setExpandedSnapshotId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.getReports(params);
      if (res.success) {
        setReports(res.reports || []);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.updateReportStatus(reportId, {
        status: newStatus,
        adminNotes: adminNotes.trim(),
        adminResponse: adminResponse.trim() || adminNotes.trim(),
        notifyReportedUser
      });
      if (res.success) {
        setSelectedReport(null);
        setAdminNotes('');
        setAdminResponse('');
        setNotifyReportedUser(false);
        fetchReports();
      }
    } catch (err) {
      alert(err.message || 'Error updating report status');
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'inappropriate_behavior':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Inappropriate Behavior</span>;
      case 'off_platform_contact':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Off-Platform Contact</span>;
      case 'harassment':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">Harassment / Safety</span>;
      case 'financial_dispute':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Payment Dispute</span>;
      case 'attendance_dispute':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Attendance Dispute</span>;
      case 'technical_issue':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Technical Issue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">General Issue</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <AdminSidebar />

        <main className="flex-1 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-black text-white">Incident & Safety Reports</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Review and moderate user reported safety concerns, policy violations, and disputes.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl self-start">
              {['all', 'pending', 'under_review', 'resolved', 'dismissed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Content List */}
          {loading ? (
            <LoadingSpinner text="Loading incident reports..." />
          ) : reports.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-base">No Reports Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'No safety or incident reports have been submitted yet. The platform is running smoothly!'
                  : `No reports matching filter '${statusFilter}'.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const isExpanded = expandedSnapshotId === report._id;

                return (
                  <div
                    key={report._id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(report.category)}
                        <span className="text-xs text-slate-400 font-mono">
                          Ref: #{report._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        report.status === 'pending'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : report.status === 'under_review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : report.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {report.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Parties Involved */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Reporter Box */}
                      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center gap-3">
                        <img
                          src={report.reporter?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporter?.name || 'Reporter')}&background=059669&color=fff`}
                          alt="Reporter"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="text-xs">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Reported By</span>
                          <p className="font-bold text-white">{report.reporter?.name || 'Unknown'}</p>
                          <p className="text-slate-400 capitalize">{report.reporter?.role} • {report.reporter?.email}</p>
                        </div>
                      </div>

                      {/* Reported User Box */}
                      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center gap-3">
                        <img
                          src={report.reportedUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reportedUser?.name || 'Reported')}&background=e11d48&color=fff`}
                          alt="Reported User"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="text-xs">
                          <span className="text-[10px] uppercase font-bold text-rose-400 block">Reported User</span>
                          <p className="font-bold text-white">{report.reportedUser?.name || 'Unknown'}</p>
                          <p className="text-slate-400 capitalize">{report.reportedUser?.role} • {report.reportedUser?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Incident Statement</span>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{report.description}</p>
                    </div>

                    {/* Chat Snapshot (if present) */}
                    {report.chatSnapshot && report.chatSnapshot.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedSnapshotId(isExpanded ? null : report._id)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Chat Context Snapshot ({report.chatSnapshot.length} messages)</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                            {report.chatSnapshot.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 border-b border-slate-800/60 pb-1.5">
                                <span className="font-bold text-indigo-300 shrink-0">{item.sender}:</span>
                                <span className="text-slate-300">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Official Response to User & Internal Notes */}
                    <div className="space-y-2">
                      {report.adminResponse && (
                        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Official User Response (Displayed in Student/Tutor Profile):</span>
                          </div>
                          <p className="text-slate-200 leading-relaxed pl-5">{report.adminResponse}</p>
                        </div>
                      )}

                      {report.adminNotes && report.adminNotes !== report.adminResponse && (
                        <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-2xl text-xs space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-purple-300 block">Internal Admin Notes</span>
                          <p className="text-slate-300">{report.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                      <div className="text-xs text-slate-400">
                        {report.resolvedBy && (
                          <span>Moderated by {report.resolvedBy.name || 'Admin'}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {report.status !== 'under_review' && report.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(report._id, 'under_review')}
                            disabled={actionLoading}
                            className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Mark Under Review
                          </button>
                        )}
                        {report.status !== 'resolved' && (
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setAdminNotes(report.adminNotes || '');
                              setAdminResponse(report.adminResponse || '');
                              setNotifyReportedUser(false);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                          >
                            Resolve &amp; Notify
                          </button>
                        )}
                        {report.status !== 'dismissed' && (
                          <button
                            onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                            disabled={actionLoading}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Dismiss
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

      {/* Resolution Notes Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Resolve Incident &amp; Send Profile Response</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide an official response message for <strong className="text-slate-200">{selectedReport.reporter?.name}</strong>. This will trigger a notification and appear in their profile.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-emerald-400 block mb-1">
                  Official Response to User (Visible on Profile &amp; Notification) *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Our safety team reviewed the class recording. The tutor has been issued an official warning and account restriction has been applied."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Internal Staff Notes (Optional - Staff Only)
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal notes, moderation ticket ID, or investigation details..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 outline-none focus:border-slate-700 resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={notifyReportedUser}
                  onChange={(e) => setNotifyReportedUser(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <span>Also dispatch community guideline resolution notice to the reported user</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionLoading ? 'Saving...' : 'Resolve & Notify Users'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

