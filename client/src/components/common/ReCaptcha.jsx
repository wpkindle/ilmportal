'use client';

/**
 * Google reCAPTCHA v3 Hook
 * Invisible — no widget shown to users.
 * Call executeRecaptcha(action) before form submit to get a token.
 *
 * Usage:
 *   const { executeRecaptcha, ready } = useRecaptchaV3();
 *   const token = await executeRecaptcha('login');
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeB9rwtAAAAAIwngdI_jyWfo4-jUOo4gO67ES7i';
const SCRIPT_ID = 'google-recaptcha-v3-script';

let scriptLoadPromise = null;

function loadScript() {
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('SSR');
    if (window.grecaptcha?.execute) return resolve();

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      // Script tag exists, wait for grecaptcha to be ready
      const poll = setInterval(() => {
        if (window.grecaptcha?.ready) {
          clearInterval(poll);
          window.grecaptcha.ready(resolve);
        }
      }, 100);
      setTimeout(() => { clearInterval(poll); reject('timeout'); }, 8000);
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(resolve);
      } else {
        resolve();
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

export function useRecaptchaV3() {
  const [ready, setReady] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadScript()
      .then(() => { if (mountedRef.current) setReady(true); })
      .catch(() => { if (mountedRef.current) setReady(false); });
    return () => { mountedRef.current = false; };
  }, []);

  const executeRecaptcha = useCallback(async (action = 'submit') => {
    try {
      await loadScript();
      const token = await window.grecaptcha.execute(SITE_KEY, { action });
      return token;
    } catch (err) {
      console.warn('[reCAPTCHA v3] execute error:', err);
      return '';
    }
  }, []);

  return { executeRecaptcha, ready };
}
