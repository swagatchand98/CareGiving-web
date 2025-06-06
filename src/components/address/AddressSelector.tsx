'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAddress } from '@/hooks/useAddress';
import { Address } from '@/services/addressService';
import { MapPinIcon, ChevronDownIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddressForm from './AddressForm';

interface AddressSelectorProps {
  className?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ className = '' }) => {
  const { defaultAddress, addresses, fetchAddresses, fetchDefaultAddress, makeDefaultAddress, removeAddress, isLoading, dataInitialized } = useAddress();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // No need to fetch addresses on component mount as the useAddress hook now handles this
  // with caching to prevent excessive API calls

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle address selection
  const handleSelectAddress = async (address: Address) => {
    if (!address.isDefault) {
      try {
        await makeDefaultAddress(address._id);
      } catch (error) {
        console.error('Error setting default address:', error);
      }
    }
    setIsDropdownOpen(false);
  };

  // Handle adding a new address
  const handleAddAddress = () => {
    console.log('Add address button clicked');
    setIsAddingAddress(true);
    setIsDropdownOpen(false);
  };

  // Handle address form close
  const handleAddressFormClose = () => {
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    setAddressToEdit(null);
  };

  // Handle address form submit
  const handleAddressFormSubmit = async () => {
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    setAddressToEdit(null);
    await fetchAddresses();
    await fetchDefaultAddress();
  };

  // Handle edit address
  const handleEditAddress = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation(); // Prevent address selection
    setAddressToEdit(address);
    setIsEditingAddress(true);
    setIsDropdownOpen(false);
  };

  // Handle delete address
  const handleDeleteAddress = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation(); // Prevent address selection
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await removeAddress(addressId);
        await fetchAddresses();
        await fetchDefaultAddress();
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  // Format address for display
  const formatAddress = (address: Address) => {
    return `${address.name}, ${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  // Truncate address for display
  const truncateAddress = (address: string, maxLength = 30) => {
    return address.length > maxLength ? `${address.substring(0, maxLength)}...` : address;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Address selector button */}
      <button
        onClick={() => {
          console.log('Address selector button clicked, toggling dropdown');
          setIsDropdownOpen(prevState => {
            const newState = !prevState;
            console.log('Dropdown state changing to:', newState);
            return newState;
          });
        }}
        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <MapPinIcon className="h-5 w-5 text-primary-600" />
        <span 
          className="max-w-[200px] truncate"
          onClick={(e) => {
            // If there's no default address and the text is "Add address", directly open the form
            if (!defaultAddress && !isLoading) {
              e.stopPropagation(); // Prevent dropdown toggle
              console.log('Add address text clicked, opening form directly');
              setIsAddingAddress(true);
            }
          }}
        >
          {isLoading ? (
            'Loading address...'
          ) : defaultAddress ? (
            truncateAddress(formatAddress(defaultAddress))
          ) : (
            <span className="text-blue-600 hover:text-blue-800">Add address</span>
          )}
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Address dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Select a delivery address</h3>
          </div>

          {/* Address list */}
          <div className="max-h-60 overflow-y-auto">
            {addresses.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">No addresses saved</p>
                <button
                  onClick={handleAddAddress}
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add your first address
                </button>
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address._id}
                  onClick={() => handleSelectAddress(address)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    address.isDefault ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <MapPinIcon className={`h-5 w-5 mt-0.5 mr-2 ${address.isDefault ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {address.name} <span className="text-xs font-normal text-gray-500 ml-1">({address.type})</span>
                        </div>
                        <div className="text-sm text-gray-600">{address.street}</div>
                        <div className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </div>
                        {address.isDefault && (
                          <span className="inline-block mt-1 text-xs font-medium text-blue-600">Default</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button 
                        onClick={(e) => handleEditAddress(e, address)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteAddress(e, address._id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add new address button */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleAddAddress}
              className="address-selector-add-button flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add a new address
            </button>
          </div>
        </div>
      )}

      {/* Address form modal - for both adding and editing */}
      {(isAddingAddress || isEditingAddress) && (
        <AddressForm
          onClose={handleAddressFormClose}
          onSubmit={handleAddressFormSubmit}
          initialData={addressToEdit || undefined}
          editMode={isEditingAddress}
          addressId={addressToEdit?._id}
        />
      )}
    </div>
  );
};

export default AddressSelector;
