'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { soundEngine } from '../utils/soundEffects';
import {
  showNativeNotification,
  requestNotificationPermission,
  getNotificationPermission
} from '../utils/notificationManager';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastAlert, setToastAlert] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [soundEnabled, setSoundEnabledState] = useState(true);

  // Sync initial sound and notification permissions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermissionStatus(getNotificationPermission());
      setSoundEnabledState(soundEngine.isSoundEnabled());
    }
  }, []);

  const toggleSound = (enabled) => {
    const nextVal = typeof enabled === 'boolean' ? enabled : !soundEnabled;
    soundEngine.setSoundEnabled(nextVal);
    setSoundEnabledState(nextVal);
    if (nextVal) {
      soundEngine.playMessageSound();
    }
  };

  const requestPermission = async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      showNativeNotification({
        title: 'IlmPortal Alerts Enabled',
        body: 'You will now receive instant desktop & mobile alerts with sound for messages & classroom updates.',
        url: '#',
        soundType: 'message'
      });
    }
    return status;
  };

  const testChime = () => {
    soundEngine.playMessageSound();
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (alertData) => {
      setToastAlert(alertData);
      fetchNotifications();

      // Trigger OS desktop/mobile push notification banner with sound & vibration
      const isMessageAlert = alertData?.type === 'new_message';
      const defaultUrl = isMessageAlert
        ? (user?.role === 'tutor' ? '/tutor/messages' : '/student/messages')
        : (alertData?.link || '/');

      showNativeNotification({
        title: alertData?.title || 'IlmPortal Notification',
        body: alertData?.message || 'New update on your IlmPortal account',
        icon: alertData?.senderAvatar || '/icon.svg',
        url: alertData?.link || defaultUrl,
        tag: `ilmportal-${alertData?.type || 'general'}-${Date.now()}`,
        soundType: isMessageAlert ? 'message' : 'alert'
      });

      setTimeout(() => {
        setToastAlert(null);
      }, 5000);
    };

    socket.on('notification-alert', handleNotification);

    return () => {
      socket.off('notification-alert', handleNotification);
    };
  }, [socket, user]);

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toastAlert,
        permissionStatus,
        soundEnabled,
        requestPermission,
        toggleSound,
        testChime,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext) || {
  notifications: [],
  unreadCount: 0,
  toastAlert: null,
  permissionStatus: 'default',
  soundEnabled: true,
  requestPermission: async () => {},
  toggleSound: () => {},
  testChime: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  refreshNotifications: () => {}
};

export const useNotification = useNotifications;

