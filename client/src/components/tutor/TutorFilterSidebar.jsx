'use client';

import React from 'react';
import { Filter, RotateCcw, MapPin, BookOpen, User, UserCheck, Video, ShieldCheck, Check, ArrowUpDown, Sparkles, Clock, Star, Award, GraduationCap } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

const sortSidebarOptions = [
  { value: 'popular', label: 'Most Popular', sublabel: 'Top Enrolled & Active' },
  { value: 'newest', label: 'Newly Joined', sublabel: 'Freshly Verified Faculty' },
  { value: 'rating', label: 'Highest Rated', sublabel: '5.0 Star Reviews' },
  { value: 'experience', label: 'Most Experienced', sublabel: 'Senior Teaching Faculty' }
];

const TutorFilterSidebar = ({
  filters,
  categories = [],
  locations = [],
  onFilterChange,
  onReset
}) => {
  // Format categories options
  const categoryOptions = [
    { value: '', label: 'All Subjects & Disciplines', sublabel: 'Quranic & Academic' },
    ...categories.map((c) => ({
      value: c.slug,
      label: c.name,
      sublabel: c.type === 'quran' ? 'Quranic Science' : 'Academic Program'
    }))
  ];

  // Format location options (Only cities with available tutors)
  const locationOptions = [
    { value: '', label: 'All Cities (Pakistan)', sublabel: 'Nationwide & Online' },
    ...locations.map((loc) => ({
      value: loc.name,
      label: loc.name,
      sublabel: loc.province || 'Available Tutors'
    }))
  ];

  const handleCityChange = (cityName) => {
    onFilterChange('city', cityName);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e6ded1] p-5 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e6ded1]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0c2217]" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 font-serif">Filter &amp; Sort</h3>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] font-bold text-slate-500 hover:text-[#b85d34] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Priority Female Safety Faculty Filters */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#faf6f2] to-[#f5ebe6] border border-[#d4a359]/50 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b85d34] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
            <span>Female Safety Filters</span>
          </span>
          {(filters.faculty === 'female_academic' || filters.faculty === 'alimah' || filters.faculty === 'female_quran') && (
            <button
              type="button"
              onClick={() => {
                onFilterChange('faculty', '');
              }}
              className="text-[10px] text-stone-500 hover:text-[#b85d34] font-semibold underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {/* 1. Female Academic Tutors */}
          <button
            type="button"
            onClick={() => {
              if (filters.faculty === 'female_academic') {
                onFilterChange('faculty', '');
              } else {
                onFilterChange('gender', 'female');
                onFilterChange('faculty', 'female_academic');
              }
            }}
            className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              filters.faculty === 'female_academic'
                ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-xs'
                : 'bg-white hover:bg-[#ede0d8] text-[#0c2217] border-[#e6ded1]'
            }`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className={`w-4 h-4 ${filters.faculty === 'female_academic' ? 'text-white' : 'text-[#b85d34]'}`} />
              <span>Female Academic Tutors</span>
            </div>
            {filters.faculty === 'female_academic' && (
              <Check className="w-4 h-4 text-white shrink-0" />
            )}
          </button>

          {/* 2. Female Quran Tutors */}
          <button
            type="button"
            onClick={() => {
              if (filters.faculty === 'alimah' || filters.faculty === 'female_quran') {
                onFilterChange('faculty', '');
              } else {
                onFilterChange('gender', 'female');
                onFilterChange('faculty', 'alimah');
              }
            }}
            className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              filters.faculty === 'alimah' || filters.faculty === 'female_quran'
                ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                : 'bg-white hover:bg-[#edf6f0] text-[#0c2217] border-[#e6ded1]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${filters.faculty === 'alimah' || filters.faculty === 'female_quran' ? 'text-[#d4a359]' : 'text-[#0c2217]'}`} />
              <span>Female Quran Tutors</span>
            </div>
            {(filters.faculty === 'alimah' || filters.faculty === 'female_quran') && (
              <Check className="w-4 h-4 text-[#d4a359] shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* 1. Sort Faculty Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Sort Faculty By</span>
        </label>
        <CustomSelect
          options={sortSidebarOptions}
          value={filters.sortBy || 'popular'}
          onChange={(val) => onFilterChange('sortBy', val)}
          placeholder="Sort Faculty"
          variant="filter"
        />
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onFilterChange('sortBy', 'popular')}
            className={`py-1.5 px-2 rounded-xl text-center text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
              (filters.sortBy || 'popular') === 'popular'
                ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-xs font-bold'
                : 'bg-[#f4efe8] border-[#e6dfd5] text-stone-700 hover:bg-[#eae3d8]'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${(filters.sortBy || 'popular') === 'popular' ? 'text-white' : 'text-[#b85d34]'}`} />
            <span>Most Popular</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('sortBy', 'newest')}
            className={`py-1.5 px-2 rounded-xl text-center text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
              filters.sortBy === 'newest'
                ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-xs font-bold'
                : 'bg-[#f4efe8] border-[#e6dfd5] text-stone-700 hover:bg-[#eae3d8]'
            }`}
          >
            <Clock className={`w-3 h-3 ${filters.sortBy === 'newest' ? 'text-white' : 'text-[#b85d34]'}`} />
            <span>Newly Joined</span>
          </button>
        </div>
      </div>

      {/* 2. Category / Subject Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Subject / Program</span>
        </label>
        <CustomSelect
          options={categoryOptions}
          value={filters.category || ''}
          onChange={(val) => onFilterChange('category', val)}
          placeholder="All Subjects & Disciplines"
          searchable={true}
          variant="filter"
        />
      </div>

      {/* 3. Tutoring Mode Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Tutoring Delivery Mode</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
          {[
            { label: 'All Modes', val: '' },
            { label: 'Online', val: 'online' },
            { label: 'In-Person', val: 'physical' }
          ].map((m) => (
            <button
              key={m.val}
              type="button"
              onClick={() => onFilterChange('mode', m.val)}
              className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                (filters.mode || '') === m.val
                  ? 'bg-[#b85d34] text-white font-bold shadow-sm border border-[#b85d34]'
                  : 'bg-[#f4efe8] text-stone-700 hover:bg-[#eae3d8] border border-[#e6dfd5]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. City Filter */}
      {filters.mode === 'physical' ? (
        <div className="space-y-2 p-3.5 bg-gradient-to-b from-[#faf7f2] to-[#f4ebe1] rounded-2xl border border-[#d4a359]/60 shadow-2xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0c2217]" />
              <span>City for In-Person Tuition</span>
            </label>
            {filters.city && (
              <button
                type="button"
                onClick={() => onFilterChange('city', '')}
                className="text-[10px] text-stone-500 hover:text-[#b85d34] font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <CustomSelect
            options={locationOptions}
            value={filters.city || ''}
            onChange={handleCityChange}
            placeholder="Select City (e.g. Lahore, Karachi)"
            searchable={true}
            variant="filter"
          />
          <p className="text-[10px] text-stone-600 leading-tight">
            Filter verified male faculty available for physical home tutoring in {filters.city || 'your city'}.
          </p>
        </div>
      ) : filters.mode === 'online' ? (
        <div className="p-3 rounded-2xl bg-[#f4f9f6] border border-emerald-200/80 text-[11px] text-emerald-900 space-y-1 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <Video className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>100% Online WebRTC Tutoring</span>
          </div>
          <p className="text-[10px] text-emerald-800 leading-tight">
            Encrypted in-browser video &amp; audio classes with camera-off privacy by default. Tutors teach nationwide across Pakistan and overseas.
          </p>
        </div>
      ) : (
        /* General City Filter for 'All Modes' */
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0c2217]" />
            <span>Pakistani City / Region (Optional)</span>
          </label>
          <CustomSelect
            options={locationOptions}
            value={filters.city || ''}
            onChange={handleCityChange}
            placeholder="All Cities (Pakistan)"
            searchable={true}
            variant="filter"
          />
        </div>
      )}

      {/* 6. Gender Preference Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#b85d34]" />
          <span>Tutor Gender</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
          {[
            { label: 'All', val: '' },
            { label: 'Male', val: 'male' },
            { label: 'Female', val: 'female' }
          ].map((g) => (
            <button
              key={g.val}
              type="button"
              onClick={() => {
                onFilterChange('gender', g.val);
                onFilterChange('faculty', '');
              }}
              className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                (filters.gender || '') === g.val
                  ? 'bg-[#b85d34] text-white font-bold shadow-sm border border-[#b85d34]'
                  : 'bg-[#f4efe8] text-stone-700 hover:bg-[#eae3d8] border border-[#e6dfd5]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Sanad / Degree Verified Only */}
      <div className="pt-2 border-t border-[#e6ded1]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.sanadVerified || false}
            onChange={(e) => onFilterChange('sanadVerified', e.target.checked)}
            className="w-4 h-4 accent-[#0c2217] rounded border-slate-300 cursor-pointer"
          />
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0c2217]" />
            <span>Sanad Verified Tutors Only</span>
          </div>
        </label>
      </div>

    </div>
  );
};

export default TutorFilterSidebar;
