'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineStatusMap, setOnlineStatusMap] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
      `${window.location.protocol}//${window.location.hostname}:5000`;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (user?._id || user?.id) {
        newSocket.emit('register-user', user._id || user.id);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('user-online-status', ({ userId, status }) => {
      setOnlineStatusMap(prev => ({
        ...prev,
        [userId]: status === 'online'
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isAuthenticated && user) {
      socket.emit('register-user', user._id || user.id);
    }
  }, [socket, isAuthenticated, user]);

  const onlineUsers = Object.keys(onlineStatusMap).filter(k => onlineStatusMap[k]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineStatusMap, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) || { socket: null, isConnected: false, onlineUsers: [], onlineStatusMap: {} };
