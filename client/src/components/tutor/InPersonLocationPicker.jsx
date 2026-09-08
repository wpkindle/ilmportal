'use client';

import React from 'react';
import {
  MapPin,
  Compass,
  RotateCcw,
  Home,
  ShieldCheck
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import { pakistaniCityAreas, allPakistaniCities } from '../../data/pakistanAreas';

export default function InPersonLocationPicker({
  city = '',
  area = '',
  exactLocation = '',
  address = '',
  onLocationChange,
  onAddressChange,
  onExactLocationChange,
  availableLocations = [],
  variant = 'sidebar' // 'sidebar' | 'modal' | 'banner'
}) {
  const currentExact = exactLocation || address || '';

  // Compute available city options
  const cityOptions = [
    { value: '', label: 'Select Pakistani City', sublabel: 'For Home Tuition' },
    ...allPakistaniCities.map((c) => ({
      value: c,
      label: c,
      sublabel: 'Pakistan'
    }))
  ];

  // Compute available areas for selected city
  const cityAreasList = city && pakistaniCityAreas[city] ? pakistaniCityAreas[city] : [];
  const areaOptions = [
    {
      value: '',
      label: city ? `All Areas in ${city}` : 'Select City First',
      sublabel: city ? 'City-wide coverage' : ''
    },
    ...cityAreasList.map((a) => ({
      value: a,
      label: a,
      sublabel: city
    }))
  ];

  const handleCityChange = (newCity) => {
    if (onLocationChange) {
      onLocationChange(newCity, '', currentExact);
    }
  };

  const handleAreaChange = (newArea) => {
    if (onLocationChange) {
      onLocationChange(city, newArea, currentExact);
    }
  };

  const handleExactChange = (newExact) => {
    if (onExactLocationChange) onExactLocationChange(newExact);
    if (onAddressChange) onAddressChange(newExact);
    if (onLocationChange) onLocationChange(city, area, newExact);
  };

  const handleClearAll = () => {
    if (onLocationChange) onLocationChange('', '', '');
    if (onExactLocationChange) onExactLocationChange('');
    if (onAddressChange) onAddressChange('');
  };

  const isModal = variant === 'modal';
  const isBanner = variant === 'banner';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 animate-in fade-in zoom-in-95 ${
        isModal
          ? 'bg-[#faf8f5] border-[#d4a359]/40 p-4 space-y-3.5 shadow-xs'
          : isBanner
          ? 'bg-gradient-to-r from-[#faf7f2] to-[#f4ebe1] border-[#d4a359]/60 p-3.5 sm:p-4 space-y-3 shadow-sm'
          : 'bg-gradient-to-b from-[#faf7f2] to-[#f4ebe1] border border-[#d4a359]/60 p-3.5 space-y-3 shadow-xs'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#e6ded1] pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative p-1.5 rounded-xl bg-[#0c2217] text-[#d4a359] shadow-2xs shrink-0">
            <Home className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 font-serif leading-tight truncate">
                In-Person Home Location
              </h4>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-[#0c2217] text-[#d4a359] rounded-md tracking-wider shrink-0">
                Home Visit
              </span>
            </div>
            <p className="text-[10px] text-stone-600 truncate mt-0.5">
              Select your city, local main area, and enter exact location
            </p>
          </div>
        </div>

        {(city || area || currentExact) && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[10px] font-bold text-stone-500 hover:text-[#b85d34] flex items-center gap-0.5 transition-colors cursor-pointer shrink-0"
            title="Clear in-person location"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 1. City Dropdown */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#0c2217]" />
          <span>City / District *</span>
        </label>
        <CustomSelect
          options={cityOptions}
          value={city}
          onChange={handleCityChange}
          placeholder="Select City in Pakistan"
          searchable={true}
          variant="filter"
        />
      </div>

      {/* 2. Local Main Area under City */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#0c2217]" />
            <span>Local Main Area</span>
          </label>
          {city && (
            <span className="text-[9px] font-bold text-[#0c2217] bg-[#f0ece1] px-1.5 py-0.5 rounded border border-[#d4a359]/30">
              {city}
            </span>
          )}
        </div>

        {cityAreasList.length > 0 ? (
          <CustomSelect
            options={areaOptions}
            value={area}
            onChange={handleAreaChange}
            placeholder={`Select Main Area in ${city}`}
            searchable={true}
            variant="filter"
          />
        ) : (
          <div className="p-2 bg-white rounded-xl border border-[#e6ded1] text-[11px] text-stone-500">
            {city
              ? `General coverage across ${city}`
              : 'Select your city above to choose local main area'}
          </div>
        )}
      </div>

      {/* Popular Quick Area Chips for Key Cities */}
      {cityAreasList.length > 0 && (
        <div className="space-y-1 pt-0.5">
          <span className="text-[10px] font-bold text-stone-500">
            Popular in {city}:
          </span>
          <div className="flex flex-wrap gap-1">
            {cityAreasList.slice(0, 5).map((quickArea) => {
              const isActive = area === quickArea;
              return (
                <button
                  key={quickArea}
                  type="button"
                  onClick={() => handleAreaChange(isActive ? '' : quickArea)}
                  className={`text-[10px] py-0.5 px-2 rounded-lg font-medium transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#b85d34] text-white border-[#b85d34] font-bold shadow-2xs'
                      : 'bg-white text-stone-700 hover:bg-[#ede5d8] border-[#e6ded1]'
                  }`}
                >
                  {quickArea}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Input box to write exact location */}
      <div className="space-y-1 pt-1 border-t border-[#e6ded1]">
        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
          <Home className="w-3 h-3 text-[#b85d34]" />
          <span>Exact Location / House / Street / Landmark *</span>
        </label>
        <input
          type="text"
          value={currentExact}
          onChange={(e) => handleExactChange(e.target.value)}
          placeholder="e.g. House #14, Street 7, Phase 5 (or nearest landmark)"
          className="w-full px-3 py-2 text-xs bg-white border border-[#e6ded1] rounded-xl text-slate-900 placeholder:text-stone-400 outline-none focus:border-[#b85d34] shadow-2xs font-medium"
        />
      </div>

      {/* Male Tutor Safety Notice */}
      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[10px] text-amber-900 flex items-start gap-1.5 leading-tight">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>In-Home Safety:</strong> 1-on-1 in-person visits are conducted exclusively by verified male tutors. Female Alimahs teach 100% online via WebRTC video for complete family privacy.
        </span>
      </div>
    </div>
  );
}
