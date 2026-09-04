'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { Video, Clock, Users } from 'lucide-react';

export default function SessionsLogPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getSessionLogs();
        if (res.success) setSessions(res.sessions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <LoadingSpinner text="Loading session logs..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">In-Platform Live & In-Person Session Logs</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit history of all scheduled, live, and completed class sessions.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Session Title</th>
                    <th className="p-4">Participants</th>
                    <th className="p-4">Scheduled Time</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((sess) => (
                    <tr key={sess._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{sess.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Room: {sess.roomId}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">Tutor: {sess.tutor?.name}</p>
                        <p className="text-slate-500">Student: {sess.student?.name}</p>
                      </td>
                      <td className="p-4 text-slate-600">
                        {new Date(sess.scheduledStartTime).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-800">
                      <td className="p-4 font-mono font-bold text-[#0c2217]">
                        {sess.durationMinutes || 0} mins
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sess.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            ? 'bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40'
                            : sess.status === 'live'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sess.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

