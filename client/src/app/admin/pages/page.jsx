'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import {
  FileText,
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Shield,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart
} from 'lucide-react';

export default function AdminCMSPagesPage() {
  const [activeSlug, setActiveSlug] = useState('privacy-policy');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Page Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [content, setContent] = useState('');
  const [contactDetails, setContactDetails] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    workingHours: ''
  });
  const [aboutDetails, setAboutDetails] = useState({
    mission: '',
    vision: '',
    initiativeText: ''
  });
  const [lastUpdated, setLastUpdated] = useState('');

  const pagesList = [
    { slug: 'privacy-policy', label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
    { slug: 'terms', label: 'Terms of Service', path: '/terms', icon: FileText },
    { slug: 'disclaimer', label: 'Platform Disclaimer', path: '/disclaimer', icon: HelpCircle },
    { slug: 'about-us', label: 'About Us', path: '/about-us', icon: Heart },
    { slug: 'contact-us', label: 'Contact Us', path: '/contact-us', icon: Phone }
  ];

  const fetchPageData = async (slug) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await api.getPage(slug);
      if (res.success && res.page) {
        setTitle(res.page.title || '');
        setSubtitle(res.page.subtitle || '');
        setMetaDescription(res.page.metaDescription || '');
        setContent(res.page.content || '');
        if (res.page.contactDetails) {
          setContactDetails(res.page.contactDetails);
        }
        if (res.page.aboutDetails) {
          setAboutDetails(res.page.aboutDetails);
        }
        setLastUpdated(res.page.updatedAt || '');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error loading page data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(activeSlug);
  }, [activeSlug]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        title,
        subtitle,
        metaDescription,
        content
      };

      if (activeSlug === 'contact-us') {
        payload.contactDetails = contactDetails;
      }
      if (activeSlug === 'about-us') {
        payload.aboutDetails = aboutDetails;
      }

      const res = await api.updatePage(activeSlug, payload);
      if (res.success) {
        setSuccessMessage(`"${title}" content saved successfully! Live website updated.`);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving page content');
    } finally {
      setSaving(false);
    }
  };

  const activePageObj = pagesList.find(p => p.slug === activeSlug);

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">CMS Legal & Public Pages</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update Privacy Policy, Terms, Disclaimer, About Us, and Contact Us content live across IlmPortal.
                </p>
              </div>

              {activePageObj && (
                <Link
                  href={activePageObj.path}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Preview Live Page</span>
                </Link>
              )}
            </div>

            {/* Notification messages */}
            {successMessage && (
              <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="p-4 bg-rose-50 text-rose-900 border border-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Page Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl text-xs font-bold">
              {pagesList.map((p) => {
                const Icon = p.icon;
                const isCurrent = activeSlug === p.slug;
                return (
                  <button
                    key={p.slug}
                    onClick={() => setActiveSlug(p.slug)}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <LoadingSpinner text="Loading page details from database..." />
            ) : (
              <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{activePageObj?.label} Settings</h2>
                    {lastUpdated && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Last updated: {new Date(lastUpdated).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving Live...' : 'Save Page Content'}</span>
                  </button>
                </div>

                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Page Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                      placeholder="e.g. Privacy Policy"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                      placeholder="Short descriptive banner subtitle"
                    />
                  </div>
                </div>

                {/* Meta Description for SEO */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Meta Description (SEO & Search Previews)</label>
                  <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                    placeholder="Brief description for Google search snippets"
                  />
                </div>

                {/* Specific Fields for About Us */}
                {activeSlug === 'about-us' && (
                  <div className="p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-emerald-600" />
                      <span>About Us Special Organization Fields</span>
                    </h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Founder & Initiative Tagline *</label>
                      <input
                        type="text"
                        value={aboutDetails.initiativeText}
                        onChange={(e) => setAboutDetails({ ...aboutDetails, initiativeText: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                        placeholder="e.g. An initiative by Mr. & Mrs. Abdul Khaliq from Lahore, Pakistan."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">Mission Statement</label>
                        <textarea
                          rows={2}
                          value={aboutDetails.mission}
                          onChange={(e) => setAboutDetails({ ...aboutDetails, mission: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">Vision Statement</label>
                        <textarea
                          rows={2}
                          value={aboutDetails.vision}
                          onChange={(e) => setAboutDetails({ ...aboutDetails, vision: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific Fields for Contact Us */}
                {activeSlug === 'contact-us' && (
                  <div className="p-5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>Direct Contact Details & Working Hours</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>Support Email</span>
                        </label>
                        <input
                          type="email"
                          value={contactDetails.email}
                          onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Phone Helpline</span>
                        </label>
                        <input
                          type="text"
                          value={contactDetails.phone}
                          onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Helpline</span>
                        </label>
                        <input
                          type="text"
                          value={contactDetails.whatsapp}
                          onChange={(e) => setContactDetails({ ...contactDetails, whatsapp: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>Office Address / City</span>
                        </label>
                        <input
                          type="text"
                          value={contactDetails.address}
                          onChange={(e) => setContactDetails({ ...contactDetails, address: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Working Hours</span>
                        </label>
                        <input
                          type="text"
                          value={contactDetails.workingHours}
                          onChange={(e) => setContactDetails({ ...contactDetails, workingHours: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content (Markdown supported) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Page Body Content * (Markdown Headings, Bullet Points, and Paragraphs supported)
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {content.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={16}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 leading-relaxed focus:outline-hidden focus:border-emerald-500 focus:bg-white resize-y"
                    placeholder="Enter formatted content with headings (###), bold (**text**), bullet points (* item), etc."
                  />
                  <p className="text-[11px] text-slate-500">
                    💡 Tip: Use <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">### Section Title</code> for headings, <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">* point</code> for bullet lists, and <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">---</code> for horizontal dividers.
                  </p>
                </div>

                {/* Action Bar */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving Live...' : 'Publish & Save Changes'}</span>
                  </button>
                </div>

              </form>
            )}

          </main>

        </div>
      </div>
    </div>
  );
}
