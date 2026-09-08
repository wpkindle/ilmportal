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
                <span className={`font-black select-none mt-0.5 ${isDark ? 'text-amber-400' : 'text-[#d4a359]'}`}>•</span>
                <div className="flex-1">{parseInline(item, isDark)}</div>
              </li>
            ))}
          </ul>
        );
      } else if (currentList.type === 'ol') {
        elements.push(
          <ol key={`ol-${keyCounter++}`} className="my-3 space-y-1.5 pl-1 sm:pl-2">
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-2.5 text-xs sm:text-sm md:text-[15px] leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-stone-700'
                }`}
              >
                <span
                  className={`text-xs font-black shrink-0 mt-0.5 px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-[#f5efe4] text-[#0c2217] border-[#e5dcce]'
                  }`}
                >
                  {item.num || idx + 1}
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

      // H4: Detailed Topic / Minor Heading (####)
      if (h4Match) {
        elements.push(
          <h4
            key={`h4-${keyCounter++}`}
            id={headingId}
            className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider mt-5 mb-1.5 leading-normal scroll-mt-20 ${
              isDark ? 'text-amber-300' : 'text-[#b85d34]'
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
            className={`text-base sm:text-lg lg:text-xl font-bold font-serif mt-6 sm:mt-7 mb-2.5 leading-snug tracking-tight scroll-mt-20 ${
              isDark ? 'text-slate-100' : 'text-[#0c2217]'
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
            className={`text-xl sm:text-2xl lg:text-[26px] font-black font-serif mt-8 sm:mt-10 mb-3 leading-snug tracking-tight scroll-mt-20 border-b pb-2.5 ${
              isDark ? 'text-white border-slate-800' : 'text-[#0c2217] border-[#ebe3d3]'
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
          className={`my-4 p-4 rounded-xl border-l-4 italic leading-relaxed text-xs sm:text-sm md:text-[15px] ${
            isDark
              ? 'bg-slate-900/90 text-slate-300 border-amber-400'
              : 'bg-[#faf6ee] text-[#0c2217] border-[#d4a359]'
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
          className={`mt-6 pt-3 border-t text-xs sm:text-sm font-serif font-bold ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-[#ebe3d3] text-[#0c2217]'
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
        className={`my-2.5 sm:my-3 text-xs sm:text-sm md:text-[15px] leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-stone-700'
        }`}
      >
        {parseInline(line, isDark)}
      </p>
    );
  }

  flushList();

  return <div className="article-body-content">{elements}</div>;
}
