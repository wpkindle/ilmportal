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

  const DEFAULT_PAGE_TEMPLATES = {
    'privacy-policy': {
      title: 'Privacy Policy',
      subtitle: 'How IlmPortal Pakistan protects and handles your personal information, Sanad credentials, and family data.',
      metaDescription: 'Read the official privacy policy of IlmPortal Pakistan. We prioritize student minor safety, Sanad encryption, and PECA 2016 compliance.',
      content: `### 1. Information We Collect\nWe collect information you provide directly during student or tutor registration:\n* **Account Credentials**: Name, email address, phone/WhatsApp number, city, and password.\n* **Tutor Qualifications**: Sanad degree certificates, educational background, years of experience, and CNIC/identity details for verification.\n* **Student & Parent Information**: Grade level, learning goals, preferred schedule, and guardian contact details for minors.\n\n---\n\n### 2. Minor Safety & Family Privacy\nProtecting young learners is our highest responsibility:\n* Classes for minors are monitored under parent-accessible dashboards.\n* Personal contact numbers between tutors and minors are kept confidential within our in-platform chat and video classroom.\n* Parents may request female Alimah tutors specifically for female students or young children.\n\n---\n\n### 3. Sanad & Document Protection\nAll uploaded academic certificates and Sanad degrees are stored in private encrypted storage and accessible solely to authorized administration staff in Lahore for verification purposes.\n\n---\n\n### 4. Legal Compliance under PECA 2016\nIlmPortal complies with the Prevention of Electronic Crimes Act (PECA 2016) and applicable Pakistani privacy laws.`
    },
    'terms': {
      title: 'Terms of Service',
      subtitle: 'User agreements, ethical guidelines, and platform rules for students, parents, and tutors.',
      metaDescription: 'Official Terms of Service for IlmPortal Pakistan. Guidelines for students, parents, and verified Quran and academic faculty.',
      content: `### 1. Acceptance of Terms\nBy accessing IlmPortal Pakistan, registering an account, booking classes, or offering tutoring services, you agree to comply with these terms, Pakistani law, and Islamic adab of knowledge.\n\n---\n\n### 2. Code of Conduct & Ethical Teaching\nAll users must uphold respectful, professional, and Islamic conduct:\n* Tutors must deliver classes punctually according to the agreed schedule.\n* Harassment, abusive language, or non-educational interactions will result in instant permanent suspension.\n* Respect for Quranic sanctity, proper etiquette during recitation, and Islamic modesty are mandatory.\n\n---\n\n### 3. 3-Day Free Trial Policy\n* Every student is entitled to a 3-day free trial with their selected tutor.\n* No upfront payment is required during the trial.\n\n---\n\n### 4. Deals & Payments\n* Monthly tuition fees agreed between tutors and students are processed transparently.\n* Payment receipts via JazzCash, EasyPaisa, or Pakistani bank transfers are verified within 2 to 4 hours.`
    },
    'disclaimer': {
      title: 'Platform Disclaimer',
      subtitle: 'Transparency on verification scope, academic outcomes, and operational boundaries.',
      metaDescription: 'Official disclaimer for IlmPortal Pakistan detailing verification scope, independent faculty, and academic outcomes.',
      content: `### 1. Independent Faculty & LMS Technology\nIlmPortal Pakistan operates as an educational technology platform and directory connecting students with independent Quran teachers, Qaris, Alimahs, and academic tutors.\n\n---\n\n### 2. Scope of Sanad & Profile Verification\n* The "Sanad Verified" badge certifies that our administration in Lahore reviewed submitted certificates, Ijazahs, or degrees at the time of verification.\n* Parents and students are encouraged to conduct their own assessment during the 3-day free trial.\n\n---\n\n### 3. Academic & Board Exam Outcomes\nWhile our faculty strives for excellence in Cambridge CAIE (O/A Levels), Matric/FSc, and Quran memorization (Hifz), student academic performance depends upon individual dedication and home study.`
    },
    'about-us': {
      title: 'About IlmPortal Pakistan',
      subtitle: 'Empowering Pakistani homes with authentic Quranic education and academic excellence.',
      metaDescription: 'Learn about IlmPortal Pakistan, founded in Lahore to deliver verified Quranic learning and academic tutoring nationwide.',
      aboutDetails: {
        mission: 'Empowering Pakistani families with accessible, authentic Quranic studies and high-achieving academic tutoring from the safety of home.',
        vision: 'To be the most trusted and credible learning platform in Pakistan, upholding academic excellence and authentic Quranic tradition.',
        initiativeText: 'An initiative by Mr. & Mrs. Abdul Khaliq from Lahore, Pakistan.'
      },
      content: `### Dedicated to Authentic Knowledge & Character Building\nFounded in Lahore, Punjab, IlmPortal Pakistan was created to bridge a vital gap in our society: connecting Pakistani households with genuine, certified Quran scholars and distinguished academic tutors in a safe, technologically advanced digital classroom.\n\n---\n\n### An Initiative with a Purpose\n**An initiative by Mr. & Mrs. Abdul Khaliq from Lahore, Pakistan.**\nGuided by the timeless Hadith: *"The best of you are those who learn the Quran and teach it"*, our platform is dedicated to making authentic Quran recitation, Tajweed, and high-standard academic coaching accessible to every Pakistani household.\n\n---\n\n### What Sets IlmPortal Apart\n* **Sanad-Verified Faculty**: Only tutors with authentic degrees from recognized institutions (Wifaq-ul-Madaris, Tanzeem-ul-Madaris, HEC-recognized universities, and Cambridge-certified coaches) are approved.\n* **Female Faculty for Families**: Certified Alimahs and female academic teachers available across Pakistan for girls and young learners.\n* **3-Day Risk-Free Trial**: Try classes with zero financial commitment before committing to a monthly deal.\n* **In-Platform WebRTC Classroom**: No external video links needed; students and teachers learn directly on our safe, monitored platform.`
    },
    'contact-us': {
      title: 'Contact IlmPortal Pakistan',
      subtitle: 'We are here to assist students, parents, and tutors across Pakistan.',
      metaDescription: 'Get in touch with IlmPortal Pakistan. Contact our Lahore administration via WhatsApp, phone, or direct online inquiry.',
      contactDetails: {
        email: 'support@pakistanlms.pk',
        phone: '+92 300 1234567',
        whatsapp: '+92 300 1234567',
        address: 'Lahore, Punjab, Pakistan',
        workingHours: 'Monday – Saturday: 9:00 AM – 9:00 PM PKT'
      },
      content: `### We Are Here to Support Your Learning Journey\nHave questions about finding a verified Qari, scheduling 3-day free trials, requesting a female Alimah, or joining our faculty? Our dedicated administrative team in Lahore is ready to assist you.\n\n---\n\n### Our Communication Channels\n* **WhatsApp Helpline**: Fast, direct assistance for student enrollment and tutor onboarding.\n* **Email Support**: For formal verification inquiries, institutional partnerships, and Sanad submissions.\n* **Headquarters**: Lahore, Punjab, Pakistan, serving students nationwide across Pakistan & overseas.`
    }
  };

  const fetchPageData = async (slug) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await api.getPage(slug);
      const pageData = (res && res.success && res.page) ? res.page : DEFAULT_PAGE_TEMPLATES[slug];
      if (pageData) {
        setTitle(pageData.title || '');
        setSubtitle(pageData.subtitle || '');
        setMetaDescription(pageData.metaDescription || '');
        setContent(pageData.content || '');
        if (pageData.contactDetails) {
          setContactDetails(pageData.contactDetails);
        }
        if (pageData.aboutDetails) {
          setAboutDetails(pageData.aboutDetails);
        }
        setLastUpdated(pageData.updatedAt || '');
      }
    } catch (err) {
      console.warn('Using default template for slug:', slug, err.message);
      const fallback = DEFAULT_PAGE_TEMPLATES[slug];
      if (fallback) {
        setTitle(fallback.title || '');
        setSubtitle(fallback.subtitle || '');
        setMetaDescription(fallback.metaDescription || '');
        setContent(fallback.content || '');
        if (fallback.contactDetails) {
          setContactDetails(fallback.contactDetails);
        }
        if (fallback.aboutDetails) {
          setAboutDetails(fallback.aboutDetails);
        }
      }
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
