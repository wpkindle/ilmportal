'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CaptchaBox from '../../components/common/CaptchaBox';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const redirect = searchParams.get('redirect') || '/';

  // Dedicated role mode based on URL: default is student unless explicitly tutor
  const isTutorMode = roleParam === 'tutor';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performLogin = async (loginEmail, loginPass) => {
    if (!captchaVerified) {
      setError('Please complete the security verification (CAPTCHA) below');
      return;
    }

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
        router.push(`/verify-email?email=${encodeURIComponent(loginEmail.trim())}&role=${isTutorMode ? 'tutor' : 'student'}`);
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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Logo & Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mx-auto">
            {isTutorMode ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tutor Portal</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isTutorMode ? 'Tutor Portal Sign In' : 'Student Portal Sign In'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTutorMode
              ? 'Access your teaching dashboard, classroom schedules, and student trials'
              : 'Access your Quran & academic courses, tests, and live 1:1 classes'}
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isTutorMode ? 'Tutor Email or Username' : 'Student Email or Username'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder={isTutorMode ? 'tutor@example.com or username' : 'student@example.com or username'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
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
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
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

            {/* Security CAPTCHA Box */}
            <CaptchaBox
              isVerified={captchaVerified}
              setIsVerified={setCaptchaVerified}
            />

            <button
              type="submit"
              disabled={loading || !captchaVerified}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isTutorMode ? 'Sign In to Tutor Portal' : 'Sign In to Student Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link Box for clicked role only */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-slate-600">
                Don't have an account yet?
              </p>
              {isTutorMode ? (
                <Link
                  href="/register/tutor"
                  className="inline-flex items-center gap-1 font-black text-emerald-700 hover:underline text-xs"
                >
                  <span>Create Tutor Account & Join Faculty</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/register/student"
                  className="inline-flex items-center gap-1 font-black text-emerald-700 hover:underline text-xs"
                >
                  <span>Create Student Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
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
