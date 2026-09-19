'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
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
  MapPin,
  Camera,
  Upload,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Video,
  CreditCard,
  Check,
  Search,
  RefreshCw,
  Clock,
  Award,
  Compass,
  Building,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Turnstile from '../common/Turnstile';
import CustomSelect from '../common/CustomSelect';
import { allPakistaniCities, pakistaniCityAreas } from '../../data/pakistanAreas';
import { compressAvatarFile } from '../../utils/imageCompressor';
import { openDocumentInNewTab } from '../../utils/tutorHelpers';


// Popular qualification presets for fast selection
const QUALIFICATION_PRESETS = [
  'Shahadat-ul-Alimiyyah (Dars-e-Nizami)',
  'Hafiz-ul-Quran & Tajweed Specialist',
  'Qari-e-Quran (Wifaq-ul-Madaris)',
  'M.Phil / MS Islamic Studies',
  'M.Sc Mathematics / Physics',
  'M.Sc Chemistry / Biology',
  'M.A English / Urdu Literature',
  'B.S Computer Science / IT',
  'B.Sc / M.Sc General Science',
  'O / A-Level Cambridge Specialist'
];

// Popular Pakistani payment providers
const PAYMENT_PROVIDERS = [
  { id: 'JazzCash', name: 'JazzCash Mobile Account', type: 'mobile' },
  { id: 'EasyPaisa', name: 'EasyPaisa Mobile Account', type: 'mobile' },
  { id: 'Meezan Bank', name: 'Meezan Bank (Islamic Banking)', type: 'bank' },
  { id: 'HBL', name: 'Habib Bank Limited (HBL)', type: 'bank' },
  { id: 'UBL', name: 'United Bank Limited (UBL)', type: 'bank' },
  { id: 'Bank Alfalah', name: 'Bank Alfalah Islamic', type: 'bank' },
  { id: 'Allied Bank', name: 'Allied Bank (ABL)', type: 'bank' },
  { id: 'Faysal Bank', name: 'Faysal Islamic Bank', type: 'bank' },
  { id: 'Other Bank', name: 'Other Pakistani Commercial / Islamic Bank', type: 'bank' }
];

export default function TutorMultiStepRegister({
  embedded = false,
  onSwitchToSignIn
} = {}) {
  const router = useRouter();
  const { user, token, verifyOtp: authVerifyOtp, updateTutorProfileState, updateUserProfile } = useAuth();

  // Wizard Navigation States
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // -------------------------------------------------------------
  // STEP 1: Account Credentials & Email OTP Gate
  // -------------------------------------------------------------
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);

  // Step 1 Sub-state: 'credentials' | 'otp'
  const [step1Mode, setStep1Mode] = useState('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // -------------------------------------------------------------
  // STEP 2: Personal Details, Photo & Location
  // -------------------------------------------------------------
  const [avatar, setAvatar] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('28');
  const [city, setCity] = useState('Lahore');
  const [localArea, setLocalArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [teachingModes, setTeachingModes] = useState(['online', 'in_person']);

  // -------------------------------------------------------------
  // STEP 3: Specialization, Disciplines & Experience
  // -------------------------------------------------------------
  const [tutoringType, setTutoringType] = useState('both'); // 'quran' | 'academic' | 'both'
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectFilterTab, setSubjectFilterTab] = useState('all'); // 'all' | 'quran' | 'academic'
  const [subjectSearch, setSubjectSearch] = useState('');
  const [qualifications, setQualifications] = useState('Shahadat-ul-Alimiyyah (Dars-e-Nizami)');
  const [experienceYears, setExperienceYears] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [bio, setBio] = useState(
    'Assalam-o-Alaikum! I am an experienced Quran and academic tutor with over 3 years of teaching experience. I focus on correct Tajweed, patient conceptual learning, and personalized attention for every student.'
  );

  // -------------------------------------------------------------
  // STEP 4: Sanad, Degree Documents & Video
  // -------------------------------------------------------------
  const [uploadedSanads, setUploadedSanads] = useState([]);
  const [sanadTitle, setSanadTitle] = useState('');
  const [sanadFileUrl, setSanadFileUrl] = useState('');
  const [sanadFileName, setSanadFileName] = useState('');
  const [sanadFileType, setSanadFileType] = useState('');
  const [videoIntroUrl, setVideoIntroUrl] = useState('');

  // -------------------------------------------------------------
  // STEP 5: Tuition Accounts & Review
  // -------------------------------------------------------------
  const [preferredAccountChoice, setPreferredAccountChoice] = useState('own'); // 'own' | 'platform'
  const [paymentProvider, setPaymentProvider] = useState('JazzCash');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeEthics, setAgreeEthics] = useState(true);

  // -------------------------------------------------------------
  // Lifecycle & Initial Population
  // -------------------------------------------------------------
  // Fetch subject categories from backend
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.getCategories();
        if (res.success && isMounted) {
          setCategories(res.categories || []);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCats();
    return () => { isMounted = false; };
  }, []);

  // Check if user is already logged in as a verified tutor
  useEffect(() => {
    if (user && user.role === 'tutor' && user.isVerified) {
      setIsEmailVerified(true);
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.city) setCity(user.city);
      if (user.area) setLocalArea(user.area);
      if (user.gender) setGender(user.gender);
      if (user.age) setAge(String(user.age));
      if (user.avatar) setAvatar(user.avatar);
      setHighestStepReached(prev => Math.max(prev, 2));
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [user]);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (step1Mode === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step1Mode, otpTimer]);

  // -------------------------------------------------------------
  // STEP 1 HANDLERS: Register & Inline OTP Verification
  // -------------------------------------------------------------
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name as on your CNIC / Educational Sanad.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!turnstileToken) {
      setError('Please complete the Cloudflare security verification check below.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'tutor',
        city: city || 'Lahore',
        turnstileToken,
        captchaToken: turnstileToken
      };

      const res = await api.register(payload);

      if (res.success || res.message?.toLowerCase().includes('verification') || res.message?.toLowerCase().includes('otp')) {
        setSuccess(`Verification code sent to ${email.trim()}! Please check your inbox or spam folder.`);
        setStep1Mode('otp');
        setOtpTimer(60);
        setCanResendOtp(false);
      } else {
        setError(res.message || 'Registration failed. Please verify your details and try again.');
        turnstileRef.current?.reset();
        setTurnstileToken('');
      }
    } catch (err) {
      const errorMsg = err.data?.message || err.message || 'Registration encountered an issue.';
      if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('registered')) {
        setError('This email is already registered. If you already created an account, please enter your OTP or sign in.');
        setStep1Mode('otp');
      } else {
        setError(errorMsg);
      }
      turnstileRef.current?.reset();
      setTurnstileToken('');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (!cleanOtp || cleanOtp.length < 4) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      const res = await authVerifyOtp(email.trim().toLowerCase(), cleanOtp);

      if (res.success) {
        setIsEmailVerified(true);
        setSuccess('Email successfully verified! Proceeding to personal profile setup...');
        setHighestStepReached(prev => Math.max(prev, 2));
        setTimeout(() => {
          setCurrentStep(2);
          setSuccess('');
        }, 600);
      } else {
        setError(res.message || 'Invalid or expired verification code. Please try again.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.resendOtp({ email: email.trim().toLowerCase(), role: 'tutor' });
      if (res.success) {
        setSuccess(`A fresh verification code has been dispatched to ${email.trim()}.`);
        setOtpTimer(60);
        setCanResendOtp(false);
      } else {
        setError(res.message || 'Could not resend verification code. Please try again in a minute.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2 HANDLERS: Personal & Location
  // -------------------------------------------------------------
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar photo must be under 2MB.');
      return;
    }

    try {
      const compressedDataUrl = await compressAvatarFile(file, 350, 0.82);
      setAvatar(compressedDataUrl);
      setError('');
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleTeachingMode = (mode) => {
    setTeachingModes(prev => {
      if (prev.includes(mode)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(m => m !== mode);
      } else {
        return [...prev, mode];
      }
    });
  };

  const handleProceedFromStep2 = async (e) => {
    e.preventDefault();
    setError('');

    if (!city) {
      setError('Please select your primary city in Pakistan.');
      return;
    }
    if (!localArea.trim()) {
      setError('Please provide your local area / sector / town.');
      return;
    }
    if (teachingModes.length === 0) {
      setError('Please select at least one teaching mode (Online or In-Person).');
      return;
    }

    setLoading(true);
    try {
      // Save personal details to server
      if (token) {
        await updateUserProfile({
          gender,
          age: Number(age) || 28,
          city: city.trim(),
          area: localArea.trim(),
          avatar: avatar || undefined
        });

        await api.updateMyTutorProfile({
          gender,
          city: city.trim(),
          localArea: localArea.trim(),
          area: localArea.trim(),
          teachingModes
        });
      }

      setHighestStepReached(prev => Math.max(prev, 3));
      setCurrentStep(3);
    } catch (err) {
      console.warn('Step 2 server sync note:', err.message);
      // Advance to keep momentum even if offline/warming
      setHighestStepReached(prev => Math.max(prev, 3));
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3 HANDLERS: Subjects & Bio
  // -------------------------------------------------------------
  const handleToggleSubject = (subId) => {
    setSelectedSubjects(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesTab =
        subjectFilterTab === 'all' ? true :
        subjectFilterTab === 'quran' ? (c.type === 'quran' || c.name?.toLowerCase().includes('quran') || c.name?.toLowerCase().includes('tajweed') || c.name?.toLowerCase().includes('islamic')) :
        (c.type === 'academic' || (!c.name?.toLowerCase().includes('quran') && !c.name?.toLowerCase().includes('tajweed')));

      const matchesSearch = !subjectSearch.trim() || c.name?.toLowerCase().includes(subjectSearch.toLowerCase().trim());
      return matchesTab && matchesSearch;
    });
  }, [categories, subjectFilterTab, subjectSearch]);

  const handleGenerateTemplateBio = () => {
    if (tutoringType === 'quran') {
      setBio(
        'Assalam-o-Alaikum! Certified Quran Teacher dedicated to teaching Noorani Qaida, Nazra with Tajweed rules, and Hifz-ul-Quran to children and adult students. I focus on correct Makharij, patient repetition, and creating a supportive Islamic learning environment.'
      );
    } else if (tutoringType === 'academic') {
      setBio(
        'Assalam-o-Alaikum! Professional academic educator specializing in secondary and higher secondary school subjects. I believe in conceptual clarity, exam-oriented preparation, and interactive problem solving to help students achieve top board grades.'
      );
    } else {
      setBio(
        'Assalam-o-Alaikum! Versatile certified educator offering both Quranic Tajweed instruction and school/college academic tuition. With over 3 years of proven experience, I ensure personalized learning roadmaps, respectful Islamic ethics, and regular progress reports for parents.'
      );
    }
  };

  const handleProceedFromStep3 = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedSubjects.length === 0) {
      setError('Please select at least one teaching subject / discipline to proceed.');
      return;
    }
    if (!qualifications.trim()) {
      setError('Please specify your highest educational qualification or Sanad.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 20) {
      setError('Please provide a detailed bio (at least 20 characters) describing your teaching experience.');
      return;
    }

    setLoading(true);
    try {
      if (token) {
        await api.updateMyTutorProfile({
          tutoringType,
          subjects: selectedSubjects,
          qualifications: qualifications.trim(),
          experienceYears: Number(experienceYears) || 1,
          hourlyRate: Number(hourlyRate) || 1500,
          bio: bio.trim()
        });
      }

      setHighestStepReached(prev => Math.max(prev, 4));
      setCurrentStep(4);
    } catch (err) {
      console.warn('Step 3 server sync note:', err.message);
      setHighestStepReached(prev => Math.max(prev, 4));
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 4 HANDLERS: Sanad Documents & Video
  // -------------------------------------------------------------
  const handleSanadFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Degree or Sanad file must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSanadFileUrl(reader.result);
      setSanadFileName(file.name);
      setSanadFileType(file.type || 'application/pdf');
      if (!sanadTitle) {
        setSanadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSanadDoc = () => {
    if (!sanadFileUrl) {
      setError('Please select a degree scan or Sanad document file (PDF, JPG, or PNG).');
      return;
    }

    const newDoc = {
      _id: 'doc_' + Date.now(),
      title: sanadTitle.trim() || 'Educational Sanad / Degree',
      fileUrl: sanadFileUrl,
      fileName: sanadFileName,
      fileType: sanadFileType || 'application/pdf',
      status: 'pending',
      uploadedAt: new Date().toISOString()
    };

    setUploadedSanads(prev => [...prev, newDoc]);
    setSanadTitle('');
    setSanadFileUrl('');
    setSanadFileName('');
    setError('');
  };

  const handleRemoveSanadDoc = (idx) => {
    setUploadedSanads(prev => prev.filter((_, i) => i !== idx));
  };

  const handleProceedFromStep4 = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      if (token) {
        const payload = {
          videoIntro: videoIntroUrl.trim()
        };
        if (uploadedSanads.length > 0) {
          payload.sanadDocuments = uploadedSanads;
        }
        await api.updateMyTutorProfile(payload);
      }

      setHighestStepReached(prev => Math.max(prev, 5));
      setCurrentStep(5);
    } catch (err) {
      console.warn('Step 4 server sync note:', err.message);
      setHighestStepReached(prev => Math.max(prev, 5));
      setCurrentStep(5);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 5 HANDLERS: Tuition Accounts & Final Submission
  // -------------------------------------------------------------
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms || !agreeEthics) {
      setError('Please accept the Islamic Code of Ethics and Platform Terms of Service to complete registration.');
      return;
    }

    setLoading(true);

    try {
      // Build final payment method if entered
      const paymentMethods = [];
      if (accountTitle.trim() && accountNumber.trim()) {
        paymentMethods.push({
          provider: paymentProvider,
          accountTitle: accountTitle.trim(),
          accountNumber: accountNumber.trim(),
          isDefault: true
        });
      }

      if (token) {
        // Final unified update: sets status to under_review for admin approval
        const finalRes = await api.updateMyTutorProfile({
          gender,
          city: city.trim(),
          localArea: localArea.trim(),
          teachingModes,
          tutoringType,
          subjects: selectedSubjects,
          qualifications: qualifications.trim(),
          experienceYears: Number(experienceYears) || 1,
          hourlyRate: Number(hourlyRate) || 1500,
          bio: bio.trim(),
          sanadDocuments: uploadedSanads,
          videoIntro: videoIntroUrl.trim(),
          paymentMethods,
          preferredAccountChoice,
          verificationStatus: 'under_review'
        });

        if (finalRes.profile) {
          updateTutorProfileState(finalRes.profile);
        }
      }

      // Success celebration redirect
      setSuccess('MashaAllah! Your tutor profile is complete and submitted for admin review.');
      setTimeout(() => {
        router.push('/tutor/dashboard?registered=true');
      }, 700);
    } catch (err) {
      setError(err.data?.message || err.message || 'Submission encountered an issue. Redirecting to workspace...');
      setTimeout(() => {
        router.push('/tutor/dashboard');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion score dynamically
  const profileCompletionScore = useMemo(() => {
    let score = 0;
    if (isEmailVerified) score += 20;
    if (avatar) score += 10;
    if (city && localArea) score += 10;
    if (teachingModes.length > 0) score += 10;
    if (selectedSubjects.length > 0) score += 20;
    if (qualifications.trim()) score += 10;
    if (bio.trim().length >= 20) score += 10;
    if (uploadedSanads.length > 0) score += 10;
    return Math.min(100, score);
  }, [isEmailVerified, avatar, city, localArea, teachingModes, selectedSubjects, qualifications, bio, uploadedSanads]);

  // Step definitions for the top progress bar
  const STEPS = [
    { num: 1, title: 'Credentials', subtitle: 'Email & OTP' },
    { num: 2, title: 'Personal', subtitle: 'Location & Photo' },
    { num: 3, title: 'Disciplines', subtitle: 'Subjects & Bio' },
    { num: 4, title: 'Degrees', subtitle: 'Sanad Upload' },
    { num: 5, title: 'Launch', subtitle: 'Payments & Submit' }
  ];

  const content = (
    <div className="max-w-3xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Top Branding & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#143d2b] border border-[#d4a359]/40 text-[#d4a359] text-[11px] font-bold uppercase tracking-widest shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Faculty Application Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#faf8f5] tracking-tight">
            Register as a Verified Educator
          </h1>
          <p className="text-xs sm:text-sm text-[#a9b7af] max-w-xl mx-auto">
            Join Pakistan&apos;s premier certified network of Quran Qaris, female Alimahs, and Cambridge/Board academic tutors.
          </p>
        </div>

        {/* 5-Step Visual Progress Tracker */}
        <div className="bg-[#0c2217]/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#d4a359]/30 shadow-xl space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((s) => {
              const isCurrent = currentStep === s.num;
              const isDone = highestStepReached > s.num || (s.num === 1 && isEmailVerified);
              const isLocked = s.num > 1 && !isEmailVerified;

              return (
                <button
                  key={s.num}
                  type="button"
                  disabled={isLocked || s.num > highestStepReached}
                  onClick={() => {
                    if (!isLocked && s.num <= highestStepReached) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`flex flex-col items-center text-center p-2 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-[#143d2b] border border-[#d4a359]/60 shadow-md text-[#faf8f5]'
                      : isDone
                      ? 'text-[#d4a359] hover:bg-[#143d2b]/40 cursor-pointer'
                      : 'text-stone-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-all ${
                      isCurrent
                        ? 'bg-[#d4a359] text-[#0c2217] ring-4 ring-[#d4a359]/20'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1">{s.title}</span>
                  <span className="hidden sm:block text-[9px] text-stone-400 mt-0.5">{s.subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Real-time Completion Meter Bar */}
          <div className="pt-2 border-t border-[#1b4d36] flex items-center justify-between gap-3 text-[11px]">
            <span className="text-stone-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Profile Health:</span>
            </span>
            <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d4a359] to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${profileCompletionScore}%` }}
              />
            </div>
            <span className="font-mono font-bold text-[#d4a359]">{profileCompletionScore}% Complete</span>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-3.5 bg-[#b85d34]/20 border border-[#b85d34]/40 text-[#fca5a5] rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-[#143d2b] border border-[#d4a359]/50 text-[#d4a359] rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Main Card Container */}
        <div className="bg-[#0c2217]/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#d4a359]/30 shadow-2xl shadow-black/50 text-[#faf8f5] space-y-6">

          {/* ========================================================================= */}
          {/* STEP 1: CREDENTIALS & INLINE OTP VERIFICATION GATE                         */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#faf8f5] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#d4a359]" />
                  <span>Step 1: Account Setup &amp; Email Verification</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Create your tutor account and verify your official email. Email verification is strictly required before accessing subsequent profile steps.
                </p>
              </div>

              {step1Mode === 'credentials' && !isEmailVerified ? (
                <form onSubmit={handleCreateAccount} autoComplete="off" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1">
                        Full Legal Name (as on CNIC / Sanad) *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter Your Full Name"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] placeholder:text-stone-500 outline-none focus:border-[#d4a359] focus:ring-1 focus:ring-[#d4a359]"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1">
                        Official Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="qari.bilal@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] placeholder:text-stone-500 outline-none focus:border-[#d4a359] focus:ring-1 focus:ring-[#d4a359]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1">
                      Create Password (min. 6 characters) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] placeholder:text-stone-500 outline-none focus:border-[#d4a359] focus:ring-1 focus:ring-[#d4a359] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Cloudflare Turnstile Security Verification */}
                  <div className="p-4 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-2">
                    <p className="text-[11px] text-stone-400 text-center">
                      Security Verification Challenge (Automated Protection)
                    </p>
                    <Turnstile
                      ref={turnstileRef}
                      onVerify={(t) => setTurnstileToken(t)}
                      onExpire={() => setTurnstileToken('')}
                      action="tutor_signup"
                      theme="dark"
                      size="normal"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#d4a359]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#0c2217] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account &amp; Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-stone-400 pt-2">
                    Already registered as a tutor?{' '}
                    {onSwitchToSignIn ? (
                      <button
                        type="button"
                        onClick={onSwitchToSignIn}
                        className="text-[#d4a359] font-bold hover:underline cursor-pointer"
                      >
                        Sign in here
                      </button>
                    ) : (
                      <Link href="/login?role=tutor" className="text-[#d4a359] font-bold hover:underline">
                        Sign in here
                      </Link>
                    )}
                  </p>
                </form>
              ) : isEmailVerified ? (
                // Email Already Verified Confirmation Card
                <div className="p-6 rounded-2xl bg-[#143d2b] border border-[#d4a359]/50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#faf8f5]">Email Address Verified!</h3>
                  <p className="text-xs text-[#d4a359]">
                    {email} is verified and linked to your tutor account.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="mt-2 px-6 py-2.5 bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Personal Profile &amp; Location</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // INLINE OTP VERIFICATION SCREEN (Gatekeeper)
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 rounded-2xl bg-[#06120c] border border-[#1b4d36] text-center space-y-2">
                    <Mail className="w-8 h-8 text-[#d4a359] mx-auto" />
                    <h3 className="text-sm font-bold text-[#faf8f5]">Enter 6-Digit Email Verification Code</h3>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      We sent an OTP code to <strong className="text-[#faf8f5]">{email}</strong>. Enter the 6-digit code below to unlock the application.
                    </p>

                    {/* 6-Digit Code Input */}
                    <div className="pt-2 max-w-xs mx-auto">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full tracking-[0.5em] text-center py-3 bg-[#0c2217] border-2 border-[#d4a359]/60 rounded-2xl text-xl sm:text-2xl font-mono font-bold text-[#faf8f5] outline-none focus:border-[#d4a359] focus:ring-2 focus:ring-[#d4a359]/30"
                      />
                    </div>

                    {/* Resend Timer */}
                    <div className="pt-2 flex items-center justify-center gap-2 text-xs text-stone-400">
                      <Clock className="w-3.5 h-3.5 text-[#d4a359]" />
                      {canResendOtp ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-[#d4a359] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend OTP Code</span>
                        </button>
                      ) : (
                        <span>Resend available in {otpTimer}s</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep1Mode('credentials')}
                      className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-2xl cursor-pointer"
                    >
                      Change Email
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 4}
                      className="flex-1 py-3.5 bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#d4a359]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-[#0c2217] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify Email &amp; Proceed to Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PERSONAL PROFILE, PHOTO & LOCATION                                */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <form onSubmit={handleProceedFromStep2} className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#faf8f5] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#d4a359]" />
                  <span>Step 2: Personal Profile &amp; Location Details</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Upload your professional photo, choose your gender category, and set your primary tutoring city and teaching modes.
                </p>
              </div>

              {/* Avatar Photo Selection */}
              <div className="p-4 rounded-2xl bg-[#06120c] border border-[#1b4d36] flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Tutor')}&background=0c2217&color=d4a359&size=128`}
                    alt="Profile Avatar"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#d4a359]/50 shadow-md"
                  />
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      title="Remove custom photo"
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="text-xs font-bold text-[#faf8f5]">Tutor Profile Photograph</h4>
                  <p className="text-[11px] text-stone-400">
                    Upload a dignified, high-resolution portrait. High-quality photos increase student contact rates by over 40%. Maximum 2MB.
                  </p>
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#143d2b] hover:bg-[#1c553d] text-[#d4a359] border border-[#d4a359]/40 text-xs font-bold transition-all cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Choose Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1">
                    Gender Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        gender === 'male'
                          ? 'bg-[#143d2b] border-[#d4a359] text-[#d4a359] shadow-sm'
                          : 'bg-[#06120c] border-[#1b4d36] text-stone-400 hover:border-stone-500'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        gender === 'female'
                          ? 'bg-[#143d2b] border-[#d4a359] text-[#d4a359] shadow-sm'
                          : 'bg-[#06120c] border-[#1b4d36] text-stone-400 hover:border-stone-500'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Female</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1">
                    Tutor Age (Years) *
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={80}
                    required
                    placeholder="Enter Your Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] outline-none focus:border-[#d4a359] font-mono"
                  />
                </div>
              </div>

              {/* Pakistani City & Local Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Primary City (Pakistan) *</span>
                  </label>
                  <CustomSelect
                    value={city}
                    onChange={(val) => {
                      setCity(val);
                      setLocalArea('');
                    }}
                    options={allPakistaniCities.map(c => ({ value: c, label: c }))}
                    searchPlaceholder="Search Pakistani city..."
                    variant="dark"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-serif font-bold text-[#e6dfd5] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>Town / Area / Sector *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomArea(!isCustomArea)}
                      className="text-[10px] text-[#d4a359] font-bold hover:underline cursor-pointer"
                    >
                      {isCustomArea ? 'Select from list' : 'Type custom area'}
                    </button>
                  </div>

                  {!isCustomArea && pakistaniCityAreas[city]?.length > 0 ? (
                    <CustomSelect
                      value={localArea}
                      onChange={(val) => setLocalArea(val)}
                      options={pakistaniCityAreas[city].map(a => ({ value: a, label: a }))}
                      placeholder="Select area / town"
                      searchPlaceholder={`Search area in ${city}...`}
                      variant="dark"
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      value={localArea}
                      onChange={(e) => setLocalArea(e.target.value)}
                      placeholder="e.g. DHA Phase 5, Gulberg, F-10, Bahria"
                      className="w-full px-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] outline-none focus:border-[#d4a359]"
                    />
                  )}
                </div>
              </div>

              {/* Teaching Modes Selection */}
              <div className="p-4 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-2">
                <label className="text-xs font-serif font-bold text-[#e6dfd5] block">
                  Available Teaching Modes (Select all that apply) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div
                    onClick={() => toggleTeachingMode('online')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      teachingModes.includes('online')
                        ? 'bg-[#143d2b] border-[#d4a359] text-[#faf8f5]'
                        : 'bg-[#0c2217] border-[#1b4d36] text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#0c2217] text-[#d4a359] shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">1:1 Online Video Classroom</span>
                        {teachingModes.includes('online') && <Check className="w-3.5 h-3.5 text-[#d4a359]" />}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Teach anywhere in Pakistan or overseas students via live virtual classroom.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => toggleTeachingMode('in_person')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      teachingModes.includes('in_person')
                        ? 'bg-[#143d2b] border-[#d4a359] text-[#faf8f5]'
                        : 'bg-[#0c2217] border-[#1b4d36] text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#0c2217] text-[#d4a359] shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">In-Person Home Tuition</span>
                        {teachingModes.includes('in_person') && <Check className="w-3.5 h-3.5 text-[#d4a359]" />}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Physical home visits within {city || 'your city'} and surrounding sectors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Credentials</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#d4a359]/20 disabled:opacity-50"
                >
                  <span>Continue to Disciplines &amp; Subjects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DISCIPLINES, SUBJECTS & BIO                                       */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <form onSubmit={handleProceedFromStep3} className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#faf8f5] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#d4a359]" />
                  <span>Step 3: Teaching Specialization, Subjects &amp; Bio</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Pick the subjects you will teach, your educational credentials, and write an introductory bio to inspire confidence in parents.
                </p>
              </div>

              {/* Specialization Type Switcher */}
              <div className="p-3.5 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-2">
                <label className="text-xs font-serif font-bold text-[#e6dfd5] block">
                  Primary Tutoring Specialization *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'quran', label: 'Quran & Islamic', icon: BookOpen },
                    { id: 'academic', label: 'School & College', icon: GraduationCap },
                    { id: 'both', label: 'Both Disciplines', icon: Sparkles }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTutoringType(t.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                        tutoringType === t.id
                          ? 'bg-[#143d2b] border-[#d4a359] text-[#d4a359]'
                          : 'bg-[#0c2217] border-[#1b4d36] text-stone-400 hover:border-stone-500'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] sm:text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subjects Explorer */}
              <div className="p-4 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-serif font-bold text-[#e6dfd5] flex items-center gap-1.5">
                    <span>Subjects / Classes You Teach *</span>
                    <span className="text-[10px] text-[#d4a359] font-mono">({selectedSubjects.length} selected)</span>
                  </label>

                  {/* Discipline Tabs */}
                  <div className="flex items-center gap-1 bg-[#0c2217] p-1 rounded-xl border border-[#1b4d36] text-[10px]">
                    {['all', 'quran', 'academic'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSubjectFilterTab(tab)}
                        className={`px-2.5 py-1 rounded-lg font-bold capitalize cursor-pointer transition-all ${
                          subjectFilterTab === tab
                            ? 'bg-[#143d2b] text-[#d4a359]'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search subjects (e.g. Tajweed, Physics, Mathematics, Urdu, Hifz)..."
                    className="w-full pl-9 pr-3 py-2 bg-[#0c2217] border border-[#1b4d36] rounded-xl text-xs text-[#faf8f5] placeholder:text-stone-500 outline-none focus:border-[#d4a359]"
                  />
                </div>

                {/* Subject Pills Grid */}
                <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5">
                  {loadingCategories ? (
                    <div className="py-6 text-center text-xs text-stone-400 animate-pulse">
                      Loading certified teaching subjects...
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      No matching subjects found. Try adjusting your search query.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredCategories.map((sub) => {
                        const isSelected = selectedSubjects.includes(sub._id);
                        return (
                          <button
                            key={sub._id}
                            type="button"
                            onClick={() => handleToggleSubject(sub._id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                              isSelected
                                ? 'bg-[#143d2b] text-[#d4a359] border-[#d4a359] shadow-sm'
                                : 'bg-[#0c2217] text-stone-300 border-[#1b4d36] hover:border-stone-500'
                            }`}
                          >
                            <span>{sub.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-[#d4a359]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Highest Educational Qualification & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-serif font-bold text-[#e6dfd5] block">
                  Highest Educational Qualification / Sanad *
                </label>
                <input
                  type="text"
                  required
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. Shahadat-ul-Alimiyyah (Dars-e-Nizami), M.Sc Physics"
                  className="w-full px-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] outline-none focus:border-[#d4a359]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUALIFICATION_PRESETS.slice(0, 6).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQualifications(q)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-[#06120c] hover:bg-[#143d2b] border border-[#1b4d36] text-stone-300 hover:text-[#d4a359] transition-all cursor-pointer"
                    >
                      + {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Years & Hourly Tuition Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Teaching Experience (Years) *</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] outline-none focus:border-[#d4a359] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-serif font-bold text-[#e6dfd5] block mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Expected Hourly Fee (PKR) *</span>
                  </label>
                  <input
                    type="number"
                    min={500}
                    max={20000}
                    step={100}
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] outline-none focus:border-[#d4a359] font-mono"
                  />
                </div>
              </div>

              {/* Teaching Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-serif font-bold text-[#e6dfd5] block">
                    Professional Teaching Bio *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateTemplateBio}
                    className="text-[10px] text-[#d4a359] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Template Draft</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce yourself to parents: describe your certifications, teaching philosophy, patience with children, and track record..."
                  className="w-full p-3.5 bg-[#06120c] border border-[#1b4d36] rounded-2xl text-xs sm:text-sm text-[#faf8f5] placeholder:text-stone-500 outline-none focus:border-[#d4a359] leading-relaxed"
                />
                <span className="text-[10px] text-stone-400 block text-right">
                  {bio.trim().length} characters (min. 20)
                </span>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Personal</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#d4a359]/20 disabled:opacity-50"
                >
                  <span>Continue to Degree &amp; Sanad Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: DEGREES, SANAD UPLOAD & VIDEO                                      */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <form onSubmit={handleProceedFromStep4} className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#faf8f5] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#d4a359]" />
                  <span>Step 4: Degrees, Sanad Upload &amp; Video Intro</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Upload scans of your Wifaq-ul-Madaris Sanad, Hifz Certificate, or University Degrees. Uploaded credentials will be audited by the admin team to award the &apos;Verified Sanad&apos; badge.
                </p>
              </div>

              {/* Sanad Upload Box */}
              <div className="p-5 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-4">
                <h4 className="text-xs font-bold text-[#faf8f5] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#d4a359]" />
                  <span>Upload Degree / Sanad Document (PDF, JPG, PNG under 2MB)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Document Title *</label>
                    <input
                      type="text"
                      value={sanadTitle}
                      onChange={(e) => setSanadTitle(e.target.value)}
                      placeholder="e.g. Shahadat-ul-Alimiyyah Sanad"
                      className="w-full px-3.5 py-2 bg-[#0c2217] border border-[#1b4d36] rounded-xl text-xs text-[#faf8f5] outline-none focus:border-[#d4a359]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Attach Scan File *</label>
                    <label className="w-full py-2 px-3 rounded-xl bg-[#143d2b] hover:bg-[#1c553d] text-[#d4a359] border border-[#d4a359]/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer truncate">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{sanadFileName || 'Choose File (PDF/Image)'}</span>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        onChange={handleSanadFilePick}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSanadDoc}
                  className="w-full py-2.5 bg-[#143d2b] hover:bg-[#1c553d] text-[#d4a359] border border-[#d4a359]/50 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Add Document to Application</span>
                </button>

                {/* Staged Documents List */}
                {uploadedSanads.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <h5 className="text-[11px] font-bold text-stone-400">Attached Documents ({uploadedSanads.length})</h5>
                    <div className="space-y-2">
                      {uploadedSanads.map((doc, idx) => (
                        <div
                          key={doc._id || idx}
                          className="p-3 rounded-xl bg-[#0c2217] border border-[#1b4d36] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-[#d4a359] shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-[#faf8f5] truncate">{doc.title}</p>
                              <span className="text-[10px] text-emerald-400">Ready for verification</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {doc.fileUrl && (
                              <button
                                type="button"
                                onClick={() => openDocumentInNewTab(doc.fileUrl, doc.title || 'sanad-document')}
                                className="text-[#d4a359] hover:text-[#e4be78] p-1.5 rounded-lg hover:bg-[#153424] cursor-pointer transition-colors"
                                title="Preview attached document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveSanadDoc(idx)}
                              className="text-stone-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 cursor-pointer transition-colors"
                              title="Remove document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Introduction Link (Optional) */}
              <div className="p-4 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-2">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#d4a359]" />
                  <label className="text-xs font-serif font-bold text-[#e6dfd5]">
                    Video Introduction Link (Optional)
                  </label>
                </div>
                <p className="text-[11px] text-stone-400">
                  Paste a YouTube unlisted or Vimeo link where you introduce your teaching background and Tajweed recitation.
                </p>
                <input
                  type="url"
                  value={videoIntroUrl}
                  onChange={(e) => setVideoIntroUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 bg-[#0c2217] border border-[#1b4d36] rounded-xl text-xs text-[#faf8f5] outline-none focus:border-[#d4a359]"
                />
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Disciplines</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#d4a359]/20 disabled:opacity-50"
                >
                  <span>Continue to Tuition Accounts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: TUITION ACCOUNTS, CODE OF ETHICS & SUBMISSION                      */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#faf8f5] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#d4a359]" />
                  <span>Step 5: Tuition Accounts &amp; Final Review</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Configure how you prefer to receive tuition fees from parents, review your profile checklist, and submit for verification.
                </p>
              </div>

              {/* Preferred Receiving Method */}
              <div className="p-4 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-3">
                <label className="text-xs font-serif font-bold text-[#e6dfd5] block">
                  Tuition Receiving Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPreferredAccountChoice('own')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      preferredAccountChoice === 'own'
                        ? 'bg-[#143d2b] border-[#d4a359] text-[#faf8f5]'
                        : 'bg-[#0c2217] border-[#1b4d36] text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#d4a359] shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Direct to My Account (Recommended)</span>
                        {preferredAccountChoice === 'own' && <Check className="w-3.5 h-3.5 text-[#d4a359]" />}
                      </div>
                      <p className="text-[10.5px] text-stone-400 mt-1">
                        Parents send monthly tuition directly to your personal JazzCash, EasyPaisa, or Bank Account.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPreferredAccountChoice('platform')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      preferredAccountChoice === 'platform'
                        ? 'bg-[#143d2b] border-[#d4a359] text-[#faf8f5]'
                        : 'bg-[#0c2217] border-[#1b4d36] text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-[#d4a359] shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Platform Escrow Protection</span>
                        {preferredAccountChoice === 'platform' && <Check className="w-3.5 h-3.5 text-[#d4a359]" />}
                      </div>
                      <p className="text-[10.5px] text-stone-400 mt-1">
                        Platform holds fee securely in escrow and disburses it to your account on a verified class milestone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Account Details */}
              <div className="p-4 rounded-2xl bg-[#06120c] border border-[#1b4d36] space-y-3">
                <h4 className="text-xs font-bold text-[#faf8f5] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#d4a359]" />
                  <span>Your Receiving Account Information (JazzCash / EasyPaisa / Bank)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Provider</label>
                    <CustomSelect
                      value={paymentProvider}
                      onChange={(val) => setPaymentProvider(val)}
                      options={PAYMENT_PROVIDERS.map(p => ({ value: p.id, label: p.name }))}
                      variant="dark"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Account Title *</label>
                    <input
                      type="text"
                      value={accountTitle}
                      onChange={(e) => setAccountTitle(e.target.value)}
                      placeholder="e.g. Muhammad Bilal"
                      className="w-full px-3 py-2 bg-[#0c2217] border border-[#1b4d36] rounded-xl text-xs text-[#faf8f5] outline-none focus:border-[#d4a359]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Account Number / IBAN *</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number or IBAN"
                      className="w-full px-3 py-2 bg-[#0c2217] border border-[#1b4d36] rounded-xl text-xs text-[#faf8f5] outline-none focus:border-[#d4a359] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Application Summary Checklist */}
              <div className="p-4 rounded-2xl bg-[#143d2b]/60 border border-[#d4a359]/40 space-y-2">
                <h4 className="text-xs font-serif font-bold text-[#faf8f5] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Profile Strength &amp; Verification Checklist</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Email Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Location Configured</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Subjects Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Qualifications Set</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Teaching Bio Done</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${uploadedSanads.length > 0 ? 'text-emerald-400' : 'text-[#d4a359]'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>{uploadedSanads.length > 0 ? 'Sanad Attached' : 'Sanad Review Later'}</span>
                  </div>
                </div>
              </div>

              {/* Ethics & Terms Agreements */}
              <div className="space-y-2 text-xs text-stone-300">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeEthics}
                    onChange={(e) => setAgreeEthics(e.target.checked)}
                    className="mt-0.5 rounded border-stone-600 accent-[#d4a359]"
                  />
                  <span>
                    I confirm that all educational qualifications, Sanads, and experience declarations are authentic and free from misrepresentation.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-600 accent-[#d4a359]"
                  />
                  <span>
                    I agree to the IlmiDunya Pakistan{' '}
                    <Link href="/terms" target="_blank" className="text-[#d4a359] underline font-bold">Terms of Service</Link>,{' '}
                    <Link href="/privacy-policy" target="_blank" className="text-[#d4a359] underline font-bold">Privacy Policy</Link>, and the Islamic code of respectful student interaction.
                  </span>
                </label>
              </div>

              {/* Navigation & Final Submit */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Degrees</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || !agreeTerms || !agreeEthics}
                  className="px-8 py-3.5 rounded-2xl bg-[#d4a359] hover:bg-[#c39248] text-[#0c2217] font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xl shadow-[#d4a359]/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#0c2217] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete Registration &amp; Enter Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#06120c] flex flex-col justify-center relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d4a359]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#143d2b]/40 rounded-full blur-3xl pointer-events-none" />
      {content}
    </div>
  );
}

