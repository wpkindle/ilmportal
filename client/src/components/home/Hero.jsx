'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Video,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Heart,
  Lock
} from 'lucide-react';
import AnimatedHeroBackground from './AnimatedHeroBackground';
import CustomSelect from '../common/CustomSelect';
import { api } from '../../services/api';

const initialTutorCities = [
  { value: '', label: 'All Cities (Pakistan)', sublabel: 'Nationwide & Online' },
  { value: 'Lahore', label: 'Lahore', sublabel: 'Punjab' },
  { value: 'Karachi', label: 'Karachi', sublabel: 'Sindh' },
  { value: 'Islamabad', label: 'Islamabad', sublabel: 'Capital Territory' },
  { value: 'Rawalpindi', label: 'Rawalpindi', sublabel: 'Punjab' },
  { value: 'Peshawar', label: 'Peshawar', sublabel: 'Khyber Pakhtunkhwa' },
  { value: 'Hyderabad', label: 'Hyderabad', sublabel: 'Sindh' },
  { value: 'Abbottabad', label: 'Abbottabad', sublabel: 'KPK' },
  { value: 'Mardan', label: 'Mardan', sublabel: 'KPK' },
  { value: 'Faisalabad', label: 'Faisalabad', sublabel: 'Punjab' }
];

const Hero = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState(initialTutorCities);

  // Fetch active tutors and dynamically build the list of available tutor cities
  useEffect(() => {
    const fetchTutorCities = async () => {
      try {
        const res = await api.getPublicTutors();
        if (res.success && res.tutors?.length) {
          const cityMap = new Map();
          res.tutors.forEach((t) => {
            if (t.user?.city) {
              cityMap.set(t.user.city, {
                value: t.user.city,
                label: t.user.city,
                sublabel: 'Available Tutors'
              });
            }
            if (t.cities && Array.isArray(t.cities)) {
              t.cities.forEach((c) => {
                const cityName = c.name || c;
                const provName = c.province || 'Available Tutors';
                if (cityName) {
                  cityMap.set(cityName, {
                    value: cityName,
                    label: cityName,
                    sublabel: provName
                  });
                }
              });
            }
          });

          if (cityMap.size > 0) {
            setAvailableCities([
              { value: '', label: 'All Cities (Pakistan)', sublabel: 'Nationwide & Online' },
              ...Array.from(cityMap.values())
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching tutor cities:', err);
      }
    };

    fetchTutorCities();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCity) params.append('city', selectedCity);
    router.push(`/tutors?${params.toString()}`);
  };

  const quickSubjects = [
    { label: 'Tajweed al-Quran', slug: 'tajweed-al-quran' },
    { label: 'Noorani Qaida', slug: 'noorani-qaida' },
    { label: 'Hifz Memorization', slug: 'hifz-al-quran' },
    { label: 'O-Level Physics/Math', slug: 'o-level-cambridge' },
    { label: 'FSc Pre-Medical', slug: 'fsc-hssc' },
    { label: 'MDCAT Test Prep', slug: 'mdcat-ecat' }
  ];

  return (
    <section className="relative overflow-hidden min-h-[640px] flex items-center justify-center bg-slate-950 text-white pt-16 pb-20 sm:pt-20 sm:pb-28">
      
      {/* Dynamic Animated Motion Background */}
      <AnimatedHeroBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        
        {/* Top Trust Pill */}
        <div className="flex items-center justify-center mb-6">
          <Link
            href="/safety"
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-2xl backdrop-blur-md transition-all cursor-pointer"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Pakistan’s #1 Protected Quran &amp; Academic LMS</span>
            <span className="hidden sm:inline text-emerald-500">&bull;</span>
            <span className="hidden sm:inline text-white font-medium">SSL Encrypted &amp; Female Privacy Guaranteed</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
          </Link>
        </div>

        {/* Main Heading */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight drop-shadow-md">
            Learn Safely, Learn Confidently with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">Verified Pakistani Tutors</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal">
            A protected learning sanctuary for Pakistani families. Connect with Sanad-certified Quran teachers, verified female Alimahs, and Cambridge/Matric academic coaches with camera privacy and encrypted 1:1 live classrooms.
          </p>

          {/* Trust & Security Signals */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% ID &amp; Sanad Verified Tutors</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 shadow-xs">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Female Safe-Room Verified</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>256-Bit E2EE Classroom</span>
            </span>
          </div>
        </div>

        {/* Hero Search Bar with Drop-Up Custom Select */}
        <div className="mt-8 max-w-3xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white/95 backdrop-blur-2xl p-2 sm:p-2.5 rounded-3xl sm:rounded-full shadow-2xl shadow-emerald-950/60 border border-white/30 flex flex-col sm:flex-row items-center gap-2 transition-all hover:border-emerald-400/60"
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 sm:py-1 w-full sm:w-1/2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search subject, e.g. Tajweed, Noorani Qaida, Physics, O-Level..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none"
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            {/* City Dropdown (Opens Above with Clean Left-Aligned List of Active Tutor Cities) */}
            <div className="w-full sm:w-1/3">
              <CustomSelect
                options={availableCities}
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder="All Cities (Pakistan)"
                icon={MapPin}
                searchable={true}
                variant="hero"
                placement="top"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-2xl sm:rounded-full shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Find Tutors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Topic Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/tutors?gender=female"
              className="px-3.5 py-1.5 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold border border-emerald-400/50 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Female Tutors &amp; Alimahs</span>
            </Link>
            <span className="text-slate-400 text-xs font-semibold mr-1">Popular:</span>
            {quickSubjects.map((sub) => (
              <Link
                key={sub.slug}
                href={`/tutors?category=${sub.slug}`}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-xs font-medium border border-white/10 transition-all"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Dual Role Gateway Action Cards */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-3.5 max-w-2xl mx-auto">
          {/* Student Portal Card */}
          <Link
            href="/register/student"
            className="w-full sm:w-1/2 group relative p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-950/90 hover:from-emerald-900/90 hover:to-slate-900 border border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-950/40 transition-all duration-200 flex items-center gap-3.5 text-left backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Students &amp; Parents</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">Free Trial</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white group-hover:text-emerald-100 transition-colors truncate">
                Find a Tutor &amp; Learn
              </p>
              <p className="text-[10px] text-slate-400 truncate">1:1 Live Video or Home Tutoring</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center text-slate-400 group-hover:text-emerald-300 transition-colors shrink-0">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Tutor Portal Card */}
          <Link
            href="/register/tutor"
            className="w-full sm:w-1/2 group relative p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/90 to-teal-950/70 hover:from-slate-850 hover:to-teal-900/80 border border-slate-700/80 hover:border-teal-400/60 shadow-xl shadow-slate-950/50 transition-all duration-200 flex items-center gap-3.5 text-left backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">Qaris &amp; Teachers</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">Sanad</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white group-hover:text-teal-100 transition-colors truncate">
                Join as Verified Tutor
              </p>
              <p className="text-[10px] text-slate-400 truncate">Teach Students &amp; Earn Online</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-teal-500/20 flex items-center justify-center text-slate-400 group-hover:text-teal-300 transition-colors shrink-0">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 4 Feature Highlights Grid with 3D Depth & Hover Elevation */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-emerald-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-emerald-500/20 group-hover:bg-emerald-500/30 text-emerald-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">Sanad Verified Tutors</h3>
            <p className="text-[11px] text-slate-400 leading-tight">Authentic Dars-e-Nizami &amp; degree certificates verified by admin</p>
          </div>

          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-blue-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-blue-500/20 group-hover:bg-blue-500/30 text-blue-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-300 transition-colors">In-Platform Video</h3>
            <p className="text-[11px] text-slate-400 leading-tight">100% on-platform WebRTC HD video, screen sharing &amp; digital Quran viewer</p>
          </div>

          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-amber-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">Flexible Rates</h3>
            <p className="text-[11px] text-slate-400 leading-tight">Directly coordinate custom schedules and agreed rates in 1:1 chat</p>
          </div>

          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-purple-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-300 transition-colors">All Pakistan</h3>
            <p className="text-[11px] text-slate-400 leading-tight">Online classes and verified in-person home tutoring across all provinces</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
