'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import {
  Users,
  Search,
  AlertTriangle,
  ShieldAlert,
  Ban,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MapPin,
  Handshake,
  AlertCircle,
  X,
  Send,
  RefreshCw
} from 'lucide-react';

export default function AdminUsersModerationPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'student' | 'tutor' | 'warned' | 'under_review' | 'suspended'
  const [selectedUser, setSelectedUser] = useState(null);

  // Modals state
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form states
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers({});
      if (res.success) {
        setAllUsers(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stable summary counts computed across ALL users (never drops when clicking tabs!)
  const stats = useMemo(() => {
    const total = allUsers.length;
    const students = allUsers.filter((u) => u.role === 'student').length;
    const tutors = allUsers.filter((u) => u.role === 'tutor').length;
    const warned = allUsers.filter((u) => (u.warningCount || 0) > 0 || u.status === 'warned').length;
    const underReview = allUsers.filter((u) => u.status === 'under_review').length;
    const suspended = allUsers.filter((u) => u.status === 'suspended' || u.status === 'deactivated' || !u.isActive).length;
    return { total, students, tutors, warned, underReview, suspended };
  }, [allUsers]);

  // Instant reactive client-side filter (0ms latency, no server roundtrips on tab switch!)
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

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
                  <ShieldAlert className="w-8 h-8 text-purple-600" />
                  <span>User Accounts & Moderation</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage student and tutor accounts across Pakistan, issue official warnings, place profiles under review, or remove accounts.
                </p>
              </div>

              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs self-start sm:self-center transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>
            </div>

            {/* Action Feedback Banner */}
            {actionFeedback.message && (
              <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <span>{actionFeedback.message}</span>
                <button onClick={() => setActionFeedback({ message: '', type: '' })} className="p-1 hover:opacity-75 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Persistent Summary Stats Cards (Never drops when clicking tabs!) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                <p className="text-[11px] text-slate-500 font-medium">Total Accounts</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-2xl font-black text-emerald-600">{stats.students}</p>
                <p className="text-[11px] text-slate-500 font-medium">Students</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-2xl font-black text-blue-600">{stats.tutors}</p>
                <p className="text-[11px] text-slate-500 font-medium">Tutors</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
                <p className="text-2xl font-black text-amber-600">{stats.warned}</p>
                <p className="text-[11px] text-slate-500 font-medium">Warned Accounts</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
                <p className="text-2xl font-black text-rose-600">{stats.underReview + stats.suspended}</p>
                <p className="text-[11px] text-slate-500 font-medium">Under Review / Suspended</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              
              {/* Stable Role & Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Users ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('student')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Students ({stats.students})
                </button>
                <button
                  onClick={() => setActiveTab('tutor')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'tutor'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tutors ({stats.tutors})
                </button>
                <button
                  onClick={() => setActiveTab('warned')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'warned'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Warned ({stats.warned})</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('under_review')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'under_review'
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>Under Review ({stats.underReview})</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('suspended')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'suspended'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspended ({stats.suspended})</span>
                  </span>
                </button>
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="under_review">Under Review Only</option>
                  <option value="warned">Warned Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
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
            </div>

            {/* Users Table List */}
            {loading ? (
              <LoadingSpinner text="Fetching platform accounts..." />
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No accounts match the selected filter</h3>
                <p className="text-xs text-slate-400">Try selecting a different tab or clearing your search keywords.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* User Identity Left */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0c2217&color=ffffff`}
                        alt={u.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{u.name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : u.role === 'tutor'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {u.role}
                          </span>

                          {/* Status Badge */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'suspended' || u.status === 'deactivated' || !u.isActive
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : u.status === 'under_review'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200 animate-pulse'
                              : u.status === 'warned'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {u.status || (u.isActive ? 'active' : 'suspended')}
                          </span>

                          {/* Strikes Counter Badge */}
                          {(u.warningCount || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-2xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{u.warningCount} Strike{u.warningCount > 1 ? 's' : ''}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
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

                    {/* Action Buttons Right */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                      
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
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                  id="sendWarnEmail"
                  checked={warningForm.sendEmail}
                  onChange={(e) => setWarningForm({ ...warningForm, sendEmail: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="sendWarnEmail" className="text-xs text-slate-600 font-medium">
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
                : 'bg-emerald-50 text-emerald-900 border-emerald-100'
            }`}>
              <div className="flex items-center gap-2 font-black">
                {statusForm.status === 'suspended' ? <Ban className="w-5 h-5 text-rose-600" /> : statusForm.status === 'under_review' ? <Clock className="w-5 h-5 text-orange-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
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
                  id="sendStatusEmail"
                  checked={statusForm.sendEmail}
                  onChange={(e) => setStatusForm({ ...statusForm, sendEmail: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="sendStatusEmail" className="text-xs text-slate-600 font-medium">
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
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
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
