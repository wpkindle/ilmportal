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
  BookOpen,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { api } from '../../../services/api';
import CustomSelect from '../../../components/common/CustomSelect';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CaptchaBox from '../../../components/common/CaptchaBox';
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
  const [avatar, setAvatar] = useState('');

  // Multiple Sanad / Degree Documents State
  const [sanadDocuments, setSanadDocuments] = useState([]);
  const [captchaVerified, setCaptchaVerified] = useState(false);

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

  // Handle Multiple Sanad / Degree Documents Upload
  const handleSanadsSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSanadDocuments((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random().toString(36).substring(2, 7),
            title: '',
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            fileUrl: reader.result,
            fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
          }
        ]);
        setError('');
      };
      reader.readAsDataURL(file);
    });
  };

  // Update specific document title
  const handleDocumentTitleChange = (id, newTitle) => {
    setSanadDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title: newTitle } : doc))
    );
  };

  // Remove a document
  const handleRemoveDocument = (id) => {
    setSanadDocuments((prev) => prev.filter((doc) => doc.id !== id));
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
    if (sanadDocuments.length === 0) {
      setError('Please upload at least one Sanad or Educational Degree certificate');
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
        sanadDocuments: sanadDocuments.map((d) => ({
          title: d.title.trim() || 'Sanad / Degree Certificate',
          fileUrl: d.fileUrl,
          fileType: d.fileType
        })),
        sanadTitle: sanadDocuments[0]?.title || 'Sanad / Degree Certificate',
        sanadFileUrl: sanadDocuments[0]?.fileUrl || ''
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

            {/* Multiple Sanad / Degree Documents Upload Section */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                  <h4 className="text-xs font-bold text-emerald-950">
                    Sanad & Degree Documents *
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {sanadDocuments.length} Attached
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                Attach one or multiple Sanad certificates, degrees, or Tajweed diplomas (JPG, PNG, PDF up to 10MB each).
              </p>

              {/* Uploaded Documents List */}
              {sanadDocuments.length > 0 && (
                <div className="space-y-2.5">
                  {sanadDocuments.map((doc, idx) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white rounded-xl border border-emerald-200/90 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {doc.fileType?.includes('pdf') ? (
                            <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                          ) : (
                            <img
                              src={doc.fileUrl}
                              alt="Doc Preview"
                              className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <span className="text-xs font-bold text-slate-800">
                            Sanad #{idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px] sm:max-w-[200px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({doc.fileSize})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Document Title input */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                          Certificate Title / Sanad Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={doc.title}
                          onChange={(e) => handleDocumentTitleChange(doc.id, e.target.value)}
                          placeholder="e.g. Shahadat-ul-Almiya / Hifz Sanad / Tajweed Certificate / BS Degree"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Files Dropzone Button */}
              <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white rounded-xl p-3.5 text-center transition-colors">
                <label className="cursor-pointer block">
                  <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-emerald-700 block">
                    {sanadDocuments.length > 0
                      ? '+ Click to attach another degree / certificate'
                      : 'Click to select Sanad / Degree files (Select Multiple)'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Select JPG, PNG, or PDF documents
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleSanadsSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-[10px] text-amber-900 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Our academic board will review these credentials once submitted. You will not need to upload them again during onboarding.
                </span>
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
