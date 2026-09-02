'use client';

import React from 'react';

export default function CMSContentRenderer({ content }) {
  if (!content) return null;

  // Split by double newline or single newline blocks
  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let keyIndex = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${keyIndex++}`} className="space-y-2 my-4 pl-5 list-disc text-slate-700 text-sm leading-relaxed">
          {currentList.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const formatInline = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-emerald-800">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    if (!rawLine) {
      flushList();
      continue;
    }

    if (rawLine.startsWith('### ')) {
      flushList();
      const heading = rawLine.replace('### ', '');
      elements.push(
        <h3 key={`h3-${keyIndex++}`} className="text-lg sm:text-xl font-black text-slate-900 mt-8 mb-3 tracking-tight">
          {heading}
        </h3>
      );
    } else if (rawLine.startsWith('## ')) {
      flushList();
      const heading = rawLine.replace('## ', '');
      elements.push(
        <h2 key={`h2-${keyIndex++}`} className="text-xl sm:text-2xl font-black text-slate-900 mt-10 mb-4 tracking-tight">
          {heading}
        </h2>
      );
    } else if (rawLine.startsWith('* ') || rawLine.startsWith('- ')) {
      currentList.push(rawLine.substring(2));
    } else if (rawLine === '---') {
      flushList();
      elements.push(
        <hr key={`hr-${keyIndex++}`} className="my-8 border-slate-200" />
      );
    } else {
      flushList();
      elements.push(
        <p
          key={`p-${keyIndex++}`}
          className="text-slate-600 text-sm sm:text-base leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: formatInline(rawLine) }}
        />
      );
    }
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
}
