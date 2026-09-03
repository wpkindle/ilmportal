'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.forgotPassword({ email: email.trim() });
      if (res.success) {
        setSent(true);
      } else {
        setError(res.message || 'Unable to process request.');
      }
    } catch (err) {
      setError(err.message || 'No account found with this email address or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Enter your registered email address and we will email you a secure link to create a new password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending Reset Link...' : 'Email Me Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
              <div className="flex items-center justify-center gap-1.5 font-black text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Reset Link Sent!</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We have sent an email with a secure link to create a new password to:
              </p>
              <p className="font-mono font-bold text-emerald-800 text-sm break-all">
                {email}
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
                Please check your Inbox (and Spam/Junk folder). The link will expire in 60 minutes for security.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSent(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer pt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Did not receive? Resend link or try another email</span>
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
