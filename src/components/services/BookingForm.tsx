'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useBooking from '@/hooks/useBooking';
import Button from '../common/Button';
import Input from '../common/Input';
import { BookingFormData } from '@/services/bookingService';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  servicePrice: {
    amount: number;
    type: 'fixed' | 'hourly';
  };
  providerId: string;
  providerName: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  serviceId,
  serviceName,
  servicePrice,
  providerId,
  providerName
}) => {
  const { user, isAuthenticated } = useAuth();
  const { createNewBooking, isLoading, error } = useBooking();
  const router = useRouter();
  
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId,
    dateTime: '',
    duration: servicePrice.type === 'hourly' ? 60 : 0, // Default 1 hour for hourly services
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    specialInstructions: ''
  });
  
  const [formErrors, setFormErrors] = useState<{
    dateTime?: string;
    duration?: string;
    address?: string;
    general?: string;
  }>({});
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Calculate total price based on service price and duration
  const calculateTotalPrice = () => {
    if (servicePrice.type === 'fixed') {
      return servicePrice.amount;
    } else {
      // Convert duration from minutes to hours
      return servicePrice.amount * (formData.duration / 60);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (address)
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof BookingFormData] as any,
          [child]: value
        }
      }));
    } else if (name === 'duration') {
      // Convert duration to number
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (name.includes('.')) {
      const [parent] = name.split('.');
      if (formErrors[parent as keyof typeof formErrors]) {
        setFormErrors((prev) => ({
          ...prev,
          [parent]: undefined
        }));
      }
    } else if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: {
      dateTime?: string;
      duration?: string;
      address?: string;
      general?: string;
    } = {};
    
    // Validate date and time
    if (!formData.dateTime) {
      newErrors.dateTime = 'Please select a date and time';
    } else {
      const selectedDate = new Date(formData.dateTime);
      const now = new Date();
      
      if (selectedDate <= now) {
        newErrors.dateTime = 'Please select a future date and time';
      }
    }
    
    // Validate duration for hourly services
    if (servicePrice.type === 'hourly' && (!formData.duration || formData.duration < 30)) {
      newErrors.duration = 'Duration must be at least 30 minutes';
    }
    
    // Validate address
    if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
      newErrors.address = 'Please fill in all required address fields';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Validate form
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    
    try {
      const response = await createNewBooking(formData);
      setBookingId(response.booking._id);
      setShowSuccessMessage(true);
      
      // Redirect to booking details page after 3 seconds
      setTimeout(() => {
        router.push(`/dashboard/user?booking=success&id=${response.booking._id}`);
      }, 3000);
    } catch (err: any) {
      setFormErrors({
        general: err.message || 'Failed to create booking. Please try again.'
      });
    }
  };
  
  // Format date for min attribute of datetime-local input
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Add 30 minutes to current time
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  if (showSuccessMessage) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Booking Successful!</h3>
        <p className="text-green-700 mb-4">
          Your booking request has been sent to {providerName}. You will be redirected to your dashboard shortly.
        </p>
        <p className="text-sm text-green-600">Booking ID: {bookingId}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Book this Service</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service and Provider Info */}
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Service:</span>
            <span>{serviceName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Provider:</span>
            <span>{providerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Price:</span>
            <span>
              ${servicePrice.amount.toFixed(2)} {servicePrice.type === 'hourly' ? 'per hour' : 'fixed'}
            </span>
          </div>
        </div>
        
        {/* Date and Time */}
        <div>
          <label htmlFor="dateTime" className="block text-sm font-medium mb-1">
            Date and Time<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.dateTime}
            onChange={handleChange}
            min={getMinDateTime()}
            required
          />
          {formErrors.dateTime && (
            <p className="mt-1 text-xs text-red-500">{formErrors.dateTime}</p>
          )}
        </div>
        
        {/* Duration (for hourly services) */}
        {servicePrice.type === 'hourly' && (
          <div>
            <label htmlFor="duration" className="block text-sm font-medium mb-1">
              Duration (minutes)<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="duration"
              name="duration"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.duration}
              onChange={handleChange}
              required
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </select>
            {formErrors.duration && (
              <p className="mt-1 text-xs text-red-500">{formErrors.duration}</p>
            )}
          </div>
        )}
        
        {/* Address */}
        <div>
          <h3 className="text-sm font-medium mb-2">Service Address<span className="text-red-500 ml-1">*</span></h3>
          
          <div className="space-y-3">
            <Input
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              required
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
              />
              
              <Input
                label="State"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Zip Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                required
              />
              
              <Input
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {formErrors.address && (
            <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>
          )}
        </div>
        
        {/* Special Instructions */}
        <div>
          <label htmlFor="specialInstructions" className="block text-sm font-medium mb-1">
            Special Instructions (Optional)
          </label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.specialInstructions}
            onChange={handleChange}
            placeholder="Any special requirements or information the provider should know"
          ></textarea>
        </div>
        
        {/* Total Price */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Price:</span>
            <span className="text-xl font-bold">${calculateTotalPrice().toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {servicePrice.type === 'hourly' 
              ? `Based on ${formData.duration / 60} hour(s) at $${servicePrice.amount.toFixed(2)}/hour`
              : 'Fixed price service'}
          </p>
        </div>
        
        {/* Error Message */}
        {formErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {formErrors.general}
          </div>
        )}
        
        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Book Now'}
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          By booking this service, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
};

export default BookingForm;
