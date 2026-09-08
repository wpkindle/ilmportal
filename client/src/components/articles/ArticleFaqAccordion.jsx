'use client';

import React, { useState } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';

export default function ArticleFaqAccordion({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (idx) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#ebe3d3] p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3.5">
        <h2 className="text-xl sm:text-2xl font-black font-serif text-[#0c2217] flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-[#d4a359]" />
          <span>Frequently Asked Questions</span>
        </h2>
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
          {faqs.length} Questions
        </span>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden transition-all duration-200 border ${
                isOpen
                  ? 'border-[#d4a359]/60 bg-[#faf6ee] shadow-2xs'
                  : 'border-[#ebe3d3] bg-[#faf8f5] hover:bg-[#f5efe4]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-3.5 cursor-pointer select-none group"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                    isOpen ? 'bg-[#0c2217] text-[#f5d996]' : 'bg-[#efe9dc] text-[#0c2217] group-hover:bg-[#e4dcce]'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm md:text-[15px] font-bold font-serif text-[#0c2217] leading-snug">
                    {faq.question}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-90 text-[#b85d34]' : 'text-stone-400 group-hover:text-[#0c2217]'
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 pl-14 text-xs sm:text-sm md:text-[15px] text-stone-700 leading-[1.75] border-t border-[#ebe3d3]/70 bg-white/90">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
