'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Star,
  Clock,
  Award,
  Video
} from 'lucide-react';

const activities = [
  {
    id: 1,
    studentName: 'Zainab Malik',
    city: 'Islamabad',
    action: 'just booked a 3-Day Free Trial for',
    subject: 'Cambridge O-Level Physics',
    tutor: 'Engr. Bilal Ahmad',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    timeAgo: 'Just now',
    typeLabel: 'Free Trial',
    badgeClass: 'bg-[#d4a359]/20 text-[#d4a359] border-[#d4a359]/30'
  },
  {
    id: 2,
    studentName: 'Hamza Khan',
    city: 'Lahore',
    action: 'enrolled in live 1:1 classes for',
    subject: 'Tajweed al-Quran & Makharij',
    tutor: 'Qari Muhammad Huzaifa',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
    timeAgo: '1 min ago',
    typeLabel: 'Enrolled',
    badgeClass: 'bg-[#b85d34]/20 text-[#e07a4a] border-[#b85d34]/30'
  },
  {
    id: 3,
    studentName: 'Fatima Sheikh',
    city: 'Karachi',
    action: 'verified tuition payment via JazzCash for',
    subject: 'FSc Pre-Medical Biology',
    tutor: 'Dr. Ayesha Tariq',
    avatar: '/images/dr-ayesha.jpg',
    timeAgo: '2 mins ago',
    typeLabel: 'JazzCash Verified',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 4,
    studentName: 'Amina Rehman',
    city: 'Rawalpindi',
    action: 'booked online lessons for',
    subject: 'Noorani Qaida for Kids',
    tutor: 'Alimah Fatima Zahra',
    avatar: '/images/tutors/alimah-fatima.jpg',
    timeAgo: '3 mins ago',
    typeLabel: 'New Student',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 5,
    studentName: 'Ali Raza',
    city: 'Quetta',
    action: 'left a 5-Star Verified Review on',
    subject: 'Cambridge A-Level Mathematics',
    tutor: 'Engr. Bilal Ahmad',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&q=80',
    timeAgo: 'Just now',
    typeLabel: '5.0 Rating',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  {
    id: 6,
    studentName: 'Hassan Bilal',
    city: 'Peshawar',
    action: 'started 3-day free trial for',
    subject: 'Hifz al-Quran & Manzil Revision',
    tutor: 'Qari Muhammad Huzaifa',
    avatar: '/images/tutors/qari-huzaifa.jpg',
    timeAgo: '1 min ago',
    typeLabel: 'Free Trial',
    badgeClass: 'bg-[#d4a359]/20 text-[#d4a359] border-[#d4a359]/30'
  },
  {
    id: 7,
    studentName: 'Maryam Tariq',
    city: 'Faisalabad',
    action: 'enrolled in past paper revision for',
    subject: 'Matric Class 10 Science & Math',
    tutor: 'Dr. Ayesha Tariq',
    avatar: '/images/dr-ayesha.jpg',
    timeAgo: '2 mins ago',
    typeLabel: 'Matric Board',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 8,
    studentName: 'Usman Farooq',
    city: 'Multan',
    action: 'completed live video session for',
    subject: 'Tafseer & Quranic Translation',
    tutor: 'Ustadh Abdul Rahman',
    avatar: '/images/tutors/ustadh-abdul-rehman.jpg',
    timeAgo: 'Just now',
    typeLabel: 'Live Session Done',
    badgeClass: 'bg-[#d4a359]/20 text-[#d4a359] border-[#d4a359]/30'
  },
  {
    id: 9,
    studentName: 'Sara Ahmed',
    city: 'Sialkot',
    action: 'booked female tutor for',
    subject: 'Tajweed Rules & Daily Duas',
    tutor: 'Alimah Fatima Zahra',
    avatar: '/images/tutors/alimah-fatima.jpg',
    timeAgo: '1 min ago',
    typeLabel: 'Female Qaria',
    badgeClass: 'bg-[#b85d34]/20 text-[#e07a4a] border-[#b85d34]/30'
  },
  {
    id: 10,
    studentName: 'Bilal Chaudhry',
    city: 'Gujranwala',
    action: 'verified tuition payment via EasyPaisa for',
    subject: 'MDCAT Entry Test Chemistry',
    tutor: 'Dr. Ayesha Tariq',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&q=80',
    timeAgo: '3 mins ago',
    typeLabel: 'EasyPaisa Verified',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 11,
    studentName: 'Khadija Noor',
    city: 'Abbottabad',
    action: 'booked online lessons for',
    subject: 'Spoken Arabic & Sarf/Nahw',
    tutor: 'Ustadh Abdul Rahman',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&q=80',
    timeAgo: 'Just now',
    typeLabel: 'Free Trial',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 12,
    studentName: 'Danyal Shah',
    city: 'Muzaffarabad (AJK)',
    action: 'booked live home & online tutoring for',
    subject: 'Cambridge IGCSE Computer Science',
    tutor: 'Engr. Bilal Ahmad',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80',
    timeAgo: '2 mins ago',
    typeLabel: 'O/A Level',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  }
];

export default function LiveActivityToast() {
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) return;

    let isMounted = true;

    const scheduleNextCycle = () => {
      if (!isMounted) return;

      // 1. Show the toast
      setIsVisible(true);

      // 2. Keep toast visible for 4.2 seconds
      timeoutRef.current = setTimeout(() => {
        if (!isMounted) return;

        // 3. Hide the toast
        setIsVisible(false);

        // 4. Wait exactly 5.0 seconds delay before triggering the next toast
        timeoutRef.current = setTimeout(() => {
          if (!isMounted) return;

          // Advance to the next different activity
          setCurrentIndex((prev) => (prev + 1) % activities.length);

          // Recursively launch the next cycle
          scheduleNextCycle();
        }, 5000);

      }, 4200);
    };

    // Initial launch after 1 second
    timeoutRef.current = setTimeout(scheduleNextCycle, 1000);

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAdminRoute]);

  const isChatRoute = pathname?.includes('/messages');

  // If on admin, classroom, or messages chat routes, do not render toast
  if (isAdminRoute || pathname?.startsWith('/classroom') || isChatRoute) {
    return null;
  }

  // Handle user manual close (X): hides immediately, waits 5s delay, and launches next toast
  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
      setIsVisible(true);

      // Resume regular loop
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 4200);
    }, 5000);
  };

  const current = activities[currentIndex];

  return (
    <aside
      aria-label="Live Community Activity"
      className={`fixed bottom-36 left-3 sm:left-6 md:bottom-20 md:left-6 z-40 max-w-[320px] sm:max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-auto transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-6 opacity-0 pointer-events-none scale-95'
      }`}
    >
      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-950/95 border border-[#d4a359]/40 shadow-2xl shadow-black/80 backdrop-blur-2xl text-white relative group overflow-hidden">
        
        {/* Animated Shimmer Bar Across Top */}
        <div 
          key={currentIndex} 
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#d4a359] via-[#fde047] to-[#d4a359] animate-pulse" 
        />

        <div className="flex items-start gap-3">
          
          {/* Avatar with Live Gold Radar Dot */}
          <div className="relative shrink-0 mt-0.5">
            <img
              key={current.id}
              src={current.avatar}
              alt={current.studentName}
              className="w-10 h-10 rounded-2xl object-cover border border-[#d4a359]/40 shadow-md animate-in fade-in duration-300"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a359] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4a359] border-2 border-slate-950"></span>
            </span>
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <span className="text-white font-extrabold truncate">{current.studentName}</span>
              <span className="flex items-center gap-0.5 text-[#d4a359] text-[10px] shrink-0 font-bold">
                <MapPin className="w-2.5 h-2.5" />
                {current.city}
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{current.timeAgo}</span>
            </div>

            <p className="text-xs text-slate-200 mt-0.5 leading-snug">
              <span className="text-slate-400">{current.action} </span>
              <span className="font-bold text-[#d4a359]">{current.subject}</span>
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 truncate">
                with <span className="text-slate-200">{current.tutor}</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${current.badgeClass}`}>
                {current.typeLabel}
              </span>
            </div>
          </div>

          {/* Close / Next Toast Button */}
          <button
            onClick={handleClose}
            aria-label="Dismiss and queue next activity"
            title="Dismiss notification"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors absolute top-2 right-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </aside>
  );
}
