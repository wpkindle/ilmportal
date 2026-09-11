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
  Award,
  Atom,
  Code,
  Laptop,
  BookMarked
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
  },
  {
    id: 4,
    tabLabel: 'Matric & FSc',
    tabIcon: Atom,
    badgeText: 'Matric & FSc Science • Verified Female Tutors',
    badgeIcon: Atom,
    badgeColor: 'text-[#faf8f5]',
    dotColor: 'bg-[#b85d34]',
    tag: 'Board Exam Preparation',
    title: '1:1 Female Science Tutor • Matric & Intermediate',
    desc: 'Comprehensive syllabus mastery in Biology, Chemistry, Physics & Mathematics with verified female educators for daughters and female learners.',
    image: '/images/hero-stem-science.jpg',
    alt: 'Pakistani female science tutor in modest dupatta guiding a teenage schoolgirl through Matric chemistry and biology textbooks and diagrams',
    ctaLink: '/tutors?category=fsc-hssc',
    ctaText: 'Find Science & Board Tutors'
  },
  {
    id: 5,
    tabLabel: 'Coding & Tech',
    tabIcon: Code,
    badgeText: 'Python, Web Dev & Computer Science',
    badgeIcon: Laptop,
    badgeColor: 'text-[#d4a359]',
    dotColor: 'bg-[#d4a359]',
    tag: 'Tech & Skills',
    title: 'Modern Coding, Software & Tech Skills Mentorship',
    desc: 'Hands-on programming tuition in Python, JavaScript, algorithmic problem-solving, and web development from verified computer science graduates.',
    image: '/images/hero-computer-coding.jpg',
    alt: 'Pakistani software tutor mentoring a student in coding, algorithms, and web development on laptop',
    ctaLink: '/tutors?category=computer-science',
    ctaText: 'Find Coding Tutors'
  },
  {
    id: 6,
    tabLabel: 'Hifz Revision',
    tabIcon: BookMarked,
    badgeText: 'Hifz-ul-Quran • Sanad-Certified Qaris',
    badgeIcon: Award,
    badgeColor: 'text-[#d4a359]',
    dotColor: 'bg-[#d4a359]',
    tag: 'Quran Memorization',
    title: 'Hifz-ul-Quran Memorization & Tajweed Revision',
    desc: 'Daily Sabaq, Sabqi, and Manzil revision routines with patient Sanad-verified Huffaz and Qaris for lifelong retention and perfect pronunciation.',
    image: '/images/hero-hifz-quran.jpg',
    alt: 'Pakistani male Qari listening to young boy student reciting Holy Quran on wooden rihal in traditional Islamic library',
    ctaLink: '/tutors?category=hifz-al-quran',
    ctaText: 'Find Hifz & Tajweed Qaris'
  },
  {
    id: 7,
    tabLabel: 'Primary & Junior',
    tabIcon: Users,
    badgeText: 'Playgroup to Grade 5 • Warm Female Tutors',
    badgeIcon: Users,
    badgeColor: 'text-[#faf8f5]',
    dotColor: 'bg-[#b85d34]',
    tag: 'Foundational Learning',
    title: 'Early Childhood, Urdu Qaida & School Tuition',
    desc: 'Caring female home and online tutors building strong foundations in Urdu reading, English phonics, mental math, and daily school homework.',
    image: '/images/hero-primary-home.jpg',
    alt: 'Pakistani female tutor teaching a young girl Urdu Qaida and school lessons at study table',
    ctaLink: '/tutors?category=primary-junior',
    ctaText: 'Find Primary Tutors'
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
    <section className="relative overflow-hidden bg-[#07150e] text-[#faf8f5] pt-6 pb-12 sm:pt-14 sm:pb-20 border-b border-[#0c2217]">
      {/* Living Cinematic Motion Slideshow Background */}
      <CinematicHeroBackground
        slides={heroSlides}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
        isPaused={isPaused}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-1 sm:pt-6 pb-4 sm:pb-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
          
          {/* Left Column (7 cols on desktop): Editorial Typography & Assurances */}
          <div className="w-full order-1 lg:col-span-7 space-y-3.5 sm:space-y-6 text-left">
            
            {/* Regional Trust Eyebrow */}
            <div className="flex items-center gap-2">
              <Link
                href="/safety"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-[#d4a359]/60 text-[#f5d799] text-[11px] sm:text-xs font-bold transition-all shadow-lg group backdrop-blur-md cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                <span className="sm:hidden whitespace-nowrap">Female-First Safety • 100% Verified</span>
                <span className="hidden sm:inline">Female-First Safety • Verified Qaris, Alimahs &amp; Academic Tutors</span>
                <ChevronRight className="w-3 h-3 text-[#d4a359] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>

            {/* Main Editorial Headline in Exactly Two Lines */}
            <h1 className="text-2xl xs:text-[1.75rem] sm:text-3xl md:text-4xl lg:text-[2.15rem] xl:text-[2.65rem] 2xl:text-5xl font-serif font-black tracking-tight text-[#faf8f5] leading-[1.18] sm:leading-[1.2] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              <span className="block sm:whitespace-nowrap">Connecting Verified Tutors</span>
              <span className="block sm:whitespace-nowrap">
                With Students <span className="hand-drawn-underline-gold text-[#faf8f5]">Across Pakistan</span>
              </span>
            </h1>

            {/* Humanized, Colloquial Pakistani Copy */}
            <p className="text-xs sm:text-base text-[#d6e3dd] max-w-2xl leading-relaxed font-normal drop-shadow-sm">
              <span className="sm:hidden">
                Designed for female learners, daughters, and families. 1-on-1 classes with verified female Alimahs, certified Qaris, and academic school tutors with camera-off privacy by default.
              </span>
              <span className="hidden sm:inline">
                Designed specifically for female learners, daughters, and mothers to feel 100% comfortable and protected. Verified female Alimahs from Wafaq-ul-Madaris, certified Qaris, and top school tutors. 1-on-1 classes with camera-off privacy by default, zero personal contact sharing, and agreed fees directly with your tutor.
              </span>
            </p>

            {/* Key Assurance Signals (Clean, Never-Truncated on Mobile) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-0.5 sm:pt-1 text-[11px] sm:text-xs font-semibold">
              <span className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                <span className="sm:hidden whitespace-nowrap">Female Privacy</span>
                <span className="hidden sm:inline whitespace-nowrap">100% Female Privacy</span>
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs text-center">
                <Award className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                <span className="sm:hidden whitespace-nowrap">Verified Sanad</span>
                <span className="hidden sm:inline whitespace-nowrap">Verified Sanad Tutors</span>
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs text-center">
                <Lock className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                <span className="sm:hidden whitespace-nowrap">Camera-Off</span>
                <span className="hidden sm:inline whitespace-nowrap">Camera-Off by Default</span>
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#faf8f5] shadow-xs text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="sm:hidden whitespace-nowrap">0% Contact Share</span>
                <span className="hidden sm:inline whitespace-nowrap">Zero Contact Sharing</span>
              </span>
            </div>

          </div>

          {/* Right Column (5 cols on desktop): Buttons & Quick Tags Showcase (Transparent Glass) */}
          <div className="w-full order-3 lg:order-2 lg:col-span-5 relative mt-1 sm:mt-6 lg:mt-0">
            <div className="w-full rounded-2xl sm:rounded-3xl bg-black/15 hover:bg-black/35 border border-white/20 hover:border-white/30 p-4 sm:p-6 shadow-xl space-y-3.5 sm:space-y-5 transition-all duration-300 backdrop-blur-sm">
              
              {/* Header: Popular Subjects & Faculty Modes */}
              <div className="space-y-1 pb-2.5 sm:pb-3 border-b border-white/15">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 drop-shadow-xs">
                    <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Popular Subjects &amp; Faculty</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#d4a359] bg-[#d4a359]/20 px-2 sm:px-2.5 py-0.5 rounded-full border border-[#d4a359]/40">
                    Direct 1-on-1
                  </span>
                </div>
                <p className="text-[11px] text-[#e0ece6] drop-shadow-xs">
                  Select a category to instantly browse verified tutors in your city:
                </p>
              </div>

              {/* Faculty Modes & Quick Subject Tags (Transparent Glass Pills) */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <Link
                  href="/tutors?gender=female"
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#b85d34]/30 hover:bg-[#b85d34]/50 text-[#fde4d8] font-bold border border-[#b85d34]/60 shadow-xs transition-all inline-flex items-center gap-1 active:scale-95 group cursor-pointer"
                  title="Browse verified female tutors across all academic & Quran subjects"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#f5a882]" />
                  <span>Female Tutors</span>
                </Link>
                <Link
                  href="/tutors?gender=female&faculty=alimah"
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#d4a359]/30 hover:bg-[#d4a359]/50 text-[#fef3d6] font-bold border border-[#d4a359]/60 shadow-xs transition-all inline-flex items-center gap-1 active:scale-95 group cursor-pointer"
                  title="Browse verified female Alimahs for Quran, Tajweed & Islamic studies"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f5d799]" />
                  <span>Female Alimahs</span>
                </Link>
                <Link
                  href="/tutors?mode=physical"
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-[#faf8f5] font-bold border border-white/25 shadow-xs transition-all inline-flex items-center gap-1 active:scale-95 group cursor-pointer"
                  title="Find verified male home tutors visiting your residence"
                >
                  <Home className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>Home Tutors</span>
                </Link>
                {quickSubjects.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/tutors?category=${sub.slug}`}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#faf8f5] hover:text-white text-[11px] sm:text-xs font-medium border border-white/20 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>

              {/* Action Buttons: Community Gateways */}
              <div className="pt-2.5 sm:pt-3 border-t border-white/15 space-y-2 sm:space-y-2.5">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row items-center sm:gap-2.5">
                  <Link
                    href="/login?role=student&mode=signup"
                    className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#b85d34]/90 to-[#9e4e2a]/90 hover:from-[#c9673b] hover:to-[#b0552e] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border border-[#b85d34]/60 active:scale-98 text-center"
                  >
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Join as Student</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden xs:inline" />
                  </Link>
                  <Link
                    href="/login?role=tutor&mode=signup"
                    className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border border-white/25 active:scale-98 text-center"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4a359] shrink-0" />
                    <span>Apply as Tutor</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d4a359] shrink-0 hidden xs:inline" />
                  </Link>
                </div>

                {/* Direct Female Tutors Action Button */}
                <Link
                  href="/tutors?gender=female"
                  className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-[#d4a359]/20 hover:bg-[#d4a359]/30 text-[#f5d799] border border-[#d4a359]/50 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                  <span>Browse Verified Female Tutors &amp; Alimahs</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                </Link>

                {/* Chrome App Download trigger */}
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => setChromeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c5d8cf] hover:text-white transition-colors cursor-pointer"
                  >
                    <Chrome className="w-3.5 h-3.5 text-[#d4a359] shrink-0" />
                    <span>Install IlmiDunya App (Free PWA)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Full-Width Search Engine Row (Order 2 on mobile, spans 12 columns on desktop) */}
          <div className="w-full order-2 lg:order-3 lg:col-span-12 pt-1 sm:pt-4">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-2xl border-2 border-[#d4a359]/70 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full"
            >
              {/* Search Text */}
              <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:flex-1 text-left min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search subject (Tajweed, Math, Physics...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium outline-none"
                />
              </div>

              <div className="w-full h-px sm:hidden bg-slate-100" />
              <div className="hidden sm:block w-px h-9 bg-slate-200" />

              {/* City Selector */}
              <div className="w-full sm:w-60 lg:w-72 shrink-0 text-left">
                <CustomSelect
                  options={availableCities}
                  value={selectedCity}
                  onChange={setSelectedCity}
                  placeholder="All Pakistan Cities"
                  icon={MapPin}
                  searchable={true}
                  variant="hero"
                  placement="bottom"
                />
              </div>

              {/* Terracotta Action Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-[#b85d34] to-[#9e4e2a] hover:from-[#c9673b] hover:to-[#b0552e] text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-full shadow-lg shadow-[#b85d34]/40 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                <span>Find Tutors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Trust Guarantees below search */}
            <div className="pt-2 sm:pt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 sm:gap-x-6 gap-y-1 text-[11px] sm:text-xs text-[#d6e3dd] w-full">
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

        </div>

        {/* Editorial Trust Ledger (Frosted Glass Trust Cards) */}
        <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/15">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 text-left">
            
            {/* Feature 1: Verification */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#d4a359]" />
                <span className="truncate">100% CNIC Audited</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d6e3dd] leading-relaxed hidden sm:block">
                National ID cards, degrees, and Qirat credentials checked by administration before any tutor is listed.
              </p>
              <p className="text-[11px] text-[#d6e3dd] leading-tight sm:hidden">
                Verified National ID cards, degrees &amp; Sanads.
              </p>
            </div>

            {/* Feature 2: Female Safety & Comfort */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#d4a359]" />
                <span className="truncate">Female Comfort</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d6e3dd] leading-relaxed hidden sm:block">
                Camera-off by default, verified female Alimahs for daughters, and private messaging with zero personal numbers shared.
              </p>
              <p className="text-[11px] text-[#d6e3dd] leading-tight sm:hidden">
                Camera-off by default &amp; zero number sharing.
              </p>
            </div>

            {/* Feature 3: Live Classroom */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-xs">
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#d4a359]" />
                <span className="truncate">Live Classroom</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d6e3dd] leading-relaxed hidden sm:block">
                No third-party app downloads. High-definition WebRTC video with page-by-page digital Quran recitation.
              </p>
              <p className="text-[11px] text-[#d6e3dd] leading-tight sm:hidden">
                In-browser WebRTC video with digital Quran.
              </p>
            </div>

            {/* Feature 4: Transparent Fee */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#b85d34]" />
                <span className="truncate">Direct Rates</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d6e3dd] leading-relaxed hidden sm:block">
                Chat for free with tutors and agree on fair monthly fees payable via EasyPaisa, JazzCash, or bank transfer.
              </p>
              <p className="text-[11px] text-[#d6e3dd] leading-tight sm:hidden">
                Direct monthly fees via JazzCash or EasyPaisa.
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
