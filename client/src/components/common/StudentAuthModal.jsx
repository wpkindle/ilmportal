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
  Baby,
  Copy,
  ExternalLink,
  Mic,
  Send,
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
  const { login, verifyOtp, user: currentUser } = useAuth();

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
    password: '',
    gender: 'male',
    age: '',
    city: 'Lahore',
    phone: '', // Optional parent/guardian mobile
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
        // Send email with dedicated chat link and transition to invitation sent screen
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

  // 1-Click Demo Login
  const handle1ClickDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await login('student.hamza@example.com', 'Password@123');
      if (res && res.user) {
        await handleDispatchInvitation(res.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to login with demo student account');
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 my-6 relative overflow-hidden">
        
        {/* Top Decorative Shimmer */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tutor Mini Spotlight Header */}
        <div className="flex items-center gap-3.5 bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/80">
          <div className="relative shrink-0">
            <img
              src={tutorAvatar}
              alt={tutorName}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-400/40"
            />
            <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-600 text-white rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                Dedicated Tutor Chat
              </span>
            </div>
            <h4 className="font-black text-sm text-slate-900 truncate">
              {tutorName}
            </h4>
            <p className="text-[11px] text-slate-600 font-medium">
              {tutorUser.city || 'Pakistan'} &bull; <span className="font-bold text-emerald-800">{tutorRate}</span>
            </p>
          </div>
        </div>

        {/* Mode Tab Switcher (Visible on login & register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
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
              className={`py-2 rounded-xl transition-all cursor-pointer ${
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
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Instant Demo Button (Visible on login mode) */}
        {mode === 'login' && (
          <>
            <button
              type="button"
              onClick={handle1ClickDemo}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 hover:from-slate-800 hover:to-emerald-900 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 border border-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>🎓 Instant 1-Click Demo Login (Hamza Khan)</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold uppercase text-slate-400 shrink-0">
                or sign in with password
              </span>
            </div>
          </>
        )}

        {/* 1. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Student Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white font-medium"
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
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{loading ? 'Processing...' : `Sign In & Send Chat Link to Email`}</span>
            </button>

            <p className="text-[11px] text-center text-slate-500 pt-1">
              New student?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Register free account
              </button>
            </p>
          </form>
        )}

        {/* 2. Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {/* Student Name */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Student Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Khan"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            {/* Gender & Age Row (Both Required) */}
            <div className="grid grid-cols-2 gap-2.5 items-start">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Gender *
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setRegisterForm({ ...registerForm, gender: 'male' })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
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
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
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
                  placeholder="e.g. 8"
                  value={registerForm.age}
                  onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white font-bold h-[38px]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Email Address (Verification OTP will be sent) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* City & Mobile (Optional) Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  City *
                </label>
                <select
                  value={registerForm.city}
                  onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                >
                  {pakistaniCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                  <span>Mobile Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="tel"
                  placeholder="0300-1234567"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Account Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showRegisterPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating Account...' : 'Continue to Email Verification →'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-500 pt-1">
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

        {/* 3. Mandatory Email OTP Verification Screen */}
        {mode === 'verify_otp' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Verify Your Email Address
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                We sent a 6-digit verification code to <strong className="text-emerald-800">{otpEmail}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 text-center">
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
                  className="w-full py-3 text-center text-2xl font-mono tracking-widest font-black bg-slate-50 border-2 border-emerald-500/40 rounded-2xl text-slate-900 outline-none focus:border-emerald-600 focus:bg-white shadow-inner"
                />
              </div>

              {debugOtp && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-amber-900">
                    <span>Verification Code: </span>
                    <strong className="font-mono text-xs text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded">{debugOtp}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(debugOtp)}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Verify Email & Send Dedicated Chat Link'}</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
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

        {/* 4. Dedicated 1:1 Chat Invitation Sent Confirmation Screen */}
        {mode === 'invitation_sent' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl border border-emerald-300 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
                <Mail className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Dedicated Chat Link Sent to Email! 📬
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                We have emailed a dedicated 1:1 chat box link to your inbox. An alert with your inquiry has also been sent to <strong>{tutorName}</strong> so you can both chat privately and send voice notes.
              </p>
            </div>

            {/* Dedicated Chat Link Preview Box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1 text-emerald-800">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Your Dedicated Chat Box Link:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1:1 Room</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={dedicatedChatUrl}
                  className="w-full text-[11px] font-mono text-slate-700 bg-transparent outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
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
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleOpenChat}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Dedicated Chat Box Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push('/student/dashboard');
                  onClose();
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Go to Student Portal</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
