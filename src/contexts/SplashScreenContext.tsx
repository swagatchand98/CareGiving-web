'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SplashScreen from '@/components/common/SplashScreen';

interface SplashScreenContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showSplashOnNextNavigate: () => void;
  hideSplashForSession: () => void;
}

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(undefined);

export const useSplashScreen = () => {
  const context = useContext(SplashScreenContext);
  if (context === undefined) {
    throw new Error('useSplashScreen must be used within a SplashScreenProvider');
  }
  return context;
};

interface SplashScreenProviderProps {
  children: ReactNode;
  splashDuration?: number;
}

export const SplashScreenProvider: React.FC<SplashScreenProviderProps> = ({ 
  children, 
  splashDuration = 3000 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to force showing splash screen on next navigation
  const showSplashOnNextNavigate = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hasShownSplash');
      sessionStorage.removeItem('lastPageVisit');
    }
  };
  
  // Function to hide splash for the entire session
  const hideSplashForSession = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasShownSplash', 'true');
      sessionStorage.setItem('lastPageVisit', '*');
    }
  };
  
  // Value to be provided to consumers
  const value = {
    isLoading,
    setIsLoading,
    showSplashOnNextNavigate,
    hideSplashForSession
  };

  return (
    <SplashScreenContext.Provider value={value}>
      <SplashScreen duration={splashDuration} />
      {children}
    </SplashScreenContext.Provider>
  );
};
