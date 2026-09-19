'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Clock,
  Plus,
  FileText,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Turnstile from '../common/Turnstile';
import CustomSelect from '../common/CustomSelect';
import { allPakistaniCities, pakistaniCityAreas } from '../../data/pakistanAreas';
import { compressAvatarFile } from '../../utils/imageCompressor';
import { openDocumentInNewTab } from '../../utils/tutorHelpers';



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

const sanitizeDisciplines = (list) => {
  if (!list) return [];
  const arr = Array.isArray(list) ? list : [list];
  const cleaned = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      const s = item.replace(/[\[\]'"]/g, '').trim();
      if (s) cleaned.push(s);
    } else if (item && typeof item === 'object') {
      const val = item.title || item.name || item._id || item.id;
      if (val) cleaned.push(String(val));
    }
  }
  return Array.from(new Set(cleaned));
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
  const [isSubmitted, setIsSubmitted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ilm_tutor_signup_completed') === 'true';
    }
    return false;
  });

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
  const [selectedDisciplines, setSelectedDisciplines] = useState(() => sanitizeDisciplines(initialDraft.selectedDisciplines));
  const [hourlyRate, setHourlyRate] = useState(() => initialDraft.hourlyRate || '1500');
  const [monthlyRate, setMonthlyRate] = useState(() => initialDraft.monthlyRate || '15000');
  const [bio, setBio] = useState(() => initialDraft.bio || '');

  // -------------------------------------------------------------
  // STEP 4: Qualifications & Sanad (Multiple Degrees)
  // -------------------------------------------------------------
  const [degrees, setDegrees] = useState(() => {
    if (Array.isArray(initialDraft.degrees) && initialDraft.degrees.length > 0) {
      return initialDraft.degrees.map((d) => ({
        ...d,
        fileUrl: d.fileUrl || '',
        fileName: d.fileUrl ? (d.fileName || 'Attached Document Scan') : '',
        fileType: d.fileUrl ? (d.fileType || '') : ''
      }));
    }
    if (initialDraft.degreeTitle || initialDraft.sanadFile) {
      return [{
        id: 'deg_1',
        title: initialDraft.degreeTitle || '',
        completionYear: initialDraft.completionYear || '',
        institute: initialDraft.institute || '',
        fileUrl: initialDraft.sanadFile || '',
        fileName: initialDraft.sanadFile ? (initialDraft.sanadFileName || 'Attached Document Scan') : '',
        fileType: initialDraft.sanadFile?.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'
      }];
    }
    return [{
      id: 'deg_1',
      title: '',
      completionYear: '',
      institute: '',
      fileUrl: '',
      fileName: '',
      fileType: ''
    }];
  });
  const [experienceYears, setExperienceYears] = useState(() => {
    if (initialDraft.experienceYears !== undefined && initialDraft.experienceYears !== null && initialDraft.experienceYears !== '' && initialDraft.experienceYears !== '3') {
      return String(initialDraft.experienceYears);
    }
    return '';
  });

  const completionYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 1970; y--) {
      years.push(String(y));
    }
    return years;
  }, []);

  const addDegree = () => {
    setDegrees((prev) => [
      ...prev,
      {
        id: 'deg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: '',
        completionYear: '',
        institute: '',
        fileUrl: '',
        fileName: '',
        fileType: ''
      }
    ]);
  };

  const removeDegree = (degId) => {
    setDegrees((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((d) => d.id !== degId);
    });
  };

  const updateDegree = (degId, field, value) => {
    setDegrees((prev) => prev.map((d) => (d.id === degId ? { ...d, [field]: value } : d)));
  };

  const handleDegreeFileUpload = async (degId, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Document file size must be under 10MB.');
      return;
    }
    setError('');

    try {
      let dataUrl = '';
      const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
      if (isImage) {
        // Compress document scan to clean high-resolution ~150KB image
        dataUrl = await compressAvatarFile(file, 1200, 0.82);
      } else {
        // PDF or document
        dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const fileType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      setDegrees((prev) =>
        prev.map((d) =>
          d.id === degId
            ? {
                ...d,
                fileUrl: dataUrl,
                fileName: file.name,
                fileType
              }
            : d
        )
      );
      setError('');
    } catch (err) {
      console.error('File upload processing error:', err);
      setError('Could not process the attached file. Please select a valid document scan.');
    }
  };

  const removeDegreeFile = (degId) => {
    setDegrees((prev) =>
      prev.map((d) =>
        d.id === degId
          ? {
              ...d,
              fileUrl: '',
              fileName: '',
              fileType: ''
            }
          : d
      )
    );
  };

  // -------------------------------------------------------------
  // STEP 5: Payouts & Availability
  // -------------------------------------------------------------
  const [payoutChoice, setPayoutChoice] = useState(() => initialDraft.payoutChoice || 'admin'); // 'admin' (IlmiDunya Admin Accounts) | 'own' (Personal Accounts)
  const [payoutAccounts, setPayoutAccounts] = useState(() => {
    if (Array.isArray(initialDraft.payoutAccounts) && initialDraft.payoutAccounts.length > 0) {
      return initialDraft.payoutAccounts;
    }
    if (initialDraft.payoutProvider || initialDraft.payoutTitle || initialDraft.payoutAccount) {
      return [
        {
          id: 'acc_1',
          bankName: initialDraft.payoutProvider || '',
          accountTitle: initialDraft.payoutTitle || '',
          accountNumber: initialDraft.payoutAccount || '',
          isDefault: true
        }
      ];
    }
    return [
      {
        id: 'acc_1',
        bankName: '',
        accountTitle: '',
        accountNumber: '',
        isDefault: true
      }
    ];
  });
  const [selectedDays, setSelectedDays] = useState(() => initialDraft.selectedDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  const addPayoutAccount = () => {
    setPayoutAccounts((prev) => [
      ...prev,
      {
        id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        bankName: '',
        accountTitle: '',
        accountNumber: '',
        isDefault: prev.length === 0
      }
    ]);
  };

  const removePayoutAccount = (accId) => {
    setPayoutAccounts((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((a) => a.id !== accId);
      const hasDefault = filtered.some((a) => a.isDefault);
      if (!hasDefault && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  };

  const updatePayoutAccount = (accId, field, value) => {
    setPayoutAccounts((prev) =>
      prev.map((a) => (a.id === accId ? { ...a, [field]: value } : a))
    );
  };

  const setDefaultPayoutAccount = (accId) => {
    setPayoutAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === accId
      }))
    );
  };

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
        degrees: degrees.map((d) => {
          const canSaveUrl = d.fileUrl && d.fileUrl.length < 2500000;
          return {
            ...d,
            fileUrl: canSaveUrl ? d.fileUrl : '',
            fileName: canSaveUrl ? d.fileName : '',
            fileType: canSaveUrl ? d.fileType : ''
          };
        }),
        experienceYears,
        payoutChoice,
        payoutAccounts,
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
    degrees,
    experienceYears,
    payoutChoice,
    payoutAccounts,
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
        if (tp.teachingModes?.length && !teachingMode) {
          setTeachingMode(tp.teachingModes.length > 1 ? 'both' : (tp.teachingModes[0] === 'in_person' ? 'physical' : tp.teachingModes[0]));
        }
        if (tp.subjects?.length && (!selectedDisciplines || selectedDisciplines.length === 0)) {
          setSelectedDisciplines(sanitizeDisciplines(tp.subjects));
        }
        if (tp.hourlyRate && !hourlyRate) setHourlyRate(String(tp.hourlyRate));
        if (tp.monthlyRate && !monthlyRate) setMonthlyRate(String(tp.monthlyRate));
        if (tp.bio && !bio) setBio(tp.bio);
        if (Array.isArray(tp.sanadDocuments) && tp.sanadDocuments.length > 0) {
          setDegrees((prev) => {
            const isBlank = prev.length === 1 && !prev[0].title && !prev[0].fileUrl;
            if (isBlank) {
              return tp.sanadDocuments.map((doc, idx) => ({
                id: doc._id || 'deg_' + idx,
                title: doc.title || '',
                completionYear: doc.completionYear ? String(doc.completionYear) : '',
                institute: doc.institute || '',
                fileUrl: doc.fileUrl || '',
                fileName: doc.title || 'Attached Document',
                fileType: doc.fileType || ''
              }));
            }
            return prev;
          });
        } else if ((tp.qualifications || tp.qualification) && (!degrees[0]?.title)) {
          updateDegree(degrees[0]?.id || 'deg_1', 'title', tp.qualifications || tp.qualification);
          if (tp.institute) updateDegree(degrees[0]?.id || 'deg_1', 'institute', tp.institute);
        }
        if (tp.experienceYears && !experienceYears) setExperienceYears(String(tp.experienceYears));
        if (tp.preferredAccountChoice && !initialDraft.payoutChoice) setPayoutChoice(tp.preferredAccountChoice);
        if (Array.isArray(tp.paymentMethods) && tp.paymentMethods.length > 0) {
          setPayoutAccounts((prev) => {
            const isBlank = prev.length === 1 && !prev[0].bankName && !prev[0].accountTitle && !prev[0].accountNumber;
            if (isBlank) {
              return tp.paymentMethods.map((pm, idx) => ({
                id: pm._id || 'acc_' + idx,
                bankName: pm.bankName || (pm.method ? pm.method.toUpperCase() : ''),
                accountTitle: pm.accountTitle || '',
                accountNumber: pm.accountNumber || '',
                isDefault: pm.isDefault !== undefined ? pm.isDefault : idx === 0
              }));
            }
            return prev;
          });
        } else if (tp.payoutMethod?.accountTitle || tp.payoutMethod?.accountNumber) {
          setPayoutAccounts((prev) => {
            const isBlank = prev.length === 1 && !prev[0].bankName && !prev[0].accountTitle && !prev[0].accountNumber;
            if (isBlank) {
              return [
                {
                  id: 'acc_1',
                  bankName: tp.payoutMethod.provider || '',
                  accountTitle: tp.payoutMethod.accountTitle || '',
                  accountNumber: tp.payoutMethod.accountNumber || '',
                  isDefault: true
                }
              ];
            }
            return prev;
          });
        }
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
        teachingModes: teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode],
        teachingMode,
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
    setSelectedDisciplines((prev) => {
      const cleaned = sanitizeDisciplines(prev);
      return cleaned.includes(item) ? cleaned.filter((d) => d !== item) : [...cleaned, item];
    });
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanDisciplines = sanitizeDisciplines(selectedDisciplines);
    if (cleanDisciplines.length === 0) {
      setError('Please select at least one teaching subject or discipline.');
      return;
    }

    setLoading(true);
    try {
      await api.updateMyTutorProfile({
        subjects: cleanDisciplines,
        hourlyRate: Number(hourlyRate) || 1500,
        monthlyRate: Number(monthlyRate) || 15000,
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
  const handleStep4Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!degrees || degrees.length === 0) {
      setError('Please add at least one qualification or degree.');
      return;
    }

    const currentYear = new Date().getFullYear();
    for (let i = 0; i < degrees.length; i++) {
      const deg = degrees[i];
      const indexNum = i + 1;
      if (!deg.title || !deg.title.trim()) {
        setError(`Please enter the degree / certificate name for Degree #${indexNum}.`);
        return;
      }
      if (!deg.completionYear || !String(deg.completionYear).trim()) {
        setError(`Please select the completion year for "${deg.title.trim()}".`);
        return;
      }
      const yearNum = Number(deg.completionYear);
      if (isNaN(yearNum) || yearNum < 1960 || yearNum > currentYear) {
        setError(`Please select a valid completion year (between 1960 and ${currentYear}) for "${deg.title.trim()}".`);
        return;
      }
      if (!deg.fileUrl) {
        setError(`Please upload the degree / certificate document scan for "${deg.title.trim()}".`);
        return;
      }
    }

    const trimmedExp = String(experienceYears ?? '').trim();
    let expNum = 0;
    if (trimmedExp !== '') {
      const parsed = Number(trimmedExp);
      if (isNaN(parsed) || parsed < 0) {
        setError('Please enter a valid number of years for teaching experience, or leave it blank if fresh.');
        return;
      }
      expNum = parsed;
    }

    const qualificationsString = degrees.map((d) => d.title.trim()).filter(Boolean).join(', ');
    const primaryInstitute = degrees.find((d) => d.institute?.trim())?.institute?.trim() || '';
    const sanadDocumentsPayload = degrees.map((d) => ({
      title: d.title.trim(),
      completionYear: Number(d.completionYear) || undefined,
      institute: (d.institute || '').trim(),
      fileUrl: d.fileUrl,
      fileType: d.fileType || (d.fileUrl?.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg')
    }));

    setLoading(true);
    try {
      await api.updateMyTutorProfile({
        qualification: qualificationsString,
        qualifications: qualificationsString,
        institute: primaryInstitute,
        experienceYears: expNum,
        sanadDocuments: sanadDocumentsPayload,
        sanadUrl: sanadDocumentsPayload[0]?.fileUrl || undefined
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

    if (payoutChoice === 'own') {
      if (!payoutAccounts || payoutAccounts.length === 0) {
        setError('Please add at least one personal payment account.');
        return;
      }
      for (let i = 0; i < payoutAccounts.length; i++) {
        const acc = payoutAccounts[i];
        if (!acc.bankName || !acc.bankName.trim()) {
          setError(`Please enter the bank / wallet name for Account #${i + 1}.`);
          return;
        }
        if (!acc.accountTitle || !acc.accountTitle.trim()) {
          setError(`Please enter the account title for Account #${i + 1} (${acc.bankName.trim()}).`);
          return;
        }
        if (!acc.accountNumber || !acc.accountNumber.trim()) {
          setError(`Please enter the account number / IBAN for Account #${i + 1} (${acc.bankName.trim()}).`);
          return;
        }
      }
    }

    if (selectedDays.length === 0) {
      setError('Please select at least one day you are available to teach.');
      return;
    }

    const qualificationsString = degrees.map((d) => d.title.trim()).filter(Boolean).join(', ');
    const primaryInstitute = degrees.find((d) => d.institute?.trim())?.institute?.trim() || '';
    const sanadDocumentsPayload = degrees.map((d) => ({
      title: d.title.trim(),
      completionYear: Number(d.completionYear) || undefined,
      institute: (d.institute || '').trim(),
      fileUrl: d.fileUrl,
      fileType: d.fileType || (d.fileUrl?.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg')
    }));

    const cleanPaymentMethods = payoutChoice === 'own'
      ? payoutAccounts
          .filter((a) => a.bankName?.trim() && a.accountTitle?.trim() && a.accountNumber?.trim())
          .map((a, idx) => ({
            bankName: a.bankName.trim(),
            accountTitle: a.accountTitle.trim(),
            accountNumber: a.accountNumber.trim(),
            isDefault: a.isDefault !== undefined ? a.isDefault : idx === 0
          }))
      : [];
    const primaryAcc = cleanPaymentMethods.find((a) => a.isDefault) || cleanPaymentMethods[0];

    setLoading(true);
    try {
      const finalPayload = {
        gender,
        age: Number(age) || 25,
        city,
        area: area || '',
        teachingModes: teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode],
        teachingMode,
        subjects: sanitizeDisciplines(selectedDisciplines),
        hourlyRate: Number(hourlyRate) || 1500,
        monthlyRate: Number(monthlyRate) || 15000,
        bio: bio.trim(),
        qualification: qualificationsString,
        qualifications: qualificationsString,
        institute: primaryInstitute,
        experienceYears: String(experienceYears ?? '').trim() !== '' ? (Number(experienceYears) || 0) : 0,
        sanadDocuments: sanadDocumentsPayload,
        sanadUrl: sanadDocumentsPayload[0]?.fileUrl || undefined,
        preferredAccountChoice: payoutChoice,
        ...(payoutChoice === 'own' && cleanPaymentMethods.length > 0
          ? {
              paymentMethods: cleanPaymentMethods,
              payoutMethod: {
                provider: primaryAcc.bankName,
                accountTitle: primaryAcc.accountTitle,
                accountNumber: primaryAcc.accountNumber
              }
            }
          : {}),
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

      // CLEAR ALL SIGNUP STORAGE FLAGS & SYNC AUTH COOKIES!
      try {
        localStorage.removeItem('ilm_tutor_signup_in_progress');
        localStorage.removeItem('ilm_tutor_signup_step');
        localStorage.removeItem('ilm_tutor_signup_highest_step');
        localStorage.removeItem('ilm_tutor_signup_draft');
        localStorage.setItem('ilm_tutor_signup_completed', 'true');
        if (typeof document !== 'undefined') {
          const maxAge = 30 * 24 * 60 * 60;
          document.cookie = `ilm_auth=1; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `ilm_role=tutor; path=/; max-age=${maxAge}; SameSite=Lax`;
          const currentToken = localStorage.getItem('ilm_token');
          if (currentToken) {
            document.cookie = `ilm_token=${encodeURIComponent(currentToken)}; path=/; max-age=${maxAge}; SameSite=Lax`;
          }
        }
      } catch (storageErr) {
        console.warn('Storage cleanup notice:', storageErr);
      }

      setIsSubmitted(true);
      setSuccess('Application submitted successfully! Redirecting to your tutor dashboard...');
      setTimeout(() => {
        try {
          router.push('/tutor/dashboard');
        } catch (_) {}
        if (typeof window !== 'undefined') {
          window.location.href = '/tutor/dashboard';
        }
      }, 1000);
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
              {currentStep === 3 && 'Teaching Subjects'}
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
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="leading-snug">{success}</span>
          </div>
          <Link
            href="/tutor/dashboard"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/tutor/dashboard';
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#0c2217] hover:bg-[#143d2b] text-white rounded-xl font-bold text-xs shrink-0 shadow-sm transition-all cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {isSubmitted ? (
        <div className="bg-white border border-[#e6dfd5] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95 my-2">
          <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              Application Submitted Successfully!
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              Your tutor profile and educational credentials have been submitted for admin verification.
              You can now access your tutor dashboard to view your profile status, manage your schedule, and set up courses.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tutor/dashboard"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/tutor/dashboard';
                }
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Open Tutor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-[11px] text-stone-400">
            If you are not redirected automatically in a moment, click the button above.
          </p>
        </div>
      ) : (
        <>
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
              <span>Next: Teaching Subjects</span>
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
                const checked = selectedDisciplines.some((s) => s === disc.id || s === disc.title);
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
          STEP 4: QUALIFICATIONS & SANAD (DEGREES UPLOAD)
         ══════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <form onSubmit={handleStep4Submit} className="space-y-4">
          <div className="bg-[#fcfbf9] border border-[#e6dfd5] rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
              <GraduationCap className="w-4 h-4 text-[#b85d34]" />
              <span>Degrees &amp; Sanad Certificates</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Please upload your degrees or certificates (Image or PDF). For each credential, provide the degree title and completion year.
            </p>
          </div>

          {/* Dynamic Degree Cards */}
          <div className="space-y-3.5">
            {degrees.map((deg, idx) => (
              <div
                key={deg.id || idx}
                className="bg-white border border-[#e6dfd5] rounded-2xl p-3.5 space-y-3 shadow-2xs relative"
              >
                {/* Header with item badge and delete button */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0c2217] text-[#d4a359] text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      Degree / Certificate #{idx + 1}
                    </span>
                  </div>
                  {degrees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDegree(deg.id)}
                      className="text-stone-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Remove this degree"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Remove</span>
                    </button>
                  )}
                </div>

                {/* Degree Name / Title */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Degree / Certificate Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shahadat-ul-Alimiyyah, BS Computer Science, Hafiz-ul-Quran"
                    value={deg.title}
                    onChange={(e) => updateDegree(deg.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Completion Year & Institute */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Year of Completion <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={deg.completionYear || ''}
                      onChange={(e) => updateDegree(deg.id, 'completionYear', e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium cursor-pointer"
                    >
                      <option value="">Select Year</option>
                      {completionYearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Institute / University / Board
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wifaq-ul-Madaris / Punjab Univ"
                      value={deg.institute || ''}
                      onChange={(e) => updateDegree(deg.id, 'institute', e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Degree Document File Upload */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Upload Degree / Certificate Document <span className="text-red-500">*</span>
                  </label>
                  <div className="p-3 rounded-xl bg-[#faf8f5] border border-dashed border-[#e6dfd5] text-center hover:border-stone-400 transition-colors">
                    {deg.fileUrl ? (
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-700 bg-white p-2 rounded-lg border border-[#e6dfd5]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {deg.fileType === 'application/pdf' || deg.fileName?.endsWith('.pdf') || deg.fileUrl?.startsWith('data:application/pdf') ? (
                            <div className="w-8 h-8 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-rose-600" />
                            </div>
                          ) : (
                            <img
                              src={deg.fileUrl}
                              alt="Scan Preview"
                              className="w-8 h-8 object-cover rounded-md border border-stone-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0 text-left">
                            <span className="truncate font-bold text-stone-800 text-xs block">
                              {deg.fileName || 'Attached Document Scan'}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Scan Attached &amp; Verified
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openDocumentInNewTab(deg.fileUrl, deg.fileName || deg.title || 'sanad-document')}
                            className="text-[#b85d34] hover:text-[#9e4e2a] font-bold text-xs cursor-pointer px-2 py-1 hover:bg-stone-100 rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Preview attached document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDegreeFile(deg.id)}
                            className="text-red-600 hover:text-red-800 font-bold text-xs shrink-0 cursor-pointer px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-xs text-stone-500 hover:text-[#b85d34] flex flex-col items-center gap-1.5 py-1.5">
                        <Upload className="w-5 h-5 text-[#b85d34]" />
                        <span className="font-semibold text-stone-700">Click to upload Sanad or Degree copy</span>
                        <span className="text-[10px] text-stone-400">Image (JPG, PNG) or PDF up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleDegreeFileUpload(deg.id, e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Degree Button */}
          <button
            type="button"
            onClick={addDegree}
            className="w-full py-2.5 px-3 bg-[#faf8f5] hover:bg-stone-100 text-stone-800 font-bold text-xs rounded-xl border border-dashed border-[#d4a359] hover:border-[#b85d34] flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-[#b85d34]" />
            <span>+ Add Another Degree / Certificate</span>
          </button>

          {/* Overall Teaching Experience */}
          <div className="pt-1">
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Total Teaching Experience (Years)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              placeholder="Leave it if fresh"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Leave blank if fresh graduate / beginner tutor. It will appear on your profile as <strong>Fresh</strong>.
            </p>
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
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <div className="bg-[#fcfbf9] border border-[#e6dfd5] rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 text-[#b85d34]" />
              <span>Tuition Fee Receiving Preference</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Choose how you want to receive tuition fee payments from students.
            </p>
          </div>

          {/* Receiving Mode Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: IlmiDunya Administration Account (Default) */}
            <div
              onClick={() => setPayoutChoice('admin')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                payoutChoice === 'admin'
                  ? 'border-[#0c2217] bg-[#f8f6f0] ring-2 ring-[#0c2217]/10 shadow-xs'
                  : 'border-[#e6dfd5] bg-white hover:border-stone-400'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        payoutChoice === 'admin'
                          ? 'bg-[#0c2217] text-[#d4a359]'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      IlmiDunya Administration
                    </span>
                  </div>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Default
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Students pay fees to official IlmiDunya verified accounts. Fees are disbursed directly to you.
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10.5px]">
                <span className="text-stone-500">No bank info required now</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    payoutChoice === 'admin' ? 'text-[#0c2217]' : 'text-stone-400'
                  }`}
                >
                  {payoutChoice === 'admin' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select this</span>
                  )}
                </span>
              </div>
            </div>

            {/* Option 2: Personal Accounts */}
            <div
              onClick={() => setPayoutChoice('own')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                payoutChoice === 'own'
                  ? 'border-[#0c2217] bg-[#f8f6f0] ring-2 ring-[#0c2217]/10 shadow-xs'
                  : 'border-[#e6dfd5] bg-white hover:border-stone-400'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        payoutChoice === 'own'
                          ? 'bg-[#0c2217] text-[#d4a359]'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      My Personal Accounts
                    </span>
                  </div>
                  {payoutChoice === 'own' && (
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#0c2217] text-[#d4a359]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Students transfer fees directly to your personal Pakistani bank account(s), JazzCash, or EasyPaisa.
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10.5px]">
                <span className="text-stone-500">Direct student-to-tutor</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    payoutChoice === 'own' ? 'text-[#0c2217]' : 'text-stone-400'
                  }`}
                >
                  {payoutChoice === 'own' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select this</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Conditional Personal Accounts Form */}
          {payoutChoice === 'own' ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#b85d34]" />
                    <span>Your Personal Fee Receiving Accounts</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Enter your bank or mobile wallet details. You can add multiple accounts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPayoutAccount}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#b85d34] text-[#b85d34] hover:bg-[#b85d34] hover:text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Account</span>
                </button>
              </div>

              {payoutAccounts.map((acc, idx) => (
                <div
                  key={acc.id || idx}
                  className="bg-white border border-[#e6dfd5] rounded-2xl p-3.5 space-y-3 shadow-2xs relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        {acc.bankName ? acc.bankName : `Account #${idx + 1}`}
                      </span>
                      {acc.isDefault ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDefaultPayoutAccount(acc.id)}
                          className="text-[10.5px] text-stone-500 hover:text-stone-900 underline font-medium cursor-pointer"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>
                    {payoutAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePayoutAccount(acc.id)}
                        className="p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove this account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Bank or Wallet Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meezan Bank, JazzCash, EasyPaisa, HBL, Bank Alfalah"
                      value={acc.bankName}
                      onChange={(e) => updatePayoutAccount(acc.id, 'bankName', e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium placeholder:text-stone-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-stone-800 block mb-1">
                        Account Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Name as registered on account"
                        value={acc.accountTitle}
                        onChange={(e) => updatePayoutAccount(acc.id, 'accountTitle', e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-800 block mb-1">
                        Account Number / IBAN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Account number or IBAN"
                        value={acc.accountNumber}
                        onChange={(e) => updatePayoutAccount(acc.id, 'accountNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white transition-all font-medium placeholder:text-stone-400"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPayoutAccount}
                className="w-full py-2 border-2 border-dashed border-[#e6dfd5] hover:border-[#b85d34] rounded-xl text-xs font-bold text-stone-600 hover:text-[#b85d34] flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white/50 hover:bg-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Personal Account</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] text-xs text-stone-700 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-stone-900">
                  Official Administration Accounts active by default
                </p>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Students will be provided IlmiDunya official payment options for fee settlements. You can switch to or add personal accounts anytime in your profile settings after completing registration.
                </p>
              </div>
            </div>
          )}

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
            <span>Guaranteed monthly tuition payout protection on live lessons.</span>
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
        </>
      )}
    </div>
  );
}

