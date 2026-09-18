'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  CreditCard,
  Check,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Turnstile from '../common/Turnstile';
import CustomSelect from '../common/CustomSelect';
import { allPakistaniCities, pakistaniCityAreas } from '../../data/pakistanAreas';
import { compressAvatarFile } from '../../utils/imageCompressor';

// Popular qualification presets
const QUALIFICATION_PRESETS = [
  'Shahadat-ul-Alimiyyah (Dars-e-Nizami)',
  'Hafiz-ul-Quran & Tajweed Specialist',
  'Qari-e-Quran (Wifaq-ul-Madaris)',
  'M.Phil / MS Islamic Studies',
  'M.Sc Mathematics / Physics',
  'M.Sc Chemistry / Biology',
  'M.A English / Urdu Literature',
  'B.S Computer Science / IT',
  'O / A-Level Cambridge Specialist'
];

// Popular Pakistani payment providers
const PAYMENT_PROVIDERS = [
  { id: 'JazzCash', name: 'JazzCash Mobile Account' },
  { id: 'EasyPaisa', name: 'EasyPaisa Mobile Account' },
  { id: 'Meezan Bank', name: 'Meezan Bank (Islamic Banking)' },
  { id: 'HBL', name: 'Habib Bank Limited (HBL)' },
  { id: 'UBL', name: 'United Bank Limited (UBL)' },
  { id: 'Bank Alfalah', name: 'Bank Alfalah Islamic' },
  { id: 'Allied Bank', name: 'Allied Bank (ABL)' },
  { id: 'Faysal Bank', name: 'Faysal Islamic Bank' },
  { id: 'Other Bank', name: 'Other Commercial / Islamic Bank' }
];

const STEPS = [
  { num: 1, label: 'Account' },
  { num: 2, label: 'Profile' },
  { num: 3, label: 'Subjects' },
  { num: 4, label: 'Degrees' },
  { num: 5, label: 'Payout' }
];

const loadTutorSignupDraft = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('ilm_tutor_signup_draft');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export default function TutorCardMultiStepSignup({ onSwitchToSignIn }) {
  const router = useRouter();
  const { user, token, verifyOtp: authVerifyOtp, updateTutorProfileState } = useAuth();

  // Wizard state: restore from localStorage if user reloaded
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('ilm_tutor_signup_step');
      if (savedStep && !isNaN(Number(savedStep))) {
        const stepNum = Number(savedStep);
        if (stepNum >= 1 && stepNum <= 5) return stepNum;
      }
    }
    return 1;
  });

  const [highestStep, setHighestStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedHighest = localStorage.getItem('ilm_tutor_signup_highest_step');
      if (savedHighest && !isNaN(Number(savedHighest))) {
        const hNum = Number(savedHighest);
        if (hNum >= 1 && hNum <= 5) return hNum;
      }
      const savedStep = localStorage.getItem('ilm_tutor_signup_step');
      if (savedStep && !isNaN(Number(savedStep))) {
        const sNum = Number(savedStep);
        if (sNum >= 1 && sNum <= 5) return sNum;
      }
    }
    return 1;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initial draft loaded once on mount
  const initialDraft = useMemo(() => loadTutorSignupDraft(), []);

  // -------------------------------------------------------------
  // STEP 1: Account Credentials & Email OTP Gate
  // -------------------------------------------------------------
  const [name, setName] = useState(() => initialDraft.name || '');
  const [email, setEmail] = useState(() => initialDraft.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);

  const [step1Mode, setStep1Mode] = useState(() => initialDraft.step1Mode || 'credentials'); // 'credentials' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // -------------------------------------------------------------
  // STEP 2: Personal Details, Photo & Location
  // -------------------------------------------------------------
  const [avatar, setAvatar] = useState(() => initialDraft.avatar || '');
  const [gender, setGender] = useState(() => initialDraft.gender || 'male');
  const [age, setAge] = useState(() => initialDraft.age || '');
  const [city, setCity] = useState(() => initialDraft.city || '');
  const [area, setArea] = useState(() => initialDraft.area || '');
  const [teachingMode, setTeachingMode] = useState(() => initialDraft.teachingMode || 'both'); // 'online' | 'physical' | 'both'

  // -------------------------------------------------------------
  // STEP 3: Teaching Categories, Subjects & Rates
  // -------------------------------------------------------------
  const [selectedDisciplines, setSelectedDisciplines] = useState(() => initialDraft.selectedDisciplines || []);
  const [hourlyRate, setHourlyRate] = useState(() => initialDraft.hourlyRate || '1500');
  const [monthlyRate, setMonthlyRate] = useState(() => initialDraft.monthlyRate || '15000');
  const [bio, setBio] = useState(() => initialDraft.bio || '');

  // -------------------------------------------------------------
  // STEP 4: Qualifications & Sanad
  // -------------------------------------------------------------
  const [degreeTitle, setDegreeTitle] = useState(() => initialDraft.degreeTitle || '');
  const [institute, setInstitute] = useState(() => initialDraft.institute || '');
  const [experienceYears, setExperienceYears] = useState(() => initialDraft.experienceYears || '3');
  const [sanadFile, setSanadFile] = useState(() => initialDraft.sanadFile || '');
  const [sanadFileName, setSanadFileName] = useState(() => initialDraft.sanadFileName || '');

  // -------------------------------------------------------------
  // STEP 5: Payouts & Availability
  // -------------------------------------------------------------
  const [payoutProvider, setPayoutProvider] = useState(() => initialDraft.payoutProvider || 'JazzCash');
  const [payoutTitle, setPayoutTitle] = useState(() => initialDraft.payoutTitle || '');
  const [payoutAccount, setPayoutAccount] = useState(() => initialDraft.payoutAccount || '');
  const [selectedDays, setSelectedDays] = useState(() => initialDraft.selectedDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  // Auto-save form draft & step state to localStorage on every change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dataToSave = {
        name,
        email,
        step1Mode,
        avatar,
        gender,
        age,
        city,
        area,
        teachingMode,
        selectedDisciplines,
        hourlyRate,
        monthlyRate,
        bio,
        degreeTitle,
        institute,
        experienceYears,
        sanadFileName,
        sanadFile: (sanadFile && sanadFile.length < 1500000) ? sanadFile : '',
        payoutProvider,
        payoutTitle,
        payoutAccount,
        selectedDays
      };
      localStorage.setItem('ilm_tutor_signup_draft', JSON.stringify(dataToSave));
      localStorage.setItem('ilm_tutor_signup_step', String(currentStep));
      localStorage.setItem('ilm_tutor_signup_highest_step', String(highestStep));
      if (localStorage.getItem('ilm_tutor_signup_completed') !== 'true') {
        localStorage.setItem('ilm_tutor_signup_in_progress', 'true');
      }
    } catch (e) {
      console.warn('Could not cache signup draft to localStorage:', e);
    }
  }, [
    name,
    email,
    step1Mode,
    avatar,
    gender,
    age,
    city,
    area,
    teachingMode,
    selectedDisciplines,
    hourlyRate,
    monthlyRate,
    bio,
    degreeTitle,
    institute,
    experienceYears,
    sanadFile,
    sanadFileName,
    payoutProvider,
    payoutTitle,
    payoutAccount,
    selectedDays,
    currentStep,
    highestStep
  ]);

  // Pre-fill from existing user session if available
  useEffect(() => {
    if (user && user.role === 'tutor') {
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
      if (user.isVerified) {
        setIsEmailVerified(true);
        // Only bump step if currently on step 1 and no saved higher step in localStorage
        const savedStep = typeof window !== 'undefined' ? Number(localStorage.getItem('ilm_tutor_signup_step')) : 0;
        if (currentStep === 1) {
          if (savedStep && savedStep > 1) {
            setCurrentStep(savedStep);
          } else {
            setCurrentStep(2);
            setHighestStep((prev) => Math.max(prev, 2));
          }
        }
      }
      if (user.tutorProfile) {
        const tp = user.tutorProfile;
        if (tp.gender && !gender) setGender(tp.gender);
        if (tp.age && !age) setAge(String(tp.age));
        if (tp.city && !city) setCity(tp.city);
        if (tp.area && !area) setArea(tp.area);
        if (tp.teachingModes?.[0] && !teachingMode) setTeachingMode(tp.teachingModes[0]);
        if (tp.subjects?.length && (!selectedDisciplines || selectedDisciplines.length === 0)) setSelectedDisciplines(tp.subjects);
        if (tp.hourlyRate && !hourlyRate) setHourlyRate(String(tp.hourlyRate));
        if (tp.monthlyRate && !monthlyRate) setMonthlyRate(String(tp.monthlyRate));
        if (tp.bio && !bio) setBio(tp.bio);
        if (tp.qualifications && !degreeTitle) setDegreeTitle(tp.qualifications);
        else if (tp.qualification && !degreeTitle) setDegreeTitle(tp.qualification);
        if (tp.institute && !institute) setInstitute(tp.institute);
        if (tp.experienceYears && !experienceYears) setExperienceYears(String(tp.experienceYears));
        if (tp.payoutMethod?.provider && !payoutProvider) setPayoutProvider(tp.payoutMethod.provider);
        if (tp.payoutMethod?.accountTitle && !payoutTitle) setPayoutTitle(tp.payoutMethod.accountTitle);
        if (tp.payoutMethod?.accountNumber && !payoutAccount) setPayoutAccount(tp.payoutMethod.accountNumber);
        if (tp.availabilityDays?.length && (!selectedDays || selectedDays.length === 0)) setSelectedDays(tp.availabilityDays);
      }
    }
  }, [user]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (step1Mode === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step1Mode, otpTimer]);

  // Areas available for selected city
  const availableAreas = useMemo(() => {
    if (!city) return [];
    return pakistaniCityAreas[city] || [];
  }, [city]);

  // -------------------------------------------------------------
  // STEP 1 HANDLERS
  // -------------------------------------------------------------
  const handleRegisterAndSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!turnstileToken) {
      setError('Please complete the security check before registering.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'tutor',
        turnstileToken,
        captchaToken: turnstileToken
      };

      const res = await api.register(payload);

      if (res.token) {
        localStorage.setItem('ilm_token', res.token);
      }

      setStep1Mode('otp');
      setOtpTimer(60);
      setCanResendOtp(false);
      setSuccess('Verification code sent! Please check your email inbox.');
    } catch (err) {
      console.error('Registration error:', err);
      setTurnstileToken('');
      turnstileRef.current?.reset();
      if (err.message?.toLowerCase().includes('already') || err.message?.toLowerCase().includes('exists')) {
        setError('An account with this email already exists. You can sign in using the tab above.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otpCode.trim(),
        role: 'tutor'
      });

      if (res.success && res.token) {
        localStorage.setItem('ilm_token', res.token);
        if (res.user) {
          authVerifyOtp?.(res.token, res.user);
        }
        setIsEmailVerified(true);
        setSuccess('Email verified successfully! Proceeding to Step 2...');
        if (typeof window !== 'undefined') {
          localStorage.setItem('ilm_tutor_signup_in_progress', 'true');
          localStorage.setItem('ilm_tutor_signup_step', '2');
          localStorage.setItem('ilm_tutor_signup_highest_step', '2');
        }
        setTimeout(() => {
          setCurrentStep(2);
          setHighestStep((prev) => Math.max(prev, 2));
          setError('');
          setSuccess('');
        }, 500);
      } else {
        setError(res.message || 'Verification failed. Please enter the valid code.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp || loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.resendOtp({ email: email.trim().toLowerCase(), role: 'tutor' });
      setOtpTimer(60);
      setCanResendOtp(false);
      setSuccess('A new 6-digit code has been sent to your email.');
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.message || 'Could not resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2 HANDLERS
  // -------------------------------------------------------------
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressAvatarFile(file);
      setAvatar(compressed);
    } catch (err) {
      console.warn('Avatar compression error:', err);
      setError('Image too large. Please select a photo under 2MB.');
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!age || Number(age) < 18 || Number(age) > 85) {
      setError('Please enter a valid age between 18 and 85 years.');
      return;
    }
    if (!city) {
      setError('Please select your primary city.');
      return;
    }

    setLoading(true);
    try {
      await api.updateMyTutorProfile({
        gender,
        age: Number(age),
        city,
        area: area || '',
        teachingModes: [teachingMode],
        avatar: avatar || undefined
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('ilm_tutor_signup_step', '3');
        localStorage.setItem('ilm_tutor_signup_highest_step', String(Math.max(highestStep, 3)));
      }
      setCurrentStep(3);
      setHighestStep((prev) => Math.max(prev, 3));
    } catch (err) {
      console.warn('Autosave step 2 notice:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ilm_tutor_signup_step', '3');
        localStorage.setItem('ilm_tutor_signup_highest_step', String(Math.max(highestStep, 3)));
      }
      setCurrentStep(3);
      setHighestStep((prev) => Math.max(prev, 3));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3 HANDLERS
  // -------------------------------------------------------------
  const toggleDiscipline = (item) => {
    setSelectedDisciplines((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedDisciplines.length === 0) {
      setError('Please select at least one teaching subject or discipline.');
      return;
    }
    if (!hourlyRate || Number(hourlyRate) < 100) {
      setError('Please enter a valid hourly rate (minimum 100 PKR).');
      return;
    }

    setLoading(true);
    try {
      await api.updateMyTutorProfile({
        subjects: selectedDisciplines,
        hourlyRate: Number(hourlyRate),
        monthlyRate: Number(monthlyRate) || 0,
        bio: bio.trim()
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('ilm_tutor_signup_step', '4');
        localStorage.setItem('ilm_tutor_signup_highest_step', String(Math.max(highestStep, 4)));
      }
      setCurrentStep(4);
      setHighestStep((prev) => Math.max(prev, 4));
    } catch (err) {
      console.warn('Autosave step 3 notice:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ilm_tutor_signup_step', '4');
        localStorage.setItem('ilm_tutor_signup_highest_step', String(Math.max(highestStep, 4)));
      }
      setCurrentStep(4);
      setHighestStep((prev) => Math.max(prev, 4));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 4 HANDLERS
  // -------------------------------------------------------------
  const handleSanadUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Document file size must be under 5MB.');
      return;
    }
    setSanadFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSanadFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStep4Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!degreeTitle.trim()) {
      setError('Please select or specify your highest qualification or Sanad.');
      return;
    }

    setLoading(true);
    try {
      await api.updateMyTutorProfile({
        qualification: degreeTitle.trim(),
        qualifications: degreeTitle.trim(),
        institute: institute.trim(),
        experienceYears: Number(experienceYears) || 1,
        sanadUrl: sanadFile || undefined
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('ilm_tutor_signup_step', '5');
        localStorage.setItem('ilm_tutor_signup_highest_step', String(Math.max(highestStep, 5)));
      }
      setCurrentStep(5);
      setHighestStep((prev) => Math.max(prev, 5));
    } catch (err) {
      console.warn('Autosave step 4 notice:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ilm_tutor_signup_step', '5');
        localStorage.setItem('ilm_tutor_signup_highest_step', String(Math.max(highestStep, 5)));
      }
      setCurrentStep(5);
      setHighestStep((prev) => Math.max(prev, 5));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 5 HANDLERS
  // -------------------------------------------------------------
  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!payoutTitle.trim()) {
      setError('Please enter your account title as registered with the bank/service.');
      return;
    }
    if (!payoutAccount.trim()) {
      setError('Please enter your account number or IBAN.');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one day you are available to teach.');
      return;
    }

    setLoading(true);
    try {
      const finalPayload = {
        gender,
        age: Number(age) || 25,
        city,
        area: area || '',
        teachingModes: [teachingMode],
        subjects: selectedDisciplines,
        hourlyRate: Number(hourlyRate) || 1500,
        monthlyRate: Number(monthlyRate) || 15000,
        bio: bio.trim(),
        qualification: degreeTitle.trim(),
        qualifications: degreeTitle.trim(),
        institute: institute.trim(),
        experienceYears: Number(experienceYears) || 1,
        sanadUrl: sanadFile || undefined,
        payoutMethod: {
          provider: payoutProvider,
          accountTitle: payoutTitle.trim(),
          accountNumber: payoutAccount.trim()
        },
        availabilityDays: selectedDays,
        verificationStatus: 'under_review',
        isProfileComplete: true
      };

      const res = await api.updateMyTutorProfile(finalPayload);
      if (res.profile) {
        updateTutorProfileState?.(res.profile);
      } else if (res.user) {
        updateTutorProfileState?.(res.user.tutorProfile || {});
      }

      // CLEAR ALL SIGNUP STORAGE FLAGS!
      try {
        localStorage.removeItem('ilm_tutor_signup_in_progress');
        localStorage.removeItem('ilm_tutor_signup_step');
        localStorage.removeItem('ilm_tutor_signup_highest_step');
        localStorage.removeItem('ilm_tutor_signup_draft');
        localStorage.setItem('ilm_tutor_signup_completed', 'true');
      } catch (storageErr) {
        console.warn('Storage cleanup notice:', storageErr);
      }

      setSuccess('Application submitted successfully! Loading your tutor dashboard...');
      setTimeout(() => {
        router.push('/tutor/dashboard');
      }, 700);
    } catch (err) {
      console.error('Final registration error:', err);
      setError(err.message || 'Could not complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 5-Step Compact Progress Pill Bar */}
      <div className="bg-[#faf8f5] p-3 rounded-2xl border border-[#e6dfd5] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-700">
          <span className="flex items-center gap-1.5 text-[#b85d34]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {currentStep} of 5:</span>
            <span className="text-stone-800">
              {currentStep === 1 && 'Credentials & Verification'}
              {currentStep === 2 && 'Personal Profile & Location'}
              {currentStep === 3 && 'Subjects & Rates'}
              {currentStep === 4 && 'Education & Sanad'}
              {currentStep === 5 && 'Payouts & Availability'}
            </span>
          </span>
          <span className="font-mono text-[11px] text-[#b85d34]">{currentStep * 20}%</span>
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {STEPS.map((s) => {
            const isCurrent = currentStep === s.num;
            const isDone = highestStep > s.num || (s.num === 1 && isEmailVerified);
            const isClickable = !loading && (s.num <= highestStep && (s.num === 1 || isEmailVerified));

            return (
              <button
                key={s.num}
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable) {
                    setCurrentStep(s.num);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('ilm_tutor_signup_step', String(s.num));
                    }
                  }
                }}
                className={`h-9 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 border text-center ${
                  isCurrent
                    ? 'bg-[#b85d34] border-[#b85d34] text-white shadow-xs font-bold'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer font-semibold'
                    : 'bg-stone-100 text-stone-400 border-transparent cursor-not-allowed font-medium'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 leading-none ${
                    isCurrent
                      ? 'bg-white/25 text-white'
                      : isDone
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.num}
                </span>
                <span className="text-[11px] font-semibold leading-none hidden sm:inline truncate">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-3 bg-[#fdf2f0] border border-[#f5d6cf] text-[#b85d34] rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#b85d34]" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 1: CREDENTIALS & INLINE OTP
         ══════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div>
          {step1Mode === 'credentials' && !isEmailVerified ? (
            <form onSubmit={handleRegisterAndSendOtp} autoComplete="off" className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Full Name (as per CNIC / Sanad) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="tutor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Create Password (min. 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Turnstile
                ref={turnstileRef}
                onVerify={(t) => setTurnstileToken(t)}
                onExpire={() => setTurnstileToken('')}
                action="tutor_register"
                size="normal"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Email Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : isEmailVerified ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-emerald-900">Email Address Verified!</h4>
              <p className="text-xs text-stone-600">
                {email} is verified and linked to your teaching profile.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Step 2: Personal Profile</span>
                <ArrowRight className="w-4 h-4 text-[#d4a359]" />
              </button>
            </div>
          ) : (
            // OTP Code Input Mode
            <form onSubmit={handleVerifyOtp} className="space-y-4 p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5]">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#f5ebe6] text-[#b85d34] flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-stone-900">Enter Verification Code</h4>
                <p className="text-xs text-stone-600">
                  We sent a 6-digit code to <strong className="text-stone-800">{email}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-3 bg-white border-2 border-[#b85d34]/40 rounded-2xl text-center text-xl tracking-[0.4em] font-mono font-bold text-stone-900 outline-none focus:border-[#b85d34] transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600">
                <button
                  type="button"
                  onClick={() => setStep1Mode('credentials')}
                  className="text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  Edit email address
                </button>

                {canResendOtp ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#b85d34] font-bold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="text-stone-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Resend in {otpTimer}s
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 2: PERSONAL PROFILE & LOCATION
         ══════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-3.5">
          {/* Avatar Photo Preview & Upload */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5]">
            <div className="relative shrink-0">
              <img
                src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Tutor')}&background=0c2217&color=d4a359&size=96`}
                alt="Profile Avatar"
                className="w-14 h-14 rounded-2xl object-cover border border-[#d4a359]/40 shadow-xs"
              />
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-stone-900">Profile Photo</h5>
              <p className="text-[11px] text-stone-500">Dignified portrait (Max 2MB)</p>
              <label className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-[#e6dfd5] text-[11px] font-bold cursor-pointer">
                <Camera className="w-3 h-3 text-[#b85d34]" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Gender *</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    gender === 'male'
                      ? 'bg-[#0c2217] border-[#0c2217] text-[#d4a359]'
                      : 'bg-[#faf8f5] border-[#e6dfd5] text-stone-600 hover:border-stone-400'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    gender === 'female'
                      ? 'bg-[#0c2217] border-[#0c2217] text-[#d4a359]'
                      : 'bg-[#faf8f5] border-[#e6dfd5] text-stone-600 hover:border-stone-400'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Age (Years) *</label>
              <input
                type="number"
                min={18}
                max={85}
                required
                placeholder="Enter Your Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Primary City & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">City in Pakistan *</label>
              <CustomSelect
                options={allPakistaniCities}
                value={city}
                onChange={(c) => {
                  setCity(c);
                  setArea('');
                }}
                placeholder="Select city..."
                searchable
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Area / Tehsil</label>
              {availableAreas.length > 0 ? (
                <CustomSelect
                  options={availableAreas}
                  value={area}
                  onChange={(a) => setArea(a)}
                  placeholder="Select area..."
                  searchable
                  className="text-xs"
                />
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Model Town / Cantt"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                />
              )}
            </div>
          </div>

          {/* Teaching Modes */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Teaching Preference *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'online', label: 'Online Only' },
                { id: 'physical', label: 'In-Person Home' },
                { id: 'both', label: 'Both Modes' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTeachingMode(m.id)}
                  className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    teachingMode === m.id
                      ? 'bg-[#b85d34] border-[#b85d34] text-white shadow-xs'
                      : 'bg-[#faf8f5] border-[#e6dfd5] text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-2.5 px-4 bg-[#faf8f5] hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-[#e6dfd5] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next: Subjects &amp; Rates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 3: SUBJECTS, RATES & BIO
         ══════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <form onSubmit={handleStep3Submit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5">
              Select Teaching Disciplines *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Quran Nazra & Tajweed', title: 'Quran Nazra & Tajweed', desc: 'Noorani Qaida & recitation' },
                { id: 'Hifz-ul-Quran Specialist', title: 'Hifz-ul-Quran', desc: 'Memorization & Murajaah' },
                { id: 'Dars-e-Nizami & Hadith', title: 'Dars-e-Nizami', desc: 'Arabic, Fiqh & Hadith' },
                { id: 'Matric & FSc Sciences', title: 'Matric / FSc Sciences', desc: 'Physics, Chemistry, Bio' },
                { id: 'Mathematics (All Grades)', title: 'Mathematics', desc: 'Grade 1 to 12 & Calculus' },
                { id: 'O / A-Level Cambridge', title: 'O / A-Levels', desc: 'IGCSE & Cambridge board' }
              ].map((disc) => {
                const checked = selectedDisciplines.includes(disc.id);
                return (
                  <div
                    key={disc.id}
                    onClick={() => toggleDiscipline(disc.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2 ${
                      checked
                        ? 'bg-[#f5ebe6] border-[#b85d34] text-stone-900'
                        : 'bg-[#faf8f5] border-[#e6dfd5] text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center ${
                        checked ? 'bg-[#b85d34] border-[#b85d34] text-white' : 'border-stone-300 bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">{disc.title}</div>
                      <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{disc.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Hourly Rate (PKR) *</label>
              <input
                type="number"
                min={100}
                required
                placeholder="1500"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Monthly Approx (PKR)</label>
              <input
                type="number"
                min={1000}
                placeholder="15000"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Teaching Bio / Experience</label>
            <textarea
              rows={2}
              placeholder="Briefly describe your teaching methodology and background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium resize-none"
            />
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-2.5 px-4 bg-[#faf8f5] hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-[#e6dfd5] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next: Education &amp; Sanad</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 4: QUALIFICATIONS & SANAD
         ══════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <form onSubmit={handleStep4Submit} className="space-y-3.5">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Select Highest Degree or Preset *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUALIFICATION_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDegreeTitle(preset)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    degreeTitle === preset
                      ? 'bg-[#0c2217] border-[#0c2217] text-[#d4a359]'
                      : 'bg-[#faf8f5] border-[#e6dfd5] text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Shahadat-ul-Alimiyyah or M.Sc Physics"
              value={degreeTitle}
              onChange={(e) => setDegreeTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Institute / University</label>
              <input
                type="text"
                placeholder="e.g. Wifaq-ul-Madaris / Punjab Univ"
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Experience (Years)</label>
              <input
                type="number"
                min={0}
                max={50}
                placeholder="3"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Sanad / Degree Document Upload */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Sanad / Certificate Document (Optional)
            </label>
            <div className="p-3 rounded-xl bg-[#faf8f5] border border-dashed border-[#e6dfd5] text-center">
              {sanadFileName ? (
                <div className="flex items-center justify-between text-xs text-stone-700">
                  <span className="truncate max-w-[200px]">{sanadFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSanadFile('');
                      setSanadFileName('');
                    }}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer text-xs text-stone-500 hover:text-[#b85d34] flex flex-col items-center gap-1">
                  <GraduationCap className="w-5 h-5 text-[#b85d34]" />
                  <span>Click to attach Sanad or Degree copy (Image or PDF)</span>
                  <input type="file" accept="image/*,application/pdf" onChange={handleSanadUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="py-2.5 px-4 bg-[#faf8f5] hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-[#e6dfd5] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next: Payouts &amp; Availability</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 5: PAYOUT DETAILS & LAUNCH
         ══════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <form onSubmit={handleFinalSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Tuition Fee Receiving Provider *
            </label>
            <CustomSelect
              options={PAYMENT_PROVIDERS.map((p) => ({ value: p.id, label: p.name }))}
              value={payoutProvider}
              onChange={(p) => setPayoutProvider(p)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Account Title *</label>
              <input
                type="text"
                required
                placeholder="Name as registered on account"
                value={payoutTitle}
                onChange={(e) => setPayoutTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Account Number / IBAN *</label>
              <input
                type="text"
                required
                placeholder="Account number or IBAN"
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Availability Days */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Available Teaching Days *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0c2217] border-[#0c2217] text-[#d4a359]'
                        : 'bg-[#faf8f5] border-[#e6dfd5] text-stone-500 hover:border-stone-400'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] text-[11px] text-stone-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#b85d34] shrink-0" />
            <span>Guaranteed monthly tuition payout protection with zero commission on live lessons.</span>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="py-2.5 px-4 bg-[#faf8f5] hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-[#e6dfd5] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Application &amp; Enter Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

