'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-2xl bg-[#d4a359]/15 text-[#0c2217] border border-[#d4a359]/40 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-7 h-7 text-[#b85d34]" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#0c2217]">Invalid or Missing Link</h2>
        <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
          No valid security token was detected. Please request a fresh password reset link from our portal.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <span>Request New Reset Link</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#d4a359]" />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        resetToken: token,
        newPassword
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Error updating password.');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired password reset link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] text-[#0c2217] border border-[#d4a359]/40 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-[#0c2217]" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#0c2217]">Password Updated!</h2>
        <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
          Your new password has been securely saved. You can now log into your IlmPortal account.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-3 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#0c2217]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4 text-[#d4a359]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-[#b85d34]/10 border border-[#b85d34]/30 text-[#b85d34] rounded-2xl text-xs font-semibold text-center">
          {error}
        </div>
      )}

      <div>
        <label className="text-xs font-serif font-bold text-[#0c2217] block mb-1.5">
          New Password (min 6 characters)
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white focus:ring-1 focus:ring-[#0c2217] font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-serif font-bold text-[#0c2217] block mb-1.5">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showConfirm ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white focus:ring-1 focus:ring-[#0c2217] font-medium"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#0c2217]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        <span>{loading ? 'Saving New Password...' : 'Save New Password & Continue'}</span>
        <ArrowRight className="w-4 h-4 text-[#d4a359]" />
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative z-10">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-[#e6dfd5] shadow-xl shadow-[#0c2217]/5 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/40 flex items-center justify-center mx-auto shadow-md shadow-[#0c2217]/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#0c2217] tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            Choose a strong password to protect your IlmPortal account
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner text="Validating security token..." />}>
          <ResetPasswordForm />
        </Suspense>

      </div>
    </div>
  );
}

