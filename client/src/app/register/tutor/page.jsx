'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  Award,
  Upload,
  Clock,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { api } from '../../../services/api';
import CustomSelect from '../../../components/common/CustomSelect';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { allPakistaniCities } from '../../../data/pakistanAreas';

const cityOptions = allPakistaniCities.map((c) => ({ value: c, label: c }));

export default function TutorRegisterPage() {
  const router = useRouter();

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

  // Handle Profile Avatar Selection
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo must be under 5MB');
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
    if (!sanadTitle.trim() || !sanadFileUrl) {
      setError('Please provide your Sanad / Degree certificate title and document');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'tutor',
        city,
        gender,
        age: Number(age),
        phone: phone.trim(),
        avatar,
        sanadTitle: sanadTitle.trim(),
        sanadFileUrl
      };

      const res = await api.register(payload);

      if (res.requiresVerification || res.message?.toLowerCase().includes('otp') || res.message?.toLowerCase().includes('verification')) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&role=tutor`);
      } else {
        router.push('/login?role=tutor&registered=true');
      }
    } catch (err) {
      console.error('Tutor registration error:', err);
      setError(err.message || 'Registration failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tutor Registration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Join Verified Teaching Faculty
          </h1>
          <p className="text-xs text-slate-500">
            Register as a Quran or Academic Tutor to conduct 1:1 online & home tutoring classes across Pakistan
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
            
            {/* Tutor Profile Picture Upload */}
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

            {/* Tutor Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name (As on Degree/CNIC) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Qari Huzaifa Ahmed / Dr. Ayesha Siddiqa"
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
                  Tutor Age (Years) *
                </label>
                <input
                  type="number"
                  min="18"
                  max="90"
                  required
                  placeholder="e.g. 28"
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
                  placeholder="tutor@example.com"
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
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Tutor Sanad / Degree Document Upload Section (Required) */}
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
                  placeholder="e.g. Dars-e-Nizami (Shahadat-ul-Almiya), BS Islamic Studies, MSc Physics"
                  value={sanadTitle}
                  onChange={(e) => setSanadTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Upload Degree / Certificate (JPG, PNG, PDF) *
                </label>
                <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-white rounded-xl p-3 text-center transition-colors">
                  {sanadFileUrl ? (
                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg text-emerald-900 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate font-semibold">{sanadTitle || 'Document Attached'}</span>
                      </div>
                      <label className="text-emerald-700 hover:underline cursor-pointer font-bold text-[11px] shrink-0 ml-2">
                        Change
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={handleSanadSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-2">
                      <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-xs font-bold text-emerald-700 block">
                        Click to select certificate / Sanad document
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        High resolution photo or PDF up to 10MB
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleSanadSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-[10px] text-amber-900 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Our academic verification board will authenticate your Sanad / Degree before issuing your public verified badge.
                </span>
              </div>
            </div>

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
                  <span>Register as Tutor</span>
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

