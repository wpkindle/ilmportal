'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function ArticleFaqAccordion({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (idx) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
        FAQs
      </h2>

      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="border border-stone-200/70 rounded-xl overflow-hidden transition-colors bg-stone-50/70 hover:bg-stone-50"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-3 text-xs sm:text-sm font-semibold text-stone-900 cursor-pointer select-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2.5">
                  <ChevronRight
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-90 text-emerald-700' : ''
                    }`}
                  />
                  <span>{faq.question}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 pl-10 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/40 bg-white/70">
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
