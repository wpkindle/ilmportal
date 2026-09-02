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
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/25 to-emerald-400/30 rounded-3xl blur-2xl opacity-80 animate-pulse-glow pointer-events-none" />

      {/* Main Glassmorphism Live Classroom Simulation Container */}
      <div className="relative rounded-3xl bg-slate-900/85 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl overflow-hidden p-4 sm:p-5 space-y-4">
        
        {/* Top Window Bar with Live Indicator & Running Clock */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="h-4 w-px bg-white/20 ml-1" />
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-300">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>LIVE 1:1 WEBRTC CLASSROOM</span>
            </div>
          </div>

          {/* Session Running Clock (1 True Second per second) */}
          <div className="flex items-center gap-2 text-slate-300 text-xs font-mono bg-slate-950/70 px-2.5 py-1 rounded-xl border border-white/10">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatTimer(seconds)}</span>
          </div>
        </div>

        {/* Video Stage & Quran Reader Hybrid Interface */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 aspect-[16/10] group">
          {/* Main Simulated Video Feed (Tutor Camera) */}
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
            alt="Qari Muhammad Huzaifa Live Session"
            className="w-full h-full object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-105"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/40" />

          {/* Floating Tajweed Quran Verse Viewer at Top */}
          <div className="absolute top-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-tight">Surah Al-Fatihah (Ayah 1-2)</p>
                <p className="text-[9px] text-emerald-400 font-medium">Makhraj & Tajweed Rule: Al-Idgham</p>
              </div>
            </div>
            <span className="text-sm font-arabic text-emerald-200 font-bold" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
          </div>

          {/* Student Picture-in-Picture (PiP) Window */}
          <div className="absolute bottom-3 right-3 w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 border-emerald-500/80 shadow-2xl bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
              alt="Student PiP"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
              Student (Hamza)
            </div>
          </div>

          {/* Tutor Info Overlay at Bottom Left */}
          <div className="absolute bottom-3 left-3 space-y-1.5">
            <div className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-white/20 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white">Qari Muhammad Huzaifa</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-black uppercase">
                Sanad Verified
              </span>
            </div>

            {/* Live Audio Waveform */}
            <div className="flex items-center gap-1 bg-slate-950/85 px-2.5 py-1 rounded-xl border border-emerald-500/30 w-fit backdrop-blur-md">
              <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="flex items-end gap-0.5 h-3.5 px-1">
                {waveform.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full transition-all duration-300"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-emerald-300">HD 48kHz</span>
            </div>
          </div>
        </div>

        {/* Live Metrics & Feature Strip */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>5.0 / 5.0</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">1,450+ Verified Reviews</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center gap-1 text-emerald-400 font-black text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>All Over Pakistan</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Nationwide &amp; Overseas</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center gap-1 text-teal-300 font-black text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3-Day Free</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Trial on All Courses</p>
          </div>
        </div>

      </div>
    </div>
  );
}
