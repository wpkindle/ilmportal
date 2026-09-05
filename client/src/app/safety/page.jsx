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
  ArrowRight,
  Sparkles,
  Camera,
  Ban,
  Mail,
  UserCheck
} from 'lucide-react';

export default function SafetyPage() {
  const safetyPillars = [
    {
      id: 'female-safety',
      icon: ShieldCheck,
      badge: 'Protected & Supervised',
      title: 'Complete Female Comfort & Privacy Guarantee',
      color: 'bg-[#f5ebe6] text-[#b85d34] border-[#b85d34]/30',
      description:
        'This platform was created specifically with female comfort and dignity in mind. Pakistani mothers, daughters, and female educators must never have any concerns about their privacy.',
      features: [
        'Verified Female Alimahs: Strict same-gender matching available for female students, daughters, and sisters.',
        'Camera-Off by Default: Students are never pressured for video. Recite Quran and learn school subjects via audio, interactive whiteboard, and screen sharing.',
        'Zero Personal Contact Exposure: Personal phone numbers, WhatsApp, and social profiles are strictly forbidden from being shared to prevent harassment.',
        'Parent-Supervised Accounts: Parents have transparent dashboard access to monitor class attendance, teacher notes, and learning progress.'
      ]
    },
    {
      id: 'video-security',
      icon: Video,
      badge: 'Encrypted Peer-to-Peer',
      title: 'Live Video Classroom Safe-Room Protocol',
      color: 'bg-[#f0ece1] text-[#0c2217] border-[#d4a359]/40',
      description:
        'Our proprietary browser classroom gives students total ownership over their camera, microphone, and learning space without downloading third-party software.',
      features: [
        'Camera OFF Initializer: Every session launches with video disabled. You decide if and when to turn on video.',
        'Virtual & Blurred Background: Conceal your room surroundings with one click before joining any live session.',
        'Instant "Leave & Report" Shield: An always-visible red emergency exit button terminates the call in milliseconds and alerts administrators.',
        'Strict Recording Ban: Screen recording or audio interception without explicit mutual consent is strictly illegal under PECA 2016.'
      ]
    },
    {
      id: 'chat-safety',
      icon: MessageSquare,
      badge: 'Automated AI Moderation',
      title: 'Protected 1:1 In-Platform Messaging',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      description:
        'Every message, deal negotiation, and inquiry stays inside our encrypted platform infrastructure, keeping personal information completely shielded.',
      features: [
        'Continuous Anti-Harassment Scanning: Our automated safety engine monitors for offensive language, intimidation, or inappropriate remarks.',
        'Contact Leak Prevention: Automatically prevents sharing outside phone/WhatsApp numbers to protect learners from off-platform harassment.',
        '1-Tap Message Reporting: Flag any questionable message instantly for immediate administrative review by our Lahore team.',
        'One-Click Block & Restrict: Immediately terminate communication with any user who violates platform codes of conduct.'
      ]
    },
    {
      id: 'sanad-verification',
      icon: Award,
      badge: 'Rigorous Background Checks',
      title: 'Sanad Degrees & Identity Verification',
      color: 'bg-[#f0ece1] text-[#0c2217] border-[#d4a359]/40',
      description:
        'We do not allow anonymous or unvetted teachers. Every educator on IlmiDunya undergoes multi-step manual credential checks.',
      features: [
        'Wafaq-ul-Madaris Sanad Authentication: Quranic Qaris and Alimahs submit authenticated Shahadat-ul-Alimiyyah and Tajweed certificates.',
        'Academic Degrees: Cambridge O/A-Level and Matric/FSc tutors must provide verified transcripts and university degrees.',
        'CNIC & Identity Validation: Tutors are physically identified through Government CNIC records.',
        '256-Bit Encrypted Document Vault: All sensitive educator identity documents are stored in encrypted vaults and never made public.'
      ]
    }
  ];

  const trustBadges = [
    { label: 'Female-First Privacy', sub: 'Camera-Off & Purdah-Safe' },
    { label: 'PECA 2016 Compliant', sub: 'Pakistan Cybercrime Law Protected' },
    { label: 'Sanad Verified Faculty', sub: 'Authentic Religious & Academic Degrees' },
    { label: 'Zero-Contact Leak Policy', sub: 'No Personal Phone Numbers Exposed' }
  ];

  return (
    <div className="bg-[#faf8f5] text-[#1c2826] min-h-screen selection:bg-[#b85d34] selection:text-white pb-24 font-sans">
      
      {/* Hero Section in Deep Forest Green */}
      <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden bg-[#0c2217] text-[#f5f0e6] border-b border-[#143d2b]">
        {/* Subtle Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#1e543c]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[450px] h-[300px] bg-[#d4a359]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4a359_0.6px,transparent_0.6px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#143d2b] border border-[#d4a359]/40 text-[#d4a359] text-xs font-bold shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Designed Especially for Females &amp; Pakistani Families</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Complete Female Comfort, Privacy &amp;{' '}
            <span className="hand-drawn-underline text-[#faf8f5]">Peace of Mind.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#d1dbd6] max-w-2xl mx-auto leading-relaxed font-normal">
            This web portal is built with female safety as our highest priority. Whether you are a female student seeking a certified Alimah, a mother enrolling her daughter for Tajweed, or a female educator teaching from home — your dignity, privacy, and personal information are 100% protected.
          </p>

          {/* Trust Certifications Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
            {trustBadges.map((badge, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#143d2b]/60 border border-[#d4a359]/30 shadow-sm flex flex-col items-center justify-center text-center space-y-1"
              >
                <div className="w-2 h-2 rounded-full bg-[#d4a359] animate-pulse" />
                <span className="text-xs font-bold text-white leading-tight">{badge.label}</span>
                <span className="text-[10px] text-[#a3b8b0] font-medium leading-snug">{badge.sub}</span>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/tutors?gender=female"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#b85d34]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Browse Verified Female Alimahs &amp; Tutors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="mailto:contact@ilmportal.org"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#143d2b] hover:bg-[#1e543c] text-[#f5f0e6] font-bold text-xs sm:text-sm rounded-xl border border-[#d4a359]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#d4a359]" />
              <span>Safety Helpline: contact@ilmportal.org</span>
            </a>
          </div>

        </div>
      </section>

      {/* 4 Pillars of Protection on Warm Sand */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#b85d34] bg-[#f5ebe6] px-3.5 py-1 rounded-full border border-[#b85d34]/20 inline-block">
            Our 4-Pillar Security Framework
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">
            How IlmiDunya Keeps Female Learners &amp; Families Safe
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered with deep cultural sensitivity, family ethics, and modern privacy technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safetyPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm border border-[#e6ded1] hover:border-[#b85d34]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-3 rounded-xl border ${pillar.color} w-fit`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-[#f5f0e6] text-slate-700 border border-[#e6ded1]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-black text-slate-900">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {pillar.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="space-y-2.5 pt-2">
                    {pillar.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#e6ded1] text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Zero personal contact leaks</span>
                  <span className="text-[#0c2217] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>100% Protected</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Video Classroom Safe-Room Protocol Breakdown */}
      <section className="py-16 bg-[#f5f0e6] border-y border-[#e6ded1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0c2217] bg-[#e8e0d3] px-3.5 py-1 rounded-full border border-[#d8cfc0] inline-block">
              In-Session Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
              The Live Video Classroom Safe Room
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Built with dedicated privacy controls so female learners and families feel in total command of their audio and video environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#e6ded1] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center border border-[#d4a359]/40">
                <Camera className="w-5 h-5 text-[#d4a359]" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">Camera Off by Default</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When entering any classroom, your camera is automatically disabled. Female students can conduct full Quran recitation and academic classes via audio and interactive digital Quran without ever turning on their camera.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#e6ded1] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                <Ban className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">Instant Emergency Exit</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If at any moment you feel uncomfortable, the red emergency exit button terminates the session instantly and blocks reconnection while alerting administration in Lahore.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#e6ded1] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">Direct Peer-to-Peer Encryption</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Audio and video streams are encrypted end-to-end between student and tutor. Sessions are never recorded or stored on central servers, ensuring complete privacy.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Legal & PECA 2016 Compliance */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-[#0c2217] text-[#f5f0e6] border border-[#d4a359]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d4a359]">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Compliance with Pakistani Law</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
              Governed by Prevention of Electronic Crimes Act (PECA 2016)
            </h3>
            <p className="text-xs text-[#d1dbd6] leading-relaxed">
              IlmiDunya enforces zero tolerance for digital harassment, identity impersonation, or unauthorized media distribution under Section 21 and Section 24 of PECA 2016. Violators face immediate account expulsion and direct referral to the FIA Cybercrime Wing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/privacy-policy"
              className="px-5 py-2.5 rounded-xl bg-[#143d2b] hover:bg-[#1e543c] text-white font-bold text-xs border border-[#d4a359]/40 transition-colors"
            >
              Read Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="px-5 py-2.5 rounded-xl bg-[#143d2b] hover:bg-[#1e543c] text-white font-bold text-xs border border-[#d4a359]/40 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Escalation Banner */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-rose-700 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>24/7 Rapid Safety &amp; Trust Response</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
            Need Immediate Assistance or Wish to Report a Concern?
          </h4>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Our dedicated trust and safety team in Lahore investigates all incident reports within 60 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <a
              href="mailto:contact@ilmportal.org"
              className="px-5 py-2.5 rounded-xl bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold transition-all shadow-md"
            >
              Email Safety Team: contact@ilmportal.org
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
