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

      try {
        const data = await api.getMe();
        if (data.success) {
          setUser(data.user);
          if (data.tutorProfile) {
            setTutorProfile(data.tutorProfile);
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        logout();
      } finally {
        setLoading(false);
      }
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

  const logout = () => {
    localStorage.removeItem('ilm_token');
    setToken(null);
    setUser(null);
    setTutorProfile(null);
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
        logout,
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
