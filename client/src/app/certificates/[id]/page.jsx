'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Share2,
  ArrowLeft,
  Calendar,
  Sparkles,
  BookOpen,
  Download
} from 'lucide-react';
import { api } from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function CertificateViewPage() {
  const params = useParams();
  const { id } = params;

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCert = async () => {
      setLoading(true);
      try {
        const res = await api.getCertificate(id);
        if (res.success) {
          setCertificate(res.certificate);
        }
      } catch (err) {
        console.error('Error fetching certificate:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <LoadingSpinner text="Validating official certificate..." />;

  if (!certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <Award className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900">Certificate Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          The requested credential ID could not be verified in the national registry.
        </p>
        <Link href="/" className="px-5 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-xl text-xs font-bold shadow-md transition-all">
          Return to IlmiDunya
        </Link>
      </div>
    );
  }

  if (certificate.status !== 'issued') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <Award className="w-16 h-16 text-[#d4a359] mb-4 animate-pulse" />
        <h2 className="text-2xl font-black text-slate-900">Certificate Awaiting Official Release</h2>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
          This completion certificate for <strong>{certificate.studentName}</strong> ({certificate.courseTitle}) is currently in status: <span className="font-bold text-slate-800 uppercase">{certificate.status.replace(/_/g, ' ')}</span>. Official download will unlock once administration verifies the payment and issues the credential.
        </p>
        <Link href="/student/certificates" className="px-5 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-xl text-xs font-bold shadow-md transition-all">
          Go to Student Certificates
        </Link>
      </div>
    );
  }

  const issueDateFormatted = new Date(certificate.issueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Top Action Bar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#b85d34] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to IlmiDunya</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Certificate Document */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-14 shadow-2xl border-8 border-double border-[#0c2217]/80 relative overflow-hidden print:m-0 print:p-8 print:shadow-none print:border-8 print:rounded-none">
        
        {/* Decorative Gold & Corner Accents */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-[#d4a359]/80 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-[#d4a359]/80 rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-[#d4a359]/80 rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-[#d4a359]/80 rounded-br-2xl pointer-events-none" />

        {/* Faint Center Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <BookOpen className="w-96 h-96 text-[#0c2217]" />
        </div>

        <div className="relative z-10 text-center space-y-6">
          
          {/* Organization Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[#0c2217] font-extrabold text-xs tracking-widest uppercase mb-1">
              <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
              <span>National Registry of Quranic & Academic Education</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              IlmiDunya Pakistan
            </h1>
            <p className="text-xs text-[#b85d34] font-bold uppercase tracking-widest">
              Certificate of Completion & Competency
            </p>
          </div>

          {/* Divider with Emblem */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4a359] to-transparent w-24 sm:w-36" />
            <div className="w-8 h-8 rounded-full bg-[#0c2217] text-[#d4a359] flex items-center justify-center shadow-md">
              <Award className="w-4 h-4" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#d4a359] to-transparent w-24 sm:w-36" />
          </div>

          {/* Award Text */}
          <div className="space-y-3 pt-2">
            <p className="text-xs sm:text-sm text-slate-500 italic font-serif">
              This official parchment certifies that
            </p>
            
            <h2 className="text-3xl sm:text-5xl font-black text-[#0c2217] tracking-tight underline decoration-[#d4a359] decoration-2 underline-offset-8">
              {certificate.studentName}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
              has satisfactorily completed all required lessons, chapter diagnostic tests, and homework recitation assignments under the rigorous curriculum of:
            </p>

            <div className="p-4 sm:p-5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl max-w-2xl mx-auto shadow-xs">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {certificate.courseTitle}
              </h3>
              <p className="text-xs font-bold text-[#0c2217] mt-1">
                Completed Lessons: {certificate.totalLessonsCompleted || 30}
                {certificate.marks ? ` • Marks: ${certificate.marks}` : ''}
                {` • Standing: ${certificate.completionGrade}`}
              </p>
            </div>
          </div>

          {/* Signatures & Seal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 items-end">
            
            {/* Instructor Signature */}
            <div className="text-center space-y-1">
              <p className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-300 pb-1">
                {certificate.instructorName}
              </p>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Sanad-Certified Instructor
              </span>
            </div>

            {/* Official Center Gold Foil Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#d4a359] via-[#fde047] to-[#d4a359] p-1 shadow-lg ring-4 ring-[#d4a359]/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0c2217] border border-[#d4a359] flex flex-col items-center justify-center text-center p-2">
                  <Sparkles className="w-4 h-4 text-[#d4a359]" />
                  <span className="text-[8px] uppercase font-black tracking-widest text-[#d4a359] leading-tight">
                    OFFICIAL
                  </span>
                  <span className="text-[7px] text-amber-200 uppercase font-semibold">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Date & Registrar */}
            <div className="text-center space-y-1">
              <p className="font-sans text-sm text-slate-800 font-bold border-b border-slate-300 pb-1">
                {issueDateFormatted}
              </p>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Date of Issue & Registry
              </span>
            </div>

          </div>

          {/* Bottom Security / Barcode Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Certificate ID: <strong className="font-mono text-slate-700">{certificate.certificateId}</strong></span>
            </div>
            <div className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">
              Security Hash: {certificate.verificationCode || 'VERIFIED-PK-SANAD'}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

