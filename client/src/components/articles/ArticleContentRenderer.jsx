'use client';

import React from 'react';

/**
 * Parses inline formatting: **bold**, *italic*, `code`, [link](url)
 */
function parseInline(text, isDark = false) {
  if (!text) return null;

  // Split by markdown inline tokens: **bold**, *italic*, `code`, [label](url)
  // We use a regex tokenizer
  const tokens = [];
  let remaining = text;
  let keyIdx = 0;

  // Pattern matches:
  // 1: **bold**
  // 2: *italic*
  // 3: `code`
  // 4: [label](url)
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
          className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2217]'}`}
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
          className="text-[#b85d34] underline font-medium hover:text-[#a04e27] transition-colors"
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
 * ArticleContentRenderer: Transforms article markdown into beautifully styled HTML elements.
 * Eliminates raw markdown tokens (e.g. ###, **, *) and renders bold headings, lists, and quotes.
 */
export default function ArticleContentRenderer({ content = '', variant = 'light' }) {
  if (!content) return null;

  const isDark = variant === 'dark';

  // Normalize line endings and split into paragraphs / blocks
  const rawLines = content.replace(/\r\n/g, '\n').split('\n');

  const elements = [];
  let currentList = null; // for grouping lists
  let keyCounter = 0;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${keyCounter++}`} className="my-4 space-y-2 pl-1">
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-3 text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-200' : 'text-[#2c3e35]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359] mt-2.5 shrink-0" />
                <div className="flex-1">{parseInline(item, isDark)}</div>
              </li>
            ))}
          </ul>
        );
      } else if (currentList.type === 'ol') {
        elements.push(
          <ol key={`ol-${keyCounter++}`} className="my-4 space-y-2.5 pl-1">
            {currentList.items.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-3 text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-200' : 'text-[#2c3e35]'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 mt-0.5 ${
                    isDark
                      ? 'bg-[#d4a359]/20 text-[#f5d996] border border-[#d4a359]/40'
                      : 'bg-[#0c2217] text-[#f5d996]'
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

    // Empty line
    if (!line) {
      flushList();
      continue;
    }

    // 1. Horizontal Divider (--- or ***)
    if (line === '---' || line === '***' || line === '___') {
      flushList();
      elements.push(
        <div key={`hr-${keyCounter++}`} className="my-8 flex items-center justify-center gap-3">
          <div className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-[#ebe3d3]'}`} />
          <span className="text-[#d4a359] text-xs font-serif select-none">✦</span>
          <div className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-[#ebe3d3]'}`} />
        </div>
      );
      continue;
    }

    // 2. Headings (###, ##, #)
    const h3Match = line.match(/^###\s+(.*)/);
    const h2Match = line.match(/^##\s+(.*)/);
    const h1Match = line.match(/^#\s+(.*)/);

    if (h3Match || h2Match || h1Match) {
      flushList();
      const headingText = (h3Match ? h3Match[1] : h2Match ? h2Match[1] : h1Match[1]).trim();

      // Special handling for Bismillah
      if (
        headingText.toLowerCase().includes('bismillah') ||
        headingText.includes('بسم الله')
      ) {
        elements.push(
          <div
            key={`bismillah-${keyCounter++}`}
            className={`my-6 p-4 sm:p-5 rounded-2xl border text-center shadow-xs ${
              isDark
                ? 'bg-[#0e271c] border-[#d4a359]/40 text-[#f5d996]'
                : 'bg-gradient-to-r from-[#0c2217] via-[#123625] to-[#0c2217] border-[#d4a359]/40 text-[#f5d996]'
            }`}
          >
            <div className="text-xl sm:text-2xl font-serif font-black tracking-wide">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div className="text-xs sm:text-sm text-[#d4a359] font-medium tracking-wide mt-1">
              In the Name of Allah, Most Gracious, Most Merciful
            </div>
          </div>
        );
        continue;
      }

      // Normal H3
      if (h3Match) {
        elements.push(
          <h3
            key={`h3-${keyCounter++}`}
            className={`text-lg sm:text-2xl font-black font-serif mt-8 mb-3.5 tracking-tight border-b pb-2 ${
              isDark
                ? 'text-white border-slate-800'
                : 'text-[#0c2217] border-[#ebe3d3]'
            }`}
          >
            {parseInline(headingText, isDark)}
          </h3>
        );
        continue;
      }

      // Normal H2
      if (h2Match) {
        elements.push(
          <h2
            key={`h2-${keyCounter++}`}
            className={`text-xl sm:text-3xl font-black font-serif mt-10 mb-4 tracking-tight border-b pb-2.5 ${
              isDark
                ? 'text-white border-slate-800'
                : 'text-[#0c2217] border-[#ebe3d3]'
            }`}
          >
            {parseInline(headingText, isDark)}
          </h2>
        );
        continue;
      }

      // Normal H1
      if (h1Match) {
        elements.push(
          <h1
            key={`h1-${keyCounter++}`}
            className={`text-2xl sm:text-4xl font-black font-serif mt-10 mb-4 tracking-tight ${
              isDark ? 'text-white' : 'text-[#0c2217]'
            }`}
          >
            {parseInline(headingText, isDark)}
          </h1>
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
          className={`my-5 p-4 sm:p-5 rounded-2xl border-l-4 border-[#d4a359] text-sm sm:text-base italic leading-relaxed ${
            isDark
              ? 'bg-slate-900/90 text-slate-200'
              : 'bg-[#faf6ef] text-stone-700'
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

    // 6. Author sign-off / signature line (e.g. "**— Abdul Khaliq**")
    if (line.startsWith('**—') || line.startsWith('—') || line.startsWith('-—')) {
      flushList();
      elements.push(
        <div
          key={`signature-${keyCounter++}`}
          className={`mt-8 pt-4 border-t ${
            isDark ? 'border-slate-800 text-slate-300' : 'border-[#ebe3d3] text-stone-600'
          }`}
        >
          <div className="text-sm font-serif font-black tracking-wide">
            {parseInline(line, isDark)}
          </div>
        </div>
      );
      continue;
    }

    // 7. Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${keyCounter++}`}
        className={`my-3 text-sm sm:text-base leading-relaxed ${
          isDark ? 'text-slate-200' : 'text-[#2c3e35]'
        }`}
      >
        {parseInline(line, isDark)}
      </p>
    );
  }

  flushList();

  return <div className="article-rendered-body space-y-1">{elements}</div>;
}
