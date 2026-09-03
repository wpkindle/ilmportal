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
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Tutor Onboarding & Subjects Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Configure Your Teaching Subjects
          </h1>
          <p className="text-xs text-slate-500">
            Set your teaching disciplines, experience, and hourly rates to start receiving student bookings.
          </p>
        </div>

        {/* Step Tabs Indicator (2 Steps Only) */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s ? 'w-16 bg-emerald-600' : 'w-6 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Step 1: Subjects & Disciplines */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Step 1: Select Subjects You Teach</h3>
                <p className="text-xs text-slate-500">Choose all the Quranic and academic subjects you offer.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
                {categories.map((cat) => {
                  const isChecked = selectedSubjects.includes(cat._id);
                  return (
                    <div
                      key={cat._id}
                      onClick={() => handleToggleSubject(cat._id)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="flex items-center justify-between">
                        <span>{cat.name}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </p>
                      <span className="text-[10px] text-slate-400 capitalize">{cat.type}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-emerald-700">
                  {selectedSubjects.length} Subject{selectedSubjects.length !== 1 ? 's' : ''} Selected
                </span>
                <button
                  type="button"
                  disabled={selectedSubjects.length === 0}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 flex items-center gap-1.5 transition-all"
                >
                  <span>Next: Bio & Hourly Rate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Teaching Bio, Experience, Hourly Rate & Finalize */}
          {step === 2 && (
            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Step 2: Teaching Bio & Rates</h3>
                <p className="text-xs text-slate-500">Set your bio, experience, and hourly rate for student bookings.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Bio / Introduction *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Introduce yourself, your Quran Tajweed mastery, or academic experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Degree Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shahadat-ul-Alimiyya"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hourly Rate (PKR)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Teaching Mode</label>
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
                                ? prev  // keep at least one
                                : prev.filter(v => v !== m.value)
                              : [...prev, m.value]
                          )
                        }
                        className={`flex flex-col items-start gap-0.5 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          active
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl ${active ? 'bg-emerald-200/60 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold mt-1">{m.label}</span>
                        <span className="text-[10px] opacity-70">{m.sub}</span>
                        {active && (
                          <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full mt-1 flex items-center gap-1">
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
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Sanad & Degree Documents Attached</p>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    Your credentials uploaded during registration have been saved and sent to platform administrators for verification.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !bio.trim()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-all"
                >
                  <span>{loading ? 'Finalizing Profile...' : 'Complete & Go to Dashboard'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
