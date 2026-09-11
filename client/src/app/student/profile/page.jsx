'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  ArrowLeft,
  Sparkles,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Globe,
  BookOpen,
  Calendar,
  GraduationCap,
  Star
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { api } from '../../../services/api';
import ProfileCompletionMeter from '../../../components/common/ProfileCompletionMeter';
import AccountStatusBanner from '../../../components/common/AccountStatusBanner';
import DeleteAccountModal from '../../../components/common/DeleteAccountModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SafetyReportsSection from '../../../components/profile/SafetyReportsSection';
import { allPakistaniCities, pakistaniCityAreas } from '../../../data/pakistanAreas';
import CustomSelect, { StyledNativeSelect } from '../../../components/common/CustomSelect';
import LeaveReviewModal from '../../../components/common/LeaveReviewModal';

const pakistaniCities = allPakistaniCities;

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const isVerifiedNotice = searchParams.get('verified') === 'true';
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const { isConnected } = useSocket();

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('');
  const [tuitionMode, setTuitionMode] = useState('both');

  // History & Reviews State
  const [tuitionHistory, setTuitionHistory] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [reviewModalDeal, setReviewModalDeal] = useState(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI Status State
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync state with current user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      const uCity = user.city || '';
      const uArea = user.area || '';
      setCity(uCity);
      setArea(uArea);
      if (uCity && uArea && pakistaniCityAreas[uCity] && !pakistaniCityAreas[uCity].includes(uArea)) {
        setIsCustomArea(true);
      }
      setGender(user.gender || '');
      setAge(user.age ? String(user.age) : '');
      setAvatar(user.avatar || '');
      setTuitionMode(user.tuitionMode || user.preferredMode || 'both');
    }
  }, [user]);

  // Fetch tuition history and reviews
  useEffect(() => {
    if (user) {
      Promise.all([
        api.getMyDeals().catch(() => ({ success: false, deals: [] })),
        api.getMyReviews().catch(() => ({ success: false, reviews: [] }))
      ]).then(([dealsRes, reviewsRes]) => {
        if (dealsRes?.success && dealsRes.deals) setTuitionHistory(dealsRes.deals);
        if (reviewsRes?.success && reviewsRes.reviews) setReviewsList(reviewsRes.reviews);
        setLoadingHistory(false);
      });
    }
  }, [user]);

  // Handle Avatar Image File Upload
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
      setProfileSuccess('Profile picture selected! Click "Save Changes" below to save.');
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Details
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Student name is required');
      setSavingProfile(false);
      return;
    }

    if (age && (Number(age) < 3 || Number(age) > 100)) {
      setProfileError('Please enter a valid age between 3 and 100');
      setSavingProfile(false);
      return;
    }

    try {
      const res = await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        city,
        area: area.trim(),
        gender,
        age: age ? Number(age) : undefined,
        avatar,
        tuitionMode,
        preferredMode: tuitionMode
      });

      if (res.success) {
        setProfileSuccess('Profile settings updated successfully!');
        setTimeout(() => setProfileSuccess(''), 4000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile settings');
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
      setPasswordError('New password must be at least 6 characters long');
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
    return <LoadingSpinner />;
  }

  return (
    <div className="py-8 bg-[#faf8f5] min-h-screen text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/student/dashboard" className="hover:text-[#0c2217] font-semibold flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Student Portal</span>
              </Link>
              <span>/</span>
              <span className="text-stone-800 font-semibold">Profile Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Account &amp; Profile Settings
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Manage your personal information, contact details, profile picture, and security.
            </p>
          </div>

          <Link
            href="/student/dashboard"
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
                <span className="text-[10px] bg-[#0c2217] text-[#faf8f5] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                Welcome to IlmiDunya Pakistan! Your account is active and verified. Please complete your profile details below (such as City, Gender, Age, and Profile Picture) to get the best tutoring experience.
              </p>
            </div>
          </div>
        )}

        {/* Account Status / Warnings / Review Banner */}
        <AccountStatusBanner user={user} role="student" />

        {/* Dynamic Profile Completion Meter Widget */}
        <ProfileCompletionMeter user={user} showGreeting={false} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar & Quick Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#e6dfd5] shadow-xs text-center space-y-4">
              <div id="profile-avatar" className="relative inline-block mx-auto scroll-mt-28">
                <img
                  src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=0c2217&color=faf8f5&size=200`}
                  alt={name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#eef5f0] shadow-md mx-auto"
                />

                {/* Real-time Online / Offline Indicator Dot */}
                {isConnected ? (
                  <span
                    className="absolute top-1 right-1 flex h-5 w-5 z-10"
                    title="Active / Online Now"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white shadow-sm"></span>
                  </span>
                ) : (
                  <span
                    className="absolute top-1 right-1 inline-flex rounded-full h-5 w-5 bg-stone-400 border-2 border-white shadow-sm z-10"
                    title="Offline"
                  />
                )}
                
                {/* Upload Button overlay */}
                <label className="absolute bottom-0 right-0 p-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-105 z-10">
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
                <h3 className="font-bold text-sm text-slate-900">{name || 'Student Name'}</h3>
                {user?.username && <p className="text-[11px] font-mono font-bold text-[#b85d34]">@{user.username}</p>}
                <p className="text-xs text-slate-500">{email || 'student@example.com'}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0ece1] text-[#0c2217]">
                    Student Account
                  </span>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online Now</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                      <span>Offline</span>
                    </span>
                  )}
                  {user?.isVerified && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>Email Verified</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gender:</span>
                  <span className="font-bold capitalize">{gender || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-bold">{age ? `${age} Years` : 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">City &amp; Area:</span>
                  <span className="font-bold">{city ? `${city}${area ? ` (${area})` : ''}` : 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tuition Mode:</span>
                  <span className="font-black text-[#0c2217] bg-[#f0ece1] px-2 py-0.5 rounded-md text-[11px] border border-[#d4a359]/40">
                    {tuitionMode === 'both' ? 'Online & In-Person' : tuitionMode === 'in_person' ? 'In-Person Only' : 'Online Only'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Joined Date:</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#d4a359]" />
                    <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified Member'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Personal Information & Password Forms */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            
            {/* 1. Personal Information Form */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#b85d34]" />
                  <span>Personal Details &amp; Profile</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your name, city, local area, age, and identity details.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
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
                    placeholder="e.g. Abdullah Khan"
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
                    <CustomSelect
                      options={[
                        { value: 'male', label: 'Male', sublabel: 'Male Student' },
                        { value: 'female', label: 'Female', sublabel: 'Female Student' },
                        { value: 'other', label: 'Other' }
                      ]}
                      value={gender}
                      onChange={(val) => setGender(val)}
                      placeholder="Select Gender..."
                      icon={User}
                      variant="profile"
                    />
                  </div>

                  <div id="profile-age" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Age (Years) *
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="100"
                      required
                      placeholder="e.g. 8"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl text-xs text-slate-900 outline-none focus:bg-white font-bold transition-all shadow-2xs h-[42px]"
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

                {/* City & Local Area Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div id="profile-city" className="scroll-mt-28">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                        setArea('');
                        setIsCustomArea(false);
                      }}
                      placeholder="Select City in Pakistan..."
                      icon={MapPin}
                      searchable={true}
                      variant="profile"
                    />
                  </div>

                  <div id="profile-area" className="scroll-mt-28">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">
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
                              if (!next && !pakistaniCityAreas[city]?.includes(area)) {
                                setArea('');
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
                        value={area}
                        onChange={(val) => {
                          if (val === '__other__') {
                            setIsCustomArea(true);
                            if (pakistaniCityAreas[city]?.includes(area)) {
                              setArea('');
                            }
                          } else {
                            setArea(val);
                          }
                        }}
                        placeholder={`Select Area in ${city}...`}
                        searchable={true}
                        allowCustom={true}
                        variant="profile"
                      />
                    ) : (
                      <div className="space-y-1">
                        <div className="relative flex items-center">
                          <MapPin className="w-4 h-4 text-[#b85d34] absolute left-3.5 pointer-events-none z-10" />
                          <input
                            type="text"
                            placeholder={city ? `General coverage or sector in ${city}...` : 'Enter area name'}
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="w-full pl-10 pr-28 py-2.5 bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl text-xs text-slate-900 font-bold outline-none transition-all shadow-2xs h-[42px]"
                          />
                          {city && pakistaniCityAreas[city] && pakistaniCityAreas[city].length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomArea(false);
                                if (!pakistaniCityAreas[city]?.includes(area)) {
                                  setArea('');
                                }
                              }}
                              className="absolute right-2 px-2.5 py-1 text-[10px] font-bold text-[#b85d34] hover:text-white hover:bg-[#b85d34] rounded-xl border border-[#b85d34]/30 transition-all cursor-pointer shadow-2xs"
                            >
                              Choose from list
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tuition Mode Preference */}
                <div id="profile-tuition-mode" className="scroll-mt-28 space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Preferred Tuition Mode *
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select how you prefer to attend classes. Tutors will see your preference on your student profile.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setTuitionMode('both')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        tuitionMode === 'both'
                          ? 'border-[#0c2217] bg-[#f0ece1] ring-2 ring-[#d4a359]/50 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0c2217]">
                        <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Online &amp; In-Person</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Flexible for both online video lessons &amp; home classes
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTuitionMode('online')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        tuitionMode === 'online'
                          ? 'border-[#0c2217] bg-[#f0ece1] ring-2 ring-[#d4a359]/50 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0c2217]">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>Online Only</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Interactive 1-on-1 audio/video lessons from home
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTuitionMode('in_person')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        tuitionMode === 'in_person'
                          ? 'border-[#0c2217] bg-[#f0ece1] ring-2 ring-[#d4a359]/50 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0c2217]">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>In-Person Only</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Physical / home tutor in your city
                      </p>
                    </button>
                  </div>
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

            {/* 2. Security & Password Change Form */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#b85d34]" />
                  <span>Security & Change Password</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your password to maintain account security.
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

            {/* 3. My Tuition History & Reviews Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#d4a359]" />
                    <span>My Tuitions History &amp; Reviews</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your enrolled courses, tuition deals, and tutor feedback history.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/30">
                    {tuitionHistory.length} {tuitionHistory.length === 1 ? 'Tuition' : 'Tuitions'}
                  </span>
                </div>
              </div>

              {/* Tuitions History List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Tuition Records</span>
                </h3>

                {/* Pending Reviews Alert Banner */}
                {tuitionHistory.some((d) => d.status === 'completed' && !d.isReviewed) && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">
                          Course Completed &bull; Review Your Tutor
                        </h4>
                        <p className="text-[11px] text-stone-600">
                          Your tutor has marked the course as completed. Please share your rating and review to support their profile.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const target = tuitionHistory.find((d) => d.status === 'completed' && !d.isReviewed);
                        if (target) setReviewModalDeal(target);
                      }}
                      className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Leave Review</span>
                    </button>
                  </div>
                )}

                {loadingHistory ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading tuition history...</div>
                ) : tuitionHistory.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tuitionHistory.map((deal) => (
                      <div key={deal._id} className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-black text-xs text-slate-900 truncate">
                              {deal.subject || 'Quran / Academic Tuition'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {deal.tutor?.name ? `Tutor: ${deal.tutor.name}` : 'Tutor Assigned'}
                            </p>
                          </div>
                          {deal.status === 'completed' ? (
                            deal.isReviewed ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Reviewed ★★★★★</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReviewModalDeal(deal)}
                                className="px-2.5 py-1 bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-[10.5px] font-bold rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
                                title="Leave review for this tutor"
                              >
                                <Star className="w-3 h-3 fill-white text-white" />
                                <span>Leave Review</span>
                              </button>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white border border-[#d4a359]/40 text-[#0c2217] shrink-0">
                              {deal.status ? deal.status.replace(/_/g, ' ') : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-[#ebe3d3]">
                          <span className="font-semibold text-[#0c2217]">
                            {deal.mode === 'in_person' || deal.mode === 'physical' ? 'In-Person (Home)' : 'Online WebRTC'}
                          </span>
                          <span>
                            {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                          </span>
                        </div>
                        {deal.status === 'completed' && !deal.isReviewed && (
                          <div className="pt-2 border-t border-[#ebe3d3] flex items-center justify-between">
                            <span className="text-[10.5px] text-amber-900 font-medium">Course completed! Rate your tutor</span>
                            <button
                              type="button"
                              onClick={() => setReviewModalDeal(deal)}
                              className="text-xs font-bold text-[#b85d34] hover:text-[#9e4e2a] underline cursor-pointer"
                            >
                              Write Review &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center space-y-2">
                    <p>No active or previous tuitions yet.</p>
                    <Link
                      href="/tutors"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#b85d34] hover:underline"
                    >
                      <span>Find a Verified Quran / Academic Tutor &rarr;</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Reviews &amp; Ratings ({reviewsList.length})</span>
                </h3>

                {loadingHistory ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading reviews...</div>
                ) : reviewsList.length > 0 ? (
                  <div className="space-y-2.5">
                    {reviewsList.map((rev) => (
                      <div key={rev._id} className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= (rev.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                              />
                            ))}
                            <span className="font-black text-slate-900 ml-1 text-xs">{rev.rating || 5}.0</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </span>
                        </div>
                        {rev.comment && (
                          <p className="text-slate-700 italic text-xs leading-relaxed">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        )}
                        {rev.tutor?.name && (
                          <p className="text-[10px] text-slate-500 font-medium">
                            Tutor: {rev.tutor.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    No reviews or feedback recorded yet. Once you complete tuition sessions, feedback and ratings will appear here.
                  </p>
                )}
              </div>
            </div>

            {/* 4. Safety Reports & Incident Resolutions */}
            <SafetyReportsSection userRole="student" />

            {/* 4. Danger Zone / Delete Account */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-rose-200 shadow-xs space-y-3.5">
              <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-rose-950 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Danger Zone &mdash; Delete Account</span>
                  </h2>
                  <p className="text-xs text-rose-700/80 mt-0.5">
                    Permanently remove your account and all enrolled student records.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Deleting your account will erase your profile information, chat histories, active course deals, and learning progress records. This action cannot be reversed.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete My Account</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          role="student"
          userName={name}
        />
      )}

      {/* Student Leave Review Modal */}
      {reviewModalDeal && (
        <LeaveReviewModal
          isOpen={!!reviewModalDeal}
          onClose={() => setReviewModalDeal(null)}
          deal={reviewModalDeal}
          tutor={reviewModalDeal.tutor}
          onSuccess={(newReview) => {
            setTuitionHistory((prev) =>
              prev.map((d) => (d._id === reviewModalDeal._id ? { ...d, isReviewed: true, studentReview: newReview } : d))
            );
            api.getMyReviews().then((r) => {
              if (r?.success && r.reviews) setReviewsList(r.reviews);
            });
          }}
        />
      )}

    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudentProfileContent />
    </Suspense>
  );
}

