'use client';

import React, { useState, useEffect } from 'react';
import useWishlist from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistButtonProps {
  serviceId: string;
  className?: string;
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  serviceId, 
  className = '',
  showText = false
}) => {
  const { isAuthenticated } = useAuth();
  const { addServiceToWishlist, removeServiceFromWishlist, checkIfInWishlist } = useWishlist();
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check if service is in wishlist on component mount
  useEffect(() => {
    if (isAuthenticated && serviceId) {
      checkWishlistStatus();
    }
  }, [serviceId, isAuthenticated]);
  
  const checkWishlistStatus = async () => {
    setIsChecking(true);
    try {
      const result = await checkIfInWishlist(serviceId);
      setIsInWishlist(result);
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    
    setIsLoading(true);
    try {
      if (isInWishlist) {
        await removeServiceFromWishlist(serviceId);
        setIsInWishlist(false);
      } else {
        await addServiceToWishlist(serviceId);
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine heart icon fill based on wishlist status
  const heartFill = isInWishlist ? 'currentColor' : 'none';
  
  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading || isChecking}
      className={`flex items-center justify-center transition-colors ${
        isInWishlist ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-600'
      } ${className}`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg 
        className="w-6 h-6" 
        fill={heartFill} 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        ></path>
      </svg>
      
      {showText && (
        <span className="ml-2">
          {isLoading ? 'Processing...' : isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
