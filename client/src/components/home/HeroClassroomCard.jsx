'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  Volume2,
  ShieldCheck,
  Star,
  Users,
  Sparkles,
  BookOpen,
  Clock,
  Radio
} from 'lucide-react';

export default function HeroClassroomCard() {
  const [seconds, setSeconds] = useState(2058); // 34m 18s
  const [waveform, setWaveform] = useState([45, 75, 90, 60, 85, 50, 95, 70, 80, 55, 85, 90, 65]);

  // 1. Exact 1-second interval for clock
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // 2. Waveform audio visualizer loop
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveform(prev => prev.map(() => Math.floor(Math.random() * 65) + 30));
    }, 300);
    return () => clearInterval(waveInterval);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      
      {/* Ambient Background Glow Behind Card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#d4a359]/30 via-[#b85d34]/20 to-[#d4a359]/30 rounded-3xl blur-2xl opacity-80 animate-pulse-glow pointer-events-none" />

      {/* Main Glassmorphism Live Classroom Simulation Container */}
      <div className="relative rounded-3xl bg-white/95 border-2 border-[#d4a359]/50 shadow-2xl backdrop-blur-2xl overflow-hidden p-4 sm:p-5 space-y-4">
        
        {/* Top Window Bar with Live Indicator & Running Clock */}
        <div className="flex items-center justify-between border-b border-[#ebe3d3] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-[#d4a359]" />
            </div>
            <div className="h-4 w-px bg-stone-300 ml-1" />
            <div className="flex items-center gap-1.5 bg-[#f5f0e6] border border-[#d4a359]/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#b85d34]">
              <Radio className="w-3 h-3 text-[#b85d34] animate-pulse" />
              <span>LIVE 1:1 WEBRTC CLASSROOM</span>
            </div>
          </div>

          {/* Session Running Clock (1 True Second per second) */}
          <div className="flex items-center gap-2 text-[#0c2217] text-xs font-mono bg-[#faf8f5] px-2.5 py-1 rounded-xl border border-[#ebe3d3] shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#b85d34]" />
            <span>{formatTimer(seconds)}</span>
          </div>
        </div>

        {/* Video Stage & Quran Reader Hybrid Interface */}
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-[#ebe3d3] aspect-[16/10] group">
          {/* Main Simulated Video Feed (Tutor Camera) */}
          <img
            src="/images/tutors/qari-huzaifa.jpg"
            alt="Qari Muhammad Huzaifa Live Session"
            className="w-full h-full object-cover object-top opacity-95 transition-transform duration-700 group-hover:scale-105"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

          {/* Floating Tajweed Quran Verse Viewer at Top */}
          <div className="absolute top-3 left-3 right-3 p-2.5 rounded-xl bg-white/95 border border-[#ebe3d3] backdrop-blur-md shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#f5f0e6] text-[#b85d34] rounded-lg">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#0c2217] leading-tight">Surah Al-Fatihah (Ayah 1-2)</p>
                <p className="text-[9px] text-[#b85d34] font-semibold">Makhraj &amp; Tajweed Rule: Al-Idgham</p>
              </div>
            </div>
            <span className="text-sm font-arabic text-[#0c2217] font-bold" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
          </div>

          {/* Student Picture-in-Picture (PiP) Window */}
          <div className="absolute bottom-3 right-3 w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 border-[#d4a359] shadow-2xl bg-stone-900">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
              alt="Student PiP"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
              Student (Hamza)
            </div>
          </div>

          {/* Tutor Info Overlay at Bottom Left */}
          <div className="absolute bottom-3 left-3 space-y-1.5">
            <div className="flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-xl border border-[#ebe3d3] backdrop-blur-md shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b85d34]" />
              <span className="text-xs font-bold text-[#0c2217]">Qari Muhammad Huzaifa</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#f5f0e6] text-[#0c2217] border border-[#ebe3d3] rounded font-bold uppercase">
                Sanad Verified Tutor
              </span>
            </div>

            {/* Live Audio Waveform */}
            <div className="flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-xl border border-[#ebe3d3] w-fit backdrop-blur-md shadow-md">
              <Mic className="w-3 h-3 text-[#b85d34] shrink-0" />
              <div className="flex items-end gap-0.5 h-3.5 px-1">
                {waveform.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-gradient-to-t from-[#d4a359] to-[#b85d34] rounded-full transition-all duration-300"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono font-semibold text-[#b85d34]">HD 48kHz</span>
            </div>
          </div>
        </div>

        {/* Live Metrics & Feature Strip */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-xs">
            <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>5.0 / 5.0</span>
            </div>
            <p className="text-[10px] text-[#52665b] font-semibold mt-0.5">1,450+ Verified Reviews</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#b85d34] font-black text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>All Over Pakistan</span>
            </div>
            <p className="text-[10px] text-[#52665b] font-semibold mt-0.5">Nationwide &amp; Overseas</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#b85d34] font-black text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3-Day Free</span>
            </div>
            <p className="text-[10px] text-[#52665b] font-semibold mt-0.5">Trial on All Courses</p>
          </div>
        </div>

      </div>
    </div>
  );
}
