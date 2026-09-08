'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  PenLine,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function ContactUsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.getPage('contact-us');
        if (res.success && res.page) {
          setPage(res.page);
        }
      } catch (err) {
        console.error('Error loading contact us:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  const handleCopyEmail = () => {
    const emailToCopy = page?.contactDetails?.email || 'info@ilmidunya.com';
    navigator.clipboard.writeText(emailToCopy);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormSuccess('');
    setFormError('');

    try {
      const res = await api.submitContactMessage({
        name,
        email,
        phone: '',
        subject: subject || 'General Inquiry',
        message
      });
      if (res.success) {
        setFormSuccess(res.message || 'Thank you! Your message has been sent successfully. We will respond to your email promptly.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      setFormError(err.message || 'Error sending message. Please try again or email us directly at info@ilmidunya.com.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactEmail = page?.contactDetails?.email || 'info@ilmidunya.com';

  const quickSubjects = [
    { label: '✍️ Guest Author / Article Submission', value: 'Guest Author / Article Submission' },
    { label: '💬 General Inquiry', value: 'General Inquiry' },
    { label: '🎓 Student / Parent Support', value: 'Student / Parent Support' },
    { label: '📖 Tutor Onboarding & Sanad', value: 'Tutor Onboarding & Sanad' }
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-[#0c2217] text-white pt-12 pb-16 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-[#d4a359] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#d4a359]">Contact Us</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/30 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Official Communication &amp; Editorial</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {page?.title || 'Contact Us'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {page?.subtitle || 'Have questions, need assistance, or want to contribute as a guest author to publish your articles? Reach out to us via email or use the form below.'}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="py-12 -mt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Grid: Left = Email & Guest Author Invitation, Right = Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Email Card & Guest Author Contribution */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. Official Email Support Card */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/30">
                    <Mail className="w-5 h-5 text-[#ba4c18]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Primary Channel
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">Official Email</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our direct channel for student inquiries, tutor verification, and editorial submissions.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] flex items-center justify-between gap-3">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm sm:text-base font-black text-[#0c2217] hover:text-[#ba4c18] transition-colors truncate"
                    title="Click to compose email"
                  >
                    {contactEmail}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-[#0c2217] border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs"
                    title="Copy email address"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We monitor and reply to all email correspondence promptly. All official communications are conducted solely through verified email and this portal.
                </p>
              </div>

              {/* 2. Guest Author & Article Publication Invitation Card */}
              <div className="bg-gradient-to-br from-[#0c2217] to-[#123323] text-white p-6 sm:p-7 rounded-3xl border border-[#d4a359]/40 shadow-md space-y-4 relative overflow-hidden">
                {/* Subtle ornamental glow */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-[#d4a359]/10 blur-2xl pointer-events-none" />

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d4a359]/20 text-[#f5d996] border border-[#d4a359]/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#d4a359]" />
                    <span>Write for Us</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <PenLine className="w-5 h-5 text-[#d4a359]" />
                    <span>Contribute as a Guest Author</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Are you an Islamic scholar, Qari, Alimah, academic tutor, or student of knowledge? Share your knowledge and pedagogical insights with thousands of families across Pakistan and overseas.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-200">
                  <p className="font-bold text-[#f5d996] text-[11px] uppercase tracking-wider">
                    Topics We Welcome:
                  </p>
                  <ul className="space-y-1.5 text-[11.5px] text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#d4a359] font-bold">&bull;</span>
                      <span>Quranic sciences, Tajweed rules, and Hifz retention techniques</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#d4a359] font-bold">&bull;</span>
                      <span>Islamic parenting, modesty, and child character building</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#d4a359] font-bold">&bull;</span>
                      <span>Female Islamic scholarship and Alimah education</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#d4a359] font-bold">&bull;</span>
                      <span>Academic exam preparation (Matric, FSc, O/A Levels, entry tests)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    Submit your article proposal or complete draft using the form on the right (choose <strong className="text-[#f5d996]">"Guest Author / Article Submission"</strong>) or email it to <strong className="text-white">{contactEmail}</strong> along with your short bio.
                  </p>
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f5d996] hover:text-white transition-colors group"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Explore Published Articles</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column: Direct Message & Guest Proposal Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#ba4c18]" />
                  <span>Send a Message or Article Proposal</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Have a question, feedback, or an article to publish? Fill out the form below. We will reply directly to your email address.
                </p>
              </div>

              {formSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-4 bg-rose-50 text-rose-900 border border-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#d4a359] focus:bg-white transition-colors"
                    placeholder="e.g. Muhammad Usman or Dr. Ayesha Siddiqua"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#d4a359] focus:bg-white transition-colors"
                    placeholder="e.g. yourname@example.com (where we will reply)"
                  />
                </div>

                {/* Subject & Quick Select Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Subject / Topic <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Click a suggestion or type custom</span>
                  </div>

                  {/* Quick Select Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickSubjects.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSubject(item.value)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          subject === item.value
                            ? 'bg-[#0c2217] text-[#f5d996] border-[#0c2217] font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 font-medium'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#d4a359] focus:bg-white transition-colors"
                    placeholder="e.g. Guest Article: Common Tajweed Mistakes or General Question"
                  />
                </div>

                {/* Message Details */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Message Details / Article Proposal <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#d4a359] focus:bg-white resize-y transition-colors leading-relaxed"
                    placeholder={
                      subject.toLowerCase().includes('article') || subject.toLowerCase().includes('guest')
                        ? "Please provide:\n1. Proposed Article Title\n2. Outline or Full Draft text\n3. Short author biography and credentials/degrees\n4. Any relevant background..."
                        : "Describe your inquiry, feedback, or question in detail..."
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#ba4c18] hover:bg-[#9e3e12] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
