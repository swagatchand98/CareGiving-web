'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import api from '@/lib/axios';
import {
  UserData,
  ProviderRegistrationData,
  loginWithEmailPassword,
  loginWithGoogle,
  registerWithEmailPassword,
  registerAsProvider,
  registerAsProviderWithGoogle,
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
  login: (email: string, password: string) => Promise<UserData>;
  loginWithGoogle: () => Promise<UserData>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerProvider: (
    email: string, 
    password: string, 
    providerData: ProviderRegistrationData
  ) => Promise<void>;
  registerProviderWithGoogle: (providerData: ProviderRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateProfile: (profileData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    bio?: string;
    experience?: string;
    qualifications?: string;
    serviceType?: string;
    hourlyRate?: number;
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
              // Ensure user role is properly set
              const userWithRole = {
                ...userData,
                role: userData.role || 'user' // Default to 'user' if role is not defined
              };
              setUser(userWithRole);
              setToken(userWithRole.token);
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

  const login = async (email: string, password: string): Promise<UserData> => {
    setIsLoading(true);
    try {
      const userData = await loginWithEmailPassword(email, password);
      // Ensure user role is properly set
      const userWithRole = {
        ...userData,
        role: userData.role || 'user' // Default to 'user' if role is not defined
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      setToken(userWithRole.token);
      return userWithRole;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleHandler = async (): Promise<UserData> => {
    setIsLoading(true);
    try {
      const userData = await loginWithGoogle();
      // Ensure user role is properly set
      const userWithRole = {
        ...userData,
        role: userData.role || 'user' // Default to 'user' if role is not defined
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      setToken(userWithRole.token);
      return userWithRole;
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
      // Ensure user role is properly set
      const userWithRole = {
        ...userData,
        role: userData.role || 'user' // Default to 'user' if role is not defined
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      setToken(userWithRole.token);
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
    bio?: string;
    experience?: string;
    qualifications?: string;
    serviceType?: string;
    hourlyRate?: number;
  }) => {
    if (!token || !user) {
      throw new Error('Not authenticated');
    }
    
    try {
      const updatedUser = await updateUserProfile(token, profileData);
      // Ensure user role is preserved when updating profile
      const userWithRole = {
        ...updatedUser,
        role: user.role || 'user' // Preserve existing role or default to 'user'
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const registerProviderHandler = async (
    email: string, 
    password: string, 
    providerData: ProviderRegistrationData
  ) => {
    setIsLoading(true);
    try {
      const userData = await registerAsProvider(email, password, providerData);
      // Ensure user role is properly set
      const userWithRole = {
        ...userData,
        role: 'provider' // Always set to 'provider' for provider registration
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      setToken(userWithRole.token);
    } catch (error) {
      console.error('Provider registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerProviderWithGoogleHandler = async (providerData: ProviderRegistrationData) => {
    setIsLoading(true);
    try {
      const userData = await registerAsProviderWithGoogle(providerData);
      // Ensure user role is properly set
      const userWithRole = {
        ...userData,
        role: 'provider' // Always set to 'provider' for provider registration
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      setToken(userWithRole.token);
    } catch (error) {
      console.error('Provider Google registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
    registerProvider: registerProviderHandler,
    registerProviderWithGoogle: registerProviderWithGoogleHandler,
    logout: logoutHandler,
    resetPassword: resetPasswordHandler,
    verifyEmail: verifyEmailHandler,
    updateProfile: updateProfileHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
