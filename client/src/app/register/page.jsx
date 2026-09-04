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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-10">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#0c2217] border border-[#d4a359]/40 flex items-center justify-center text-[#d4a359] shadow-md shadow-[#0c2217]/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40 text-xs font-bold mx-auto shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>{role === 'tutor' ? 'Faculty Onboarding' : 'Student Enrollment'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2217] tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
            Join Pakistan's premier Quran & Academic Tutoring Platform
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="bg-[#f4efe8] p-1.5 rounded-2xl border border-[#e6dfd5] shadow-xs flex gap-1">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'student'
                ? 'bg-[#0c2217] text-[#d4a359] shadow-sm'
                : 'text-stone-600 hover:text-[#0c2217]'
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
                ? 'bg-[#0c2217] text-[#d4a359] shadow-sm'
                : 'text-stone-600 hover:text-[#0c2217]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tutor</span>
          </button>
        </div>

        {/* Card Form */}
        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#e6dfd5] shadow-xl shadow-[#0c2217]/5">
          {error && (
            <div className="mb-5 p-3.5 bg-[#b85d34]/10 border border-[#b85d34]/30 text-[#b85d34] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#b85d34]" />
              <span>{error}</span>
            </div>
          )}

          {/* Tutor Verification Policy Alert */}
          {role === 'tutor' && (
            <div className="mb-5 p-3.5 bg-[#d4a359]/10 border border-[#d4a359]/30 rounded-2xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#0c2217] font-bold text-xs">
                <Clock className="w-4 h-4 text-[#b85d34] shrink-0" />
                <span className="font-serif">Degree &amp; Sanad Verification Required</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                Tutor profiles remain in a <strong>pending verification</strong> status until our academic faculty reviews your educational degree or Sanad. Once approved, you are listed in the verified search directory.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Tutor Profile Picture Upload (Required for Tutor, Optional for Student) */}
            {role === 'tutor' && (
              <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] text-center space-y-2">
                <label className="text-xs font-bold text-[#0c2217] block font-serif">
                  Faculty Profile Picture *
                </label>
                <div className="relative inline-block mx-auto">
                  <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Tutor')}&background=0c2217&color=d4a359&size=150`}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#d4a359] shadow-md mx-auto"
                  />
                  <label className="absolute bottom-0 right-0 p-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#d4a359] border border-[#d4a359]/40 rounded-full cursor-pointer shadow-md transition-transform hover:scale-105">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-stone-500">
                  Upload a clear, respectful portrait for identity verification
                </p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-[#0c2217] block mb-1 font-serif">
                {role === 'tutor' ? 'Full Name (As on Degree/CNIC) *' : 'Student Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={role === 'tutor' ? 'e.g. Qari Huzaifa Ahmed' : 'e.g. Hamza Khan'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white focus:ring-1 focus:ring-[#0c2217] font-medium"
                />
              </div>
            </div>

            {/* Gender and Age Row */}
            <div className="grid grid-cols-2 gap-3 items-start">
              <div>
                <label className="text-xs font-bold text-[#0c2217] block mb-1 font-serif">
                  Gender *
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#f4efe8] rounded-2xl border border-[#e6dfd5]">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      gender === 'male'
                        ? 'bg-[#0c2217] text-[#d4a359] shadow-xs'
                        : 'text-stone-600 hover:text-[#0c2217] bg-transparent'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      gender === 'female'
                        ? 'bg-[#0c2217] text-[#d4a359] shadow-xs'
                        : 'text-stone-600 hover:text-[#0c2217] bg-transparent'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0c2217] block mb-1 font-serif">
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
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white focus:ring-1 focus:ring-[#0c2217] font-bold h-[42px]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-[#0c2217] block mb-1 font-serif">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white focus:ring-1 focus:ring-[#0c2217] font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-[#0c2217] block mb-1 font-serif">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white focus:ring-1 focus:ring-[#0c2217] font-medium"
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

            {/* City & Mobile Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#0c2217] block mb-1 font-serif">
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
                <label className="text-xs font-bold text-[#0c2217] block mb-1 font-serif flex items-center justify-between">
                  <span>{role === 'tutor' ? 'Mobile Number (WhatsApp) *' : 'Mobile Number'}</span>
                  {role === 'student' && <span className="text-[10px] text-stone-400 font-sans font-normal">Optional</span>}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required={role === 'tutor'}
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white focus:ring-1 focus:ring-[#0c2217]"
                  />
                </div>
              </div>
            </div>

            {/* Tutor Sanad / Degree Document Upload Section (Required for Tutor) */}
            {role === 'tutor' && (
              <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#d4a359]/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#d4a359] shrink-0" />
                  <h4 className="text-xs font-serif font-bold text-[#0c2217]">
                    Sanad / Educational Degree Document *
                  </h4>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Degree / Sanad Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dars-e-Nizami (Shahadat-ul-Almiya), BS Islamic Studies"
                    value={sanadTitle}
                    onChange={(e) => setSanadTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Upload Degree / Certificate (JPG, PNG, PDF) *
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    required
                    onChange={handleSanadSelect}
                    className="w-full text-xs text-stone-600 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0c2217] file:text-[#d4a359] hover:file:bg-[#143d2b] cursor-pointer"
                  />
                </div>

                {sanadFileUrl && (
                  <div className="p-2 bg-[#d4a359]/15 border border-[#d4a359]/30 rounded-xl text-[11px] text-[#0c2217] flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0c2217] shrink-0" />
                    <span>Degree document attached for faculty verification.</span>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 ${
                role === 'tutor'
                  ? 'bg-[#b85d34] hover:bg-[#a04e28] text-white shadow-lg shadow-[#b85d34]/20'
                  : 'bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] shadow-lg shadow-[#0c2217]/20'
              } font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue to Email Verification</span>
                  <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-stone-600">
              Already have an account?{' '}
              <Link
                href={role === 'tutor' ? '/login?role=tutor' : '/login?role=student'}
                className="font-bold text-[#b85d34] hover:text-[#a04e28] transition-colors"
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
