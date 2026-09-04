'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Award, FileText, ExternalLink, X } from 'lucide-react';

const SanadBadge = ({ documents = [], isVerified = true, onClick }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 hover:bg-[#e6dfd5] transition-colors shadow-sm cursor-pointer"
      title="Click to view verified Sanad / Certificate"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#0c2217]" />
      <span>Sanad / Degree Verified</span>
      <Award className="w-3 h-3 text-[#b85d34] ml-0.5" />
    </button>
  );
};

export const SanadModal = ({ isOpen, onClose, documents = [], tutorName = '' }) => {
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#0c2217]">
                Verified Credentials &amp; Sanad
              </h3>
              <p className="text-xs text-stone-500">
                Official documents submitted by {tutorName || 'Tutor'} &amp; verified by IlmPortal
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
          {documents.map((doc, idx) => (
            <div key={idx} className="border border-stone-200 rounded-2xl overflow-hidden bg-[#faf8f5]">
              <div className="p-3 bg-white border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0c2217]" />
                  <span className="font-semibold text-sm text-stone-800">
                    {doc.title || `Document #${idx + 1}`}
                  </span>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#b85d34] hover:text-[#9e4e2a] inline-flex items-center gap-1"
                >
                  Full View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-2 flex justify-center bg-slate-900/5">
                {doc.fileUrl.endsWith('.pdf') ? (
                  <div className="p-8 text-center text-slate-600">
                    <FileText className="w-12 h-12 mx-auto text-red-500 mb-2" />
                    <p className="text-sm font-medium">PDF Certificate Document</p>
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
                    alt={doc.title || 'Sanad Certificate'}
                    className="max-h-96 w-auto object-contain rounded shadow-sm"
                  />
                )}
              </div>
            </div>
          ))}
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
