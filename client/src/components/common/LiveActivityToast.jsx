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
    action: 'booked 1:1 lessons for',
    subject: 'Board Exam Physics (SSC & HSSC)',
    tutor: 'Engr. Bilal Ahmad',
    avatar: '/images/students/zainab-malik.jpg',
    timeAgo: 'Just now',
    typeLabel: 'New Student',
    badgeClass: 'bg-[#d4a359]/20 text-[#d4a359] border-[#d4a359]/30'
  },
  {
    id: 2,
    studentName: 'Hamza Khan',
    city: 'Lahore',
    action: 'enrolled in live 1:1 classes for',
    subject: 'Tajweed al-Quran & Makharij',
    tutor: 'Qari Muhammad Huzaifa',
    avatar: '/images/students/hamza-khan.jpg',
    timeAgo: '2 hours ago',
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
    avatar: '/images/students/fatima-sheikh.jpg',
    timeAgo: '5 hours ago',
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
    avatar: '/images/students/amina-rehman.jpg',
    timeAgo: 'Yesterday',
    typeLabel: 'New Student',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 5,
    studentName: 'Ali Raza',
    city: 'Quetta',
    action: 'left a 5-Star Verified Review on',
    subject: 'Board Mathematics & Algebra',
    tutor: 'Engr. Bilal Ahmad',
    avatar: '/images/students/ali-raza.jpg',
    timeAgo: '3 hours ago',
    typeLabel: '5.0 Rating',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  {
    id: 6,
    studentName: 'Hassan Bilal',
    city: 'Peshawar',
    action: 'enrolled in live sessions for',
    subject: 'Hifz al-Quran & Manzil Revision',
    tutor: 'Qari Muhammad Huzaifa',
    avatar: '/images/students/hassan-bilal.jpg',
    timeAgo: '2 days ago',
    typeLabel: 'Enrolled',
    badgeClass: 'bg-[#d4a359]/20 text-[#d4a359] border-[#d4a359]/30'
  },
  {
    id: 7,
    studentName: 'Maryam Tariq',
    city: 'Faisalabad',
    action: 'enrolled in past paper revision for',
    subject: 'Matric Class 10 Science & Math',
    tutor: 'Dr. Ayesha Tariq',
    avatar: '/images/students/maryam-tariq.jpg',
    timeAgo: '18 mins ago',
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
    avatar: '/images/students/usman-farooq.jpg',
    timeAgo: '1 day ago',
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
    avatar: '/images/students/sara-ahmed.jpg',
    timeAgo: '3 days ago',
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
    avatar: '/images/students/bilal-chaudhry.jpg',
    timeAgo: '8 hours ago',
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
    avatar: '/images/students/khadija-noor.jpg',
    timeAgo: '4 hours ago',
    typeLabel: 'New Student',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 12,
    studentName: 'Danyal Shah',
    city: 'Muzaffarabad (AJK)',
    action: 'booked live home & online tutoring for',
    subject: 'Board Computer Science & Coding',
    tutor: 'Engr. Bilal Ahmad',
    avatar: '/images/students/danyal-shah.jpg',
    timeAgo: '4 days ago',
    typeLabel: 'Academic',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  }
];

export default function LiveActivityToast() {
  // Live activity toast disabled per user request
  return null;
}
