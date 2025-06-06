'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  getUserAddresses, 
  getAddressById, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress as setAddressAsDefault, 
  getDefaultAddress,
  Address,
  AddressResponse,
  CreateAddressData,
  UpdateAddressData
} from '@/services/addressService';

// Cache for addresses data
let addressesCache: Address[] | null = null;
let defaultAddressCache: Address | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useAddress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>(addressesCache || []);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(defaultAddressCache || null);
  const [dataInitialized, setDataInitialized] = useState(!!addressesCache);
  
  // Fetch all addresses for the logged-in user with caching
  const fetchAddresses = useCallback(async (forceRefresh = false) => {
    // Check if we have cached data and it's still valid
    const now = Date.now();
    if (!forceRefresh && addressesCache && now - lastFetchTime < CACHE_DURATION) {
      setAddresses(addressesCache);
      return addressesCache;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getUserAddresses();
      // Update cache and state
      addressesCache = response.addresses;
      lastFetchTime = now;
      setAddresses(response.addresses);
      setDataInitialized(true);
      return response.addresses;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch addresses');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch address by ID
  const fetchAddressById = async (addressId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAddressById(addressId);
      setSelectedAddress(response.address);
      return response.address;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new address
  const addAddress = async (addressData: CreateAddressData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createAddress(addressData);
      // Update local state
      setAddresses(prev => [...prev, response.address]);
      
      // If this is the default address, update defaultAddress state
      if (response.address.isDefault) {
        setDefaultAddress(response.address);
      }
      
      return response.address;
    } catch (err: any) {
      setError(err.message || 'Failed to create address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an address
  const editAddress = async (addressId: string, addressData: UpdateAddressData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateAddress(addressId, addressData);
      
      // Update local state
      setAddresses(prev => 
        prev.map(addr => addr._id === addressId ? response.address : addr)
      );
      
      // If this is the default address, update defaultAddress state
      if (response.address.isDefault) {
        setDefaultAddress(response.address);
        // Also update other addresses to not be default
        setAddresses(prev => 
          prev.map(addr => addr._id !== addressId ? { ...addr, isDefault: false } : addr)
        );
      }
      
      // If this was the selected address, update it
      if (selectedAddress && selectedAddress._id === addressId) {
        setSelectedAddress(response.address);
      }
      
      return response.address;
    } catch (err: any) {
      setError(err.message || 'Failed to update address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete an address
  const removeAddress = async (addressId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteAddress(addressId);
      
      // Update local state
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      
      // If this was the selected address, clear it
      if (selectedAddress && selectedAddress._id === addressId) {
        setSelectedAddress(null);
      }
      
      // If this was the default address, clear it
      if (defaultAddress && defaultAddress._id === addressId) {
        setDefaultAddress(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set an address as default
  const makeDefaultAddress = async (addressId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await setAddressAsDefault(addressId);
      
      // Update local state
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        }))
      );
      
      setDefaultAddress(response.address);
      
      return response.address;
    } catch (err: any) {
      setError(err.message || 'Failed to set default address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get user's default address with caching
  const fetchDefaultAddress = useCallback(async (forceRefresh = false) => {
    // Check if we have cached data and it's still valid
    const now = Date.now();
    if (!forceRefresh && defaultAddressCache && now - lastFetchTime < CACHE_DURATION) {
      setDefaultAddress(defaultAddressCache);
      return defaultAddressCache;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getDefaultAddress();
      if (response && response.address) {
        // Update cache and state
        defaultAddressCache = response.address;
        setDefaultAddress(response.address);
        return response.address;
      } else {
        defaultAddressCache = null;
        setDefaultAddress(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch default address');
      setDefaultAddress(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initialize data on mount if not already initialized
  useEffect(() => {
    if (!dataInitialized) {
      // Only fetch if we don't have cached data
      fetchAddresses();
      fetchDefaultAddress();
    }
  }, [dataInitialized, fetchAddresses, fetchDefaultAddress]);

  // Update cache when data changes
  useEffect(() => {
    // Update the cache when addresses change
    if (addresses.length > 0) {
      addressesCache = addresses;
      lastFetchTime = Date.now();
    }
  }, [addresses]);

  // Update default address cache when it changes
  useEffect(() => {
    if (defaultAddress) {
      defaultAddressCache = defaultAddress;
    }
  }, [defaultAddress]);

  return {
    addresses,
    selectedAddress,
    defaultAddress,
    isLoading,
    error,
    fetchAddresses,
    fetchAddressById,
    addAddress,
    editAddress,
    removeAddress,
    makeDefaultAddress,
    fetchDefaultAddress,
    dataInitialized
  };
};

export default useAddress;
