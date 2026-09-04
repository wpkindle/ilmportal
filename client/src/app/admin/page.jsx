'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from '../../components/admin/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Handshake,
  CreditCard,
  Video,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Ban,
  Trash2,
  Mail,
  Phone,
  Search,
  RefreshCw,
  X,
  Send,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  // User filters & search
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'student' | 'tutor' | 'warned' | 'under_review' | 'suspended'
  const [selectedUser, setSelectedUser] = useState(null);

  // Modals state
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Forms state
  const [warningForm, setWarningForm] = useState({
    reason: 'Inappropriate Conduct / Disrespect',
    message: '',
    sendEmail: true
  });
  const [statusForm, setStatusForm] = useState({
    status: 'under_review',
    reason: '',
    notes: '',
    sendEmail: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({ message: '', type: '' });

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

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.getAdminUsers({});
      if (res.success) {
        setAllUsers(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  // Stable summary counts for tabs
  const userCounts = useMemo(() => {
    const total = allUsers.length;
    const students = allUsers.filter((u) => u.role === 'student').length;
    const tutors = allUsers.filter((u) => u.role === 'tutor').length;
    const warned = allUsers.filter((u) => (u.warningCount || 0) > 0 || u.status === 'warned').length;
    const underReview = allUsers.filter((u) => u.status === 'under_review').length;
    const suspended = allUsers.filter((u) => u.status === 'suspended' || u.status === 'deactivated' || !u.isActive).length;
    return { total, students, tutors, warned, underReview, suspended };
  }, [allUsers]);

  // Instant reactive client-side filter
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // Tab filter
      if (activeTab === 'student' && u.role !== 'student') return false;
      if (activeTab === 'tutor' && u.role !== 'tutor') return false;
      if (activeTab === 'warned' && (u.warningCount || 0) === 0 && u.status !== 'warned') return false;
      if (activeTab === 'under_review' && u.status !== 'under_review') return false;
      if (activeTab === 'suspended' && u.status !== 'suspended' && u.status !== 'deactivated' && u.isActive !== false) return false;

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.phone?.toLowerCase().includes(q);
        const matchCity = u.city?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCity) return false;
      }

      return true;
    });
  }, [allUsers, activeTab, search]);

  // Open Warning Modal
  const openWarningModal = (u) => {
    setSelectedUser(u);
    setWarningForm({
      reason: 'Inappropriate Conduct / Disrespect',
      message: 'Please ensure all communications and sessions strictly follow IlmPortal community guidelines.',
      sendEmail: true
    });
    setWarningModalOpen(true);
  };

  // Submit Warning
  const handleIssueWarning = async (e) => {
    e.preventDefault();
    if (!selectedUser || !warningForm.message.trim()) return;

    try {
      setActionLoading(true);
      const res = await api.issueUserWarning(selectedUser._id, warningForm);
      if (res.success) {
        setActionFeedback({ message: `Warning strike issued to ${selectedUser.name}!`, type: 'success' });
        setWarningModalOpen(false);
        setAllUsers((prev) =>
          prev.map((u) =>
            u._id === selectedUser._id
              ? { ...u, status: 'warned', warningCount: (u.warningCount || 0) + 1 }
              : u
          )
        );
      }
    } catch (err) {
      setActionFeedback({ message: err.message || 'Error issuing warning', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Status Modal (Under Review / Suspend / Activate)
  const openStatusModal = (u, targetStatus) => {
    setSelectedUser(u);
    setStatusForm({
      status: targetStatus,
      reason: targetStatus === 'under_review' ? 'Investigation into reported conduct' : targetStatus === 'suspended' ? 'Multiple policy infractions' : 'Account verified and approved',
      notes: '',
      sendEmail: true
    });
    setStatusModalOpen(true);
  };

  // Submit Status Change
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const res = await api.updateUserStatus(selectedUser._id, statusForm);
      if (res.success) {
        setActionFeedback({ message: `Account status updated to ${statusForm.status}!`, type: 'success' });
        setStatusModalOpen(false);
        setAllUsers((prev) =>
          prev.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  status: statusForm.status,
                  isActive: statusForm.status !== 'suspended' && statusForm.status !== 'deactivated'
                }
              : u
          )
        );
      }
    } catch (err) {
      setActionFeedback({ message: err.message || 'Error updating status', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setDeleteModalOpen(true);
  };

  // Submit Delete Account
  const handleDeleteAccount = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const res = await api.deleteUserAccount(selectedUser._id);
      if (res.success) {
        setActionFeedback({ message: `Account for ${selectedUser.name} deleted successfully.`, type: 'success' });
        setDeleteModalOpen(false);
        setAllUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      }
    } catch (err) {
      setActionFeedback({ message: err.message || 'Error deleting account', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

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
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Technical Issue</span>;
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
                  <ShieldCheck className="w-8 h-8 text-[#d4a359]" />
                  <span>Admin Control Center</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage student & tutor accounts, review incident reports, verify payments, and oversee platform activity across Pakistan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/users"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Moderation Console</span>
                </Link>
                <button
                  onClick={() => { fetchStats(); fetchUsers(); }}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Action Feedback Alert */}
            {actionFeedback.message && (
              <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
                actionFeedback.type === 'success'
                  ? 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <span>{actionFeedback.message}</span>
                <button onClick={() => setActionFeedback({ message: '', type: '' })} className="p-1 hover:opacity-75 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

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
                <div className="p-2 bg-[#f0ece1] text-[#0c2217] w-fit rounded-xl mb-3 border border-[#d4a359]/30">
                  <Users className="w-5 h-5 text-[#b85d34]" />
                </div>
                <p className="text-2xl font-black text-slate-900">{stats?.totalStudents || userCounts.students}</p>
                <p className="text-xs text-slate-500 font-medium">Registered Students</p>
                <button
                  onClick={() => setActiveTab('student')}
                  className="text-[10px] font-bold text-[#b85d34] hover:underline mt-1 block cursor-pointer"
                >
                  View Students &rarr;
                </button>
              </div>

              {/* Approved Tutors */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="p-2 bg-blue-100 text-blue-700 w-fit rounded-xl mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-blue-600">{stats?.approvedTutors || userCounts.tutors}</p>
                <p className="text-xs text-slate-500 font-medium">Approved Live Tutors</p>
                <button
                  onClick={() => setActiveTab('tutor')}
                  className="text-[10px] font-bold text-blue-700 hover:underline mt-1 block cursor-pointer"
                >
                  View Tutors &rarr;
                </button>
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
                <div className="p-2 bg-[#f0ece1] text-[#0c2217] w-fit rounded-xl mb-3 border border-[#d4a359]/30">
                  <CreditCard className="w-5 h-5 text-[#b85d34]" />
                </div>
                <p className="text-xl font-black text-[#b85d34] font-mono">
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

            {/* ========================================================= */}
            {/* LIVE STUDENT & TUTOR MODERATION & MANAGEMENT CONSOLE      */}
            {/* ========================================================= */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-600" />
                    <span>Student & Tutor Account Controls</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Directly issue policy warnings, place profiles under review, or remove accounts across Pakistan.
                  </p>
                </div>

                {/* Stable Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({userCounts.total})
                  </button>
                  <button
                    onClick={() => setActiveTab('student')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'student'
                        ? 'bg-[#b85d34] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Students ({userCounts.students})
                  </button>
                  <button
                    onClick={() => setActiveTab('tutor')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'tutor'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tutors ({userCounts.tutors})
                  </button>
                  <button
                    onClick={() => setActiveTab('warned')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'warned'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Warned ({userCounts.warned})</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('under_review')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'under_review'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" />
                      <span>Under Review ({userCounts.under_review})</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('suspended')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'suspended'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspended ({userCounts.suspended})</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by student/tutor name, email, city, or phone number in real time..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
                />
              </div>

              {/* Users List Cards */}
              {usersLoading ? (
                <LoadingSpinner text="Fetching platform accounts..." />
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No matching accounts found</p>
                  <p className="text-[11px] text-slate-400">Try selecting a different tab or clearing search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <div
                      key={u._id}
                      className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: User Profile & Details */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0c2217&color=d4a359`}
                          alt={u.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">{u.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'tutor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
                            }`}>
                              {u.role}
                            </span>

                            {/* Status Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.status === 'suspended' || u.status === 'deactivated' || !u.isActive
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : u.status === 'under_review'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200 animate-pulse'
                                : u.status === 'warned'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
                            }`}>
                              {u.status || (u.isActive ? 'active' : 'suspended')}
                            </span>

                            {/* Warning Strike Badge */}
                            {(u.warningCount || 0) > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-2xs">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{u.warningCount} Strike{u.warningCount > 1 ? 's' : ''}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-mono">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.email}</span>
                            </span>
                            {u.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{u.phone}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.city || 'Pakistan'}</span>
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-slate-600">
                              <Handshake className="w-3.5 h-3.5 text-purple-600" />
                              <span>{u.dealCount || 0} Deals</span>
                            </span>
                            {u.reportsCount > 0 && (
                              <span className="flex items-center gap-1 font-bold text-rose-600">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{u.reportsCount} Reports</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons (Warning / Under Review / Suspend / Delete) */}
                      <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
                        
                        {/* Warning Button */}
                        <button
                          onClick={() => openWarningModal(u)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Warning</span>
                        </button>

                        {/* Under Review / Reactivate */}
                        {u.status === 'under_review' ? (
                          <button
                            onClick={() => openStatusModal(u, 'active')}
                            className="px-3 py-1.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openStatusModal(u, 'under_review')}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs rounded-xl border border-orange-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            <span>Under Review</span>
                          </button>
                        )}

                        {/* Suspend / Unban */}
                        {u.status === 'suspended' || u.status === 'deactivated' || !u.isActive ? (
                          <button
                            onClick={() => openStatusModal(u, 'active')}
                            className="px-3 py-1.5 bg-[#f0ece1] hover:bg-[#e4dcce] text-[#0c2217] font-bold text-xs rounded-xl border border-[#d4a359]/40 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                            <span>Unban</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openStatusModal(u, 'suspended')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>Suspend</span>
                          </button>
                        )}

                        {/* Delete Account */}
                        <button
                          onClick={() => openDeleteModal(u)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Permanently Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <CheckCircle2 className="w-8 h-8 text-[#d4a359] mx-auto mb-2" />
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
                              ? 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
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
                <MapPin className="w-5 h-5 text-[#b85d34]" />
                <span>Users Distribution Across Pakistan</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats?.locationStats?.map((loc) => (
                  <div key={loc._id || 'other'} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-800">{loc._id || 'General'}</p>
                    <p className="text-lg font-black text-[#b85d34]">{loc.count} Users</p>
                  </div>
                ))}
              </div>
            </div>

          </main>

        </div>
      </div>

      {/* --- MODAL 1: ISSUE OFFICIAL WARNING --- */}
      {warningModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-black">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Issue Warning to {selectedUser.name}</span>
              </div>
              <button onClick={() => setWarningModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueWarning} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Violation Reason / Category
                </label>
                <select
                  value={warningForm.reason}
                  onChange={(e) => setWarningForm({ ...warningForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="Inappropriate Conduct / Disrespect">Inappropriate Conduct / Disrespect</option>
                  <option value="Off-Platform Contact or Direct Payment Request">Off-Platform Contact or Direct Payment Request</option>
                  <option value="Repeated Classroom Tardiness / No-Show">Repeated Classroom Tardiness / No-Show</option>
                  <option value="Fraudulent Payment Proof Attachment">Fraudulent Payment Proof Attachment</option>
                  <option value="Inaccurate Academic or Sanad Credentials">Inaccurate Academic or Sanad Credentials</option>
                  <option value="Community Policy Violation">Community Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Warning Statement / Directions to User
                </label>
                <textarea
                  rows={4}
                  required
                  value={warningForm.message}
                  onChange={(e) => setWarningForm({ ...warningForm, message: e.target.value })}
                  placeholder="Explain the specific violation clearly and outline required corrective actions..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="sendMainWarnEmail"
                  checked={warningForm.sendEmail}
                  onChange={(e) => setWarningForm({ ...warningForm, sendEmail: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="sendMainWarnEmail" className="text-xs text-slate-600 font-medium">
                  Dispatch official policy notice email to <strong>{selectedUser.email}</strong>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWarningModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'Issuing Strike...' : 'Issue Warning & Strike'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: UPDATE STATUS (UNDER REVIEW / SUSPEND / ACTIVATE) --- */}
      {statusModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              statusForm.status === 'suspended'
                ? 'bg-rose-50 text-rose-900 border-rose-100'
                : statusForm.status === 'under_review'
                ? 'bg-orange-50 text-orange-900 border-orange-100'
                : 'bg-[#f0ece1] text-[#0c2217] border-[#d4a359]/40'
            }`}>
              <div className="flex items-center gap-2 font-black">
                {statusForm.status === 'suspended' ? <Ban className="w-5 h-5 text-rose-600" /> : statusForm.status === 'under_review' ? <Clock className="w-5 h-5 text-orange-600" /> : <CheckCircle2 className="w-5 h-5 text-[#d4a359]" />}
                <span>Set Status: {statusForm.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Status Change
                </label>
                <input
                  type="text"
                  required
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  placeholder="e.g. Account credentials under safety verification..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Administrative Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  placeholder="Record confidential notes for platform admins..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="sendMainStatusEmail"
                  checked={statusForm.sendEmail}
                  onChange={(e) => setStatusForm({ ...statusForm, sendEmail: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="sendMainStatusEmail" className="text-xs text-slate-600 font-medium">
                  Dispatch status notification email to <strong>{selectedUser.email}</strong>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                    statusForm.status === 'suspended'
                      ? 'bg-rose-700 hover:bg-rose-800 text-white'
                      : statusForm.status === 'under_review'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
                  }`}
                >
                  <span>{actionLoading ? 'Updating Status...' : 'Apply Status Change'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: DELETE / REMOVE ACCOUNT CONFIRMATION --- */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-rose-900 font-black">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>Delete Account: {selectedUser.name}</span>
              </div>
              <button onClick={() => setDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete the <strong>{selectedUser.role}</strong> account for <strong>{selectedUser.name}</strong> ({selectedUser.email})?
              </p>
              <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-[11px] text-rose-900 font-medium flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>This will permanently remove their profile, Sanad credentials, cancel pending deals, and purge login access. This action cannot be undone.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'Deleting...' : 'Confirm Delete Account'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
