'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Lock, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.forgotPassword({ email: email.trim() });
      if (res.success) {
        setMessage('Password reset code delivered to your email.');
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Error requesting reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      if (res.success) {
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Reset Password</h2>
          <p className="text-xs text-slate-500">
            Recover access to your IlmPortal student or tutor account
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

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-2xl text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending Code...' : 'Send Reset Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">6-Digit Reset Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-center font-mono font-bold text-base"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md"
            >
              <span>{loading ? 'Updating Password...' : 'Confirm New Password'}</span>
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-900">Password Updated!</h3>
            <p className="text-xs text-slate-500">
              Your password has been changed successfully. You can now sign in.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

