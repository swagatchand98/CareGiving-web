'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { UserData } from '@/services/authService';
import AddressSelector from '../address/AddressSelector';
import NotificationBell from '../common/NotificationBell';

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
              <div className="flex items-center justify-center">                
                <div className="flex items-center border rounded-xl overflow-hidden ml-1 relative">
                  {/* Address selector*/}
                  <div className="absolute left-0 top-0 h-full flex items-center">
                   <AddressSelector className="px-3 py-2" />
                  </div>
                  {/* Search input */}
                  <input
                    type="text"
                    placeholder="Search for services..."
                    className="flex-1 pl-40 px-4 py-2 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  />
                  
                  {/* Search button */}
                  <button 
                    type="submit" 
                    className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors overflow-hidden"
                  >
                    <svg className="w-5 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>
                </div>
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
            
            <Link href="/chats" className="text-gray-600 hover:text-black relative" title="My Chats">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </Link>
            
            <div className='mt-1'>
              <NotificationBell />
            </div>
            
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
                    href="/dashboard/user/bookings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Bookings
                  </Link>
                  <Link 
                    href="/dashboard/user/payment-history" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Payment History
                  </Link>
                  <Link 
                    href="/dashboard/user/settings" 
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
      
      {/* Mobile address selector and search bar - only visible on small screens */}
      <div className="md:hidden px-4 pb-4">
        {/* Address selector for mobile - outside the form */}
        <div className="mb-4">
          <div className="flex justify-center">
            <AddressSelector />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Click on "Add address" to add a new delivery address
          </div>
        </div>
        
        {/* Search form */}
        <form onSubmit={handleSearch}>
          <div className="flex items-center border rounded-lg overflow-hidden">
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
              <svg className="w-5 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default EnhancedHeader;
