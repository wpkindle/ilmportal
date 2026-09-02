'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('ilm_token');
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setTutorProfile(null);
        setLoading(false);
        return;
      }

      // Try up to 3 times to handle Render cold-start delays
      let lastErr = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const data = await api.getMe();
          if (data.success) {
            setUser(data.user);
            if (data.tutorProfile) {
              setTutorProfile(data.tutorProfile);
            }
            setLoading(false);
            return;
          } else {
            // Explicit server rejection — token is bad, log out
            logout();
            return;
          }
        } catch (err) {
          lastErr = err;
          // Only logout on explicit 401/403 (invalid/expired token or deactivated)
          // Do NOT logout on network errors (ECONNREFUSED), 500, 502, 503, 504 (Render cold start)
          const status = err?.status ?? 0;
          if (status === 401 || status === 403) {
            logout();
            return;
          }
          // Network/server error — wait before retrying
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, (attempt + 1) * 1500));
          }
        }
      }

      // All retries exhausted for a non-auth error (server down/cold start)
      // Keep the user's token intact — do NOT call logout()
      // They'll stay logged in visually; next navigation will retry
      console.warn('Auth check failed after retries (server may be waking up):', lastErr?.message);
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem('ilm_token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.tutorProfile) {
        setTutorProfile(data.tutorProfile);
      }
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    if (data.success && data.token) {
      localStorage.setItem('ilm_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const verifyOtp = async (email, otp) => {
    const data = await api.verifyOtp({ email, otp });
    if (data.success) {
      if (data.token) {
        localStorage.setItem('ilm_token', data.token);
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      return data;
    }
    throw new Error(data.message || 'Verification failed');
  };

  const verifyToken = async (token, email) => {
    const data = await api.verifyToken({ token, email });
    if (data.success) {
      if (data.token) {
        localStorage.setItem('ilm_token', data.token);
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      if (data.tutorProfile) {
        setTutorProfile(data.tutorProfile);
      }
      return data;
    }
    throw new Error(data.message || 'Verification link failed');
  };

  const logout = () => {
    localStorage.removeItem('ilm_token');
    setToken(null);
    setUser(null);
    setTutorProfile(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateUserProfile = async (updates) => {
    const data = await api.updateProfile(updates);
    if (data.success) {
      if (data.user) setUser(data.user);
      if (data.tutorProfile) setTutorProfile(data.tutorProfile);
    }
    return data;
  };

  const updateTutorProfileState = (updatedProfile) => {
    setTutorProfile(updatedProfile);
  };

  const deleteAccount = async (password) => {
    const data = await api.deleteAccount({ password });
    if (data.success) {
      localStorage.removeItem('ilm_token');
      setToken(null);
      setUser(null);
      setTutorProfile(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/?deleted=true';
      }
    }
    return data;
  };

  const isStudent = user?.role === 'student';
  const isTutor = user?.role === 'tutor';
  const isAdmin = user?.role === 'admin';
  const isVerifiedTutor = isTutor && tutorProfile?.verificationStatus === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user,
        tutorProfile,
        token,
        loading,
        login,
        register,
        verifyOtp,
        verifyToken,
        logout,
        deleteAccount,
        updateUserProfile,
        updateTutorProfileState,
        isStudent,
        isTutor,
        isAdmin,
        isVerifiedTutor,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
