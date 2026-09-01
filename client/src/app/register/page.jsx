'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Camera,
  Award,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../../services/api';
import CustomSelect from '../../components/common/CustomSelect';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CaptchaBox from '../../components/common/CaptchaBox';
import { allPakistaniCities } from '../../data/pakistanAreas';

const cityOptions = allPakistaniCities.map((c) => ({ value: c, label: c }));

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'tutor' ? 'tutor' : 'student';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  // Tutor Specific Required Attachments
  const [avatar, setAvatar] = useState('');
  const [sanadTitle, setSanadTitle] = useState('');
  const [sanadFileUrl, setSanadFileUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Avatar Image File Upload
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Sanad / Degree Document Upload
  const handleSanadSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Degree / Sanad file size must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSanadFileUrl(reader.result);
      if (!sanadTitle) {
        setSanadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!captchaVerified) {
      setError('Please complete the security verification (CAPTCHA) below');
      setLoading(false);
      return;
    }

    if (role === 'student') {
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
    }

    if (role === 'tutor') {
      if (!gender) {
        setError('Tutor Gender is required');
        setLoading(false);
        return;
      }
      if (!age || Number(age) < 18 || Number(age) > 90) {
        setError('Please enter a valid Tutor Age (18–90)');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setError('Mobile number (WhatsApp) is required for tutors');
        setLoading(false);
        return;
      }
      if (!avatar) {
        setError('Profile picture is required for tutor registration');
        setLoading(false);
        return;
      }
      if (!sanadFileUrl || !sanadTitle.trim()) {
        setError('Educational degree or Sanad certificate upload with Title is required for tutor verification');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        gender,
        age: age ? Number(age) : undefined,
        phone: phone.trim(),
        guardianPhone: phone.trim(),
        city,
        role,
        avatar: avatar || undefined,
        sanadTitle: sanadTitle.trim() || undefined,
        sanadFileUrl: sanadFileUrl || undefined,
        qualifications: sanadTitle.trim() || undefined
      };

      const res = await api.register(payload);

      if (res.success) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&role=${role}`);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Create Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Join Pakistan's premier Quran & Academic Tutoring Platform
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs flex">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'student'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('tutor'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'tutor'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tutor</span>
          </button>
        </div>

        {/* Card Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Tutor Verification Policy Alert */}
          {role === 'tutor' && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Degree Verification Required</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Tutor profiles remain in a <strong>pending</strong> state until an administrator reviews and approves your educational degree/Sanad. Once verified, you will appear in the public search directory.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Tutor Profile Picture Upload (Required for Tutor, Optional for Student) */}
            {role === 'tutor' && (
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-center space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Profile Picture *
                </label>
                <div className="relative inline-block mx-auto">
                  <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Tutor')}&background=047857&color=fff&size=150`}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-300 shadow-xs mx-auto"
                  />
                  <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-500">
                  Upload a clear, professional photo for verification
                </p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {role === 'tutor' ? 'Full Name (As on Degree/CNIC) *' : 'Student Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={role === 'tutor' ? 'e.g. Qari Huzaifa Ahmed' : 'e.g. Hamza Khan'}
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
                  {role === 'tutor' ? 'Tutor Age (Years) *' : 'Age (Years) *'}
                </label>
                <input
                  type="number"
                  min={role === 'tutor' ? '18' : '3'}
                  max="100"
                  required
                  placeholder={role === 'tutor' ? 'e.g. 28' : 'e.g. 8'}
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
                  placeholder="name@example.com"
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
                  placeholder="Create a strong password (min 6 chars)"
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
                  City *
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
                  <span>{role === 'tutor' ? 'Mobile Number (WhatsApp) *' : 'Mobile Number'}</span>
                  {role === 'student' && <span className="text-[10px] text-slate-400 font-normal">Optional</span>}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required={role === 'tutor'}
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Tutor Sanad / Degree Document Upload Section (Required for Tutor) */}
            {role === 'tutor' && (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                  <h4 className="text-xs font-bold text-emerald-950">
                    Sanad / Educational Degree Document *
                  </h4>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Degree / Sanad Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dars-e-Nizami (Shahadat-ul-Almiya), BS Islamic Studies"
                    value={sanadTitle}
                    onChange={(e) => setSanadTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Upload Degree / Certificate (JPG, PNG, PDF) *
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    required
                    onChange={handleSanadSelect}
                    className="w-full text-xs text-slate-600 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                </div>

                {sanadFileUrl && (
                  <div className="p-2 bg-emerald-100/60 rounded-xl text-[11px] text-emerald-900 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Degree document attached for admin verification.</span>
                  </div>
                )}
              </div>
            )}

            {/* Security CAPTCHA Box */}
            <CaptchaBox
              isVerified={captchaVerified}
              setIsVerified={setCaptchaVerified}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !captchaVerified}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue to Email Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                Sign In here
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
