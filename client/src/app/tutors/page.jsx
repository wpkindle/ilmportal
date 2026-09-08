'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TutorCard from '../../components/tutor/TutorCard';
import TutorFilterSidebar from '../../components/tutor/TutorFilterSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CustomSelect from '../../components/common/CustomSelect';
import { api } from '../../services/api';
import { Search, Users, UserCheck, ArrowUpDown, ShieldCheck, BookOpen, GraduationCap, Video, Navigation, Home, MapPin, Compass } from 'lucide-react';
import { detectUserLiveLocation } from '../../utils/geolocation';

const sortOptions = [
  { value: 'popular', label: 'Most Popular', sublabel: 'Top Enrolled & Active' },
  { value: 'newest', label: 'Newly Joined', sublabel: 'Freshly Verified Faculty' },
  { value: 'rating', label: 'Highest Rated', sublabel: '5.0 Star Student Reviews' },
  { value: 'experience', label: 'Most Experienced', sublabel: 'Senior Teaching Faculty' }
];

function TutorSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tutors, setTutors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to infer gender from faculty parameter
  const resolveGender = (fac, gen) => {
    if (gen) return gen;
    if (fac === 'alimah' || fac === 'female_alimah' || fac === 'female_tutor' || fac === 'female_academic' || fac === 'female_quran') return 'female';
    if (fac === 'male_quran' || fac === 'male_academic' || fac === 'qari') return 'male';
    return '';
  };

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const handleTopLiveLocation = async () => {
    setDetectingLocation(true);
    setLocationMessage('');
    try {
      const loc = await detectUserLiveLocation();
      setFilters((prev) => ({
        ...prev,
        mode: 'physical',
        city: loc.city,
        area: loc.area || ''
      }));
      setLocationMessage(`GPS Active: ${loc.displayName}`);
    } catch (err) {
      setLocationMessage(err.message || 'Location detection error');
    } finally {
      setDetectingLocation(false);
    }
  };

  // Filters State
  const initialFaculty = searchParams.get('faculty') || '';
  const initialGender = resolveGender(initialFaculty, searchParams.get('gender'));

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    mode: searchParams.get('mode') || '',
    gender: initialGender,
    faculty: initialFaculty,
    sortBy: 'rating'
  });

  // Sync with URL params
  useEffect(() => {
    const paramFaculty = searchParams.get('faculty') || '';
    const paramGender = resolveGender(paramFaculty, searchParams.get('gender'));
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
      area: searchParams.get('area') || '',
      gender: paramGender,
      faculty: paramFaculty
    }));
  }, [searchParams]);

  // Initial metadata fetch (Categories & Available Tutor Cities)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tutorRes, locRes] = await Promise.all([
          api.getCategories(),
          api.getPublicTutors(),
          api.getLocations()
        ]);
        if (catRes.success) setCategories(catRes.categories);

        // Filter locations to only cities with available active tutors
        if (tutorRes.success && tutorRes.tutors?.length) {
          const activeCityMap = new Map();
          tutorRes.tutors.forEach((t) => {
            if (t.user?.city) {
              activeCityMap.set(t.user.city, {
                _id: t.user.city,
                name: t.user.city,
                province: 'Available Tutors'
              });
            }
            if (t.cities && Array.isArray(t.cities)) {
              t.cities.forEach((c) => {
                const cName = c.name || c;
                const cProv = c.province || 'Available Tutors';
                if (cName) {
                  activeCityMap.set(cName, {
                    _id: c._id || cName,
                    name: cName,
                    province: cProv
                  });
                }
              });
            }
          });

          if (activeCityMap.size > 0) {
            setLocations(Array.from(activeCityMap.values()));
          } else if (locRes.success) {
            setLocations(locRes.locations);
          }
        } else if (locRes.success) {
          setLocations(locRes.locations);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Search Tutors fetch
  const fetchTutors = async () => {
    setLoading(true);
    try {
      const queryParams = { ...filters };
      if (!queryParams.search) delete queryParams.search;
      if (!queryParams.category) delete queryParams.category;
      if (!queryParams.city) delete queryParams.city;
      if (!queryParams.mode) delete queryParams.mode;
      if (!queryParams.gender) delete queryParams.gender;
      if (!queryParams.faculty) delete queryParams.faculty;
      if (!queryParams.sanadVerified) delete queryParams.sanadVerified;

      // If specific local area is chosen, factor it into search
      if (queryParams.area) {
        queryParams.search = queryParams.search ? `${queryParams.search} ${queryParams.area}` : queryParams.area;
      }
      delete queryParams.area;

      const res = await api.getTutors(queryParams);
      if (res.success) {
        let list = res.tutors || [];
        if (filters.faculty === 'alimah' || filters.faculty === 'female_quran') {
          list = list.filter((t) => {
            const isFemale = t.gender === 'female' || t.user?.gender === 'female';
            if (!isFemale) return false;
            const qual = (t.qualifications || '').toLowerCase();
            const bio = (t.bio || '').toLowerCase();
            const name = (t.user?.name || '').toLowerCase();
            const hasQuranSubject = t.subjects?.some((s) => {
              const sName = (s.name || s.slug || '').toLowerCase();
              return (
                sName.includes('quran') ||
                sName.includes('tajweed') ||
                sName.includes('qaida') ||
                sName.includes('hifz') ||
                sName.includes('islamic')
              );
            });
            return (
              qual.includes('alimah') ||
              qual.includes('wafaq') ||
              qual.includes('wifaq') ||
              qual.includes('dars-e-nizami') ||
              qual.includes('sanad') ||
              name.includes('alimah') ||
              bio.includes('alimah') ||
              hasQuranSubject
            );
          });
        } else if (filters.faculty === 'female_academic') {
          list = list.filter((t) => {
            const isFemale = t.gender === 'female' || t.user?.gender === 'female';
            if (!isFemale) return false;
            const qual = (t.qualifications || '').toLowerCase();
            const bio = (t.bio || '').toLowerCase();
            const hasAcademicSubject = t.subjects?.some((s) => {
              const sType = (s.type || '').toLowerCase();
              const sName = (s.name || s.slug || '').toLowerCase();
              return sType === 'academic' || (!sName.includes('quran') && !sName.includes('tajweed') && !sName.includes('qaida') && !sName.includes('hifz'));
            });
            return (
              hasAcademicSubject ||
              qual.includes('bs') ||
              qual.includes('ms') ||
              qual.includes('msc') ||
              qual.includes('mphil') ||
              qual.includes('phd') ||
              qual.includes('engineer') ||
              qual.includes('doctor') ||
              qual.includes('mbbs') ||
              qual.includes('matric') ||
              qual.includes('board') ||
              qual.includes('fsc') ||
              qual.includes('academic') ||
              bio.includes('math') ||
              bio.includes('physics') ||
              bio.includes('chemistry') ||
              bio.includes('biology') ||
              bio.includes('science') ||
              bio.includes('english') ||
              bio.includes('academic') ||
              bio.includes('school')
            );
          });
        } else if (filters.faculty === 'male_quran' || filters.faculty === 'qari') {
          list = list.filter((t) => {
            const isMale = t.gender === 'male' || t.user?.gender === 'male';
            if (!isMale) return false;
            const qual = (t.qualifications || '').toLowerCase();
            const bio = (t.bio || '').toLowerCase();
            const name = (t.user?.name || '').toLowerCase();
            const hasQuranSubject = t.subjects?.some((s) => {
              const sName = (s.name || s.slug || '').toLowerCase();
              return (
                sName.includes('quran') ||
                sName.includes('tajweed') ||
                sName.includes('qaida') ||
                sName.includes('hifz') ||
                sName.includes('islamic')
              );
            });
            return (
              qual.includes('qari') ||
              qual.includes('hafiz') ||
              qual.includes('sanad') ||
              qual.includes('wifaq') ||
              qual.includes('wafaq') ||
              qual.includes('dars-e-nizami') ||
              name.includes('qari') ||
              name.includes('hafiz') ||
              bio.includes('qari') ||
              bio.includes('quran') ||
              hasQuranSubject
            );
          });
        } else if (filters.faculty === 'male_academic') {
          list = list.filter((t) => {
            const isMale = t.gender === 'male' || t.user?.gender === 'male';
            if (!isMale) return false;
            const qual = (t.qualifications || '').toLowerCase();
            const bio = (t.bio || '').toLowerCase();
            const hasAcademicSubject = t.subjects?.some((s) => {
              const sType = (s.type || '').toLowerCase();
              const sName = (s.name || s.slug || '').toLowerCase();
              return sType === 'academic' || (!sName.includes('quran') && !sName.includes('tajweed') && !sName.includes('qaida') && !sName.includes('hifz'));
            });
            return (
              hasAcademicSubject ||
              qual.includes('bs') ||
              qual.includes('ms') ||
              qual.includes('msc') ||
              qual.includes('mphil') ||
              qual.includes('phd') ||
              qual.includes('engineer') ||
              qual.includes('matric') ||
              qual.includes('board') ||
              qual.includes('fsc') ||
              qual.includes('academic') ||
              bio.includes('math') ||
              bio.includes('physics') ||
              bio.includes('chemistry') ||
              bio.includes('biology') ||
              bio.includes('english') ||
              bio.includes('academic') ||
              bio.includes('school')
            );
          });
        } else if (filters.gender === 'female') {
          // Display ALL female tutors including alimahs
          list = list.filter((t) => t.gender === 'female' || t.user?.gender === 'female');
        } else if (filters.gender === 'male') {
          list = list.filter((t) => t.gender === 'male' || t.user?.gender === 'male');
        }
        setTutors(list);
      }
    } catch (err) {
      console.error('Error fetching tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      area: '',
      mode: '',
      gender: '',
      faculty: '',
      sanadVerified: false,
      sortBy: 'rating'
    });
    router.push('/tutors');
  };

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Top Header & Search Bar */}
        <div className="bg-white rounded-3xl border border-[#e6ded1] p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#b85d34] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Female-Safe Tutoring Directory • Pakistan</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
              Verified Qaris, Alimahs &amp; Academic Tutors
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Connect with certified Quran teachers, verified female Alimahs for daughters, and Playgroup to FSc specialists. 1-on-1 classes with camera-off privacy by default.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tutor name, subject (Tajweed, Math, Board Prep)..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 min-h-[44px] bg-white border border-[#e6ded1] rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#b85d34] shadow-xs"
              />
            </div>

            {/* Custom Sort Dropdown */}
            <div className="w-full sm:w-60">
              <CustomSelect
                options={sortOptions}
                value={filters.sortBy}
                onChange={(val) => handleFilterChange('sortBy', val)}
                icon={ArrowUpDown}
                variant="filter"
              />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] bg-[#f5ebe6] border border-[#b85d34]/30 text-[#b85d34] rounded-2xl font-bold text-xs shadow-xs active:bg-[#ebdcd3] transition-colors"
            >
              <Users className="w-4 h-4 text-[#b85d34]" />
              <span>Filter Tutors &amp; Cities</span>
            </button>
          </div>

          {/* Quick Priority Faculty Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Filters:</span>
            <button
              type="button"
              onClick={() => {
                handleFilterChange('gender', '');
                handleFilterChange('faculty', '');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                !filters.gender && !filters.faculty
                  ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              All Faculty
            </button>

            <button
              type="button"
              onClick={() => {
                if (filters.gender === 'female' && !filters.faculty) {
                  handleFilterChange('gender', '');
                } else {
                  handleFilterChange('gender', 'female');
                  handleFilterChange('faculty', '');
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border inline-flex items-center gap-1 ${
                filters.gender === 'female' && !filters.faculty
                  ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-2xs'
                  : 'bg-[#f5ebe6] text-[#b85d34] hover:bg-[#ebdcd3] border-[#b85d34]/30'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>All Female Tutors</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (filters.faculty === 'female_academic') {
                  handleFilterChange('faculty', '');
                  handleFilterChange('gender', '');
                } else {
                  handleFilterChange('gender', 'female');
                  handleFilterChange('faculty', 'female_academic');
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border inline-flex items-center gap-1 ${
                filters.faculty === 'female_academic'
                  ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Female Academic Tutors</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (filters.faculty === 'alimah' || filters.faculty === 'female_quran') {
                  handleFilterChange('faculty', '');
                  handleFilterChange('gender', '');
                } else {
                  handleFilterChange('gender', 'female');
                  handleFilterChange('faculty', 'alimah');
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border inline-flex items-center gap-1 ${
                filters.faculty === 'alimah' || filters.faculty === 'female_quran'
                  ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-2xs'
                  : 'bg-white text-[#0c2217] hover:bg-[#edf6f0] border-[#0c2217]/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Female Quran Tutors</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (filters.faculty === 'male_quran') {
                  handleFilterChange('faculty', '');
                  handleFilterChange('gender', '');
                } else {
                  handleFilterChange('gender', 'male');
                  handleFilterChange('faculty', 'male_quran');
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border inline-flex items-center gap-1 ${
                filters.faculty === 'male_quran'
                  ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Male Quran Tutors</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (filters.faculty === 'male_academic') {
                  handleFilterChange('faculty', '');
                  handleFilterChange('gender', '');
                } else {
                  handleFilterChange('gender', 'male');
                  handleFilterChange('faculty', 'male_academic');
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border inline-flex items-center gap-1 ${
                filters.faculty === 'male_academic'
                  ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Male Academic Tutors</span>
            </button>
          </div>

          {/* Delivery Mode Quick Toggle & Live GPS Location Trigger */}
          <div className="pt-2.5 border-t border-[#e6ded1] flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-[#0c2217]" />
                <span>Delivery Mode:</span>
              </span>

              {[
                { label: 'All Modes', val: '' },
                { label: 'Online (WebRTC)', val: 'online' },
                { label: 'In-Person (Home Tuition)', val: 'physical' }
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => handleFilterChange('mode', m.val)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    (filters.mode || '') === m.val
                      ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-2xs'
                      : 'bg-[#faf7f2] hover:bg-[#ede5d8] text-slate-700 border-[#e6ded1]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Quick Live GPS Location Button when In-Person mode is selected */}
            {filters.mode === 'physical' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTopLiveLocation}
                  disabled={detectingLocation}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                    detectingLocation
                      ? 'bg-[#f0ece1] text-stone-600 border-[#d4a359]/40 cursor-wait'
                      : 'bg-[#0c2217] hover:bg-[#163524] text-[#d4a359] border-[#0c2217] active:scale-95'
                  }`}
                >
                  <Navigation className={`w-3.5 h-3.5 text-[#d4a359] ${detectingLocation ? 'animate-spin' : 'animate-pulse'}`} />
                  <span>{detectingLocation ? 'Detecting Pakistani GPS...' : 'Use My Live Location'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Active In-Person Location Pill / Notice */}
          {filters.mode === 'physical' && (filters.city || filters.area || locationMessage) && (
            <div className="p-3 bg-gradient-to-r from-[#faf7f2] to-[#f4ebe1] border border-[#d4a359]/60 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-xl bg-[#0c2217] text-[#d4a359] shrink-0">
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-bold leading-tight truncate">
                    In-Person Home Tutoring in:{' '}
                    <span className="text-[#b85d34]">
                      {filters.area ? `${filters.area}, ${filters.city}` : filters.city || 'All Pakistan'}
                    </span>
                  </p>
                  <p className="text-[10px] text-stone-600 truncate">
                    {locationMessage || 'Verified male faculty visiting your residence'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleFilterChange('city', '');
                  handleFilterChange('area', '');
                  setLocationMessage('');
                }}
                className="text-[11px] font-bold text-stone-500 hover:text-[#b85d34] underline shrink-0 cursor-pointer"
              >
                Clear Location
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <TutorFilterSidebar
              filters={filters}
              categories={categories}
              locations={locations}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Tutor Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Showing <span className="text-[#0c2217] font-black">{tutors.length}</span>{' '}
                {filters.faculty === 'female_academic'
                  ? 'Verified Female Academic Tutors'
                  : filters.faculty === 'alimah' || filters.faculty === 'female_quran'
                  ? 'Verified Female Quran Tutors (Alimahs)'
                  : filters.gender === 'female'
                  ? 'Verified Female Tutors (All)'
                  : filters.faculty === 'male_quran'
                  ? 'Verified Male Quran Tutors'
                  : filters.faculty === 'male_academic'
                  ? 'Verified Male Academic Tutors'
                  : filters.gender === 'male'
                  ? 'Verified Male Tutors'
                  : 'Verified Tutors'}
              </p>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : tutors.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#e6ded1] p-8 sm:p-12 text-center space-y-3 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 font-serif">No tutors found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your filters, selecting a different city or sector, or clearing search keywords.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-3 min-h-[44px] bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor._id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/35 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            <div className="p-4 bg-[#faf8f5] border-b border-[#ebe3d3] text-[#0c2217] flex items-center justify-between">
              <span className="text-sm font-bold font-serif">Filter Pakistani Tutors</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="px-3 py-1.5 min-h-[44px] text-xs font-bold text-[#b85d34] hover:text-[#9e4e2a]"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <TutorFilterSidebar
                filters={filters}
                categories={categories}
                locations={locations}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>

            <div className="p-4 border-t border-[#ebe3d3] bg-[#faf8f5] pb-safe">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 min-h-[44px] bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
              >
                View {tutors.length} Tutors
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <TutorSearchContent />
    </Suspense>
  );
}
