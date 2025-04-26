'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { TimeSlot, BookTimeSlotData } from '@/services/timeSlotService';
import TimeSlotSelector from './TimeSlotSelector';
import Button from '@/components/common/Button';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  onSuccess?: (bookingId: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  serviceId,
  serviceName,
  providerId,
  providerName,
  onSuccess
}) => {
  const router = useRouter();
  const { bookAvailableTimeSlot, error: apiError } = useTimeSlots();
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [bookingStep, setBookingStep] = useState<'select-time' | 'enter-details'>('select-time');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(apiError);
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle special instructions input change
  const handleSpecialInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSpecialInstructions(e.target.value);
  };
  
  // Proceed to next step
  const handleProceedToDetails = () => {
    if (!selectedTimeSlot) {
      return;
    }
    
    setBookingStep('enter-details');
    
    // Scroll to top of form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  // Go back to time selection
  const handleBackToTimeSelection = () => {
    setBookingStep('select-time');
  };
  
  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!address.street.trim()) {
      errors.street = 'Street address is required';
    }
    
    if (!address.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!address.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!address.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
      errors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      return;
    }
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Show loading state
      setIsLoading(true);
      
      const bookingData: BookTimeSlotData = {
        address,
        specialInstructions
      };
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });
      
      // Race the booking request against the timeout
      const bookingResponse = await Promise.race([
        bookAvailableTimeSlot(selectedTimeSlot._id, bookingData),
        timeoutPromise
      ]);
      
      // Show success message
      setSuccessMessage('Booking successful! Redirecting to booking details...');
      
      // Call onSuccess callback if provided
      if (onSuccess && bookingResponse && bookingResponse.booking) {
        onSuccess(bookingResponse.booking._id);
      } else if (bookingResponse && bookingResponse.booking) {
        // Redirect to booking details page after 2 seconds
        setTimeout(() => {
          router.push(`/booking/${bookingResponse.booking._id}`);
        }, 2000);
      } else {
        // Handle case where response is valid but doesn't have booking data
        setError('Booking was successful but booking details are missing');
        setTimeout(() => {
          router.push('/dashboard/user');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      
      if (err.message === 'Request timed out') {
        setFormErrors({
          general: 'The booking request timed out. Please try again.'
        });
      } else {
        setFormErrors({
          general: err.message || 'Failed to book time slot'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Book {serviceName}</h2>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {(error || formErrors.general) && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error || formErrors.general}
        </div>
      )}
      
      {bookingStep === 'select-time' ? (
        <>
          {/* Time Slot Selection */}
          <TimeSlotSelector
            serviceId={serviceId}
            onSelectTimeSlot={handleTimeSlotSelect}
            selectedTimeSlotId={selectedTimeSlot?._id}
          />
          
          {selectedTimeSlot && (
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Selected Time Slot</h3>
                <p className="text-blue-700">
                  {formatDate(selectedTimeSlot.date)} at {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                </p>
              </div>
              
              <Button
                onClick={handleProceedToDetails}
                fullWidth
              >
                Proceed to Details
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Booking Details Form */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-800 mb-2">Selected Time Slot</h3>
              <p className="text-blue-700">
                {selectedTimeSlot && (
                  <>
                    {formatDate(selectedTimeSlot.date)} at {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                  </>
                )}
              </p>
              <button
                onClick={handleBackToTimeSelection}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                Change Time Slot
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Fields */}
            <div>
              <h3 className="font-medium mb-3">Service Address</h3>
              
              {/* Street */}
              <div className="mb-3">
                <label htmlFor="street" className="block text-sm font-medium mb-1">
                  Street Address<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${
                    formErrors.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main St"
                />
                {formErrors.street && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.street}</p>
                )}
              </div>
              
              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="New York"
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${
                      formErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="NY"
                  />
                  {formErrors.state && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.state}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                    ZIP Code<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${
                      formErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10001"
                  />
                  {formErrors.zipCode && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.zipCode}</p>
                  )}
                </div>
              </div>
              
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="United States"
                />
              </div>
            </div>
            
            {/* Special Instructions */}
            <div>
              <label htmlFor="specialInstructions" className="block text-sm font-medium mb-1">
                Special Instructions (Optional)
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={specialInstructions}
                onChange={handleSpecialInstructionsChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Any special instructions or requirements for the provider..."
              ></textarea>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default BookingForm;
