'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAE52TXQOcvyAUM7Q';
const SCRIPT_ID = 'cf-turnstile-script';

/**
 * Ensures the Cloudflare Turnstile script is loaded in the document.
 */
function loadTurnstileScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();

    if (window.turnstile) {
      return resolve();
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    };
    script.onerror = () => {
      console.warn('Failed to load Cloudflare Turnstile script.');
      resolve();
    };
    document.head.appendChild(script);
  });
}

/**
 * Cloudflare Turnstile Security Widget
 * 
 * Props:
 * - onVerify: (token: string) => void  (called when verified)
 * - onError: () => void                (called on error)
 * - onExpire: () => void               (called when token expires)
 * - action: string                     (e.g., 'login', 'register', 'contact')
 * - theme: 'light' | 'dark' | 'auto'
 * - size: 'normal' | 'compact' | 'flexible'
 */
const Turnstile = forwardRef(function Turnstile(
  {
    onVerify,
    onError,
    onExpire,
    action = 'submit',
    theme = 'light',
    size = 'normal',
    className = ''
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
      }
    }
  }));

  useEffect(() => {
    let isMounted = true;

    loadTurnstileScript().then(() => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget if any
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          theme,
          size,
          callback: (token) => {
            if (isMounted && onVerify) {
              onVerify(token);
            }
          },
          'error-callback': () => {
            if (isMounted && onError) {
              onError();
            }
          },
          'expired-callback': () => {
            if (isMounted && onExpire) {
              onExpire();
            }
          }
        });
        widgetIdRef.current = id;
        setIsLoaded(true);
      } catch (err) {
        console.warn('Cloudflare Turnstile render error:', err);
      }
    });

    return () => {
      isMounted = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [action, theme, size]);

  return (
    <div className={`my-3 flex justify-center items-center overflow-hidden min-h-[65px] ${className}`}>
      <div ref={containerRef} className="inline-block rounded-xl overflow-hidden shadow-xs" />
    </div>
  );
});

export default Turnstile;

