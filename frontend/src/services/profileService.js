const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const profileService = {
  // Get user profile by username
  getUserProfile: async (username) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${username}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    const data = await response.json();
    // Normaliza la respuesta: combina user y stats en un solo objeto plano
    if (data.user) {
      return {
        ...data.user,
        ...data.stats,
      };
    }
    return data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    const data = await response.json();
    return data.user || data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    const data = await response.json();
    return data.user || data;
  },

  // Update avatar
  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update avatar');
    }
    
    const data = await response.json();
    return data.user || data;
  },

  // Follow/unfollow user
  followUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to follow/unfollow user');
    }
    return response.json();
  },

  // Get user posts
  getUserPosts: async (username, page = 1, limit = 12) => {
    const response = await fetch(`${API_BASE_URL}/users/${username}/posts?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to get user posts');
    }
    return response.json();
  },

  // Get users by array of IDs
  getUsersByIds: async (ids) => {
    const response = await fetch(`${API_BASE_URL}/users/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error('Failed to get users by IDs');
    }
    const data = await response.json();
    return data.users || [];
  },

  // Change email
  changeEmail: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users/change-email`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change email');
    }
    const data = await response.json();
    return data.user || data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
    return response.json();
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await fetch(`${API_BASE_URL}/users/account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete account');
    }
    return response.json();
  },
};
