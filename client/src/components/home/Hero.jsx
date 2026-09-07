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
  UserCheck,
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
    tabLabel: 'Home 1:1',
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
    tabLabel: 'Academic',
    tabIcon: GraduationCap,
    badgeText: 'Playgroup to FSc Academic',
    badgeIcon: GraduationCap,
    badgeColor: 'text-[#faf8f5]',
    dotColor: 'bg-[#b85d34]',
    tag: 'Board & Academic STEM',
    title: '1:1 Male Academic Tutor & High-School Student',
    desc: 'Expert male subject specialists visiting your home or teaching online for Board exams, FSc, and Matric in Mathematics, Physics & Sciences.',
    image: '/images/hero-academic-tutoring.jpg',
    alt: 'Pakistani male academic tutor guiding a high-school boy student through board exam physics and mathematics at study desk'
  },
  {
    id: 2,
    tabLabel: 'Alimah Live',
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
    id: 3,
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
    { label: 'Board Exam Prep', slug: 'board-exam-prep' },
    { label: 'FSc Pre-Medical', slug: 'fsc-hssc' },
    { label: 'Matric Science', slug: 'matric-ssc-science' }
  ];

  return (
    <section className="relative overflow-hidden bg-section-hero text-[#141c19] pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#ebe3d3]">
      {/* Decent, elegant static gradient background */}
      <AnimatedHeroBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-12">
        
        {/* Asymmetric 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (7 cols): Editorial Typography & Direct Action */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Regional Trust Eyebrow */}
            <div className="flex items-center gap-2">
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5f0e6] hover:bg-[#ede6db] border border-[#d4a359]/50 text-[#b85d34] text-xs font-bold transition-all shadow-xs group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Female-First Safety • Verified Qaris, Alimahs &amp; Academic Tutors</span>
                <ChevronRight className="w-3 h-3 text-[#d4a359] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Main Editorial Headline with Dramatic Contrast */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#0c2217] leading-[1.15]">
              Verified Qaris, Alimas <br />
              &amp; Academic Tutors <br />
              <span className="hand-drawn-underline text-[#0c2217]">Across Pakistan</span>
            </h1>

            {/* Humanized, Colloquial Pakistani Copy */}
            <p className="text-sm sm:text-base text-[#4a5e55] max-w-xl leading-relaxed font-normal">
              Designed specifically for female learners, daughters, and mothers feel 100% comfortable and protected. Verified female Alimahs from Wafaq-ul-Madaris, certified Qaris, and top school tutors. 1-on-1 classes with camera-off privacy by default, zero personal contact sharing, and agreed fees directly with your tutor.
            </p>

            {/* Key Assurance Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-[#d4a359]/40 text-[#0c2217] shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>100% Female Privacy &amp; Comfort</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-[#d4a359]/40 text-[#0c2217] shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Verified Qaris &amp; Alimahs (Sanad)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-[#d4a359]/40 text-[#0c2217] shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Camera-Off by Default</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-[#d4a359]/40 text-[#0c2217] shadow-2xs">
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
                    placeholder="Search subject (Tajweed, Math, Physics...)"
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

              {/* Quick Topic Chips & Female Faculty Filters */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
                <Link
                  href="/tutors?gender=female"
                  className="px-3.5 py-1.5 rounded-full bg-[#f5ebe6] hover:bg-[#ede0d8] text-[#b85d34] font-bold border border-[#b85d34]/40 shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95 group"
                  title="Browse verified female tutors across all academic & Quran subjects"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                  <span>Female Tutors</span>
                </Link>
                <Link
                  href="/tutors?gender=female&faculty=alimah"
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f5f0e6] text-[#0c2217] font-bold border border-[#d4a359]/50 shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95 group"
                  title="Browse verified female Alimahs for Quran, Tajweed & Islamic studies"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Female Alimahs</span>
                </Link>
                <span className="text-[#6b7f76] text-xs font-semibold ml-1">Popular:</span>
                {quickSubjects.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/tutors?category=${sub.slug}`}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#f5f0e6] text-[#2c4035] hover:text-[#0c2217] text-xs font-medium border border-[#d4a359]/30 shadow-2xs transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>

              {/* Quick Trust Guarantees below search */}
              <div className="mt-4 pt-3 border-t border-[#ebe3d3]/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5c6e69]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Direct fee agreement in chat</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Zero agency commission</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Free trial class</span>
                </span>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Asymmetric Visual Composition with Tutoring Slider */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Top Slideshow Header: Mode Indicator & Privacy Status */}
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span className="text-xs font-bold text-[#0c2217] tracking-tight">
                  Interactive Tutoring Modes
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b85d34] bg-[#f5ebe6] px-2.5 py-0.5 rounded-full border border-[#b85d34]/30">
                <Video className="w-3 h-3 text-[#b85d34]" />
                <span>Camera-Off by Default</span>
              </span>
            </div>

            {/* Quick Segmented Mode Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 mb-3.5 bg-[#f5f0e6]/95 backdrop-blur-md rounded-2xl border border-[#d4a359]/40 max-w-lg mx-auto shadow-sm">
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
                        ? 'bg-white text-[#0c2217] shadow-sm border border-[#d4a359]/60'
                        : 'text-[#4a5e55] hover:text-[#0c2217]'
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
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#d4a359]/15 via-[#b85d34]/10 to-transparent rounded-3xl blur-xl" />

              {/* Main Editorial Card with Multi-Slide Tutoring Carousel */}
              <div
                className="relative rounded-3xl overflow-hidden border-2 border-[#d4a359]/40 bg-white shadow-2xl h-80 sm:h-96 group"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-85" />
                  </div>
                ))}

                {/* Top Left Badge: Mode Tag */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#d4a359]/50 text-[11px] font-bold text-[#b85d34] shadow-sm">
                  {React.createElement(heroSlides[currentSlide].badgeIcon, {
                    className: 'w-3.5 h-3.5 text-[#b85d34]'
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
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#d4a359]/40 text-xs space-y-1 z-20 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#0c2217] flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${heroSlides[currentSlide].dotColor} animate-pulse shrink-0`} />
                      <span className="truncate">{heroSlides[currentSlide].title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#b85d34] bg-[#f5f0e6] px-2 py-0.5 rounded border border-[#d4a359]/40 shrink-0">
                      {heroSlides[currentSlide].tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4a5e55] leading-snug">
                    {heroSlides[currentSlide].desc}
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Actions: Enrollment Gateways & Female Directory Trigger */}
            <div className="mt-3.5 space-y-2.5 max-w-md mx-auto lg:max-w-none">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <Link
                  href="/register/student"
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#b85d34]/40 active:scale-98"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Join as Student</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/register/tutor"
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-white hover:bg-[#f5f0e6] text-[#0c2217] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-[#d4a359]/60 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                  <span>Apply as Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#d4a359]" />
                </Link>
              </div>

              {/* Direct Female Tutors Hero Action Button */}
              <Link
                href="/tutors?gender=female"
                className="w-full py-2.5 px-4 rounded-xl bg-[#f5ebe6] hover:bg-[#ede0d8] text-[#b85d34] hover:text-[#9e4e2a] border border-[#b85d34]/40 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#b85d34]" />
                <span>Browse Verified Female Tutors &amp; Alimahs</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#b85d34]" />
              </Link>

              {/* Chrome App Download trigger */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setChromeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a5e55] hover:text-[#0c2217] transition-colors cursor-pointer"
                >
                  <Chrome className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Install IlmiDunya App for Chrome / Windows / Android (Free PWA)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Editorial Trust Ledger (Breaking the repetitive 4-card pattern) */}
        <div className="pt-4 border-t border-[#ebe3d3]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Feature 1: Verification */}
            <div className="p-4 rounded-2xl bg-white border border-[#ebe3d3] shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-[#0c2217] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>100% CNIC &amp; Sanad Audited</span>
              </div>
              <p className="text-xs text-[#4a5e55] leading-relaxed">
                National ID cards, degrees, and Qirat credentials checked by administration before any tutor is listed.
              </p>
            </div>

            {/* Feature 2: Female Safety & Comfort */}
            <div className="p-4 rounded-2xl bg-white border border-[#ebe3d3] shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-[#0c2217] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>Female Safety &amp; Comfort</span>
              </div>
              <p className="text-xs text-[#4a5e55] leading-relaxed">
                Camera-off by default, verified female Alimahs for daughters, and private messaging with zero personal numbers shared.
              </p>
            </div>

            {/* Feature 3: Live Classroom */}
            <div className="p-4 rounded-2xl bg-white border border-[#ebe3d3] shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-[#0c2217] font-bold text-xs">
                <Video className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>Direct In-Browser Classroom</span>
              </div>
              <p className="text-xs text-[#4a5e55] leading-relaxed">
                No third-party app downloads. High-definition WebRTC video with page-by-page digital Quran recitation.
              </p>
            </div>

            {/* Feature 4: Transparent Fee */}
            <div className="p-4 rounded-2xl bg-white border border-[#ebe3d3] shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-[#0c2217] font-bold text-xs">
                <Sparkles className="w-4 h-4 shrink-0 text-[#b85d34]" />
                <span>Agreed Direct Monthly Rates</span>
              </div>
              <p className="text-xs text-[#4a5e55] leading-relaxed">
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
