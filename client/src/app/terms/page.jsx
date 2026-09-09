'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CMSContentRenderer from '../../components/common/CMSContentRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import { defaultPageData } from '../../services/defaultPages';
import {
  FileText,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Home,
  PhoneOff,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function TermsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultTerms = defaultPageData['terms'];

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

  const titleToDisplay = page?.title || defaultTerms.title;
  const subtitleToDisplay = page?.subtitle || defaultTerms.subtitle;
  const contentToDisplay = page?.content || defaultTerms.content;

  return (
    <div className="flex-1 bg-[#faf8f5]">

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#07150e] via-[#0c2217] to-[#07150e] text-white pt-12 pb-16 border-b border-[#143d2b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Link href="/" className="hover:text-[#d4a359] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[#d4a359]">Terms of Service</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/30 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Platform Agreement &amp; Code of Ethics</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white">
            {titleToDisplay}
          </h1>
          <p className="text-sm sm:text-base text-[#d1dbd6] max-w-2xl leading-relaxed">
            {subtitleToDisplay}
          </p>

          {page?.updatedAt ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Calendar className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Last updated: {new Date(page.updatedAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Calendar className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Last updated: September 2026</span>
            </div>
          )}
        </div>
      </section>

      {/* 3 Summary Policy Cards */}
      <section className="py-8 -mt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-white p-6 rounded-3xl border border-[#ebe3d3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#b85d34] flex items-center justify-center border border-rose-200">
                <PhoneOff className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-black text-slate-900">Zero Contact Exchanging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students and tutors must not solicit, share, or demand personal phone or WhatsApp numbers. All interactions must stay on-platform.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#ebe3d3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/40">
                <Home className="w-5 h-5 text-[#d4a359]" />
              </div>
              <h3 className="text-sm font-serif font-black text-slate-900">Home Tuitions Guardian Rule</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                For in-person home tutoring of minors, an adult parent or guardian must be present on the home premises throughout every class.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#ebe3d3] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-serif font-black text-slate-900">3-Day Free Trial Guarantee</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every family enjoys an unhindered 3-day free trial with zero upfront payment before deciding to confirm a monthly tuition agreement.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Content Container */}
      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#ebe3d3] shadow-xs">
            {loading && !contentToDisplay ? (
              <LoadingSpinner />
            ) : (
              <CMSContentRenderer content={contentToDisplay} />
            )}

            <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4a359]" />
                <span>Legally binding terms under Islamic adab &amp; Pakistani law</span>
              </div>
              <Link href="/contact-us" className="text-[#b85d34] font-bold hover:underline">
                Contact Legal Support &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
