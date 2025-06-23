'use client';

import { useEffect } from 'react';
import { useSplashScreen } from '@/contexts/SplashScreenContext';

/**
 * Hook to control splash screen behavior in components
 * @param options Configuration options
 * @param options.showOnMount Whether to show splash screen when component mounts
 * @param options.hideAfterLoad Whether to hide splash screen after component loads
 * @param options.dependencies Array of dependencies to watch for changes
 */
export const useSplashScreenEffect = ({
  showOnMount = false,
  hideAfterLoad = true,
  dependencies = []
}: {
  showOnMount?: boolean;
  hideAfterLoad?: boolean;
  dependencies?: any[];
} = {}) => {
  const { setIsLoading, showSplashOnNextNavigate } = useSplashScreen();
  
  // Effect to show splash screen on mount if requested
  useEffect(() => {
    if (showOnMount) {
      showSplashOnNextNavigate();
    }
  }, [showOnMount, showSplashOnNextNavigate]);
  
  // Effect to hide splash screen after dependencies are loaded
  useEffect(() => {
    if (hideAfterLoad) {
      // Small delay to ensure content has rendered
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [...dependencies, hideAfterLoad, setIsLoading]);
  
  return { setIsLoading, showSplashOnNextNavigate };
};
