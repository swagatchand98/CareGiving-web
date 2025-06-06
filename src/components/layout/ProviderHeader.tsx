'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserData } from '@/services/authService';
import NotificationBell from '../common/NotificationBell';
import useChat from '@/hooks/useChat';

interface ProviderHeaderProps {
  user: UserData | null;
}

const ProviderHeader: React.FC<ProviderHeaderProps> = ({ user }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const { fetchProviderChats } = useChat();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Fetch unread chats count
  useEffect(() => {
    if (user) {
      const fetchUnreadChatsCount = async () => {
        try {
          const chats = await fetchProviderChats();
          
          // Count unread messages where the sender is not the provider
          let unreadCount = 0;
          chats.forEach((chat: any) => {
            chat.messages.forEach((message: any) => {
              if (message.sender === 'user' && !message.read) {
                unreadCount++;
              }
            });
          });
          
          setUnreadChats(unreadCount);
        } catch (error) {
          console.error('Error fetching unread chats count:', error);
        }
      };
      
      fetchUnreadChatsCount();
      
      // Set up polling for unread chats
      const intervalId = setInterval(fetchUnreadChatsCount, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [user, fetchProviderChats]);

  // If user is null, show a simplified header
  if (!user) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard/provider" className="text-2xl font-bold text-black">
              Caregiving Provider
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
          <Link href="/dashboard/provider" className="text-2xl font-bold text-black">
            Caregiving Provider
          </Link>
          
          {/* Provider navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard/provider" className="text-gray-600 hover:text-black">
              Dashboard
            </Link>
            <Link href="/dashboard/provider/services" className="text-gray-600 hover:text-black">
              My Services
            </Link>
            <Link href="/dashboard/provider/bookings" className="text-gray-600 hover:text-black">
              Bookings
            </Link>
            <Link href="/dashboard/provider/earnings" className="text-gray-600 hover:text-black">
              Earnings
            </Link>
            <Link href="/dashboard/provider/schedule" className="text-gray-600 hover:text-black">
              Schedule
            </Link>
          </nav>
          
          {/* User profile and actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />
            
            {/* Chat icon with unread count */}
            <Link href="/chats" className="text-gray-600 hover:text-black relative" title="My Chats">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              {unreadChats > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadChats > 9 ? '9+' : unreadChats}
                </span>
              )}
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
                      alt={user.name || 'Provider'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {user.firstName ? user.firstName.charAt(0) : 'P'}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline-block font-medium">
                  {user.firstName || user.name || 'Provider'}
                </span>
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
                    href="/dashboard/provider/services" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Services
                  </Link>
                  <Link 
                    href="/dashboard/provider/schedule" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Availability
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
        
        {/* Mobile navigation - only visible on small screens */}
        <nav className="md:hidden mt-4 flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/dashboard/provider" className="text-gray-900 font-medium hover:text-black whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="/dashboard/provider/services" className="text-gray-600 hover:text-black whitespace-nowrap">
            Services
          </Link>
          <Link href="/dashboard/provider/bookings" className="text-gray-600 hover:text-black whitespace-nowrap">
            Bookings
          </Link>
          <Link href="/dashboard/provider/earnings" className="text-gray-600 hover:text-black whitespace-nowrap">
            Earnings
          </Link>
          <Link href="/dashboard/provider/schedule" className="text-gray-600 hover:text-black whitespace-nowrap">
            Schedule
          </Link>
          <Link href="/chats" className="text-gray-600 hover:text-black whitespace-nowrap">
            Chats
            {unreadChats > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 inline-flex items-center justify-center">
                {unreadChats > 9 ? '9+' : unreadChats}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default ProviderHeader;
