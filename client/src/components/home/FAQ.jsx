'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How does tutoring work on IlmPortal for Pakistani families?',
    a: 'You can search verified Quran teachers and school tutors by subject, city, and teacher gender. You chat directly with the teacher for free to discuss class days and mutually agree on a monthly fee (PKR). 1-on-1 live video classes happen right in your internet browser with camera-off privacy by default.'
  },
  {
    q: 'Do I or my child need to download Zoom, Skype, or any software?',
    a: 'No! Zero app downloads required. Classes take place directly inside your web browser (Chrome, Edge, Safari, Firefox, or mobile browser) with crystal-clear audio, interactive screen sharing, digital Quran reader, and digital blackboard.'
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
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#faf8f5] border-b border-[#ebe3d3]">
      {/* Embedded FAQPage Schema for Rich Search Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Subtle warm ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#d4a359]/5 rounded-full blur-[140px] pointer-events-none" />

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
    </section>
  );
}
