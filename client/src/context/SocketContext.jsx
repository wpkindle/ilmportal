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
    if (
      window.location.hostname === 'ilmidunya.com' ||
      window.location.hostname.endsWith('.ilmidunya.com') ||
      window.location.hostname === 'ilmportal.vercel.app' ||
      window.location.hostname.includes('vercel.app')
    ) {
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
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [onlineAdminsCount, setOnlineAdminsCount] = useState(0);
  const socketRef = useRef(null);
  const userRef = useRef(null);

  // Keep userRef current at all times
  useEffect(() => {
    const prevUser = userRef.current;
    userRef.current = user;
    if (user?.role === 'admin') {
      setIsAdminOnline(true);
    } else if (prevUser?.role === 'admin' && !user) {
      setIsAdminOnline(false);
      setOnlineAdminsCount(0);
    }
  }, [user]);

  // Register user whenever user identity resolves OR cleanly unregister on logout
  useEffect(() => {
    if (!socketRef.current) return;
    if (user) {
      const uId = (user._id || user.id)?.toString();
      if (uId && socketRef.current.connected) {
        socketRef.current.emit('register-user', uId);
      }
      if (user.role === 'admin') {
        setIsAdminOnline(true);
      }
    } else {
      // User logged out or is unauthenticated guest — cleanly unregister from all rooms
      setIsAdminOnline(false);
      setOnlineAdminsCount(0);
      if (socketRef.current.connected) {
        socketRef.current.emit('admin-support-duty-off');
        socketRef.current.emit('unregister-user');
        socketRef.current.emit('check-admin-online-status', (res) => {
          if (res && typeof res.isOnline === 'boolean') {
            setIsAdminOnline(res.isOnline);
            setOnlineAdminsCount(res.onlineAdmins || 0);
          }
        });
      }
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer = null;
    let initialized = false;

    const connectSocket = () => {
      if (initialized || socketRef.current) return;
      initialized = true;

      const socketUrl = getSocketUrl();
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
        registerCurrentUser();

        // Query online users immediately on connection
        newSocket.emit('get-online-status', [], (statusMap) => {
          if (statusMap && typeof statusMap === 'object') {
            setOnlineStatusMap(prev => ({ ...prev, ...statusMap }));
          }
        });

        // Query admin status immediately on connection
        newSocket.emit('check-admin-online-status', (res) => {
          if (res && typeof res.isOnline === 'boolean') {
            setIsAdminOnline(res.isOnline);
            setOnlineAdminsCount(res.onlineAdmins || 0);
          }
        });
      });

    newSocket.io.on('reconnect', () => {
      console.log('[WebSocket] Reconnected to server');
      registerCurrentUser();
      newSocket.emit('get-online-status', [], (statusMap) => {
        if (statusMap && typeof statusMap === 'object') {
          setOnlineStatusMap(prev => ({ ...prev, ...statusMap }));
        }
      });
      newSocket.emit('check-admin-online-status', (res) => {
        if (res && typeof res.isOnline === 'boolean') {
          setIsAdminOnline(res.isOnline);
          setOnlineAdminsCount(res.onlineAdmins || 0);
        }
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time admin presence broadcast from server
    newSocket.on('admin-online-status', (data) => {
      if (typeof data?.isOnline === 'boolean') {
        setIsAdminOnline(data.isOnline);
        setOnlineAdminsCount(data.onlineAdmins || 0);
      }
    });

    // Receive full list of all currently online users upon connection
    newSocket.on('initial-online-users', (usersList) => {
      if (Array.isArray(usersList)) {
        const map = {};
        usersList.forEach((id) => {
          if (id) map[id.toString()] = true;
        });
        setOnlineStatusMap(map);
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

    // Instant logout listener
    const handleImmediateLogout = () => {
      setIsAdminOnline(false);
      setOnlineAdminsCount(0);
      if (newSocket.connected) {
        newSocket.emit('admin-support-duty-off');
        newSocket.emit('unregister-user');
        newSocket.emit('check-admin-online-status', (res) => {
          if (res && typeof res.isOnline === 'boolean') {
            setIsAdminOnline(res.isOnline);
            setOnlineAdminsCount(res.onlineAdmins || 0);
          }
        });
      }
    };
    window.addEventListener('ilmidunya:logout', handleImmediateLogout);
  };

    if (isAuthenticated) {
      connectSocket();
    } else {
      // Defer WebSocket connection for unauthenticated guest visitors so it doesn't block critical page hydration
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(connectSocket, { timeout: 3000 });
      } else {
        timer = setTimeout(connectSocket, 2000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const unregisterCurrentSocket = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('admin-support-duty-off');
      socketRef.current.emit('unregister-user');
    }
    setIsAdminOnline(false);
    setOnlineAdminsCount(0);
  };

  const refreshUserOnlineStatus = (userIds) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    socketRef.current.emit('get-online-status', ids, (statusMap) => {
      if (statusMap && typeof statusMap === 'object') {
        setOnlineStatusMap(prev => ({ ...prev, ...statusMap }));
      }
    });
  };

  const onlineUsers = Object.keys(onlineStatusMap).filter(k => onlineStatusMap[k]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      onlineStatusMap,
      onlineUsers,
      isAdminOnline,
      onlineAdminsCount,
      unregisterCurrentSocket,
      refreshUserOnlineStatus
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) || {
  socket: null,
  isConnected: false,
  onlineUsers: [],
  onlineStatusMap: {},
  isAdminOnline: false,
  onlineAdminsCount: 0,
  unregisterCurrentSocket: () => {},
  refreshUserOnlineStatus: () => {}
};
