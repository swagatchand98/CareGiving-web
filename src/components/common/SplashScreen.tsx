'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  duration?: number; // Duration in milliseconds
}

const SplashScreen: React.FC<SplashScreenProps> = ({ duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check if we've shown the splash screen in this session
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    const lastPageVisit = sessionStorage.getItem('lastPageVisit');
    const currentPath = window.location.pathname;
    
    // If we've already shown it on this page, don't show it again
    if (hasShownSplash && lastPageVisit === currentPath) {
      setIsVisible(false);
      setShouldRender(false);
      return;
    }
    
    // Set a timeout to hide the splash screen after the specified duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      
      // After animation completes, stop rendering the component
      const animationTimer = setTimeout(() => {
        setShouldRender(false);
        
        // Mark that we've shown the splash screen in this session
        sessionStorage.setItem('hasShownSplash', 'true');
        sessionStorage.setItem('lastPageVisit', currentPath);
      }, 500); // Match this with the exit animation duration
      
      return () => clearTimeout(animationTimer);
    }, duration);
    
    // Clean up the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [duration]);
  
  // Don't render anything if shouldRender is false
  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 mb-8 relative">
              {/* Logo animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="45" fill="#3C73FE" />
                  <path 
                    d="M35 50C35 42.268 41.268 36 49 36H51C58.732 36 65 42.268 65 50V64H35V50Z" 
                    fill="white" 
                  />
                  <circle cx="50" cy="30" r="10" fill="white" />
                </svg>
              </motion.div>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold text-gray-800"
            >
              Urban Caregiving
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="h-1 bg-blue-500 mt-4 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
