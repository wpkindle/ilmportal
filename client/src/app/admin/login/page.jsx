'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('admin@pakistanlms.pk');
  const [password, setPassword] = useState('Admin@12345');
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

  const handle1ClickLogin = () => {
    setEmail('admin@pakistanlms.pk');
    setPassword('Admin@12345');
    performLogin('admin@pakistanlms.pk', 'Admin@12345');
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

        {/* 1-Click Instant Master Admin Sign-In */}
        <div className="p-5 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>1-Click Master Admin Access</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
              Root Level
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Click below to instantly authenticate as Master Admin with full access to Sanad verifications, user databases, and payment audit logs.
          </p>

          <button
            type="button"
            onClick={handle1ClickLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Authenticating Admin...' : 'Launch Master Admin Dashboard'}</span>
          </button>
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

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pakistanlms.pk"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:bg-slate-900 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Verifying...' : 'Sign In with Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
              &larr; Return to Public Platform
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
