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
import { allPakistaniCities } from '../../../data/pakistanAreas';

const pakistaniCities = allPakistaniCities;

function TutorProfileContent() {
  const searchParams = useSearchParams();
  const isVerifiedNotice = searchParams.get('verified') === 'true';
  const { user, tutorProfile, updateUserProfile, updateTutorProfileState, loading: authLoading } = useAuth();

  // Basic Account Details
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('');

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
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCity(user.city || '');
      setGender(user.gender || '');
      setAge(user.age ? String(user.age) : '');
      setAvatar(user.avatar || '');
    }
    if (tutorProfile) {
      setBio(tutorProfile.bio || '');
      setQualifications(tutorProfile.qualifications || '');
      setExperienceYears(tutorProfile.experienceYears || 2);
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
      // Direct base64 addition to tutor profile sanadDocuments
      const updatedDocs = [
        ...uploadedSanads,
        {
          title: newSanadTitle.trim() || 'Sanad / Educational Degree',
          fileUrl: newSanadFileUrl,
          fileType: newSanadFileUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
          uploadedAt: new Date()
        }
      ];

      const res = await api.updateMyTutorProfile({
        sanadDocuments: updatedDocs,
        verificationStatus: 'pending' // Flag for admin verification
      });

      if (res.success) {
        setUploadedSanads(updatedDocs);
        if (res.profile) updateTutorProfileState(res.profile);
        setNewSanadTitle('');
        setNewSanadFileUrl('');
        setSanadSuccess('Sanad / Degree uploaded successfully! It is queued for Admin approval.');
        setTimeout(() => setSanadSuccess(''), 4500);
      }
    } catch (err) {
      setSanadError(err.message || 'Error uploading Sanad document');
    } finally {
      setUploadingSanad(false);
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

    if (!phone.trim()) {
      setProfileError('Mobile phone (WhatsApp) is required');
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
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
        city,
        gender,
        age: age ? Number(age) : undefined,
        avatar,
        bio: bio.trim(),
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        teachingModes
      });

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

  if (authLoading) {
    return <LoadingSpinner text="Loading tutor credentials..." />;
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
                {username && <p className="text-[11px] font-mono font-bold text-[#b85d34]">@{username}</p>}
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
                  ) : tutorProfile?.verificationStatus === 'under_review' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
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
                  <span className="text-slate-400">Rate / Hour:</span>
                  <span className="font-bold text-[#0c2217] font-mono">Rs. {hourlyRate} PKR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-bold">{experienceYears} Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">City:</span>
                  <span className="font-bold">{city || 'Not set'}</span>
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
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Personal & Academic Profile Form */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#b85d34]" />
                  <span>Personal & Teaching Details</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact phone, bio, hourly rate, and teaching qualifications.
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
                
                {/* Full Name & Username Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
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

                  <div id="profile-username" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Username (Profile URL Handle)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 select-none">
                        @
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. qari_huzaifa"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        maxLength={30}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white font-semibold font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      Public profile link: <span className="text-[#0c2217] font-mono font-bold">/tutors/{username || user?._id || 'username'}</span>
                    </p>
                  </div>
                </div>

                {/* Gender & Age Row */}
                <div className="grid grid-cols-2 gap-3 items-start">
                  <div id="profile-gender" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-semibold h-[42px]"
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white font-bold h-[42px]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                  />
                </div>

                {/* City & Mobile (WhatsApp) Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div id="profile-city" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City Location *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-semibold"
                    >
                      <option value="">-- Select City in Pakistan --</option>
                      {pakistaniCities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div id="profile-phone" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter Your Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Hourly Rate & Experience Years Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div id="profile-rate" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Hourly Tuition Fee (PKR) *</span>
                    </label>
                    <div className="relative">
                      <span className="text-[11px] font-bold text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 select-none">PKR</span>
                      <input
                        type="number"
                        min="300"
                        max="25000"
                        step="100"
                        required
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Teaching Experience (Years) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      required
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-[#0c2217] font-bold"
                    />
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

                {tutorProfile?.verificationStatus === 'approved' && (
                  <span className="px-2.5 py-1 bg-[#f0ece1] text-[#0c2217] text-[11px] font-bold rounded-xl flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                    <span>Verified Sanad</span>
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
                <h4 className="text-xs font-bold text-slate-700">Uploaded Sanad & Degree Documents ({uploadedSanads.length})</h4>
                
                {uploadedSanads.length === 0 ? (
                  <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 space-y-1">
                    <FileText className="w-6 h-6 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">No documents uploaded yet</p>
                    <p className="text-[11px]">Upload your Sanad / Shahada or Academic degree below for verification.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedSanads.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 group hover:bg-[#f0ece1]/40 hover:border-[#d4a359]/40 transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-xs text-slate-900 truncate">{doc.title || 'Sanad / Degree Document'}</p>
                            <span className="text-[10px] text-slate-400">
                              Uploaded {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedSanadModal(true)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0c2217] hover:border-[#d4a359]/40 shadow-2xs transition-colors cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
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
    <Suspense fallback={<LoadingSpinner text="Loading tutor profile settings..." />}>
      <TutorProfileContent />
    </Suspense>
  );
}
