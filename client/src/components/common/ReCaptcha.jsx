'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v2-script';
const DEFAULT_SITE_KEY = '6LduWLwtAAAAAOEBTVTPi7T5LTG08RVZWSpZl3LS';

/**
 * Reusable Google reCAPTCHA v2 Component
 */
const ReCaptcha = forwardRef(function ReCaptcha(
  {
    onChange,
    onExpired,
    onError,
    theme = 'light',
    size = 'normal',
    className = ''
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || DEFAULT_SITE_KEY;

  // Expose imperative methods to parent (e.g. reset())
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (
        typeof window !== 'undefined' &&
        window.grecaptcha &&
        widgetIdRef.current !== null
      ) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
          if (onChange) onChange(null);
        } catch (e) {
          console.warn('[reCAPTCHA] Reset failed:', e);
        }
      }
    },
    getResponse: () => {
      if (
        typeof window !== 'undefined' &&
        window.grecaptcha &&
        widgetIdRef.current !== null
      ) {
        try {
          return window.grecaptcha.getResponse(widgetIdRef.current);
        } catch (e) {
          return '';
        }
      }
      return '';
    }
  }));

  // Load reCAPTCHA script and render widget
  useEffect(() => {
    let isCancelled = false;

    const renderWidget = () => {
      if (
        isCancelled ||
        !containerRef.current ||
        !window.grecaptcha ||
        !window.grecaptcha.render
      ) {
        return;
      }

      // Avoid double render inside same container
      if (containerRef.current.innerHTML.trim() !== '') {
        return;
      }

      try {
        const widgetId = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme === 'dark' ? 'dark' : 'light',
          size: size,
          callback: (token) => {
            if (!isCancelled && onChange) {
              onChange(token);
            }
          },
          'expired-callback': () => {
            if (!isCancelled) {
              if (onChange) onChange(null);
              if (onExpired) onExpired();
            }
          },
          'error-callback': () => {
            if (!isCancelled) {
              if (onChange) onChange(null);
              if (onError) onError();
            }
          }
        });

        widgetIdRef.current = widgetId;
        setIsReady(true);
      } catch (err) {
        console.warn('[reCAPTCHA] Render warning:', err);
      }
    };

    const handleScriptReady = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          renderWidget();
        });
      } else {
        setTimeout(renderWidget, 200);
      }
    };

    // If script is already in document
    if (typeof window !== 'undefined') {
      if (window.grecaptcha && window.grecaptcha.render) {
        handleScriptReady();
      } else {
        // Register global callback
        const callbackName = '__ilmRecaptchaOnLoad';
        window[callbackName] = () => {
          handleScriptReady();
        };

        let existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = RECAPTCHA_SCRIPT_ID;
          script.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit`;
          script.async = true;
          script.defer = true;
          script.onerror = () => {
            console.error('[reCAPTCHA] Failed to load Google reCAPTCHA script.');
            setScriptError(true);
          };
          document.head.appendChild(script);
        } else {
          // If script tag exists but grecaptcha not ready yet, wait for it
          const checkInterval = setInterval(() => {
            if (window.grecaptcha && window.grecaptcha.render) {
              clearInterval(checkInterval);
              handleScriptReady();
            }
          }, 150);

          setTimeout(() => clearInterval(checkInterval), 6000);
        }
      }
    }

    return () => {
      isCancelled = true;
      if (
        typeof window !== 'undefined' &&
        window.grecaptcha &&
        widgetIdRef.current !== null
      ) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (e) {}
      }
    };
  }, [siteKey, theme, size, onChange, onExpired, onError]);

  return (
    <div className={`my-3.5 flex flex-col items-center justify-center ${className}`}>
      <div
        className="w-full flex justify-center overflow-hidden transition-all duration-200"
        style={{ minHeight: '78px' }}
      >
        <div ref={containerRef} className="origin-top-left scale-[0.88] sm:scale-100" />
      </div>

      {!isReady && !scriptError && (
        <div className="text-[11px] text-stone-400 animate-pulse flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-stone-300 animate-ping" />
          <span>Loading security check...</span>
        </div>
      )}

      {scriptError && (
        <div className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 mt-1">
          Security verification could not load. Please check your ad-blocker or connection.
        </div>
      )}
    </div>
  );
});

export default ReCaptcha;

