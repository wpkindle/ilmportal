'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { SocketProvider } from '../../context/SocketContext';
import { NotificationProvider } from '../../context/NotificationContext';
import InitialPageLoader from './InitialPageLoader';
import LiveActivityToast from './LiveActivityToast';
import SupportPlatformWidget from './SupportPlatformWidget';

export default function AppProviders({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registration note:', err);
      });
    }
  }, []);
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <InitialPageLoader />
          <LiveActivityToast />
          <SupportPlatformWidget />
          {children}
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
