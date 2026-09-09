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

  const { verifyToken, verifyOtp } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [isEditingEmail, setIsEditingEmail] = useState(!emailParam);
  const [emailInput, setEmailInput] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
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

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, '');
    const activeEmail = (email || emailInput || '').trim();

    if (!activeEmail) {
      setError('Please provide your registered email address.');
      return;
    }
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setVerifyingOtp(true);
    setError('');
    setMessage('');

    try {
      const res = await verifyOtp(activeEmail, cleanOtp);
      if (res.success) {
        setMessage('Account verified successfully! Redirecting...');
        const userRole = res.user?.role || roleParam;
        setTimeout(() => {
          if (userRole === 'tutor') {
            router.push('/tutor/profile?verified=true');
          } else {
            router.push('/student/profile?verified=true');
          }
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code. Please try again or click resend.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    if (val.length === 6 && (email || emailInput)) {
      // Auto submit when 6 digits are typed
      setTimeout(() => {
        const activeEmail = (email || emailInput || '').trim();
        if (activeEmail) {
          setVerifyingOtp(true);
          setError('');
          verifyOtp(activeEmail, val)
            .then((res) => {
              if (res.success) {
                setMessage('Account verified successfully! Redirecting...');
                const userRole = res.user?.role || roleParam;
                setTimeout(() => {
                  if (userRole === 'tutor') {
                    router.push('/tutor/profile?verified=true');
                  } else {
                    router.push('/student/profile?verified=true');
                  }
                }, 600);
              }
            })
            .catch((err) => {
              setError(err.message || 'Invalid code. Please try again.');
            })
            .finally(() => {
              setVerifyingOtp(false);
            });
        }
      }, 100);
    }
  };

  const handleResend = async () => {
    const activeEmail = (email || emailInput || '').trim();
    if (!activeEmail) {
      setError('Please provide your email address to receive a verification code.');
      return;
    }
    setResending(true);
    setMessage('');
    setError('');
    try {
      const res = await api.resendOtp({ email: activeEmail });
      if (res.success) {
        setMessage('A fresh 6-digit code and 1-click verification link has been sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Error resending verification code');
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
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40 flex items-center justify-center mx-auto shadow-md shadow-[#0c2217]/20">
                <ShieldCheck className="w-8 h-8 text-[#d4a359]" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#d4a359] bg-[#143d2b] border border-[#d4a359]/40 px-3 py-1 rounded-full uppercase tracking-wider">
                  Verification Required
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#0c2217]">
                  {roleParam === 'tutor' ? 'Verify Faculty Account' : 'Verify Your Account'}
                </h2>
              </div>
              
              {/* Target Email Badge with Edit Option */}
              <div className="pt-1">
                {isEditingEmail ? (
                  <div className="flex items-center gap-2 max-w-xs mx-auto">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter registered email"
                      className="w-full text-xs px-3 py-1.5 bg-[#faf8f5] border border-[#d4a359] rounded-xl text-[#0c2217] focus:outline-none focus:ring-2 focus:ring-[#0c2217]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(emailInput.trim());
                        setIsEditingEmail(false);
                      }}
                      className="text-xs font-bold text-[#0c2217] bg-[#f4efe8] hover:bg-[#eae3d8] px-2.5 py-1.5 rounded-xl border border-[#e6dfd5]"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-stone-600">
                    <span>Sent to:</span>
                    <strong className="font-mono text-[#0c2217] break-all">{email || 'your email'}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailInput(email);
                        setIsEditingEmail(true);
                      }}
                      className="text-[10px] font-bold text-[#b85d34] hover:underline ml-1"
                    >
                      Change
                    </button>
                  </div>
                )}
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

            {/* 6-DIGIT OTP CODE INPUT FORM */}
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0c2217] text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative max-w-[280px] mx-auto">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="••••••"
                    className="w-full text-center font-mono text-2xl sm:text-3xl font-extrabold tracking-[0.5em] py-3.5 px-4 bg-[#faf8f5] border-2 border-[#d4a359]/60 focus:border-[#0c2217] rounded-2xl text-[#0c2217] shadow-inner placeholder:text-stone-300 placeholder:tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0c2217]/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-500 text-center">
                  Check your inbox for the 6-digit code or paste it above.
                </p>
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otp.trim().length < 6}
                className="w-full py-3.5 bg-[#0c2217] hover:bg-[#143d2b] disabled:opacity-50 text-[#faf8f5] font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#0c2217]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {verifyingOtp ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-[#d4a359] animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                    <span>Verify &amp; Activate Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#e6dfd5]"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Or 1-Click Link
              </span>
              <div className="flex-grow border-t border-[#e6dfd5]"></div>
            </div>

            {/* Instruction Card */}
            <div className="p-3.5 bg-[#faf8f5] border border-[#d4a359]/30 rounded-2xl space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#0c2217]">
                <Sparkles className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                <span>Prefer clicking a direct link?</span>
              </div>
              <ol className="text-[11px] text-stone-700 space-y-1 pl-4 list-decimal font-medium leading-relaxed">
                <li>Open your inbox and check <strong>Spam / Junk</strong> folder.</li>
                <li>Click <strong>&ldquo;Verify Account &amp; Go to Profile&rdquo;</strong> in the email.</li>
              </ol>
            </div>

            {/* Secondary Action Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#f4efe8] hover:bg-[#eae3d8] text-[#0c2217] border border-[#e6dfd5] font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Open Gmail Inbox</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2.5 bg-transparent hover:bg-[#faf8f5] text-stone-600 hover:text-[#0c2217] border border-stone-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending Code...' : "Didn't get code? Resend Code & Link"}</span>
              </button>
            </div>

            <div className="text-center pt-1">
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
