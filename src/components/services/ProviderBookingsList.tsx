'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useBooking from '@/hooks/useBooking';
import { Booking } from '@/services/bookingService';

interface ProviderBookingsListProps {
  limit?: number;
  showViewAll?: boolean;
}

const ProviderBookingsList: React.FC<ProviderBookingsListProps> = ({ 
  limit = 5,
  showViewAll = true
}) => {
  const router = useRouter();
  const { fetchProviderBookings, updateStatus, isLoading, error } = useBooking();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Fetch bookings on component mount and when filters change
  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter]);
  
  const loadBookings = async () => {
    try {
      const response = await fetchProviderBookings(currentPage, limit, {
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
  
  const handleUpdateStatus = async (bookingId: string, newStatus: 'confirmed' | 'in-progress' | 'completed') => {
    setIsUpdatingStatus(true);
    setUpdateError(null);
    
    try {
      await updateStatus(bookingId, newStatus);
      // Refresh bookings after status update
      loadBookings();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update booking status');
    } finally {
      setIsUpdatingStatus(false);
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
  
  // Get next status options based on current status
  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [{ value: 'confirmed', label: 'Confirm' }];
      case 'confirmed':
        return [{ value: 'in-progress', label: 'Start Service' }];
      case 'in-progress':
        return [{ value: 'completed', label: 'Complete' }];
      default:
        return [];
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
      </div>
    );
  }
  
  return (
    <div>
      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Your Service Bookings ({totalBookings})
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
                <h4 className="font-semibold">{booking.serviceId?.title || 'Untitled Service'}</h4>
                <p className="text-sm text-gray-600">
                  Client: {booking.userId?.firstName || 'Unknown'} {booking.userId?.lastName || ''}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(booking.dateTime)}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {booking.duration} minutes
                </p>
                {/* Display timeslot segment information if available */}
                {booking.timeSlotSegment && (
                  <p className="text-sm text-gray-600">
                    Time Slot: {booking.timeSlotSegment.startTime} - {booking.timeSlotSegment.endTime}
                    {booking.timeSlotSegment.isReserved && <span className="ml-2 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Reserved</span>}
                    {booking.timeSlotSegment.isBooked && <span className="ml-2 px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">Booked</span>}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Address: {booking.address?.street || 'N/A'}, {booking.address?.city || ''}, {booking.address?.state || ''} {booking.address?.zipCode || ''}
                </p>
              </div>
              
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <p className="font-semibold mt-1">${booking.totalPrice?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleViewDetails(booking._id)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                View Details
              </button>
              
              {/* Status Update Buttons */}
              {getNextStatusOptions(booking.status).map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleUpdateStatus(booking._id, option.value as any)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? 'Updating...' : option.label}
                </button>
              ))}
            </div>
            
            {/* Special Instructions */}
            {booking.specialInstructions && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium">Special Instructions:</p>
                <p className="text-sm text-gray-600">{booking.specialInstructions}</p>
              </div>
            )}
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
            onClick={() => router.push('/dashboard/provider/bookings')}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            View All Bookings
          </button>
        </div>
      )}
      
      {/* Update Error */}
      {updateError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {updateError}
        </div>
      )}
    </div>
  );
};

export default ProviderBookingsList;
