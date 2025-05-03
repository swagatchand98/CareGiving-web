'use client';

import React, { useState } from 'react';
import Button from '../common/Button';

interface ServiceSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({
  onSearch,
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Search Services</h3>
      
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          placeholder="Search for services..."
        />
        <Button type="submit">
          Search
        </Button>
      </form>
    </div>
  );
};

export default ServiceSearch;
