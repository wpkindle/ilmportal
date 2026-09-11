'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '../../context/AuthContext';
import { SocketProvider } from '../../context/SocketContext';
import { NotificationProvider } from '../../context/NotificationContext';
import SupportPlatformWidget from './SupportPlatformWidget';
import InAppNotificationToast from './InAppNotificationToast';
import AiChatbotWidget from './AiChatbotWidget';

export default function AppProviders({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registration note:', err);
      });
    }

    // Smooth SPA navigation handler from Desktop & Mobile notifications (Zero Page Reloads)
    const handleSmoothNavigation = (targetUrl) => {
      if (!targetUrl || targetUrl === '#' || typeof window === 'undefined') return;
      
      const currentPathWithSearch = window.location.pathname + window.location.search;
      // If user is already on this exact page or conversation, simply bring window to focus
      if (currentPathWithSearch === targetUrl) {
        window.focus();
        return;
      }
      window.focus();
      
      // Perform seamless Next.js SPA route transition without reloading
      router.push(targetUrl);
    };

    const handleCustomNavigate = (e) => {
      if (e.detail && e.detail.url) {
        handleSmoothNavigation(e.detail.url);
      }
    };

    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'ILMPORTAL_NOTIFICATION_NAVIGATE' && event.data.url) {
        handleSmoothNavigation(event.data.url);
      }
    };

    window.addEventListener('ilmportal:navigate', handleCustomNavigate);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('ilmportal:navigate', handleCustomNavigate);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [router]);
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <InAppNotificationToast />
          <SupportPlatformWidget />
          <AiChatbotWidget />
          {children}
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
