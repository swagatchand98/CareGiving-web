'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import CategoryList from '@/components/services/CategoryList';
import ServiceList from '@/components/services/ServiceList';
import ServiceFilters from '@/components/services/ServiceFilters';
import ServiceSearch from '@/components/services/ServiceSearch';
import { useAuth } from '@/contexts/AuthContext';
import useServices from '@/hooks/useServices';

export default function BrowseServicesPage() {
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: servicesLoading, error: servicesError } = useServices();
  
  // Get initial values from URL parameters
  const initialCategoryId = searchParams.get('category') || undefined;
  const initialQuery = searchParams.get('query') || undefined;
  const initialMinPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const initialMaxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const initialPriceType = searchParams.get('priceType') || undefined;
  
  // State for filters
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(initialQuery);
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
  }>({
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    priceType: initialPriceType
  });
  
  // Loading state
  const isLoading = authLoading || servicesLoading;
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (categoryId) params.set('category', categoryId);
    if (searchQuery) params.set('query', searchQuery);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.priceType) params.set('priceType', filters.priceType);
    
    const url = `/services/browse${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', url);
  }, [categoryId, searchQuery, filters]);
  
  // Handle category selection
  const handleCategorySelect = (id: string) => {
    setCategoryId(id === categoryId ? undefined : id);
    setSearchQuery(undefined);
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query || undefined);
  };
  
  // Handle filter application
  const handleApplyFilters = (newFilters: {
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
  }) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Services</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : servicesError ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md mb-6">
            <h3 className="font-semibold mb-1">Error loading services</h3>
            <p>{servicesError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Categories */}
            <CategoryList 
              onCategorySelect={handleCategorySelect}
              selectedCategoryId={categoryId}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar with Search and Filters */}
              <div className="md:col-span-1">
                <ServiceSearch 
                  onSearch={handleSearch}
                  initialQuery={searchQuery}
                />
                
                <ServiceFilters 
                  onApplyFilters={handleApplyFilters}
                  initialFilters={filters}
                />
              </div>
              
              {/* Service List */}
              <div className="md:col-span-3">
                <ServiceList 
                  categoryId={categoryId}
                  searchQuery={searchQuery}
                  filters={filters}
                  showPagination={true}
                />
              </div>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
