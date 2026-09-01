'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { History, ShieldCheck } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getAuditLogs();
        if (res.success) setLogs(res.logs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <LoadingSpinner text="Loading audit trail..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Administrative Action Audit Trail</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Accountability log recording every admin action, approval, payment verification, and review override.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Entity Type</th>
                    <th className="p-4">Admin Actor</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <span className="font-mono font-bold px-2 py-0.5 bg-purple-100 text-purple-900 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 capitalize font-semibold text-slate-700">
                        {log.entityType.replace('_', ' ')}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {log.admin?.name || 'Admin'}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                        {JSON.stringify(log.details || {})}
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

