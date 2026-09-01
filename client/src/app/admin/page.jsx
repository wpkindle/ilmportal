'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import {
  Users,
  ShieldCheck,
  Handshake,
  CreditCard,
  Video,
  MapPin,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getAdminStats();
        if (res.success) setStats(res.stats);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin analytics..." />;

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'inappropriate_behavior':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Inappropriate Behavior</span>;
      case 'off_platform_contact':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Off-Platform Contact</span>;
      case 'harassment':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Harassment / Safety</span>;
      case 'financial_dispute':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Payment Dispute</span>;
      case 'attendance_dispute':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Attendance Dispute</span>;
      case 'technical_issue':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Technical Issue</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">General Concern</span>;
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Administrative Control & Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time metrics, safety incident reports, tutor approvals queue, manual payment verification, and CMS across Pakistan.
              </p>
            </div>

            {/* Key Metric Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              
              {/* Safety & Incident Reports Metric */}
              <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-2xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  {stats?.pendingReportsCount > 0 && (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-full animate-pulse">
                      Action Required
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-rose-600">{stats?.pendingReportsCount || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Pending Incident Reports</p>
                <Link
                  href="/admin/reports"
                  className="text-[11px] font-bold text-rose-700 hover:underline mt-2 flex items-center gap-1 block"
                >
                  <span>Review Reports ({stats?.totalReportsCount || 0} Total)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Registered Students */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="p-2 bg-emerald-100 text-emerald-700 w-fit rounded-xl mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-slate-900">{stats?.totalStudents || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Registered Students</p>
              </div>

              {/* Approved Tutors */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="p-2 bg-blue-100 text-blue-700 w-fit rounded-xl mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-blue-600">{stats?.approvedTutors || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Approved Live Tutors</p>
              </div>

              {/* Pending Tutor Approvals */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="p-2 bg-amber-100 text-amber-700 w-fit rounded-xl mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-amber-600">{stats?.pendingTutorApprovals || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Pending Approvals</p>
                {stats?.pendingTutorApprovals > 0 && (
                  <Link href="/admin/tutor-approvals" className="text-[10px] font-bold text-amber-700 hover:underline mt-1 block">
                    Review Queue &rarr;
                  </Link>
                )}
              </div>

              {/* Total Deals */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="p-2 bg-purple-100 text-purple-700 w-fit rounded-xl mb-3">
                  <Handshake className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-purple-600">{stats?.totalDeals || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Total Course Deals</p>
              </div>

              {/* Verified Payments */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="p-2 bg-teal-100 text-teal-700 w-fit rounded-xl mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <p className="text-xl font-black text-teal-700 font-mono">
                  PKR {stats?.totalRevenue?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-slate-500 font-medium">Verified Payments</p>
              </div>

              {/* Completed Classes */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="p-2 bg-rose-100 text-rose-700 w-fit rounded-xl mb-3">
                  <Video className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-rose-600">{stats?.completedSessions || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Completed Classes</p>
              </div>

            </div>

            {/* Recent Incident & Safety Reports Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recent Incident & Safety Reports
                    </h3>
                    <p className="text-xs text-slate-500">
                      Conversations and issues reported by students & tutors
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/reports"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <span>Open Reports Console</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {!stats?.recentReports || stats.recentReports.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Incident Reports Filed</p>
                  <p className="text-[11px] text-slate-400">All student and tutor interactions are currently in good standing.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentReports.map((report) => (
                    <div
                      key={report._id}
                      className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getCategoryBadge(report.category)}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            report.status === 'pending'
                              ? 'bg-rose-100 text-rose-800'
                              : report.status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : report.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {report.status?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(report.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {report.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>
                            By: <strong>{report.reporter?.name || 'User'}</strong> ({report.reporter?.role})
                          </span>
                          <span>&bull;</span>
                          <span>
                            Against: <strong>{report.reportedUser?.name || 'User'}</strong> ({report.reportedUser?.role})
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/admin/reports"
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs self-start sm:self-center shrink-0 transition-all"
                      >
                        Review Report &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* City Distribution Table */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Users Distribution Across Pakistan</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats?.locationStats?.map((loc) => (
                  <div key={loc._id || 'other'} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-800">{loc._id || 'General'}</p>
                    <p className="text-lg font-black text-emerald-700">{loc.count} Users</p>
                  </div>
                ))}
              </div>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
}
