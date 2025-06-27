const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class MessageService {
  async getConversations(page = 1, limit = 20) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get conversations');
    }

    return response.json();
  }

  async getMessages(conversationId, page = 1, limit = 50) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/${conversationId}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get messages');
    }

    return response.json();
  }

  async sendMessage(recipientId, content, messageType = 'text', image = null) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipientId,
        content,
        messageType,
        image
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
  }

  async startConversation(username) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/conversation/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start conversation');
    }

    return response.json();
  }

  async deleteMessage(messageId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete message');
    }

    return response.json();
  }

  async getUnreadCount() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/unread/count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get unread count');
    }

    return response.json();
  }

  async markMessageAsRead(messageId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark message as read');
    }

    return response.json();
  }
}

export const messageService = new MessageService();
