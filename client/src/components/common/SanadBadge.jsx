'use client';

import React, { useState } from 'react';
import { ShieldCheck, Award, FileText, ExternalLink, X } from 'lucide-react';

const SanadBadge = ({ documents = [], isVerified = true, onClick }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
      title="Click to view verified Sanad / Certificate"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span>Sanad / Degree Verified</span>
      <Award className="w-3 h-3 text-amber-500 ml-0.5" />
    </button>
  );
};

export const SanadModal = ({ isOpen, onClose, documents = [], tutorName = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Verified Credentials & Sanad
              </h3>
              <p className="text-xs text-slate-500">
                Official documents submitted by {tutorName || 'Tutor'} & verified by IlmPortal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {documents.map((doc, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-slate-800">
                    {doc.title || `Document #${idx + 1}`}
                  </span>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
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
    </div>
  );
};

export default SanadBadge;
