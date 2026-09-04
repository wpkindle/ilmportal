'use client';

import React from 'react';
import {
  Filter,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  Sparkles,
  Clock,
  Baby,
  Users,
  CreditCard,
  Layers,
  GraduationCap
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

const sortOptions = [
  { value: 'popular', label: 'Most Popular', sublabel: 'Highest Lessons & Enrolled' },
  { value: 'newest', label: 'Newly Added', sublabel: 'Freshly Published Courses' },
  { value: 'price_low', label: 'Tuition: Low to High', sublabel: 'Budget Friendly' },
  { value: 'price_high', label: 'Tuition: High to Low', sublabel: 'Advanced Masterclasses' }
];

const trackOptions = [
  { value: 'all', label: 'All Curriculum Tracks', sublabel: 'Kids & Adults' },
  { value: 'kids', label: 'Kids Recitation Track', sublabel: 'Ages ~5–12' },
  { value: 'adult', label: 'Adults & Teens Track', sublabel: 'Ages 13+' }
];

const audienceOptions = [
  { value: '', label: 'All Target Audiences', sublabel: 'Universal Enrollment' },
  { value: 'Kids (Ages ~5–12)', label: 'Kids (Ages ~5–12)', sublabel: 'Pediatric Phonics' },
  { value: 'Teens & Adults (Ages 13+)', label: 'Teens & Adults (Ages 13+)', sublabel: 'Advanced Tajweed & Academics' },
  { value: 'Females Only', label: 'Females Only', sublabel: 'Dedicated Female Educators' }
];

const durationOptions = [
  { value: '', label: 'Any Session Duration', sublabel: '15m to 60m' },
  { value: '15–20', label: '15–20 minutes', sublabel: 'Kids High Retention' },
  { value: '30–45', label: '30–45 minutes', sublabel: 'Standard Lessons' },
  { value: '50–60', label: '50–60 minutes', sublabel: 'Intensive Masterclasses' }
];

const tuitionOptions = [
  { value: '', label: 'All Tuition Ranges', sublabel: 'Any monthly fee' },
  { value: 'under_3500', label: 'Under PKR 3,500/mo', sublabel: 'Economy Tracks' },
  { value: '3500_5500', label: 'PKR 3,500 – 5,500/mo', sublabel: 'Standard Courses' },
  { value: 'above_5500', label: 'Above PKR 5,500/mo', sublabel: 'MDCAT & Cambridge Prep' }
];

export default function CourseFilterSidebar({
  filters,
  categories = [],
  onFilterChange,
  onReset
}) {
  const categoryOptions = [
    { value: '', label: 'All Disciplines & Subjects', sublabel: 'Quranic & Academic' },
    { value: 'quran', label: 'Quran & Islamic Sciences', sublabel: 'Tajweed, Qaida, Hifz' },
    { value: 'academic', label: 'Academic & School Subjects', sublabel: 'Matric, FSc, O/A Levels' },
    ...categories.map((c) => ({
      value: c.slug,
      label: c.name,
      sublabel: c.type === 'quran' ? 'Quranic Science' : 'Academic Program'
    }))
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#e6ded1] p-5 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e6ded1]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0c2217]" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 font-serif">Filter &amp; Sort Courses</h3>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] font-bold text-slate-500 hover:text-[#b85d34] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Sort Courses By */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Sort Courses By</span>
        </label>
        <CustomSelect
          options={sortOptions}
          value={filters.sortBy || 'popular'}
          onChange={(val) => onFilterChange('sortBy', val)}
          placeholder="Sort Order"
          variant="filter"
        />
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onFilterChange('sortBy', 'popular')}
            className={`py-1.5 px-2 rounded-xl text-center text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
              filters.sortBy === 'popular'
                ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217] font-bold shadow-xs'
                : 'bg-[#f4efe8] text-stone-700 border-[#e6dfd5] hover:bg-[#eae3d8]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#d4a359]" />
            <span>Most Popular</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('sortBy', 'newest')}
            className={`py-1.5 px-2 rounded-xl text-center text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
              filters.sortBy === 'newest'
                ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217] font-bold shadow-xs'
                : 'bg-[#f4efe8] text-stone-700 border-[#e6dfd5] hover:bg-[#eae3d8]'
            }`}
          >
            <Clock className="w-3 h-3 text-[#d4a359]" />
            <span>Newly Added</span>
          </button>
        </div>
      </div>

      {/* 2. Discipline / Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Subject Discipline</span>
        </label>
        <CustomSelect
          options={categoryOptions}
          value={filters.category || ''}
          onChange={(val) => onFilterChange('category', val)}
          placeholder="All Subjects & Disciplines"
          searchable={categoryOptions.length > 6}
          variant="filter"
        />
      </div>

      {/* 3. Track Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Curriculum Track</span>
        </label>
        <CustomSelect
          options={trackOptions}
          value={filters.track || 'all'}
          onChange={(val) => onFilterChange('track', val)}
          placeholder="All Curriculum Tracks"
          variant="filter"
        />
      </div>

      {/* 4. Target Audience */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Target Audience</span>
        </label>
        <CustomSelect
          options={audienceOptions}
          value={filters.targetAudience || ''}
          onChange={(val) => onFilterChange('targetAudience', val)}
          placeholder="All Target Audiences"
          variant="filter"
        />
      </div>

      {/* 5. Session Duration */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Session Duration</span>
        </label>
        <CustomSelect
          options={durationOptions}
          value={filters.duration || ''}
          onChange={(val) => onFilterChange('duration', val)}
          placeholder="Any Session Duration"
          variant="filter"
        />
      </div>

      {/* 6. Tuition Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Monthly Tuition (PKR)</span>
        </label>
        <CustomSelect
          options={tuitionOptions}
          value={filters.tuitionRange || ''}
          onChange={(val) => onFilterChange('tuitionRange', val)}
          placeholder="All Tuition Ranges"
          variant="filter"
        />
      </div>

    </div>
  );
}

