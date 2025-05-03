'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { UserData } from '@/services/authService';

interface EnhancedHeaderProps {
  user: UserData;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ user }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<string>('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Popular locations - in a real app, these would come from an API
  const popularLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
  ];

  // Get user's location on component mount
  useEffect(() => {
    // This would typically use the browser's geolocation API and then reverse geocode
    // For now, we'll just set a default location
    setLocation('New York, NY');
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services/browse?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setIsLocationDropdownOpen(false);
    // In a real app, you would store this in user preferences and/or local storage
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Top row with logo, search, and user profile */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            Caregiving
          </Link>
          
          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="flex items-center border rounded-lg overflow-hidden">
                {/* Location selector */}
                <div className="relative">
                  <button 
                    type="button"
                    onClick={toggleLocationDropdown}
                    className="flex items-center px-3 py-2 bg-gray-50 border-r hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="truncate max-w-[100px]">{location}</span>
                    <svg className={`w-4 h-4 ml-1 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  {isLocationDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-700">Popular locations</p>
                      </div>
                      {popularLocations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => selectLocation(loc)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {loc}
                        </button>
                      ))}
                      <div className="px-4 py-2 border-t">
                        <button 
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          onClick={() => {
                            // In a real app, this would open a modal to get the user's current location
                            selectLocation('Current Location');
                          }}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          Use my current location
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="flex-1 px-4 py-2 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                
                {/* Search button */}
                <button 
                  type="submit" 
                  className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
              
              {/* Search suggestions - would be populated from API in a real app */}
              {isSearchFocused && searchQuery && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-700">Popular searches</p>
                  </div>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Elder Care
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Child Care
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Special Needs Care
                  </button>
                </div>
              )}
            </form>
          </div>
          
          {/* User profile and actions */}
          <div className="flex items-center space-x-4">
            <Link href="/wishlist" className="text-gray-600 hover:text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </Link>
            
            <Link href="/notifications" className="text-gray-600 hover:text-black relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {user.name}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline-block font-medium">{user.name}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/bookings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Bookings
                  </Link>
                  <Link 
                    href="/payments" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Payment History
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom row with navigation tabs */}
        <nav className="mt-4 flex items-center space-x-8 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/dashboard" className="text-gray-900 font-medium hover:text-black whitespace-nowrap">
            Home
          </Link>
          <Link href="/services/browse" className="text-gray-600 hover:text-black whitespace-nowrap">
            All Services
          </Link>
          <Link href="/services/browse?category=elder-care" className="text-gray-600 hover:text-black whitespace-nowrap">
            Elder Care
          </Link>
          <Link href="/services/browse?category=child-care" className="text-gray-600 hover:text-black whitespace-nowrap">
            Child Care
          </Link>
          <Link href="/services/browse?category=special-needs" className="text-gray-600 hover:text-black whitespace-nowrap">
            Special Needs
          </Link>
          <Link href="/services/browse?category=home-healthcare" className="text-gray-600 hover:text-black whitespace-nowrap">
            Home Healthcare
          </Link>
          <Link href="/services/browse?category=respite-care" className="text-gray-600 hover:text-black whitespace-nowrap">
            Respite Care
          </Link>
          <Link href="/services/categories" className="text-gray-600 hover:text-black whitespace-nowrap">
            More Categories
          </Link>
        </nav>
      </div>
      
      {/* Mobile search bar - only visible on small screens */}
      <div className="md:hidden px-4 pb-4">
        <form onSubmit={handleSearch} className="flex items-center border rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Search for services..."
            className="flex-1 px-4 py-2 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
};

export default EnhancedHeader;
