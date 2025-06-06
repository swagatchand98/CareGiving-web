'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useBooking from '@/hooks/useBooking';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import { Booking } from '@/services/bookingService';

export default function UserBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { fetchUserBookings, cancelUserBooking, isLoading, error } = useBooking();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // Fetch bookings on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, currentPage, statusFilter, pageSize]);
  
  const loadBookings = async () => {
    try {
      const response = await fetchUserBookings(currentPage, pageSize, {
        status: statusFilter
      });
      
      setBookings(response.bookings);
      setTotalBookings(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value === 'all' ? undefined : value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when page size changes
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsLoadingCancel(true);
      setCancelError(null);
      
      try {
        await cancelUserBooking(bookingId);
        // Refresh bookings after cancellation
        loadBookings();
      } catch (err: any) {
        setCancelError(err.message || 'Failed to cancel booking');
      } finally {
        setIsLoadingCancel(false);
      }
    }
  };
  
  const handleViewDetails = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-gray-600">View and manage all your service bookings</p>
            </div>
            <Button 
              onClick={() => router.push('/services/browse')}
              className="px-6 py-2"
            >
              Book New Service
            </Button>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={statusFilter || 'all'}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Bookings</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
          
          {/* Bookings List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
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
                    Showing {bookings.length} of {totalBookings} bookings
                  </p>
                </div>
                
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div 
                      key={booking._id} 
                      className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <h3 className="font-semibold text-lg">{booking.serviceId.title}</h3>
                          <p className="text-sm text-gray-600">
                            Provider: {booking.providerId.firstName} {booking.providerId.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.dateTime)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {booking.duration} minutes
                          </p>
                          <p className="text-sm text-gray-600">
                            Address: {booking.address.street}, {booking.address.city}, {booking.address.state} {booking.address.zipCode}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <p className="font-semibold mt-2 text-lg">${booking.totalPrice.toFixed(2)}</p>
                          
                          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                            <Button
                              onClick={() => handleViewDetails(booking._id)}
                              variant="outline"
                              className="px-4 py-2 text-sm"
                            >
                              View Details
                            </Button>
                            
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                onClick={() => handleCancelBooking(booking._id)}
                                variant="secondary"
                                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 border-red-600"
                                disabled={isLoadingCancel}
                              >
                                {isLoadingCancel ? 'Cancelling...' : 'Cancel Booking'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
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
            
            {/* Cancel Error */}
            {cancelError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {cancelError}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
