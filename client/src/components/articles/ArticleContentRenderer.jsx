'use client';

import React from 'react';

/**
 * Creates URL-friendly slug ID for SEO anchor jump links
 */
function slugifyHeading(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, [link](url)
 */
function parseInline(text, isDark = false) {
  if (!text) return null;

  const tokens = [];
  let remaining = text;
  let keyIdx = 0;

  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/;

  while (remaining) {
    const match = remaining.match(regex);
    if (!match) {
      tokens.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      tokens.push(<span key={keyIdx++}>{remaining.slice(0, matchIndex)}</span>);
    }

    const fullMatch = match[0];
    if (match[2]) {
      // **bold**
      tokens.push(
        <strong
          key={keyIdx++}
          className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}
        >
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      tokens.push(
        <em
          key={keyIdx++}
          className={`italic ${isDark ? 'text-slate-300' : 'text-stone-600'}`}
        >
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // `code`
      tokens.push(
        <code
          key={keyIdx++}
          className={`px-1.5 py-0.5 rounded text-xs font-mono ${
            isDark ? 'bg-slate-800 text-amber-300' : 'bg-stone-100 text-[#b85d34]'
          }`}
        >
          {match[4]}
        </code>
      );
    } else if (match[5] && match[6]) {
      // [label](url)
      tokens.push(
        <a
          key={keyIdx++}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 underline font-medium hover:text-emerald-800 transition-colors"
        >
          {match[5]}
        </a>
      );
    }

    remaining = remaining.slice(matchIndex + fullMatch.length);
  }

  return tokens;
}

/**
 * ArticleContentRenderer: Clean, readable typography inspired by modern editorial card layouts.
 * Strictly maintains H1 (page title) -> H2 (major section) -> H3 (subsection) -> H4 (topic item).
 */
export default function ArticleContentRenderer({ content = '', variant = 'light' }) {
  if (!content) return null;

  const isDark = variant === 'dark';
  const rawLines = content.replace(/\r\n/g, '\n').split('\n');

  const elements = [];
  let currentList = null;
  let keyCounter = 0;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${keyCounter++}`} className="my-3 space-y-1.5 pl-1 sm:pl-2">
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-2.5 text-xs sm:text-sm md:text-[15px] leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-stone-700'
                }`}
              >
                <span className="text-stone-400 font-bold select-none mt-0.5">•</span>
                <div className="flex-1">{parseInline(item, isDark)}</div>
              </li>
            ))}
          </ul>
        );
      } else if (currentList.type === 'ol') {
        elements.push(
          <ol key={`ol-${keyCounter++}`} className="my-3 space-y-2 pl-1 sm:pl-2">
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-2.5 text-xs sm:text-sm md:text-[15px] leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-stone-700'
                }`}
              >
                <span
                  className={`text-xs font-bold shrink-0 mt-0.5 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-800'
                  }`}
                >
                  {item.num || idx + 1}.
                </span>
                <div className="flex-1">{parseInline(item.text, isDark)}</div>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // 1. Horizontal Divider (--- or ***)
    if (line === '---' || line === '***' || line === '___') {
      flushList();
      elements.push(
        <hr
          key={`hr-${keyCounter++}`}
          className={`my-6 sm:my-8 border-t ${
            isDark ? 'border-slate-800' : 'border-stone-200/80'
          }`}
        />
      );
      continue;
    }

    // 2. SEO Headings (H2, H3, H4)
    const h4Match = line.match(/^####\s+(.*)/);
    const h3Match = line.match(/^###\s+(.*)/);
    const h2Match = line.match(/^##\s+(.*)/);
    const h1Match = line.match(/^#\s+(.*)/);

    if (h4Match || h3Match || h2Match || h1Match) {
      flushList();
      const headingText = (
        h4Match ? h4Match[1] : h3Match ? h3Match[1] : h2Match ? h2Match[1] : h1Match[1]
      ).trim();

      const headingId = slugifyHeading(headingText);

      // Special handling for Bismillah
      if (
        headingText.toLowerCase().includes('bismillah') ||
        headingText.includes('بسم الله')
      ) {
        elements.push(
          <div
            key={`bismillah-${keyCounter++}`}
            className={`my-4 p-3.5 sm:p-4 rounded-xl text-center border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-amber-200'
                : 'bg-[#f7f5f0] border-[#ebe5d8] text-emerald-900'
            }`}
          >
            <div className="text-lg sm:text-xl font-serif font-black tracking-wide">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5">
              In the Name of Allah, Most Gracious, Most Merciful
            </div>
          </div>
        );
        continue;
      }

      // H4: Detailed Topic / Minor Heading (####)
      if (h4Match) {
        elements.push(
          <h4
            key={`h4-${keyCounter++}`}
            id={headingId}
            className={`text-xs sm:text-sm font-bold uppercase tracking-wider mt-5 mb-2 scroll-mt-20 ${
              isDark ? 'text-amber-300' : 'text-emerald-800'
            }`}
          >
            {parseInline(headingText, isDark)}
          </h4>
        );
        continue;
      }

      // H3: Subsection Heading (###)
      if (h3Match) {
        elements.push(
          <h3
            key={`h3-${keyCounter++}`}
            id={headingId}
            className={`text-sm sm:text-base font-bold text-stone-900 mt-5 mb-2 tracking-tight scroll-mt-20 ${
              isDark ? 'text-slate-100' : 'text-stone-900'
            }`}
          >
            {parseInline(headingText, isDark)}
          </h3>
        );
        continue;
      }

      // H2: Major Section Heading (## or body #)
      if (h2Match || h1Match) {
        elements.push(
          <h2
            key={`h2-${keyCounter++}`}
            id={headingId}
            className={`text-base sm:text-lg lg:text-xl font-bold text-stone-900 mt-7 sm:mt-8 mb-2.5 tracking-tight scroll-mt-20 ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            {parseInline(headingText, isDark)}
          </h2>
        );
        continue;
      }
    }

    // 3. Blockquote (> quote)
    const quoteMatch = line.match(/^>\s+(.*)/);
    if (quoteMatch) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${keyCounter++}`}
          className={`my-4 p-4 rounded-xl border-l-4 border-emerald-600 text-xs sm:text-sm italic leading-relaxed ${
            isDark
              ? 'bg-slate-900/90 text-slate-300'
              : 'bg-stone-50 text-stone-700'
          }`}
        >
          {parseInline(quoteMatch[1], isDark)}
        </blockquote>
      );
      continue;
    }

    // 4. Bullet list (* item or - item)
    const bulletMatch = line.match(/^[\*\-]\s+(.*)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // 5. Numbered list (1. item, 2. item)
    const numMatch = line.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push({ num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // 6. Signature line
    if (line.startsWith('**—') || line.startsWith('—') || line.startsWith('-—')) {
      flushList();
      elements.push(
        <div
          key={`signature-${keyCounter++}`}
          className={`mt-6 pt-3 border-t text-xs sm:text-sm font-semibold ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-stone-200 text-stone-600'
          }`}
        >
          {parseInline(line, isDark)}
        </div>
      );
      continue;
    }

    // 7. Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${keyCounter++}`}
        className={`my-2.5 text-xs sm:text-sm md:text-[15px] leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-stone-700'
        }`}
      >
        {parseInline(line, isDark)}
      </p>
    );
  }

  flushList();

  return <div className="article-body-content space-y-1">{elements}</div>;
}
