'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import api from '@/lib/axios';
import {
  UserData,
  loginWithEmailPassword,
  loginWithGoogle,
  registerWithEmailPassword,
  logout as logoutService,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  verifyEmail
} from '@/services/authService';

interface AuthContextType {
  user: UserData | null;
  firebaseUser: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateProfile: (profileData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Try to get user data from localStorage first for faster loading
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setToken(userData.token);
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError);
              localStorage.removeItem('user');
            }
          }
          
          // Don't automatically try to refresh the token on initial load
          // This will be handled when the user explicitly logs in or registers
        } catch (error) {
          console.error('Error getting user data:', error);
        }
      } else {
        // User is signed out
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await loginWithEmailPassword(email, password);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(userData.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleHandler = async () => {
    setIsLoading(true);
    try {
      const userData = await loginWithGoogle();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(userData.token);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Split name into first and last name
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const userData = await registerWithEmailPassword(email, password, firstName, lastName);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(userData.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutService();
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPasswordHandler = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const verifyEmailHandler = async () => {
    try {
      await verifyEmail();
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  };

  const updateProfileHandler = async (profileData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
  }) => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const updatedUser = await updateUserProfile(token, profileData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    isLoading,
    token,
    login,
    loginWithGoogle: loginWithGoogleHandler,
    register,
    logout: logoutHandler,
    resetPassword: resetPasswordHandler,
    verifyEmail: verifyEmailHandler,
    updateProfile: updateProfileHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
