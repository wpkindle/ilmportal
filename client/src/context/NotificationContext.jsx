'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const recentAlertsRef = useRef(new Map());
  const toastTimeoutRef = useRef(null);

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
        title: 'IlmiDunya Alerts Enabled',
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
      if (!alertData) return;

      // 1. In-memory deduplication (5-second window by messageId or hash)
      const alertKey = alertData.messageId
        ? `msg_${alertData.messageId}`
        : (alertData.conversationId
            ? `conv_${alertData.conversationId}_${alertData.message || ''}`
            : `${alertData.type || 'alert'}_${alertData.title || ''}_${alertData.message || ''}`);

      const now = Date.now();
      if (recentAlertsRef.current.has(alertKey)) {
        const lastTime = recentAlertsRef.current.get(alertKey);
        if (now - lastTime < 5000) {
          return; // Suppress duplicate notification within 5 seconds
        }
      }
      recentAlertsRef.current.set(alertKey, now);

      // Clean up older keys
      for (const [key, timestamp] of recentAlertsRef.current.entries()) {
        if (now - timestamp > 12000) {
          recentAlertsRef.current.delete(key);
        }
      }

      // 2. Check if the user is currently focused and reading this exact conversation
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const isFocused = document.visibilityState === 'visible' && (document.hasFocus ? document.hasFocus() : true);
        if (isFocused && currentPath.includes('/messages') && alertData.conversationId && currentSearch.includes(alertData.conversationId)) {
          // User is actively reading this exact conversation; refresh unread list silently without popup banner
          fetchNotifications();
          return;
        }
      }

      setToastAlert(alertData);
      fetchNotifications();

      // 3. Trigger OS desktop/mobile push notification banner with sound & vibration
      const isMessageAlert = alertData.type === 'new_message';
      const defaultUrl = isMessageAlert
        ? (user?.role === 'tutor' ? '/tutor/messages' : '/student/messages')
        : (alertData.link || '/');

      // Deterministic tag allows the OS notification daemon to collapse identical alerts
      const notificationTag = alertData.messageId
        ? `msg-${alertData.messageId}`
        : (alertData.conversationId
            ? `conv-${alertData.conversationId}`
            : `ilmidunya-${alertData.type || 'general'}`);

      showNativeNotification({
        title: alertData.title || 'IlmiDunya Notification',
        body: alertData.message || 'New update on your IlmiDunya account',
        icon: alertData.senderAvatar || '/icon.png',
        url: alertData.link || defaultUrl,
        tag: notificationTag,
        soundType: isMessageAlert ? 'message' : 'alert'
      });

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setToastAlert(null);
      }, 5000);
    };

    socket.on('notification-alert', handleNotification);

    return () => {
      socket.off('notification-alert', handleNotification);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
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
        clearToast: () => {
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          setToastAlert(null);
        },
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
  clearToast: () => {},
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

