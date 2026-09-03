'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Video,
  MessageSquare,
  Award,
  AlertTriangle,
  CheckCircle2,
  Users,
  Heart,
  Phone,
  ArrowRight,
  Sparkles,
  FileText,
  UserCheck,
  HelpCircle,
  Camera,
  Ban
} from 'lucide-react';

export default function SafetyPage() {
  const safetyPillars = [
    {
      id: 'female-safety',
      icon: Heart,
      badge: 'Protected & Supervised',
      title: 'Female Student & Family Privacy Guarantee',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      description:
        'In Pakistan, families value dignity, privacy, and peace of mind above all else. IlmPortal was built from the ground up to be a safe room for female learners and young children.',
      features: [
        'Verified Female Alimahs: Strict same-gender matching available for female students and young girls.',
        'Zero Personal Contact Exposure: Phone numbers, WhatsApp, and personal social handles are strictly prohibited and never revealed between tutors and students.',
        'Parent-Supervised Accounts: Parents have transparent dashboard access to review class attendance, syllabi, and communication histories.',
        'Private One-on-One Environments: Classes are never broadcast to public rooms or unvetted participants.'
      ]
    },
    {
      id: 'video-security',
      icon: Video,
      badge: 'Encrypted Peer-to-Peer',
      title: 'Live Video Classroom Safety & Control',
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-400 border-teal-500/30',
      description:
        'Our proprietary browser-based WebRTC classroom is engineered with defensive safety controls, ensuring students maintain total ownership of their camera and screen.',
      features: [
        'Camera OFF by Default: Every call initializes with camera disabled. You decide when and if you want to turn on video.',
        'Virtual & Blurred Background: Conceal your physical room surroundings before connecting to any session.',
        'Instant "Leave & Report" Shield: An always-visible emergency exit button terminates the call in milliseconds and alerts Lahore administration.',
        'Zero Unauthorized Recording: Screen recording and audio interception without explicit mutual consent are strictly banned under PECA 2016 regulations.'
      ]
    },
    {
      id: 'chat-safety',
      icon: MessageSquare,
      badge: 'Automated AI Moderation',
      title: 'Protected 1:1 In-Platform Messaging',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
      description:
        'Every message, deal negotiation, and voice note takes place inside our closed, end-to-end encrypted messaging infrastructure.',
      features: [
        'Continuous Anti-Harassment Scanning: Our automated safety engine monitors for abusive speech, intimidation, or inappropriate remarks.',
        'Anti-Contact Leak Protection: Prevents outside contact solicitation (phone/WhatsApp/bank transfers) to protect learners from scams and offline harassment.',
        'Message-Level Reporting: Flag any questionable message directly with 1 tap for immediate administrative review.',
        'One-Click Block & Restrict: Instantly sever communication with any user who violates platform codes of conduct.'
      ]
    },
    {
      id: 'sanad-verification',
      icon: Award,
      badge: 'Rigorous Background Checks',
      title: 'Sanad Degrees & Identity Verification',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      description:
        'We do not permit anonymous or unvetted teachers. Every educator on IlmPortal undergoes multi-step manual credential checks.',
      features: [
        'Wifaq-ul-Madaris Sanad Authentication: Quranic Qaris and Alimahs submit authenticated Shahadat-ul-Alimiyyah and Tajweed certificates.',
        'Academic Degrees: Cambridge O/A-Level and Matric/FSc tutors must provide verified transcripts and university degrees.',
        'CNIC & Identity Validation: Tutors are physically identified through Government CNIC records.',
        '256-Bit Encrypted Document Vault: All sensitive educator identity documents are stored in encrypted vaults and never made public.'
      ]
    }
  ];

  const trustBadges = [
    { label: 'SSL 256-Bit Encrypted', sub: 'End-to-End Transport Security' },
    { label: 'PECA 2016 Compliant', sub: 'Pakistan Cybercrime Law Protected' },
    { label: 'Sanad Verified Faculty', sub: 'Authentic Religious & Academic Degrees' },
    { label: 'Zero-Contact Leak Policy', sub: 'Complete Identity & Privacy Shield' }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-white pb-24">
      
      {/* 🛡️ Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-emerald-950/80">
        {/* Ambient Aurora Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -top-20 right-10 w-[500px] h-[350px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-xl backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pakistan’s Most Trusted &amp; Protected Online Learning Environment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Learn Safely, Learn Confidently —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Your Privacy is Sacred
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Whether you are a female student seeking a certified Alimah, a parent enrolling your child for Nazra Quran, or an educator teaching online, IlmPortal provides a zero-compromise safe room with encrypted video and moderated communication.
          </p>

          {/* Trust Certifications Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
            {trustBadges.map((badge, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-1"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white leading-tight">{badge.label}</span>
                <span className="text-[10px] text-slate-400 font-medium leading-snug">{badge.sub}</span>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/tutors?gender=female"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-700/30 transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-300 fill-rose-400" />
              <span>Browse Verified Female Tutors &amp; Alimahs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact-us"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contact Lahore Safety Helpline</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 🏛️ 4 Pillars of Protection */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-800 inline-block">
            Our 4-Pillar Security Framework
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How IlmPortal Keeps You Protected
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered with cultural sensitivity, family ethics, and technological safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safetyPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Radial Glow Header Accent */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-3.5 rounded-2xl border ${pillar.color} w-fit`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {pillar.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="space-y-2.5 pt-2">
                    {pillar.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Zero unauthorized data sharing</span>
                  <span className="text-emerald-400 font-bold">100% Protected</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📹 Live Video Classroom Safe-Room Protocol Breakdown */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800 inline-block">
              In-Session Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              The Live Video Classroom Safe Room
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built with dedicated controls so female learners and families feel in total command of their audio and video environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Camera Off by Default</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When entering a classroom, your camera is automatically off. You can conduct classes completely via audio and interactive whiteboard/Quran viewer without ever activating your camera.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <Ban className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Instant "Leave &amp; Report"</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If at any moment you feel uncomfortable or an instructor behaves unprofessionally, the red emergency button terminates the session instantly and blocks reconnection while logging the incident with Lahore staff.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Direct Peer-to-Peer Encryption</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Video and audio streams are encrypted end-to-end between student and instructor using DTLS-SRTP standards. Sessions are never recorded or stored on central servers without mutual written consent.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 📜 Legal & PECA 2016 Compliance */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Compliance with Pakistani Law</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Governed by Prevention of Electronic Crimes Act (PECA 2016)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              IlmPortal enforces zero tolerance for digital harassment, identity theft, or unauthorized media distribution under Section 21 and Section 24 of PECA 2016. Violators face immediate account expulsion and direct referral to the FIA Cybercrime Wing in Pakistan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/privacy-policy"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
            >
              Read Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </section>

      {/* 🚨 Emergency Escalation Banner */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-rose-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>24/7 Rapid Safety &amp; Trust Response</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white">
            Need Immediate Assistance or Wish to Report a Concern?
          </h4>
          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            Our dedicated trust and safety team in Lahore investigates all incident reports within 60 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <a
              href="mailto:safety@ilmportal.pk"
              className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-500/40 font-bold transition-all"
            >
              safety@ilmportal.pk
            </a>
            <a
              href="tel:+924235897860"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold transition-all"
            >
              +92 (42) 3589-7860
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
