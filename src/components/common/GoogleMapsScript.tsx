'use client';

import React from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';

// Define libraries to load
const libraries: Libraries = ['places'];

// Add global type for window.google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapsScriptProps {
  children: React.ReactNode;
}

/**
 * Component to load Google Maps API script globally
 */
const GoogleMapsScript: React.FC<GoogleMapsScriptProps> = ({ children }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (loadError) {
    console.error('Error loading Google Maps API:', loadError);
  }

  return <>{children}</>;
};

export default GoogleMapsScript;
