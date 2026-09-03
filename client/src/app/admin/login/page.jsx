'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.replace('/admin');
    }
  }, [user, router]);

  const performLogin = async (loginEmail, loginPass) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First attempt via AuthContext
      const data = await login(loginEmail.trim(), loginPass);
      if (data && data.user && data.user.role === 'admin') {
        setSuccess('Authentication successful! Loading Control Center...');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 300);
      } else {
        setError('Access Denied: This account does not possess administrative privileges.');
        setLoading(false);
      }
    } catch (err) {
      // Direct API fallback attempt
      try {
        const directRes = await api.login({ email: loginEmail.trim(), password: loginPass });
        if (directRes.success && directRes.user?.role === 'admin') {
          localStorage.setItem('ilm_token', directRes.token);
          setSuccess('Authentication successful! Loading Control Center...');
          setTimeout(() => {
            window.location.href = '/admin';
          }, 300);
          return;
        } else {
          setError(directRes.message || 'Invalid administrator credentials');
        }
      } catch (directErr) {
        const errorMsg = directErr.data?.message || directErr.message || err.data?.message || err.message;
        if (errorMsg && errorMsg.includes('fetch failed')) {
          setError('Server connection initializing. Please try again in 2 seconds.');
        } else {
          setError(errorMsg || 'Invalid administrator email or password.');
        }
      }
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Top Branding Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 mx-auto flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/30 border border-white/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
              IlmPortal Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Super Admin Gateway
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized personnel only. Sanad audits, JazzCash approvals & CMS control.
            </p>
          </div>
        </div>

        {/* Standard Manual Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4 text-slate-200">
          
          {error && (
            <div className="p-3.5 bg-red-950/80 border border-red-500/40 text-red-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pakistanlms.pk"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-400">
                  Security Password
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-emerald-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:bg-slate-900 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
            >
              &larr; Return to Public Portal
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
