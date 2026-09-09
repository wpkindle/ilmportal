'use client';

import React from 'react';
import {
  Filter,
  RotateCcw,
  MapPin,
  BookOpen,
  User,
  UserCheck,
  Video,
  ShieldCheck,
  Check,
  ArrowUpDown,
  Sparkles,
  Clock,
  Star,
  Award,
  GraduationCap,
  Compass
} from 'lucide-react';
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

  const handleCityChange = (cityName) => {
    onFilterChange('city', cityName);
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

      {/* Specialization by Gender Selection */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#faf6f2] to-[#f5ebe6] border border-[#d4a359]/50 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b85d34] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#b85d34]" />
            <span>Specialization &amp; Gender</span>
          </span>
          {(filters.faculty || filters.gender) && (
            <button
              type="button"
              onClick={() => {
                onFilterChange('faculty', '');
                onFilterChange('gender', '');
              }}
              className="text-[10px] text-stone-500 hover:text-[#b85d34] font-semibold underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* 4 Core Specialization Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {/* 1. Female Quran / Alimah */}
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
            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              filters.faculty === 'alimah' || filters.faculty === 'female_quran'
                ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                : 'bg-white hover:bg-[#edf6f0] text-[#0c2217] border-[#e6ded1]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <ShieldCheck className={`w-3.5 h-3.5 ${filters.faculty === 'alimah' || filters.faculty === 'female_quran' ? 'text-[#d4a359]' : 'text-[#0c2217]'}`} />
              {(filters.faculty === 'alimah' || filters.faculty === 'female_quran') && (
                <Check className="w-3 h-3 text-[#d4a359]" />
              )}
            </div>
            <div className="mt-1">
              <p className="text-[11px] font-bold leading-tight">Female Quran</p>
              <p className={`text-[9px] ${filters.faculty === 'alimah' || filters.faculty === 'female_quran' ? 'text-white/80' : 'text-stone-500'}`}>Alimah / Tajweed</p>
            </div>
          </button>

          {/* 2. Female Academic */}
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
            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              filters.faculty === 'female_academic'
                ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-xs'
                : 'bg-white hover:bg-[#ede0d8] text-[#0c2217] border-[#e6ded1]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <GraduationCap className={`w-3.5 h-3.5 ${filters.faculty === 'female_academic' ? 'text-white' : 'text-[#b85d34]'}`} />
              {filters.faculty === 'female_academic' && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <div className="mt-1">
              <p className="text-[11px] font-bold leading-tight">Female Academic</p>
              <p className={`text-[9px] ${filters.faculty === 'female_academic' ? 'text-white/80' : 'text-stone-500'}`}>School &amp; College</p>
            </div>
          </button>

          {/* 3. Male Quran / Qari */}
          <button
            type="button"
            onClick={() => {
              if (filters.faculty === 'male_quran' || filters.faculty === 'qari') {
                onFilterChange('faculty', '');
              } else {
                onFilterChange('gender', 'male');
                onFilterChange('faculty', 'male_quran');
              }
            }}
            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              filters.faculty === 'male_quran' || filters.faculty === 'qari'
                ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-xs'
                : 'bg-white hover:bg-[#edf6f0] text-[#0c2217] border-[#e6ded1]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <BookOpen className={`w-3.5 h-3.5 ${filters.faculty === 'male_quran' || filters.faculty === 'qari' ? 'text-[#d4a359]' : 'text-[#0c2217]'}`} />
              {(filters.faculty === 'male_quran' || filters.faculty === 'qari') && (
                <Check className="w-3 h-3 text-[#d4a359]" />
              )}
            </div>
            <div className="mt-1">
              <p className="text-[11px] font-bold leading-tight">Male Quran</p>
              <p className={`text-[9px] ${filters.faculty === 'male_quran' || filters.faculty === 'qari' ? 'text-white/80' : 'text-stone-500'}`}>Qari / Hifz / Dars</p>
            </div>
          </button>

          {/* 4. Male Academic */}
          <button
            type="button"
            onClick={() => {
              if (filters.faculty === 'male_academic') {
                onFilterChange('faculty', '');
              } else {
                onFilterChange('gender', 'male');
                onFilterChange('faculty', 'male_academic');
              }
            }}
            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              filters.faculty === 'male_academic'
                ? 'bg-[#b85d34] text-white border-[#b85d34] shadow-xs'
                : 'bg-white hover:bg-[#ede0d8] text-[#0c2217] border-[#e6ded1]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <GraduationCap className={`w-3.5 h-3.5 ${filters.faculty === 'male_academic' ? 'text-white' : 'text-[#b85d34]'}`} />
              {filters.faculty === 'male_academic' && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <div className="mt-1">
              <p className="text-[11px] font-bold leading-tight">Male Academic</p>
              <p className={`text-[9px] ${filters.faculty === 'male_academic' ? 'text-white/80' : 'text-stone-500'}`}>STEM &amp; Board Tutors</p>
            </div>
          </button>
        </div>

        {/* Gender Filter Buttons */}
        <div className="pt-2 border-t border-[#ebe3d3]/80 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span>Filter Gender:</span>
            {filters.gender && (
              <span className="text-[10px] uppercase font-bold text-[#b85d34]">{filters.gender}</span>
            )}
          </label>
          <div className="grid grid-cols-3 gap-1 text-xs">
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
                className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-bold transition-all cursor-pointer border ${
                  (!filters.faculty && (filters.gender || '') === g.val)
                    ? 'bg-[#0c2217] text-white border-[#0c2217] shadow-2xs'
                    : 'bg-white text-stone-700 border-[#e6ded1] hover:border-stone-400'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
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

      {/* 4. City & Area Filter */}
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
                onClick={() => {
                  onFilterChange('city', '');
                  onFilterChange('area', '');
                }}
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

          {/* Linked Local Area dropdown */}
          {filters.city && (
            <div className="pt-2 border-t border-[#ebe3d3] space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">
                  Local Area in {filters.city}
                </label>
                {filters.area && (
                  <button
                    type="button"
                    onClick={() => onFilterChange('area', '')}
                    className="text-[9.5px] text-stone-500 hover:text-[#b85d34] font-semibold underline cursor-pointer"
                  >
                    Clear Area
                  </button>
                )}
              </div>
              {pakistaniCityAreas[filters.city] && pakistaniCityAreas[filters.city].length > 0 ? (
                <CustomSelect
                  options={[
                    { value: '', label: `All Areas in ${filters.city}`, sublabel: 'General Coverage' },
                    ...pakistaniCityAreas[filters.city].map((a) => ({
                      value: a,
                      label: a,
                      sublabel: filters.city
                    }))
                  ]}
                  value={filters.area || ''}
                  onChange={(val) => onFilterChange('area', val)}
                  placeholder={`Select Area in ${filters.city}`}
                  searchable={true}
                  variant="filter"
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Type area name in ${filters.city}...`}
                  value={filters.area || ''}
                  onChange={(e) => onFilterChange('area', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#ebe3d3] rounded-xl text-xs text-slate-900 font-medium outline-none focus:border-[#d4a359]"
                />
              )}
            </div>
          )}

          <p className="text-[10px] text-stone-600 leading-tight">
            Filter verified faculty available for physical home tutoring in {filters.city || 'your city'}.
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
        /* General City & Area Filter for 'All Modes' */
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0c2217]" />
              <span>Pakistani City &amp; Area</span>
            </label>
            {filters.city && (
              <button
                type="button"
                onClick={() => {
                  onFilterChange('city', '');
                  onFilterChange('area', '');
                }}
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
            placeholder="All Cities (Pakistan)"
            searchable={true}
            variant="filter"
          />

          {/* Linked Local Area dropdown */}
          {filters.city && (
            <div className="pt-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">
                  Local Area in {filters.city}
                </label>
                {filters.area && (
                  <button
                    type="button"
                    onClick={() => onFilterChange('area', '')}
                    className="text-[9.5px] text-stone-500 hover:text-[#b85d34] font-semibold underline cursor-pointer"
                  >
                    Clear Area
                  </button>
                )}
              </div>
              {pakistaniCityAreas[filters.city] && pakistaniCityAreas[filters.city].length > 0 ? (
                <CustomSelect
                  options={[
                    { value: '', label: `All Areas in ${filters.city}`, sublabel: 'General Coverage' },
                    ...pakistaniCityAreas[filters.city].map((a) => ({
                      value: a,
                      label: a,
                      sublabel: filters.city
                    }))
                  ]}
                  value={filters.area || ''}
                  onChange={(val) => onFilterChange('area', val)}
                  placeholder={`Select Area in ${filters.city}`}
                  searchable={true}
                  variant="filter"
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Type area name in ${filters.city}...`}
                  value={filters.area || ''}
                  onChange={(e) => onFilterChange('area', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#ebe3d3] rounded-xl text-xs text-slate-900 font-medium outline-none focus:border-[#d4a359]"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Sanad / Degree Verified Only */}
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
