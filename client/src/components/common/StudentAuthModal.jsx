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
  Clock,
  KeyRound,
  RotateCcw,
  Users,
  Copy,
  Video,
  Award,
  CreditCard,
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
  const tutorName = tutorUser.name || data.name || 'Verified Tutor';
  const tutorAvatar = tutorUser.avatar || data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=059669&color=fff`;
  const tutorRate = data.hourlyRate ? `PKR ${data.hourlyRate}/hr` : 'Flexible agreed rate';
  const tutorTargetId = tutorUser._id || tutorUser.id || data._id;
  const tutorCity = tutorUser.city || data.city || 'Pakistan';
  const tutorQualifications = data.qualifications || data.title || 'Sanad-Certified Faculty';

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
        setError(err.message || 'Login failed. Please check your email and password.');
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
      setError('Student Name is required');
      setLoading(false);
      return;
    }
    if (!registerForm.gender) {
      setError('Student Gender is required');
      setLoading(false);
      return;
    }
    if (!registerForm.age || Number(registerForm.age) < 3 || Number(registerForm.age) > 100) {
      setError('Please provide a valid Student Age (between 3 and 100)');
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
        setInfoMessage('Account created! Please enter the 6-digit verification code sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the information provided.');
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
        setInfoMessage('A new 6-digit verification code has been dispatched to your email.');
        if (res.debugOtp) setDebugOtp(res.debugOtp);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
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
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      
      {/* Landscape Modal Container with max-h and clean internal scrolling */}
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 my-auto relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ======================================================== */}
        {/* LEFT COLUMN: TUTOR SPOTLIGHT & TRUST SHOWCASE (LANDSCAPE) */}
        {/* ======================================================== */}
        <div className="md:w-5/12 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 flex flex-col justify-between relative overflow-y-auto max-h-[92vh] shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
          
          {/* Subtle Islamic Geometry Watermark */}
          <div className="absolute top-0 right-0 w-56 h-56 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-400 fill-none stroke-current" strokeWidth="1.5">
              <rect x="30" y="30" width="140" height="140" rx="10" />
              <rect x="30" y="30" width="140" height="140" rx="10" transform="rotate(45 100 100)" />
              <circle cx="100" cy="100" r="50" />
            </svg>
          </div>

          <div className="space-y-4 relative z-10">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct 1:1 Tutor Inquiry</span>
            </div>

            {/* Tutor Profile Details */}
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={tutorAvatar}
                  alt={tutorName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-400/50 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-600 text-white rounded-full ring-2 ring-slate-900">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {tutorName}
                </h3>
                <p className="text-[11px] text-emerald-300 font-semibold line-clamp-1">
                  {tutorQualifications}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{tutorCity}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {tutorRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Trust Highlights */}
            <div className="space-y-2.5 pt-3.5 border-t border-slate-800/90 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Private 1:1 Chat & Voice Notes</p>
                  <p className="text-[10px] text-slate-400">Directly discuss syllabus, timings & trial schedule.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">3-Day Free Trial Session</p>
                  <p className="text-[10px] text-slate-400">Zero advance fee required before trial completion.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Integrated WebRTC Live Classroom</p>
                  <p className="text-[10px] text-slate-400">HD interactive video & audio recitations.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Safety Notice */}
          <div className="pt-3.5 mt-3.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>IlmPortal Trust & Safety</span>
            <span className="text-emerald-400 font-mono">Verified Faculty</span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: INTERACTIVE AUTH & REGISTRATION CONSOLE     */}
        {/* ======================================================== */}
        <div className="md:w-7/12 p-5 sm:p-6 flex flex-col justify-start space-y-3.5 overflow-y-auto max-h-[92vh]">
          
          {/* Mode Switcher Tabs */}
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
                Student Sign In
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
                Register Student
              </button>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && mode !== 'invitation_sent' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* MODE 1: STUDENT LOGIN FORM                            */}
          {/* ---------------------------------------------------- */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Student Email Address
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
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
                    className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white font-medium"
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

              {/* Security CAPTCHA Box */}
              <CaptchaBox
                isVerified={captchaVerified}
                setIsVerified={setCaptchaVerified}
              />

              <button
                type="submit"
                disabled={loading || !captchaVerified}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{loading ? 'Processing...' : 'Sign In & Connect with Tutor'}</span>
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-0.5">
                New student?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
                  className="text-emerald-700 font-black hover:underline cursor-pointer"
                >
                  Register student profile &rarr;
                </button>
              </p>
            </form>
          )}

          {/* ---------------------------------------------------- */}
          {/* MODE 2: STUDENT REGISTRATION FORM                     */}
          {/* ---------------------------------------------------- */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-2.5">
              
              {/* Row 1: Student Name */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Student Name *
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
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* Row 2: Gender & Age (2-Columns) */}
              <div className="grid grid-cols-2 gap-2.5 items-start">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Gender *
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, gender: 'male' })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                        registerForm.gender === 'male'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 bg-transparent'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, gender: 'female' })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                        registerForm.gender === 'female'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 bg-transparent'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="100"
                    required
                    autoComplete="off"
                    placeholder="e.g. 10"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Email Address */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Email Address (Verification OTP sent here) *
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
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: City & Mobile (2-Columns) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    City *
                  </label>
                  <select
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  >
                    {pakistaniCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>Mobile (WhatsApp)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="tel"
                    autoComplete="off"
                    placeholder="0300-1234567"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 5: Password */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{loading ? 'Creating Account...' : 'Continue to Email Verification →'}</span>
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-0.5">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="text-emerald-700 font-black hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* ---------------------------------------------------- */}
          {/* MODE 3: EMAIL OTP VERIFICATION SCREEN                */}
          {/* ---------------------------------------------------- */}
          {mode === 'verify_otp' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Verify Your Email Address
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  We sent a 6-digit verification code to <strong className="text-emerald-800">{otpEmail}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-2.5 text-center text-xl font-mono tracking-widest font-black bg-slate-50 border-2 border-emerald-500/40 rounded-xl text-slate-900 outline-none focus:border-emerald-600 focus:bg-white shadow-inner"
                  />
                </div>

                {debugOtp && (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-amber-900">
                      <span>Verification Code: </span>
                      <strong className="font-mono text-xs text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded">{debugOtp}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(debugOtp)}
                      className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Verify Email & Open Chat'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
                    className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* MODE 4: DEDICATED CHAT INVITATION SENT SCREEN         */}
          {/* ---------------------------------------------------- */}
          {mode === 'invitation_sent' && (
            <div className="space-y-3.5 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl border border-emerald-300 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
                  <Mail className="w-5 h-5 animate-bounce" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Dedicated Chat Link Sent to Email! 📬
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm mx-auto">
                  We have emailed a dedicated 1:1 chat box link to your inbox. An alert with your inquiry has also been sent to <strong>{tutorName}</strong>.
                </p>
              </div>

              {/* Dedicated Chat Link Preview Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-800">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Your Dedicated Chat Box Link:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">1:1 Room</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={dedicatedChatUrl}
                    className="w-full text-[11px] font-mono text-slate-700 bg-transparent outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  🎙️ Voice notes and live audio recitations are enabled in this chat box.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Dedicated Chat Box Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    router.push('/student/dashboard');
                    onClose();
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Go to Student Portal</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
