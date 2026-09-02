'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Users,
  BookOpen,
  Clock,
  CreditCard,
  Video,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  FileText,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import TrialBanner from '../../../components/common/TrialBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AccountStatusBanner from '../../../components/common/AccountStatusBanner';

export default function TutorDashboardPage() {
  const { user, tutorProfile } = useAuth();
  const [deals, setDeals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealsRes, sessRes] = await Promise.all([
          api.getMyDeals(),
          api.getMySessions()
        ]);
        if (dealsRes.success) setDeals(dealsRes.deals);
        if (sessRes.success) setSessions(sessRes.sessions);
      } catch (err) {
        console.error('Error fetching tutor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading tutor workspace..." />;

  const isApproved = tutorProfile?.verificationStatus === 'approved';
  const isPending = tutorProfile?.verificationStatus === 'pending';
  const isContactNeeded = tutorProfile?.verificationStatus === 'contact_needed';

  const activeTrialDeals = deals.filter(d => d.status === 'active_trial');
  const activePaidDeals = deals.filter(d => d.status === 'active_paid');

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Account Status / Warning Notice / Audit Banner */}
        <AccountStatusBanner user={user} role="tutor" />

        {/* Verification Status Banner */}
        {isPending && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between gap-4 text-amber-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-600 animate-spin" />
              <div>
                <h4 className="font-bold text-sm">Account Status: Pending Admin Verification</h4>
                <p className="text-xs text-amber-700">
                  Your Sanad credentials have been submitted and are being reviewed by the IlmPortal administrative team.
                </p>
              </div>
            </div>
            <Link
              href="/tutor/profile"
              className="px-3.5 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-amber-700 whitespace-nowrap"
            >
              Review Sanad Documents
            </Link>
          </div>
        )}

        {isContactNeeded && (
          <div className="p-5 bg-orange-50 border border-orange-200 rounded-3xl flex items-center justify-between gap-4 text-orange-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <h4 className="font-bold text-sm">Clarification Required on Your Application</h4>
                <p className="text-xs text-orange-700">
                  Admin Note: {tutorProfile?.contactNotes || 'Please upload a clearer scan of your Sanad.'}
                </p>
              </div>
            </div>
            <Link
              href="/tutor/profile"
              className="px-3.5 py-1.5 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-orange-700"
            >
              Update Credentials
            </Link>
          </div>
        )}

        {isApproved && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-slate-950 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                Verified & Live on IlmPortal Pakistan
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Assalam-o-Alaikum, {user?.name}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Your profile is active across all Pakistani regions. Manage ongoing student courses, monitor trial status, and conduct live WebRTC classes.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/tutor/messages"
                className="px-4 py-2.5 bg-white text-slate-950 font-bold text-xs rounded-xl shadow-md hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Chat & Send Offers</span>
              </Link>
              <Link
                href="/tutor/profile"
                className="px-4 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 border border-emerald-600"
              >
                <Award className="w-4 h-4" />
                <span>Edit Profile & Sanad</span>
              </Link>
            </div>
          </div>
        )}

        {/* Course Studio Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 text-white border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                COURSE STUDIO
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">Author & Manage Your Curriculum Courses</h3>
              <p className="text-xs text-slate-300">Add chapters, lessons, diagnostic tests, and homework assignments.</p>
            </div>
          </div>
          <Link
            href="/tutor/courses"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 shrink-0 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Open Course Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-emerald-100 text-emerald-700 w-fit rounded-xl mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{deals.length}</p>
            <p className="text-xs text-slate-500 font-medium">Total Student Deals</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-amber-100 text-amber-700 w-fit rounded-xl mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-amber-600">{activeTrialDeals.length}</p>
            <p className="text-xs text-slate-500 font-medium">Active Trials (Tutor View)</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-blue-100 text-blue-700 w-fit rounded-xl mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-blue-600">{activePaidDeals.length}</p>
            <p className="text-xs text-slate-500 font-medium">Paid Subscriptions</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-purple-100 text-purple-700 w-fit rounded-xl mb-3">
              <Video className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-purple-600">{sessions.length}</p>
            <p className="text-xs text-slate-500 font-medium">Classes Conducted</p>
          </div>
        </div>

        {/* Ongoing Deals & Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Ongoing Student Course Deals</h2>
            <Link href="/tutor/deals" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 text-center text-xs text-slate-400">
              No active student deals yet. Message interested students to send your course deal offer.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.map((deal) => (
                <div key={deal._id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={deal.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.student?.name || 'S')}&background=059669&color=fff`}
                        alt="Student"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{deal.subject}</h3>
                        <p className="text-xs text-slate-500">
                          Student: <strong>{deal.student?.name}</strong> ({deal.student?.city || 'Pakistan'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Join Live Classroom */}
                      {deal.mode !== 'in_person' && (
                        <Link
                          href={`/classroom/${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Live Class</span>
                        </Link>
                      )}
                      <Link
                        href={`/tutor/messages?conversation=${[user?.id || user?._id, deal.student?._id].sort().join('_')}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Chat</span>
                      </Link>
                    </div>
                  </div>

                  <TrialBanner deal={deal} onPayClick={() => {}} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

