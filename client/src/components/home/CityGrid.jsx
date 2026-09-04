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
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#faf8f5] border-b border-[#ebe3d3]">
      {/* Subtle warm glow */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-[#1e543c]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#d4a359]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f0e6] border border-[#ebe3d3] text-[#143d2b] text-xs font-bold shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Regional Coverage across Pakistan</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#141c19] tracking-tight leading-[1.18]">
              Connecting families with local &amp; nationwide educators.
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6e69] leading-relaxed">
              Find verified home tutors in major metropolitan centers, or take live 1-on-1 classes online with certified teachers from anywhere in Pakistan.
            </p>
          </div>

          <Link
            href="/tutors"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143d2b] hover:text-[#b85d34] transition-colors self-start sm:self-auto group"
          >
            <span>Browse All Pakistani Cities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {majorCities.map((city) => (
            <Link
              key={city._id}
              href={`/tutors/city/${encodeURIComponent(city.name.toLowerCase())}`}
              className="p-4 sm:p-5 rounded-3xl bg-white border border-[#ebe3d3] hover:border-[#143d2b] hover:shadow-md transition-all group space-y-3 min-w-0"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="p-2 bg-[#f5f0e6] text-[#143d2b] rounded-xl group-hover:bg-[#143d2b] group-hover:text-white transition-all shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#f0ece1] text-[#5e4e37] rounded-md truncate">
                  {city.province}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#141c19] group-hover:text-[#143d2b] transition-colors truncate">
                  {city.name}
                </h3>
                <p className="text-[11px] text-[#5c6e69] mt-0.5 truncate">
                  Online &amp; In-Person Home Tutors
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
