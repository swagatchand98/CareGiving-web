'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import useChat from '@/hooks/useChat';
import { Chat } from '@/services/chatService';
import { formatDistanceToNow } from 'date-fns';
import Button from '@/components/common/Button';

const ChatsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams?.get('bookingId');
  const { 
    isLoading, 
    error, 
    chats, 
    fetchUserChats, 
    getUnreadMessageCount 
  } = useChat();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'>('all');
  
  // Fetch chats when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserChats();
    }
  }, [isAuthenticated, fetchUserChats]);
  
  // If bookingId is provided in URL, filter to show only that chat
  useEffect(() => {
    if (bookingIdParam && chats.length > 0) {
      const specificChat = chats.find(chat => {
        if (typeof chat.bookingId === 'string') {
          return chat.bookingId === bookingIdParam;
        } else if (chat.bookingId && typeof chat.bookingId === 'object' && '_id' in chat.bookingId) {
          return chat.bookingId._id === bookingIdParam;
        }
        return false;
      });
      
      if (specificChat) {
        setSelectedFilter('all'); // Reset filter to show the chat
        
        // Scroll to the specific chat
        setTimeout(() => {
          const chatElement = document.getElementById(`chat-${specificChat._id}`);
          if (chatElement) {
            chatElement.scrollIntoView({ behavior: 'smooth' });
            chatElement.classList.add('bg-blue-50');
            setTimeout(() => {
              chatElement.classList.remove('bg-blue-50');
              chatElement.classList.add('bg-white');
            }, 2000);
          }
        }, 500);
      }
    }
  }, [bookingIdParam, chats]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/auth/login?redirect=/chats');
    }
  }, [isAuthenticated, router]);
  
  // Filter chats based on booking status
  const filteredChats = chats.filter(chat => {
    if (selectedFilter === 'all') return true;
    
    // Check if the booking property exists and has a status
    if (chat.bookingId && typeof chat.bookingId === 'object' && 'status' in chat.bookingId) {
      return chat.bookingId.status === selectedFilter;
    }
    
    return true;
  });
  
  // Format timestamp
  const formatTimestamp = (timestamp: Date | string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Get the last message from a chat
  const getLastMessage = (chat: Chat) => {
    if (chat.messages && chat.messages.length > 0) {
      return chat.messages[chat.messages.length - 1];
    }
    return null;
  };
  
  // Get the other user's name (not the current user)
  const getOtherUserName = (chat: Chat) => {
    if (!user) return '';
    
    // Check if the current user is the user or provider
    const isCurrentUserTheClient = user.role !== 'provider';
    
    // Return the name of the other user
    if (isCurrentUserTheClient) {
      // Current user is the client, return provider name
      if (chat.providerId && typeof chat.providerId === 'object') {
        return `${chat.providerId.firstName || ''} ${chat.providerId.lastName || ''}`;
      }
    } else {
      // Current user is the provider, return client name
      if (chat.userId && typeof chat.userId === 'object') {
        return `${chat.userId.firstName || ''} ${chat.userId.lastName || ''}`;
      }
    }
    
    return 'Unknown User';
  };
  
  // Get the service name
  const getServiceName = (chat: Chat) => {
    if (chat.bookingId && typeof chat.bookingId === 'object' && 
        chat.bookingId.serviceId && typeof chat.bookingId.serviceId === 'object') {
      return chat.bookingId.serviceId.title || 'Unknown Service';
    }
    return 'Unknown Service';
  };
  
  // Get the booking status
  const getBookingStatus = (chat: Chat) => {
    if (chat.bookingId && typeof chat.bookingId === 'object' && 'status' in chat.bookingId) {
      return chat.bookingId.status;
    }
    return 'unknown';
  };
  
  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Chats</h1>
          {bookingIdParam && (
            <Button
              onClick={() => router.push('/chats')}
              variant="outline"
              className="text-sm"
            >
              Show All Chats
            </Button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex mb-6 border-b">
          <button 
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 font-medium ${
              selectedFilter === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setSelectedFilter('confirmed')}
            className={`px-4 py-2 font-medium ${
              selectedFilter === 'confirmed' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Confirmed
          </button>
          <button 
            onClick={() => setSelectedFilter('completed')}
            className={`px-4 py-2 font-medium ${
              selectedFilter === 'completed' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
          <button 
            onClick={() => setSelectedFilter('cancelled')}
            className={`px-4 py-2 font-medium ${
              selectedFilter === 'cancelled' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancelled
          </button>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchUserChats()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && filteredChats.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No chats found</h2>
            <p className="text-gray-500">
              {selectedFilter === 'all' 
                ? "You don't have any chats yet." 
                : `You don't have any ${selectedFilter} chats.`}
            </p>
          </div>
        )}
        
        {/* Chat List */}
        {!isLoading && !error && filteredChats.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm divide-y">
            {filteredChats.map(chat => {
              const lastMessage = getLastMessage(chat);
              const unreadCount = getUnreadMessageCount(chat);
              const otherUserName = getOtherUserName(chat);
              const serviceName = getServiceName(chat);
              const bookingStatus = getBookingStatus(chat);
              
              return (
                <Link 
                  key={chat._id}
                  id={`chat-${chat._id}`}
                  href={`/booking/${chat.bookingId && typeof chat.bookingId === 'object' ? chat.bookingId._id : chat.bookingId}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="p-4 flex items-start">
                    {/* User Avatar */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {/* If we have a profile picture, show it */}
                        {(user?.role !== 'provider' && 
                          chat.providerId && 
                          typeof chat.providerId === 'object' && 
                          chat.providerId.profilePicture) ? (
                          <img 
                            src={chat.providerId.profilePicture} 
                            alt={otherUserName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (user?.role === 'provider' && 
                          chat.userId && 
                          typeof chat.userId === 'object' && 
                          chat.userId.profilePicture) ? (
                          <img 
                            src={chat.userId.profilePicture} 
                            alt={otherUserName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {otherUserName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Chat Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {otherUserName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {lastMessage ? formatTimestamp(lastMessage.timestamp) : ''}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {lastMessage ? lastMessage.content : 'No messages yet'}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {serviceName}
                        </span>
                        
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            bookingStatus === 'confirmed' || bookingStatus === 'in-progress' ? 'bg-green-100 text-green-800' :
                            bookingStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                            bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {bookingStatus === 'confirmed' ? 'Confirmed' :
                             bookingStatus === 'in-progress' ? 'In Progress' :
                             bookingStatus === 'completed' ? 'Completed' :
                             bookingStatus === 'cancelled' ? 'Cancelled' :
                             'Pending'}
                          </span>
                          
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
