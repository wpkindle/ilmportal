'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CMSContentRenderer from '../../components/common/CMSContentRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import { HelpCircle, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

export default function DisclaimerPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.getPage('disclaimer');
        if (res.success && res.page) {
          setPage(res.page);
        }
      } catch (err) {
        console.error('Error loading disclaimer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  return (
    <div className="flex-1 bg-slate-50">

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white pt-12 pb-16 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-[#d4a359] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#d4a359]">Disclaimer</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Operational Clarity</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {page?.title || 'Platform Disclaimer'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {page?.subtitle || 'Transparency on verification scope, academic outcomes, and operational boundaries.'}
          </p>

          {page?.updatedAt && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Last updated: {new Date(page.updatedAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </section>

      {/* Content Container */}
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-xs">
            {loading ? (
              <LoadingSpinner text="Loading platform disclaimer..." />
            ) : page?.content ? (
              <CMSContentRenderer content={page.content} />
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                Disclaimer is being updated. Please check back shortly.
              </p>
            )}

            <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#d4a359]" />
                <span>Verified Faculty Directory & LMS Technology Portal</span>
              </div>
              <Link href="/how-it-works" className="text-[#b85d34] font-bold hover:underline">
                Learn How IlmPortal Works &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
