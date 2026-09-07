'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BrandLogo from '../../components/common/BrandLogo';

function LoginContent() {
  const { login } = useAuth();
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

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpGender, setSignUpGender] = useState('female'); // Default female for student/tutor comfort
  const [signUpSubject, setSignUpSubject] = useState('');

  // Keep state in sync with URL params if they change
  useEffect(() => {
    if (roleParam === 'tutor') {
      setRole('tutor');
    } else if (roleParam === 'student') {
      setRole('student');
    }
  }, [roleParam]);

  useEffect(() => {
    if (initialModeParam === 'signup') {
      setMode('signup');
    } else if (initialModeParam === 'signin') {
      setMode('signin');
    }
  }, [initialModeParam]);

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await login(signInEmail.trim(), signInPassword);
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
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validations
    if (!signUpName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }
    if (!signUpEmail.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }
    if (!signUpPhone.trim()) {
      setError('Please enter your mobile / WhatsApp number');
      setLoading(false);
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: signUpName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        phone: signUpPhone.trim(),
        number: signUpPhone.trim(),
        password: signUpPassword,
        role: isTutorMode ? 'tutor' : 'student',
        gender: signUpGender,
        ...(isTutorMode && signUpSubject ? { qualifications: signUpSubject.trim() } : {})
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
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-10">
      <div className="max-w-md w-full space-y-5">
        
        {/* Top Logo & Portal Badge */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <BrandLogo variant="light" size="md" />
          </Link>

          {/* Role Header Indicator */}
          <div className="flex items-center justify-center gap-2">
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

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#0c2217] tracking-tight">
            {isTutorMode
              ? mode === 'signin'
                ? 'Tutor Sign In'
                : 'Join Teaching Faculty'
              : mode === 'signin'
              ? 'Student Sign In'
              : 'Create Student Account'}
          </h1>

          <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
            {isTutorMode
              ? mode === 'signin'
                ? 'Access your teaching workspace, WebRTC classroom, and lesson schedules.'
                : 'Teach Quran & Academic subjects nationwide from home with guaranteed monthly fee protection.'
              : mode === 'signin'
              ? 'Access your Quran & Academic lessons, student workspace, and live classes.'
              : 'Sign up in 30 seconds to connect with verified female Alimahs and academic tutors.'}
          </p>
        </div>

        {/* Unified Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6dfd5] shadow-[0_8px_30px_rgba(12,34,23,0.06)] space-y-5">
          
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
                  {isTutorMode ? 'Tutor Email or Mobile' : 'Student Email or Mobile'}
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
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} autoComplete="off" className="space-y-4">
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

              {/* WhatsApp / Phone */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  WhatsApp or Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Enter Your WhatsApp or Phone Number"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Used for class notifications &amp; trial scheduling. Never made public.
                </p>
              </div>

              {/* Gender (Male / Female in single line) */}
              <div className="flex items-center justify-between gap-3 py-1">
                <label className="text-xs font-bold text-stone-800 shrink-0">
                  Gender:
                </label>
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <button
                    type="button"
                    onClick={() => setSignUpGender('male')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      signUpGender === 'male'
                        ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                        : 'bg-[#faf8f5] text-stone-700 border-[#e6dfd5] hover:bg-stone-50'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpGender('female')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      signUpGender === 'female'
                        ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                        : 'bg-[#faf8f5] text-stone-700 border-[#e6dfd5] hover:bg-stone-50'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Tutor Subject / Qualification highlight (if tutor mode) */}
              {isTutorMode && (
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    What will you teach? (Quran, Tajweed, Academic Subjects)
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Tajweed &amp; Hifz, or FSc Physics &amp; Mathematics"
                      value={signUpSubject}
                      onChange={(e) => setSignUpSubject(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              )}

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
                  <span>100% Privacy Guarantee</span>
                </p>
                Camera-off by default in WebRTC classes. Your phone number is encrypted and protected.
              </div>

              {/* Submit Sign Up Button */}
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
                    <span>
                      {isTutorMode ? 'Create Tutor Account & Join Faculty' : 'Create Student Account'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Portal Role Switcher at Bottom */}
        <div className="text-center">
          {isTutorMode ? (
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError('');
                setSuccessMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#0c2217] font-semibold transition-colors cursor-pointer py-1"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Looking for Student Portal? Switch to Student</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setRole('tutor');
                setError('');
                setSuccessMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#b85d34] font-semibold transition-colors cursor-pointer py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Are you a Teacher? Switch to Tutor Portal</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading portal..." />}>
      <LoginContent />
    </Suspense>
  );
}
