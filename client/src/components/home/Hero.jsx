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
  ChevronLeft,
  Home,
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance hero tutoring slider every 5.5s (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

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
                <span>Female-First Safety • Verified Qaris, Alimahs &amp; Academic Tutors</span>
                <ChevronRight className="w-3 h-3 text-[#d4a359] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Main Editorial Headline with Dramatic Contrast */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-[1.12]">
              Verified Qaris, Alimahs &amp; Academic Tutors,{' '}
              <span className="hand-drawn-underline text-[#faf8f5]">safe at home.</span>
            </h1>

            {/* Humanized, Colloquial Pakistani Copy */}
            <p className="text-sm sm:text-base text-[#d1dbd6] max-w-xl leading-relaxed font-normal">
              Designed specifically so female learners, daughters, and mothers feel 100% comfortable and protected. Verified female Alimahs from Wafaq-ul-Madaris, certified Qaris, and top school tutors. 1-on-1 classes with camera-off privacy by default, zero personal phone number sharing, and agreed fees directly with your educator.
            </p>

            {/* Key Assurance Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#2b6e51]/50 text-[#e5f3ec]">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>100% Female Privacy &amp; Comfort</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#2b6e51]/50 text-[#e5f3ec]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#388e6a]" />
                <span>Verified Qaris &amp; Alimahs (Sanad)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#2b6e51]/50 text-[#e5f3ec]">
                <Lock className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Camera-Off by Default</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#2b6e51]/50 text-[#e5f3ec]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Personal Contact Sharing</span>
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

          {/* Right Column (5 cols): Asymmetric Visual Composition with Tutoring Slider */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Quick Segmented Mode Switcher Tabs */}
            <div className="flex items-center justify-center p-1 mb-3.5 bg-[#0c2217]/90 backdrop-blur-md rounded-2xl border border-[#2b6e51]/50 max-w-sm mx-auto shadow-md">
              <button
                type="button"
                onClick={() => setCurrentSlide(0)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentSlide === 0
                    ? 'bg-[#1e543c] text-[#d4a359] shadow-sm border border-[#2b6e51]'
                    : 'text-[#a3b8b0] hover:text-white'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home Tuition</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlide(1)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentSlide === 1
                    ? 'bg-[#1e543c] text-teal-300 shadow-sm border border-teal-500/50'
                    : 'text-[#a3b8b0] hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>WebRTC Video Call</span>
              </button>
            </div>

            {/* Outer Decorative Frame */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Backing warm tone shape */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#1e543c]/40 via-[#d4a359]/20 to-transparent rounded-3xl blur-xl" />

              {/* Main Editorial Card with Dual-Slide Tutoring Carousel */}
              <div
                className="relative rounded-3xl overflow-hidden border-2 border-[#2b6e51]/50 bg-[#07150e] shadow-2xl h-80 sm:h-96 group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Slide 0: Young Female Alimah In-Home Tutoring */}
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    currentSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src="/images/hero-home-tutoring.jpg"
                    alt="Pakistani male tutor in traditional shalwar kameez teaching a young boy student at home with study books and notebooks"
                    className="w-full h-full object-cover filter contrast-[1.02]"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-transparent to-transparent opacity-85" />
                </div>

                {/* Slide 1: WebRTC Video Call Tutoring with Alimah in Naqab */}
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    currentSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src="/images/hero-online-webrtc.jpg"
                    alt="Pakistani girl student attending 1:1 online WebRTC video call with female Alimah in Naqab"
                    className="w-full h-full object-cover filter contrast-[1.02]"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-transparent to-transparent opacity-85" />
                </div>

                {/* Top Left Badge: Mode Tag */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0c2217]/90 backdrop-blur-md border border-[#2b6e51]/60 text-[11px] font-bold text-[#d4a359]">
                  {currentSlide === 0 ? (
                    <>
                      <Home className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>In-Home 1:1 Tuition</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5 text-teal-300" />
                      <span className="text-teal-200">1:1 WebRTC Video</span>
                    </>
                  )}
                </div>

                {/* Top Right: Progress Indicator Dots */}
                <div className="absolute top-3.5 right-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide(0)}
                    className={`h-2 rounded-full transition-all ${currentSlide === 0 ? 'w-5 bg-[#d4a359]' : 'w-2 bg-white/40'}`}
                    aria-label="Slide 1: In-Home Tuition"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentSlide(1)}
                    className={`h-2 rounded-full transition-all ${currentSlide === 1 ? 'w-5 bg-teal-400' : 'w-2 bg-white/40'}`}
                    aria-label="Slide 2: WebRTC Video Call in Naqab"
                  />
                </div>

                {/* Interactive Navigation Arrows */}
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? 1 : 0))}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 z-20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? 1 : 0))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 z-20"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bottom Dynamic Caption */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-[#0c2217]/90 backdrop-blur-md border border-[#2b6e51]/60 text-xs space-y-1 z-20">
                  {currentSlide === 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>1:1 Male Tutor &amp; Boy Student</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#d4a359] bg-[#143d2b] px-2 py-0.5 rounded border border-[#2b6e51]/50">
                          Home Tuition
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a3b8b0] leading-snug">
                        Verified male Qaris &amp; academic tutors visiting your home for focused 1-on-1 Quran, Tajweed &amp; school curriculum tuition.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                          <span>1:1 WebRTC Video Call • Alimah in Naqab</span>
                        </span>
                        <span className="text-[10px] font-mono text-teal-300 bg-[#0c2e22] px-2 py-0.5 rounded border border-teal-500/40">
                          Naqab &amp; Privacy
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a3b8b0] leading-snug">
                        Direct in-browser WebRTC encrypted classroom with female Alimah in Naqab, camera-off comfort &amp; interactive digital Quran recitation.
                      </p>
                    </>
                  )}
                </div>
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

            {/* Feature 2: Female Safety & Comfort */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#2b6e51]/40 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <Heart className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Female Safety &amp; Comfort</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                Camera-off by default, verified female Alimahs for daughters, and private messaging with zero personal numbers shared.
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
