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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#06120c] flex items-center justify-center relative overflow-hidden">
      
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d4a359]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#143d2b]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Top Branding Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#0c2217] border border-[#d4a359]/50 mx-auto flex items-center justify-center text-[#d4a359] shadow-2xl shadow-[#d4a359]/10">
            <ShieldCheck className="w-8 h-8 text-[#d4a359]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#d4a359] bg-[#143d2b] border border-[#d4a359]/30 px-3 py-1 rounded-full">
              IlmiDunya Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#faf8f5] mt-2">
              Super Admin Gateway
            </h1>
            <p className="text-xs text-[#a9b7af] mt-1">
              Authorized personnel only. Sanad audits, JazzCash approvals &amp; CMS control.
            </p>
          </div>
        </div>

        {/* Standard Manual Login Card */}
        <div className="bg-[#0c2217]/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#d4a359]/30 shadow-2xl shadow-black/40 space-y-4 text-stone-200">
          
          {error && (
            <div className="p-3.5 bg-[#b85d34]/20 border border-[#b85d34]/40 text-[#fca5a5] rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-[#143d2b] border border-[#d4a359]/50 text-[#d4a359] rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pakistanlms.pk"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] placeholder:text-stone-500 outline-none focus:border-[#d4a359] focus:ring-1 focus:ring-[#d4a359]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-serif font-bold text-[#e6dfd5]">
                  Security Password
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#d4a359] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] placeholder:text-stone-500 outline-none focus:border-[#d4a359] focus:ring-1 focus:ring-[#d4a359] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#d4a359]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0c2217] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate &amp; Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-[#d4a359] transition-colors"
            >
              &larr; Return to Public Portal
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
