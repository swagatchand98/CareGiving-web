import api from '@/lib/axios';

export interface Notification {
  _id: string;
  type: 'booking' | 'message' | 'review' | 'system';
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  relatedEntityId?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

// Define API response interfaces
interface ApiResponse<T> {
  status: string;
  data: T;
}

/**
 * Get user notifications with pagination
 * @param page - Page number
 * @param limit - Number of notifications per page
 * @param unreadOnly - Whether to get only unread notifications
 * @returns Notifications and pagination info
 */

export const getUserNotifications = async (
  page: number = 1,
  limit: number = 10,
  unreadOnly: boolean = false
): Promise<NotificationResponse> => {
  try {
    console.log('Fetching notifications with params:', { page, limit, unreadOnly });
    const response = await api.get('/notifications', {
      params: { page, limit, unreadOnly }
    });
    // Handle the response safely
    if (response && response.data && typeof response.data === 'object') {
      // Check if the response has notifications and pagination directly
      if ('notifications' in response.data && 'pagination' in response.data) {
        return response.data as NotificationResponse;
      }
      // Check if the response has a data property that contains notifications
      else if ('data' in response.data && 
               response.data.data && 
               typeof response.data.data === 'object' && 
               'notifications' in response.data.data) {
        return response.data.data as NotificationResponse;
      }
    }
    console.log('Invalid response format:', response.data);
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @returns Unread notification count
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await api.get('/notifications/unread-count');
    // Handle the response safely
    if (response && response.data && typeof response.data === 'object') {
      // Direct count property
      if ('count' in response.data) {
        return response.data.count as number;
      }
      // Count in data property
      else if ('data' in response.data && 
               response.data.data &&
               typeof response.data.data === 'object' && 
               'count' in response.data.data) {
        return response.data.data.count as number;
      }
    }
    console.log('Invalid response format for unread count:', response.data);
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param notificationId - Notification ID
 * @returns Updated notification
 */
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    // Handle the response safely
    if (response && response.data) {
      // Direct notification object
      if (typeof response.data === 'object' && '_id' in response.data) {
        return response.data as Notification;
      }
      // Notification in data property
      else if (typeof response.data === 'object' && 
               'data' in response.data && 
               response.data.data &&
               typeof response.data.data === 'object' && 
               '_id' in response.data.data) {
        return response.data.data as Notification;
      }
    }
    console.log('Invalid response format for mark as read:', response.data);
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns Success message
 */
export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.patch('/notifications/read-all');
    // Handle the response safely
    if (response && response.data && typeof response.data === 'object') {
      // Direct success/message properties
      if ('success' in response.data && 'message' in response.data) {
        return {
          success: Boolean(response.data.success),
          message: String(response.data.message)
        };
      }
      // Success/message in data property
      else if ('data' in response.data && 
               response.data.data &&
               typeof response.data.data === 'object' && 
               'success' in response.data.data && 
               'message' in response.data.data) {
        return {
          success: Boolean(response.data.data.success),
          message: String(response.data.data.message)
        };
      }
    }
    console.log('Invalid response format for mark all as read:', response.data);
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param notificationId - Notification ID
 * @returns Success message
 */
export const deleteNotification = async (notificationId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    // Handle the response safely
    if (response && response.data && typeof response.data === 'object') {
      // Direct success/message properties
      if ('success' in response.data && 'message' in response.data) {
        return {
          success: Boolean(response.data.success),
          message: String(response.data.message)
        };
      }
      // Success/message in data property
      else if ('data' in response.data && 
               response.data.data &&
               typeof response.data.data === 'object' && 
               'success' in response.data.data && 
               'message' in response.data.data) {
        return {
          success: Boolean(response.data.data.success),
          message: String(response.data.data.message)
        };
      }
    }
    console.log('Invalid response format for delete notification:', response.data);
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
