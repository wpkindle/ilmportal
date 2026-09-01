'use client';

import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { SocketProvider } from '../../context/SocketContext';
import { NotificationProvider } from '../../context/NotificationContext';
import InitialPageLoader from './InitialPageLoader';
import LiveActivityToast from './LiveActivityToast';
import SupportPlatformWidget from './SupportPlatformWidget';

export default function AppProviders({ children }) {
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
