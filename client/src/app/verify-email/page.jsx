'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const roleParam = searchParams.get('role') || 'student';
  const codeParam = searchParams.get('code') || '';

  const { verifyOtp } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(codeParam);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState(codeParam);

  React.useEffect(() => {
    if (codeParam) {
      setDebugOtp(codeParam);
      setOtp(codeParam);
    } else if (email) {
      const savedCode = sessionStorage.getItem(`otp_${email.trim().toLowerCase()}`);
      if (savedCode) {
        setDebugOtp(savedCode);
        setOtp(savedCode);
      }
    }
  }, [codeParam, email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await verifyOtp(email.trim(), otp.trim());
      if (res.success) {
        if (roleParam === 'tutor') {
          router.push('/tutor/onboarding');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    setError('');
    try {
      const res = await api.resendOtp({ email: email.trim() });
      if (res.success) {
        setMessage('A new 6-digit OTP code has been delivered.');
        if (res.debugOtp) setDebugOtp(res.debugOtp);
      }
    } catch (err) {
      setError(err.message || 'Error sending code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Email Verification</h2>
          <p className="text-xs text-slate-500">
            Enter the 6-digit verification code sent to <strong>{email || 'your email'}</strong>.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">6-Digit OTP Code</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {debugOtp && (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
              <div className="text-[11px] text-amber-900">
                <span>Verification Code: </span>
                <strong className="font-mono text-xs text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded">{debugOtp}</strong>
              </div>
              <button
                type="button"
                onClick={() => setOtp(debugOtp)}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
              >
                Auto-Fill Code
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            {resending ? 'Sending Code...' : 'Resend Verification Code'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading verification..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

