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
    <div className="py-6 md:py-8 pb-24 md:pb-12 bg-[#faf8f5] min-h-screen text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Top Editorial Welcome Card */}
        <div className="bg-[#0c2217] text-[#faf8f5] rounded-3xl p-6 sm:p-9 border border-[#d4a359]/30 shadow-[0_8px_30px_rgba(12,34,23,0.12)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Subtle background radial motif */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#143d2b]/40 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-[#d4a359]/10 blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4a359] bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 border border-[#d4a359]/20">
                <GraduationCap className="w-3.5 h-3.5" />
                Talib-e-Ilm &bull; Learning Space
              </span>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Female Privacy Protected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#faf8f5] tracking-tight">
              Assalam-o-Alaikum, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              Track your enrolled Quran &amp; academic courses, schedule lessons with verified Pakistani teachers, and enter protected live classrooms.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap">
            <Link
              href="/student/certificates"
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-[#faf8f5] font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-[#d4a359]" />
              <span>My Certificates</span>
            </Link>

            <Link
              href="/tutors"
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#d4a359] hover:bg-[#c39248] active:bg-[#b08139] text-[#0c2217] font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Browse Verified Tutors</span>
            </Link>
          </div>
        </div>

        {/* Account Status / Warning Notice Banner */}
        <AccountStatusBanner user={user} role="student" />

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#e6dfd5] shadow-xs hover:border-[#d4a359]/50 transition-all">
            <div className="p-2.5 bg-[#eef5f0] text-[#143d2b] w-fit rounded-2xl mb-3 border border-[#c3dfcb]">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Enrolled Courses
            </p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2217] mt-1">
              {deals.filter((d) => ['active_trial', 'continuation_agreed', 'active_paid'].includes(d.status)).length}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#e6dfd5] shadow-xs hover:border-[#d4a359]/50 transition-all">
            <div className="p-2.5 bg-[#fdf6ec] text-[#b8863b] w-fit rounded-2xl mb-3 border border-[#f2dfbe]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Active Tutors
            </p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2217] mt-1">
              {new Set(deals.map((d) => d.tutor?._id || d.tutor)).size}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#e6dfd5] shadow-xs hover:border-[#d4a359]/50 transition-all">
            <div className="p-2.5 bg-[#fdf2f0] text-[#b85d34] w-fit rounded-2xl mb-3 border border-[#f5d6cf]">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Trial In Progress
            </p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2217] mt-1">
              {deals.filter((d) => d.status === 'active_trial').length}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#e6dfd5] shadow-xs hover:border-[#d4a359]/50 transition-all">
            <div className="p-2.5 bg-[#f5eff9] text-[#7c3aed] w-fit rounded-2xl mb-3 border border-[#e2d4f2]">
              <Video className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Scheduled Sessions
            </p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2217] mt-1">
              {sessions.length}
            </h3>
          </div>
        </div>

        {/* Active Enrolled Courses & Trials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">Enrolled Courses &amp; Active Trials</h2>
              <p className="text-xs text-stone-500">Live tutoring arrangements and ongoing courses</p>
            </div>
            <Link
              href="/student/deals"
              className="text-xs font-bold text-[#143d2b] hover:text-[#0c2217] flex items-center gap-1 group"
            >
              <span>Manage Deals &amp; Reviews</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#e6dfd5] text-center space-y-3 shadow-xs">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-800">No Enrolled Courses Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore verified Qaris, female Alimahs, and academic tutors across Pakistan to start your first trial class.
              </p>
              <Link
                href="/tutors"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <span>Find Qualified Tutors</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white p-6 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-4 hover:border-[#d4a359]/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={deal.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.tutor?.name || 'T')}&background=0c2217&color=faf8f5`}
                        alt="Tutor"
                        className="w-12 h-12 rounded-2xl object-cover border border-[#e6dfd5]"
                      />
                      <div>
                        <h3 className="font-serif font-bold text-base text-stone-900">{deal.subject}</h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Tutor: <strong className="text-stone-800">{deal.tutor?.name}</strong> &bull;{' '}
                          <span className="text-[#143d2b] font-medium">
                            {deal.mode === 'online' ? 'Online WebRTC Video Class' : 'In-Person'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {deal.mode !== 'in_person' && ['active_trial', 'continuation_agreed', 'active_paid'].includes(deal.status) && !deal.accessRestricted && (
                        <Link
                          href={`/classroom/${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                          className="px-4 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm border border-[#d4a359]/30 transition-all"
                        >
                          <Video className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>Join Live Class</span>
                        </Link>
                      )}

                      <Link
                        href={`/student/messages?conversation=${[user?.id || user?._id, deal.tutor?._id].sort().join('_')}`}
                        className="px-4 py-2.5 bg-[#faf8f5] hover:bg-[#f3ede2] text-stone-800 border border-[#e6dfd5] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-[#143d2b]" />
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
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">Upcoming Live Video Sessions</h2>
            <p className="text-xs text-stone-500">Scheduled classroom appointments with your instructors</p>
          </div>
          {sessions.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6dfd5] text-center text-xs text-stone-500 shadow-xs">
              No live classes scheduled for today. Coordinate with your tutor in chat to schedule your next session.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((sess) => (
                <div
                  key={sess._id}
                  className="bg-white p-5 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-3 flex flex-col justify-between hover:border-[#d4a359]/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900">{sess.title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Tutor: {sess.tutor?.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-[#eef5f0] text-[#143d2b] border border-[#c3dfcb] rounded-lg">
                      {sess.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-600 font-mono">
                    <Calendar className="w-4 h-4 text-[#143d2b]" />
                    <span>{new Date(sess.scheduledStartTime).toLocaleString()}</span>
                  </div>

                  <Link
                    href={`/classroom/${sess.roomId}`}
                    className="w-full py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 border border-[#d4a359]/30 transition-all"
                  >
                    <Video className="w-4 h-4 text-[#d4a359]" />
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

