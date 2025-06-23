'use client';

import React, { useState } from 'react';
import { useAddress } from '@/hooks/useAddress';
import { CreateAddressData } from '@/services/addressService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Input from '../common/Input';
import Button from '../common/Button';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';
import { parseGooglePlaceToAddress } from '@/utils/addressUtils';

interface AddressFormProps {
  onClose: () => void;
  onSubmit: () => void;
  initialData?: Partial<CreateAddressData>;
  editMode?: boolean;
  addressId?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onClose,
  onSubmit,
  initialData,
  editMode = false,
  addressId
}) => {
  const { addAddress, editAddress, isLoading } = useAddress();
  
  const [formData, setFormData] = useState<CreateAddressData>({
    type: initialData?.type || 'home',
    name: initialData?.name || '',
    street: initialData?.street || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    country: initialData?.country || 'United States',
    isDefault: initialData?.isDefault || false,
    landmark: initialData?.landmark || '',
    instructions: initialData?.instructions || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Google Places selection
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    const addressData = parseGooglePlaceToAddress(place, formData);
    setFormData(prev => ({
      ...prev,
      ...addressData
    }));
    
    // Clear related errors
    setErrors(prev => ({
      ...prev,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    try {
      console.log('Attempting to save address...');
      if (editMode && addressId) {
        console.log('Editing address with ID:', addressId);
        const result = await editAddress(addressId, formData);
        console.log('Edit address result:', result);
      } else {
        console.log('Adding new address');
        const result = await addAddress(formData);
        console.log('Add address result:', result);
      }
      console.log('Address saved successfully');
      onSubmit();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {editMode ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Address Name */}
          <Input
            label="Address Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="E.g., My Home, Parent's House"
            error={errors.name}
            required
          />
          
          {/* Google Places Autocomplete */}
          <GooglePlacesAutocomplete
            label="Street Address"
            name="street"
            value={formData.street}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Start typing your address"
            error={errors.street}
            required
          />
          
          {/* City */}
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., New York, Chicago, Los Angeles"
            error={errors.city}
            required
          />
          
          {/* State */}
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="e.g., NY, CA, TX"
            error={errors.state}
            required
          />
          
          {/* ZIP Code */}
          <Input
            label="ZIP Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="e.g., 12345 or 12345-6789"
            error={errors.zipCode}
            required
          />
          
          {/* Country */}
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
          />
          
          {/* Landmark (Optional) */}
          <Input
            label="Landmark (Optional)"
            name="landmark"
            value={formData.landmark || ''}
            onChange={handleChange}
            placeholder="Nearby landmark for easier navigation"
          />
          
          {/* Special Instructions (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              name="instructions"
              value={formData.instructions || ''}
              onChange={handleChange}
              placeholder="Any special instructions for the caregiver"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
            />
          </div>
          
          {/* Set as Default */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
              Set as default address
            </label>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editMode ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
