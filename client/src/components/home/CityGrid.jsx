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
    <section className="py-16 sm:py-24 relative overflow-hidden bg-section-cities border-b border-[#ebe3d3]">
      {/* Precision architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid opacity-35 pointer-events-none" />

      {/* Subtle top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/35 to-transparent pointer-events-none" />

      {/* Animated floating ambient glows */}
      <div className="absolute top-1/2 left-10 w-[480px] h-[480px] bg-[#10b981]/7 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-[#d4a359]/8 rounded-full blur-[130px] pointer-events-none animate-float-reverse" />

      {/* Drifting horizontal light sweep */}
      <div className="absolute top-1/3 inset-x-12 h-px bg-gradient-to-r from-transparent via-[#10b981]/25 via-[#d4a359]/25 to-transparent pointer-events-none animate-light-sweep" />

      {/* Precision architectural coordinate crosshairs */}
      <div className="hidden sm:block absolute top-6 left-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute top-6 right-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 left-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 right-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>

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

      {/* Subtle Bottom Accent Ribbon */}
      <div className="absolute inset-x-0 bottom-0 section-divider-ribbon-subtle" />
    </section>
  );
};

export default CityGrid;
