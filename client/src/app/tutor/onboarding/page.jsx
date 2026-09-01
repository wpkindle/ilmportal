'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { BookOpen, ShieldCheck, Award, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CustomSelect from '../../../components/common/CustomSelect';

export default function TutorOnboardingPage() {
  const { user, updateTutorProfileState } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // Form State
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('male');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [teachingMode, setTeachingMode] = useState('online');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [sanadTitle, setSanadTitle] = useState('Dars-e-Nizami Degree / Certificate');
  const [sanadFile, setSanadFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.getCategories(),
          api.getLocations()
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (locRes.success) setLocations(locRes.locations);
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

  const handleToggleCity = (id) => {
    setSelectedCities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profileRes = await api.updateMyTutorProfile({
        bio,
        gender,
        qualifications,
        experienceYears: Number(experienceYears),
        teachingMode,
        subjects: selectedSubjects,
        cities: selectedCities
      });

      if (profileRes.success) {
        if (sanadFile) {
          const formData = new FormData();
          formData.append('sanad', sanadFile);
          formData.append('title', sanadTitle);
          await api.uploadSanad(formData);
        }

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
            Tutor Onboarding & Sanad Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Complete Your Teaching Profile
          </h1>
          <p className="text-xs text-slate-500">
            Set your subjects, teaching cities, and submit credentials for admin review.
          </p>
        </div>

        {/* Step Tabs Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s ? 'w-12 bg-emerald-600' : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Step 1: Subjects & Disciplines */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Step 1: Select Subjects You Teach</h3>
                <p className="text-xs text-slate-500">Choose one or more Quranic or academic disciplines.</p>
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
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p>{cat.name}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{cat.type}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={selectedSubjects.length === 0}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Next: Bio & Qualifications</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bio & Experience */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Step 2: Teaching Bio & Background</h3>
                <p className="text-xs text-slate-500">Tell students about your qualifications and teaching style.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">About Yourself *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Introduce yourself, your Quran Tajweed mastery, or academic experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-slate-50 border rounded-2xl text-xs text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Degree / Sanad Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shahadat-ul-Alimiyya / M.Sc"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-2xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Mode</label>
                  <CustomSelect
                    options={[
                      { value: 'online', label: 'Online (Live WebRTC)', sublabel: 'In-platform HD Classroom' },
                      { value: 'physical', label: 'In-Person', sublabel: 'Home Tutoring' },
                      { value: 'both', label: 'Both Online & In-Person', sublabel: 'Hybrid Tutoring' }
                    ]}
                    value={teachingMode}
                    onChange={setTeachingMode}
                    variant="filter"
                  />
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
                  type="button"
                  disabled={!bio.trim() || !qualifications.trim()}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Next: Upload Sanad</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sanad Upload */}
          {step === 3 && (
            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Step 3: Upload Sanad / Degree Document</h3>
                <p className="text-xs text-slate-500">Upload an authentic scan of your certificate for admin verification.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={sanadTitle}
                    onChange={(e) => setSanadTitle(e.target.value)}
                    className="w-full p-2 bg-white border rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Certificate File (JPG, PNG, PDF)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setSanadFile(e.target.files[0])}
                    className="text-xs text-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>{loading ? 'Submitting Application...' : 'Complete & Submit'}</span>
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

