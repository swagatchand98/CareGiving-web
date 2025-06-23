'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';

const libraries: Libraries = ['places'];

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  required?: boolean;
  error?: string;
  label?: string;
  id?: string;
  name?: string;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = 'Enter an address',
  className = '',
  value = '',
  required = false,
  error,
  label,
  id = 'google-places-autocomplete',
  name = 'address'
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !autocompleteRef.current) return;

    // Initialize Google Places Autocomplete
    autocompleteInstanceRef.current = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
      componentRestrictions: { country: 'us' }, // Restrict to US only
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      types: ['address']
    });

    // Add listener for place selection
    const listener = autocompleteInstanceRef.current.addListener('place_changed', () => {
      if (!autocompleteInstanceRef.current) return;
      
      const place = autocompleteInstanceRef.current.getPlace();
      if (place && place.address_components) {
        onPlaceSelect(place);
        // Update input value with formatted address
        if (place.formatted_address) {
          setInputValue(place.formatted_address);
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      if (window.google && window.google.maps && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [isLoaded, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={autocompleteRef}
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        disabled={!isLoaded}
        required={required}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!isLoaded && <p className="mt-1 text-xs text-gray-500">Loading Google Places...</p>}
    </div>
  );
};

export default GooglePlacesAutocomplete;
