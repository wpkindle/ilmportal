'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Video,
  Clock,
  MessageSquare,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  CreditCard,
  X,
  GraduationCap,
  Award
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import TrialBanner from '../../../components/common/TrialBanner';
import AccountStatusBanner from '../../../components/common/AccountStatusBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CustomSelect from '../../../components/common/CustomSelect';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [deals, setDeals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment proof modal
  const [selectedDealForPay, setSelectedDealForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [referenceCode, setReferenceCode] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [dealsRes, sessRes, configRes] = await Promise.all([
        api.getMyDeals(),
        api.getMySessions(),
        api.getSystemConfig()
      ]);
      if (dealsRes.success) setDeals(dealsRes.deals);
      if (sessRes.success) setSessions(sessRes.sessions);
      if (configRes.success) setSystemConfig(configRes.config);
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDealForPay || !referenceCode.trim()) return;

    setSubmittingPay(true);
    try {
      const res = await api.submitPaymentProof(selectedDealForPay._id, {
        paymentMethod,
        referenceCode: referenceCode.trim(),
        notes: payNotes.trim()
      });
      if (res.success) {
        setPaySuccess(true);
        fetchDashboardData();
        setTimeout(() => {
          setSelectedDealForPay(null);
          setPaySuccess(false);
          setReferenceCode('');
          setPayNotes('');
        }, 2000);
      }
    } catch (err) {
      alert(err.message || 'Error submitting payment proof');
    } finally {
      setSubmittingPay(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard..." />;
  }

  const activeCourses = deals.filter(d => d.status === 'active_trial' || d.status === 'active_paid');
  const verifiedPaidCourses = deals.filter(d => d.status === 'active_paid' || d.paymentStatus === 'verified');

  return (
    <div className="py-6 md:py-8 pb-24 md:pb-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Top Welcome Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 w-fit">
              <GraduationCap className="w-3.5 h-3.5" />
              Student Learning Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Assalam-o-Alaikum, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your enrolled Quran & academic courses, join in-platform live video classrooms, and manage fee payments.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap">
            <Link
              href="/student/certificates"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>My Certificates</span>
            </Link>

            <Link
              href="/tutors"
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Browse More Tutors</span>
            </Link>
          </div>
        </div>

        {/* Account Status / Warning Notice Banner */}
        <AccountStatusBanner user={user} role="student" />

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-emerald-100 text-emerald-700 w-fit rounded-xl mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{deals.length}</p>
            <p className="text-xs text-slate-500 font-medium">Total Enrolled Deals</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-teal-100 text-teal-700 w-fit rounded-xl mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-teal-600">{activeCourses.length}</p>
            <p className="text-xs text-slate-500 font-medium">Active Courses</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-blue-100 text-blue-700 w-fit rounded-xl mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-blue-600">{verifiedPaidCourses.length}</p>
            <p className="text-xs text-slate-500 font-medium">Verified Paid Subscriptions</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-purple-100 text-purple-700 w-fit rounded-xl mb-3">
              <Video className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-purple-600">{sessions.length}</p>
            <p className="text-xs text-slate-500 font-medium">Live Classes Scheduled</p>
          </div>
        </div>

        {/* Active Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Your Active Courses & Deals</h2>
            <Link href="/student/deals" className="text-xs font-bold text-emerald-700 hover:underline">
              View All Deals
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No active course deals yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Search verified tutors across Pakistan and message them to agree on class timings.
              </p>
              <Link
                href="/tutors"
                className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Find a Tutor
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={deal.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.tutor?.name || 'T')}&background=059669&color=fff`}
                        alt="Tutor"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{deal.subject}</h3>
                        <p className="text-xs text-slate-500">
                          Tutor: <strong className="text-slate-800">{deal.tutor?.name}</strong> ({deal.tutor?.city || 'Pakistan'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {deal.mode !== 'in_person' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && !deal.accessRestricted && (
                        <Link
                          href={`/classroom/${[user?.id || user?._id || '', deal.tutor?._id || ''].sort().join('_')}`}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Live Class</span>
                        </Link>
                      )}
                      <Link
                        href={`/student/messages?conversation=${[user?.id || user?._id || '', deal.tutor?._id || ''].sort().join('_')}`}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Chat</span>
                      </Link>
                    </div>
                  </div>

                  <TrialBanner deal={deal} onPayClick={() => setSelectedDealForPay(deal)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Video Classroom Upcoming Sessions */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900">Upcoming Live Video Sessions</h2>
          {sessions.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 text-center text-xs text-slate-400">
              No live classes scheduled for today. Coordinate with your tutor in chat to schedule a session.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((sess) => (
                <div
                  key={sess._id}
                  className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sess.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tutor: {sess.tutor?.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {sess.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{new Date(sess.scheduledStartTime).toLocaleString()}</span>
                  </div>

                  <Link
                    href={`/classroom/${sess.roomId}`}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join In-Platform Live Class</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Manual Payment Submission Modal */}
      {selectedDealForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Tuition Fee Payment Proof
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDealForPay.subject} &bull; PKR {selectedDealForPay.price?.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDealForPay(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paySuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Payment Proof Submitted!</h4>
                <p className="text-xs text-emerald-700">
                  Our admin team is verifying your Transaction ID (TID). Your access will be confirmed shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-700">
                  <p className="font-bold text-slate-900">
                    Transfer fee (PKR {selectedDealForPay.price?.toLocaleString()}) to:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <p className="font-bold text-emerald-800">JazzCash Account</p>
                      <p className="font-mono">{systemConfig?.paymentInstructions?.jazzcashNumber || '03001234567'}</p>
                      <p className="text-slate-500">{systemConfig?.paymentInstructions?.jazzcashTitle || 'IlmPortal Online'}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <p className="font-bold text-emerald-800">EasyPaisa Account</p>
                      <p className="font-mono">{systemConfig?.paymentInstructions?.easypaisaNumber || '03451234567'}</p>
                      <p className="text-slate-500">{systemConfig?.paymentInstructions?.easypaisaTitle || 'IlmPortal Online'}</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px]">
                    <p className="font-bold text-emerald-800">Bank Transfer ({systemConfig?.paymentInstructions?.bankName || 'Meezan Bank'})</p>
                    <p className="font-mono">IBAN: {systemConfig?.paymentInstructions?.iban || 'PK36MEZN0001020304050607'}</p>
                    <p className="text-slate-500">Title: {systemConfig?.paymentInstructions?.accountTitle || 'IlmPortal Education Pvt Ltd'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Payment Method Used
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'jazzcash', label: 'JazzCash Mobile Account', sublabel: '0300-1234567' },
                      { value: 'easypaisa', label: 'EasyPaisa Account', sublabel: '0345-1234567' },
                      { value: 'bank_transfer', label: 'Online Bank Transfer / Raast', sublabel: 'Meezan Bank IBAN' }
                    ]}
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    variant="filter"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Transaction ID (TID) / Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JC992817291 or Bank Reference Number"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Additional Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid from 0300-XXXXXXX"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDealForPay(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPay || !referenceCode.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                  >
                    {submittingPay ? 'Submitting...' : 'Submit Payment Proof'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

