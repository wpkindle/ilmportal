'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'ilmportal.vercel.app' || window.location.hostname.includes('vercel.app')) {
      return 'https://ilmportal-backend.onrender.com';
    }
    if (window.location.port === '3000' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return 'https://ilmportal-backend.onrender.com';
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineStatusMap, setOnlineStatusMap] = useState({});
  const socketRef = useRef(null);
  const userRef = useRef(null);

  // Keep userRef current at all times
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Register user whenever user identity resolves OR socket reconnects
  useEffect(() => {
    if (!socketRef.current || !user) return;
    const uId = (user._id || user.id)?.toString();
    if (uId && socketRef.current.connected) {
      socketRef.current.emit('register-user', uId);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socketUrl = getSocketUrl();
    console.log('[WebSocket] Connecting to:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
      timeout: 20000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    const registerCurrentUser = () => {
      const u = userRef.current;
      if (u?._id || u?.id) {
        const uId = (u._id || u.id).toString();
        newSocket.emit('register-user', uId);
      }
    };

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[WebSocket] Connected successfully!');
      registerCurrentUser();
    });

    newSocket.io.on('reconnect', () => {
      console.log('[WebSocket] Reconnected to server');
      registerCurrentUser();
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Receive full list of all currently online users upon connection
    newSocket.on('initial-online-users', (usersList) => {
      if (Array.isArray(usersList)) {
        const map = {};
        usersList.forEach((id) => {
          if (id) map[id.toString()] = true;
        });
        setOnlineStatusMap(prev => ({ ...prev, ...map }));
      }
    });

    // Real-time status update for any user
    newSocket.on('user-online-status', ({ userId, status }) => {
      if (!userId) return;
      const idStr = userId.toString();
      setOnlineStatusMap(prev => ({
        ...prev,
        [idStr]: status === 'online'
      }));
    });

    // Re-register on page visibility change (handles tab switch back after idle)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && newSocket.connected) {
        registerCurrentUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      newSocket.disconnect();
    };
  }, []);

  const onlineUsers = Object.keys(onlineStatusMap).filter(k => onlineStatusMap[k]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineStatusMap, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) || {
  socket: null,
  isConnected: false,
  onlineUsers: [],
  onlineStatusMap: {}
};
