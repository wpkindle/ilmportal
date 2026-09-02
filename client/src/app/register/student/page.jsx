'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../../../services/api';
import CustomSelect from '../../../components/common/CustomSelect';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CaptchaBox from '../../../components/common/CaptchaBox';
import { allPakistaniCities } from '../../../data/pakistanAreas';

const cityOptions = allPakistaniCities.map((c) => ({ value: c, label: c }));

export default function StudentRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!captchaVerified) {
      setError('Please complete the visual security verification (CAPTCHA) below');
      setLoading(false);
      return;
    }

    if (!gender) {
      setError('Student Gender is required');
      setLoading(false);
      return;
    }
    if (!age || Number(age) < 3 || Number(age) > 100) {
      setError('Please enter a valid Student Age (3–100)');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'student',
        city,
        gender,
        age: Number(age),
        phone: phone.trim()
      };

      const res = await api.register(payload);

      if (res.requiresVerification || res.isVerified === false || res.message?.toLowerCase().includes('otp') || res.message?.toLowerCase().includes('verification') || res.success) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&role=student`);
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-lg w-full space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Registration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-500">
            Connect with certified Quran & Academic tutors for 1:1 online classes across Pakistan
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
            
            {/* Student Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Student Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Gender and Age Row */}
            <div className="grid grid-cols-2 gap-3 items-start">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Gender *
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      gender === 'male'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      gender === 'female'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Student Age (Years) *
                </label>
                <input
                  type="number"
                  min="3"
                  max="100"
                  required
                  placeholder="e.g. 10"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white font-bold h-[42px]"
                />
              </div>
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
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            {/* City & Mobile Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  City in Pakistan *
                </label>
                <CustomSelect
                  options={cityOptions}
                  value={city}
                  onChange={setCity}
                  placeholder="Select City"
                  searchable={true}
                  variant="filter"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Mobile Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Security CAPTCHA Box */}
            <CaptchaBox
              isVerified={captchaVerified}
              setIsVerified={setCaptchaVerified}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !captchaVerified}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Links & Switch */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs">
            <p className="text-slate-600">
              Already registered as a student?{' '}
              <Link href="/login?role=student" className="font-bold text-emerald-700 hover:underline">
                Sign In to Student Portal
              </Link>
            </p>
            <p className="text-slate-500 pt-1">
              Want to teach as a tutor?{' '}
              <Link href="/register/tutor" className="font-bold text-blue-700 hover:underline">
                Go to Tutor Registration &rarr;
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

