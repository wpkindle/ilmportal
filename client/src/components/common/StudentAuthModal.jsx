'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  ShieldCheck,
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Copy,
  Video,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { allPakistaniCities } from '../../data/pakistanAreas';

const pakistaniCities = allPakistaniCities;

export default function StudentAuthModal({
  isOpen,
  onClose,
  tutor,
  initialMode = 'register',
  onSuccess
}) {
  const router = useRouter();
  const { login, verifyOtp } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'verify_otp' | 'invitation_sent'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Login Form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Registration Form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student'
  });

  // OTP Verification State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  // Generated Dedicated Chat Info
  const [dedicatedChatUrl, setDedicatedChatUrl] = useState('');
  const [activeConversationId, setActiveConversationId] = useState('');

  if (!isOpen) return null;

  const data = tutor || {};
  const tutorUser = data.user || {};
  const tutorName = tutorUser.name || data.name || 'Verified Faculty';
  const tutorAvatar = tutorUser.avatar || data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=0c2217&color=d4a359`;
  const tutorRate = data.hourlyRate ? `PKR ${data.hourlyRate}/hr` : 'Custom Agreed Fee';
  const tutorTargetId = tutorUser._id || tutorUser.id || data._id;
  const tutorCity = tutorUser.city || data.city || 'Pakistan';
  const tutorSubject = data.subjects?.[0]?.name || data.title || 'Quran & Academic Tutoring';

  const handleDispatchInvitation = async (studentUser) => {
    const myId = studentUser?._id || studentUser?.id;
    const tutorId = tutorTargetId;
    const conversationId = [myId, tutorId].sort().join('_');
    const fullChatUrl = `${window.location.origin}/student/messages?conversation=${conversationId}&tutorId=${tutorId}`;

    setActiveConversationId(conversationId);
    setDedicatedChatUrl(fullChatUrl);

    try {
      await api.sendChatInvitationEmail({
        tutorId,
        conversationId
      });
    } catch (e) {
      console.warn('Chat invitation email error:', e);
    }

    setMode('invitation_sent');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError('Please enter the security verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const res = await login(loginForm.email.trim(), loginForm.password);
      if (res && res.user) {
        await handleDispatchInvitation(res.user);
      }
    } catch (err) {
      if (err.isUnverified || err.message?.toLowerCase().includes('verify')) {
        setOtpEmail(loginForm.email.trim());
        setMode('verify_otp');
        setInfoMessage('Please verify your email with the 6-digit code sent to your inbox.');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError('Please enter the security verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');

    if (!registerForm.name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }
    if (!registerForm.phone.trim()) {
      setError('Mobile / WhatsApp number is required');
      setLoading(false);
      return;
    }

    try {
      const res = await api.register({
        name: registerForm.name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        number: registerForm.phone.trim(),
        password: registerForm.password,
        role: 'student'
      });

      if (res.success) {
        setOtpEmail(registerForm.email.trim());
        setMode('verify_otp');
        setInfoMessage('Verification code sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(otpEmail.trim(), otpCode.trim());
      if (res.success && res.user) {
        await handleDispatchInvitation(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    try {
      const res = await api.resendOtp({ email: otpEmail.trim() });
      if (res.success) {
        setInfoMessage('A new verification code has been dispatched.');
        if (res.debugOtp) setDebugOtp(res.debugOtp);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleCopyLink = () => {
    if (dedicatedChatUrl) {
      navigator.clipboard.writeText(dedicatedChatUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenChat = () => {
    if (dedicatedChatUrl) {
      router.push(`/student/messages?conversation=${activeConversationId}&tutorId=${tutorTargetId}`);
    }
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      
      {/* Landscape Modal Container */}
      <div className="bg-white rounded-3xl max-w-3xl md:max-w-4xl w-full max-h-[92dvh] overflow-y-auto border border-slate-200 shadow-2xl relative flex flex-col md:flex-row my-auto animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: TUTOR SPOTLIGHT & BENEFITS (COMPACT)         */}
        {/* ======================================================== */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0c2217] via-[#143d2b] to-[#07150e] text-white p-5 sm:p-6 flex flex-col justify-between shrink-0 relative overflow-hidden">
          
          <div className="space-y-4 relative z-10">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/40 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Direct 1:1 Inquiry</span>
            </div>

            {/* Tutor Card Info */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={tutorAvatar}
                  alt={tutorName}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#d4a359]/50 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-[#d4a359] text-[#0c2217] rounded-full ring-2 ring-[#0c2217]">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">
                  {tutorName}
                </h3>
                <p className="text-[11px] text-[#d4a359] truncate font-medium">
                  {tutorSubject}
                </p>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  {tutorCity} &bull; <strong className="text-[#d4a359]">{tutorRate}</strong>
                </p>
              </div>
            </div>

            {/* Platform Trust Highlights */}
            <div className="space-y-2 pt-3 border-t border-white/15 text-xs text-slate-200">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-[#d4a359]/20 text-[#d4a359] shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-white block">Private Chat & Voice Notes</span>
                  <span className="text-slate-300">Directly discuss syllabus & timings.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-[#d4a359]/20 text-[#d4a359] shrink-0 mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-white block">3-Day Free Trial Session</span>
                  <span className="text-slate-300">Zero advance fee before trial completion.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-[#d4a359]/20 text-[#d4a359] shrink-0 mt-0.5">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-white block">Live WebRTC Video Classroom</span>
                  <span className="text-slate-300">HD interactive video & recitations.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-white/15 space-y-2">
            <div className="text-[10px] text-slate-300 flex items-center justify-between">
              <span>IlmiDunya Trust &amp; Safety</span>
              <span className="text-[#d4a359] font-mono font-bold">Verified Faculty</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-300 font-semibold pt-1 border-t border-white/10">
              <span className="flex items-center gap-1 text-[#d4a359]">
                <ShieldCheck className="w-3 h-3" />
                <span>SSL Secured</span>
              </span>
              <span>&bull;</span>
              <span>256-Bit Encrypted</span>
              <span>&bull;</span>
              <span>PECA 2016</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: FORM ACTIONS (WIDE & COMPACT)              */}
        {/* ======================================================== */}
        <div className="md:w-7/12 p-5 sm:p-6 flex flex-col justify-between space-y-3 bg-white relative">
          
          {/* Top Row: Mode Switcher & Close Button */}
          <div className="flex items-center justify-between gap-3">
            {(mode === 'login' || mode === 'register') && (
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full max-w-[260px] shrink-0">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className={`py-1.5 px-3 text-center whitespace-nowrap rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
                  className={`py-1.5 px-3 text-center whitespace-nowrap rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  New Student
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-auto"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner */}
          {infoMessage && mode !== 'invitation_sent' && (
            <div className="p-2 bg-[#faf8f5] border border-[#d4a359]/40 text-[#0c2217] rounded-xl text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0c2217] shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="student@example.com or username"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{loading ? 'Signing In...' : 'Sign In & Connect with Tutor'}</span>
              </button>

              <p className="text-[10.5px] text-center text-slate-500">
                New to IlmiDunya?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
                  className="text-[#b85d34] font-bold hover:underline cursor-pointer"
                >
                  Create student account
                </button>
              </p>
            </form>
          )}

          {/* 2. REGISTRATION FORM (STRAIGHTFORWARD 5-FIELD LAYOUT) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-2">
              
              {/* Row 1: Full Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Enter your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217]/20 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Phone Number */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Mobile / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    autoComplete="off"
                    placeholder="Enter your mobile or WhatsApp number"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217]/20 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Email Address */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="Enter your email address"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217]/20 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Enter your password (min 6 characters)"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217]/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Visible Privacy & Terms Trust Notice */}
              <p className="text-[10px] text-slate-500 leading-tight text-center pt-1">
                By continuing, you agree to our{' '}
                <Link href="/terms" target="_blank" className="text-[#0c2217] underline font-bold">Terms</Link>
                {' '}&amp;{' '}
                <Link href="/privacy-policy" target="_blank" className="text-[#0c2217] underline font-bold">Privacy Policy</Link>.
                {' '}Protected under PECA 2016.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#b85d34] hover:bg-[#9e4e2a] active:bg-[#813f21] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                <span>{loading ? 'Creating...' : 'Continue to Email Code →'}</span>
              </button>

              <p className="text-[10.5px] text-center text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="text-[#b85d34] font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* 3. OTP VERIFICATION */}
          {mode === 'verify_otp' && (
            <div className="space-y-3 animate-in fade-in text-center py-2">
              <div className="w-9 h-9 rounded-xl bg-[#faf8f5] text-[#0c2217] border border-[#d4a359]/40 flex items-center justify-center mx-auto shadow-2xs">
                <KeyRound className="w-4 h-4 text-[#d4a359]" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Enter Email Verification Code</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Code sent to <strong className="text-slate-800">{otpEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-2.5">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-2 text-center text-2xl font-mono tracking-widest font-black bg-slate-50 border-2 border-[#0c2217]/30 rounded-xl text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl shadow-md border border-[#d4a359]/40 transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Open 1:1 Chat'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-500">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-[#b85d34] font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="hover:underline"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. INVITATION SENT */}
          {mode === 'invitation_sent' && (
            <div className="space-y-3 animate-in zoom-in-95 text-center py-2">
              <div className="w-10 h-10 rounded-xl bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-[#0c2217]" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Dedicated Chat Connected!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Private 1:1 chat session with <strong>{tutorName}</strong> is ready.
                </p>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Private Chat Link:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={dedicatedChatUrl}
                    className="w-full text-[11px] font-mono text-slate-600 bg-transparent outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold shrink-0"
                  >
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="w-full py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open 1:1 Chat Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    router.push('/student/dashboard');
                    onClose();
                  }}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Go to Student Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}
