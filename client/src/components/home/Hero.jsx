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
  Chrome,
  Camera,
  Award
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import ChromeAppInstallModal from '../common/ChromeAppInstallModal';
import { api } from '../../services/api';

const initialTutorCities = [
  { value: '', label: 'All Cities (Pakistan)', sublabel: 'Nationwide & Online' },
  { value: 'Lahore', label: 'Lahore', sublabel: 'Punjab' },
  { value: 'Karachi', label: 'Karachi', sublabel: 'Sindh' },
  { value: 'Islamabad', label: 'Islamabad', sublabel: 'Capital Territory' },
  { value: 'Rawalpindi', label: 'Rawalpindi', sublabel: 'Punjab' },
  { value: 'Peshawar', label: 'Peshawar', sublabel: 'KPK' },
  { value: 'Hyderabad', label: 'Hyderabad', sublabel: 'Sindh' },
  { value: 'Abbottabad', label: 'Abbottabad', sublabel: 'KPK' },
  { value: 'Mardan', label: 'Mardan', sublabel: 'KPK' },
  { value: 'Faisalabad', label: 'Faisalabad', sublabel: 'Punjab' }
];

export default function Hero() {
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
    { label: 'Cambridge O/A Level', slug: 'o-level-cambridge' },
    { label: 'FSc Pre-Medical', slug: 'fsc-hssc' },
    { label: 'Matric Science', slug: 'matric-ssc-science' }
  ];

  return (
    <section className="relative overflow-hidden bg-[#0c2217] text-[#f5f0e6] pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#143d2b]">
      {/* Editorial Ambient Background Glow & Subtle Texture */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#1e543c]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-[#d4a359]/10 rounded-full blur-[130px] pointer-events-none" />
      
      {/* Geometric arabesque lattice watermark (subtle, dignified) */}
      <div className="absolute inset-0 bg-[radial-gradient(#2b6e51_0.75px,transparent_0.75px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-12">
        
        {/* Asymmetric 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (7 cols): Editorial Typography & Direct Action */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Regional Trust Eyebrow */}
            <div className="flex items-center gap-2">
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#143d2b] hover:bg-[#1e543c] border border-[#2b6e51]/60 text-[#d4a359] text-xs font-bold transition-all shadow-sm group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Verified Qaris &amp; Academic Tutors in Pakistan</span>
                <ChevronRight className="w-3 h-3 text-[#d4a359] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Main Editorial Headline with Dramatic Contrast */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-[1.12]">
              Real Quran teachers &amp; school tutors for your children,{' '}
              <span className="hand-drawn-underline text-[#faf8f5]">right at home.</span>
            </h1>

            {/* Humanized, Colloquial Pakistani Copy */}
            <p className="text-sm sm:text-base text-[#d1dbd6] max-w-xl leading-relaxed font-normal">
              Vetted with CNIC and Sanad certificates. Qualified female Alimahs for daughters. Live 1-on-1 classes with camera-off privacy by default — no crowded tuition centers, no commute, and agreed fees directly with your teacher.
            </p>

            {/* Key Assurance Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#2b6e51]/50 text-[#e5f3ec]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#388e6a]" />
                <span>CNIC &amp; Sanad Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#2b6e51]/50 text-[#e5f3ec]">
                <Lock className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Camera-Off by Default</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#2b6e51]/50 text-[#e5f3ec]">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Female Tutors for Girls &amp; Kids</span>
              </span>
            </div>

            {/* Search Input Box with Warm Parchment Container */}
            <div className="pt-2 max-w-xl">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl border-2 border-[#2b6e51]/40 flex flex-col sm:flex-row items-center gap-2"
              >
                {/* Search Text */}
                <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-1/2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search subject (Tajweed, Math, O-Level...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none"
                  />
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-200" />

                {/* City Selector */}
                <div className="w-full sm:w-1/3">
                  <CustomSelect
                    options={availableCities}
                    value={selectedCity}
                    onChange={setSelectedCity}
                    placeholder="All Pakistan Cities"
                    icon={MapPin}
                    searchable={true}
                    variant="hero"
                    placement="top"
                  />
                </div>

                {/* Terracotta Action Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-lg shadow-[#b85d34]/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <span>Find Tutors</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Topic Chips */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
                <Link
                  href="/tutors?gender=female"
                  className="px-3 py-1 rounded-full bg-[#143d2b] hover:bg-[#1e543c] text-[#d4a359] font-bold border border-[#d4a359]/40 transition-all inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Female Alimahs</span>
                </Link>
                <span className="text-[#81928e] text-xs font-semibold ml-1">Popular:</span>
                {quickSubjects.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/tutors?category=${sub.slug}`}
                    className="px-2.5 py-1 rounded-full bg-[#143d2b]/60 hover:bg-[#1e543c] text-[#d1dbd6] hover:text-white text-xs font-medium border border-[#2b6e51]/40 transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dual Gateway Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-md">
              <Link
                href="/register/student"
                className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-[#2b6e51] hover:bg-[#388e6a] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#388e6a]/40"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Join as Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register/tutor"
                className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-[#143d2b] hover:bg-[#1e543c] text-[#f5f0e6] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#2b6e51]"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                <span>Apply as Tutor</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#81928e]" />
              </Link>
            </div>

            {/* Chrome App Download trigger */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setChromeModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#a3b8b0] hover:text-white transition-colors cursor-pointer"
              >
                <Chrome className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Install IlmPortal App for Chrome / Windows / Android (Free PWA)</span>
              </button>
            </div>

          </div>

          {/* Right Column (5 cols): Asymmetric Visual Composition with Trust Artifacts */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Outer Decorative Frame */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Backing warm tone shape */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#1e543c]/40 via-[#d4a359]/20 to-transparent rounded-3xl blur-xl" />

              {/* Main Editorial Card with Contextual Image */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#2b6e51]/50 bg-[#07150e] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80"
                  alt="Pakistani student learning Quran Tajweed and academic lessons online from home with complete family privacy"
                  className="w-full h-72 sm:h-80 object-cover opacity-90 filter brightness-[0.92] contrast-[1.05]"
                  loading="eager"
                  fetchPriority="high"
                />

                {/* Subtle dark gradient overlay at base */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-transparent to-transparent opacity-80" />

                {/* Bottom Caption within the image card */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-[#0c2217]/90 backdrop-blur-md border border-[#2b6e51]/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live 1:1 Browser Classroom</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#d4a359] bg-[#143d2b] px-2 py-0.5 rounded border border-[#2b6e51]/50">
                      No Zoom Needed
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a3b8b0] leading-snug">
                    Integrated digital Quran, audio playback, interactive whiteboard, and screen sharing right in your browser.
                  </p>
                </div>
              </div>

              {/* Floating Trust Artifact 1: Verified Sanad & CNIC Stamp (Top Right) */}
              <div className="absolute -top-4 -right-3 sm:-right-4 bg-white text-slate-900 p-3 rounded-2xl shadow-xl border border-slate-200 space-y-1 max-w-[200px] transform rotate-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Sanad &amp; CNIC</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Manually verified with Wafaq-ul-Madaris &amp; university credentials.
                </p>
              </div>

              {/* Floating Trust Artifact 2: Camera-Off Privacy Guarantee (Bottom Left) */}
              <div className="absolute -bottom-4 -left-3 sm:-left-4 bg-[#07150e] text-[#f5f0e6] p-3 rounded-2xl shadow-2xl border-2 border-[#2b6e51] space-y-1 max-w-[210px] transform -rotate-1">
                <div className="flex items-center gap-1.5 text-[#d4a359] font-bold text-xs">
                  <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Camera-Off by Default</span>
                </div>
                <p className="text-[10px] text-[#a3b8b0] leading-tight">
                  Student video remains completely disabled unless family chooses otherwise.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Editorial Trust Ledger (Breaking the repetitive 4-card pattern) */}
        <div className="pt-4 border-t border-[#143d2b]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Feature 1: Verification */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#2b6e51]/40 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>100% CNIC &amp; Sanad Audited</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                National ID cards, degrees, and Qirat certificates checked by administration before any tutor is listed.
              </p>
            </div>

            {/* Feature 2: Family Privacy */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#2b6e51]/40 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Family Privacy Protocol</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                Camera off by default, dedicated female tutor gate, and private messaging without exchanging personal numbers.
              </p>
            </div>

            {/* Feature 3: Live Classroom */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#2b6e51]/40 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <Video className="w-4 h-4 shrink-0 text-teal-400" />
                <span>Direct In-Browser Classroom</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                No third-party app downloads. High-definition WebRTC video with page-by-page digital Quran recitation.
              </p>
            </div>

            {/* Feature 4: Transparent Fee */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#2b6e51]/40 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <Sparkles className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Agreed Direct Monthly Rates</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                Chat for free with tutors and agree on fair monthly fees payable via EasyPaisa, JazzCash, or bank transfer.
              </p>
            </div>

          </div>
        </div>

      </div>

      <ChromeAppInstallModal
        isOpen={chromeModalOpen}
        onClose={() => setChromeModalOpen(false)}
      />
    </section>
  );
}
