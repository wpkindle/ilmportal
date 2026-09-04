'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Search,
  ArrowUpDown,
  Sparkles,
  Layers,
  X,
  Filter
} from 'lucide-react';
import CourseCard from '../../components/course/CourseCard';
import CourseFilterSidebar from '../../components/course/CourseFilterSidebar';
import CustomSelect from '../../components/common/CustomSelect';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';

const sortOptions = [
  { value: 'popular', label: 'Most Popular', sublabel: 'Highest Lessons & Enrolled' },
  { value: 'newest', label: 'Newly Added', sublabel: 'Freshly Published Courses' },
  { value: 'price_low', label: 'Tuition: Low to High', sublabel: 'Budget Friendly' },
  { value: 'price_high', label: 'Tuition: High to Low', sublabel: 'Advanced Masterclasses' }
];

function CourseSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    track: searchParams.get('track') || 'all',
    targetAudience: searchParams.get('audience') || '',
    duration: searchParams.get('duration') || '',
    tuitionRange: searchParams.get('tuition') || '',
    sortBy: searchParams.get('sort') || 'popular'
  });

  // Sync with URL query params
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      track: searchParams.get('track') || 'all',
      targetAudience: searchParams.get('audience') || '',
      duration: searchParams.get('duration') || '',
      tuitionRange: searchParams.get('tuition') || '',
      sortBy: searchParams.get('sort') || 'popular'
    }));
  }, [searchParams]);

  // Initial metadata fetch (Categories)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await api.getCategories();
        if (catRes.success) setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Error fetching course metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Courses with filters
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const queryParams = {};
      if (filters.search) queryParams.search = filters.search;
      if (filters.category) queryParams.category = filters.category;
      if (filters.track && filters.track !== 'all') queryParams.track = filters.track;
      if (filters.targetAudience) queryParams.targetAudience = filters.targetAudience;
      if (filters.sortBy) queryParams.sortBy = filters.sortBy;

      const res = await api.getCourses(queryParams);
      if (res.success) {
        let list = res.courses || [];

        // Client-side post-filter for duration if selected
        if (filters.duration) {
          list = list.filter(c => c.sessionDuration && c.sessionDuration.includes(filters.duration));
        }

        // Client-side post-filter for tuitionRange if selected
        if (filters.tuitionRange === 'under_3500') {
          list = list.filter(c => (c.priceSuggested?.amount || 0) <= 3500);
        } else if (filters.tuitionRange === '3500_5500') {
          list = list.filter(c => (c.priceSuggested?.amount || 0) >= 3500 && (c.priceSuggested?.amount || 0) <= 5500);
        } else if (filters.tuitionRange === 'above_5500') {
          list = list.filter(c => (c.priceSuggested?.amount || 0) > 5500);
        }

        setCourses(list);
      }
    } catch (err) {
      console.error('Error fetching filtered courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      track: 'all',
      targetAudience: '',
      duration: '',
      tuitionRange: '',
      sortBy: 'popular'
    });
    router.push('/courses');
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    filters.track !== 'all' ||
    Boolean(filters.targetAudience) ||
    Boolean(filters.duration) ||
    Boolean(filters.tuitionRange);

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header & Search Bar Banner */}
        <div className="bg-white rounded-3xl border border-[#e6ded1] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#b85d34] uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4 text-[#b85d34]" />
                <span>Verified Curriculums • Home-Friendly Tutoring</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
                Explore Quranic &amp; Academic Curriculums
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Structured Noorani Qaida, Tajweed, Hifz, and Cambridge/Matric syllabuses designed for Pakistani students with 1-on-1 verified tutor guidance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2.5 bg-[#f5ebe6] text-[#b85d34] border border-[#b85d34]/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4 text-[#b85d34]" />
              <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter & Sort Courses'}</span>
            </button>
          </div>

          {/* Search Bar + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search course title, syllabus topics (Nazra, Tajweed, Physics, Biology)..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e6ded1] rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#b85d34] shadow-xs font-medium"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Sort Dropdown */}
            <div className="w-full sm:w-64">
              <CustomSelect
                options={sortOptions}
                value={filters.sortBy}
                onChange={(val) => handleFilterChange('sortBy', val)}
                icon={ArrowUpDown}
                variant="filter"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Sidebar Filter + Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Filter Sidebar (Desktop + Mobile Toggle) */}
          <div className={`lg:col-span-4 xl:col-span-3 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <CourseFilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Courses Results Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {/* Header: Result Counts and Active Filter Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Showing <span className="text-emerald-700 font-extrabold">{courses.length}</span> Structured Courses
              </p>

              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                      <span>Category: {filters.category}</span>
                      <button onClick={() => handleFilterChange('category', '')} className="hover:text-emerald-950 font-bold">×</button>
                    </span>
                  )}
                  {filters.track !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                      <span>Track: {filters.track}</span>
                      <button onClick={() => handleFilterChange('track', 'all')} className="hover:text-emerald-950 font-bold">×</button>
                    </span>
                  )}
                  {filters.targetAudience && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                      <span>Audience: {filters.targetAudience}</span>
                      <button onClick={() => handleFilterChange('targetAudience', '')} className="hover:text-emerald-950 font-bold">×</button>
                    </span>
                  )}
                  {filters.duration && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                      <span>Duration: {filters.duration}m</span>
                      <button onClick={() => handleFilterChange('duration', '')} className="hover:text-emerald-950 font-bold">×</button>
                    </span>
                  )}
                  {filters.tuitionRange && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                      <span>Tuition Filtered</span>
                      <button onClick={() => handleFilterChange('tuitionRange', '')} className="hover:text-emerald-950 font-bold">×</button>
                    </span>
                  )}
                  <button
                    onClick={handleReset}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline underline-offset-2 ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Courses Display Grid */}
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No courses match your filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try changing your discipline selection, expanding the target audience, or resetting active search filters.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <CourseSearchContent />
    </Suspense>
  );
}
