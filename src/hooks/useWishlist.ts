'use client';

import { useState } from 'react';
import { 
  getUserWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  isInWishlist,
  WishlistItem,
  WishlistResponse
} from '@/services/wishlistService';

export const useWishlist = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch user's wishlist
  const fetchWishlist = async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getUserWishlist(page, limit);
      setWishlistItems(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wishlist');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add service to wishlist
  const addServiceToWishlist = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await addToWishlist(serviceId);
      // Update local state if needed
      setWishlistItems(prev => [...prev, response]);
      setTotalItems(prev => prev + 1);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to add service to wishlist');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove service from wishlist
  const removeServiceFromWishlist = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await removeFromWishlist(serviceId);
      // Update local state
      setWishlistItems(prev => prev.filter(item => item.serviceId._id !== serviceId));
      setTotalItems(prev => prev - 1);
    } catch (err: any) {
      setError(err.message || 'Failed to remove service from wishlist');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if service is in wishlist
  const checkIfInWishlist = async (serviceId: string) => {
    try {
      return await isInWishlist(serviceId);
    } catch (err: any) {
      console.error('Error checking if service is in wishlist:', err);
      return false;
    }
  };
  
  return {
    wishlistItems,
    totalItems,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchWishlist,
    addServiceToWishlist,
    removeServiceFromWishlist,
    checkIfInWishlist
  };
};

export default useWishlist;
