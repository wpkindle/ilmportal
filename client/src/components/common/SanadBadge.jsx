'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, GraduationCap, FileText, ExternalLink, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const SanadBadge = ({ documents = [], documentsCount = 0, isVerified = true, onClick }) => {
  const count = (Array.isArray(documents) ? documents.length : 0) || documentsCount || 0;
  if (!isVerified && count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/50 hover:bg-[#e6dfd5] transition-colors shadow-2xs cursor-pointer"
      title="Click to inspect verified degrees & Sanad certificates"
    >
      <ShieldCheck className="w-4 h-4 text-[#0c2217]" />
      <span>{count > 0 ? `Verified Sanad (${count})` : 'Verified Credentials'}</span>
      <GraduationCap className="w-3.5 h-3.5 text-[#b85d34] ml-0.5" />
    </button>
  );
};

export const SanadModal = ({
  isOpen,
  onClose,
  documents = [],
  degrees = [],
  tutorName = '',
  isAdmin = false,
  onVerifyDoc = null,
  onRejectDoc = null
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0c2217] text-[#d4a359] rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#0c2217]">
                Educational Degrees &amp; Sanad Credentials
              </h3>
              <p className="text-xs text-stone-500">
                Official qualifications &amp; documents verified by IlmiDunya administration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {/* Authenticated Degrees Strip */}
          {degrees.length > 0 && (
            <div className="p-3.5 bg-[#f0ece1]/70 border border-[#d4a359]/30 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#0c2217] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authenticated Degrees &amp; Qualifications on Record ({degrees.length})</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {degrees.map((deg, dIdx) => (
                  <span
                    key={dIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d4a359]/30 rounded-xl text-xs font-bold text-slate-900 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{deg}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {documents.length === 0 && (
            <div className="p-6 border border-stone-200 rounded-2xl bg-[#faf8f5] text-center space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto text-emerald-600" />
              <h4 className="font-bold text-sm text-slate-900">Credentials Authenticated by Administration</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {tutorName || 'This tutor'}&apos;s degrees and qualifications have been authenticated and approved by the IlmiDunya verification committee.
              </p>
            </div>
          )}

          {documents.map((doc, idx) => {
            const isDocVerified = doc.status === 'verified' || doc.status === 'approved';
            const isDocRejected = doc.status === 'rejected';
            const isDocPending = !isDocVerified && !isDocRejected;

            return (
              <div key={doc._id || idx} className="border border-stone-200 rounded-2xl overflow-hidden bg-[#faf8f5]">
                <div className="p-3 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#0c2217] shrink-0" />
                    <span className="font-semibold text-sm text-stone-800 truncate">
                      {doc.title || `Document #${idx + 1}`}
                    </span>
                    {isDocVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    ) : isDocRejected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md shrink-0">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md shrink-0">
                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && onVerifyDoc && (
                      <button
                        type="button"
                        onClick={() => onVerifyDoc(doc._id || idx)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1 ${
                          isDocVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title="Approve / Verify this Sanad credential"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isDocVerified ? 'Re-Verify' : 'Verify Doc'}</span>
                      </button>
                    )}
                    {isAdmin && onRejectDoc && (
                      <button
                        type="button"
                        onClick={() => {
                          const reason = window.prompt(
                            `State the reason for rejecting "${doc.title || 'this document'}":`,
                            'Document scan is blurry or credential is unverified.'
                          );
                          if (reason !== null && reason.trim()) {
                            onRejectDoc(doc._id || idx, reason.trim());
                          }
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1 ${
                          isDocRejected
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                        title="Reject this Sanad credential"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{isDocRejected ? 'Rejected (Update)' : 'Reject Doc'}</span>
                      </button>
                    )}
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#b85d34] hover:text-[#9e4e2a] inline-flex items-center gap-1 ml-1"
                    >
                      Full View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {isDocRejected && doc.rejectionReason && (
                  <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-200 text-[11px] text-rose-700 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span><strong>Rejection note:</strong> {doc.rejectionReason}</span>
                  </div>
                )}
                <div className="p-2 flex justify-center bg-slate-900/5">
                  {doc.fileUrl && (doc.fileUrl.endsWith('.pdf') || doc.fileType === 'application/pdf' || doc.fileUrl.startsWith('data:application/pdf')) ? (
                    <div className="p-8 text-center text-slate-600">
                    <FileText className="w-12 h-12 mx-auto text-red-500 mb-2" />
                    <p className="text-sm font-medium">PDF Sanad / Degree Document</p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700"
                    >
                      Open PDF in New Tab
                    </a>
                  </div>
                ) : (
                  <img
                    src={doc.fileUrl}
                    alt={doc.title || 'Sanad / Degree Document'}
                    className="max-h-96 w-auto object-contain rounded shadow-sm"
                  />
                )}
              </div>
            </div>
          );
        })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SanadBadge;
