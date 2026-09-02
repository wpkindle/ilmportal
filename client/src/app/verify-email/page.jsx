'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const roleParam = searchParams.get('role') || 'student';
  const tokenParam = searchParams.get('token') || '';

  const { verifyOtp, verifyToken } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(!!tokenParam);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1-Click Verification Link Effect
  useEffect(() => {
    if (tokenParam) {
      let isMounted = true;
      const execute1ClickVerification = async () => {
        setAutoVerifying(true);
        setError('');
        try {
          const res = await verifyToken(tokenParam, emailParam);
          if (res.success && isMounted) {
            const userRole = res.user?.role || roleParam;
            if (userRole === 'tutor') {
              router.push('/tutor/profile?verified=true');
            } else {
              router.push('/student/profile?verified=true');
            }
          }
        } catch (err) {
          if (isMounted) {
            setAutoVerifying(false);
            setError(err.message || 'This verification link is invalid or has expired.');
          }
        }
      };

      execute1ClickVerification();
      return () => { isMounted = false; };
    }
  }, [tokenParam]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await verifyOtp(email.trim(), otp.trim());
      if (res.success) {
        if (roleParam === 'tutor') {
          router.push('/tutor/profile?verified=true');
        } else {
          router.push('/student/profile?verified=true');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
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
        setMessage('A fresh 1-click verification link has been sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Error resending verification link');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        
        {autoVerifying ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Verifying Your Account...</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Please wait a moment while we verify your email and activate your profile.
              </p>
            </div>
            <div className="pt-2">
              <LoadingSpinner text="Redirecting to your profile..." />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Email Verification</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We sent a verification email to <strong className="text-slate-800">{email || 'your email'}</strong>. Click the button in the email to activate your account instantly.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold text-center border border-red-200">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Or Enter 6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-mono font-black tracking-widest text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Go to Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resending ? 'Sending Email...' : "Didn't receive email? Resend Verification Link"}</span>
              </button>
            </div>
          </>
        )}

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
