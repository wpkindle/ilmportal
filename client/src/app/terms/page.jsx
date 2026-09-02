'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CMSContentRenderer from '../../components/common/CMSContentRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import { FileText, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.getPage('terms');
        if (res.success && res.page) {
          setPage(res.page);
        }
      } catch (err) {
        console.error('Error loading terms:', err);
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
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400">Terms of Service</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Platform Agreement</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {page?.title || 'Terms of Service'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {page?.subtitle || 'User agreements, ethical guidelines, and platform rules for students, parents, and tutors.'}
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
              <LoadingSpinner text="Loading platform terms of service..." />
            ) : page?.content ? (
              <CMSContentRenderer content={page.content} />
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                Terms of Service are being updated. Please check back shortly.
              </p>
            )}

            <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Legally binding terms under Islamic adab & Pakistani law</span>
              </div>
              <Link href="/contact-us" className="text-emerald-700 font-bold hover:underline">
                Contact Legal Support &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
