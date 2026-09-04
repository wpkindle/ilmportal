'use client';

import React from 'react';
import { Filter, RotateCcw, MapPin, BookOpen, User, Video, ShieldCheck, Navigation, ArrowUpDown, Sparkles, Clock, Star, Award } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import { pakistaniCityAreas } from '../../data/pakistanAreas';

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

  // Compute available local areas based on selected city
  const activeCity = filters.city;
  const cityAreasList = activeCity && pakistaniCityAreas[activeCity] ? pakistaniCityAreas[activeCity] : [];

  const areaOptions = [
    {
      value: '',
      label: activeCity ? `All Areas in ${activeCity}` : 'All Local Areas',
      sublabel: activeCity ? 'City-wide' : 'Select a city first'
    },
    ...cityAreasList.map((area) => ({
      value: area,
      label: area,
      sublabel: activeCity
    }))
  ];

  const handleCityChange = (cityName) => {
    onFilterChange('city', cityName);
    // Reset area when city changes
    onFilterChange('area', '');
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

      {/* Priority Female Alimah & Educator Quick Toggle */}
      <button
        type="button"
        onClick={() => onFilterChange('gender', filters.gender === 'female' ? '' : 'female')}
        className={`w-full p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
          filters.gender === 'female'
            ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-md shadow-[#b85d34]/25'
            : 'bg-[#f5ebe6] hover:bg-[#ebdcd3] text-[#b85d34] border-[#b85d34]/30'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${filters.gender === 'female' ? 'text-white' : 'text-[#b85d34]'}`} />
          <span>Female Alimahs &amp; Tutors Only</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
          filters.gender === 'female' ? 'bg-white/20 text-white' : 'bg-white text-[#b85d34] border border-[#b85d34]/30'
        }`}>
          {filters.gender === 'female' ? 'Selected' : 'Filter'}
        </span>
      </button>

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
                ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217] shadow-xs'
                : 'bg-[#f4efe8] border-[#e6dfd5] text-stone-700 hover:bg-[#eae3d8]'
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
                ? 'bg-[#0c2217] text-[#d4a359] border-[#0c2217] shadow-xs'
                : 'bg-[#f4efe8] border-[#e6dfd5] text-stone-700 hover:bg-[#eae3d8]'
            }`}
          >
            <Clock className="w-3 h-3 text-[#d4a359]" />
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

      {/* 3. City / Province Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Pakistani City / Region</span>
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

      {/* 4. Local Area / Sector Filter (Dynamic per City) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#0c2217]" />
            <span>Local Area / Sector</span>
          </label>
          {activeCity && (
            <span className="text-[10px] text-[#0c2217] font-bold px-1.5 py-0.5 rounded bg-[#f0ece1] border border-[#d4a359]/30">
              {activeCity}
            </span>
          )}
        </div>

        {cityAreasList.length > 0 ? (
          <CustomSelect
            options={areaOptions}
            value={filters.area || ''}
            onChange={(val) => onFilterChange('area', val)}
            placeholder={`Select Area in ${activeCity}`}
            searchable={true}
            variant="filter"
          />
        ) : (
          <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e6ded1] text-[11px] text-stone-500 font-medium">
            {activeCity
              ? `General coverage across ${activeCity}`
              : 'Select a major city above to filter by local area/sector'}
          </div>
        )}
      </div>

      {/* 5. Tutoring Mode Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-[#0c2217]" />
          <span>Tutoring Mode</span>
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
                  ? 'bg-[#0c2217] text-[#d4a359] font-bold shadow-sm border border-[#0c2217]'
                  : 'bg-[#f4efe8] text-stone-700 hover:bg-[#eae3d8] border border-[#e6dfd5]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Gender Preference Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#0c2217]" />
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
              onClick={() => onFilterChange('gender', g.val)}
              className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                (filters.gender || '') === g.val
                  ? 'bg-[#0c2217] text-[#d4a359] font-bold shadow-sm border border-[#0c2217]'
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
