/**
 * Utility functions for handling address data from Google Places API
 */

import { CreateAddressData } from '@/services/addressService';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Parse Google Places API result into our address format
 */
export const parseGooglePlaceToAddress = (
  place: google.maps.places.PlaceResult,
  currentAddress: Partial<CreateAddressData> = {}
): Partial<CreateAddressData> => {
  if (!place.address_components) {
    return currentAddress;
  }

  const addressComponents = place.address_components;
  const result: Partial<CreateAddressData> = { ...currentAddress };

  // Extract street number and route (street name)
  const streetNumber = findAddressComponent(addressComponents, 'street_number')?.long_name || '';
  const route = findAddressComponent(addressComponents, 'route')?.long_name || '';
  result.street = streetNumber ? `${streetNumber} ${route}`.trim() : route;

  // Extract city (locality or sublocality)
  result.city = 
    findAddressComponent(addressComponents, 'locality')?.long_name || 
    findAddressComponent(addressComponents, 'sublocality')?.long_name || 
    findAddressComponent(addressComponents, 'sublocality_level_1')?.long_name || 
    result.city || '';

  // Extract state (administrative_area_level_1)
  const stateComponent = findAddressComponent(addressComponents, 'administrative_area_level_1');
  result.state = stateComponent?.short_name || stateComponent?.long_name || result.state || '';

  // Extract ZIP code (postal_code)
  result.zipCode = findAddressComponent(addressComponents, 'postal_code')?.long_name || result.zipCode || '';

  // Extract country
  result.country = findAddressComponent(addressComponents, 'country')?.long_name || result.country || 'United States';

  return result;
};

/**
 * Find a specific address component by type
 */
const findAddressComponent = (
  components: AddressComponent[],
  type: string
): AddressComponent | undefined => {
  return components.find(component => component.types.includes(type));
};
