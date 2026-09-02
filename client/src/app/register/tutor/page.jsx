'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  AtSign,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen
} from 'lucide-react';
import { api } from '../../../services/api';
export default function TutorRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (cleanUser.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        username: cleanUser,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        number: phone.trim(),
        password,
        role: 'tutor'
      };

      const res = await api.register(payload);

      if (res.requiresVerification || res.isVerified === false || res.message?.toLowerCase().includes('otp') || res.message?.toLowerCase().includes('verification') || res.success) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&role=tutor`);
      } else {
        router.push('/login?role=tutor&registered=true');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tutor Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Create Tutor Account
          </h1>
          <p className="text-xs text-slate-500">
            Join Pakistan's premier Quran & Academic tutoring portal to teach students nationwide
          </p>
        </div>

        {/* Main Form Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Qari Tahir Hussain"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Username *
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. qari_tahir"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 pl-1">Unique handle for your tutor profile URL and login</p>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="tutor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Mobile / WhatsApp Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
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

            {/* Profile Setup Notice */}
            <p className="text-[11px] text-slate-500 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 leading-relaxed">
              💡 <strong>Profile Details:</strong> You can upload your degree / Sanad certificates, set your subjects, hourly rates, bio, and profile photo directly from your Tutor Dashboard after signing up.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Tutor Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Links & Switch */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs">
            <p className="text-slate-600">
              Already registered as a tutor?{' '}
              <Link href="/login?role=tutor" className="font-bold text-emerald-700 hover:underline">
                Sign In to Tutor Portal
              </Link>
            </p>
            <p className="text-slate-500 pt-1">
              Looking to learn as a student?{' '}
              <Link href="/register/student" className="font-bold text-emerald-700 hover:underline">
                Go to Student Registration &rarr;
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
