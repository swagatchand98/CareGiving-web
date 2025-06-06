'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Chat,
  Message,
  ChatResponse,
  ChatsResponse,
  getUserChats,
  getChatByBookingId,
  sendMessage as sendMessageApi,
  markMessagesAsRead as markMessagesAsReadApi
} from '@/services/chatService';

export const useChat = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  // Get all chats for the current user
  const fetchUserChats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getUserChats();
      setChats(response.chats);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user chats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get chat by booking ID
  const fetchChatByBookingId = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getChatByBookingId(bookingId);
      setCurrentChat(response.chat);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chat');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message in a chat
  const sendMessage = useCallback(async (chatId: string, content: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine if the current user is the user or provider
      const sender = user?.role === 'provider' ? 'provider' : 'user';
      
      const response = await sendMessageApi(chatId, content, sender);
      
      // Update the current chat with the new message
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(prevChat => {
          if (!prevChat) return null;
          
          return {
            ...prevChat,
            messages: [...prevChat.messages, response.message]
          };
        });
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentChat]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (chatId: string, messageIds: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await markMessagesAsReadApi(chatId, messageIds);
      
      // Update the current chat with the read messages
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(prevChat => {
          if (!prevChat) return null;
          
          return {
            ...prevChat,
            messages: prevChat.messages.map(message => {
              if (message._id && messageIds.includes(message._id)) {
                return { ...message, read: true };
              }
              return message;
            })
          };
        });
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to mark messages as read');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentChat]);

  // Get unread message count for a chat
  const getUnreadMessageCount = useCallback((chat: Chat) => {
    if (!user) return 0;
    
    // Determine if the current user is the user or provider
    const currentUserRole = user.role === 'provider' ? 'provider' : 'user';
    
    // Count messages that are from the other user and are unread
    return chat.messages.filter(
      message => message.sender !== currentUserRole && !message.read
    ).length;
  }, [user]);

  // Get total unread message count across all chats
  const getTotalUnreadMessageCount = useCallback(() => {
    if (!user) return 0;
    
    return chats.reduce((total, chat) => total + getUnreadMessageCount(chat), 0);
  }, [user, chats, getUnreadMessageCount]);

  // Get all chats for the current provider (uses the same endpoint as user chats)
  const fetchProviderChats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getUserChats();
      setChats(response.chats);
      return response.chats;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch provider chats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    chats,
    currentChat,
    fetchUserChats,
    fetchProviderChats,
    fetchChatByBookingId,
    sendMessage,
    markMessagesAsRead,
    getUnreadMessageCount,
    getTotalUnreadMessageCount
  };
};

export default useChat;
