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
 * In-App audio and haptic alert runner.
 * Note: Default browser OS notifications are disabled in favor of our custom styled in-app notification notice (InAppNotificationToast).
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

  // Default browser notifications are suppressed so users exclusively see our own custom in-app notification notice
  return null;
}
