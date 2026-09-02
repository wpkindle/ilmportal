'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CMSContentRenderer from '../../components/common/CMSContentRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export default function ContactUsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormSuccess('');
    setFormError('');

    try {
      const res = await api.submitContactMessage({
        name,
        email,
        phone,
        subject,
        message
      });
      if (res.success) {
        setFormSuccess(res.message || 'Thank you! Your message has been sent to our Lahore administration.');
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      setFormError(err.message || 'Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contact = page?.contactDetails || {
    email: 'support@pakistanlms.pk',
    phone: '+92 300 1234567',
    whatsapp: '+92 300 1234567',
    address: 'Lahore, Punjab, Pakistan',
    workingHours: 'Monday – Saturday: 9:00 AM – 9:00 PM PKT'
  };

  return (
    <div className="flex-1 bg-slate-50">

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white pt-12 pb-16 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400">Contact Us</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>We're Here to Help</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {page?.title || 'Contact IlmPortal Pakistan'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {page?.subtitle || 'We are here to assist students, parents, and tutors across Pakistan.'}
          </p>
        </div>
      </section>

      {/* Contact Cards Grid */}
      <section className="py-8 -mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Phone */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Helpline & WhatsApp</h4>
              <p className="text-sm font-black text-slate-900">{contact.phone}</p>
              <p className="text-[11px] text-slate-500">Available on WhatsApp for instant inquiries</p>
            </div>

            {/* Email */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Support</h4>
              <p className="text-sm font-black text-slate-900">{contact.email}</p>
              <p className="text-[11px] text-slate-500">Official support & Sanad inquiries</p>
            </div>

            {/* Location */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Head Office</h4>
              <p className="text-sm font-black text-slate-900">{contact.address}</p>
              <p className="text-[11px] text-slate-500">Serving nationwide across all of Pakistan &amp; overseas</p>
            </div>

            {/* Hours */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operating Hours</h4>
              <p className="text-xs font-black text-slate-900">{contact.workingHours}</p>
              <p className="text-[11px] text-slate-500">Pakistan Standard Time (PKT)</p>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content & Message Form */}
      <main className="flex-1 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Dynamic Narrative & FAQ info */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              {loading ? (
                <LoadingSpinner text="Loading contact information..." />
              ) : page?.content ? (
                <CMSContentRenderer content={page.content} />
              ) : null}

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Common Questions</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <p><strong>Are you a tutor looking to teach?</strong> Register and upload your Sanad certificate on the Tutor Portal.</p>
                  <p><strong>Looking for female Alimahs?</strong> Female teachers are available for female students and kids nationwide across all of Pakistan.</p>
                  <p><strong>Payment confirmation?</strong> Submit your JazzCash/EasyPaisa TID on your active deal card for 2–4 hour verification.</p>
                </div>
              </div>
            </div>

            {/* Right: Message Submission Form */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Send a Direct Message</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill out the form below. Our administration team in Lahore responds promptly via WhatsApp or email.
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

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                    placeholder="e.g. Muhammad Usman"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                      placeholder="e.g. usman@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone / WhatsApp Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                      placeholder="e.g. 0300 1234567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                    placeholder="e.g. Inquiry about Quran Tutor for 8-year-old child"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Message Details *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white resize-y"
                    placeholder="Tell us what subject, city, or question you have..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Inquiry Message'}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
