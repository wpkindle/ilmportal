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
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  // 4. Try Service Worker first for mobile/PWA background notifications
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
    } catch (swErr) {
      console.warn('Service worker notification fallback:', swErr);
    }
  }

  // 5. Desktop browser native Notification fallback
  try {
    const notification = new Notification(title, {
      body: body || '',
      icon: icon || '/icon.svg',
      badge: '/icon.svg',
      tag: tag || undefined,
      data: { url }
    });

    notification.onclick = function (event) {
      event.preventDefault();
      window.focus();
      if (url && url !== '/') {
        window.location.href = url;
      }
      notification.close();
    };

    return notification;
  } catch (err) {
    console.warn('Native notification display error:', err);
    return null;
  }
}
