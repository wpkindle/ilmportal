/**
 * IlmiDunya Desktop & Mobile OS Notification Manager
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
 * Show an OS-level browser notification banner (visible even when on another tab).
 * Also plays audio and vibrates if tab is in focus.
 */
export async function showNativeNotification({
  title,
  body,
  icon = '/icon.svg',
  url = '/',
  tag = 'ilmidunya-notification',
  soundType = 'message' // 'message' | 'alert' | 'admin' | 'none'
}) {
  if (typeof window === 'undefined') return null;

  // 1. Play audible sound chime when tab is focused
  if (document.visibilityState === 'visible') {
    if (soundType === 'message') {
      soundEngine.playMessageSound();
    } else if (soundType === 'alert' || soundType === 'admin') {
      soundEngine.playNotificationSound();
    }
  }

  // 2. Trigger mobile hardware vibration if supported (Haptic feedback)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 60, 180]);
    } catch (e) {}
  }

  // 3. Fire native OS browser notification (works even when tab is in background)
  if (!('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notif = new Notification(title, {
      body,
      icon,
      tag,
      requireInteraction: false,
      silent: false
    });

    notif.onclick = () => {
      window.focus();
      if (url && url !== '#') {
        window.dispatchEvent(new CustomEvent('ilmidunya:navigate', { detail: { url } }));
        window.dispatchEvent(new CustomEvent('ilmportal:navigate', { detail: { url } }));
      }
      notif.close();
    };

    // Auto-close after 8 seconds
    setTimeout(() => notif.close(), 8000);

    return notif;
  } catch (err) {
    console.warn('OS notification error:', err);
    return null;
  }
}
