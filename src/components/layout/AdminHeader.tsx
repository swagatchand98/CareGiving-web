'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserData } from '@/services/authService';

interface AdminHeaderProps {
  user: UserData | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // If user is null, show a simplified header
  if (!user) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-black">
              Caregiving Admin
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-black">
            Caregiving Admin
          </Link>
          
          {/* Admin navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-black">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-gray-600 hover:text-black">
              Users
            </Link>
            <Link href="/admin/services" className="text-gray-600 hover:text-black">
              Services
            </Link>
            <Link href="/admin/bookings" className="text-gray-600 hover:text-black">
              Bookings
            </Link>
            <Link href="/admin/reports" className="text-gray-600 hover:text-black">
              Reports
            </Link>
          </nav>
          
          {/* User profile */}
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
        
        {/* Mobile navigation - only visible on small screens */}
        <nav className="md:hidden mt-4 flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/admin/dashboard" className="text-gray-900 font-medium hover:text-black whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="/admin/users" className="text-gray-600 hover:text-black whitespace-nowrap">
            Users
          </Link>
          <Link href="/admin/services" className="text-gray-600 hover:text-black whitespace-nowrap">
            Services
          </Link>
          <Link href="/admin/bookings" className="text-gray-600 hover:text-black whitespace-nowrap">
            Bookings
          </Link>
          <Link href="/admin/reports" className="text-gray-600 hover:text-black whitespace-nowrap">
            Reports
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
