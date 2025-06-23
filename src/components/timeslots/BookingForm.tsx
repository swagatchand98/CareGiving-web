'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useAddress } from '@/hooks/useAddress';
import { TimeSlot, BookTimeSlotData } from '@/services/timeSlotService';
import { Address } from '@/services/addressService';
import TimeSlotSelector from './TimeSlotSelector';
import AddressSelector from '@/components/address/AddressSelector';
import Button from '@/components/common/Button';
import GooglePlacesAutocomplete from '@/components/address/GooglePlacesAutocomplete';
import { parseGooglePlaceToAddress } from '@/utils/addressUtils';

// Define the TimeSlotSegment interface
interface TimeSlotSegment {
  timeSlotId: string;
  start: string;
  end: string;
  isBooked: boolean;
  segmentIndex: number;
}

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
  const { defaultAddress, addresses, fetchAddresses, isLoading: addressLoading } = useAddress();
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<TimeSlotSegment | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
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
  
  // Load addresses when component mounts
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  
  // Set default address when available
  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
      setAddress({
        street: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zipCode,
        country: defaultAddress.country || 'United States'
      });
    }
  }, [defaultAddress]);
  
  // Update address form when selected address changes
  useEffect(() => {
    if (selectedAddress) {
      setAddress({
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country || 'United States'
      });
      
      // Clear any address-related errors
      setFormErrors(prev => ({
        ...prev,
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }));
    }
  }, [selectedAddress]);
  
  // Handle address selection from AddressSelector
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot, segment?: TimeSlotSegment) => {
    console.log('Time slot selected:', timeSlot);
    setSelectedTimeSlot(timeSlot);
    
    if (segment) {
      console.log('Segment selected:', segment);
      setSelectedSegment(segment);
    } else {
      setSelectedSegment(null);
    }
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
  
  // Handle Google Places selection
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    const addressData = parseGooglePlaceToAddress(place, address);
    setAddress(prev => ({
      ...prev,
      ...addressData
    }));
    
    // Clear related errors
    setFormErrors(prev => ({
      ...prev,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }));
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
        specialInstructions,
        // If a segment is selected, include the segment times
        ...(selectedSegment && {
          segmentStart: selectedSegment.start,
          segmentEnd: selectedSegment.end,
          segmentIndex: selectedSegment.segmentIndex
        })
      };
      
      console.log('Booking data being sent to API:', bookingData);
      
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
      setSuccessMessage('Booking created! Redirecting to payment page...');
      
      // Call onSuccess callback if provided
      if (onSuccess && bookingResponse && bookingResponse.booking) {
        onSuccess(bookingResponse.booking._id);
      } else if (bookingResponse && bookingResponse.booking) {
        // Redirect to payment page after 1.5 seconds
        setTimeout(() => {
          router.push(`/payment/${bookingResponse.booking._id}`);
        }, 1500);
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
            selectedSegmentIndex={selectedSegment?.segmentIndex}
          />
          
          {selectedTimeSlot && (
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Selected Time Slot</h3>
                <p className="text-blue-700">
                  {formatDate(selectedTimeSlot.date)} at {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                </p>
                {selectedSegment && (
                  <p className="text-blue-700 mt-1">
                    <span className="font-medium">Selected Segment:</span> {formatTime(selectedSegment.start)} - {formatTime(selectedSegment.end)}
                  </p>
                )}
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
              {selectedSegment && (
                <p className="text-blue-700 mt-1">
                  <span className="font-medium">Selected Segment:</span> {formatTime(selectedSegment.start)} - {formatTime(selectedSegment.end)}
                </p>
              )}
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
              
              {/* Address Selector */}
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Select from your saved addresses or enter a new address below:</p>
                <div className="custom-address-selector">
                  {/* Custom implementation of AddressSelector that updates the form */}
                  {addresses.length > 0 ? (
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Saved Addresses</label>
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                        {addresses.map((addr) => (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddress(addr)}
                            className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                              selectedAddress?._id === addr._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {addr.name} <span className="text-xs font-normal text-gray-500 ml-1">({addr.type})</span>
                                </div>
                                <div className="text-sm text-gray-600">{addr.street}</div>
                                <div className="text-sm text-gray-600">
                                  {addr.city}, {addr.state} {addr.zipCode}
                                </div>
                                {addr.isDefault && (
                                  <span className="inline-block mt-1 text-xs font-medium text-blue-600">Default</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-gray-500 mb-2">No saved addresses found</p>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <AddressSelector />
                  </div>
                </div>
              </div>
              
              {/* Street - Google Places Autocomplete */}
              <div className="mb-3">
                <GooglePlacesAutocomplete
                  label="Street Address"
                  id="street"
                  name="street"
                  value={address.street}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Start typing your address"
                  error={formErrors.street}
                  required
                />
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
