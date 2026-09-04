'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { BookOpen, ShieldCheck, Award, CheckCircle2, ArrowRight, Sparkles, Video, Home, Check } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CustomSelect from '../../../components/common/CustomSelect';

export default function TutorOnboardingPage() {
  const { user, updateTutorProfileState } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // Form State
  const [bio, setBio] = useState('Assalam-o-Alaikum! I am an experienced tutor committed to high quality Quranic and academic teaching.');
  const [gender, setGender] = useState('male');
  const [qualifications, setQualifications] = useState('Dars-e-Nizami / Master Degree');
  const [experienceYears, setExperienceYears] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [teachingModes, setTeachingModes] = useState(['online']);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

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
          if (profileRes.profile.bio) setBio(profileRes.profile.bio);
          if (profileRes.profile.qualifications) setQualifications(profileRes.profile.qualifications);
          if (profileRes.profile.experienceYears) setExperienceYears(profileRes.profile.experienceYears);
          if (profileRes.profile.hourlyRate) setHourlyRate(profileRes.profile.hourlyRate);
          if (profileRes.profile.subjects) setSelectedSubjects(profileRes.profile.subjects.map(s => s._id || s));
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
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
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

  if (initialLoading) return <LoadingSpinner text="Setting up your tutor onboarding..." />;

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
            Set your teaching disciplines, experience, and hourly rates to start receiving student bookings.
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
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#0c2217]">Step 1: Select Subjects You Teach</h3>
                <p className="text-xs text-stone-600">Choose all the Quranic and academic subjects you offer.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto p-1">
                {categories.map((cat) => {
                  const isChecked = selectedSubjects.includes(cat._id);
                  return (
                    <div
                      key={cat._id}
                      onClick={() => handleToggleSubject(cat._id)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#faf8f5] border-2 border-[#0c2217] text-[#0c2217] font-bold shadow-xs'
                          : 'bg-[#faf8f5]/60 border-[#e6dfd5] text-stone-700 hover:border-stone-400 hover:bg-white'
                      }`}
                    >
                      <p className="flex items-center justify-between">
                        <span className="font-serif text-[13px]">{cat.name}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-[#0c2217]" />}
                      </p>
                      <span className="text-[10px] text-stone-500 capitalize">{cat.type}</span>
                    </div>
                  );
                })}
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
                  <span>Next: Bio &amp; Hourly Rate</span>
                  <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Teaching Bio, Experience, Hourly Rate & Finalize */}
          {step === 2 && (
            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#0c2217]">Step 2: Teaching Bio &amp; Rates</h3>
                <p className="text-xs text-stone-600">Set your bio, experience, and hourly rate for student bookings.</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-serif font-bold text-[#0c2217] block mb-1">Degree Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shahadat-ul-Alimiyya"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] outline-none focus:border-[#0c2217] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-serif font-bold text-[#0c2217] block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] font-bold outline-none focus:border-[#0c2217] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-serif font-bold text-[#0c2217] block mb-1">Hourly Rate (PKR)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl text-xs text-[#0c2217] font-bold outline-none focus:border-[#0c2217] focus:bg-white"
                  />
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
