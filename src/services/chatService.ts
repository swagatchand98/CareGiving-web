// services/chatService.ts
import api from '@/lib/axios';

// Types
export interface Message {
  _id?: string;
  sender: 'user' | 'provider';
  content: string;
  timestamp: Date | string;
  read: boolean;
}

export interface UserInfo {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  role?: string;
}

export interface ServiceInfo {
  _id: string;
  title: string;
  description?: string;
  price?: {
    amount: number;
    type: string;
  };
  images?: string[];
}

export interface BookingInfo {
  _id: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  dateTime: string;
  serviceId: ServiceInfo;
}

export interface Chat {
  _id: string;
  bookingId: string | BookingInfo;
  userId: string | UserInfo;
  providerId: string | UserInfo;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  chat: Chat;
}

export interface ChatsResponse {
  chats: Chat[];
  results: number;
}

// Get all chats for the current user
export const getUserChats = async (): Promise<ChatsResponse> => {
  try {
    const response = await api.get('/chats');
    return (response.data as any).data as ChatsResponse;
  } catch (error: any) {
    console.error('Get user chats error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get user chats';
  }
};

// This function was removed as it's not needed - getUserChats works for both users and providers

// Get chat by booking ID
export const getChatByBookingId = async (bookingId: string): Promise<ChatResponse> => {
  try {
    const response = await api.get(`/chats/booking/${bookingId}`);
    return (response.data as any).data as ChatResponse;
  } catch (error: any) {
    console.error('Get chat by booking ID error:', error);
    throw error.response?.data?.message || error.message || 'Failed to get chat';
  }
};

// Send a message in a chat
export const sendMessage = async (
  chatId: string,
  content: string,
  sender: 'user' | 'provider'
): Promise<{ message: Message }> => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, {
      content,
      sender
    });
    return (response.data as any).data as { message: Message };
  } catch (error: any) {
    console.error('Send message error:', error);
    throw error.response?.data?.message || error.message || 'Failed to send message';
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  chatId: string,
  messageIds: string[]
): Promise<{ updatedCount: number }> => {
  try {
    const response = await api.patch(`/chats/${chatId}/messages/read`, {
      messageIds
    });
    return (response.data as any).data as { updatedCount: number };
  } catch (error: any) {
    console.error('Mark messages as read error:', error);
    throw error.response?.data?.message || error.message || 'Failed to mark messages as read';
  }
};
