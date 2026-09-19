'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, GraduationCap, FileText, ExternalLink, X, CheckCircle2, Clock, AlertCircle, Download, Loader2, Trash2 } from 'lucide-react';
import { getDocumentUrl, isPdfDocument, dataUrlToBlob, openDocumentInNewTab, downloadDocument } from '../../utils/tutorHelpers';



const SanadBadge = ({ documents = [], documentsCount = 0, isVerified = true, onClick }) => {
  const count = (Array.isArray(documents) ? documents.length : 0) || documentsCount || 0;
  if (!isVerified && count === 0) return null;

  const content = (
    <>
      <ShieldCheck className="w-4 h-4 text-[#0c2217]" />
      <span>{count > 0 ? `Verified Sanad (${count})` : 'Verified Credentials'}</span>
      <GraduationCap className="w-3.5 h-3.5 text-[#b85d34] ml-0.5" />
    </>
  );

  const className = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/50 shadow-2xs select-none";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} hover:bg-[#e6dfd5] transition-colors cursor-pointer`}
        title="View verified degree & qualification titles"
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={className}
      title="Authenticated by IlmiDunya Administration"
    >
      {content}
    </span>
  );
};

export const PdfInlinePreview = ({ fileUrl, title }) => {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let activeUrl = '';
    setLoading(true);
    setLoadError(false);

    if (!fileUrl) {
      setLoading(false);
      setLoadError(true);
      return;
    }

    try {
      if (fileUrl.startsWith('data:')) {
        const blob = dataUrlToBlob(fileUrl);
        if (blob) {
          activeUrl = URL.createObjectURL(blob);
          setBlobUrl(activeUrl);
          setLoading(false);
        } else {
          setLoadError(true);
          setLoading(false);
        }
      } else {
        const resolved = getDocumentUrl(fileUrl);
        setBlobUrl(resolved);
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to create PDF blob URL:', e);
      setLoadError(true);
      setLoading(false);
    }

    return () => {
      if (activeUrl && activeUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(activeUrl);
        } catch (e) {}
      }
    };
  }, [fileUrl]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-stone-300 bg-stone-900 shadow-inner flex flex-col my-1">
      {/* PDF Action Toolbar */}
      <div className="px-3.5 py-2.5 bg-stone-800 border-b border-stone-700 flex flex-wrap items-center justify-between gap-2 text-stone-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="text-xs font-semibold truncate text-stone-100 max-w-[220px] sm:max-w-md">
            {title || 'Sanad / Degree PDF'}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-700 text-stone-300 shrink-0">
            PDF Document
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openDocumentInNewTab(fileUrl, title)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Open PDF in a new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Open in Tab</span>
          </button>
          <button
            type="button"
            onClick={() => downloadDocument(fileUrl, title || 'degree-document.pdf')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c2217] hover:bg-[#153424] text-[#d4a359] hover:text-[#e4be78] text-xs font-semibold border border-[#d4a359]/40 transition-colors cursor-pointer"
            title="Download PDF file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Embedded PDF Viewport */}
      <div className="w-full h-[60vh] min-h-[440px] max-h-[750px] bg-stone-100 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-10">
            <div className="flex items-center gap-2 text-stone-600 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-[#0c2217]" />
              <span>Rendering PDF Document Preview...</span>
            </div>
          </div>
        )}

        {loadError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-stone-600">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
            <p className="text-sm font-bold text-stone-800">Could not render PDF preview</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm">
              The PDF file data might be malformed or encoded in an incompatible format.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => openDocumentInNewTab(fileUrl, title)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium hover:bg-stone-700 cursor-pointer"
              >
                Open in New Tab
              </button>
              <button
                type="button"
                onClick={() => downloadDocument(fileUrl, title)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-200 text-stone-800 text-xs font-medium hover:bg-stone-300 cursor-pointer"
              >
                Download File
              </button>
            </div>
          </div>
        ) : blobUrl ? (
          <iframe
            src={blobUrl}
            title={title || 'PDF Document Preview'}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setLoadError(true);
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export const SanadModal = ({
  isOpen,
  onClose,
  documents = [],
  degrees = [],
  tutorName = '',
  isAdmin = false,
  canViewScans = false,
  onVerifyDoc = null,
  onRejectDoc = null,
  onDeleteDoc = null
}) => {
  const [mounted, setMounted] = useState(false);
  const allowScanView = Boolean(isAdmin || canViewScans);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] flex flex-col border border-stone-200">

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
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
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
                    {(doc.completionYear || doc.institute) && (
                      <div className="text-[11px] text-stone-500 pl-6 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        {doc.completionYear && (
                          <span>Year: <strong>{doc.completionYear}</strong></span>
                        )}
                        {doc.institute && (
                          <span>Institute: <strong>{doc.institute}</strong></span>
                        )}
                      </div>
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
                    {isAdmin && onDeleteDoc && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to permanently delete "${doc.title || 'this document'}"? This cannot be undone.`)) {
                            onDeleteDoc(doc._id || idx);
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        title="Delete this document permanently"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}

                    {allowScanView && doc.fileUrl && (
                      <button
                        type="button"
                        onClick={() => openDocumentInNewTab(doc.fileUrl, doc.title)}
                        className="text-xs font-bold text-[#b85d34] hover:text-[#9e4e2a] inline-flex items-center gap-1 ml-1 cursor-pointer bg-transparent border-none p-0"
                        title="Open document in a new tab"
                      >
                        <span>Full View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {isDocRejected && doc.rejectionReason && (
                  <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-200 text-[11px] text-rose-700 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span><strong>Rejection note:</strong> {doc.rejectionReason}</span>
                  </div>
                )}

                {/* Document Scans: ONLY visible to Administrators and owner tutor in settings. Never exposed to public. */}
                {allowScanView ? (
                  <div className="p-2 flex justify-center bg-slate-900/5">
                    {isPdfDocument(doc.fileUrl, doc.fileType) ? (
                      <PdfInlinePreview fileUrl={doc.fileUrl} title={doc.title} />
                    ) : getDocumentUrl(doc.fileUrl) ? (
                      <div className="p-3 flex flex-col items-center justify-center bg-stone-50 rounded-xl my-1 w-full">
                        <img
                          src={getDocumentUrl(doc.fileUrl)}
                          alt={doc.title || 'Sanad / Degree Document'}
                          className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.img-modal-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="img-modal-fallback hidden p-8 flex-col items-center justify-center text-center text-slate-400">
                          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-xs">Document scan could not be loaded</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs">Document scan not available</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-white/70 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Degree title authenticated by IlmiDunya Administration. Document scans are stored securely for platform verification and are not publicly viewable.</span>
                  </div>
                )}
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
