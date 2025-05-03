'use client';

import React, { useState } from 'react';
import Button from '../common/Button';

interface ServiceFiltersProps {
  onApplyFilters: (filters: {
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
  }) => void;
  initialFilters?: {
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
  };
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  onApplyFilters,
  initialFilters = {}
}) => {
  const [minPrice, setMinPrice] = useState<string>(
    initialFilters.minPrice ? initialFilters.minPrice.toString() : ''
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialFilters.maxPrice ? initialFilters.maxPrice.toString() : ''
  );
  const [priceType, setPriceType] = useState<string>(
    initialFilters.priceType || ''
  );
  
  const handleApplyFilters = () => {
    const filters: {
      minPrice?: number;
      maxPrice?: number;
      priceType?: string;
    } = {};
    
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (priceType) filters.priceType = priceType;
    
    onApplyFilters(filters);
  };
  
  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setPriceType('');
    onApplyFilters({});
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="space-y-4">
        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-2">Price Range</h4>
          <div className="flex items-center space-x-2">
            <div className="w-1/2">
              <label htmlFor="minPrice" className="block text-sm text-gray-600 mb-1">
                Min Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="minPrice"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="maxPrice" className="block text-sm text-gray-600 mb-1">
                Max Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="maxPrice"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Any"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Price Type */}
        <div>
          <h4 className="font-medium mb-2">Price Type</h4>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="priceType"
                value=""
                checked={priceType === ''}
                onChange={() => setPriceType('')}
                className="mr-2"
              />
              <span>All</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priceType"
                value="fixed"
                checked={priceType === 'fixed'}
                onChange={() => setPriceType('fixed')}
                className="mr-2"
              />
              <span>Fixed</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priceType"
                value="hourly"
                checked={priceType === 'hourly'}
                onChange={() => setPriceType('hourly')}
                className="mr-2"
              />
              <span>Hourly</span>
            </label>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleApplyFilters}
            className="flex-1"
          >
            Apply Filters
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;
