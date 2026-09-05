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
  tag = 'ilmidunya-notification',
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

  // Windows 10/11 and Android OS require absolute raster image URLs for native notification toasts
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const validIcon = `${origin}/icon.png`;
  const validBadge = `${origin}/icon.png`;

  const notificationOptions = {
    body: body || '',
    icon: validIcon,
    badge: validBadge,
    vibrate: [150, 80, 150],
    tag: tag || undefined,
    renotify: true,
    silent: false,
    data: { url }
  };

  // 4. Trigger Service Worker showNotification if active (for Android PWA / Windows Action Center)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.showNotification) {
          reg.showNotification(title, notificationOptions);
        }
      }).catch(() => {});
    } catch (swErr) {}
  }

  // 5. Desktop browser Notification (Fires instantly on Windows 11, Chromebook, macOS, Linux)
  try {
    const notification = new Notification(title, notificationOptions);

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
    console.warn('Desktop Notification constructor note:', err);
    return null;
  }
}
