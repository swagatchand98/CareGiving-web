'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../common/Button';
import { useAuth } from '@/contexts/AuthContext';

interface AuthenticatedHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const AuthenticatedHeader: React.FC<AuthenticatedHeaderProps> = ({ user }) => {
  const { logout, user: authUser } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Determine dashboard URL based on user role
  const dashboardUrl = authUser?.role === 'provider' ? '/dashboard/provider' : '/dashboard';

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={dashboardUrl} className="text-2xl font-bold text-black">
          Caregiving
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/services/browse" className="text-gray-600 hover:text-black">
            Services
          </Link>
          <Link href="/bookings" className="text-gray-600 hover:text-black">
            My Bookings
          </Link>
          <Link href="/messages" className="text-gray-600 hover:text-black">
            Messages
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
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
    </header>
  );
};

export default AuthenticatedHeader;
