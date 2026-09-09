'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
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
  Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import ProfileCompletionMeter from '../../../components/common/ProfileCompletionMeter';
import AccountStatusBanner from '../../../components/common/AccountStatusBanner';
import { SanadModal } from '../../../components/common/SanadBadge';
import DeleteAccountModal from '../../../components/common/DeleteAccountModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SafetyReportsSection from '../../../components/profile/SafetyReportsSection';
import { allPakistaniCities, pakistaniCityAreas } from '../../../data/pakistanAreas';
import { StyledNativeSelect } from '../../../components/common/CustomSelect';

const pakistaniCities = allPakistaniCities;

function TutorProfileContent() {
  const searchParams = useSearchParams();
  const isVerifiedNotice = searchParams.get('verified') === 'true';
  const { user, tutorProfile, updateUserProfile, updateTutorProfileState, loading: authLoading } = useAuth();

  // Basic Account Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Lahore');
  const [localArea, setLocalArea] = useState('');
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
  const [uploadedSanads, setUploadedSanads] = useState([]);
  const [selectedSanadForView, setSelectedSanadForView] = useState(null);

  // New Sanad Upload State
  const [newSanadTitle, setNewSanadTitle] = useState('');
  const [newSanadFileUrl, setNewSanadFileUrl] = useState('');
  const [uploadingSanad, setUploadingSanad] = useState(false);
  const [selectedSanadModal, setSelectedSanadModal] = useState(false);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sanadSuccess, setSanadSuccess] = useState('');
  const [sanadError, setSanadError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync state on load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCity(user.city || '');
      setLocalArea(user.area || '');
      setGender(user.gender || '');
      setAge(user.age ? String(user.age) : '');
      setAvatar(user.avatar || '');
    }
    if (tutorProfile) {
      if (tutorProfile.city) setCity(tutorProfile.city);
      if (tutorProfile.localArea) setLocalArea(tutorProfile.localArea);
      if (tutorProfile.tutoringType) setTutoringType(tutorProfile.tutoringType);
      setBio(tutorProfile.bio || '');
      setQualifications(tutorProfile.qualifications || '');
      if (tutorProfile.experienceYears !== undefined && tutorProfile.experienceYears !== null) {
        setExperienceYears(tutorProfile.experienceYears);
      }
      setHourlyRate(tutorProfile.hourlyRate || 1500);
      setUploadedSanads(tutorProfile.sanadDocuments || []);
      const modes = Array.isArray(tutorProfile.teachingModes) && tutorProfile.teachingModes.length > 0
        ? tutorProfile.teachingModes
        : ['online'];
      setTeachingModes(modes);
    }
  }, [user, tutorProfile]);

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
      setProfileSuccess('Photo selected! Click "Save Changes" below to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Handle New Sanad / Degree Document Upload
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

  const handleUploadSanadSubmit = async (e) => {
    e.preventDefault();
    if (!newSanadFileUrl) {
      setSanadError('Please choose a Sanad / degree document image or PDF');
      return;
    }

    setUploadingSanad(true);
    setSanadSuccess('');
    setSanadError('');

    try {
      // Add document with pending status
      const newDoc = {
        title: newSanadTitle.trim() || 'Sanad / Educational Degree',
        fileUrl: newSanadFileUrl,
        fileType: newSanadFileUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
        status: 'pending',
        uploadedAt: new Date()
      };

      const updatedDocs = [...uploadedSanads, newDoc];

      const res = await api.updateMyTutorProfile({
        sanadDocuments: updatedDocs,
        verificationStatus: 'pending' // Queued for admin verification
      });

      if (res.success) {
        setUploadedSanads(res.profile?.sanadDocuments || updatedDocs);
        if (res.profile) updateTutorProfileState(res.profile);
        setNewSanadTitle('');
        setNewSanadFileUrl('');
        setSanadSuccess('Sanad / Degree uploaded successfully! It is queued for admin approval (Pending Approval).');
        setTimeout(() => setSanadSuccess(''), 5000);
      }
    } catch (err) {
      setSanadError(err.message || 'Error uploading Sanad document');
    } finally {
      setUploadingSanad(false);
    }
  };

  const handleDeleteSanadDoc = async (docIndex) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      const updatedDocs = uploadedSanads.filter((_, idx) => idx !== docIndex);
      const res = await api.updateMyTutorProfile({
        sanadDocuments: updatedDocs
      });
      if (res.success) {
        setUploadedSanads(res.profile?.sanadDocuments || updatedDocs);
        if (res.profile) updateTutorProfileState(res.profile);
        setSanadSuccess('Document removed successfully.');
        setTimeout(() => setSanadSuccess(''), 3000);
      }
    } catch (err) {
      setSanadError(err.message || 'Failed to remove document');
    }
  };

  // Save Full Profile Settings
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Full name is required');
      setSavingProfile(false);
      return;
    }

    if (age && (Number(age) < 18 || Number(age) > 90)) {
      setProfileError('Please enter a valid Tutor Age between 18 and 90');
      setSavingProfile(false);
      return;
    }

    try {
      const res = await updateUserProfile({
        name: name.trim(),
        city: city.trim(),
        localArea: localArea.trim(),
        area: localArea.trim(),
        gender,
        tutoringType,
        age: age ? Number(age) : undefined,
        avatar,
        bio: bio.trim(),
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        teachingModes
      });

      try {
        const tutorRes = await api.updateMyTutorProfile({
          city: city.trim(),
          localArea: localArea.trim(),
          area: localArea.trim(),
          gender,
          tutoringType,
          bio: bio.trim(),
          qualifications: qualifications.trim(),
          experienceYears: Number(experienceYears),
          hourlyRate: Number(hourlyRate),
          teachingModes
        });
        if (tutorRes?.profile) updateTutorProfileState(tutorRes.profile);
      } catch (tErr) {
        console.error('Error syncing tutor profile:', tErr);
      }

      if (res.success) {
        setProfileSuccess('Tutor profile details updated successfully!');
        setTimeout(() => setProfileSuccess(''), 4000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update tutor profile');
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
      setPasswordError('New password must be at least 6 characters');
      setChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
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
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Request Email Change (Sends 6-Digit OTP to new email)
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailChangeLoading(true);
    setEmailChangeSuccess('');
    setEmailChangeError('');

    if (!newEmail || !newEmail.includes('@')) {
      setEmailChangeError('Please enter a valid email address');
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
      setEmailChangeError(err.message || 'Failed to send verification code. Please verify your current password.');
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
      setEmailChangeError('Please enter the complete 6-digit OTP code');
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

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="py-8 bg-[#faf8f5] min-h-screen text-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/tutor/dashboard" className="hover:text-[#0c2217] font-semibold flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Tutor Portal</span>
              </Link>
              <span>/</span>
              <span className="text-stone-800 font-semibold">Profile &amp; Sanad Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Tutor Profile &amp; Sanad Verification
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Manage your teaching bio, hourly rates, educational degrees, and Sanad credentials for admin verification.
            </p>
          </div>

          <Link
            href="/tutor/dashboard"
            className="self-start sm:self-center px-4 py-2 bg-white hover:bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-[#143d2b]" />
            <span>Go to Dashboard</span>
          </Link>
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

        {/* Account Status / Warning / Audit Notice Banner */}
        <AccountStatusBanner user={user} tutorProfile={tutorProfile} role="tutor" />

        {/* Dynamic Profile Completion Meter Widget */}
        <ProfileCompletionMeter user={user} tutorProfile={tutorProfile} showGreeting={false} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar & Verification Badge */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-[#e6dfd5] shadow-xs text-center space-y-4">
              <div id="profile-avatar" className="relative inline-block mx-auto scroll-mt-28">
                <img
                  src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Tutor')}&background=0c2217&color=faf8f5&size=200`}
                  alt={name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#eef5f0] shadow-md mx-auto"
                />
                
                {/* Upload Button overlay */}
                <label className="absolute bottom-0 right-0 p-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-105">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{name || 'Tutor Name'}</h3>
                <p className="text-xs text-slate-500">{email || 'tutor@example.com'}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0ece1] text-[#0c2217]">
                    Tutor
                  </span>
                  {tutorProfile?.verificationStatus === 'approved' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b85d34] text-white flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified & Approved</span>
                    </span>
                  ) : tutorProfile?.verificationStatus === 'under_review' || tutorProfile?.verificationStatus === 'pending' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                      <span>Under Admin Review</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-slate-500" />
                      <span>Incomplete Profile</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gender:</span>
                  <span className="font-bold capitalize">{gender || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-bold">{age ? `${age} Years` : 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tuition Pricing:</span>
                  <span className="font-bold text-[#0c2217]">Direct Agreed Rate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-bold">{experienceYears} Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-bold text-right truncate max-w-[170px]">{localArea ? `${localArea}, ${city}` : (city || 'Not set')}</span>
                </div>
              </div>
            </div>

            {/* Teaching Mode Switcher Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#b85d34]" />
                <span>Teaching Modes</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'online', label: 'Online', sub: 'Live WebRTC Classroom', icon: Video },
                  { value: 'in_person', label: 'In-Person', sub: 'Home / Centre Tutoring', icon: Home }
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
                      className={`flex flex-col items-start gap-0.5 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        active
                          ? 'border-[#d4a359]/50 bg-[#f0ece1] text-[#0c2217]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl ${active ? 'bg-[#d4a359]/20 text-[#0c2217]' : 'bg-slate-100 text-slate-600'}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold mt-1">{m.label}</span>
                      <span className="text-[10px] opacity-70">{m.sub}</span>
                      {active && (
                        <span className="text-[9px] font-bold bg-[#b85d34] text-white px-1.5 py-0.5 rounded-full mt-1 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Selected</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Forms and Sanad Management */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            
            {/* 1. Personal & Academic Profile Form */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#b85d34]" />
                  <span>Personal & Teaching Details</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your bio, hourly rate, and teaching qualifications.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-[#f0ece1] border border-[#d4a359]/40 text-[#0c2217] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#b85d34] shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                
                {/* Full Name */}
                <div id="profile-name" className="scroll-mt-28">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white font-semibold"
                  />
                </div>

                {/* Gender & Age Row */}
                <div className="grid grid-cols-2 gap-3 items-start">
                  <div id="profile-gender" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Gender *
                    </label>
                    <StyledNativeSelect
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      icon={User}
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </StyledNativeSelect>
                  </div>

                  <div id="profile-age" className="scroll-mt-28">
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
                      className="w-full px-4 py-2.5 bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs h-[42px]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div id="profile-email">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Email Address
                    </label>
                    <a href="#change-email-section" className="text-[11px] font-bold text-[#b85d34] hover:underline flex items-center gap-1">
                      Change Email &rarr;
                    </a>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
                    <span className="font-mono font-medium">{email || user?.email}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#0c2217]" />
                      <span>Verified</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Your login email is verified. To change your email address, use the secure Change Email section below.
                  </p>
                </div>

                {/* City & Local Main Area Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div id="profile-city" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City *
                    </label>
                    <StyledNativeSelect
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setLocalArea('');
                      }}
                      icon={MapPin}
                    >
                      <option value="">-- Select City in Pakistan --</option>
                      {pakistaniCities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </StyledNativeSelect>
                  </div>

                  <div id="profile-local-area" className="scroll-mt-28">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Area (Optional)
                      </label>
                      {city && (
                        <span className="text-[10px] text-stone-500 font-medium">
                          {city}
                        </span>
                      )}
                    </div>
                    {city && pakistaniCityAreas[city] && pakistaniCityAreas[city].length > 0 ? (
                      <StyledNativeSelect
                        value={localArea}
                        onChange={(e) => setLocalArea(e.target.value)}
                      >
                        <option value="">-- Select Main Area in {city} --</option>
                        {pakistaniCityAreas[city].map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </StyledNativeSelect>
                    ) : (
                      <input
                        type="text"
                        placeholder={city ? `General coverage across ${city}` : 'Select city first'}
                        value={localArea}
                        onChange={(e) => setLocalArea(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl text-xs text-slate-900 font-semibold outline-none transition-all shadow-2xs"
                      />
                    )}
                  </div>
                </div>

                {/* Tutoring Discipline & Faculty Role */}
                <div className="p-3.5 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#0c2217]" />
                      <span>Primary Tutoring Discipline *</span>
                    </label>
                    <span className="text-[10.5px] font-bold text-[#b85d34] bg-[#f5ebe6] px-2.5 py-0.5 rounded-full border border-[#b85d34]/30">
                      {gender === 'female'
                        ? tutoringType === 'quran'
                          ? 'Verified Female Alimah / Quran Faculty'
                          : tutoringType === 'academic'
                          ? 'Verified Female Academic Faculty'
                          : 'Verified Female Faculty (Quran & Academic)'
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
                        onClick={() => setTutoringType(t.val)}
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

                {/* Teaching Experience & Tuition Model Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">
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
                        <span>{Number(experienceYears) === 0 ? 'Fresh Selected' : 'Set as Fresh (0 yrs)'}</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="45"
                      required
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                    />
                    {Number(experienceYears) === 0 && (
                      <p className="text-[10.5px] text-[#b85d34] font-semibold mt-1">
                        Displaying as: Fresh / Beginner Tutor (&lt; 1 Year Experience).
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-[#faf8f5] border border-[#e6ded1] rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                      Tuition Fee Agreement
                    </span>
                    <p className="text-xs font-bold text-[#0c2217] mt-0.5">
                      Direct &amp; Flexible Agreement
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      No fixed hourly rates. Discuss and mutually agree on the monthly fee with students.
                    </p>
                  </div>
                </div>

                {/* Educational Qualifications & Degrees */}
                <div id="profile-qualifications" className="scroll-mt-28">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Academic Qualifications & Sanad Degrees *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dars-e-Nizami (Shahadat-ul-Almiya), Wifaq-ul-Madaris, Hafiz-e-Quran, BS Islamic Studies"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
                  />
                </div>

                {/* Teaching Bio / Headline */}
                <div id="profile-bio" className="scroll-mt-28">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Teaching Bio & Approach *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your teaching methodology, Quranic Tajweed proficiency, student track record..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-normal leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#faf8f5]" />
                    <span>{savingProfile ? 'Saving Details...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Sanad & Degree Documents Manager */}
            <div id="profile-sanads" className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5 scroll-mt-28">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#b85d34]" />
                    <span>Sanad & Educational Degrees</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official degrees verified by the administration team.
                  </p>
                </div>

                {uploadedSanads.length > 0 ? (
                  uploadedSanads.some(d => d.status === 'pending' || (!d.status && tutorProfile?.verificationStatus !== 'approved')) ||
                  tutorProfile?.verificationStatus === 'under_review' ||
                  tutorProfile?.verificationStatus === 'pending' ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>Pending Approval</span>
                    </span>
                  ) : tutorProfile?.verificationStatus === 'rejected' ? (
                    <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Verification Rejected</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                      <span>Verified Sanad</span>
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-xl flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Document Required</span>
                  </span>
                )}
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
                <h4 className="text-xs font-bold text-slate-700">Uploaded Sanad &amp; Degree Documents ({uploadedSanads.length})</h4>
                
                {uploadedSanads.length === 0 ? (
                  <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 space-y-1">
                    <FileText className="w-6 h-6 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">No documents uploaded yet</p>
                    <p className="text-[11px]">Upload your Sanad / Shahada or Academic degree below for verification.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedSanads.map((doc, idx) => {
                      const isDocVerified = doc.status === 'verified' || doc.status === 'approved' || (!doc.status && tutorProfile?.verificationStatus === 'approved');
                      const isDocRejected = doc.status === 'rejected';
                      const isDocPending = !isDocVerified && !isDocRejected;

                      return (
                        <div
                          key={doc._id || idx}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 group hover:bg-[#f0ece1]/40 hover:border-[#d4a359]/40 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center shrink-0">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="truncate min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate">{doc.title || 'Sanad / Degree Document'}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] text-slate-400">
                                  Uploaded {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                                </span>
                                <span className="text-slate-300">·</span>
                                {isDocVerified ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    Verified
                                  </span>
                                ) : isDocRejected ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100/90 border border-rose-200 px-1.5 py-0.2 rounded-md">
                                    <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                    Rejected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-200 px-1.5 py-0.2 rounded-md">
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
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0c2217] hover:border-[#d4a359]/40 shadow-2xs transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSanadDoc(idx)}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-colors cursor-pointer"
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

              {/* Upload New Sanad Document Form */}
              <form onSubmit={handleUploadSanadSubmit} className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#b85d34]" />
                  <span>Upload Additional Sanad / Degree Document</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Document Title / Degree Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shahadat-ul-Almiya / BS Degree"
                      value={newSanadTitle}
                      onChange={(e) => setNewSanadTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Select Sanad / Degree File (JPG, PNG, PDF) *
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleSanadFileSelect}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f0ece1] file:text-[#0c2217] hover:file:bg-[#f0ece1] cursor-pointer"
                    />
                  </div>
                </div>

                {newSanadFileUrl && (
                  <div className="p-3 bg-[#f0ece1]/70 border border-[#d4a359]/40 rounded-2xl text-xs text-[#0c2217] flex items-center justify-between">
                    <span>Document ready to upload</span>
                    <button
                      type="submit"
                      disabled={uploadingSanad}
                      className="px-4 py-1.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingSanad ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                  </div>
                )}
              </form>

            </div>

            {/* 3. Security & Password Change Form */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#b85d34]" />
                  <span>Security & Change Password</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      title={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
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
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3b. Change Email Address (with 6-Digit OTP Verification) */}
            <div id="change-email-section" className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4 scroll-mt-28">
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#b85d34]" />
                    <span>Change Email Address</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your primary account email. A 6-digit OTP verification code will be sent to confirm your new email.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                    Current: <strong className="text-slate-800">{email || user?.email}</strong>
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
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        New Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="new.email@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showEmailPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm current password"
                          value={emailChangePassword}
                          onChange={(e) => setEmailChangePassword(e.target.value)}
                          className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmailPassword(!showEmailPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
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
                      className="px-6 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#b85d34]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5 text-white" />
                      <span>{emailChangeLoading ? 'Sending Verification Code...' : 'Send Verification OTP'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChange} className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-1.5">
                    <p className="text-xs font-bold text-[#0c2217]">
                      Enter 6-Digit OTP Verification Code
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      We dispatched a 6-digit confirmation code to <strong className="text-[#b85d34]">{newEmail}</strong>. Enter the code below to complete the verification.
                    </p>
                  </div>

                  <div className="max-w-xs">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Verification Code (OTP) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-base font-mono font-black tracking-widest text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white"
                    />
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={emailChangeLoading || emailOtp.length !== 6}
                      className="px-6 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Back / Change Email Address
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 4. Safety Reports & Incident Resolutions */}
            <SafetyReportsSection userRole="tutor" />

            {/* 5. Danger Zone / Delete Account */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-rose-200 shadow-xs space-y-3.5">
              <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-rose-950 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Danger Zone &mdash; Delete Account</span>
                  </h2>
                  <p className="text-xs text-rose-700/80 mt-0.5">
                    Permanently remove your tutor listing, courses, and educational credentials.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Deleting your account will remove your public faculty listing from search results, delete your curriculum courses, student reviews, and Sanad submissions. This action is irreversible.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete My Account</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Sanad Document Preview Modal */}
      {selectedSanadModal && (
        <SanadModal
          isOpen={selectedSanadModal}
          onClose={() => setSelectedSanadModal(false)}
          sanads={uploadedSanads}
          tutorName={name || 'Tutor'}
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
