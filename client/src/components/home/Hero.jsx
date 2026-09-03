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
  Lock,
  Chrome
} from 'lucide-react';
import AnimatedHeroBackground from './AnimatedHeroBackground';
import CustomSelect from '../common/CustomSelect';
import ChromeAppInstallModal from '../common/ChromeAppInstallModal';
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
  const [chromeModalOpen, setChromeModalOpen] = useState(false);

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
            <span>Pakistan&apos;s Trusted Quran &amp; School Platform</span>
            <span className="hidden sm:inline text-emerald-500">&bull;</span>
            <span className="hidden sm:inline text-white font-medium">Safe &amp; Private for Families</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
          </Link>
        </div>

        {/* Main Heading */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight drop-shadow-md">
            Learn Safely from Home with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">Verified Pakistani Tutors</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal">
            Find trusted Quran tutors and school tutors across Pakistan. Safe 1-on-1 live video classes for children, girls, and families with complete privacy.
          </p>

          {/* Trust & Security Signals */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified ID &amp; Certificates</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Female Tutors for Girls &amp; Kids</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Safe &amp; Private Video Classes</span>
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
                placeholder="Search by subject, e.g. Quran, Noorani Qaida, Math, English..."
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
              className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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

        {/* Dual Role Gateway Action Buttons - Clean & Direct */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
          {/* Join as a Student Button */}
          <Link
            href="/register/student"
            className="w-full sm:w-1/2 group relative px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-950/70 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-3 border border-emerald-300/40 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              Join as a Student
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* Join as a Tutor Button */}
          <Link
            href="/register/tutor"
            className="w-full sm:w-1/2 group relative px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-white shadow-xl shadow-slate-950/70 hover:shadow-emerald-900/30 transition-all duration-300 flex items-center justify-center gap-3 border border-white/20 hover:border-emerald-400/50 backdrop-blur-xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              Join as a Tutor
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>

        {/* Chrome App Download Link */}
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setChromeModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-emerald-500/50 text-xs font-bold transition-all shadow-md cursor-pointer group"
          >
            <Chrome className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>Install / Download Chrome App</span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">Free PWA</span>
          </button>
        </div>

        {/* 4 Feature Highlights Grid with 3D Depth & Hover Elevation */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-emerald-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-emerald-500/20 group-hover:bg-emerald-500/30 text-emerald-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">Verified Tutors</h3>
            <p className="text-[11px] text-slate-400 leading-tight">We check every tutor&apos;s ID, degrees, and Quran certificates.</p>
          </div>

          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-blue-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-blue-500/20 group-hover:bg-blue-500/30 text-blue-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-300 transition-colors">Live Video Classes</h3>
            <p className="text-[11px] text-slate-400 leading-tight">Easy 1-on-1 video lessons with screen sharing and digital Quran.</p>
          </div>

          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-amber-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">Fair &amp; Agreed Rates</h3>
            <p className="text-[11px] text-slate-400 leading-tight">Chat for free with tutors and agree on a monthly or hourly fee.</p>
          </div>

          <div className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-purple-500/50 backdrop-blur-xl space-y-1.5 text-center shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transform-gpu hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2.5 bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-300 w-fit mx-auto rounded-xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-300 transition-colors">All Over Pakistan</h3>
            <p className="text-[11px] text-slate-400 leading-tight">Online classes anywhere, plus verified home tutors in major cities.</p>
          </div>
        </div>

      </div>

      <ChromeAppInstallModal
        isOpen={chromeModalOpen}
        onClose={() => setChromeModalOpen(false)}
      />
    </section>
  );
};

export default Hero;
