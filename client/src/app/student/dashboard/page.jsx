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
  GraduationCap,
  Award
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import TrialBanner from '../../../components/common/TrialBanner';
import AccountStatusBanner from '../../../components/common/AccountStatusBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [deals, setDeals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);

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
              Track your enrolled Quran & academic courses and join in-platform live video classrooms.
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Courses
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {deals.filter((d) => ['active_trial', 'continuation_agreed', 'active_paid'].includes(d.status)).length}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-teal-100 text-teal-700 w-fit rounded-xl mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Tutors
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {new Set(deals.map((d) => d.tutor?._id || d.tutor)).size}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-amber-100 text-amber-700 w-fit rounded-xl mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Trial In Progress
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {deals.filter((d) => d.status === 'active_trial').length}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="p-2 bg-purple-100 text-purple-700 w-fit rounded-xl mb-3">
              <Video className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scheduled Sessions
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {sessions.length}
            </h3>
          </div>
        </div>

        {/* Active Enrolled Courses & Trials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Enrolled Courses & Active Trials</h2>
            <Link
              href="/student/deals"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Manage Deals & Reviews &rarr;
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 text-center space-y-3">
              <p className="text-xs text-slate-500">
                You haven&apos;t enrolled in any courses or trial lessons yet.
              </p>
              <Link
                href="/tutors"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <span>Find Qualified Tutors</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={deal.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.tutor?.name || 'T')}&background=059669&color=fff`}
                        alt="Tutor"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{deal.subject}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tutor: <strong className="text-slate-800">{deal.tutor?.name}</strong> &bull;{' '}
                          {deal.mode === 'online' ? 'Online Video Class' : 'In-Person'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {deal.mode !== 'in_person' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && !deal.accessRestricted && (
                        <Link
                          href={`/classroom/${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Live Class</span>
                        </Link>
                      )}

                      <Link
                        href={`/student/messages?conversation=${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Chat</span>
                      </Link>
                    </div>
                  </div>

                  <TrialBanner deal={deal} />
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
    </div>
  );
}

