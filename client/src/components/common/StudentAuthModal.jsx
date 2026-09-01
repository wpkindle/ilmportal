'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  ShieldCheck,
  X,
  Mail,
  Lock,
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CaptchaBox from './CaptchaBox';
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

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'verify_otp' | 'invitation_sent'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
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
    password: '',
    gender: 'male',
    age: '',
    city: 'Lahore',
    phone: '',
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
  const tutorAvatar = tutorUser.avatar || data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`;
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
      setError('Please complete the security verification (CAPTCHA) below.');
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
      setError('Please complete the security verification (CAPTCHA) below.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');

    if (!registerForm.name.trim()) {
      setError('Student name is required');
      setLoading(false);
      return;
    }
    if (!registerForm.age || Number(registerForm.age) < 3 || Number(registerForm.age) > 100) {
      setError('Please enter a valid student age (3–100 years)');
      setLoading(false);
      return;
    }

    try {
      const res = await api.register({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        gender: registerForm.gender,
        age: Number(registerForm.age),
        city: registerForm.city,
        phone: registerForm.phone.trim(),
        guardianPhone: registerForm.phone.trim(),
        role: 'student'
      });

      if (res.success) {
        setOtpEmail(registerForm.email.trim());
        if (res.debugOtp) setDebugOtp(res.debugOtp);
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

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      {/* Clean Single Card Modal */}
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200/90 shadow-2xl animate-in zoom-in-95 duration-150 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Row with Tutor Info & Close Button */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={tutorAvatar}
                alt={tutorName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-600 text-white rounded-full ring-2 ring-white">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {tutorName}
                </h3>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {tutorSubject} &bull; <strong className="text-emerald-700">{tutorRate}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          
          {/* Mode Tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
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
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                New Student
              </button>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && mode !== 'invitation_sent' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="student@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Security CAPTCHA */}
              <CaptchaBox
                isVerified={captchaVerified}
                setIsVerified={setCaptchaVerified}
              />

              <button
                type="submit"
                disabled={loading || !captchaVerified}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{loading ? 'Connecting...' : 'Sign In & Message Tutor'}</span>
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-0.5">
                New to IlmPortal?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Create free account
                </button>
              </p>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Student Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="e.g. Hamza Khan"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Gender *
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, gender: 'male' })}
                      className={`py-1 rounded-lg text-xs font-bold transition-all ${
                        registerForm.gender === 'male' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, gender: 'female' })}
                      className={`py-1 rounded-lg text-xs font-bold transition-all ${
                        registerForm.gender === 'female' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="100"
                    required
                    autoComplete="off"
                    placeholder="e.g. 12"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                    className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email Address (for Verification Code) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="student@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    City *
                  </label>
                  <select
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
                  >
                    {pakistaniCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="Min 6 chars"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full pl-3 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showRegisterPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security CAPTCHA */}
              <CaptchaBox
                isVerified={captchaVerified}
                setIsVerified={setCaptchaVerified}
              />

              <button
                type="submit"
                disabled={loading || !captchaVerified}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                <span>{loading ? 'Creating Account...' : 'Continue to Email Code →'}</span>
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-0.5">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* 3. OTP VERIFICATION */}
          {mode === 'verify_otp' && (
            <div className="space-y-3.5 animate-in fade-in text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Enter Verification Code</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Code sent to <strong className="text-slate-800">{otpEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-2.5 text-center text-2xl font-mono tracking-widest font-black bg-slate-50 border-2 border-emerald-500/40 rounded-xl text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />

                {debugOtp && (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <span className="text-amber-900 font-mono">Code: <strong>{debugOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(debugOtp)}
                      className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded-lg text-[10px]"
                    >
                      Fill
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Open Chat'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-500">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resending ? 'Sending...' : 'Resend'}</span>
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

          {/* 4. INVITATION SENT SCREEN */}
          {mode === 'invitation_sent' && (
            <div className="space-y-3.5 animate-in zoom-in-95 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Dedicated Chat Connected!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  A private chat session with <strong>{tutorName}</strong> is ready. We've also emailed you the link.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Private Chat Link:</span>
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
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

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open 1:1 Chat Box Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    router.push('/student/dashboard');
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Go to Student Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
