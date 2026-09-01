'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Download,
  Calendar,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Printer
} from 'lucide-react';
import { api } from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      setLoading(true);
      try {
        const res = await api.getMyCertificates();
        if (res.success) {
          setCertificates(res.certificates || []);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your certificates..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Official Accreditations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Course Completion Certificates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Download and verify your official course certificates issued by Sanad-certified scholars.
            </p>
          </div>

          <Link
            href="/courses"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Browse More Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Complete your enrolled Quranic and Academic curriculum courses, chapters, and homework assignments to receive your verified digital certificate via email and student portal.
            </p>
            <Link
              href="/courses"
              className="inline-block mt-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-500 transition-all"
            >
              Explore Structured Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                      <Award className="w-6 h-6" />
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Official Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-900 leading-snug">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Supervised by: <strong className="text-slate-800">{cert.instructorName}</strong>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Standing:</span>
                      <strong className="text-emerald-800">{cert.completionGrade}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>ID:</span>
                      <strong className="font-mono text-slate-600">{cert.certificateId}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/certificates/${cert.certificateId}`}
                    target="_blank"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View & Download Certificate</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

