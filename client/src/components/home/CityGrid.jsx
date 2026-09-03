'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

const CityGrid = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocs = async () => {
      try {
        const res = await api.getLocations();
        if (res.success) setLocations(res.locations);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocs();
  }, []);

  const majorCities = locations.filter(l => l.isMajorCity).slice(0, 8);

  return (
    <section className="py-12 sm:py-20 relative overflow-hidden bg-white border-b border-slate-200/80 bg-dot-matrix">
      {/* Unique Background Effect Layer 1: Ambient Map Glow Orbs */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Unique Background Effect Layer 2: Geographic Radar Pings */}
      <div className="absolute top-12 right-20 w-32 h-32 pointer-events-none hidden md:block">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-radar" />
        <div className="absolute inset-4 rounded-full border border-teal-500/40 animate-radar" style={{ animationDelay: '1.2s' }} />
        <div className="w-3 h-3 bg-emerald-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
      </div>

      <div className="absolute bottom-12 left-16 w-32 h-32 pointer-events-none hidden md:block">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/25 animate-radar" style={{ animationDelay: '2s' }} />
        <div className="w-2.5 h-2.5 bg-teal-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Unique Background Effect Layer 3: Topographic Elevation Isolines SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full text-emerald-900/10 stroke-current fill-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100 150 C 300 50, 600 250, 1400 80" strokeWidth="1.5" />
          <path d="M-100 200 C 350 100, 650 300, 1400 130" strokeWidth="1.2" strokeDasharray="6 4" />
          <path d="M-100 250 C 400 150, 700 350, 1400 180" strokeWidth="1.5" />
          <path d="M-100 300 C 450 200, 750 400, 1400 230" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>All Cities in Pakistan</span>
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Find Tutors in Your City
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Find verified teachers for online classes anywhere in Pakistan, or home tutors in your city.
            </p>
          </div>

          <Link
            href="/tutors"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 self-start sm:self-auto group"
          >
            <span>View All Cities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {majorCities.map((city) => (
            <Link
              key={city._id}
              href={`/tutors/city/${encodeURIComponent(city.name.toLowerCase())}`}
              className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/50 hover:border-emerald-300 hover:shadow-md transition-all group space-y-2 min-w-0"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="p-1.5 sm:p-2 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md truncate max-w-[75px] sm:max-w-none">
                  {city.province}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                  {city.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                  Online &amp; In-Person
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CityGrid;
