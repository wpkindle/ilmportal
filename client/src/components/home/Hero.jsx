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
import CinematicHeroBackground from './CinematicHeroBackground';
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
    alt: 'Pakistani male Qari with beard and prayer cap teaching a young boy student the Holy Quran on a wooden rihal at home',
    ctaLink: '/tutors?mode=physical',
    ctaText: 'Find Home Tutors'
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
    alt: 'Pakistani male academic tutor guiding a high-school boy student through board exam physics and mathematics at study desk',
    ctaLink: '/tutors?category=matric-ssc-science',
    ctaText: 'Find Academic STEM Tutors'
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
    alt: 'Pakistani girl student attending 1:1 online WebRTC video call with female Alimah in Naqab',
    ctaLink: '/tutors?gender=female',
    ctaText: 'Find Verified Female Alimahs'
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
    alt: 'Pakistani student with headphones attending online WebRTC Quran recitation class with digital Quran on laptop screen',
    ctaLink: '/tutors?category=tajweed-al-quran',
    ctaText: 'Explore Quran Classrooms'
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
    <section className="relative overflow-hidden bg-[#07150e] text-[#faf8f5] pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#0c2217]">
      {/* Living Cinematic Motion Slideshow Background */}
      <CinematicHeroBackground
        slides={heroSlides}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
        isPaused={isPaused}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-4 sm:pt-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column (7 cols): Editorial Typography, Assurances & Search Engine */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Regional Trust Eyebrow */}
            <div className="flex items-center gap-2">
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-[#d4a359]/60 text-[#f5d799] text-xs font-bold transition-all shadow-lg group backdrop-blur-md cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Female-First Safety • Verified Qaris, Alimahs &amp; Academic Tutors</span>
                <ChevronRight className="w-3 h-3 text-[#d4a359] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Main Editorial Headline in Exactly Two Lines */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-black tracking-tight text-[#faf8f5] leading-[1.18] sm:leading-[1.2] lg:leading-[1.22]">
              Connecting Verified Tutors <br />
              With Students <span className="hand-drawn-underline-gold text-[#faf8f5]">Across Pakistan</span>
            </h1>

            {/* Humanized, Colloquial Pakistani Copy */}
            <p className="text-sm sm:text-base text-[#d6e3dd] max-w-xl leading-relaxed font-normal">
              Designed specifically for female learners, daughters, and mothers to feel 100% comfortable and protected. Verified female Alimahs from Wafaq-ul-Madaris, certified Qaris, and top school tutors. 1-on-1 classes with camera-off privacy by default, zero personal contact sharing, and agreed fees directly with your tutor.
            </p>

            {/* Key Assurance Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>100% Female Privacy &amp; Comfort</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Verified Qaris &amp; Alimahs (Sanad)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs">
                <Lock className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Camera-Off by Default</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Personal Contact Sharing</span>
              </span>
            </div>

            {/* Search Input Box with Full Width */}
            <div className="pt-2 w-full">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl border-2 border-[#d4a359]/70 flex flex-col sm:flex-row items-center gap-2 w-full"
              >
                {/* Search Text */}
                <div className="flex items-center gap-2.5 px-4 py-2 w-full sm:flex-1 text-left min-w-0">
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
                <div className="w-full sm:w-56 shrink-0 text-left">
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
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#b85d34] to-[#9e4e2a] hover:from-[#c9673b] hover:to-[#b0552e] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-lg shadow-[#b85d34]/40 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <span>Find Tutors</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Trust Guarantees below search */}
            <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#d6e3dd] w-full">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct fee agreement in chat</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero agency commission</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Free trial class</span>
              </span>
            </div>

          </div>

          {/* Right Column (5 cols): Buttons & Quick Tags Showcase */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="rounded-3xl bg-black/40 backdrop-blur-md border border-white/15 p-5 sm:p-6 shadow-2xl space-y-5">
              
              {/* Header: Popular Subjects & Faculty Modes */}
              <div className="space-y-1 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Popular Subjects &amp; Faculty</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#d4a359] bg-[#d4a359]/15 px-2.5 py-0.5 rounded-full border border-[#d4a359]/30">
                    Direct 1-on-1
                  </span>
                </div>
                <p className="text-[11px] text-[#d6e3dd]">
                  Select a category to instantly browse verified tutors in your city:
                </p>
              </div>

              {/* Faculty Modes & Quick Subject Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  href="/tutors?gender=female"
                  className="px-3 py-1.5 rounded-xl bg-[#f5ebe6] hover:bg-[#ede0d8] text-[#b85d34] font-bold border border-[#b85d34]/40 shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95 group cursor-pointer"
                  title="Browse verified female tutors across all academic & Quran subjects"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#b85d34]" />
                  <span>Female Tutors</span>
                </Link>
                <Link
                  href="/tutors?gender=female&faculty=alimah"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#f5f0e6] text-[#0c2217] font-bold border border-[#d4a359]/50 shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95 group cursor-pointer"
                  title="Browse verified female Alimahs for Quran, Tajweed & Islamic studies"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Female Alimahs</span>
                </Link>
                <Link
                  href="/tutors?mode=physical"
                  className="px-3 py-1.5 rounded-xl bg-[#f4ebe1] hover:bg-[#ebdcd3] text-[#0c2217] font-bold border border-[#d4a359]/60 shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95 group cursor-pointer"
                  title="Find verified male home tutors visiting your residence"
                >
                  <Home className="w-3.5 h-3.5 text-[#b85d34]" />
                  <span>In-Person Home Tutors</span>
                </Link>
                {quickSubjects.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/tutors?category=${sub.slug}`}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#faf8f5] hover:text-white text-xs font-medium border border-white/20 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>

              {/* Action Buttons: Community Gateways */}
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <Link
                    href="/login?role=student&mode=signup"
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#b85d34] to-[#9e4e2a] hover:from-[#c9673b] hover:to-[#b0552e] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#b85d34]/50 active:scale-98"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Join as Student</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/login?role=tutor&mode=signup"
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                    <span>Apply as Tutor</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d4a359]" />
                  </Link>
                </div>

                {/* Direct Female Tutors Action Button */}
                <Link
                  href="/tutors?gender=female"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#d4a359]/20 hover:bg-[#d4a359]/30 text-[#f5d799] border border-[#d4a359]/50 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#d4a359]" />
                  <span>Browse Verified Female Tutors &amp; Alimahs</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#d4a359]" />
                </Link>

                {/* Chrome App Download trigger */}
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => setChromeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#a5b8b0] hover:text-white transition-colors cursor-pointer"
                  >
                    <Chrome className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Install IlmiDunya App for Chrome / Windows / Android (Free PWA)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Editorial Trust Ledger (Frosted Glass Trust Cards) */}
        <div className="pt-8 mt-8 border-t border-white/15">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            
            {/* Feature 1: Verification */}
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>100% CNIC &amp; Sanad Audited</span>
              </div>
              <p className="text-xs text-[#d6e3dd] leading-relaxed">
                National ID cards, degrees, and Qirat credentials checked by administration before any tutor is listed.
              </p>
            </div>

            {/* Feature 2: Female Safety & Comfort */}
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>Female Safety &amp; Comfort</span>
              </div>
              <p className="text-xs text-[#d6e3dd] leading-relaxed">
                Camera-off by default, verified female Alimahs for daughters, and private messaging with zero personal numbers shared.
              </p>
            </div>

            {/* Feature 3: Live Classroom */}
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Video className="w-4 h-4 shrink-0 text-[#d4a359]" />
                <span>Direct In-Browser Classroom</span>
              </div>
              <p className="text-xs text-[#d6e3dd] leading-relaxed">
                No third-party app downloads. High-definition WebRTC video with page-by-page digital Quran recitation.
              </p>
            </div>

            {/* Feature 4: Transparent Fee */}
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Sparkles className="w-4 h-4 shrink-0 text-[#b85d34]" />
                <span>Agreed Direct Monthly Rates</span>
              </div>
              <p className="text-xs text-[#d6e3dd] leading-relaxed">
                Chat for free with tutors and agree on fair monthly fees payable via EasyPaisa, JazzCash, or bank transfer.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Precision Bottom Gradient Accent Ribbon */}
      <div className="absolute inset-x-0 bottom-0 section-divider-ribbon" />

      <ChromeAppInstallModal
        isOpen={chromeModalOpen}
        onClose={() => setChromeModalOpen(false)}
      />
    </section>
  );
}
