'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TutorCard from '../../components/tutor/TutorCard';
import TutorFilterSidebar from '../../components/tutor/TutorFilterSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CustomSelect from '../../components/common/CustomSelect';
import { api } from '../../services/api';
import { Search, Users, ArrowUpDown } from 'lucide-react';

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

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    mode: searchParams.get('mode') || '',
    gender: searchParams.get('gender') || '',
    sortBy: 'rating'
  });

  // Sync with URL params
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
      area: searchParams.get('area') || ''
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
      if (!queryParams.sanadVerified) delete queryParams.sanadVerified;

      // If specific local area is chosen, factor it into search
      if (queryParams.area) {
        queryParams.search = queryParams.search ? `${queryParams.search} ${queryParams.area}` : queryParams.area;
      }
      delete queryParams.area;

      const res = await api.getTutors(queryParams);
      if (res.success) {
        setTutors(res.tutors);
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
      sanadVerified: false,
      sortBy: 'rating'
    });
    router.push('/tutors');
  };

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8f5] py-6 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Top Header & Search Bar */}
        <div className="bg-white rounded-3xl border border-[#e6ded1] p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#b85d34] uppercase tracking-wider mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Female-Safe Tutoring Directory • Pakistan</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
              Verified Qaris, Alimahs &amp; Academic Tutors
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Connect with certified Quran teachers, verified female Alimahs for daughters, and Cambridge/Matric specialists. 1-on-1 classes with camera-off privacy by default.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tutor name, subject (Tajweed, Math, O-Level)..."
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
                Showing <span className="text-emerald-700 font-extrabold">{tutors.length}</span> Verified Tutors
              </p>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : tutors.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No tutors found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your filters, selecting a different city or sector, or clearing search keywords.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-3 min-h-[44px] bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 active:scale-95 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-sm font-bold">Filter Pakistani Tutors</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="px-3 py-1.5 min-h-[44px] text-xs font-bold text-slate-300 hover:text-white"
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

            <div className="p-4 border-t border-slate-200 bg-slate-50 pb-safe">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all"
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
