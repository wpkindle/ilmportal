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
    <div className="min-h-screen py-12 px-4 flex items-center justify-center relative z-10">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#e6dfd5] shadow-xl shadow-[#0c2217]/5 space-y-6">
        
        {autoVerifying ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40 flex items-center justify-center mx-auto shadow-md shadow-[#0c2217]/20 animate-pulse">
              <ShieldCheck className="w-8 h-8 text-[#d4a359]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0c2217]">Verifying Your Account...</h2>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
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
              <div className="w-16 h-16 rounded-3xl bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40 flex items-center justify-center mx-auto shadow-md shadow-[#0c2217]/20">
                <Mail className="w-8 h-8 text-[#d4a359]" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#d4a359] bg-[#143d2b] border border-[#2b6e51]/60 px-3 py-1 rounded-full uppercase tracking-wider">
                  Verification Required
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#0c2217]">Check Your Email</h2>
              </div>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                We sent a 1-click verification link to:
              </p>
              <div className="inline-block px-3.5 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-bold text-[#0c2217] font-mono break-all">
                {email || 'your registered email'}
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-[#b85d34]/10 text-[#b85d34] rounded-2xl text-xs font-semibold text-center border border-[#b85d34]/30">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3.5 bg-[#d4a359]/15 text-[#0c2217] rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-[#d4a359]/30">
                <CheckCircle2 className="w-4 h-4 text-[#0c2217] shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Instruction Card */}
            <div className="p-4 bg-[#faf8f5] border border-[#d4a359]/40 rounded-2xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#0c2217]">
                <Sparkles className="w-4 h-4 text-[#d4a359] shrink-0" />
                <span>How to verify your account:</span>
              </div>
              <ol className="text-[11px] text-stone-700 space-y-1.5 pl-4 list-decimal font-medium leading-relaxed">
                <li>Open your email inbox (and check <strong>Spam / Junk</strong> folder).</li>
                <li>Open the email from <strong>IlmPortal Pakistan</strong>.</li>
                <li>Click the <strong>&ldquo;Verify Account &amp; Go to Profile&rdquo;</strong> button.</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#0c2217]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#d4a359]" />
                <span>Open Gmail Inbox</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2.5 bg-[#f4efe8] hover:bg-[#eae3d8] text-[#0c2217] border border-[#e6dfd5] font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending Link...' : "Didn't receive email? Resend Link"}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-bold text-stone-500 hover:text-[#0c2217] flex items-center justify-center gap-1 transition-colors"
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
