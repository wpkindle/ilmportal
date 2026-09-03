'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Info,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';

export default function SafetyReportsSection({ userRole = 'student' }) {
  const [reportsFiled, setReportsFiled] = useState([]);
  const [reportsReceived, setReportsReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('filed'); // 'filed' | 'received'

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await api.getMyReports();
      if (res.success) {
        setReportsFiled(res.filedByMe || []);
        setReportsReceived(res.filedAgainstMe || []);
      }
    } catch (err) {
      console.error('Error fetching safety reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Under Review</span>
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Closed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'inappropriate_behavior':
        return 'Inappropriate Behavior';
      case 'off_platform_contact':
        return 'Off-Platform Contact';
      case 'harassment':
        return 'Harassment & Safety';
      case 'attendance_dispute':
        return 'Attendance / Class Issue';
      case 'financial_dispute':
        return 'Fee / Payment Dispute';
      case 'technical_issue':
        return 'Technical / Call Malfunction';
      default:
        return 'General Incident';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section id="safety-reports" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-24 transition-all">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs border border-emerald-200">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Safety Reports &amp; Admin Responses
              </h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Trust &amp; Safety Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track live status updates and official administrative resolutions for any reports involving your account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMyReports}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/safety"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safety Policy</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-3 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('filed')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'filed'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Reports Filed by You</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'filed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {reportsFiled.length}
          </span>
        </button>

        {reportsReceived.length > 0 && (
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'received'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Conduct Notices</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {reportsReceived.length}
            </span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-medium">Checking safety registry &amp; incident logs...</p>
          </div>
        ) : activeTab === 'filed' ? (
          reportsFiled.length === 0 ? (
            /* Empty State */
            <div className="text-center py-10 px-4 space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                No Active Incident Reports
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have not filed any incident reports. Your learning sessions and interactions are fully protected by our End-to-End Encryption and Safe-Room protocols.
              </p>
              <div className="pt-2">
                <Link
                  href={userRole === 'tutor' ? '/tutor/messages' : '/student/messages'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>Go to Messages</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reports List */
            <div className="space-y-4">
              {reportsFiled.map((report) => (
                <div
                  key={report._id}
                  className="border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-emerald-300/80 transition-all bg-white shadow-2xs space-y-3.5"
                >
                  {/* Top Row: Category + Status + Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-800 text-[11px]">
                        {getCategoryLabel(report.category)}
                      </span>
                      {getStatusBadge(report.status)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Filed on {formatDate(report.createdAt)}
                    </span>
                  </div>

                  {/* Reported Party info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-xs overflow-hidden shrink-0">
                      {report.reportedUser?.avatar ? (
                        <img src={report.reportedUser.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        report.reportedUser?.name?.[0] || '?'
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Reported User: {report.reportedUser?.name || 'Classroom Participant'}
                      </p>
                      <p className="text-[11px] text-slate-500 capitalize">
                        Role: {report.reportedUser?.role || 'User'}
                      </p>
                    </div>
                  </div>

                  {/* User's Original Complaint Description */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <p className="font-bold text-slate-800 text-[11px] mb-1">Your Complaint Details:</p>
                    <p className="whitespace-pre-line leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* OFFICIAL ADMINISTRATION RESPONSE */}
                  {report.adminResponse ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-black">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Official Admin Response &amp; Resolution:</span>
                        </div>
                        {report.resolvedAt && (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {formatDate(report.resolvedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-950 font-medium whitespace-pre-line leading-relaxed pl-5">
                        {report.adminResponse}
                      </p>
                      <div className="pt-1 pl-5 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>Action handled by: {report.resolvedBy?.name || 'Trust & Safety Moderator'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Our compliance moderators review incident logs and audio/video recordings within 12–24 hours. You will receive an on-platform notification when updated.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Reports Concerning You (Conduct Notices) */
          <div className="space-y-4">
            {reportsReceived.map((report) => (
              <div
                key={report._id}
                className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-800 text-[11px]">
                      {getCategoryLabel(report.category)}
                    </span>
                    {getStatusBadge(report.status)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Updated {formatDate(report.updatedAt || report.createdAt)}
                  </span>
                </div>

                {report.adminResponse ? (
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Administration Community Guidance:</span>
                    </div>
                    <p className="text-blue-950 whitespace-pre-line leading-relaxed pl-5">
                      {report.adminResponse}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    A standard review inquiry was processed according to community standards.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Bottom Guarantee */}
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Need immediate protection or wish to report harassment? Our emergency response team operates 24/7.</span>
        </div>
        <Link
          href="/safety"
          className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Safety Guidelines</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
