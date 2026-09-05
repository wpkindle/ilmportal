'use client';

import React from 'react';

/**
 * BrandLogo component for IlmiDunya Pakistan.
 * Inspired by the authentic open-book emblem, modern typography, and Urdu script.
 * Color scheme: Vibrant Teal (#15a18d) and Charcoal (#373737).
 *
 * @param {'light' | 'dark' | 'icon'} variant - Color scheme ('light' for navbar/white cards, 'dark' for footer)
 * @param {'xs' | 'sm' | 'md' | 'lg'} size - Overall dimension scaling
 * @param {boolean} withUrdu - Whether to display the "علمی دُنیا" subtitle
 * @param {boolean} withBadge - Whether to display the "Pakistan" badge
 * @param {string} className - Optional custom class name
 */
export default function BrandLogo({
  variant = 'light',
  size = 'md',
  withUrdu = true,
  withBadge = true,
  className = ''
}) {
  const isDark = variant === 'dark';
  const isIconOnly = variant === 'icon';

  // Proportional height scales
  const heights = {
    xs: 28,
    sm: 34,
    md: 44,
    lg: 54
  };

  const currentHeight = heights[size] || heights.md;
  const bookColor = '#15a18d';
  const textColor = isDark ? '#ffffff' : '#373737';
  const urduColor = isDark ? '#15a18d' : '#373737';

  // Icon only rendering (for compact mobile avatars / favicons)
  if (isIconOnly) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          height={currentHeight}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <rect width="64" height="64" rx="16" fill={bookColor} />
          <g transform="translate(4, 7)">
            <path
              d="
                M 10 12
                C 19 4, 33 4, 40 12
                L 40 17
                C 33 10, 20 10, 15 17
                L 15 36
                L 36 36
                L 36 41
                L 10 41
                Z
              "
              fill="#ffffff"
            />
            <path
              d="
                M 40 12
                C 47 4, 61 4, 70 12
                L 70 17
                C 61 10, 48 10, 42 17
                L 40 21
                L 38 17
                Z
              "
              fill="#ffffff"
              transform="scale(0.68) translate(-1, 0)"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Dynamic SVG bounds based on visible elements
  const viewBoxWidth = withBadge ? 320 : 215;
  const viewBoxHeight = withUrdu ? 88 : 66;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        height={currentHeight}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Teal Open Book Bracket framing 'ilmi' */}
        <path
          d="
            M 12 16
            C 24 5, 46 5, 60 16
            C 74 5, 96 5, 108 16
            L 108 23
            C 96 14, 76 14, 62 23
            L 60 28
            L 58 23
            C 44 14, 24 14, 19 23
            L 19 54
            L 72 54
            L 72 62
            L 12 62
            Z
          "
          fill={bookColor}
        />

        {/* 'ilmi' sitting inside the book bracket */}
        <text
          x="26"
          y="52"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="34"
          fill={textColor}
          letterSpacing="-0.8"
        >
          ilmi
        </text>

        {/* 'dunya' flowing immediately after the bracket */}
        <text
          x="110"
          y="52"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="34"
          fill={textColor}
          letterSpacing="-0.8"
        >
          dunya
        </text>

        {/* Urdu: Strictly 'علمی دُنیا' (Pakistan removed, aligned along the bottom shelf) */}
        {withUrdu && (
          <text
            x="76"
            y="77"
            fontFamily="'Noto Nastaliq Urdu', 'Amiri', 'Urdu Typesetting', serif"
            fontWeight="700"
            fontSize="15"
            fill={urduColor}
          >
            علمی دُنیا
          </text>
        )}

        {/* Sleek 'PAKISTAN' badge */}
        {withBadge && (
          <g transform="translate(216, 28)">
            <rect x="0" y="0" width="76" height="22" rx="6" fill={bookColor} />
            <text
              x="38"
              y="15"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="800"
              fontSize="9.5"
              fill="#ffffff"
              textAnchor="middle"
              letterSpacing="1.2"
            >
              PAKISTAN
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

