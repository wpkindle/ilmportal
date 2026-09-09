'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How does tutoring work on IlmiDunya for Pakistani families?',
    a: 'IlmiDunya offers two flexible learning modes: Home-Based In-Person Tuitions (vetted teachers visiting your residence in your city) and 1-on-1 Live Online Classes (browser-native WebRTC with camera-off privacy by default). You can filter tutors by city, subject, and teacher gender, chat directly inside the platform with zero phone number exposure, and agree on an honest monthly fee in PKR.'
  },
  {
    q: 'Do you ask for or require my personal phone number or WhatsApp?',
    a: 'No, never. We do not ask for or require personal phone numbers or WhatsApp details from either students or tutors. All inquiries, scheduling, and lesson discussions happen safely inside our protected in-platform messaging system, shielding your family from spam, unwanted calls, and off-platform harassment.'
  },
  {
    q: 'Can I find Home-Based In-Person tuitions in my city?',
    a: 'Yes, absolutely! IlmiDunya is fully focused on both Home-Based In-Person tuitions and 1-on-1 Live Online classes. You can filter verified male and female tutors by your specific Pakistani city (such as Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and more) and local neighborhood to find a tutor who can visit your home.'
  },
  {
    q: 'Do I or my child need to download Zoom, Skype, or any software?',
    a: 'No! Zero app downloads required. Online classes take place directly inside your web browser (Chrome, Edge, Safari, Firefox, or mobile browser) with crystal-clear audio, interactive screen sharing, digital Quran reader, and digital blackboard.'
  },
  {
    q: 'How are Quran Qaris and academic tutors verified?',
    a: 'Every teacher must submit their national CNIC identity card, university degrees, and authenticated Quran Sanads (such as Wafaq-ul-Madaris diplomas). Our Lahore administration manually reviews each document and verifies credentials before approving the teacher profile.'
  },
  {
    q: 'How are monthly fees paid to the teacher?',
    a: 'You pay easily via EasyPaisa, JazzCash, or direct bank transfer (e.g. Meezan Bank, HBL, or Raast). You upload a simple transaction screenshot in your portal for immediate administrative clearance.'
  },
  {
    q: 'Can daughters and young children learn exclusively from female teachers?',
    a: 'Yes, absolutely. We have a dedicated female tutor directory. Families can filter specifically for qualified female teachers (Alimahs) with complete privacy guarantees and camera-off defaults.'
  }
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a
    }
  }))
};

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-section-faq border-b border-[#ebe3d3]">
      {/* Embedded FAQPage Schema for Rich Search Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Precision architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid opacity-40 pointer-events-none" />

      {/* Subtle top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/35 to-transparent pointer-events-none" />

      {/* Animated floating ambient glows */}
      <div className="absolute top-1/3 -left-20 w-[550px] h-[450px] bg-[#d4a359]/9 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-[#10b981]/7 rounded-full blur-[140px] pointer-events-none animate-float-reverse" />


      {/* Precision architectural coordinate crosshairs */}
      <div className="hidden sm:block absolute top-6 left-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute top-6 right-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 left-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 right-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Editorial Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f0e6] border border-[#ebe3d3] text-[#0c2217] text-xs font-bold shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Clear Answers for Families</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#141c19] tracking-tight leading-[1.18]">
            Frequently asked questions about learning from home.
          </h2>

          <p className="text-xs sm:text-sm text-[#5c6e69] leading-relaxed">
            Straightforward answers to the most common questions Pakistani parents ask us about our tutors, privacy rules, and fee structure.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-[#143d2b] shadow-md'
                    : 'border-[#ebe3d3] shadow-2xs hover:border-[#143d2b]/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif font-bold text-sm sm:text-base text-[#141c19]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#81928e] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#143d2b]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#5c6e69] leading-relaxed border-t border-[#ebe3d3]/70 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Luminous Bottom Section Divider Ribbon transitioning to Dark Footer */}
      <div className="absolute inset-x-0 bottom-0 section-divider-ribbon" />
    </section>
  );
}
