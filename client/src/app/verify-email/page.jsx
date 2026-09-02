'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, RotateCcw, Sparkles, ExternalLink, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const roleParam = searchParams.get('role') || 'student';
  const tokenParam = searchParams.get('token') || '';

  const { verifyToken } = useAuth();
  const [email, setEmail] = useState(emailParam);
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
            {/* Check Your Email Notice Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verification Required
                </span>
                <h2 className="text-2xl font-black text-slate-900">Check Your Email</h2>
              </div>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                We sent a 1-click verification link to:
              </p>
              <div className="inline-block px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono break-all">
                {email || 'your registered email'}
              </div>
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

            {/* Instruction Card */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>How to verify your account:</span>
              </div>
              <ol className="text-[11px] text-emerald-900 space-y-1.5 pl-4 list-decimal font-medium leading-relaxed">
                <li>Open your email inbox (and check <strong>Spam / Junk</strong> folder).</li>
                <li>Open the email from <strong>IlmPortal Pakistan</strong>.</li>
                <li>Click the green <strong>&ldquo;Verify Account &amp; Go to Profile&rdquo;</strong> button.</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Open Gmail Inbox</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending Link...' : "Didn't receive email? Resend Link"}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
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
