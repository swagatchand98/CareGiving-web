'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import useChat from '@/hooks/useChat';
import { Chat, Message } from '@/services/chatService';
import Button from '../common/Button';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatInterfaceProps {
  bookingId: string;
  isActive?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ bookingId, isActive = true }) => {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    currentChat, 
    fetchChatByBookingId, 
    sendMessage, 
    markMessagesAsRead 
  } = useChat();
  
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChatDisabled, setIsChatDisabled] = useState(!isActive);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track last message timestamp to avoid unnecessary polling
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  
  // Fetch chat data initially and then poll for updates with optimizations
  useEffect(() => {
    if (!isActive || !bookingId) return;
    
    // Fetch initial chat data
    fetchChatByBookingId(bookingId);
    
    // Set up polling for new messages with a longer interval
    const intervalId = setInterval(() => {
      if (isActive && bookingId && document.visibilityState === 'visible') {
        // Only fetch if the tab is visible to the user
        fetchChatByBookingId(bookingId);
      }
    }, 15000); // Poll every 15 seconds instead of 5
    
    // Add visibility change listener to pause polling when tab is not visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Fetch immediately when tab becomes visible again
        fetchChatByBookingId(bookingId);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [bookingId, isActive, fetchChatByBookingId]);
  
  // Update last message timestamp when chat data changes
  useEffect(() => {
    if (currentChat && currentChat.messages && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      if (lastMessage && lastMessage.timestamp) {
        setLastMessageTimestamp(lastMessage.timestamp.toString());
      }
    }
  }, [currentChat]);
  
  // Track message count to determine when to scroll
  const [messageCount, setMessageCount] = useState<number>(0);
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  
  // Update message count when chat data changes
  useEffect(() => {
    if (currentChat && currentChat.messages) {
      const newCount = currentChat.messages.length;
      // Only set shouldScroll if the message count has increased
      if (newCount > messageCount) {
        setShouldScroll(true);
      }
      setMessageCount(newCount);
    }
  }, [currentChat, messageCount]);
  
  // Handle scrolling and marking messages as read
  useEffect(() => {
    // Only scroll if we have new messages or explicitly set shouldScroll
    if (shouldScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScroll(false);
    }
    
    // Mark unread messages as read
    if (currentChat && user) {
      const currentUserRole = user.role === 'provider' ? 'provider' : 'user';
      const unreadMessageIds = currentChat.messages
        .filter(message => message.sender !== currentUserRole && !message.read)
        .map(message => message._id)
        .filter(Boolean) as string[];
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(currentChat._id, unreadMessageIds);
      }
    }
  }, [currentChat, user, markMessagesAsRead, shouldScroll]);
  
  // Handle sending a message with optimized updates
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !currentChat || isSending || isChatDisabled) return;
    
    setIsSending(true);
    const messageContent = messageInput.trim();
    
    try {
      // Clear input immediately for better UX
      setMessageInput('');
      
      // Optimistically update UI with the new message
      const optimisticMessage: Message = {
        sender: user?.role === 'provider' ? 'provider' : 'user',
        content: messageContent,
        timestamp: new Date(),
        read: false,
        _id: `temp-${Date.now()}`
      };
      
      // Add message to UI immediately without waiting for API
      if (currentChat && currentChat.messages) {
        // Create a new messages array with the optimistic message
        const updatedMessages = [...currentChat.messages, optimisticMessage];
        
        // Update the local state to show the message immediately
        // We're using a hack here since we can't directly modify the currentChat from useChat hook
        const chatDiv = document.querySelector('.chat-messages');
        if (chatDiv) {
          const messageDiv = document.createElement('div');
          messageDiv.className = `mb-4 flex justify-end`;
          messageDiv.innerHTML = `
            <div class="max-w-[75%] rounded-lg px-4 py-2 bg-blue-500 text-white">
              <div class="text-xs mb-1 font-medium">
                ${user?.role === 'provider' ? 'Provider' : 'You'}
              </div>
              <p>${messageContent}</p>
              <div class="text-xs mt-1 text-right opacity-75">
                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          `;
          chatDiv.appendChild(messageDiv);
          
          // Scroll to bottom immediately
          setShouldScroll(true);
        }
      }
      
      // Use REST API to send message
      await sendMessage(currentChat._id, messageContent);
      
      // Fetch updated chat after a short delay to avoid race conditions
      setTimeout(() => fetchChatByBookingId(bookingId), 500);
    } catch (err) {
      console.error('Error sending message:', err);
      // Show error and restore message input if sending fails
      setMessageInput(messageContent);
    } finally {
      setIsSending(false);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Determine if the message is from the current user
  const isCurrentUserMessage = (message: Message) => {
    if (!user) return false;
    
    const currentUserRole = user.role === 'provider' ? 'provider' : 'user';
    return message.sender === currentUserRole;
  };
  
  // Get user name based on role
  const getUserName = (role: 'user' | 'provider') => {
    if (!user) return role === 'user' ? 'Client' : 'Service Provider';
    
    const isCurrentUser = (user.role === 'provider' && role === 'provider') || 
                         (user.role !== 'provider' && role === 'user');
    
    if (isCurrentUser) {
      return 'You';
    } else if (role === 'provider') {
      return 'Service Provider';
    } else {
      return 'Client';
    }
  };
  
  if (isLoading && !currentChat) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }
  
  if (isChatDisabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p>Chat is only available when the booking is active.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-100 px-4 py-3 border-b">
        <h3 className="font-semibold">
          {user?.role === 'provider' ? 'Chat with Client' : 'Chat with Service Provider'}
        </h3>
      </div>
      
      {/* Messages */}
      <div className="p-4 h-96 overflow-y-auto chat-messages">
        {currentChat && currentChat.messages.length > 0 ? (
          currentChat.messages.map((message, index) => (
            <div 
              key={message._id || index}
              className={`mb-4 flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  isCurrentUserMessage(message) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-xs mb-1 font-medium">
                  {getUserName(message.sender)}
                </div>
                <p>{message.content}</p>
                <div className="text-xs mt-1 text-right opacity-75">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <Button
            type="submit"
            variant="primary"
            className="rounded-l-none"
            disabled={!messageInput.trim() || isSending}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
