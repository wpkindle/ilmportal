'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * SiteInitialLoader
 * 
 * Uses the authentic IlmiDunya brand spinner (/logo.svg + authentic squircle open-book emblem):
 * - Smoothly renders on initial site opening.
 * - Auto-fades out and unmounts once the client hydrates and becomes interactive.
 */
export default function SiteInitialLoader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Dismiss preloader smoothly once page is ready
    const timer = setTimeout(() => {
      setMounted(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, 350);
      return () => clearTimeout(removeTimer);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      id="ilmi-site-loader"
      aria-hidden={mounted ? 'true' : 'false'}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-opacity duration-350 ease-out select-none pointer-events-none ${
        mounted ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <LoadingSpinner size="lg" />
    </div>
  );
}
