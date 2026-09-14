'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  MapPin,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Upload,
  FileText,
  Sparkles,
  Layers,
  Clock,
  Briefcase,
  PlusCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Trash2,
  Video,
  Home,
  Check,
  BookOpen,
  Search,
  X,
  Compass,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Save,
  Loader2,
  HelpCircle,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { api } from '../../../services/api';
import ProfileCompletionMeter from '../../../components/common/ProfileCompletionMeter';
import AccountStatusBanner from '../../../components/common/AccountStatusBanner';
import { SanadModal } from '../../../components/common/SanadBadge';
import DeleteAccountModal from '../../../components/common/DeleteAccountModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SafetyReportsSection from '../../../components/profile/SafetyReportsSection';
import { allPakistaniCities, pakistaniCityAreas } from '../../../data/pakistanAreas';
import CustomSelect from '../../../components/common/CustomSelect';
import { parseDegreesAndCertificates } from '../../../utils/tutorHelpers';
import VideoIntroPlayer from '../../../components/common/VideoIntroPlayer';
import TutorPaymentMethodsManager from '../../../components/tutor/TutorPaymentMethodsManager';
import TutorPaymentModal from '../../../components/tutor/TutorPaymentModal';

const pakistaniCities = allPakistaniCities;

const PROFILE_TABS = [
  { id: 'personal', shortLabel: 'Personal', fullLabel: 'Personal & Teaching', icon: User },
  { id: 'degrees', shortLabel: 'Degrees', fullLabel: 'Degrees & Sanads', icon: GraduationCap },
  { id: 'payments', shortLabel: 'Payments', fullLabel: 'Tuition Accounts', icon: CreditCard },
  { id: 'video', shortLabel: 'Video', fullLabel: 'Video Intro', icon: Video },
  { id: 'security', shortLabel: 'Security', fullLabel: 'Security & Access', icon: Lock }
];

function TutorProfileContent() {
  const searchParams = useSearchParams();
  const isVerifiedNotice = searchParams.get('verified') === 'true';
  const { user, tutorProfile, updateUserProfile, updateTutorProfileState, loading: authLoading } = useAuth();
  const { isConnected } = useSocket();

  // Active Tab State & Scroll Ref for smooth mobile tab centering
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab && ['personal', 'degrees', 'payments', 'video', 'security'].includes(initialTab)) {
      return initialTab;
    }
    return 'personal';
  });
  const tabBarRef = useRef(null);
  const activeTabBtnRef = useRef(null);
  const saveFeedbackTimeoutRef = useRef(null);

  // Basic Account Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Lahore');
  const [localArea, setLocalArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [gender, setGender] = useState('male');
  const [tutoringType, setTutoringType] = useState('both');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('');

  // Email Change State (with OTP Verification)
  const [newEmail, setNewEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailChangeStep, setEmailChangeStep] = useState('request'); // 'request' | 'verify'
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');

  // Teaching / Academic Profile
  const [bio, setBio] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [teachingModes, setTeachingModes] = useState(['online']);
  
  // Staged Degrees / Sanad Documents (NO auto-save)
  const [uploadedSanads, setUploadedSanads] = useState([]);
  const [selectedSanadModal, setSelectedSanadModal] = useState(false);

  // Staged Payment Methods & Preferred Receiving Mode (NO auto-save)
  const [stagedPaymentMethods, setStagedPaymentMethods] = useState([]);
  const [stagedPreferredChoice, setStagedPreferredChoice] = useState('own');

  // Subjects / Classes / Disciplines
  const [categories, setCategories] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [activeDisciplineTab, setActiveDisciplineTab] = useState('all'); // 'all' | 'quran' | 'academic'
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);

  // New Sanad Upload Staged State
  const [newSanadTitle, setNewSanadTitle] = useState('');
  const [newSanadFileUrl, setNewSanadFileUrl] = useState('');

  // Video Intro State
  const [videoIntro, setVideoIntro] = useState('');
  const [videoIntroInput, setVideoIntroInput] = useState('');
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoTab, setVideoTab] = useState('link'); // 'link' | 'upload'

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [justSavedProfile, setJustSavedProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sanadSuccess, setSanadSuccess] = useState('');
  const [sanadError, setSanadError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Deals state for platform fee monitoring
  const [deals, setDeals] = useState([]);
  const [selectedDealForPay, setSelectedDealForPay] = useState(null);

  // Baseline snapshot for tracking unsaved modifications
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  const fetchDeals = async () => {
    try {
      const res = await api.getMyDeals();
      if (res.success) {
        setDeals(res.deals || []);
      }
    } catch (err) {
      console.error('Failed to load deals in tutor profile:', err);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Comprehensive Hash to Tab mapping for instant redirection across tabs
  const HASH_TO_TAB_MAP = {
    // Tab 2: Degrees & Sanads
    'profile-sanads': 'degrees',
    '#profile-sanads': 'degrees',
    'profile-degrees': 'degrees',
    '#profile-degrees': 'degrees',
    'degrees': 'degrees',
    '#degrees': 'degrees',
    'sanads': 'degrees',
    '#sanads': 'degrees',
    'sanad': 'degrees',
    '#sanad': 'degrees',
    'upload-sanad': 'degrees',
    '#upload-sanad': 'degrees',

    // Tab 3: Tuition Payment Accounts
    'profile-payment-methods': 'payments',
    '#profile-payment-methods': 'payments',
    'profile-payments': 'payments',
    '#profile-payments': 'payments',
    'payments': 'payments',
    '#payments': 'payments',
    'paymentMethods': 'payments',
    '#paymentMethods': 'payments',
    'payment-methods': 'payments',
    '#payment-methods': 'payments',
    'add-payment-method': 'payments',
    '#add-payment-method': 'payments',

    // Tab 4: Video Introduction
    'profile-video-intro': 'video',
    '#profile-video-intro': 'video',
    'profile-video': 'video',
    '#profile-video': 'video',
    'video': 'video',
    '#video': 'video',

    // Tab 5: Account & Security
    'change-email-section': 'security',
    '#change-email-section': 'security',
    'profile-security': 'security',
    '#profile-security': 'security',
    'security': 'security',
    '#security': 'security',

    // Tab 1: Personal & Academic Info (default)
    'profile-name': 'personal',
    '#profile-name': 'personal',
    'profile-avatar': 'personal',
    '#profile-avatar': 'personal',
    'profile-age': 'personal',
    '#profile-age': 'personal',
    'profile-gender': 'personal',
    '#profile-gender': 'personal',
    'profile-city': 'personal',
    '#profile-city': 'personal',
    'profile-local-area': 'personal',
    '#profile-local-area': 'personal',
    'profile-area': 'personal',
    '#profile-area': 'personal',
    'profile-subjects': 'personal',
    '#profile-subjects': 'personal',
    'profile-qualifications': 'personal',
    '#profile-qualifications': 'personal',
    'profile-bio': 'personal',
    '#profile-bio': 'personal',
    'personal': 'personal',
    '#personal': 'personal'
  };

  // Direct tab switcher that updates activeTab, centers tab button, and updates URL
  const switchTab = (tabId, fieldId = null) => {
    if (!tabId) return;

    // 1. Immediately switch the active tab
    setActiveTab(tabId);

    // 2. Center tab button in mobile tab bar
    if (typeof window !== 'undefined') {
      const tabBtn = document.getElementById(`tab-btn-${tabId}`);
      if (tabBtn && tabBarRef.current) {
        tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }

      // Sync URL query without reload
      const url = fieldId
        ? `/tutor/profile?tab=${tabId}#${fieldId}`
        : `/tutor/profile?tab=${tabId}`;
      try {
        window.history.replaceState(null, '', url);
      } catch {}
    }

    // 3. Smooth scroll down to target section or tab workspace
    setTimeout(() => {
      const targetId = fieldId || (
        tabId === 'degrees' ? 'profile-sanads' :
        tabId === 'payments' ? 'profile-payment-methods' :
        tabId === 'video' ? 'profile-video-intro' :
        tabId === 'security' ? 'profile-security' :
        'profile-tab-workspace'
      );
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-[#d4a359]', 'ring-offset-4', 'transition-all', 'duration-500');
        setTimeout(() => el.classList.remove('ring-4', 'ring-[#d4a359]', 'ring-offset-4'), 2500);

        const focusable = el.querySelector('input:not([type=hidden]):not([disabled]), textarea, select, button');
        if (focusable && typeof focusable.focus === 'function') {
          try { focusable.focus({ preventScroll: true }); } catch {}
        }
      } else {
        const workspace = document.getElementById('profile-tab-workspace');
        if (workspace) {
          workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  const navigateToSection = (targetUrlOrHash, item) => {
    if (item?.tab) {
      switchTab(item.tab, item.targetFieldId);
      return;
    }
    if (!targetUrlOrHash) return;

    // Check if URL has ?tab=
    if (targetUrlOrHash.includes('tab=')) {
      const match = targetUrlOrHash.match(/tab=([^&#]+)/);
      if (match && match[1]) {
        const hashMatch = targetUrlOrHash.includes('#') ? targetUrlOrHash.split('#')[1] : null;
        switchTab(match[1], hashMatch);
        return;
      }
    }

    const hashPart = targetUrlOrHash.includes('#')
      ? targetUrlOrHash.split('#')[1]
      : targetUrlOrHash.replace(/^#/, '');

    const targetTab = HASH_TO_TAB_MAP[hashPart] || HASH_TO_TAB_MAP['#' + hashPart] || 'personal';
    switchTab(targetTab, hashPart);
  };

  // Sync activeTab with URL searchParams (?tab=...) on load or param change
  const tabQueryParam = searchParams.get('tab');
  useEffect(() => {
    if (tabQueryParam && ['personal', 'degrees', 'payments', 'video', 'security'].includes(tabQueryParam)) {
      setActiveTab(tabQueryParam);
    }
  }, [tabQueryParam]);

  // Sync active tab with URL hash on mount, hashchange, or custom navigation
  useEffect(() => {
    const handleHashSync = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash) {
          navigateToSection(hash);
        }
      }
    };

    // Run on initial mount
    handleHashSync();

    const handleCustomNavigate = (e) => {
      if (e?.detail?.hash) {
        navigateToSection(e.detail.hash);
      }
    };

    window.addEventListener('hashchange', handleHashSync);
    window.addEventListener('tutor-profile-navigate', handleCustomNavigate);

    return () => {
      window.removeEventListener('hashchange', handleHashSync);
      window.removeEventListener('tutor-profile-navigate', handleCustomNavigate);
    };
  }, []);

  // Smoothly center active tab button horizontally on mobile
  useEffect(() => {
    if (activeTabBtnRef.current && tabBarRef.current) {
      activeTabBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab]);

  // Fetch available categories / disciplines from API
  useEffect(() => {
    let isMounted = true;
    const fetchCategoryMetadata = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.getCategories();
        if (res.success && isMounted) {
          setCategories(res.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories in profile:', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCategoryMetadata();
    return () => { isMounted = false; };
  }, []);

  // Populate state from user and tutorProfile
  const syncFromLoadedData = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      const uCity = user.city || 'Lahore';
      const uArea = user.area || user.localArea || '';
      setCity(uCity);
      setLocalArea(uArea);
      if (uCity && uArea && pakistaniCityAreas[uCity] && !pakistaniCityAreas[uCity].includes(uArea)) {
        setIsCustomArea(true);
      } else {
        setIsCustomArea(false);
      }
      setGender(user.gender || 'male');
      setAge(user.age ? String(user.age) : '');
      setAvatar(user.avatar || '');
    }

    if (tutorProfile) {
      const pCity = tutorProfile.city || user?.city || 'Lahore';
      const pArea = tutorProfile.localArea || tutorProfile.area || user?.area || '';
      if (pCity) setCity(pCity);
      if (pArea) {
        setLocalArea(pArea);
        if (pCity && pakistaniCityAreas[pCity] && !pakistaniCityAreas[pCity].includes(pArea)) {
          setIsCustomArea(true);
        }
      }
      if (tutorProfile.tutoringType) setTutoringType(tutorProfile.tutoringType);
      setBio(tutorProfile.bio || '');
      setQualifications(tutorProfile.qualifications || '');
      if (tutorProfile.experienceYears !== undefined && tutorProfile.experienceYears !== null) {
        setExperienceYears(tutorProfile.experienceYears);
      }
      setHourlyRate(tutorProfile.hourlyRate || 1500);
      
      const modes = Array.isArray(tutorProfile.teachingModes) && tutorProfile.teachingModes.length > 0
        ? tutorProfile.teachingModes
        : ['online'];
      setTeachingModes(modes);

      const subjects = Array.isArray(tutorProfile.subjects)
        ? tutorProfile.subjects.map(s => (typeof s === 'object' && s?._id ? s._id : s))
        : [];
      setSelectedSubjects(subjects);

      const sanads = Array.isArray(tutorProfile.sanadDocuments) ? tutorProfile.sanadDocuments : [];
      setUploadedSanads(sanads);

      const methods = Array.isArray(tutorProfile.paymentMethods) ? tutorProfile.paymentMethods : [];
      setStagedPaymentMethods(methods);

      const choice = tutorProfile.preferredAccountChoice || 'own';
      setStagedPreferredChoice(choice);

      const vIntro = tutorProfile.videoIntro || '';
      setVideoIntro(vIntro);
      setVideoIntroInput(vIntro);

      // Save baseline snapshot
      setSavedSnapshot({
        name: user?.name || '',
        city: pCity,
        localArea: pArea,
        gender: user?.gender || 'male',
        tutoringType: tutorProfile.tutoringType || 'both',
        age: user?.age ? String(user.age) : '',
        avatar: user?.avatar || '',
        bio: tutorProfile.bio || '',
        qualifications: tutorProfile.qualifications || '',
        experienceYears: tutorProfile.experienceYears ?? 2,
        hourlyRate: tutorProfile.hourlyRate || 1500,
        teachingModes: modes,
        selectedSubjects: subjects,
        uploadedSanads: sanads,
        stagedPaymentMethods: methods,
        stagedPreferredChoice: choice,
        videoIntro: vIntro
      });
    }
  };

  useEffect(() => {
    syncFromLoadedData();
  }, [user, tutorProfile]);

  // Compute Unsaved Changes
  const hasUnsavedChanges = useMemo(() => {
    if (!savedSnapshot) return false;

    if ((name || '').trim() !== (savedSnapshot.name || '').trim()) return true;
    if ((city || '').trim() !== (savedSnapshot.city || '').trim()) return true;
    if ((localArea || '').trim() !== (savedSnapshot.localArea || '').trim()) return true;
    if (gender !== savedSnapshot.gender) return true;
    if (tutoringType !== savedSnapshot.tutoringType) return true;
    if (String(age || '') !== String(savedSnapshot.age || '')) return true;
    if (avatar !== savedSnapshot.avatar) return true;
    if ((bio || '').trim() !== (savedSnapshot.bio || '').trim()) return true;
    if ((qualifications || '').trim() !== (savedSnapshot.qualifications || '').trim()) return true;
    if (Number(experienceYears) !== Number(savedSnapshot.experienceYears)) return true;
    if (Number(hourlyRate) !== Number(savedSnapshot.hourlyRate)) return true;

    // Teaching modes comparison
    const currModes = [...teachingModes].sort().join(',');
    const savedModes = [...(savedSnapshot.teachingModes || [])].sort().join(',');
    if (currModes !== savedModes) return true;

    // Subjects comparison
    const currSubs = [...selectedSubjects].sort().join(',');
    const savedSubs = [...(savedSnapshot.selectedSubjects || [])].sort().join(',');
    if (currSubs !== savedSubs) return true;

    // Degrees / Sanads comparison
    if (uploadedSanads.length !== (savedSnapshot.uploadedSanads || []).length) return true;
    if (uploadedSanads.some(d => d.isStaged)) return true;

    // Payment Methods comparison
    if (stagedPaymentMethods.length !== (savedSnapshot.stagedPaymentMethods || []).length) return true;
    if (stagedPaymentMethods.some(m => m.isStaged)) return true;
    if (stagedPreferredChoice !== savedSnapshot.stagedPreferredChoice) return true;

    // Video intro comparison
    if ((videoIntroInput || '').trim() !== (savedSnapshot.videoIntro || '').trim()) return true;

    return false;
  }, [
    savedSnapshot,
    name,
    city,
    localArea,
    gender,
    tutoringType,
    age,
    avatar,
    bio,
    qualifications,
    experienceYears,
    hourlyRate,
    teachingModes,
    selectedSubjects,
    uploadedSanads,
    stagedPaymentMethods,
    stagedPreferredChoice,
    videoIntroInput
  ]);

  // Handle Toggle Subject Selection
  const handleToggleSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAllVisible = (visibleIds) => {
    setSelectedSubjects((prev) => {
      const set = new Set([...prev, ...visibleIds]);
      return Array.from(set);
    });
  };

  const handleClearVisible = (visibleIds) => {
    const removeSet = new Set(visibleIds);
    setSelectedSubjects((prev) => prev.filter((id) => !removeSet.has(id)));
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    if (activeDisciplineTab === 'quran' && cat.type !== 'quran') return false;
    if (activeDisciplineTab === 'academic' && cat.type !== 'academic') return false;

    if (subjectSearchQuery.trim()) {
      const q = subjectSearchQuery.toLowerCase().trim();
      const matchName = cat.name?.toLowerCase().includes(q);
      const matchDesc = cat.description?.toLowerCase().includes(q);
      const matchSubtopics = Array.isArray(cat.subtopics) && cat.subtopics.some(st => st.toLowerCase().includes(q));
      return matchName || matchDesc || matchSubtopics;
    }

    return true;
  });

  // Handle Avatar Change
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setProfileSuccess('Photo selected! Click "Save Profile Changes" below to apply.');
    };
    reader.readAsDataURL(file);
  };

  // STAGED Sanad / Degree Document Handlers (NO immediate server calls)
  const handleSanadFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSanadError('File size must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewSanadFileUrl(reader.result);
      if (!newSanadTitle) {
        setNewSanadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSanadStaged = (e) => {
    e.preventDefault();
    if (!newSanadFileUrl) {
      setSanadError('Please select a degree scan or certificate file (JPG, PNG, or PDF).');
      return;
    }

    const newDoc = {
      _id: 'staged_' + Date.now(),
      title: newSanadTitle.trim() || 'Sanad / Educational Degree',
      fileUrl: newSanadFileUrl,
      fileType: newSanadFileUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
      status: 'pending',
      isStaged: true,
      uploadedAt: new Date().toISOString()
    };

    setUploadedSanads(prev => [...prev, newDoc]);
    setNewSanadTitle('');
    setNewSanadFileUrl('');
    setSanadError('');
    setSanadSuccess('Degree added to your staged list! Click "Save Profile Changes" below to submit for admin approval.');
    setTimeout(() => setSanadSuccess(''), 5000);
  };

  const handleDeleteSanadDocStaged = (docIndex) => {
    if (!window.confirm('Are you sure you want to remove this document from your profile?')) return;
    setUploadedSanads(prev => prev.filter((_, idx) => idx !== docIndex));
    setSanadSuccess('Document removed from staged list. Click "Save Profile Changes" to commit.');
    setTimeout(() => setSanadSuccess(''), 4000);
  };

  // Video Intro Handlers (Staged)
  const handleSaveVideoLink = (e) => {
    if (e) e.preventDefault();
    const cleanUrl = videoIntroInput.trim();
    setVideoIntro(cleanUrl);
    setVideoSuccess(cleanUrl ? 'Video link staged! Click "Save Profile Changes" below to commit.' : 'Video introduction cleared.');
    setTimeout(() => setVideoSuccess(''), 4000);
  };

  const handleVideoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setVideoError('Video file size exceeds 50MB. Please choose a smaller video or paste a YouTube / Loom link.');
      return;
    }

    setVideoSuccess('');
    setVideoError('');
    setVideoUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await api.uploadVideoIntro(formData);
      if (res.success) {
        const uploadedUrl = res.videoIntro || res.profile?.videoIntro;
        setVideoIntro(uploadedUrl);
        setVideoIntroInput(uploadedUrl);
        setVideoSuccess('Video file uploaded! Click "Save Profile Changes" below to commit to your profile.');
        setTimeout(() => setVideoSuccess(''), 5000);
      }
    } catch (err) {
      setVideoError(err.message || 'Error uploading video file');
    } finally {
      setVideoUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleRemoveVideoStaged = () => {
    if (!window.confirm('Are you sure you want to remove your video introduction?')) return;
    setVideoIntro('');
    setVideoIntroInput('');
    setVideoSuccess('Video introduction removed. Click "Save Profile Changes" below to commit.');
    setTimeout(() => setVideoSuccess(''), 4000);
  };

  // Discard all changes and restore snapshot
  const handleDiscardChanges = () => {
    if (!window.confirm('Discard all unsaved changes and reload your last saved profile?')) return;
    syncFromLoadedData();
    setProfileSuccess('All unsaved modifications discarded.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  // UNIFIED SINGLE SAVE HANDLER
  const handleUnifiedSave = async (e) => {
    if (e) e.preventDefault();
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Full name is required.');
      setActiveTab('personal');
      setSavingProfile(false);
      return;
    }

    if (age && (Number(age) < 18 || Number(age) > 90)) {
      setProfileError('Please enter a valid Tutor Age between 18 and 90.');
      setActiveTab('personal');
      setSavingProfile(false);
      return;
    }

    // Instantly display "Profile Updated" without waiting for network latency
    setProfileSuccess('Profile Updated');
    setJustSavedProfile(true);
    setSavingProfile(true);

    if (saveFeedbackTimeoutRef.current) {
      clearTimeout(saveFeedbackTimeoutRef.current);
    }
    saveFeedbackTimeoutRef.current = setTimeout(() => {
      setProfileSuccess('');
      setJustSavedProfile(false);
    }, 3500);

    try {
      const cleanVideo = (videoIntroInput || videoIntro || '').trim();
      
      // Clean staged flags from documents and payment methods
      const cleanSanads = uploadedSanads.map(d => {
        const { isStaged, ...rest } = d;
        if (typeof rest._id === 'string' && rest._id.startsWith('staged_')) {
          delete rest._id;
        }
        return rest;
      });

      const cleanMethods = stagedPaymentMethods.map(m => {
        const { isStaged, ...rest } = m;
        if (typeof rest._id === 'string' && rest._id.startsWith('temp_')) {
          delete rest._id;
        }
        return rest;
      });

      // 1. Update basic user details
      await updateUserProfile({
        name: name.trim(),
        city: city.trim(),
        localArea: localArea.trim(),
        area: localArea.trim(),
        gender,
        tutoringType,
        subjects: selectedSubjects,
        age: age ? Number(age) : undefined,
        avatar,
        bio: bio.trim(),
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        teachingModes,
        videoIntro: cleanVideo
      });

      // 2. Update comprehensive tutor profile
      const hasNewSanad = cleanSanads.some(d => !d._id || d.status === 'pending');
      const tutorPayload = {
        city: city.trim(),
        localArea: localArea.trim(),
        area: localArea.trim(),
        gender,
        tutoringType,
        subjects: selectedSubjects,
        bio: bio.trim(),
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        teachingModes,
        videoIntro: cleanVideo,
        sanadDocuments: cleanSanads,
        paymentMethods: cleanMethods,
        preferredAccountChoice: stagedPreferredChoice,
        ...(hasNewSanad && tutorProfile?.verificationStatus === 'approved' ? { verificationStatus: 'pending' } : {})
      };

      const tutorRes = await api.updateMyTutorProfile(tutorPayload);
      if (tutorRes?.profile) {
        updateTutorProfileState(tutorRes.profile);
        if (tutorRes.profile.sanadDocuments) {
          setUploadedSanads(tutorRes.profile.sanadDocuments);
        }
        if (tutorRes.profile.paymentMethods) {
          setStagedPaymentMethods(tutorRes.profile.paymentMethods);
        }
        if (tutorRes.profile.preferredAccountChoice) {
          setStagedPreferredChoice(tutorRes.profile.preferredAccountChoice);
        }
        if (tutorRes.profile.videoIntro !== undefined) {
          setVideoIntro(tutorRes.profile.videoIntro);
          setVideoIntroInput(tutorRes.profile.videoIntro);
        }
      }

      // Update baseline snapshot
      setSavedSnapshot({
        name: name.trim(),
        city: city.trim(),
        localArea: localArea.trim(),
        gender,
        tutoringType,
        age: age ? String(age) : '',
        avatar,
        bio: bio.trim(),
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        teachingModes,
        selectedSubjects,
        uploadedSanads: tutorRes?.profile?.sanadDocuments || cleanSanads,
        stagedPaymentMethods: tutorRes?.profile?.paymentMethods || cleanMethods,
        stagedPreferredChoice,
        videoIntro: cleanVideo
      });

      setProfileSuccess('Profile Updated');
      setJustSavedProfile(true);
    } catch (err) {
      if (saveFeedbackTimeoutRef.current) {
        clearTimeout(saveFeedbackTimeoutRef.current);
      }
      setProfileSuccess('');
      setJustSavedProfile(false);
      setProfileError(err.message || 'Failed to update profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      setChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      setChangingPassword(false);
      return;
    }

    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 4000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Request Email Change
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailChangeLoading(true);
    setEmailChangeSuccess('');
    setEmailChangeError('');

    if (!newEmail || !newEmail.includes('@')) {
      setEmailChangeError('Please enter a valid email address.');
      setEmailChangeLoading(false);
      return;
    }

    try {
      const res = await api.requestEmailChange({
        newEmail: newEmail.trim().toLowerCase(),
        currentPassword: emailChangePassword
      });

      if (res.success) {
        setEmailChangeStep('verify');
        setEmailChangeSuccess(res.message || 'A 6-digit verification code has been dispatched to your new email.');
      }
    } catch (err) {
      setEmailChangeError(err.message || 'Failed to send verification code. Please check your current password.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Verify OTP and Apply Email Change
  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    setEmailChangeLoading(true);
    setEmailChangeSuccess('');
    setEmailChangeError('');

    if (!emailOtp || emailOtp.trim().length !== 6) {
      setEmailChangeError('Please enter the complete 6-digit OTP code.');
      setEmailChangeLoading(false);
      return;
    }

    try {
      const res = await api.verifyEmailChange({
        otp: emailOtp.trim()
      });

      if (res.success) {
        setEmail(res.user?.email || newEmail.trim().toLowerCase());
        setEmailChangeSuccess('Email address updated and verified successfully!');
        setNewEmail('');
        setEmailChangePassword('');
        setEmailOtp('');
        setEmailChangeStep('request');
        setTimeout(() => setEmailChangeSuccess(''), 5000);
      }
    } catch (err) {
      setEmailChangeError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const overdueDeals = deals.filter(d => {
    const isCleared = Boolean(d.tutorFeePaid || d.paymentStatus === 'verified' || d.platformFee === 0);
    if (isCleared) return false;
    return Boolean(d.tutorFeeDueDate && new Date(d.tutorFeeDueDate) < new Date() && !d.tutorFeePaid);
  });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="py-6 sm:py-8 bg-[#faf8f5] min-h-screen text-stone-900 pb-28">
      {/* Viewport Floating Toast Confirmation for Profile Save */}
      {profileSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-5 py-3.5 bg-gradient-to-r from-[#0c2217] via-[#143d2b] to-[#0c2217] border-2 border-[#d4a359] text-white rounded-2xl shadow-2xl flex items-center justify-between gap-3.5 animate-in fade-in slide-in-from-top-4 duration-150 ring-4 ring-[#d4a359]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#d4a359]/20 text-[#d4a359] flex items-center justify-center shrink-0 border border-[#d4a359]/40">
              <CheckCircle2 className="w-4 h-4 text-[#d4a359]" />
            </div>
            <span className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
              {profileSuccess}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setProfileSuccess('')}
            className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-2"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        
        {/* Top Header & Breadcrumb (Save button removed as requested) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/tutor/dashboard" className="hover:text-[#0c2217] font-semibold flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Tutor Portal</span>
              </Link>
              <span>/</span>
              <span className="text-stone-800 font-semibold">Profile Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Tutor Profile Settings
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Manage your teaching tracks, academic degrees, tuition payment accounts, and security preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/tutors/${user?.username || user?._id || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#f0ece1] hover:bg-[#e6dfd5] border border-[#d4a359]/50 rounded-2xl text-xs font-bold text-[#0c2217] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
              title="Preview how your profile appears to prospective students"
            >
              <Eye className="w-3.5 h-3.5 text-[#b85d34] group-hover:scale-110 transition-transform" />
              <span>Live Public Preview</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>

            <Link
              href="/tutor/dashboard"
              className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#e6dfd5] rounded-2xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#143d2b]" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* 1-Click Email Verification Success Banner */}
        {isVerifiedNotice && (
          <div className="p-4 sm:p-5 bg-[#eef5f0] border-2 border-[#143d2b] rounded-3xl flex items-start gap-3.5 shadow-xs animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-[#0c2217] text-[#d4a359] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold text-[#0c2217] flex items-center gap-2">
                <span>Email Verified Successfully!</span>
                <span className="text-[10px] bg-[#0c2217] text-[#faf8f5] font-bold px-2 py-0.5 rounded-full">EMAIL CONFIRMED</span>
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                Welcome to IlmiDunya! Your email address is confirmed. Please complete your profile 100%, then the administration will review it. Profile will be visible to the public on approval from administration.
              </p>
            </div>
          </div>
        )}

        {/* Global Feedback Messages */}
        {profileSuccess && (
          <div className="p-3.5 sm:p-4 bg-[#f0ece1] border border-[#d4a359]/50 text-[#0c2217] text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
              <span>{profileSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setProfileSuccess('')}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {profileError && (
          <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
            <button
              type="button"
              onClick={() => setProfileError('')}
              className="text-rose-400 hover:text-rose-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overdue Platform Fee Warning Notice */}
        {overdueDeals.length > 0 && (
          <div className="p-4 sm:p-6 bg-rose-50 border-2 border-rose-400 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-950 shadow-md animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-rose-950">
                    Urgent Policy Notice: Platform Fee Overdue ({overdueDeals.length} {overdueDeals.length === 1 ? 'Course' : 'Courses'})
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black uppercase bg-rose-600 text-white animate-pulse">
                    Live Classroom Locked
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  The 3-day payment clearance period has expired for {overdueDeals.map(d => `"${d.subject}" (PKR ${(d.platformFee || Math.round((d.price || 0) * 0.10)).toLocaleString()})`).join(', ')}. Classroom access is paused until payment is cleared.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedDealForPay(overdueDeals[0])}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Fee</span>
              </button>
              <Link
                href="/tutor/deals"
                className="px-3.5 py-2.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs rounded-xl transition-all text-center"
              >
                View Deals
              </Link>
            </div>
          </div>
        )}

        {/* Account Status Banner */}
        <AccountStatusBanner user={user} tutorProfile={tutorProfile} role="tutor" />

        {/* Dynamic Profile Completion Meter Widget */}
        <ProfileCompletionMeter
          user={user}
          tutorProfile={tutorProfile}
          showGreeting={false}
          activeTab={activeTab}
          onTabSelect={switchTab}
          onNavigate={navigateToSection}
        />

        {/* Main Layout: Tabs on Top for Mobile, 2-Column on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Main Tab Workspace (Order 1 on mobile so it appears immediately!) */}
          <div id="profile-tab-workspace" className="lg:col-span-8 space-y-5 order-1 lg:order-2 scroll-mt-28">
            
            {/* Fully Mobile-Responsive Segmented Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1 min-w-0">
                <div
                  ref={tabBarRef}
                  className="bg-white p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl border border-[#e6dfd5] shadow-xs flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none overscroll-x-contain [-webkit-overflow-scrolling:touch]"
                >
                  {PROFILE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    let badge = null;
                    if (tab.id === 'degrees' && uploadedSanads.length > 0) {
                      badge = uploadedSanads.length;
                    } else if (tab.id === 'payments' && stagedPaymentMethods.length > 0) {
                      badge = stagedPaymentMethods.length;
                    } else if (tab.id === 'video' && videoIntroInput) {
                      badge = '✓';
                    }

                    return (
                      <button
                        key={tab.id}
                        id={`tab-btn-${tab.id}`}
                        type="button"
                        ref={isActive ? activeTabBtnRef : null}
                        onClick={() => switchTab(tab.id)}
                        className={`shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 select-none ${
                          isActive
                            ? 'bg-[#0c2217] text-[#faf8f5] shadow-sm'
                            : 'text-stone-600 hover:text-[#0c2217] hover:bg-[#faf8f5]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-[#d4a359]' : 'text-stone-400'}`} />
                        <span className="hidden sm:inline whitespace-nowrap">{tab.fullLabel}</span>
                        <span className="sm:hidden whitespace-nowrap">{tab.shortLabel}</span>
                        {badge !== null && (
                          <span className={`text-[9.5px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                            isActive ? 'bg-[#143d2b] text-[#d4a359]' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Link
                href={`/tutors/${user?.username || user?._id || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-[#e6dfd5] rounded-2xl sm:rounded-3xl text-xs font-bold text-[#0c2217] flex items-center justify-center gap-1.5 shadow-2xs transition-colors group cursor-pointer"
                title="Preview how your profile appears to prospective students"
              >
                <Eye className="w-3.5 h-3.5 text-[#b85d34] group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">Live Preview</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </Link>
            </div>

            {/* TAB 1: PERSONAL & TEACHING INFO */}
            {activeTab === 'personal' && (
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-5 animate-in fade-in">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#b85d34]" />
                      <span>Personal &amp; Teaching Details</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Configure your name, location, subjects, hourly tuition, and background bio.
                    </p>
                  </div>
                  <span className="text-[10.5px] font-semibold text-stone-400 hidden sm:inline">
                    Tab 1 of 5
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Profile Photo Uploader (Easy Access on Mobile) */}
                  <div id="profile-avatar" className="scroll-mt-28 flex items-center gap-4 p-4 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl">
                    <div className="relative inline-block shrink-0">
                      <img
                        src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Tutor')}&background=0c2217&color=faf8f5&size=200`}
                        alt={name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <label className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-105">
                        <Camera className="w-3.5 h-3.5" />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-bold text-stone-800 block">Profile Avatar Photo</span>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        A verified professional picture increases student booking and parent confidence. Max 5MB (JPG or PNG).
                      </p>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div id="profile-name" className="scroll-mt-28">
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Qari Muhammad Ahmad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                    />
                  </div>

                  {/* Gender & Age Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div id="profile-gender" className="scroll-mt-28">
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Gender *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['male', 'female'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`py-2 px-3 rounded-2xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                              gender === g
                                ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div id="profile-age" className="scroll-mt-28">
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Tutor Age (Years)
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="90"
                        placeholder="e.g. 28"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Email Notice & Link to Security Tab */}
                  <div id="profile-email">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700 block">
                        Email Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className="text-[11px] font-bold text-[#b85d34] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Change Email &rarr;
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-700">
                      <span className="font-mono font-medium truncate max-w-[200px] sm:max-w-none">{email || user?.email}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#0c2217]" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* City & Local Main Area Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div id="profile-city" className="scroll-mt-28">
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        City *
                      </label>
                      <CustomSelect
                        options={pakistaniCities.map((c) => ({
                          value: c,
                          label: c,
                          sublabel: 'Pakistan'
                        }))}
                        value={city}
                        onChange={(val) => {
                          setCity(val);
                          setLocalArea('');
                          setIsCustomArea(false);
                        }}
                        placeholder="Select City in Pakistan..."
                        icon={MapPin}
                        searchable={true}
                        variant="profile"
                      />
                    </div>

                    <div id="profile-local-area" className="scroll-mt-28">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700 block">
                          Area (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          {city && (
                            <span className="text-[10px] text-stone-500 font-medium">
                              {city}
                            </span>
                          )}
                          {city && pakistaniCityAreas[city] && pakistaniCityAreas[city].length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = !isCustomArea;
                                setIsCustomArea(next);
                                if (!next && !pakistaniCityAreas[city]?.includes(localArea)) {
                                  setLocalArea('');
                                }
                              }}
                              className="text-[10.5px] font-bold text-[#b85d34] hover:text-[#913d16] hover:underline cursor-pointer"
                            >
                              {isCustomArea ? 'Choose from list' : '+ Other Area'}
                            </button>
                          )}
                        </div>
                      </div>

                      {city && pakistaniCityAreas[city] && pakistaniCityAreas[city].length > 0 && !isCustomArea ? (
                        <CustomSelect
                          options={[
                            ...pakistaniCityAreas[city].map((a) => ({
                              value: a,
                              label: a,
                              sublabel: city
                            })),
                            {
                              value: '__other__',
                              label: '+ Other Area (Type custom location)...',
                              sublabel: 'Custom colony, phase, or sector',
                              isAction: true
                            }
                          ]}
                          value={localArea}
                          onChange={(val) => {
                            if (val === '__other__') {
                              setIsCustomArea(true);
                              if (pakistaniCityAreas[city]?.includes(localArea)) {
                                setLocalArea('');
                              }
                            } else {
                              setLocalArea(val);
                            }
                          }}
                          placeholder={`Select Area in ${city}...`}
                          searchable={true}
                          allowCustom={true}
                          variant="profile"
                        />
                      ) : (
                        <div className="space-y-1.5">
                          <div className="relative flex items-center">
                            <MapPin className="w-4 h-4 text-[#b85d34] absolute left-3.5 pointer-events-none z-10" />
                            <input
                              type="text"
                              placeholder={city ? `Enter area / sector in ${city}...` : 'Enter local area name'}
                              value={localArea}
                              onChange={(e) => setLocalArea(e.target.value)}
                              className="w-full pl-10 pr-24 py-2.5 bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl text-xs text-stone-900 font-bold outline-none transition-all shadow-2xs h-[42px]"
                            />
                            {city && pakistaniCityAreas[city] && pakistaniCityAreas[city].length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomArea(false);
                                  if (!pakistaniCityAreas[city]?.includes(localArea)) {
                                    setLocalArea('');
                                  }
                                }}
                                className="absolute right-2 px-2 py-1 text-[10px] font-bold text-[#b85d34] hover:text-white hover:bg-[#b85d34] rounded-xl border border-[#b85d34]/30 transition-all cursor-pointer shadow-2xs"
                              >
                                List
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tutoring Discipline & Faculty Role */}
                  <div className="p-3.5 sm:p-4 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#0c2217]" />
                        <span>Primary Tutoring Discipline *</span>
                      </label>
                      <span className="text-[10px] sm:text-[10.5px] font-bold text-[#b85d34] bg-[#f5ebe6] px-2.5 py-0.5 rounded-full border border-[#b85d34]/30">
                        {gender === 'female'
                          ? tutoringType === 'quran'
                            ? 'Female Quran Faculty / Alimah'
                            : tutoringType === 'academic'
                            ? 'Female Academic Faculty'
                            : 'Female Faculty (Quran & Academic)'
                          : tutoringType === 'quran'
                          ? 'Male Quran Faculty / Qari'
                          : tutoringType === 'academic'
                          ? 'Male Academic Faculty'
                          : 'Male Faculty (Quran & Academic)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                      {[
                        { val: 'quran', label: 'Quranic Sciences', sub: 'Nazra, Hifz, Tajweed' },
                        { val: 'academic', label: 'Academic Education', sub: 'School, College, Board' },
                        { val: 'both', label: 'Both Disciplines', sub: 'Quran & Academics' }
                      ].map((t) => (
                        <button
                          key={t.val}
                          type="button"
                          onClick={() => {
                            setTutoringType(t.val);
                            if (t.val === 'quran') setActiveDisciplineTab('quran');
                            else if (t.val === 'academic') setActiveDisciplineTab('academic');
                            else setActiveDisciplineTab('all');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            tutoringType === t.val
                              ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                              : 'bg-white text-stone-700 border-[#e6ded1] hover:border-stone-400'
                          }`}
                        >
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className={`text-[10px] mt-0.5 line-clamp-1 ${tutoringType === t.val ? 'text-[#d4a359]' : 'text-stone-500'}`}>
                            {t.sub}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Teaching Mode Switcher */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      Teaching Delivery Modes *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { value: 'online', label: 'Online Tutoring', sub: 'Live WebRTC Video Classroom', icon: Video },
                        { value: 'in_person', label: 'In-Person Tutoring', sub: 'Home / Centre Tuition', icon: Home }
                      ].map((m) => {
                        const active = teachingModes.includes(m.value);
                        const IconComp = m.icon;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() =>
                              setTeachingModes(prev =>
                                active
                                  ? prev.filter(v => v !== m.value).length === 0
                                    ? prev
                                    : prev.filter(v => v !== m.value)
                                  : [...prev, m.value]
                              )
                            }
                            className={`flex flex-col items-start gap-1 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                              active
                                ? 'border-[#0c2217] bg-[#f0ece1]/50 text-[#0c2217]'
                                : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300'
                            }`}
                          >
                            <div className={`p-1.5 rounded-xl ${active ? 'bg-[#0c2217] text-[#d4a359]' : 'bg-stone-200 text-stone-600'}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold mt-0.5">{m.label}</span>
                            <span className="text-[10px] opacity-70">{m.sub}</span>
                            {active && (
                              <span className="text-[9px] font-bold bg-[#b85d34] text-white px-1.5 py-0.5 rounded-full mt-0.5 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>Selected</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject / Class / Discipline Selection Section */}
                  <div id="profile-subjects" className="scroll-mt-28 p-3.5 sm:p-5 bg-[#faf8f5] border border-[#e6ded1] rounded-3xl space-y-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6ded1] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#0c2217]" />
                          <h3 className="text-xs sm:text-sm font-black text-stone-900 font-serif">
                            Subjects &amp; Tracks Offered *
                          </h3>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Select the grades, board classes, and Quranic disciplines you teach.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0c2217] text-[#d4a359] border border-[#d4a359]/30 shadow-2xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>{selectedSubjects.length} Selected</span>
                        </span>
                      </div>
                    </div>

                    {/* Discipline Filter Tabs & Search Bar */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                        <div className="flex items-center gap-1 p-1 bg-white border border-[#e6ded1] rounded-2xl overflow-x-auto scrollbar-none">
                          {[
                            { id: 'all', label: 'All', count: categories.length },
                            { id: 'quran', label: 'Quranic', count: categories.filter(c => c.type === 'quran').length },
                            { id: 'academic', label: 'Academic', count: categories.filter(c => c.type === 'academic').length }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveDisciplineTab(tab.id)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                activeDisciplineTab === tab.id
                                  ? 'bg-[#0c2217] text-white shadow-xs'
                                  : 'text-stone-600 hover:text-[#0c2217] hover:bg-stone-50'
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                activeDisciplineTab === tab.id ? 'bg-[#143d2b] text-[#d4a359]' : 'bg-stone-100 text-stone-500'
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => handleSelectAllVisible(filteredCategories.map(c => c._id))}
                            className="px-2.5 py-1 text-[#0c2217] hover:bg-white rounded-xl border border-transparent hover:border-[#e6ded1] transition-all cursor-pointer"
                          >
                            Select All Visible
                          </button>
                          <span className="text-stone-300">&bull;</span>
                          <button
                            type="button"
                            onClick={() => handleClearVisible(filteredCategories.map(c => c._id))}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            Clear Visible
                          </button>
                        </div>
                      </div>

                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Filter by subject, class, or subtopic (Physics, Math, Hifz)..."
                          value={subjectSearchQuery}
                          onChange={(e) => setSubjectSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217] rounded-xl text-xs text-stone-800 outline-none placeholder:text-stone-400 transition-all shadow-2xs"
                        />
                        {subjectSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setSubjectSearchQuery('')}
                            className="absolute right-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cards Grid */}
                    {loadingCategories ? (
                      <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                        <LoadingSpinner />
                        <span>Loading disciplines &amp; subjects...</span>
                      </div>
                    ) : filteredCategories.length === 0 ? (
                      <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-[#e6ded1] text-xs text-stone-500">
                        No subjects found matching "{subjectSearchQuery}". Try another keyword.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {filteredCategories.map((cat) => {
                          const isChecked = selectedSubjects.includes(cat._id);
                          const isQuran = cat.type === 'quran';

                          return (
                            <div
                              key={cat._id}
                              onClick={() => handleToggleSubject(cat._id)}
                              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${
                                isChecked
                                  ? 'bg-white border-[#0c2217] shadow-xs ring-1 ring-[#0c2217]/10'
                                  : 'bg-white/80 border-[#e6ded1] hover:border-stone-400 hover:bg-white'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold text-stone-900 leading-snug">
                                    {cat.name}
                                  </h4>
                                  <div
                                    className={`w-5 h-5 rounded-lg shrink-0 flex items-center justify-center transition-all ${
                                      isChecked
                                        ? 'bg-[#0c2217] text-[#d4a359]'
                                        : 'border border-stone-300 bg-stone-50'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                      isQuran
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                                    }`}
                                  >
                                    {isQuran ? 'Quranic Science' : 'Academic Class'}
                                  </span>
                                </div>

                                {cat.description && (
                                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                                    {cat.description}
                                  </p>
                                )}
                              </div>

                              {Array.isArray(cat.subtopics) && cat.subtopics.length > 0 && (
                                <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1 items-center">
                                  <span className="text-[9.5px] font-semibold text-stone-400 mr-0.5">Includes:</span>
                                  {cat.subtopics.slice(0, 3).map((sub, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="text-[9.5px] font-medium px-2 py-0.5 bg-stone-100 text-stone-700 rounded-lg border border-stone-200/60"
                                    >
                                      {sub}
                                    </span>
                                  ))}
                                  {cat.subtopics.length > 3 && (
                                    <span className="text-[9.5px] text-stone-400 font-mono">
                                      +{cat.subtopics.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Teaching Experience & Fee Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700 block">
                          Teaching Experience (Years) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setExperienceYears(0)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer border flex items-center gap-1 ${
                            Number(experienceYears) === 0
                              ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217]'
                              : 'bg-[#faf8f5] text-stone-600 border-[#e6ded1] hover:border-[#d4a359]'
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-[#d4a359]" />
                          <span>{Number(experienceYears) === 0 ? 'Fresh (0 yrs)' : 'Set as Fresh'}</span>
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="45"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] font-bold transition-all"
                      />
                    </div>

                    <div className="p-3 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wide">
                        Tuition Fee Agreement
                      </span>
                      <p className="text-xs font-bold text-[#0c2217] mt-0.5">
                        Direct &amp; Flexible Agreement
                      </p>
                      <p className="text-[10.5px] text-stone-500 mt-0.5">
                        Discuss and agree upon monthly tuition fees directly with students and parents.
                      </p>
                    </div>
                  </div>

                  {/* Academic Qualifications & Degrees Text */}
                  <div id="profile-qualifications" className="scroll-mt-28 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <label className="text-xs font-bold text-stone-700 block">
                        Academic Qualifications &amp; Sanad Degrees *
                      </label>
                      <span className="text-[10px] text-stone-500">Comma-separated degrees</span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Shahadat-ul-Alimiyyah (Dars-e-Nizami), Sanad Tajweed & Qirat Sabaa, MA Islamic Studies"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] font-medium leading-relaxed"
                    />
                    {qualifications && qualifications.trim() && (
                      <div className="p-3 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold text-stone-500 block">Recognized Credentials:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {parseDegreesAndCertificates(qualifications).map((deg, dIdx) => (
                            <span
                              key={dIdx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#e6ded1] rounded-xl text-xs font-bold text-stone-900 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{deg}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Teaching Bio / Headline */}
                  <div id="profile-bio" className="scroll-mt-28">
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Teaching Bio &amp; Approach *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe your teaching methodology, Quranic Tajweed proficiency, academic background, student track record..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] font-normal leading-relaxed"
                    />
                  </div>

                  {/* Primary Save Action for Tab 1 */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-stone-400">
                      Changes are applied when clicking Save.
                    </span>
                    <button
                      type="button"
                      onClick={handleUnifiedSave}
                      disabled={savingProfile}
                      className={`px-6 py-2.5 font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                        justSavedProfile
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                          : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
                      }`}
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Saving Changes...</span>
                        </>
                      ) : justSavedProfile ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Profile Updated</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>Save Profile Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DEGREES & SANAD DOCUMENTS */}
            {activeTab === 'degrees' && (
              <div id="profile-sanads" className="scroll-mt-28 bg-white p-5 sm:p-7 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-5 animate-in fade-in">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#b85d34]" />
                      <span>Sanad &amp; Degrees Verification</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Upload your official Sanad and academic certificates for administration team review.
                    </p>
                  </div>
                  <span className="text-[10.5px] font-semibold text-stone-400 hidden sm:inline">
                    Tab 2 of 5
                  </span>
                </div>

                {/* Privacy Guarantee Banner */}
                <div className="p-3.5 sm:p-4 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl flex items-start gap-3 text-xs text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-[#0c2217]">Confidentiality Guarantee: </span>
                    Uploaded certificates and degree files are strictly private and accessible only by verified administrators. Only your verified degree title is displayed on your public tutor profile.
                  </div>
                </div>

                {sanadSuccess && (
                  <div className="p-3 bg-[#f0ece1] border border-[#d4a359]/40 text-[#0c2217] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                    <span>{sanadSuccess}</span>
                  </div>
                )}

                {sanadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{sanadError}</span>
                  </div>
                )}

                {/* Uploaded Documents Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-800">
                      Degrees &amp; Sanads Attached ({uploadedSanads.length})
                    </h4>
                    {uploadedSanads.some(d => d.isStaged) && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        ★ Staged changes present
                      </span>
                    )}
                  </div>
                  
                  {uploadedSanads.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 space-y-1">
                      <FileText className="w-6 h-6 mx-auto text-stone-300" />
                      <p className="font-bold text-stone-600">No degree documents attached yet</p>
                      <p className="text-[11px]">Upload your Sanad or Shahadat-ul-Alimiyyah below and click "Save Profile Changes".</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {uploadedSanads.map((doc, idx) => {
                        const isDocVerified = doc.status === 'verified' || doc.status === 'approved';
                        const isDocRejected = doc.status === 'rejected';
                        const isStaged = Boolean(doc.isStaged);

                        return (
                          <div
                            key={doc._id || idx}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 group transition-all ${
                              isStaged
                                ? 'bg-amber-50/60 border-amber-200'
                                : 'bg-stone-50 border-stone-200 hover:bg-[#f0ece1]/30 hover:border-[#d4a359]/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden min-w-0">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center shrink-0">
                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="truncate min-w-0">
                                <p className="font-bold text-xs text-stone-900 truncate">{doc.title || 'Sanad / Degree Document'}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {isStaged ? (
                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md">
                                      ★ Unsaved (Click Save Below)
                                    </span>
                                  ) : isDocVerified ? (
                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      Verified &amp; Approved
                                    </span>
                                  ) : isDocRejected ? (
                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-800 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded-md">
                                      <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                      Rejected
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded-md">
                                      <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
                                      Pending Approval
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedSanadModal(true)}
                                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#0c2217] shadow-2xs transition-colors cursor-pointer"
                                title="Preview Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSanadDocStaged(idx)}
                                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Upload New Sanad Document Form (Stages locally) */}
                <form onSubmit={handleAddSanadStaged} className="pt-4 border-t border-stone-100 space-y-3">
                  <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#b85d34]" />
                    <span>Stage Additional Sanad / Degree Document</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Degree Title * <span className="text-[10px] text-stone-400 font-normal">(Publicly visible)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dars-e-Nizami Shahadat-ul-Alimiyyah / BS Math"
                        value={newSanadTitle}
                        onChange={(e) => setNewSanadTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Select Document Scan (JPG, PNG, PDF) *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleSanadFileSelect}
                        className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f0ece1] file:text-[#0c2217] hover:file:bg-[#e6dfd5] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-[10.5px] text-stone-400">
                      Adding a document stages it in memory. It is submitted to the server when you click "Save Profile Changes".
                    </p>
                    <button
                      type="submit"
                      disabled={!newSanadFileUrl}
                      className="w-full sm:w-auto px-4 py-2 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>+ Stage Document</span>
                    </button>
                  </div>
                </form>

                {/* Primary Save Action for Tab 2 */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-400">
                    Degrees are submitted for approval upon clicking Save.
                  </span>
                  <button
                    type="button"
                    onClick={handleUnifiedSave}
                    disabled={savingProfile}
                    className={`px-6 py-2.5 font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                      justSavedProfile
                        ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
                    }`}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Saving Changes...</span>
                      </>
                    ) : justSavedProfile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Profile Updated</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: TUITION PAYMENT ACCOUNTS */}
            {activeTab === 'payments' && (
              <div id="profile-payment-methods" className="scroll-mt-28 space-y-5 animate-in fade-in">
                {/* Informative Header Banner */}
                <div className="p-3.5 sm:p-4 bg-[#faf8f5] border border-[#e6ded1] rounded-3xl flex items-start gap-3 text-xs text-stone-700">
                  <CreditCard className="w-4 h-4 text-[#0c2217] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-[#0c2217]">Tuition Receiving Accounts (Optional): </span>
                    Adding receiving accounts (Bank, EasyPaisa, JazzCash, Raast) is optional and does not affect your profile health or verification. You can configure personal accounts or use official administration accounts. All additions or edits save when clicking <strong>"Save Profile Changes"</strong>.
                  </div>
                </div>

                <TutorPaymentMethodsManager
                  isControlled={true}
                  methods={stagedPaymentMethods}
                  onChange={(updatedMethods) => {
                    setStagedPaymentMethods(updatedMethods);
                  }}
                  preferredChoice={stagedPreferredChoice}
                  onPreferenceChange={(choice) => {
                    setStagedPreferredChoice(choice);
                  }}
                />

                {/* Primary Save Action for Tab 3 */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e6dfd5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      Save Tuition Payment Settings
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Commit all receiving accounts and your default account choice.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnifiedSave}
                    disabled={savingProfile}
                    className={`w-full sm:w-auto px-6 py-2.5 font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                      justSavedProfile
                        ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
                    }`}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Saving Changes...</span>
                      </>
                    ) : justSavedProfile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Profile Updated</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: VIDEO INTRODUCTION */}
            {activeTab === 'video' && (
              <div id="profile-video-intro" className="scroll-mt-28 bg-white p-5 sm:p-7 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-5 animate-in fade-in">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center">
                        <Video className="w-4 h-4 text-[#b85d34]" />
                      </div>
                      <h2 className="text-sm font-black text-stone-900 font-serif">
                        Video Introduction (Optional)
                      </h2>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 max-w-xl">
                      Introduce your teaching style, Tajweed recitation, or academic track record to students.
                      <strong className="text-emerald-700 font-semibold"> 100% Optional</strong> — does not affect profile completion health score.
                    </p>
                  </div>

                  {videoIntroInput ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active Video</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-stone-50 text-stone-600 border border-stone-200 text-[11px] font-bold rounded-xl">
                      Optional · 0 Penalty
                    </span>
                  )}
                </div>

                {videoSuccess && (
                  <div className="p-3 bg-[#f0ece1] border border-[#d4a359]/40 text-[#0c2217] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                    <span>{videoSuccess}</span>
                  </div>
                )}

                {videoError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{videoError}</span>
                  </div>
                )}

                {/* Mode Toggle: Video Link vs Upload File */}
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setVideoTab('link')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      videoTab === 'link'
                        ? 'bg-[#0c2217] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Paste Video Link (YouTube / Loom)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab('upload')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      videoTab === 'upload'
                        ? 'bg-[#0c2217] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Upload Video File (MP4)
                  </button>
                </div>

                {/* Option A: Link Input */}
                {videoTab === 'link' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Video URL (YouTube, Vimeo, Loom, or Direct MP4)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <input
                        type="url"
                        placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.loom.com/share/..."
                        value={videoIntroInput}
                        onChange={(e) => {
                          setVideoIntroInput(e.target.value);
                          setVideoIntro(e.target.value);
                        }}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Supports YouTube (standard, shorts, embed), Vimeo, Loom recordings, and direct .mp4 links.
                    </p>
                  </div>
                )}

                {/* Option B: Direct Video File Upload */}
                {videoTab === 'upload' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Upload Short Video File (Max 50MB)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      disabled={videoUploadLoading}
                      onChange={handleVideoFileSelect}
                      className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f0ece1] file:text-[#0c2217] hover:file:bg-[#e6ded1] cursor-pointer"
                    />
                    {videoUploadLoading && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium rounded-xl flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Uploading video file to server... please keep this window open.</span>
                      </div>
                    )}
                    <p className="text-[11px] text-stone-400">
                      Recommended formats: MP4 or WebM recorded at 720p or 1080p.
                    </p>
                  </div>
                )}

                {/* Live Preview Player & Remove Option */}
                {(videoIntro || videoIntroInput) && (
                  <div className="pt-4 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#b85d34]" />
                        <span>Live Video Preview (Student View)</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveVideoStaged}
                        disabled={videoUploadLoading}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Video</span>
                      </button>
                    </div>

                    <div className="max-w-xl mx-auto">
                      <VideoIntroPlayer
                        videoUrl={videoIntro || videoIntroInput}
                        tutorName={name || 'Tutor'}
                      />
                    </div>
                  </div>
                )}

                {/* Primary Save Action for Tab 4 */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-400">
                    Video changes apply when you click Save.
                  </span>
                  <button
                    type="button"
                    onClick={handleUnifiedSave}
                    disabled={savingProfile}
                    className={`px-6 py-2.5 font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                      justSavedProfile
                        ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-[#b85d34] hover:bg-[#9e4e2a] text-white'
                    }`}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Saving Changes...</span>
                      </>
                    ) : justSavedProfile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Profile Updated</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: ACCOUNT & SECURITY */}
            {activeTab === 'security' && (
              <div id="profile-security" className="scroll-mt-28 space-y-5 sm:space-y-6 animate-in fade-in">
                
                {/* 1. Change Password */}
                <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#b85d34]" />
                      <span>Security &amp; Change Password</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Update your login password securely.
                    </p>
                  </div>

                  {passwordSuccess && (
                    <div className="p-3 bg-[#f0ece1] border border-[#d4a359]/40 text-[#0c2217] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                          title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                            title={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                            title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Change Email Address (with OTP Verification) */}
                <div id="change-email-section" className="bg-white p-5 sm:p-7 rounded-3xl border border-[#e6dfd5] shadow-xs space-y-4 scroll-mt-28">
                  <div className="border-b border-stone-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#b85d34]" />
                        <span>Change Email Address</span>
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Update your primary account email. A 6-digit OTP verification code will be dispatched to verify ownership.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-stone-500 font-semibold bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200">
                        Current: <strong className="text-stone-800">{email || user?.email}</strong>
                      </span>
                    </div>
                  </div>

                  {emailChangeSuccess && (
                    <div className="p-3 bg-[#f0ece1] border border-[#d4a359]/40 text-[#0c2217] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                      <span>{emailChangeSuccess}</span>
                    </div>
                  )}

                  {emailChangeError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{emailChangeError}</span>
                    </div>
                  )}

                  {emailChangeStep === 'request' ? (
                    <form onSubmit={handleRequestEmailChange} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1">
                            New Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="new.email@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1">
                            Current Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showEmailPassword ? 'text' : 'password'}
                              required
                              placeholder="Confirm current password"
                              value={emailChangePassword}
                              onChange={(e) => setEmailChangePassword(e.target.value)}
                              className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 outline-none focus:border-[#0c2217] focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEmailPassword(!showEmailPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                              title={showEmailPassword ? 'Hide password' : 'Show password'}
                            >
                              {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={emailChangeLoading}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Mail className="w-3.5 h-3.5 text-white" />
                          <span>{emailChangeLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailChange} className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1.5">
                        <p className="text-xs font-bold text-[#0c2217]">
                          Enter 6-Digit OTP Verification Code
                        </p>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          We dispatched a 6-digit confirmation code to <strong className="text-[#b85d34]">{newEmail}</strong>. Enter the code below to complete email verification.
                        </p>
                      </div>

                      <div className="max-w-xs">
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Verification Code (OTP) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="123456"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-center text-base font-mono font-black tracking-widest text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white"
                        />
                      </div>

                      <div className="pt-1 flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          disabled={emailChangeLoading || emailOtp.length !== 6}
                          className="px-6 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>{emailChangeLoading ? 'Verifying...' : 'Confirm & Update Email'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEmailChangeStep('request');
                            setEmailOtp('');
                            setEmailChangeError('');
                          }}
                          className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
                        >
                          Back / Change Address
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* 3. Safety Reports & Incident Resolutions */}
                <SafetyReportsSection userRole="tutor" />

                {/* 4. Danger Zone / Delete Account */}
                <div className="bg-white p-5 sm:p-7 rounded-3xl border border-rose-200 shadow-xs space-y-3.5">
                  <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-rose-950 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Danger Zone &mdash; Delete Tutor Account</span>
                      </h2>
                      <p className="text-xs text-rose-700/80 mt-0.5">
                        Permanently remove your tutor profile listing, courses, and educational credentials.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Deleting your account will remove your public faculty listing, delete your curriculum courses, student reviews, and Sanad submissions. This action is irreversible.
                  </p>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete My Account</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Left Column: Profile Overview Sidebar (Order 2 on mobile so it sits cleanly below tabs!) */}
          <div className="lg:col-span-4 space-y-5 order-2 lg:order-1">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e6dfd5] shadow-xs text-center space-y-4">
              <div id="profile-avatar" className="relative inline-block mx-auto">
                <img
                  src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Tutor')}&background=0c2217&color=faf8f5&size=200`}
                  alt={name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#eef5f0] shadow-md mx-auto"
                />

                {isConnected ? (
                  <span
                    className="absolute top-1 right-1 flex h-4 w-4 sm:h-5 sm:w-5 z-10"
                    title="Active / Online Now"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 border-2 border-white shadow-sm"></span>
                  </span>
                ) : (
                  <span
                    className="absolute top-1 right-1 inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-stone-400 border-2 border-white shadow-sm z-10"
                    title="Offline"
                  />
                )}
                
                <label className="absolute bottom-0 right-0 p-2 sm:p-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-105 z-10">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h3 className="font-bold text-sm text-stone-900">{name || 'Tutor Name'}</h3>
                <p className="text-xs text-stone-500">{email || 'tutor@example.com'}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0ece1] text-[#0c2217]">
                    Tutor
                  </span>
                  {tutorProfile?.verificationStatus === 'approved' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b85d34] text-white flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : tutorProfile?.verificationStatus === 'under_review' || tutorProfile?.verificationStatus === 'pending' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                      <span>Pending Review</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-stone-500" />
                      <span>Incomplete</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 text-left space-y-2.5 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Gender &amp; Age:</span>
                  <span className="font-bold capitalize">{gender || 'Not set'}{age ? `, ${age} yrs` : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Location:</span>
                  <span className="font-bold text-right truncate max-w-[160px]">{localArea ? `${localArea}, ${city}` : (city || 'Not set')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Subjects Selected:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="font-bold text-[#b85d34] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{selectedSubjects.length} Classes</span>
                    <span className="text-[10px]">&rarr;</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Degrees / Sanads:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('degrees')}
                    className="font-bold text-[#0c2217] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{uploadedSanads.length} Uploaded</span>
                    <span className="text-[10px]">&rarr;</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Payment Accounts:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className="font-bold text-[#0c2217] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{stagedPaymentMethods.length} Methods ({stagedPreferredChoice === 'admin' ? 'Admin' : 'Own'})</span>
                    <span className="text-[10px]">&rarr;</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Video Intro:</span>
                  <span className="font-bold text-right">
                    {videoIntroInput ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-stone-400 font-medium">None</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Live Preview Button in Sidebar */}
              <div className="pt-2">
                <Link
                  href={`/tutors/${user?.username || user?._id || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3.5 bg-[#f0ece1] hover:bg-[#e6dfd5] text-[#0c2217] border border-[#d4a359]/40 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs group cursor-pointer"
                  title="Preview how your profile appears to prospective students"
                >
                  <Eye className="w-4 h-4 text-[#b85d34] group-hover:scale-110 transition-transform" />
                  <span>Preview Public Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              </div>
            </div>

            {/* Quick Links / Help */}
            <div className="p-4 bg-[#f0ece1]/50 border border-[#e6dfd5] rounded-3xl space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2 text-[#0c2217] font-bold">
                <Info className="w-4 h-4 text-[#d4a359]" />
                <span>Need assistance?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                Degrees &amp; Sanads must be authentic government or Wafaq-ul-Madaris issued certificates. Administration reviews submissions within 24-48 hours.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Bottom Action Bar for Unsaved Changes & Save Confirmation (Responsive for Mobile & Desktop) */}
      {(hasUnsavedChanges || justSavedProfile) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c2217]/95 backdrop-blur-md border-t border-[#d4a359]/30 p-3 sm:py-3.5 sm:px-8 shadow-2xl transition-all animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
            {justSavedProfile ? (
              <div className="flex items-center justify-between w-full py-0.5">
                <div className="flex items-center gap-2.5 text-emerald-300 text-xs sm:text-sm font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Profile Updated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/tutors/${user?.username || user?._id || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-300" />
                    <span>View Public Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setJustSavedProfile(false)}
                    className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-white text-xs w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d4a359] animate-ping shrink-0" />
                    <span className="font-bold text-[#faf8f5]">Unsaved changes in profile</span>
                  </div>
                  <span className="text-[10px] text-[#d4a359] sm:hidden font-mono font-bold">Not saved</span>
                </div>
                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    disabled={savingProfile}
                    className="w-full sm:w-auto px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-600 transition-colors cursor-pointer text-center"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleUnifiedSave}
                    disabled={savingProfile}
                    className="w-full sm:w-auto px-5 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#b85d34]/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-center"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sanad Document Preview Modal */}
      {selectedSanadModal && (
        <SanadModal
          isOpen={selectedSanadModal}
          onClose={() => setSelectedSanadModal(false)}
          documents={uploadedSanads}
          degrees={parseDegreesAndCertificates(qualifications, uploadedSanads)}
          tutorName={name || 'Tutor'}
          canViewScans={true}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          role="tutor"
          userName={name}
        />
      )}

      {/* Tutor Platform Payment Modal */}
      {selectedDealForPay && (
        <TutorPaymentModal
          deal={selectedDealForPay}
          isOpen={Boolean(selectedDealForPay)}
          onClose={() => setSelectedDealForPay(null)}
          onSuccess={() => {
            setSelectedDealForPay(null);
            fetchDeals();
          }}
        />
      )}

    </div>
  );
}

export default function TutorProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TutorProfileContent />
    </Suspense>
  );
}
