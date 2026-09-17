'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BrandLogo from '../../components/common/BrandLogo';
import Turnstile from '../../components/common/Turnstile';

function LoginContent() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get('role');
  const initialModeParam = searchParams.get('mode');
  const redirect = searchParams.get('redirect') || '/';

  // Role: tutor or student (defaults to student if not specified)
  const [role, setRole] = useState(roleParam === 'tutor' ? 'tutor' : 'student');
  const isTutorMode = role === 'tutor';

  // Mode: 'signin' or 'signup'
  const [mode, setMode] = useState(initialModeParam === 'signup' ? 'signup' : 'signin');

  // Common States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const target = redirect && redirect !== '/' ? redirect : (user.role === 'tutor' ? '/tutor/dashboard' : user.role === 'admin' ? '/admin' : '/student/dashboard');
      router.replace(target);
    }
  }, [user, authLoading, redirect, router]);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpHoneypot, setSignUpHoneypot] = useState('');

  // Keep state in sync with URL params if they change
  useEffect(() => {
    if (roleParam === 'tutor' && initialModeParam === 'signup') {
      router.replace('/register/tutor');
      return;
    }
    if (roleParam === 'tutor') {
      setRole('tutor');
    } else if (roleParam === 'student') {
      setRole('student');
    }
  }, [roleParam, initialModeParam, router]);

  useEffect(() => {
    if (initialModeParam === 'signup') {
      if (roleParam === 'tutor') {
        router.replace('/register/tutor');
        return;
      }
      setMode('signup');
    } else if (initialModeParam === 'signin') {
      setMode('signin');
    }
  }, [initialModeParam, roleParam, router]);

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError('Please complete the security check before signing in.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await login(signInEmail.trim(), signInPassword, turnstileToken);
      const target = redirect && redirect !== '/' ? redirect : null;
      if (data?.user?.role === 'admin') {
        router.push(target || '/admin');
      } else if (data?.user?.role === 'tutor') {
        router.push(target || '/tutor/dashboard');
      } else {
        router.push(target || '/student/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setTurnstileToken('');
      turnstileRef.current?.reset();
      if (err.isUnverified || err.message?.toLowerCase().includes('verify')) {
        router.push(
          `/verify-email?email=${encodeURIComponent(signInEmail.trim())}&role=${isTutorMode ? 'tutor' : 'student'}`
        );
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validations
    if (!signUpName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!signUpEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!turnstileToken) {
      setError('Please complete the security check before registering.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        name: signUpName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        role: isTutorMode ? 'tutor' : 'student',
        turnstileToken,
        captchaToken: turnstileToken,
        hp_website: signUpHoneypot
      };

      const res = await api.register(payload);

      if (
        res.requiresVerification ||
        res.isVerified === false ||
        res.message?.toLowerCase().includes('otp') ||
        res.message?.toLowerCase().includes('verification')
      ) {
        // Redirect to OTP verification page
        router.push(
          `/verify-email?email=${encodeURIComponent(signUpEmail.trim())}&role=${isTutorMode ? 'tutor' : 'student'}`
        );
      } else if (res.success && res.token) {
        // Auto sign in if token returned
        localStorage.setItem('ilm_token', res.token);
        if (isTutorMode) {
          router.push('/tutor/dashboard');
        } else {
          router.push(redirect === '/' ? '/student/dashboard' : redirect);
        }
      } else {
        // Fallback: switch to sign in mode with success note
        setMode('signin');
        setSignInEmail(signUpEmail.trim());
        setSuccessMessage('Account created successfully! Please sign in with your password.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setTurnstileToken('');
      turnstileRef.current?.reset();
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-10">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-[#e6dfd5] shadow-[0_16px_50px_rgba(12,34,23,0.08)] overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Column: Sign In Title, Logo & Brand Details */}
        <div className="md:col-span-5 bg-[#faf8f5] p-6 sm:p-8 lg:p-10 border-b md:border-b-0 md:border-r border-[#e6dfd5] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <BrandLogo variant="light" size="md" />
            </Link>

            {/* Role Header Indicator */}
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold shadow-2xs border ${
                  isTutorMode
                    ? 'bg-[#f5ebe6] border-[#b85d34]/30 text-[#b85d34]'
                    : 'bg-[#f5f0e6] border-[#d4a359]/40 text-[#0c2217]'
                }`}
              >
                {isTutorMode ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                    <span>Faculty &amp; Tutor Portal</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Student &amp; Family Portal</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#0c2217] tracking-tight">
                {isTutorMode
                  ? mode === 'signin'
                    ? 'Tutor Sign In'
                    : 'Join Teaching Faculty'
                  : mode === 'signin'
                  ? 'Student Sign In'
                  : 'Create Student Account'}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isTutorMode
                  ? mode === 'signin'
                    ? 'Access your teaching workspace, WebRTC classroom, and lesson schedules.'
                    : 'Teach Quran & Academic subjects nationwide from home with guaranteed monthly fee protection.'
                  : mode === 'signin'
                  ? 'Access your Quran & Academic lessons, student workspace, and live classes.'
                  : 'Sign up to connect with verified tutors.'}
              </p>
            </div>

            {/* Key Trust Guarantees */}
            <div className="pt-4 border-t border-[#e6dfd5] space-y-2.5">
              {isTutorMode ? (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                    <span>Direct student scheduling &amp; negotiations</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                    <span>Guaranteed tuition fee protection</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                    <span>Integrated live WebRTC classroom</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#0c2217] shrink-0" />
                    <span>Verified Sanad &amp; Academic faculty</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#0c2217] shrink-0" />
                    <span>Modesty &amp; camera-off learning options</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#0c2217] shrink-0" />
                    <span>Direct agreed tuition rates with tutors</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e6dfd5]/80 text-[11px] text-stone-500 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0c2217]/70 shrink-0" />
            <span>End-to-end encrypted &bull; Verified Pakistani Faculty</span>
          </div>
        </div>

        {/* Right Column: Sign In / Sign Up Form */}
        <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5">
          
          {/* Two Choices Selector: Sign In vs Sign Up */}
          <div className="flex bg-[#f5efe6] p-1.5 rounded-2xl border border-[#e6dfd5]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#0c2217] text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isTutorMode) {
                  router.push('/register/tutor');
                  return;
                }
                setMode('signup');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signup'
                  ? isTutorMode
                    ? 'bg-[#b85d34] text-white shadow-md'
                    : 'bg-[#0c2217] text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 bg-[#fdf2f0] border border-[#f5d6cf] text-[#b85d34] rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#b85d34]" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              CHOICE 1: SIGN IN FORM
             ══════════════════════════════════════════════════════════ */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  {isTutorMode ? 'Tutor Email Address' : 'Student Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Enter Your Email Address"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-800">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-[#b85d34] hover:text-[#9e4e2a] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter Your Password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Turnstile
                ref={turnstileRef}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
                action="login"
                size="normal"
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border ${
                  isTutorMode
                    ? 'bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#854020] border-[#d4a359]/40'
                    : 'bg-[#0c2217] hover:bg-[#143d2b] active:bg-[#07150e] border-[#d4a359]/30'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isTutorMode ? 'Sign In to Tutor Workspace' : 'Sign In to Student Portal'}</span>
                    <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════
              CHOICE 2: SIGN UP FORM
             ══════════════════════════════════════════════════════════ */}
          {mode === 'signup' && isTutorMode && (
            <div className="space-y-5 p-6 sm:p-8 bg-[#faf8f5] border border-[#e6dfd5] rounded-3xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#f5ebe6] border border-[#b85d34]/30 flex items-center justify-center mx-auto text-[#b85d34] shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-black text-xl text-[#0c2217]">
                  Faculty Multi-Step Onboarding
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  To ensure quality and verified credentials, all tutors register through our comprehensive 5-step registration wizard with mandatory email verification, disciplines setup, and sanad documentation.
                </p>
              </div>
              <Link
                href="/register/tutor"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#854020] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all border border-[#d4a359]/40 cursor-pointer"
              >
                <span>Launch 5-Step Registration Wizard</span>
                <ArrowRight className="w-4 h-4 text-[#d4a359]" />
              </Link>
            </div>
          )}

          {mode === 'signup' && !isTutorMode && (
            <form onSubmit={handleSignUp} autoComplete="off" className="space-y-4">
              {/* Anti-spam honeypot (hidden from real users, filled by bots) */}
              <input
                type="text"
                name="hp_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={signUpHoneypot}
                onChange={(e) => setSignUpHoneypot(e.target.value)}
                style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Your Name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter Your Email Address"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Choose a Password (min. 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Enter Your Password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                    title={showSignUpPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] text-[11px] text-stone-600 leading-relaxed">
                <p className="flex items-center gap-1.5 font-semibold text-[#0c2217] mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                  <span>Strict Privacy &amp; Data Protection</span>
                </p>
                Your personal details are confidential and securely encrypted. We never sell, rent, or share your data with any third party.
              </div>

              <Turnstile
                ref={turnstileRef}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
                action="register"
                size="normal"
              />

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border bg-[#0c2217] hover:bg-[#143d2b] active:bg-[#07150e] border-[#d4a359]/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginContent />
    </Suspense>
  );
}
