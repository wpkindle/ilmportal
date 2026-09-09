'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import {
  BookOpen,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Video,
  Home,
  Check,
  MapPin,
  GraduationCap,
  User,
  Compass
} from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CustomSelect, { StyledNativeSelect } from '../../../components/common/CustomSelect';
import { allPakistaniCities, pakistaniCityAreas } from '../../../data/pakistanAreas';

export default function TutorOnboardingPage() {
  const { user, updateTutorProfileState } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // Form State
  const [bio, setBio] = useState('Assalam-o-Alaikum! I am committed to high quality Quranic and academic teaching for students.');
  const [gender, setGender] = useState('male');
  const [tutoringType, setTutoringType] = useState('both'); // 'quran' | 'academic' | 'both'
  const [qualifications, setQualifications] = useState('Dars-e-Nizami / Master Degree');
  const [experienceYears, setExperienceYears] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [city, setCity] = useState('Lahore');
  const [localArea, setLocalArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [teachingModes, setTeachingModes] = useState(['online']);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.gender) setGender(user.gender);
      if (user.city) setCity(user.city);
      if (user.area) {
        setLocalArea(user.area);
        if (user.city && pakistaniCityAreas[user.city] && !pakistaniCityAreas[user.city].includes(user.area)) {
          setIsCustomArea(true);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes, profileRes] = await Promise.all([
          api.getCategories(),
          api.getLocations(),
          api.getMyTutorProfile().catch(() => ({ success: false }))
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (locRes.success) setLocations(locRes.locations || []);

        if (profileRes.success && profileRes.profile) {
          const p = profileRes.profile;
          if (p.bio) setBio(p.bio);
          if (p.gender) setGender(p.gender);
          if (p.tutoringType) setTutoringType(p.tutoringType);
          if (p.city) setCity(p.city);
          if (p.localArea) {
            setLocalArea(p.localArea);
            if (p.city && pakistaniCityAreas[p.city] && !pakistaniCityAreas[p.city].includes(p.localArea)) {
              setIsCustomArea(true);
            }
          }
          if (p.qualifications) setQualifications(p.qualifications);
          if (p.experienceYears !== undefined && p.experienceYears !== null) {
            setExperienceYears(p.experienceYears);
          }
          if (p.hourlyRate) setHourlyRate(p.hourlyRate);
          if (p.subjects) setSelectedSubjects(p.subjects.map(s => s._id || s));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleToggleSubject = (id) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profileRes = await api.updateMyTutorProfile({
        bio: bio.trim(),
        gender,
        tutoringType,
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        city: city.trim(),
        localArea: localArea.trim(),
        area: localArea.trim(),
        teachingModes,
        subjects: selectedSubjects,
        cities: selectedCities
      });

      if (profileRes.success) {
        updateTutorProfileState(profileRes.profile);
        router.push('/tutor/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner />;

  return (
    <div className="py-12 min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a359] bg-[#143d2b] border border-[#d4a359]/40 px-3 py-1 rounded-full">
            Faculty Onboarding &amp; Subjects Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2217] tracking-tight">
            Configure Your Teaching Disciplines
          </h1>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Set your teaching disciplines, qualifications, and teaching mode to start receiving student inquiries.
          </p>
        </div>

        {/* Step Tabs Indicator (2 Steps Only) */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s ? 'w-16 bg-[#0c2217]' : 'w-6 bg-[#e6dfd5]'
              }`}
            />
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#e6dfd5] shadow-xl shadow-[#0c2217]/5 space-y-6">
          {error && (
            <div className="p-3.5 bg-[#b85d34]/10 text-[#b85d34] border border-[#b85d34]/30 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Step 1: Subjects & Disciplines */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#0c2217]">Step 1: Teaching Discipline &amp; Gender</h3>
                <p className="text-xs text-stone-600">Select your tutoring specialization and subjects to help students find you.</p>
              </div>

              {/* Gender & Tutoring Specialization Selection */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6ded1] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gender */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#b85d34]" />
                      <span>Your Gender *</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'female', label: 'Female', sub: 'Alimah / Teacher' },
                        { val: 'male', label: 'Male', sub: 'Qari / Teacher' }
                      ].map((g) => (
                        <button
                          key={g.val}
                          type="button"
                          onClick={() => setGender(g.val)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            gender === g.val
                              ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                              : 'bg-white text-stone-700 border-[#e6ded1] hover:border-stone-400'
                          }`}
                        >
                          <p className="text-xs font-bold">{g.label}</p>
                          <p className={`text-[10px] ${gender === g.val ? 'text-[#d4a359]' : 'text-stone-500'}`}>{g.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Teaching Discipline */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#0c2217]" />
                      <span>Primary Discipline *</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 'quran', label: 'Quranic', sub: 'Nazra/Hifz' },
                        { val: 'academic', label: 'Academic', sub: 'School/Board' },
                        { val: 'both', label: 'Both', sub: 'All Fields' }
                      ].map((t) => (
                        <button
                          key={t.val}
                          type="button"
                          onClick={() => setTutoringType(t.val)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            tutoringType === t.val
                              ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-xs font-bold'
                              : 'bg-white text-stone-700 border-[#e6ded1] hover:border-stone-400'
                          }`}
                        >
                          <p className="text-[11px] font-bold">{t.label}</p>
                          <p className={`text-[9px] ${tutoringType === t.val ? 'text-white/90' : 'text-stone-400'}`}>{t.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Faculty Role Identity Preview */}
                <div className="pt-2 border-t border-[#ebe3d3] flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="text-[11px] text-stone-600 font-medium">Faculty Role Designation:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#d4a359]/50 text-[#0c2217] shadow-2xs">
                    {gender === 'female' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                        <span>
                          {tutoringType === 'quran'
                            ? 'Verified Female Alimah / Quran Faculty'
                            : tutoringType === 'academic'
                            ? 'Verified Female Academic Faculty'
                            : 'Verified Female Faculty (Quran & Academic)'}
                        </span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-3.5 h-3.5 text-[#0c2217]" />
                        <span>
                          {tutoringType === 'quran'
                            ? 'Male Quran Faculty / Qari'
                            : tutoringType === 'academic'
                            ? 'Male Academic Faculty'
                            : 'Male Faculty (Quran & Academic)'}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Subject Selection List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-serif font-bold text-[#0c2217]">
                    Select Subjects You Teach *
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {selectedSubjects.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1 custom-scrollbar">
                  {categories
                    .filter((cat) => {
                      if (tutoringType === 'quran') return cat.type === 'quran';
                      if (tutoringType === 'academic') return cat.type === 'academic';
                      return true;
                    })
                    .map((cat) => {
                      const isChecked = selectedSubjects.includes(cat._id);
                      return (
                        <div
                          key={cat._id}
                          onClick={() => handleToggleSubject(cat._id)}
                          className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#faf8f5] border-2 border-[#0c2217] text-[#0c2217] font-bold shadow-xs'
                              : 'bg-[#faf8f5]/60 border-[#e6dfd5] text-stone-700 hover:border-stone-400 hover:bg-white'
                          }`}
                        >
                          <p className="flex items-center justify-between">
                            <span className="font-serif text-[13px]">{cat.name}</span>
                            {isChecked && <CheckCircle2 className="w-4 h-4 text-[#0c2217]" />}
                          </p>
                          <span className="text-[10px] text-stone-500 capitalize">{cat.type === 'quran' ? 'Quranic Science' : 'Academic Program'}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#e6dfd5]">
                <span className="text-xs font-serif font-bold text-[#0c2217]">
                  {selectedSubjects.length} Subject{selectedSubjects.length !== 1 ? 's' : ''} Selected
                </span>
                <button
                  type="button"
                  disabled={selectedSubjects.length === 0}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs rounded-2xl shadow-lg shadow-[#0c2217]/20 disabled:opacity-40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Next: Bio &amp; Location</span>
                  <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Teaching Bio, Experience, Location & Finalize */}
          {step === 2 && (
            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#0c2217]">Step 2: Bio, Experience &amp; Location</h3>
                <p className="text-xs text-stone-600">Provide details for student discovery and tuition requests.</p>
              </div>

              <div>
                <label className="text-xs font-serif font-bold text-[#0c2217] block mb-1">Teaching Bio / Introduction *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Introduce yourself, your Quran Tajweed mastery, or academic experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:bg-white focus:border-[#0c2217] focus:ring-1 focus:ring-[#0c2217]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-serif font-bold text-[#0c2217] block mb-1">Degree Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shahadat-ul-Alimiyya / BS"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-serif font-bold text-[#0c2217] block">Experience (Years) *</label>
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
                      <span>{Number(experienceYears) === 0 ? 'Fresh Selected' : 'Choose Fresh (0 yrs)'}</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] font-bold outline-none focus:border-[#0c2217] focus:bg-white"
                  />
                  {Number(experienceYears) === 0 && (
                    <p className="text-[10px] text-[#b85d34] font-semibold mt-1">
                      Registered as Fresh / Beginner Tutor (&lt; 1 Year experience).
                    </p>
                  )}
                </div>
              </div>

              {/* City & Local Area Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-serif font-bold text-[#0c2217] block">
                    City &amp; Local Area (Pakistan) *
                  </label>
                  {city && (
                    <span className="text-[10px] font-semibold text-stone-500">
                      {city}{localArea ? ` • ${localArea}` : ''}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">City Location *</label>
                    <CustomSelect
                      options={allPakistaniCities.map((c) => ({
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
                      placeholder="Select City..."
                      icon={MapPin}
                      searchable={true}
                      variant="profile"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Local Area / Sector {city ? `in ${city}` : ''}
                      </label>
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
                          className="text-[10px] font-bold text-[#b85d34] hover:text-[#913d16] hover:underline cursor-pointer"
                        >
                          {isCustomArea ? 'Choose from list' : '+ Other Area'}
                        </button>
                      )}
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
                      <div className="space-y-1">
                        <div className="relative flex items-center">
                          <MapPin className="w-4 h-4 text-[#b85d34] absolute left-3.5 pointer-events-none z-10" />
                          <input
                            type="text"
                            placeholder={city ? `Coverage or sector in ${city}...` : 'Enter local area name'}
                            value={localArea}
                            onChange={(e) => setLocalArea(e.target.value)}
                            className="w-full pl-10 pr-28 py-2.5 bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl text-xs text-slate-900 font-bold outline-none transition-all shadow-2xs h-[42px]"
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
                              Choose from list
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#b85d34] tracking-wider block">
                    Tuition Fee Model
                  </span>
                  <p className="text-xs font-serif font-bold text-[#0c2217] mt-0.5">
                    Direct Agreement with Students
                  </p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    No fixed hourly pricing. You mutually agree on fee and schedule directly with the student or parent.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-serif font-bold text-[#0c2217] block mb-2">Teaching Mode</label>
                <div className="grid grid-cols-2 gap-2.5">
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
                                ? prev  // keep at least one
                                : prev.filter(v => v !== m.value)
                              : [...prev, m.value]
                          )
                        }
                        className={`flex flex-col items-start gap-0.5 p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          active
                            ? 'border-[#0c2217] bg-[#faf8f5] text-[#0c2217] shadow-xs'
                            : 'border-[#e6dfd5] bg-white text-stone-500 hover:border-stone-400'
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl ${active ? 'bg-[#0c2217] text-[#d4a359]' : 'bg-[#f4efe8] text-stone-600'}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-serif font-bold mt-1 text-[#0c2217]">{m.label}</span>
                        <span className="text-[10px] text-stone-500">{m.sub}</span>
                        {active && (
                          <span className="text-[9px] font-bold bg-[#0c2217] text-[#d4a359] px-2 py-0.5 rounded-full mt-1.5 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>Selected</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sanad Already Attached Notice */}
              <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#d4a359]/40 flex items-start gap-2.5 text-xs text-[#0c2217]">
                <ShieldCheck className="w-5 h-5 text-[#d4a359] shrink-0 mt-0.5" />
                <div>
                  <p className="font-serif font-bold text-[#0c2217]">Sanad &amp; Degree Documents Attached</p>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Your credentials uploaded during registration have been saved and sent to platform administrators for verification.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-[#f4efe8] hover:bg-[#eae3d8] border border-[#e6dfd5] rounded-xl text-xs font-bold text-[#0c2217] cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !bio.trim()}
                  className="px-7 py-3 bg-[#b85d34] hover:bg-[#a04e28] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#b85d34]/20 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>{loading ? 'Finalizing Profile...' : 'Complete & Go to Dashboard'}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#faf8f5]" />
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
