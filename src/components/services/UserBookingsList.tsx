'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useBooking from '@/hooks/useBooking';
import { Booking } from '@/services/bookingService';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface UserBookingsListProps {
  limit?: number;
  showViewAll?: boolean;
}

const UserBookingsList: React.FC<UserBookingsListProps> = ({ 
  limit = 5,
  showViewAll = true
}) => {
  const router = useRouter();
  const { fetchUserBookings, cancelUserBooking, isLoading, error } = useBooking();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  
  // Fetch bookings on component mount and when filters change
  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter]);
  
  const loadBookings = async () => {
    try {
      const response = await fetchUserBookings(currentPage, limit, {
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }
  
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have any bookings yet.</p>
        <button 
          onClick={() => router.push('/services/browse')}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Browse Services
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Your Bookings ({totalBookings})
        </h3>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="statusFilter" className="text-sm text-gray-600">
            Filter by:
          </label>
          <select
            id="statusFilter"
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            value={statusFilter || 'all'}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div 
            key={booking._id} 
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{booking.serviceId.title}</h4>
                <p className="text-sm text-gray-600">
                  Provider: {booking.providerId.firstName} {booking.providerId.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(booking.dateTime)}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {booking.duration} minutes
                </p>
              </div>
              
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <p className="font-semibold mt-1">${booking.totalPrice.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleViewDetails(booking._id)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                View Details
              </button>
              
              {/* Chat button - only show for confirmed or in-progress bookings */}
              {(booking.status === 'confirmed' || booking.status === 'in-progress') && (
                <button
                  onClick={() => router.push(`/booking/${booking._id}#chat`)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                  Chat
                </button>
              )}
              
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                  disabled={isLoadingCancel}
                >
                  {isLoadingCancel ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
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
                className={`px-3 py-1 rounded-md ${
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
              className={`px-3 py-1 rounded-md ${
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
      
      {/* View All Link */}
      {showViewAll && bookings.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard/user/bookings')}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            View All Bookings
          </button>
        </div>
      )}
      
      {/* Cancel Error */}
      {cancelError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {cancelError}
        </div>
      )}
    </div>
  );
};

export default UserBookingsList;
