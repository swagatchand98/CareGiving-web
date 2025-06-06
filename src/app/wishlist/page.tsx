'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useWishlist from '@/hooks/useWishlist';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import WishlistItem from '@/components/services/WishlistItem';

export default function WishlistPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { 
    wishlistItems, 
    totalItems, 
    currentPage, 
    totalPages, 
    isLoading, 
    error, 
    fetchWishlist, 
    removeServiceFromWishlist 
  } = useWishlist();
  
  const [pageSize, setPageSize] = useState(10);
  const [removingServiceId, setRemovingServiceId] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // Fetch wishlist on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated, currentPage, pageSize]);
  
  const loadWishlist = async () => {
    try {
      await fetchWishlist(currentPage, pageSize);
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  };
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
  };
  
  const handlePageChange = (page: number) => {
    fetchWishlist(page, pageSize);
  };
  
  const handleRemoveFromWishlist = async (serviceId: string) => {
    setRemovingServiceId(serviceId);
    try {
      await removeServiceFromWishlist(serviceId);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    } finally {
      setRemovingServiceId(null);
    }
  };
  
  // Show loading state
  if ((isLoading && authLoading) || (!authLoading && isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is not authenticated, show a message or redirect
  if (!isAuthenticated) {
    return null; // We'll redirect in the useEffect hook
  }
  
  // Ensure user is not null before rendering
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <EnhancedHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
              <p className="text-gray-600">Save services you're interested in for later</p>
            </div>
            <Button 
              onClick={() => router.push('/services/browse')}
              className="px-6 py-2"
            >
              Browse Services
            </Button>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {totalItems} {totalItems === 1 ? 'service' : 'services'} saved
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">
                  Show:
                </label>
                <select
                  id="pageSize"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Wishlist Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                <Button 
                  onClick={() => router.push('/services/browse')}
                  className="px-6 py-2"
                >
                  Browse Services
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {wishlistItems.length} of {totalItems} saved services
                  </p>
                </div>
                
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <WishlistItem 
                      key={item._id} 
                      item={item} 
                      onRemove={handleRemoveFromWishlist}
                      isRemoving={removingServiceId === item.serviceId._id}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md ${
                            currentPage === page
                              ? 'bg-black text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
