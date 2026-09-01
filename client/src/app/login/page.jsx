'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Lock, Mail, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performLogin = async (loginEmail, loginPass) => {
    setLoading(true);
    setError('');

    try {
      const data = await login(loginEmail.trim(), loginPass);
      if (data?.user?.role === 'admin') {
        router.push('/admin');
      } else if (data?.user?.role === 'tutor') {
        router.push('/tutor/dashboard');
      } else {
        router.push(redirect === '/' ? '/student/dashboard' : redirect);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.isUnverified || err.message?.toLowerCase().includes('verify')) {
        router.push(`/verify-email?email=${encodeURIComponent(loginEmail.trim())}&role=${roleParam}`);
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handle1ClickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    performLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {roleParam === 'student' ? 'Student Portal Sign In' : roleParam === 'tutor' ? 'Tutor Portal Sign In' : 'Sign in to IlmPortal'}
          </h2>
          <p className="text-xs text-slate-500">
            Pakistan's Premier Quran & Academic Tutoring Platform
          </p>
        </div>

        {/* Demo Login Quick-Fill Box */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Demo Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              disabled={loading}
              onClick={() => handle1ClickDemo('student.hamza@example.com', 'Password@123')}
              className="py-2.5 px-3 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 rounded-xl transition-all border border-emerald-200/80 flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <span>🎓 Student Demo</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handle1ClickDemo('qari.huzaifa@example.com', 'Password@123')}
              className="py-2.5 px-3 bg-teal-50/80 hover:bg-teal-100 text-teal-900 rounded-xl transition-all border border-teal-200/80 flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <span>🕌 Tutor Demo</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-emerald-700 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              href={roleParam === 'tutor' ? '/register/tutor' : roleParam === 'student' ? '/register/student' : '/register'}
              className="font-bold text-emerald-700 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading login..." />}>
      <LoginContent />
    </Suspense>
  );
}

