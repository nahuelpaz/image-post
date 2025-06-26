const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const notificationService = {
  // Get notifications
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get notifications: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Network error in getNotifications:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: getAuthHeaders(),
      });
      
      if (response.status === 429) {
        throw new Error('Too many requests, please try again later.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get unread count: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (error.message.includes('429')) {
        // Silently fail on rate limit
        throw error;
      }
      console.error('Network error in getUnreadCount:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    return response.json();
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    return response.json();
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
    return response.json();
  }
};
