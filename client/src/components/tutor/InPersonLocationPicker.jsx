'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  Home,
  ShieldCheck,
  Search,
  ChevronDown
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import { pakistaniCityAreas, allPakistaniCities } from '../../data/pakistanAreas';
import { detectUserLiveLocation } from '../../utils/geolocation';

export default function InPersonLocationPicker({
  city = '',
  area = '',
  onLocationChange,
  availableLocations = [],
  showAddressField = false,
  address = '',
  onAddressChange,
  variant = 'sidebar' // 'sidebar' | 'modal' | 'banner'
}) {
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [liveLocationInfo, setLiveLocationInfo] = useState(null);

  // Compute available city options
  // Prioritize active tutor cities from availableLocations, but include major Pakistani cities
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

  // Handle detecting live GPS location
  const handleDetectLive = async () => {
    setDetecting(true);
    setGeoError('');
    try {
      const loc = await detectUserLiveLocation();
      setLiveLocationInfo(loc);
      if (onLocationChange) {
        onLocationChange(loc.city, loc.area, true, loc);
      }
    } catch (err) {
      console.warn('Geolocation error:', err);
      setGeoError(err.message || 'Could not detect live location. Please select city manually.');
    } finally {
      setDetecting(false);
    }
  };

  const handleClearLive = () => {
    setLiveLocationInfo(null);
    setGeoError('');
  };

  const handleCityChange = (newCity) => {
    if (onLocationChange) {
      onLocationChange(newCity, '', false);
    }
    setLiveLocationInfo(null);
    setGeoError('');
  };

  const handleAreaChange = (newArea) => {
    if (onLocationChange) {
      onLocationChange(city, newArea, false);
    }
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
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-[#e6ded1] pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative p-1.5 rounded-xl bg-[#0c2217] text-[#d4a359] shadow-2xs shrink-0">
            <Home className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
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
              Select your residence or detect live GPS for home tutoring
            </p>
          </div>
        </div>

        {(city || area || liveLocationInfo) && (
          <button
            type="button"
            onClick={() => {
              if (onLocationChange) onLocationChange('', '', false);
              handleClearLive();
            }}
            className="text-[10px] font-bold text-stone-500 hover:text-[#b85d34] flex items-center gap-0.5 transition-colors cursor-pointer shrink-0"
            title="Clear in-person location"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 1. Live GPS Location Detection Button (Primary CTA) */}
      <div>
        <button
          type="button"
          onClick={handleDetectLive}
          disabled={detecting}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border shadow-sm ${
            detecting
              ? 'bg-[#f0ece1] text-stone-600 border-[#d4a359]/40 cursor-wait'
              : liveLocationInfo
              ? 'bg-[#0c2217] text-white border-[#0c2217] hover:bg-[#143022]'
              : 'bg-gradient-to-r from-[#0c2217] to-[#1a3828] hover:from-[#143022] hover:to-[#224835] text-white border-[#0c2217] active:scale-[0.99]'
          }`}
        >
          {detecting ? (
            <>
              <Compass className="w-4 h-4 text-[#d4a359] animate-spin shrink-0" />
              <span>Detecting Pakistani GPS Location...</span>
            </>
          ) : liveLocationInfo ? (
            <>
              <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">GPS Active: {liveLocationInfo.displayName}</span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded ml-auto shrink-0">
                ±{liveLocationInfo.accuracy || 15}m
              </span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-[#d4a359] shrink-0 animate-pulse" />
              <span>Detect My Live Location (GPS)</span>
              <span className="text-[10px] bg-[#d4a359]/20 text-[#d4a359] px-1.5 py-0.5 rounded font-mono ml-auto">
                Auto
              </span>
            </>
          )}
        </button>

        {/* Live Detected Info Pill */}
        {liveLocationInfo && (
          <div className="mt-2 p-2 bg-emerald-50/90 border border-emerald-300 rounded-xl flex items-center justify-between text-[11px] text-emerald-900">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold truncate">
                Matched: <strong className="font-bold text-emerald-950">{liveLocationInfo.city}</strong>
                {liveLocationInfo.area && ` (${liveLocationInfo.area})`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearLive}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline ml-2 shrink-0 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* Geolocation Error Alert */}
        {geoError && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px] flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-tight">
              <span>{geoError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[#e6ded1]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Or Select Manually
        </span>
        <div className="h-px flex-1 bg-[#e6ded1]" />
      </div>

      {/* 2. City Dropdown */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#0c2217]" />
          <span>City / District</span>
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

      {/* 3. Area / Sector Dropdown */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#0c2217]" />
            <span>Local Sector / Area</span>
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
            placeholder={`Select Area in ${city}`}
            searchable={true}
            variant="filter"
          />
        ) : (
          <div className="p-2 bg-white rounded-xl border border-[#e6ded1] text-[11px] text-stone-500">
            {city
              ? `General coverage across ${city}`
              : 'Select your city above to choose local sector'}
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

      {/* 4. Optional Full Residence Address / Landmark Field (for Deal / Hire Modals) */}
      {showAddressField && (
        <div className="space-y-1 pt-1 border-t border-[#e6ded1]">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <Home className="w-3 h-3 text-[#b85d34]" />
            <span>Residence Address / Landmark *</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange && onAddressChange(e.target.value)}
            placeholder="e.g. House #14, Street 7, Phase 5 (or nearest landmark)"
            className="w-full px-3 py-2 text-xs bg-white border border-[#e6ded1] rounded-xl text-slate-900 placeholder:text-stone-400 outline-none focus:border-[#b85d34]"
          />
        </div>
      )}

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
