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
  Lock,
  Chrome,
  Camera,
  Award
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import ChromeAppInstallModal from '../common/ChromeAppInstallModal';
import AnimatedHeroBackground from './AnimatedHeroBackground';
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

const heroSlides = [
  {
    id: 0,
    tabLabel: 'Home (Male 1:1)',
    tabIcon: Home,
    badgeText: '1:1 In-Home • Male Tutors Only',
    badgeIcon: Home,
    badgeColor: 'text-[#d4a359]',
    dotColor: 'bg-[#d4a359]',
    tag: 'Male In-Home Only',
    title: '1:1 Male Qari & Boy Student (Home Tuition)',
    desc: 'In-person 1-on-1 home tuition is exclusively for verified male Qaris and academic tutors visiting your residence.',
    image: '/images/hero-home-tutoring.jpg',
    alt: 'Pakistani male Qari with beard and prayer cap teaching a young boy student the Holy Quran on a wooden rihal at home'
  },
  {
    id: 1,
    tabLabel: 'Alimah (WebRTC)',
    tabIcon: Video,
    badgeText: '100% WebRTC Only • Female Alimahs',
    badgeIcon: Video,
    badgeColor: 'text-[#faf8f5]',
    dotColor: 'bg-[#b85d34]',
    tag: 'Alimah WebRTC Only',
    title: 'Female Alimahs • 100% WebRTC Video Only',
    desc: 'Female Alimahs teach exclusively online via encrypted in-browser WebRTC video calls with camera-off privacy by default. Zero home visits.',
    image: '/images/hero-online-webrtc.jpg',
    alt: 'Pakistani girl student attending 1:1 online WebRTC video call with female Alimah in Naqab'
  },
  {
    id: 2,
    tabLabel: 'Online Quran',
    tabIcon: BookOpen,
    badgeText: 'Interactive Digital Quran WebRTC',
    badgeIcon: BookOpen,
    badgeColor: 'text-[#d4a359]',
    dotColor: 'bg-[#d4a359]',
    tag: 'Digital Classroom',
    title: 'Interactive Online Quran & Tajweed Classroom',
    desc: 'Direct in-browser page-by-page digital Quran recitation, Noorani Qaida articulation points, and tajweed correction on any screen.',
    image: '/images/hero-webrtc-quran.jpg',
    alt: 'Pakistani student with headphones attending online WebRTC Quran recitation class with digital Quran on laptop screen'
  },
  {
    id: 3,
    tabLabel: 'Cambridge Prep',
    tabIcon: GraduationCap,
    badgeText: 'Cambridge & Matric Academic',
    badgeIcon: GraduationCap,
    badgeColor: 'text-[#faf8f5]',
    dotColor: 'bg-[#b85d34]',
    tag: 'O/A Level & STEM',
    title: '1:1 Male Academic Tutor & High-School Student',
    desc: 'Expert male subject specialists visiting your home or teaching online for O/A Level, FSc, and Matric exams in Mathematics, Physics & Sciences.',
    image: '/images/hero-academic-tutoring.jpg',
    alt: 'Pakistani male Cambridge academic tutor guiding a high-school boy student through O/A Level physics and mathematics at study desk'
  }
];

export default function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState(initialTutorCities);
  const [chromeModalOpen, setChromeModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance hero tutoring slider every 3.0s (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
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
      {/* Dynamic Animated Background: Living Aurora, Sacred Geometry, Mouse Spotlight & Stardust */}
      <AnimatedHeroBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-12">
        
        {/* Asymmetric 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (7 cols): Editorial Typography & Direct Action */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Regional Trust Eyebrow */}
            <div className="flex items-center gap-2">
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#143d2b] hover:bg-[#0c2217] border border-[#d4a359]/40 text-[#d4a359] text-xs font-bold transition-all shadow-sm group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Female-First Safety • Verified Qaris, Alimahs &amp; Academic Tutors</span>
                <ChevronRight className="w-3 h-3 text-[#d4a359] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Main Editorial Headline with Dramatic Contrast */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-[1.12]">
              Verified Qaris, Alimahs &amp; Academic Tutors{' '}
              <span className="hand-drawn-underline text-[#faf8f5]">accross Pakistan.</span>
            </h1>

            {/* Humanized, Colloquial Pakistani Copy */}
            <p className="text-sm sm:text-base text-[#d1dbd6] max-w-xl leading-relaxed font-normal">
              Designed specifically for female learners, daughters, and mothers feel 100% comfortable and protected. Verified female Alimahs from Wafaq-ul-Madaris, certified Qaris, and top school tutors. 1-on-1 classes with camera-off privacy by default, zero personal contact sharing, and agreed fees directly with your tutor.
            </p>

            {/* Key Assurance Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#d4a359]/30 text-[#faf8f5]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>100% Female Privacy &amp; Comfort</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#d4a359]/30 text-[#faf8f5]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Verified Qaris &amp; Alimahs (Sanad)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#d4a359]/30 text-[#faf8f5]">
                <Lock className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Camera-Off by Default</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143d2b]/80 border border-[#d4a359]/30 text-[#faf8f5]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Zero Personal Contact Sharing</span>
              </span>
            </div>

            {/* Search Input Box with Warm Parchment Container */}
            <div className="pt-2 max-w-xl">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl border-2 border-[#d4a359]/40 flex flex-col sm:flex-row items-center gap-2"
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
                    className="px-2.5 py-1 rounded-full bg-[#143d2b]/60 hover:bg-[#1e543c] text-[#d1dbd6] hover:text-white text-xs font-medium border border-[#d4a359]/30 transition-colors"
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
                className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#b85d34]/40"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Join as Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register/tutor"
                className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#d4a359]/40"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                <span>Apply as Tutor</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#d4a359]" />
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
                <span>Install IlmiDunya App for Chrome / Windows / Android (Free PWA)</span>
              </button>
            </div>

          </div>

          {/* Right Column (5 cols): Asymmetric Visual Composition with Tutoring Slider */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Quick Segmented Mode Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 mb-3.5 bg-[#0c2217]/90 backdrop-blur-md rounded-2xl border border-[#d4a359]/30 max-w-lg mx-auto shadow-md">
              {heroSlides.map((slide, idx) => {
                const Icon = slide.tabIcon;
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-[#143d2b] text-[#d4a359] shadow-sm border border-[#d4a359]/40'
                        : 'text-[#a3b8b0] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{slide.tabLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Outer Decorative Frame */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Backing warm tone shape */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#143d2b]/40 via-[#d4a359]/20 to-transparent rounded-3xl blur-xl" />

              {/* Main Editorial Card with Multi-Slide Tutoring Carousel */}
              <div
                className="relative rounded-3xl overflow-hidden border-2 border-[#d4a359]/40 bg-[#07150e] shadow-2xl h-80 sm:h-96 group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Slides */}
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover filter contrast-[1.02]"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c2217] via-transparent to-transparent opacity-85" />
                  </div>
                ))}

                {/* Top Left Badge: Mode Tag */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0c2217]/90 backdrop-blur-md border border-[#d4a359]/40 text-[11px] font-bold text-[#d4a359]">
                  {React.createElement(heroSlides[currentSlide].badgeIcon, {
                    className: 'w-3.5 h-3.5 text-[#d4a359]'
                  })}
                  <span>{heroSlides[currentSlide].badgeText}</span>
                </div>

                {/* Top Right: Progress Indicator Dots */}
                <div className="absolute top-3.5 right-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                  {heroSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === idx ? 'w-5 bg-[#d4a359]' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Slide ${idx + 1}: ${slide.tabLabel}`}
                    />
                  ))}
                </div>

                {/* Interactive Navigation Arrows */}
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 z-20 cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 z-20 cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bottom Dynamic Caption */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-[#0c2217]/90 backdrop-blur-md border border-[#d4a359]/40 text-xs space-y-1 z-20 transition-all duration-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${heroSlides[currentSlide].dotColor} animate-pulse shrink-0`} />
                      <span className="truncate">{heroSlides[currentSlide].title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#d4a359] bg-[#143d2b] px-2 py-0.5 rounded border border-[#d4a359]/30 shrink-0">
                      {heroSlides[currentSlide].tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a3b8b0] leading-snug">
                    {heroSlides[currentSlide].desc}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Editorial Trust Ledger (Breaking the repetitive 4-card pattern) */}
        <div className="pt-4 border-t border-[#143d2b]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Feature 1: Verification */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#d4a359]/20 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>100% CNIC &amp; Sanad Audited</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                National ID cards, degrees, and Qirat credentials checked by administration before any tutor is listed.
              </p>
            </div>

            {/* Feature 2: Female Safety & Comfort */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#d4a359]/20 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>Female Safety &amp; Comfort</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                Camera-off by default, verified female Alimahs for daughters, and private messaging with zero personal numbers shared.
              </p>
            </div>

            {/* Feature 3: Live Classroom */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#d4a359]/20 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <Video className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>Direct In-Browser Classroom</span>
              </div>
              <p className="text-xs text-[#a3b8b0] leading-relaxed">
                No third-party app downloads. High-definition WebRTC video with page-by-page digital Quran recitation.
              </p>
            </div>

            {/* Feature 4: Transparent Fee */}
            <div className="p-4 rounded-2xl bg-[#143d2b]/50 border border-[#d4a359]/20 space-y-1">
              <div className="flex items-center gap-2 text-[#d4a359] font-bold text-xs">
                <Sparkles className="w-4 h-4 shrink-0 text-[#b85d34]" />
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
