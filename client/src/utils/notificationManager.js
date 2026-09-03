/**
 * IlmPortal Desktop & Mobile OS Notification Manager
 * Handles native OS banners on Windows, Mac, Linux, Android, and iOS PWAs.
 */
import { soundEngine } from './soundEffects';

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  // Also unlock audio context on user gesture
  soundEngine.getAudioContext();

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Display native OS notification banner with vibration and sound
 */
export async function showNativeNotification({
  title,
  body,
  icon = '/icon.svg',
  url = '/',
  tag = 'ilmportal-notification',
  soundType = 'message' // 'message' | 'alert' | 'none'
}) {
  if (typeof window === 'undefined') return null;

  // 1. Play audible sound chime (just like WhatsApp / Messenger)
  if (soundType === 'message') {
    soundEngine.playMessageSound();
  } else if (soundType === 'alert') {
    soundEngine.playNotificationSound();
  }

  // 2. Trigger mobile hardware vibration if supported (Haptic feedback)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 60, 180]);
    } catch (e) {}
  }

  // 3. Check browser OS notification permission
  if (!('Notification' in window)) return null;

  if (Notification.permission === 'default') {
    try {
      const res = await Notification.requestPermission();
      if (res !== 'granted') return null;
    } catch (e) {
      return null;
    }
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  // Windows 10/11 Action Center requires raster PNG images, not SVG
  const validIcon = (!icon || icon.endsWith('.svg')) ? '/icon.png' : icon;

  // 4. On mobile devices, prefer Service Worker showNotification
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        return registration.showNotification(title, {
          body: body || '',
          icon: validIcon,
          badge: '/icon.png',
          vibrate: [150, 80, 150],
          tag: tag || undefined,
          renotify: true,
          data: { url }
        });
      }
    } catch (swErr) {
      console.warn('Service worker mobile notification fallback:', swErr);
    }
  }

  // 5. Desktop browser native Notification (Direct window focus, zero reload, always popup)
  try {
    const notification = new Notification(title, {
      body: body || '',
      icon: validIcon,
      badge: '/icon.png',
      tag: tag || undefined,
      renotify: true,
      data: { url }
    });

    notification.onclick = function (event) {
      try {
        event.preventDefault();
        window.focus();
        notification.close();
        if (url && url !== '#' && url !== '/') {
          const currentUrl = window.location.pathname + window.location.search;
          if (currentUrl !== url) {
            window.dispatchEvent(new CustomEvent('ilmportal:navigate', { detail: { url } }));
          }
        }
      } catch (err) {
        console.warn('Notification click handling error:', err);
      }
    };

    return notification;
  } catch (err) {
    // If desktop throws (e.g. Android Chrome constructor restriction), fallback to service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          return registration.showNotification(title, {
            body: body || '',
            icon: icon || '/icon.svg',
            badge: '/icon.svg',
            vibrate: [150, 80, 150],
            tag: tag || undefined,
            renotify: true,
            data: { url }
          });
        }
      } catch (e) {}
    }
    return null;
  }
}
