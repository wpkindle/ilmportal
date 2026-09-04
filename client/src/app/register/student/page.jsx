'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  User,
  AtSign,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Info
} from 'lucide-react';
import { api } from '../../../services/api';
export default function StudentRegisterPage() {
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
        role: 'student'
      };

      const res = await api.register(payload);

      if (res.requiresVerification || res.isVerified === false || res.message?.toLowerCase().includes('otp') || res.message?.toLowerCase().includes('verification') || res.success) {
        const tokenQuery = res.verificationToken ? `&token=${encodeURIComponent(res.verificationToken)}` : '';
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&role=student${tokenQuery}`);
      } else {
        router.push('/login?role=student&registered=true');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-10">
      <div className="max-w-md w-full space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#0c2217] border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] shadow-md shadow-[#0c2217]/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40 text-xs font-bold shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Student Registration &bull; Female Privacy Protected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2217] tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
            Quick sign up to book 1:1 online classes with certified Qaris, Alimahs, and academic tutors across Pakistan.
          </p>
        </div>

        {/* Main Form Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6dfd5] shadow-[0_8px_30px_rgba(12,34,23,0.06)] space-y-5">
          
          {error && (
            <div className="p-3.5 bg-[#fdf2f0] border border-[#f5d6cf] text-[#b85d34] rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#b85d34]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
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
                  placeholder="e.g. Hamza Khan / Ayesha Bibi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Username *
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. hamza_khan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1 pl-1">Unique handle for your student account and login</p>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Mobile / WhatsApp Number */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Mobile / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Profile note */}
            <p className="text-[11px] text-stone-700 bg-[#faf8f5] p-3.5 rounded-2xl border border-[#e6dfd5] leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
              <span>Additional details like Gender, Age, City, and Grade can be customized anytime from your Student Profile after signing up.</span>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0c2217] hover:bg-[#143d2b] active:bg-[#07150e] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2 border border-[#d4a359]/30"
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

          {/* Links & Switch */}
          <div className="pt-4 border-t border-[#f0eae1] space-y-2 text-center text-xs">
            <p className="text-stone-600 font-medium">
              Already registered as a student?{' '}
              <Link href="/login?role=student" className="font-bold text-[#b85d34] hover:text-[#9e4e2a] hover:underline">
                Sign In to Student Portal
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

